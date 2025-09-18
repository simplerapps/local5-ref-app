package com.hqapps.pres.msg;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import com.google.appengine.api.datastore.Text;
import com.hqapps.pres.ReqMsg;
import com.hqapps.util.ListUtils;
import com.hqapps.util.StrUtils;
import com.hqapps.util.TypesMap;

public class Device extends ReqMsg
{	
	public static final String KIND = "Device";
	
	// owner
	private String userId;
	
	// transient 
	private String deviceId;
	
	public Device () {
		super (KIND);
	}

	@Override
	// Writing to DB
	public Map<String,Object> toDataMap () 
	{
		HashMap<String,Object> props = new HashMap<String,Object>();
		props.put( "userId", userId );		
		props.put( "modified", modified==null? new Date() : modified);
		return props;
	}
	
	@Override
	// Reading from DB or stream
	public void fromDataMap (Map<String,Object> props) 
	{
		TypesMap tm = new TypesMap (props);
		setUserId(tm.getStr("deviceId"));
		setUserId(tm.getStr("userId"));
		modified = (Date)props.get("modified");
	}

	public String getUserId() {
		return userId;
	}

	public void setUserId(String userId) {
		this.userId = userId;
	}

	public String getDeviceId() {
		return deviceId;
	}

	public void setDeviceId(String deviceId) {
		this.deviceId = deviceId;
	}
	
}
