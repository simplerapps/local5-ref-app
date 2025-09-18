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

public class Post extends ReqMsg
{	
	public static final String KIND = "Post";
	
	// owner
	private String userId;
	
	private Long serviceId;
	private String msg; 
	
	private String allMediaId;
	private String allMsg;
	
	// transient 
	private ArrayList<String> mediaIdList;
	private ArrayList<String> msgList;
	private String userComName;
	private Long modifiedMs;
	private String serviceTitle;
	
	public Post () {
		super (KIND);
	}

	@Override
	// Writing to DB
	public Map<String,Object> toDataMap () 
	{
		HashMap<String,Object> props = new HashMap<String,Object>();
		props.put( "id", id );
		props.put( "modified", modified==null? new Date() : modified);
		props.put( "serviceId", serviceId);		
		props.put( "userId", userId);
		props.put( "msg", msg);

		// compact all mediaIds into one field
		allMediaId = ListUtils.listCompact (mediaIdList );
		props.put("allMediaId", allMediaId);
		allMsg = ListUtils.listCompact (msgList );
		props.put("allMsg", allMsg);
		return props;
	}
	
	@Override
	// Reading from DB or stream
	public void fromDataMap (Map<String,Object> props) 
	{
		TypesMap tm = new TypesMap (props);
		setUserId(tm.getStr("userId"));
		setId ( tm.getLong("id") );
		setServiceId ( tm.getLong("serviceId") );
		setMsg ( tm.getStr("msg"));
		setServiceTitle ( tm.getStr("serviceTitle"));
		
		modified = (Date)props.get("modified");
		
		mediaIdList = (ArrayList<String>) props.get ("mediaIdList");
		if ( mediaIdList != null ) {
			msgList = (ArrayList<String>) props.get ("msgList");
		}
		else {
			allMediaId = (String)props.get ("allMediaId");
			allMsg = (String)props.get ("allMsg");
			// extract list from mediaIDs field			
			if ( allMediaId != null ) {
				mediaIdList = ListUtils.listExtract (allMediaId );
				msgList = ListUtils.listExtract (allMsg );
			}
			allMediaId = null;
			allMsg = null;
		}
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

	public String getMsg() {
		return msg;
	}

	public void setMsg(String msg) {
		this.msg = msg;
	}

	public String getAllMediaId() {
		return allMediaId;
	}

	public void setAllMediaId(String allMedIds) {
		this.allMediaId = allMedIds;
	}

	public String getAllMsgs() {
		return allMsg;
	}

	public void setAllMsgs(String allMsgs) {
		this.allMsg = allMsgs;
	}

	// Transient 
	
	public ArrayList<String> getMediaIdList() {
		return mediaIdList;
	}

	public void setMediaIdList(ArrayList<String> medIdList) {
		this.mediaIdList = medIdList;
	}

	public ArrayList<String> getMsgList() {
		return msgList;
	}

	public void setMsgList(ArrayList<String> msgList) {
		this.msgList = msgList;
	}

	public String getUserComName() {
		return userComName;
	}

	public void setUserComName(String userComName) {
		this.userComName = userComName;
	}

	public Long getModifiedMs() {
		return modifiedMs;
	}

	public void setModifiedMs(Long modifiedMs) {
		this.modifiedMs = modifiedMs;
	}

	public String getServiceTitle() {
		return serviceTitle;
	}

	public void setServiceTitle(String serviceTitle) {
		this.serviceTitle = serviceTitle;
	}
}
