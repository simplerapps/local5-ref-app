package com.hqapps.pres.msg;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import com.google.appengine.api.datastore.Text;
import com.hqapps.pres.ReqMsg;
import com.hqapps.util.StrUtils;
import com.hqapps.util.TypesMap;

public class Service extends ReqMsg
{	
	public static final String KIND = "Service";
	
	// owner
	private String userId;
	
	// visual
	private String iconUrl ;
	private String iconBG;
	private String title;
	private String titleColor;
	private String titleBG;
	
	// service info
	private String address;
	private String zip;
	private String city;
	private String state;
	private String country;
	private String info;
	
	// associated component info
	private String compName;
	private String compDef;
	private String compConfig;
	private Long groupId = 0L;
	
	// options
	private Boolean showComm = true;	// enable comments
	private Boolean showPoster = true;  // show comment poster

	// Transient 
	private String adUserIds;
	
	public Service () {
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
		props.put("iconUrl", iconUrl );
		props.put("iconBG", iconBG);
		props.put("title",title);
		props.put("titleColor",titleColor);
		props.put("titleBG",titleBG );		
		props.put("address",address);
		props.put("zip",zip);		
		props.put("city",city);
		props.put("state",state);
		props.put("country",country);
		props.put("info",info);
		props.put("groupId", groupId);
		
		// show options
		if ( showComm == null ) {
			showComm = true;
		}
		if ( showPoster == null ) {
			showPoster = true;
		}
		props.put("showComm", showComm);
		props.put("showPoster", showPoster);
		
		// comp stuff 
		props.put("compName", compName);
		props.put("compDef", new Text(compDef) );
		props.put("compConfig", new Text(compConfig) );
		return props;
	}
	
	@Override
	// Read from DB, Stream
	public void fromDataMap (Map<String,Object> props) 
	{
		TypesMap tm = new TypesMap (props);
		setUserId(tm.getStr("userId"));
		setId ( tm.getLong("id") );
		modified = (Date)props.get("modified");
		iconUrl = tm.getStr("iconUrl");
		iconBG = tm.getStr("iconBG");
		title = tm.getStr("title");
		titleColor = tm.getStr("titleColor");
		titleBG = tm.getStr("titleBG");
		address = tm.getStr("address");
		zip = tm.getStr("zip");
		city = tm.getStr("city");
		state = tm.getStr("state");
		country = tm.getStr("country");
		info = tm.getStr("info");
		compName = tm.getStr("compName") ;
		compDef = tm.getStr("compDef" );
		compConfig = tm.getStr("compConfig" );
		adUserIds = tm.getStr("adUserIds");
		groupId = tm.getLong("groupId");	
		showComm = tm.getBool("showComm");
		showPoster = tm.getBool("showPoster");
	}
		
	public String getUserId() {
		return userId;
	}
	public void setUserId(String userId) {
		this.userId = userId;
	}

	public String getIconUrl() {
		return iconUrl;
	}

	public void setIconUrl(String iconUrl) {
		this.iconUrl = iconUrl;
	}

	public String getIconBG() {
		return iconBG;
	}

	public void setIconBG(String iconBG) {
		this.iconBG = iconBG;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getTitleColor() {
		return titleColor;
	}

	public String getTitleBG() {
		return titleBG;
	}

	public void setTitleBG(String titleBG) {
		this.titleBG = titleBG;
	}

	public void setTitleColor(String titleColor) {
		this.titleColor = titleColor;
	}

	public String getAddress() {
		return address;
	}

	public void setAddress(String address) {
		this.address = address;
	}

	public String getCity() {
		return city;
	}

	public void setCity(String city) {
		this.city = city;
	}

	public String getState() {
		return state;
	}

	public void setState(String state) {
		this.state = state;
	}

	public String getCountry() {
		return country;
	}

	public void setCountry(String country) {
		this.country = country;
	}

	public String getInfo() {
		return info;
	}

	public void setInfo(String info) {
		this.info = info;
	}

	public String getCompName() {
		return compName;
	}

	public void setCompName(String compName) {
		this.compName = compName;
	}

	public String getCompDef() {
		return compDef;
	}

	public void setCompDef(String compDef) {
		this.compDef = compDef;
	}

	public String getCompConfig() {
		return compConfig;
	}

	public void setCompConfig(String compConfig) {
		this.compConfig = compConfig;
	}
	
	// Transient 
	public String getAdUserIds() {
		return adUserIds;
	}

	public void setAdUserIds(String adUserIds) {
		this.adUserIds = adUserIds;
	}

	public Long getGroupId() {
		return groupId;
	}

	public void setGroupId(Long groupId) {
		this.groupId = groupId;
	}

	public Boolean getShowComm() {
		return showComm;
	}

	public void setShowComm(Boolean showComm) {
		this.showComm = showComm;
	}

	public Boolean getShowPoster() {
		return showPoster;
	}

	public void setShowPoster(Boolean showPoster) {
		this.showPoster = showPoster;
	}

}
