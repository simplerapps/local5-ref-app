/**
 * The App.Home list component. This component represents the "controller" for the home page. It has a 
 * reference to:
 */
App.UserAdmin = function ()
{
	// Other variables
	var myInst = undefined;
	var myId = undefined;
	var currentDlg = undefined;
	var curSvcDivId, curSvcLatestConf, curMappComp;
	var serviceComp = undefined;
	
	var initialized = false;
	
	/**
	 * Service flow list
	 */
	var myAcctList = {name:'create-acct-form', lc:'App.FormHandler', 
		 	config:{title:'Create New Account', listener:this, pageStyle:true}, items: 
		 [
		 {name:'changeAcctMsg', ac:'App.Message' },
		 {html:'div', style:'height:5px' },
		  
		 // 1: Change name
		 {html:'div', value:'Change Name:', Style:'font-size:120%' },
		 {html:'div', style:'height:5px;'},

		 {name:'personalName', value:'', ac:'App.TextField', 
			 info:'Name: First Last', pattern:'text', required:true },

		 {html:'div', style:'height:15px;'},		 
		 {html:'div', style:'width:100%;height:10px;border-top:solid silver 1px;'},
		 {html:'div', style:'height:10px;'},
		 
		 // 2: Security info
		 {html:'div', name:'loginEmail', value:'', style:'font-size:100%'},
		 {html:'div', style:'height:5px;'},

		 {html:'div', value:'Change Password:', Style:'font-size:120%;margin-top:10px' },
		 {html:'div', style:'height:5px;'},
		 
		 {name:'oldPass', ac:'App.TextField', info:'Old Password', config:{type:'password'},
				 required:false, pattern:'text' },
		 {name:'newPass', ac:'App.TextField', info:'New Password', config:{type:'password'},
			 required:false, pattern:'text' },
			 
		 {html:'div', style:'height:5px;'},

		 {html:'div', style:'border-top:solid silver 1px;padding-top:10px', 
			 value:'<a target="_blank" href="app/res/text/EULA.html">View End User License Agreement..</a>'},
		 
		 {html:'div', style:'height:10px;'},
		 {html:'div', style:'width:100%;height:10px;border-top:solid silver 1px;'},
		 
		 // 3: Participation Group
		 {html:'div', value:'Participation Group:', Style:'font-size:120%;margin-top:10px' },
		 {html:'div', style:'height:5px;'},
		 {name:'groupName', ac:'App.TextField', info:'Enter Group Name (optional)',  config:{type:'password'},
			 required:false, pattern:'text' },
			 
		 {html:'div', style:'font-size:75%', 
				 value:'Allows members to join the private group. You need to sign out and back in to be part of the group.'},
				 		 		 
		 {html:'div', style:'height:20px;'},
		 {cmd:'cmdSaveMyAccount', ac:'App.Button', label:'Save Changes'}		 
		 ]
	 };
	
	/**
	 * This method creates the UI based on the lists provided
	 * 
	 * config:
	 * qstr: query string
	 */
	this.createUI = function ( parentList, config )
	{
		myId = this.compId;
		myInst = this;
	}
	
	/**
	 * Create and return admin UI
	 */
	this.getAdminUI = function ()
	{
		var obj = {}
		var auth = SA.getUserAuth().respData;
		
		obj.personalName = auth.firstName + ' ' + auth.lastName;
		obj.loginEmail = 'User Id: ' + auth.email;
		obj.groupName = auth.groupId;
		App.util.mergeList ( myAcctList, obj);
		
		var html = '<div id="' + myId + '" style="background-color:white">' + 
					SA.createUI ( myId, myAcctList) + '</div>';
 		return html;
	}
	
	/**
	 * Notify when form is submitted
	 */
	this.notifySubmit = function ( actionAtom, atomList, dataObj )
	{
		// NOTE: ABsolete code NOT USED!!
		if ( actionAtom.cmd == 'cmdShowAgreement' ) {
			var ban = SA.lookupComponent ('banner');
			var comp = SA.createComponent ( 'ttf-frame', 'App.LinkFrame' );
		    var html = comp.createUI ('', {srcUrl:'app/res/text/EULA.html'} );
		    // TODO: banner.showSinglePage() is no longer used 
			ban.showSinglePage ( true, html );
		}
		else if ( actionAtom.cmd == 'cmdSaveMyAccount' ) {
			if ( validate ('changeAcctMsg', dataObj ) == true ) { 
				var form = getForm ( dataObj );
				SA.server.postForm ("/rs/admin", form, postSuccess);
			}
		}
	}
	
	/*
	 * Success after adding service 
	 */
	function postSuccess ( respStr )
	{
		var respObj = jQuery.parseJSON( respStr );
		if ( respObj.status == 'OK') {
			showMessage ( 'changeAcctMsg', 'Changes Saved Successfully', true );
			
			updateSessionInfo ( respObj.respData );
			
			// go back to main page
			var banner = SA.lookupComponent ( 'banner' );
			banner.showPrev ();
		}
		else {
			showMessage ( 'changeAcctMsg', respObj.message, false );
		}
	}
	
	/**
	 * Update changes in session
	 */
	function updateSessionInfo ( respData )
	{
		if ( respData ) {
			var userAuth = SA.getUserAuth();
			var authObj = userAuth.respData;
			if ( respData.loginToken && respData.loginToken.length>0 ) {
				authObj.loginToken = respData.loginToken;
			}
			if ( respData.firstName && respData.firstName.length>0 ) {
				authObj.firstName = respData.firstName;
				authObj.lastName = respData.lastName;
			}
			authObj.groupId = respData.groupId;
			SA.setUserAuth ( userAuth );
		}
	}
	
	/*
	 * Validate login form
	 */
	function validate ( divId, data )
	{
		if ( isEmpty(data.personalName) ) {
			showMessage ( divId, '"Name: First Last" cannot be empty!', false );			
			return false;	
		}
		
		if ( !isEmpty(data.oldPass) && isEmpty(data.newPass) ) {
			showMessage ( divId, "Invalid old password", false );			
			return false;	
		}
		
		if ( !isEmpty(data.newPass) ) {
			if (  data.newPass.length < 6 ) {
				showMessage ( divId, "New password too short, minimum 6 characters!", false );			
				return false;
			}
			if ( isEmpty(data.oldPass) || data.oldPass.length < 6  ) {
				showMessage ( divId, "Invalid old password", false );			
				return false;				
			}
		}
		else {
			$( '#'+divId ).html ( "" );
			ret = true;
		}
		return true;
	}
	
	/*
	 * showMessage
	 */
	function showMessage ( name, msg, success )
	{
		var msgComp = SA.comps.getCompByName ( name );
		msgComp.showMessage ( msg, success );
	}

	/*
	 * Convert object to form
	 */
	function getForm ( obj ) 
	{
		var form = new FormData();
		
		if ( !isEmpty(obj.personalName) ) { 
			form.append ( 'firstName', App.util.getName( obj.personalName, true) );
			form.append ( 'lastName', App.util.getName( obj.personalName, false) );			
		}
		
		if ( !isEmpty(obj.groupName) ) 
			form.append ( 'groupName', obj.groupName );		
		else 
			form.append ( 'groupName', '' );	
		
		if ( !isEmpty(obj.oldPass) ) {
			form.append ( 'oldPass', obj.oldPass);
			form.append ( 'newPass', obj.newPass);
		}
		return form;
	}
	
	/**
	 * Return true if field is empty
	 */
	function isEmpty ( field )
	{
		return !field || field.length==0;
	}
	
	/**
	 * After compoent is loaded in page  
	 */
	this.postLoad = function ()
	{
	}
}
