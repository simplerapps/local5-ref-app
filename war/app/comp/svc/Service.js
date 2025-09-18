/**
 * The App.Home list component. This component represents the "controller" for the home page. It has a 
 * reference to:
 */
App.Service = function ()
{
	// Other variables
	var myInst = undefined;
	var myId = undefined;
	var svcConfig  = undefined;
	
	/**
	 * This method creates the UI based on the lists provided
	 * 
	 * config:
	 * 
	 * iconUrl: iconUrl 
	 * iconBG: icon background color
	 * title: service title
	 * titleColor: title color
	 * address: address street address
	 * city: city
	 * state: state
	 * userId: ownerId
	 * 
	 */
	this.createUI = function ( list, config )
	{
		myId = this.compId;
		myInst = this;
		
		svcConfig = list.config;
	}
	
	/**
	 * Create title html from config
	 */
	this.titleHtml = function ( sConf )
	{
		return getTitleHtml ( sConf );
	}
	
	/**
	 * Sets icon html in service icon div
	 */
	this.setIconUI = function ( divId, sConf, numAlerts )
	{
		var iconUrl = empty(sConf.iconUrl)? '' : sConf.iconUrl  ;
		var iconBG = empty(sConf.iconBG)? '#f9f9f9' : sConf.iconBG ;
		var ret = '';
		
		var iconWidth = $('#'+divId).width();
		
		if ( empty(sConf.iconUrl) ) {
			ret = getTitleHtml ( sConf, true );	
		}
		else {
			var tihtml = getIconTitle (sConf, iconBG, iconWidth);
			var mediaUrl = SA.server.getMediaUrl (iconUrl);
			var badgeHtml = '';
			if ( numAlerts && numAlerts>0 ) {
				badgeHtml = '<div style="background-color:rgb(255,128,64);position:absolute;margin-top:-10px;font-size:90%" class="badge">'+
				numAlerts+'</div>';
			}
			ret = '<div style="margin-top:5px;margin-left:1px;">'+ badgeHtml + 
				'<img style="width:99%" src="' + mediaUrl + '" />' + tihtml + '</div>' ;
		}
		// use alg to figure out border based on background
		var bordCol = App.util.colorLuminance (iconBG, -0.08);
		
		$svcId = $('#'+divId);
		$svcId.css ( 'background-color', iconBG );
		$svcId.css ( 'border-style', 'solid' );
		$svcId.css ( 'border-color', bordCol );
		
		$svcId.html ( ret );
	}
	
	/*
	 * getTitleHtml formatted 
	 */
	function getIconTitle ( sConf, bgcol, iconWidth )
	{
		var tit = empty(sConf.title)?  'no title': sConf.title ;
		var tco = empty(sConf.titleColor)? '#404040': sConf.titleColor ;
		var add = empty(sConf.address)? 'no address' : sConf.address ; 
		var city = empty(sConf.city)? 'no city' : sConf.city ; 
		//var bg = empty(sConf.titleBG)? bgcol : sConf.titleBG;
		var bg = bgcol;
		
		var lcol = App.util.colorLuminance (bg, 0.1);
		
		var ret = '<div style="font-size:85%;text-align:center;border-top:1px solid '+lcol+';color:'+
			tco+';margin-bottom:2px;background-color:'+bg+'"><div style="margin-top:8px">'+ 
			tit + '</div></div>';
		return ret;
	}

	/*
	 * getTitleHtml formatted 
	 */
	function getTitleHtml ( sConf, forIcon )
	{
		var tit = empty(sConf.title)?  'no title': App.util.safeHtml (sConf.title );
		//var tco = empty(sConf.titleColor)? '#404040': sConf.titleColor ;
		var tco = 'brown';
		var add = empty(sConf.address)? 'no address' : sConf.address ; 
		var city = empty(sConf.city)? 'no city' : sConf.city ;
		
		if ( forIcon == true ) {
			var r1 = '<div style="padding:10px"><div style="color:'+tco+';font-size:110%;padding-bottom:10px;"><b>'+ 
			tit +'</b></div><div class="list-group-item-text">'+add+', ' + city +'</div></div>';
			return r1;
		}
		var ret = '<div style="color:'+tco+';margin-bottom:2px;"><b>'+ 
			tit +'</b></div><div class="list-group-item-text">'+add+', ' + city +'</div>';
		return ret;
	}
	
	/*
	 * Return true if value is empty
	 */
	function empty (val)
	{
		if ( !val || val.length==0 )
			return true;
		return false;
	}
	
	/**
	 * Gets icon URL
	 */
	this.getConfig = function ()
	{
		return svcConfig;
	}
	
	/**
	 * After compoent is loaded in page  
	 */
	this.postLoad = function ()
	{	
	}
}
