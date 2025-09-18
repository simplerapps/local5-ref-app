package com.hqapps.pres.msg;

import java.util.HashMap;
import java.util.Map;

import com.hqapps.pres.ReqMsg;

public class User extends ReqMsg
{	
	public static final String KIND = "User";
	
	// key 
	private String email;  // key is email
	
	private String firstName;
	private String lastName;	
	private String authToken;	// password (i.e. password)
	private Long groupId = 0L;
	
	// Transient flag
	private Boolean resetPassword;
	
	// admin services
	private String adminSvcs;
		
	public User () {
		super (KIND);
	}
	
	// Read from ..
	public void fromDataMap ( Map<String,Object> props )
	{
		// IMPORTANT: do no propagate salt
		String emailStr = (String)props.get("email");
		
		email = emailStr.toLowerCase();
		firstName = (String)props.get("firstName");
		lastName = (String)props.get("lastName");
		groupId =  (Long)props.get("groupId");
		if ( groupId == null )
			groupId = 0L;
				
		// user password hash as auth token for now
		//authToken = (String)props.get("authToken");
	}

	// Writing to DB
	public Map<String,Object> toDataMap () 
	{
		HashMap<String,Object> props = new HashMap<String,Object>();

		// IMPORTANT: do no propagate password or salt
		props.put("email", email.toLowerCase());
		props.put("authToken", authToken);
		props.put("firstName", firstName );
		props.put("lastName", lastName );
		props.put("groupId", groupId );
		return props;
	}
	
	public String getEmail() {
		return email;
	}
	
	public void setEmail(String email) {
		this.email = email;
	}
	
	public String getFirstName() {
		return this.firstName;
	}

	public void setFirstName(String firstName) {
		this.firstName = firstName;
	}
	
	public String getLastName() {
		return lastName;
	}

	public void setLastName(String lastName) {
		this.lastName = lastName;
	}	

	public String getAuthToken() {
		return authToken;
	}

	public void setAuthToken(String authToken) {
		this.authToken = authToken;
	}
	
	public Boolean getResetPassword() {
		return resetPassword;
	}

	public void setResetPassword(Boolean resetPassword) {
		this.resetPassword = resetPassword;
	}

	public String getAdminSvcs() {
		return adminSvcs;
	}

	public void setAdminSvcs(String adminSvc) {
		this.adminSvcs = adminSvc;
	}
	
	public void setGroupId ( Long id ) {
		this.groupId = id;
	}
	
	public Long getGroupId () {
		return this.groupId;
	}
}
