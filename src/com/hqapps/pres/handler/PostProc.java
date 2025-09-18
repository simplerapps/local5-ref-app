package com.hqapps.pres.handler;

import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Query.FilterPredicate;
import com.hqapps.entity.EntityManager;
import com.hqapps.entity.UserCache;
import com.hqapps.pns.PushNotification;
import com.hqapps.pres.Method;
import com.hqapps.pres.ReqMsg;
import com.hqapps.pres.RespMsg;
import com.hqapps.pres.RespMsg.Error;
import com.hqapps.pres.RespMsg.Status;
import com.hqapps.pres.msg.Post;
import com.hqapps.util.ListUtils;
import com.hqapps.util.StrUtils;
import com.google.appengine.api.datastore.Query.CompositeFilterOperator;
import com.google.appengine.api.datastore.Query.Filter;

public class PostProc extends DefaultProc 
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
		Post post = (Post)msg;
		
		if ( authUserId == null ) {
			return new RespMsg (Status.ERROR, Error.UNAUTHORIZED, "Not Authorized" );
		}
		
		if ( method == Method.GET ) {
			if ( post.getServiceId() == null ) {
				return new RespMsg (Status.ERROR, Error.INVALID, "Invalid serviceId" );
			}
			
			List<ReqMsg> resp = loadPostings ( em, post );
			if ( resp == null ) {
				return new RespMsg (Status.ERROR, Error.INTERNAL_ERROR, "" );
			}
			return new RespMsg ( resp );
		}
		else if ( method == Method.POST || method == Method.PUT ) {
			if ( post.getServiceId() == null ) {
				return new RespMsg (Status.ERROR, Error.INVALID, "Invalid serviceId" );
			}
			if ( post.getMediaIdList()!=null && post.getMsgList()!=null ) {
				if ( post.getMediaIdList().size() != post.getMsgList().size() ) {
					return new RespMsg (Status.ERROR, Error.INVALID, "Invalid mediaIdList, msgList sizes" );
				}
			}
			if ( StrUtils.isEmpty(post.getMsg()) ) {
				return new RespMsg (Status.ERROR, Error.INVALID, "Invalid msg" );
			}
			// make sure you set the user id that did the post
			post.setUserId( authUserId );

			Long id = null;
			boolean isNew = false;
			
			if ( method == Method.PUT ) {
				id = msg.getId();
				if ( id == null ) {
					return new RespMsg (Status.ERROR, Error.INVALID, "Missing post.id for PUT Request" );
				}
				em.updateObject( id, post, Post.class, null );
			}
			else {
				Map<String,Object> values = msg.toDataMap();
				id = em.storeNew(null, msg.getKind(), values);	
				isNew = true;
			}
			Post resp = new Post ();
			resp.setId( id );
			
			// send notification to all service users
			sendNotifications ( em, post, isNew );
		
			return new RespMsg (resp );
		}
		// Delete object
		else if ( method == Method.DELETE ) {
			if ( msg.getId() != null ) {
				em.deleteObject ( msg.getId(), msg.getKind() );
				return new RespMsg (Status.OK );
			}
		}		
		return new RespMsg (Status.ERROR, Error.NOT_FOUND, "Invalid method = " + method );
	}
	
	/**
	 * Load posting after certain date
	 * @param em
	 * @param post
	 * @return
	 */
	private List<ReqMsg> loadPostings ( EntityManager em, Post post )
	{
		Date fromDate = post.getModified();
		if ( fromDate == null ) {
			fromDate = new Date ();
		}
		
		Filter timeFilter = new FilterPredicate("modified",
				FilterOperator.LESS_THAN_OR_EQUAL,
				fromDate);
		Filter svcFilter = new FilterPredicate("serviceId",
				FilterOperator.EQUAL,
				post.getServiceId() );
		Filter postFilter = CompositeFilterOperator.and(timeFilter, svcFilter);
		
		// get last 10 posts 
		try {
			List<ReqMsg> resp = em.loadObjects ( Post.class, 10, postFilter);
			ListUtils.sort(resp);
			for ( int i=0; i<resp.size(); i++ ) {
				Post p = (Post) resp.get(i);
				p.setUserComName( UserCache.getInst().getComName(p.getUserId()) );
				p.setModifiedMs( p.getModified().getTime() );
				p.setModified(null);
			}
			return resp;
		} 
		catch (Exception e) {
			log.warning("Error reading from Datastore: cause:" + e.toString() );
			return null;
		}
	}
	
	/**
	 * Sends notifications to all service users (synchronously) 
	 * @param serviceId
	 */
	private void sendNotifications ( EntityManager em, Post posting, boolean isNew ) throws Exception
	{
		List<String> listDevIds = em.getAffectedDevicesfromServiceChange ( posting.getServiceId() );
		//System.out.println( listDevIds );
		
		String message = null;
		if ( isNew )
			message = "Service name '" + posting.getServiceTitle() + "' have new postings.";
		else 
			message = "Service name '" + posting.getServiceTitle() + "' have posting updates.";		
		
		if ( listDevIds!=null && listDevIds.size()>0 ) {
			PushNotification.getInst().sendNotification ( listDevIds, message, posting.getServiceId() );
		}
	}		
}

