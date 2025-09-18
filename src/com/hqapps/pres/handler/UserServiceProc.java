package com.hqapps.pres.handler;

import java.util.List;
import java.util.logging.Logger;

import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Query.FilterPredicate;
import com.hqapps.entity.EntityManager;
import com.hqapps.pres.Method;
import com.hqapps.pres.ReqMsg;
import com.hqapps.pres.RespMsg;
import com.hqapps.pres.RespMsg.Status;
import com.hqapps.pres.RespMsg.Error;
import com.hqapps.pres.msg.UserService;
import com.hqapps.pres.msg.Service;
import com.google.appengine.api.datastore.Query.Filter;

public class UserServiceProc extends DefaultProc 
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
		UserService userSvc = (UserService)msg;
		
		if ( method  == Method.GET ) {
			Filter filter = new FilterPredicate ("userId", FilterOperator.EQUAL, authUserId );
			
			List<ReqMsg> resps = em.loadObjects(msg.getRelClass(), 100, filter);
			if ( resps != null ) {
				for (int i=0; i<resps.size(); i++ ) {
					UserService us = (UserService)resps.get(i);
					
					// deep load service objects 
					Service svc = (Service) em.loadObject(us.getServiceId(), Service.class );
					us.setService( svc );
				}
				return new RespMsg ( resps );
			}
			return new RespMsg (Status.ERROR, "Missing id or message not Found"  );
		}
		else if ( method == Method.DELETE ) {
			UserService svc = (UserService) em.loadObject(msg.getId(), UserService.class );
			if ( !authUserId.equalsIgnoreCase(svc.getUserId()) ) {
				return new RespMsg (Status.ERROR, Error.UNAUTHORIZED, "Unauthorized" );
			}
			em.deleteObject(msg.getId(), msg.getKind());
			return new RespMsg (Status.OK);
		}
		else {
			return super.process(method, msg, authUserId);
		}
	}
}



