package com.hqapps.pres.msg;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import com.google.appengine.api.datastore.Link;
import com.hqapps.pres.ReqMsg;
import com.hqapps.util.TypesMap;

public class UserService extends ReqMsg
{	
	public static final String KIND = "UserService";
	
	// owner
	private String userId;
	private long serviceId;

	//transient
	private Service service;
	
	public UserService () {
		super (KIND);
	}

	@Override
	public Map<String,Object> toDataMap () 
	{
		HashMap<String,Object> props = new HashMap<String,Object>();
		props.put( "id", id );
		props.put( "modified", modified==null? new Date() : modified);
		props.put("userId", userId);
		props.put("serviceId", serviceId);
		return props;
	}
	
	@Override
	public void fromDataMap (Map<String,Object> props) 
	{
		TypesMap tm = new TypesMap (props);
		setUserId(tm.getStr("userId"));
		setId ( tm.getLong("id") );
		setServiceId ( tm.getLong("serviceId") );
		modified = (Date)props.get("modified");
	}
		
	public String getUserId() {
		return userId;
	}
	public void setUserId(String userId) {
		this.userId = userId;
	}

	public long getServiceId() {
		return serviceId;
	}

	public void setServiceId(long serviceId) {
		this.serviceId = serviceId;
	}

	// transient
	public void setService(Service service) {
		this.service = service;
	}
}
