package com.hqapps.entity;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.EntityNotFoundException;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.Query.Filter;
import com.google.appengine.api.datastore.Query.FilterPredicate;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Query.CompositeFilter;
import com.google.appengine.api.datastore.Query.CompositeFilterOperator;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query.SortDirection;
import com.hqapps.pres.ReqMsg;
import com.hqapps.pres.RespMsg;
import com.hqapps.pres.RespMsg.Error;
import com.hqapps.pres.RespMsg.Status;
import com.hqapps.pres.msg.*;
import com.hqapps.security.PassReset;
import com.hqapps.security.PasswordHandler;
import com.hqapps.util.AdminUtils;
import com.hqapps.util.StrUtils;
import com.google.appengine.api.datastore.Text;

public abstract class EntityManager 
{
	static class EntityManagerImpl extends EntityManager
	{}
	
	private static EntityManager instance = 
			new EntityManagerImpl();
	
	public static EntityManager getInstance()
	{
		return instance;
	}
	
	// indicator of NO_VALUE
	private static final String NO_VAL = "~nv";
	
	/**
	 * Store entity kind and return external id
	 */
	public Long storeNew ( String key, String kind, Map values )
	{
		Entity entity = null;
		if ( key != null ) {
			entity = new Entity(kind, key);
		}
		else {
			entity = new Entity(kind);
		}
		
		for (Iterator<Entry<String, Object>> it = values.entrySet().iterator(); it.hasNext(); ) {
			Entry<String, Object> entry = (Entry<String, Object>)it.next();
			if ( entry.getValue() != null ) {
				entity.setProperty(entry.getKey(), entry.getValue());
			}
		}
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		datastore.put(entity);
		return entity.getKey().getId();
	}
	
	/**
	 * Store Image
	 * @param key
	 * @param media
	 * @return
	 */
	public Key storeImage ( String key, Media media ) 
	{
		Entity entity = null;
		if ( key != null ) {
			entity = new Entity(media.getKind(), key);
		}
		else {
			entity = new Entity(media.getKind());
		}
		Map<String,Object> values = media.toDataMap();
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		for (Iterator<Entry<String, Object>> it = values.entrySet().iterator(); it.hasNext(); ) {
			Entry<String, Object> entry = (Entry<String, Object>)it.next();
			if ( entry.getValue() != null ) {
				entity.setProperty(entry.getKey(), entry.getValue());
			}
		}
		datastore.put(entity);
		return entity.getKey();
	}
	
	/**
	 * Loads a public user object
	 * @param email
	 * @return
	 * @throws Exception
	 */
	public User getUserPublicInfo ( String email ) throws Exception
	{
		if ( email != null ) {
			Entity ent = load (  email.toLowerCase(), User.KIND );
			if ( ent != null ) {
		 		User user = new User ();
		 		Map<String,Object> props = ent.getProperties();
				user.fromDataMap(props);
				user.setAuthToken((String)props.get("salt"));
				return user;
			}
		}
		return null;
	}
	
	/**
	 * Load an entity and return Map
	 */
	public Entity load ( String key, String kind ) throws Exception
	{
		Key entityKey = KeyFactory.createKey(kind, key);
		return load (entityKey );
	}
	 
	/**
	 * Load an entity and return Map
	 */
	public Entity load ( Long key, String kind ) throws Exception
	{
		Key entityKey = KeyFactory.createKey(kind, key);
		return load (entityKey );
	}

	/**
	 * Load an entity and return Map
	 */
	public Iterable<Entity> loadEntities (String kind, Filter filter, boolean sortDate) 
			throws Exception
	{
		Query q = new Query(kind);
		q.setFilter(filter);
		if ( sortDate ) {
			q.addSort("modified", SortDirection.DESCENDING);
		}
		// Use PreparedQuery interface to retrieve results
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();		
		PreparedQuery pq = datastore.prepare(q);
		return pq.asIterable();
	}

	/**
	 * Load an entity and return Map
	 */
	public Iterable<Entity> loadEntities (String kind, Filter filter) throws Exception
	{
		return loadEntities (kind, filter, false );
	}

	/**
	 * General load object of any type
	 * @param id
	 * @param objClass
	 * @return
	 * @throws Exception
	 */
	public ReqMsg loadObject ( Long id, Class objClass ) throws Exception
	{
		ReqMsg msg = (ReqMsg)objClass.newInstance();
		
		Entity entity = load ( id, msg.getKind() );
		if ( entity != null ) {
			Map<String,Object> props = entity.getProperties();
			msg.fromDataMap(props);
			// make sure to seto correct ID after load			
			msg.setId(entity.getKey().getId());
			return msg;
		}
		return null;
	}
	
	/**
	 * Load all comments for a list
	 */
	public List<ReqMsg> loadObjects ( Class objClass, int max, Filter filter ) throws Exception
	{
		ArrayList<ReqMsg> allResp = new ArrayList<ReqMsg>();
		ReqMsg msg = (ReqMsg)objClass.newInstance();
		Query q = new Query(msg.getKind());
		
		if ( max <= 1 ) max = 10;
		
		if ( filter != null ) {
			q.setFilter(filter);
		} 
		// Use PreparedQuery interface to retrieve results
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();		
		PreparedQuery pq = datastore.prepare(q);
		
		for (Entity result : pq.asIterable()) {
			Map<String,Object> props = result.getProperties();
			ReqMsg entity =  (ReqMsg)objClass.newInstance();
			entity.fromDataMap(props);
			// make sure to seto correct ID after load			
			entity.setId(result.getKey().getId());	
			allResp.add( entity );
			if ( allResp.size() >= max )
				break;
		}		
		return allResp;
	}
	
	/**
	 * Gets all deviceIds affected by the serviceId change (based on UserService table)
	 * @param serviceId
	 * @return
	 * @throws Exception
	 */
	public List<String> getAffectedDevicesfromServiceChange ( Long serviceId ) throws Exception
	{
		// Use PreparedQuery interface to retrieve results
		Query q = new Query( UserService.KIND );
		
		Filter filter = new FilterPredicate ("serviceId", FilterOperator.EQUAL, serviceId );
		q.setFilter(filter);
		
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();	
		PreparedQuery pq = datastore.prepare(q);
		
		ArrayList<String> devList = new ArrayList<String> (100);
		
		for (Entity result : pq.asIterable()) {
			Map<String,Object> props = result.getProperties();
			String userId = (String)props.get("userId");
			String devId = UserCache.getInst().getDeviceId(userId);
			if ( devId != null ) {
				devList.add( devId );
			}
		}
		return devList;
	}
	
	/**
	 * Load one object based on filter
	 */
	public ReqMsg loadObject ( Class objClass, Filter filter ) throws Exception
	{
		ReqMsg msg = (ReqMsg)objClass.newInstance();
		Query q = new Query(msg.getKind());		
		q.setFilter(filter);
		
		// Use PreparedQuery interface to retrieve results
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();		
		PreparedQuery pq = datastore.prepare(q);
		
		for (Entity result : pq.asIterable()) {
			Map<String,Object> props = result.getProperties();
			ReqMsg entity =  (ReqMsg)objClass.newInstance();
			entity.fromDataMap(props);
			// make sure to seto correct ID after load			
			entity.setId(result.getKey().getId());	
			return entity;
		}		
		return null;
	}
	
	/**
	 * Update user record
	 * @param userId
	 * @param newProps
	 */
	public ReqMsg updateUser ( String userId, Map<String,Object> newProps ) throws Exception
	{
		 Entity entity = load ( userId, User.KIND );
		 if ( entity != null ) {
			 return updateObject ( entity, newProps, new User(), null );
		 }
		 return null;
	}
	
	/**
	 * updateObject by looking entity by id, update with new data, and return an instance of objClass
	 * with results. 
	 * @param id
	 * @param newData
	 * @param objClass
	 * @return the updated object
	 * @throws Exception
	 */
	public ReqMsg updateObject ( Long id, ReqMsg newData, Class objClass, String authId ) throws Exception
	{
		ReqMsg msg = (ReqMsg)objClass.newInstance();
		Entity entity = load ( id, msg.getKind() );
		
		return updateObject (entity, newData.toDataMap(), msg, authId);
	}
	
	/**
	 * updateObject by looking entity by id, update with new data, and return an instance of objClass
	 * with results. 
	 * @param id
	 * @param newData
	 * @param objClass
	 * @return the updated object
	 * @throws Exception
	 */
	public ReqMsg updateObject ( String id, ReqMsg newData, Class objClass, String authId ) throws Exception
	{
		ReqMsg msg = (ReqMsg)objClass.newInstance();
		Entity entity = load ( id, msg.getKind() );
		
		return updateObject (entity, newData.toDataMap(), msg, authId);
	}
	
	/**
	 * Update object from existing pre-loaded Entity, new message data, return object concrete class
	 * @param entityExisting
	 * @param newData
	 * @param retData concrete object to return
	 * @param authId  if not null, enforce the authId == userId 
	 * @return
	 * @throws Exception
	 */
	public ReqMsg updateObject ( Entity entityExisting, 
			Map<String,Object> newProps, ReqMsg retData, String authId ) throws Exception
	{
		if ( entityExisting != null ) {
			
			// enforce authId == userId
			if ( authId != null ) {
				String userId = (String)entityExisting.getProperty("userId");
				if ( !AdminUtils.isSuperAdmin(authId) && !authId.equals(userId) ) {
					throw new IllegalArgumentException ( "Not Authorized" );
				}
			}
			
			// get new object props
			for (Iterator<Entry<String, Object>> it = newProps.entrySet().iterator(); it.hasNext(); ) {
				Entry<String, Object> newProp = (Entry<String, Object>)it.next();
				if ( newProp.getValue() != null ) {
					Object val = newProp.getValue() ;
					
					if ( val instanceof Text ) {
						val = ((Text)val).getValue();
					}
					if ( NO_VAL.equals(val) ) {
						// set db property if there
						entityExisting.setProperty(newProp.getKey(), "");
					}
					else {
						// set db property if there
						entityExisting.setProperty(newProp.getKey(), newProp.getValue());
					}
				}
			}
			DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
			datastore.put(entityExisting);

			retData.fromDataMap( entityExisting.getProperties() );
			return retData;
		}
		return null;
	}
	
	/**
	 * Delete an object from database
	 * @param id
	 * @throws Exception
	 */
	public void deleteObject ( Long id, String kind ) throws Exception
	{
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		Key key = KeyFactory.createKey(kind, id);
		datastore.delete( key);
	}
	
	/**
	 * Load all comments for a list
	 */
	public List<Comment> getAllComments ( Long listId, Long itemId )
	{
		ArrayList<Comment> allComments = new ArrayList<Comment>();
		//Filter listFilter = new FilterPredicate("listId",FilterOperator.EQUAL, listId);
		Filter itemFilter = new FilterPredicate("itemId",FilterOperator.EQUAL, itemId);
		
		//Filter commFilter = CompositeFilterOperator.and(listFilter, itemFilter);
		Query q = new Query("Comment").setFilter(itemFilter);
		//q.addSort("modified", SortDirection.ASCENDING);
 
		// Use PreparedQuery interface to retrieve results
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();		
		PreparedQuery pq = datastore.prepare(q);
		
		for (Entity result : pq.asIterable()) {
			Map props = result.getProperties();
			Comment comm = new Comment ();
			comm.fromDataMap ( props );
			comm.setId(result.getKey().getId());
			comm.setListId(null);
			comm.setItemId (null);
			allComments.add(comm);
		}		
		return allComments;
	}
	
	/**
	 * Gets user name from user object
	 * @param ttlist
	 * @return
	 * @throws Exception
	 */
	public String getUserNames ( User user ) throws Exception
	{
		StringBuilder sb = new StringBuilder();
		if ( user != null ) {
			if ( user.getFirstName()!=null )
				sb.append(user.getFirstName()).append(" ");
			if ( user.getLastName()!=null )
				sb.append(user.getLastName());
			if ( sb.length() < 3 ) {
				sb.setLength(0);
				sb.append(user.getEmail());				
			}
			return sb.toString();
		}
		return null;
	}
	
	/**
	 * Authenticate a user with loginToken and return User entity directly
	 * @return User
	 * @throws Exception
	 */
	public User auth ( String loginToken ) 
		throws Exception 
	{	
		if ( StrUtils.isEmpty(loginToken) ) 
			return null;
		
		String decToken = PassReset.decodeToken( loginToken );
		String email = PassReset.getEmailFromTok(decToken);
		String secret = PassReset.getSecretFromToken(decToken);
		
		Entity entity = load ( email, User.KIND );
		 if ( entity != null ) {
			 String authToken = (String)entity.getProperty("authToken");
			 if ( authToken.equals(secret) ) {				 
				 User user = new User();
				 Map<String,Object> props = entity.getProperties();
				 user.fromDataMap(props);
				 user.setLoginToken(PassReset.createSecurityToken(email, authToken));
				 return user;
			 }
		 }
		 return null;
	}		
	
	/**
	 * Authenticate a user and return User entity directly
	 * @param username
	 * @param password
	 * @return
	 * @throws Exception
	 */
	public User auth ( String email, String password ) 
		throws Exception 
	{
		if ( StrUtils.isEmpty(email) || StrUtils.isEmpty(password) ) 
			return null;
		
		 Entity entity = load ( email.toLowerCase(), User.KIND );
		 if ( entity != null ) {
			 // get salt from db
			 String salt = (String)entity.getProperty("salt");
			 
			 // password from DB
			 String dbpassword = (String)entity.getProperty("authToken");
			 
			 // passed password hash (with old salt)
			 String passPassword = PasswordHandler.getSecurePassword(password, salt);
			 
			 // if verifies
			 if ( dbpassword.equals(passPassword) ) {
				 User user = new User();
				 Map<String,Object> props = entity.getProperties();
				 user.fromDataMap(props);
				 user.setLoginToken(PassReset.createSecurityToken(email, dbpassword));
				 return user;
			 }
		 }
		 return null;
	}

	/**
	 * Load entity by key
	 * @param entityKey
	 * @return
	 * @throws Exception
	 */
	private Entity load ( Key entityKey ) throws Exception
	{
		try {
			DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
			return datastore.get(entityKey );
		}
		catch ( EntityNotFoundException ex) {
			return null;
		}
	}

}
