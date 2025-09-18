package com.hqapps.pres.handler;

import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Query.FilterPredicate;
import com.hqapps.entity.EntityManager;
import com.google.appengine.api.datastore.Entity;
import com.hqapps.entity.UserCache;
import com.hqapps.pres.Method;
import com.hqapps.pres.ReqMsg;
import com.hqapps.pres.RespMsg;
import com.hqapps.pres.RespMsg.Error;
import com.hqapps.pres.RespMsg.Status;
import com.hqapps.pres.msg.Device;
import com.hqapps.pres.msg.Post;
import com.hqapps.pres.msg.Service;
import com.hqapps.util.ListUtils;
import com.hqapps.util.StrUtils;
import com.google.appengine.api.datastore.Query.CompositeFilterOperator;
import com.google.appengine.api.datastore.Query.Filter;
import com.google.appengine.api.datastore.Query.FilterPredicate;
import com.google.appengine.api.datastore.Query.FilterOperator;

public class DeviceProc extends DefaultProc 
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
		Device dev = (Device)msg;
		
		if ( authUserId == null ) {
			return new RespMsg (Status.ERROR, Error.NEED_TO_AUTHENTICATE, "Authentication Error" );
		}
		
		String deviceId = dev.getDeviceId();
		String authId = authUserId.toLowerCase();		
		
		if ( method == Method.POST || method == Method.PUT ) {
			if ( StrUtils.isEmpty( deviceId ) ) {
				return new RespMsg (Status.ERROR, Error.INVALID, "Invalid deviceId" );
			}
			Entity entity = em.load(deviceId, Device.KIND);
			
			if ( entity == null ) {
				Map<String,Object> values = dev.toDataMap();
				Long id = em.storeNew(deviceId, Device.KIND, values);
			}
			else {
				ReqMsg resp = em.updateObject (entity, dev.toDataMap(), new Device(), null );
				if ( resp == null ) {
					return new RespMsg (Status.ERROR, Error.INTERNAL_ERROR, "System Error" );
				}
			}
			// clear the user-deviceId cache
			UserCache.getInst().flushDeviceId(authId);

			return new RespMsg (msg );
		}
		return new RespMsg (Status.ERROR, Error.NOT_FOUND, "Invalid method = " + method );
	}	
}


