
/**
 * Display card of information
 */
App.util = function ()
{
	/**
	 * Change color Luminance value
	 * 
	 * Examples:
	 * ColorLuminance("#69c", 0);		// returns "#6699cc"
	 * ColorLuminance("6699CC", 0.2);	// "#7ab8f5" - 20% lighter
	 * ColorLuminance("69C", -0.5);		// "#334d66" - 50% darker
	 * ColorLuminance("000", 1);		// "#000000" - true black cannot be made lighter!
	 */
	this.colorLuminance = function (hex, lumPer) 
	{
		// validate hex string
		hex = String(hex).replace(/[^0-9a-f]/gi, '');
		if (hex.length < 6) {
			hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
		}
		lumPer = lumPer || 0;

		// convert to decimal and change luminosity
		var rgb = "#", c, i;
		for (i = 0; i < 3; i++) {
			c = parseInt(hex.substr(i*2,2), 16);
			c = Math.round(Math.min(Math.max(0, c + (c * lumPer)), 255)).toString(16);
			rgb += ("00"+c).substr(c.length);
		}

		return rgb;
	}
	
	/**
	 * Find an item in list
	 */
	this.getListItem = function ( name, listObj)
	{
		var items = listObj.items;
		if ( items && items.length>0 ) {
			var i;
			for ( i=0; i<items.length; i++ ) {
				if ( name == items[i].name )
					return items[i];
			}
		}
	}
	
	/**
	 * Merges a list object with data object
	 */
	this.mergeList = function ( listObj, dataObj ) 
	{
		var items = listObj.items;
		if ( items && items.length > 0 ) {
			
			var j = 0;
			for ( j=0; j<items.length; j++ ) {
				var obj = items [j];
				
				// if atom
				if ( obj.name ) {
					var val = dataObj [ obj.name ];
					if ( val && val!='~nv') {
						obj.value = val;
					}
					else {
						obj.value = '';
					}
				}
			}
		}
	}
	
	/**
	 * Gets user group id
	 */
	this.getGroupId = function ()
	{
		var auth = SA.getUserAuth ().respData;
		return auth.groupId;
	}
	
	/**
	 * Get userId from logged in auth object
	 */
	this.getUserId = function ()
	{
		var auth = SA.getUserAuth ().respData;
		return auth.email;
	}
	
	/**
	 * Return true if can admin service
	 */
	this.canAdminSvc = function ( serviceId, groupId )
	{
		var canAdmin = false;
		
		var auth = SA.getUserAuth ().respData;
		
		// all members of Participation group can admin services for the group
		if ( groupId && auth.groupId && groupId==auth.groupId ) {
			canAdmin = true;
		}
		else {
			var svcList = auth.adminSvcs;
			if ( svcList == 'SUPER-USER' )
				canAdmin = true;
			else 
				canAdmin = svcList.indexOf ( serviceId ) >= 0;
		}
		return canAdmin;
	}
	
	/**
	 * Allow admin for service id (because it was just added by me)
	 */
	this.canAdminSvcAllow = function ( serviceId )
	{
		var auth = SA.getUserAuth ();
		var svcList = auth.respData.adminSvcs;
		if ( svcList.indexOf ( serviceId ) < 0 ) {
			auth.respData.adminSvcs += ',' + serviceId;
		} 
		SA.setUserAuth ( auth );
	}
	
	/**
	 * Open url in new window
	 */
	this.openUrlInWindow = function ( url )
	{
		window.open(url,'_system');
	}
	
	/**
	 * Return true if URL is TTF image URL
	 */
	this.isImageUrl = function ( url )
	{
		return url.indexOf ( '/media/' ) > 0;
	}

	/**
	 * Get friendly time
	 */
	this.getFriendlyTime = function ( timeMs )
	{
		var timeNowMs = new Date().getTime();
		var diffSec = (timeNowMs - timeMs) / 1000;
		if ( diffSec < 60 ) {
			return Math.round(diffSec) + ' seconds ago';
		}
		else if ( diffSec < 3600 ) {
			return Math.round(diffSec/60) + ' minutes ago';
		}
		else if ( diffSec < 86400 ) {
			return Math.round(diffSec/3600) + ' hours ago';
		}
		else if ( diffSec < 604800 ) {
			return Math.round(diffSec/86400) + ' days ago';
		}
		else {
			return Math.round(diffSec/604800) + ' weeks ago';
		}
	}
	
	/**
	 * Gets user name info for logged in user
	 */
	this.getMyNameInfo = function ()
	{
		var auth = SA.getUserAuth ();
		var name = '';
		
		if (auth ) {
			auth = auth.respData;
			if (auth.firstName) {
				name += auth.firstName;
				if ( auth.lastName ) {
					name += ' ' + auth.lastName;
				}
			}
			if ( name.length < 3 ) {
				var idx = auth.email.indexOf ('@');
				if (idx > 0 ) {
					name = auth.email.stubstring (0, idx);
				}
			}
		}
		return name;
	}
	
	/**
	 * Return true if running as mobile app
	 */
	this.isMobileApp = function ()
	{
		var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
		if ( app ) {
			return true;
		} else {
		    return false;
		}  
	}
	
	/**
	 * Get media URL
	 */
	this.getMediaUrl = function ( imgIdOrUrl )
	{
		if ( imgIdOrUrl.indexOf( 'http' ) == -1 ) {
			return SA.server.getMediaUrl ( imgIdOrUrl );
		} 
		return imgIdOrUrl;
	}
	
	/**
	 * Strip tags from input string
	 */
	this.safeHtml = function (input) 
	{
		var strippedText = undefined;
		if ( input ) {
			strippedText = input.replace(/<\/?[^>]+(>|$)/g, "");
		}
		return strippedText;
	}
	
	/**
	 * Parse name from First Last name string (cap first letter of name)  
	 */
	this.getName = function ( name, isFirst )
	{
		var idx = name.indexOf ( ' ' );
		var ret = name;
		if ( isFirst == true ) {
			if (idx > 0 )  {
				ret = name.substring (0, idx);
			}
		}
		else {
			ret = '';
			if ( idx > 0 ) { 
				ret = name.substring (idx);
			}
		}
		ret = ret.trim ();
		if ( ret.length > 0 ) {
			return ret[0].toUpperCase() + ret.substr(1);
		}
		return ret;
	}

	/**
	 * Get main component
	 */
	this.getMainComp = function ()
	{
		var main = SA.lookupComponent ( '_main' );
		return main;
	}

	/**
	 * Start loading 
	 */
	this.startWorking = function ()
	{
		var load = SA.lookupComponent ('loading');
		load.start();
	}
	
	/**
	 * Start loading 
	 */
	this.stopWorking = function ()
	{
		var load = SA.lookupComponent ('loading');
		load.stop();
	}
	
	//// User Data Object
	var userDataObj = undefined;
	
	/**
	 * Return user data object
	 */
	this.getUserData = function ()
	{
		if ( !userDataObj ) {
			userDataObj = SA.getAppData ( 'userDataObj' );
			if ( !userDataObj ) {
				userDataObj = {};
			}
			else {
				userDataObj = jQuery.parseJSON( userDataObj );
			}
		}
		return userDataObj;
	}
	
	/**
	 * Set new value for user data object
	 */
	this.setUserDeviceId = function ( deviceId )
	{
		userDataObj ['deviceId'] = deviceId;
		SA.setAppData ( 'userDataObj', JSON.stringify (userDataObj) );
	}
	
	/**
	 * Increment badge nunber for service id (if inc==false, clear)
	 */
	this.setUserBadge = function ( serviceId, inc )
	{
		App.util.getUserData();
		if (inc == true ) {
			var num = userDataObj [serviceId];
			if ( !num )
				num = 1;
			else 
				num++;
			userDataObj [serviceId] = num;
		}
		else {
			userDataObj [serviceId] = 0;
		}
		SA.setAppData ( 'userDataObj', JSON.stringify (userDataObj) );
	}
	
	/**
	 * Clear user data object
	 */
	this.delUserData = function ()
	{
		SA.deleteAppData ( 'userDataObj' );
		userDataObj = undefined;
	}
		
}

App.util = new App.util();
