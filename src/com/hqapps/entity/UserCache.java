package com.hqapps.entity;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

import javax.cache.Cache;
import javax.cache.CacheException;
import javax.cache.CacheListener;
import javax.cache.CacheFactory;
import javax.cache.CacheManager;

import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Query.Filter;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Query.FilterPredicate;
import com.hqapps.pres.ReqMsg;
import com.hqapps.pres.msg.*;
import com.hqapps.util.ListUtils;
import com.hqapps.util.StrUtils;

public final class UserCache 
{
	private static UserCache inst = new  UserCache();
	private static final Logger log = Logger.getLogger(UserCache.class.getName());

	private Cache memoryCache = null;
	
	public static UserCache getInst ()
	{
		return inst;
	}

	/**
	 * Create Services Admins memoryCache
	 */
	private UserCache ()
	{
		try {
			CacheFactory cacheFactory = CacheManager.getInstance().getCacheFactory();
			memoryCache = cacheFactory.createCache(Collections.emptyMap());
		} catch (CacheException e) {
			log.warning("Could not create SvcAdminCache cahce. Cause: " + e.getMessage() );
		}
	}
	
	public String getComName ( String userId ) throws Exception
	{
		boolean set = true;
		UserCacheObj uco = (UserCacheObj) memoryCache.get(userId);
		if ( uco == null ) {
			uco = new UserCacheObj();
			set = false;
		}
		if ( uco.comName == null ) {
			uco.comName = getComNameFromDB ( userId );
			set = false;
		}
		// if not set, place in cache
		if ( !set ) {
			log.warning("cache write comName: " + userId );		
			memoryCache.put (userId, uco);			
		}		
		return uco.comName;
	}
	
	public String getAdminServices ( String userId ) throws Exception
	{
		boolean set = true;
		UserCacheObj uco = (UserCacheObj) memoryCache.get(userId);
		if ( uco == null ) {
			uco = new UserCacheObj();
			set = false;
		}
		if ( uco.adminServices == null ) {
			log.warning("cache miss: " + userId );			
			uco.adminServices = loadAdminsAsCsv (userId);
			set = false;
		}
		// if not set, place in cache
		if ( !set ) {
			log.warning("cache write adminSvcs: " + userId );		
			memoryCache.put (userId, uco);			
		}
		return uco.adminServices;
	}
	
	public String getDeviceId ( String userId ) throws Exception
	{
		boolean set = true;
		UserCacheObj uco = (UserCacheObj) memoryCache.get(userId);
		if ( uco == null ) {
			uco = new UserCacheObj();
			set = false;
		}
		if ( uco.deviceId == null ) {
			uco.deviceId = deviceIdFromDB (userId);
			set = false;
		}
		// if not set, place in cache
		if ( !set ) {
			log.warning("cache write deviceId: " + userId );		
			memoryCache.put (userId, uco);			
		}
		return uco.deviceId;
	}
	
	public void flushAdminServices ( String userId )
	{
		UserCacheObj uco = (UserCacheObj) memoryCache.get(userId);
		if ( uco != null && uco.adminServices != null) {
			uco.adminServices = null;
			memoryCache.put (userId, uco);
		}
	}
	
	public void flushDeviceId ( String userId )
	{
		UserCacheObj uco = (UserCacheObj) memoryCache.get(userId);
		if ( uco != null && uco.deviceId != null) {
			uco.deviceId = null;
			memoryCache.put (userId, uco);
		}
	}
	
	public void flushComName ( String userId )
	{
		UserCacheObj uco = (UserCacheObj) memoryCache.get(userId);
		if ( uco != null && uco.comName != null) {
			uco.comName = null;
			memoryCache.put (userId, uco);
		}
	}
	
	/// Helper methods	
	
	private String loadAdminsAsCsv (  String userId ) throws Exception
	{
		EntityManager em = EntityManager.getInstance();
		Filter filter = new FilterPredicate ("userId", FilterOperator.EQUAL, userId );
		List<ReqMsg> admList = em.loadObjects(Admin.class, 100, filter);
		if ( admList==null || admList.size()==0 ) {
			return "";
		}
		ArrayList<Long> idList = new ArrayList<Long>(admList.size());
		for ( int i=0; i<admList.size(); i++ ) {
			Admin ad = (Admin)admList.get(i);
			if ( ad.getServiceId() != null ) {
				idList.add( ad.getServiceId() );
			}
		}
		return ListUtils.csvStringFromList(idList);
	}
	
	private String getComNameFromDB ( String userId ) throws Exception
	{
		EntityManager em = EntityManager.getInstance();
		Entity ent = (Entity) em.load (userId, User.KIND);	
		User usr = new User();
		usr.fromDataMap( ent.getProperties() );
		return EntityManager.getInstance().getUserNames(usr);
	}
	
	// for now get most recent device for user
	private String deviceIdFromDB ( String userId ) throws Exception 
	{
		EntityManager em = EntityManager.getInstance();

		Filter filter = new FilterPredicate ("userId", FilterOperator.EQUAL, userId );
		
		Iterable<Entity> entities = em.loadEntities(Device.KIND, filter, false);
		
		long maxTime = 0L;
		String recentDeviceId = null;
		for (Entity result : entities) {
			Date dt = (Date)result.getProperty("modified");
			if ( dt.getTime() > maxTime ) {
				maxTime = dt.getTime();
				recentDeviceId = (String)result.getKey().getName();
			}
		}
		return recentDeviceId;
	}
}

