package com.hqapps.pres;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.mortbay.log.Log;

import com.hqapps.entity.EntityManager;
import com.hqapps.entity.UserCache;
import com.hqapps.pres.RespMsg.Error;
import com.hqapps.pres.RespMsg.Status;
import com.hqapps.pres.handler.MsgProcessor;
import com.hqapps.pres.msg.Unknown;
import com.hqapps.pres.msg.User;
import com.hqapps.pres.msg.Comment;
import com.hqapps.pres.msg.Feedback;
import com.hqapps.security.PassReset;
import com.hqapps.security.PasswordHandler;
import com.hqapps.util.ListUtils;
import com.hqapps.util.ReqUtils;
import com.hqapps.util.StrUtils;

public abstract class MsgHandler 
{
	private static final Logger log = Logger.getLogger(MsgHandler.class.getName());
	
	private static final String AUTH_USER_ID = "authUserId";
	
	static class MsgHandlerImpl extends MsgHandler 
	{}
	
	private static MsgHandler instance = new MsgHandlerImpl();
	
	private MsgHandler()
	{}
	
	public static MsgHandler getInstance ()
	{
		return instance;
	}
	
	/**
	 * Main message processor method
	 * @param method
	 * @param msg
	 * @param req
	 * @return
	 * @throws Exception
	 */
	public RespMsg process ( Method method, ReqMsg msg, HttpServletRequest req ) 
			throws Exception   
	{
		RespMsg resp = null;
		
		// get session and create if does not exist
		HttpSession session = req.getSession(true);

		// USER: handle user msg no matter what 
		if ( msg instanceof User ) {
			//resp =  handleMsg ( method, (User) msg );
			resp = MsgProcessor.getProcessor( msg ).process(method, (User) msg, null);
			if ( resp.getRespData()!=null &&  resp.getRespData() instanceof User) {
				User user = (User)resp.getRespData();
				
				//  if user authenticated, add him to session
				if ( user.getEmail() != null ) {
					session.putValue (AUTH_USER_ID, user.getEmail() );
					resp.setJsessionid(session.getId());
				}
			}
			return resp;
		}

		// get session variable (indication of user logged in)
		String userId = (String)session.getAttribute(AUTH_USER_ID);		
		
		String newSessionId = null;
		
		// Login Token: If no session and passed loginToken in any message use to authenticate  
		if ( userId==null && msg.getLoginToken() != null ) {
			User user = EntityManager.getInstance().auth( msg.getLoginToken() );
			if ( user!=null &&  user.getEmail() != null ) {
				log.warning( "User re-auth id: " + user.getEmail() );			
				session.putValue (AUTH_USER_ID, user.getEmail() );
				newSessionId = session.getId();
				// set userId
				userId = user.getEmail();
			}
		}	
		
		// USER NOT AUTHENTICATED
		if ( userId == null ) {
			resp = new RespMsg(Status.ERROR, Error.NEED_TO_AUTHENTICATE, "Please authenticate") ;
			
			// PUBLIC ACCESS: follow list check 
			// PUBLIC ACCESS: feedback send me reset link
			if ( msg instanceof Feedback) {
				Feedback fmsg = (Feedback)msg; 
				// special case for feedback msg == "EMAIL-ME-RESET-PASSWORD" to send reset password link
				if ( fmsg.getMsg() != null && fmsg.getUserId() != null ) {
					if ( fmsg.getMsg().equals("EMAIL-ME-RESET-PASSWORD" ) ) {
						User uinfo = EntityManager.getInstance().getUserPublicInfo(fmsg.getUserId());
						if ( uinfo != null ) {
							PassReset.sendResetEmail (req, uinfo );
						}
					}
					// if user is not in the system, ignore 
				}
			}
			return resp;
		}
		
		// USER AUTHENTICATED
		// Handle multi-part messages
		msg = ReqUtils.processMPartMessage ( req, msg ); 
		
		// NEW: way process based on relclass asso with message (defined in MsgProcessor) 
		if ( msg.getRelClass() != null ) {
			resp = MsgProcessor.getProcessor( msg ).process(method, msg, userId);
		}
		// OLD: way 
		else if ( msg instanceof Comment ) {
			resp = handleMsg ( method, (Comment) msg, userId );
		}
		else if ( msg instanceof Feedback ) {
			resp = handleMsg ( method, (Feedback) msg, userId );
		}
		else if ( msg instanceof Unknown ) {
			resp = handleMsg ( method, (Unknown) msg );
		}
		
		// invalid request
		if ( resp == null ) {
			return new RespMsg(Status.ERROR, "Message not supported") ;
		}

		// NEW SESSION ID: set new session id if there is a new one
		if ( newSessionId != null ) {
			resp.setJsessionid(newSessionId);
		}
		//resp.clearParams ();
		
		return resp;
	}
	
	// ALL Messages Processed Here
	
	/**
	 * handle Comment resource messages
	 * @param method
	 * @param user
	 * @return
	 */
	public RespMsg handleMsg ( Method method, Comment comment, String authUserId ) throws Exception
	{
		EntityManager em = EntityManager.getInstance();
		
		// Read object 
		if ( method == Method.GET ) {
			if ( comment.getId() != null ) {
				ReqMsg msg = em.loadObject(comment.getId(), Comment.class);
				if ( msg != null ) {
					return new RespMsg ( msg );
				}
			}
			else if ( comment.getItemId()!=null && comment.getListId()!=null ) {
				List <Comment> allComm = em.getAllComments(comment.getListId(), 
						comment.getItemId());
				if ( allComm.size() > 0 ) {
					//NO need to sort in memory: we do this as part of query
					ListUtils.sortComments (allComm);
					return new RespMsg (allComm);
				}
			}
			return new RespMsg (Status.ERROR, "Missing id or not Found"  );
		}
		// Create object
		else if ( method == Method.POST ) {
			if ( comment.getListId()==null || comment.getItemId()==null ) {
				new RespMsg (Status.ERROR, "You need both listId and itemId"  );
			}
			comment.setModified(new Date());
			comment.setUserId(authUserId);
			Map<String,Object> values = comment.toDataMap();
			Long id = em.storeNew(null, Comment.KIND, values);
			comment.setId(id);
			
			if ( comment.getMaxComm() != null ) {
				// update TTList max comments
				//em.updateItemMaxComm ( comment.getItemId(), comment.getMaxComm() );
			}
			
			// return new 
			return new RespMsg ( comment  );
		}
		// Update object
		else if ( method == Method.PUT ) {
			if ( comment.getId() != null ) {
				comment.setModified(new Date() );
				ReqMsg msg = em.updateObject ( comment.getId(), comment, Comment.class, authUserId );
				return new RespMsg ( msg  );
			}
		}
		// Delete object
		else if ( method == Method.DELETE ) {
			if ( comment.getId() != null ) {
				em.deleteObject(comment.getId(), Comment.KIND);
				return new RespMsg (comment );
			}
		}
		return new RespMsg (Status.ERROR, "Missing id or not Found"  );
	}
	
	
	/**
	 * handle Comment resource messages
	 * @param method
	 * @param user
	 * @return
	 */
	public RespMsg handleMsg ( Method method, Feedback feedback, String userId ) throws Exception
	{
		EntityManager em = EntityManager.getInstance();
		
		// Read object 
		if ( method == Method.GET ) {
			if ( feedback.getId() != null ) {
				ReqMsg msg = em.loadObject(feedback.getId(), Feedback.class);
				if ( msg != null ) {
					return new RespMsg ( msg );
				}
			}
			return new RespMsg (Status.ERROR, "Missing id or not Found"  );
		}
		// Create object
		else if ( method == Method.POST ) {
			feedback.setModified(new Date());
			feedback.setUserId(userId);
			Map<String,Object> values = feedback.toDataMap();
			Long id = em.storeNew(null, Feedback.KIND, values);
			feedback.setId(id);

			// return new 
			return new RespMsg ( feedback  );
		}
		// Update object
		else if ( method == Method.PUT ) {
		}
		// Delete object
		else if ( method == Method.DELETE ) {
		}
		return new RespMsg (Status.ERROR, "Missing id or not Found"  );
	}
	
	/**
	 * Handle unknown resource message
	 * @param method
	 * @param msg
	 * @return
	 */
	public RespMsg handleMsg ( Method method, Unknown msg )
	{
		RespMsg resp = new RespMsg (Status.ERROR, "Resource not found: " + msg.getResource() );
		return resp;
	}
	

}
