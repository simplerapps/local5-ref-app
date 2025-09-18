package com.hqapps.pres.handler;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Query.FilterPredicate;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.KeyFactory;
import com.hqapps.entity.EntityManager;
import com.hqapps.entity.UserCache;
import com.hqapps.pres.Method;
import com.hqapps.pres.ReqMsg;
import com.hqapps.pres.RespMsg;
import com.hqapps.pres.RespMsg.Error;
import com.hqapps.pres.RespMsg.Status;
import com.hqapps.pres.msg.Admin;
import com.hqapps.pres.msg.Group;
import com.hqapps.pres.msg.Service;
import com.hqapps.pres.msg.User;
import com.hqapps.security.PassReset;
import com.hqapps.security.PasswordHandler;
import com.hqapps.util.AdminUtils;
import com.hqapps.util.ListUtils;
import com.hqapps.util.StrUtils;

import com.google.appengine.api.datastore.Query.Filter;
import com.google.appengine.api.datastore.Query.FilterPredicate;
import com.google.appengine.api.datastore.Query.FilterOperator;


public class AdminProc extends DefaultProc 
{
	private static final Logger log = Logger.getLogger(MsgProcessor.class.getName());
	
	/**
	 * handle User resource messages
	 * @param method
	 * @param user
	 * @return
	 */
	@Override
	public RespMsg process ( Method method, ReqMsg msg, String authUserId ) 
			throws Exception
	{
		EntityManager em = EntityManager.getInstance();
		
		Admin adMsg = (Admin)msg;
		
		if ( authUserId == null ) {
			return new RespMsg (Status.ERROR, Error.NEED_TO_AUTHENTICATE, "Need to Authenticate" );
		}		

		String authId = authUserId.toLowerCase();

		if ( method == Method.POST ) {
			
			Long groupId  = 0L;
			User changedUser = null;
			
			// if name is not empty 
			if ( !StrUtils.isEmpty(adMsg.getFirstName()) ) {
				changedUser = getUser ( em, authId );
				changedUser.setFirstName(adMsg.getFirstName());
				changedUser.setLastName(adMsg.getLastName());
				// flush cache for the user
				UserCache.getInst().flushComName(authId);
			}
			
			// change group name request
			if ( !StrUtils.isEmpty(adMsg.getGroupName() ) ) {
				groupId = getGroupId ( em, adMsg.getGroupName() );
				if ( groupId == null ) {
					return new RespMsg (Status.ERROR, "Invalid Participation Group Name" );
				}
				if ( changedUser == null )
					changedUser = getUser ( em, authId );
				changedUser.setGroupId(groupId);
			}
			else {
				changedUser.setGroupId(0L);
			}
			
			// change password request
			if ( !StrUtils.isEmpty(adMsg.getNewPass() ) ) {
				if ( StrUtils.isEmpty(adMsg.getOldPass() ) ) {
					return new RespMsg (Status.ERROR, "Invalid Old Password" );
				}
				User authUser = em.auth(authId, adMsg.getOldPass());
				if ( authUser == null ) {
					return new RespMsg (Status.ERROR, "Old Password is Incorrect" );					
				}
				
				// // CREATE USER PASSOWORD HERE: crypto magic
				String salt = PasswordHandler.getSalt();
				String passwordEnc = PasswordHandler.getSecurePassword(adMsg.getNewPass(), salt);
				if ( changedUser == null ) {
					changedUser = authUser;
				}
				Map<String,Object> values = changedUser.toDataMap();
				values.put("authToken", passwordEnc);
				values.put("salt",  salt );
				values.put("groupId", groupId );
				
				User retUser = (User)em.updateUser(authId, values );
				retUser.setLoginToken(
						PassReset.createSecurityToken(changedUser.getEmail(), passwordEnc));
				return new RespMsg ( retUser );
			}
			
			// if only change group, just save the new group
			if ( changedUser != null ) {
				User retUser = (User)em.updateUser(authId, changedUser.toDataMap() );
				retUser.setLoginToken(
						PassReset.createSecurityToken(changedUser.getEmail(), 
								changedUser.getAuthToken()));
				return new RespMsg ( retUser );				
			}
		}
		
		return new RespMsg ( Status.OK );
	}
	
	/**
	 * Gets group id
	 * @param em
	 * @param groupName 
	 * @return
	 * @throws Exception
	 */
	private Long getGroupId ( EntityManager em, String groupNameOrId ) throws Exception 
	{
		Long groupId = null;
		try {
			groupId = Long.parseLong(groupNameOrId);
		}
		catch ( Exception ex ) {}
		
		if ( groupId == null ) {
			Filter filter = new FilterPredicate("name",FilterOperator.EQUAL, groupNameOrId);
			Group ret = (Group)em.loadObject(Group.class, filter);
			if ( ret != null )
				return ret.getId();
		}
		else {
			Entity entity = em.load (groupId, Group.KIND);
			if ( entity != null )
				return groupId;
		}	
		return null;
	}
	
	private User getUser ( EntityManager em, String authId ) throws Exception 
	{
		Entity entity = em.load(authId, User.KIND);
		User user = new User ();
		user.fromDataMap(entity.getProperties());
		return user;
	}
}
