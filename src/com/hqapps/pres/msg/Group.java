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

public class Group extends ReqMsg
{	
	public static final String KIND = "Group";
	
	private String name;
	private String dispName;
	private String dispStyle;
	
	public Group () {
		super (KIND);
	}

	@Override
	// Writing to DB
	public Map<String,Object> toDataMap () 
	{
		HashMap<String,Object> props = new HashMap<String,Object>();
		props.put( "id", id );
		props.put( "modified", modified==null? new Date() : modified);
		props.put( "name", name );
		props.put( "dispName", dispName );
		props.put( "dispStyle", dispStyle );		
		return props;
	}
	
	@Override
	// Reading from DB
	public void fromDataMap (Map<String,Object> props) 
	{
		TypesMap tm = new TypesMap (props);
		setId ( tm.getLong("id") );		
		modified = (Date)props.get("modified");
		name = tm.getStr("name");
		dispName = tm.getStr("dispName");
		dispStyle = tm.getStr("dispStyle");
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getDispName() {
		return dispName;
	}

	public void setDispName(String dispName) {
		this.dispName = dispName;
	}

	public String getDispStyle() {
		return dispStyle;
	}

	public void setDispStyle(String dispStyle) {
		this.dispStyle = dispStyle;
	}
	
}
