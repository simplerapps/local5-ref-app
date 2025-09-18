/**
 * Data manager to handle caching / etc
 */
App.DataManager = function ()
{
	var compId = 20000;

	// DB: services list 
	var cacheTable = 
		[
		{data:undefined, lastSec:0, ttlSec:60}
		];
	
	// DB: user-services test list  (pre-fill for testing)
	var userServiceList = [];	
	
	// Array of objects, caches all service feeds: 
	// {serviceId:id, lastSec:now-sec, data:feed-data}
	var serviceFeedsCache = {};
	var serviceFeedTTL = 60;
	var groupDataCache = {};
	
	/**
	 * Auth: login 
	 */
	this.authLogin = function ( data, authHandler )
	{
		SA.server.get("/rs/user", data, dataResult);
		
		function dataResult ( respStr )
		{
			//console.log ( 'calling server: result: ' + respStr);
			
			var respObj = jQuery.parseJSON( respStr );
			if ( respObj.status == 'OK') {
				
				// set auth to user info
				SA.setUserAuth ( respObj );
				
				// set username in app data
				SA.setAppData ( 'userName', respObj.respData.email );	
				// del user data object 
				App.util.delUserData ();
				
				_clearUserServices();
				_clearServicesCache();
				
				authHandler ('OK', respObj );
			}
			else {
				authHandler (respObj.status, respObj );
			}
		}
	}
	
	/**
	 * Auth: create a new account 
	 */
	this.authCreateAcct = function ( data, authHandler )
	{
		SA.server.set ("/rs/user", data, dataResult);
		function dataResult ( respStr )
		{
			var respObj = jQuery.parseJSON( respStr );
			if ( respObj.status == 'OK') {
				
				// set auth to user info
				SA.setUserAuth ( respObj );
				
				// set username in app data
				SA.setAppData ( 'userName', respObj.respData.email );
				// del user data object 
				App.util.delUserData ();
				
				_clearUserServices();
				_clearServicesCache();
				
				authHandler ('OK', respObj );
			}
			else {
				authHandler (respObj.status, respObj );
			}
		}
	}
	
	/**
	 * Auth: email reset password
	 */
	this.authEmailReset = function ( data, authHandler )
	{
		SA.server.set ("/rs/feedback", data, dataResult);	
		function dataResult ( respStr )
		{
			var respObj = jQuery.parseJSON( respStr );
			if ( respObj.status == 'OK') {
				authHandler ('OK', respObj);
			}
			else {
				authHandler (respObj.status, respObj );
			}
		}
	}
	
	/**
	 * Get all services created (owned) by user
	 */
	this.getMyServices = function ( searchObj, dataHandler, cache )
	{
		searchObj.groupId = App.util.getGroupId ();
		SA.server.get("/rs/service", searchObj, dataResult );
		
		function dataResult ( respStr )
		{
			var respObj = jQuery.parseJSON( respStr );
			if ( respObj.status == 'OK') {
				dataHandler ('OK', respObj.respData );
			}
			else {
				dataHandler (respObj.status, respObj.message );
			}
		}
	}
	
	/**
	 * Gets group data 
	 */
	this.getGroupData = function ( groupId, dataHandler )
	{
		if ( groupDataCache.id && groupDataCache.id>0 ) {
			dataHandler ('OK', groupDataCache );
		}
		else {
			SA.server.get("/rs/group", {id:groupId}, dataResult );			
			function dataResult ( respStr )
			{
				var respObj = jQuery.parseJSON( respStr );
				if ( respObj.status == 'OK') {
					groupDataCache = respObj.respData;
					dataHandler ('OK', respObj.respData );
				}
				else {
					dataHandler (respObj.status, respObj.message );
				}
			}
		}
	}
	
	/**
	 * Gets all services registered in the system
	 */
	this.getServices = function ( searchObj, dataHandler, cache )
	{
		var nowSec = new Date().getTime() / 1000;
		var svcsObject = cacheTable [0];
		
		// cache miss
		if ( (nowSec - svcsObject.lastSec) > svcsObject.ttlSec ) {
			svcsObject.lastSec = nowSec;
			searchObj.groupId = App.util.getGroupId ();
			SA.server.get("/rs/service", searchObj, dataResult );
			
			function dataResult ( respStr )
			{
				var respObj = jQuery.parseJSON( respStr );
				if ( respObj.status == 'OK') {
					svcsObject.data = respObj.respData;
					dataHandler ('OK', svcsObject.data);
				}
				else {
					dataHandler (respObj.status, respObj.message );
				}
			}
		}
		else {
			dataHandler ('OK', svcsObject.data);
		}
	}
	
	/**
	 * Clears the feeds cache for service 
	 */
	this.clearFeedsCache = function ( serviceId )
	{
		_clearFeedsCache ( serviceId );
	}
	
	/*
	 * Interal clear cache function
	 */
	function _clearFeedsCache ( serviceId )
	{
		serviceFeedsCache [serviceId] = undefined;		
	}
	
	/**
	 * Clear the user services cache
	 */
	this.clearUserServices = function ()
	{
		_clearUserServices();
	}
	
	function _clearUserServices ()
	{
		userServiceList.length = 0;		
	}
	
	/*
	 * Clear the services cache
	 */
	function _clearServicesCache ()
	{
		cacheTable [0].lastSec = 0;
	}
	
	/**
	 * DB: Get user service objects as saved in DB
	 * 
	 * userService obj format: {id:user-svc-id, sconf:svc-config, divId:div-id }
	 */
	this.getUserServices = function ( dataHandler )
	{
		// if no dataHandler, return from cache
		if ( !dataHandler ) {
			return userServiceList;
		}
		// if data already loaded return
		else if ( userServiceList.length > 0 ) {
			dataHandler ( 'OK', userServiceList );			
		}
		// load data 
		else {
			SA.server.get("/rs/userService", {}, userSvcResult );
			
			function userSvcResult (respStr)
			{
				var respObj = jQuery.parseJSON( respStr );
				if ( respObj.status == 'OK') {
					var data = respObj.respData;
					for (i=0; i<data.length; i++ ) {
						var sobj = {id:data[i].id, sconf:data[i].service, divId:''};
						addUserServiceObj ( sobj );
					}
					dataHandler ('OK', data );					
				}
				else {
					dataHandler (respObj.status, respObj.message );
				}
			}
		}
	}
	
	/**
	 * Gets service by id from cache
	 */
	this.getService = function ( serviceId )
	{
		for ( var i=0; i<userServiceList.length; i++ ) {
			if ( userServiceList[i].sconf.id == serviceId ) {
				return userServiceList[i].sconf;
			}
		}
	}
	
	/**
	 * Remove userService by id
	 */
	this.delUserService = function ( id, dataHandler )
	{				
		var idx = getUserServiceIdx ( id );
		if ( idx >= 0 ) {
			SA.server.del ("/rs/userService", {id:id}, delResult );
		}
		// del result 
		function delResult (respStr)
		{
			var respObj = jQuery.parseJSON( respStr );
			if ( respObj.status == 'OK') {
				userServiceList.splice (idx, 1);
				dataHandler ('OK', respObj.respData );
			}
			else {
				dataHandler (respObj.status, respObj.message );
			}
		}
	}
	
	/**
	 * Find a user-based service by div id
	 */
	this.getUserServiceByDivId = function ( divId )
	{
		return getUserServiceObj (divId);
	}
	
	/**
	 * DB: Add user service config object (and optionally map to divId )
	 */
	this.registerDeviceId = function ( deviceId, resultFn )
	{
		// data to update
		var postData = {deviceId:deviceId, userId:App.util.getUserId()};
		
		SA.server.set ('/rs/device', postData, dataesult );
		function dataesult ( respStr )
		{
			var respObj = jQuery.parseJSON( respStr );
			if ( respObj.status == 'OK') {
				var data = respObj.respData;
				resultFn ('OK',  data );
			}
			else {
				resultFn (respObj.status,  respObj.message );
			}
		}				
	}
	
	/**
	 * DB: Add user service config object (and optionally map to divId )
	 */
	this.setUserService = function ( divId, sConfig, resultFn )
	{
		// data to update
		var postData = {serviceId:sConfig.id};
		
		// get existing service conf object (if any)
		var userSvcObj = getUserServiceObj ( divId );
		if ( userSvcObj ) {
			postData.id = userSvcObj.id;
		}
		
		SA.server.set ('/rs/userService', postData, setSvcResult );
		
		function setSvcResult ( respStr )
		{
			var respObj = jQuery.parseJSON( respStr );
			if ( respObj.status == 'OK') {
				var data = respObj.respData;
				
				// if existed in cache userSvcObj
				if ( userSvcObj ) {
					userSvcObj.sconf = sConfig;
				}
				else {
					userSvcObj = {id:data.id, sconf:sConfig, divId:divId };
					addUserServiceObj (userSvcObj);
				}
	
				// notify caller about result 
				resultFn ('OK',  data );
			}
		}
	}
	
	/**
	 * Maps an existing user service to service icon
	 */
	this.mapUserServiceToIcon = function ( divId, userSvcObj )
	{
		userSvcObj.divId = divId;
	}
	
	/**
	 * Get userService object by divId (if exists), otherwise undefined
	 * obj format: {id:data.id, sconf:sConfig, divId:divId }
	 */
	function getUserServiceObj (divId)
	{
		for (i=0; i<userServiceList.length; i++ ) {
			if (divId == userServiceList[i].divId ) {
				return userServiceList[i]
			}
		}
		return undefined;
	}
	
	/**
	 * Get userService object by id (if exists), otherwise -1
	 * obj format: {id:data.id, sconf:sConfig, divId:divId }
	 */
	function getUserServiceIdx ( id )
	{
		for (i=0; i<userServiceList.length; i++ ) {
			if (id == userServiceList[i].id ) {
				return i;
			}
		}
		return -1;
	}
	
	/**
	 * Add to user service object list 
	 * obj format: {id:data.id, sconf:sConfig, divId:divId }
	 * 
	 * @param userSvcObj
	 */
	function addUserServiceObj (userSvcObj)
	{
		userServiceList.push (userSvcObj);
	}
	
	/**
	 * Save a new posting
	 * 
	 * form:
	 * { id:<postId>, 
	 *   msg:'', 
	 *   mediaIdList:array<files>, 
	 *   msgList:array, 
	 *   serviceId:id 
	 * };
	 * 
	 */
	this.savePosting = function ( formData, dataHandler, isUpdate )
	{
		if ( isUpdate == true )
			SA.server.putForm ("/rs/post", formData, postResult);
		else 
			SA.server.postForm ("/rs/post", formData, postResult);
		
		function postResult ( respStr )
		{
			var respObj = jQuery.parseJSON( respStr );
			if ( respObj.status == 'OK') {
				dataHandler ('OK', respObj.respData);
			}
			else {
				dataHandler (respObj.status, respObj.message );
			}
		}
	}
	
	/**
	 * Delete posting by id
	 */
	this.delPosting = function ( serviceId, postId, dataHandler )
	{
		if ( postId ) {
			SA.server.del ("/rs/post", {id:postId}, delResult );
			function delResult ( respStr )
			{
				var respObj = jQuery.parseJSON( respStr );
				if ( respObj.status == 'OK') {
					_clearFeedsCache ( serviceId );
					dataHandler ( 'OK', respObj.respData);
				}
			}
		}
	}
	
	/**
	 * Lookup data posting by Id 
	 */
	this.getPostingById = function ( serviceId, postId )
	{
		var feed = serviceFeedsCache [serviceId];
		if ( feed ) {
			var i;
			var data = feed.data;
			for ( i=0; i<data.length; i++  ) {
				if ( data[i].id == postId ) {
					return data[i];
				}
			}
		}
		return undefined;
	}
	
	/**
	 * Gets latest postings data feed per service (cache is 60 seconds)
	 */
	this.getLatestFeed = function ( serviceId, dataHandler )
	{
		var feed = serviceFeedsCache [serviceId];
		var nowSec = new Date().getTime() / 1000;
		
		if ( !feed || ((nowSec-feed.lastSec) > serviceFeedTTL) ) {
			if ( !feed ) {
				feed = {};
				serviceFeedsCache [serviceId] = feed;
			}
			SA.server.get("/rs/post", {serviceId:serviceId}, dataResult );
			//console.debug ( 'load data for serviceId: ' + serviceId);
			
			function dataResult ( respStr )
			{
				var respObj = jQuery.parseJSON( respStr );
				if ( respObj.status == 'OK') {
					var data = respObj.respData;
					feed.data = data;
					feed.lastSec = new Date().getTime() / 1000;
					dataHandler ('OK', data);
				}
				else {
					dataHandler (respObj.status, respObj.message );
				}
			}	
		}
		else {
			dataHandler ('OK', feed.data);
		}
	}
}



