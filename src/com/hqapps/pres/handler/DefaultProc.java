package com.hqapps.pres.handler;

import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

import com.hqapps.entity.EntityManager;
import com.hqapps.pres.Method;
import com.hqapps.pres.ReqMsg;
import com.hqapps.pres.RespMsg;
import com.hqapps.pres.RespMsg.Error;
import com.hqapps.pres.RespMsg.Status;

public class DefaultProc extends MsgProcessor 
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
		
		// Read object 
		if ( method == Method.GET ) {

			if ( msg.getId() != null ) {
				ReqMsg resp = em.loadObject(msg.getId(), msg.getRelClass() );
				if ( resp != null ) {
					return new RespMsg ( resp );
				}
			}
			// IMPORTANT: Allow any user to get all services after authenticated
			else {
				List<ReqMsg> resps = em.loadObjects(msg.getRelClass(), 60, null);
				if ( resps != null ) {
					return new RespMsg ( resps );
				}
			}
			return new RespMsg (Status.ERROR, "Missing id or not Found"  );
		}
		// Create object
		else if ( method == Method.POST ) {
			msg.setModified(new Date());
			Map<String,Object> values = msg.toDataMap();
			values.put("userId", authUserId);
			
			Long id = em.storeNew(null, msg.getKind(), values);
			msg.setId(id);
			
			// return new 
			return new RespMsg ( msg  );
		}
		// Update object
		else if ( method == Method.PUT ) {
			if ( msg.getId() != null ) {
				msg.setModified(new Date() );
				try {
					ReqMsg resp = em.updateObject ( msg.getId(), msg, msg.getRelClass(), authUserId);
					return new RespMsg ( resp  );
				}
				// for now assume security error
				catch ( IllegalArgumentException ex ) {
					return new RespMsg (Status.ERROR, Error.UNAUTHORIZED, "Not Authorized" );
				}
			}
		}
		// Delete object
		else if ( method == Method.DELETE ) {
			if ( msg.getId() != null ) {
				em.deleteObject ( msg.getId(), msg.getKind() );
				return new RespMsg (Status.OK );
			}
		}
		return new RespMsg (Status.ERROR, "Missing id or message not Found"  );
	}
}
