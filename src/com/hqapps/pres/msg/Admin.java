package com.hqapps.pres.msg;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import com.hqapps.pres.ReqMsg;
import com.hqapps.util.TypesMap;

public class Admin extends ReqMsg
{	
	public static final String KIND = "Admin";
	
	private String userId;
	private Long serviceId;
	
	// Transient 
	private String oldPass;
	private String newPass;
	private String groupName;
	private String firstName;
	private String lastName;	
	
	public Admin () {
		super (KIND);
	}

	@Override
	// Writing to DB
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
	// Read from props (DB, HTTP data, etc.)
	public void fromDataMap (Map<String,Object> props) 
	{
		TypesMap tm = new TypesMap (props);
		setUserId(tm.getStr("userId"));
		setId ( tm.getLong("id") );
		modified = (Date)props.get("modified");
		setServiceId (tm.getLong("serviceId") );
		
		// Transient
		oldPass = tm.getStr("oldPass");
		newPass = tm.getStr("newPass");
		groupName = tm.getStr("groupName");
		firstName = tm.getStr("firstName");
		lastName = tm.getStr("lastName");		
	}
		
	public String getUserId() {
		return userId;
	}
	public void setUserId(String userId) {
		this.userId = userId;
	}

	public Long getServiceId() {
		return serviceId;
	}

	public void setServiceId(Long serviceId) {
		this.serviceId = serviceId;
	}
	
	
	//// Transient data 

	public String getOldPass() {
		return oldPass;
	}

	public void setOldPass(String oldPass) {
		this.oldPass = oldPass;
	}

	public String getNewPass() {
		return newPass;
	}

	public void setNewPass(String newPass) {
		this.newPass = newPass;
	}

	public String getGroupName() {
		return groupName;
	}

	public void setGroupName(String groupName) {
		this.groupName = groupName;
	}

	public String getLastName() {
		return lastName;
	}

	public void setLastName(String lastName) {
		this.lastName = lastName;
	}

	public String getFirstName() {
		return firstName;
	}

	public void setFirstName(String firstName) {
		this.firstName = firstName;
	}
}
