package com.hqapps.pres.handler;

import com.hqapps.pres.Method;
import com.hqapps.pres.ReqMsg;
import com.hqapps.pres.RespMsg;
import com.hqapps.pres.RespMsg.Error;
import com.hqapps.pres.RespMsg.Status;
import com.hqapps.util.AdminUtils;

public class SAdminProc extends DefaultProc 
{
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
		if ( authUserId == null || !AdminUtils.isSuperAdmin(authUserId)) {
			if ( method != Method.GET ) {
				return new RespMsg (Status.ERROR, Error.UNAUTHORIZED, "Not Authorized" );
			}
		}
		
		return super.process(method, msg, authUserId);
	}	
}

