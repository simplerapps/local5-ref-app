package com.hqapps.pres;

import java.util.Date;
import java.util.Map;

import com.google.gson.Gson;

public abstract class ReqMsg 
{
	private String resource;
	private Boolean isMultipart;
	
	// ID is available to all sub-classes
	protected Long id;
	protected Date modified;
	protected String kind;	
	protected Class relCls;
	private String loginToken;	
	
	protected ReqMsg ( String kind ) {
		this.kind = kind;
	}
	
	public String toJson() {
    	Gson gson = new Gson();
    	String json = gson.toJson(this);
    	return json;
    }

	public String getResource() {
		return resource;
	}
	
	public Class getRelClass () {
		return relCls;
	}
	
	public void setRelClass ( Class relCls ) {
		this.relCls = relCls;
	}

	public void setResource(String endpoint, Class relCls) {
		this.resource = endpoint;
		this.relCls = relCls;
	}
	
	public String getKind () {
		return kind;
	}
	public boolean isMultipart() {
		return isMultipart!=null && isMultipart.booleanValue()==true;
	}

	public void setMultipart(boolean isMultipart) {
		this.isMultipart = new Boolean(isMultipart);
	}
	
	public void setId ( Long id ) {
		this.id = id;
	}
	
	public Long getId () {
		return id;
	}
	
	public void setModified (Date modified) {
		this.modified = modified;
	}
	
	public Date getModified () {
		return modified;
	}
	
	public abstract void fromDataMap ( Map<String,Object> props );
	public abstract Map<String,Object> toDataMap ();

	public String getLoginToken() {
		return loginToken;
	}

	public void setLoginToken(String loginToken) {
		this.loginToken = loginToken;
	}
}
