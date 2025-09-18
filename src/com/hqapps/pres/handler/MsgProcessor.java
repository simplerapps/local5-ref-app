package com.hqapps.pres.handler;

import java.util.HashMap;

import com.hqapps.pres.Method;
import com.hqapps.pres.ReqMsg;
import com.hqapps.pres.RespMsg;
import com.hqapps.pres.msg.Admin;
import com.hqapps.pres.msg.Device;
import com.hqapps.pres.msg.Group;
import com.hqapps.pres.msg.Post;
import com.hqapps.pres.msg.Service;
import com.hqapps.pres.msg.User;
import com.hqapps.pres.msg.UserService;

public abstract class MsgProcessor 
{
	private static MsgProcessor PostProc = new  PostProc();
	private static MsgProcessor userProc = new UserProc();
	private static MsgProcessor defaultProc = new DefaultProc();
	private static MsgProcessor serviceProc = new ServiceProc();
	private static MsgProcessor adminProc = new AdminProc();	
	private static MsgProcessor userServiceProc = new UserServiceProc();
	private static MsgProcessor sadminProc = new  SAdminProc();
	private static MsgProcessor deviceProc = new  DeviceProc();
	
	private static final HashMap<String,Class> supportedResourceMap = new HashMap<String,Class>() ;
	
	static
	{
		supportedResourceMap.put ( "user", User.class );
		supportedResourceMap.put ( "service", Service.class );
		supportedResourceMap.put ( "userService", UserService.class );
		supportedResourceMap.put ( "post", Post.class );
		supportedResourceMap.put ( "admin", Admin.class );
		supportedResourceMap.put ( "group", Group.class );	
		supportedResourceMap.put ( "device", Device.class );			
	}
	
	/**
	 * getProcessor
	 * @param msg
	 * @return
	 */
	public static MsgProcessor getProcessor (  ReqMsg msg )
	{
		if ( msg instanceof User ) {
			return userProc;
		}
		else if ( msg instanceof Service ) {
			return serviceProc;
		}
		else if ( msg instanceof UserService ) {
			return userServiceProc;
		}
		else if ( msg instanceof Post ) {
			return PostProc;
		}		
		else if ( msg instanceof Admin ) {
			return adminProc;
		}
		else if ( msg instanceof Group ) {
			return sadminProc;
		}
		else if ( msg instanceof Device ) {
			return deviceProc;
		}
		return defaultProc;
	}
	
	/**
	 * Get supported resource class based on name
	 * @param resourceName
	 * @return
	 */
	public static Class getResourceClass ( String resourceName )
	{
		return supportedResourceMap.get( resourceName );
	}
	
	/**
	 * Process message
	 * @param method
	 * @param user
	 * @return
	 * @throws Exception
	 */
	public abstract RespMsg process ( Method method, ReqMsg user, String authUserId ) 
		throws Exception;
	
}
