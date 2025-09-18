/**
 * The App.Home list component. This component represents the "controller" for the home page. It has a 
 * reference to:
 * 
 *  1- Its "css" to define local css classes
 *  2- Its "flow" to define the view declaratively    
 *  3- Other Imperative code to control the behavior and action of the page
 *  
 */
App.Login = function ()
{
	/**
	 * The CSS class names are unique to this class. For example if another class has the name 'rounded'
	 * it would be a different name because the names are distinguished based on unique class component type id
	 * that are assigned automatically at object creation time. 
	 * CSS defined here exactly the same as css syntax but as javascript array of objects. Also
	 * 
	 */
	this.css = { items: 
		[
		]
	};
	
    var myId, myInst;
    
    var currentFormName = undefined;
    var currentFormComp = undefined;    
    var lastErrDivId = undefined;

	/**
	 * Login flow list
	 */
	var loginList = {name:'login-form', lc:'App.FormHandler', 
			 	config:{title:'Please Sign In', listener:this, pageStyle:true}, items: 
		 [
		 {html:'div', value:'Please Sign In', Style:'font-size:140%' },
		 {html:'div', style:'height:5px;'},		 
		 {name:'lgMsg', ac:'App.Message' },
		 {html:'div', style:'height:12px;'},
		 {name:'lgEmail', ac:'App.TextField', info:'Email address', required:true, pattern:'email',
			 config:{type:'email'} },
		 {name:'lgPassword', ac:'App.TextField', info:'Password', required:true, pattern:'text',
			 config:{type:'password'}},

		 {html:'div', style:'height:12px;'},
		  
		 {cmd:'cmdLogin', ac:'App.Button', label:'Sign me in', config:{theme:'color'} },
		 //{cmd:'cmdCancel', ac:'App.Button', label:'Cancel', config:{theme:'blank'} },

		 {html:'div', style:'height:25px;'},

		 {cmd:'cmdShowCreate', ac:'App.Button', label:'Create new account', 
			 config:{type:'link'}, style:'float:left;font-size:105%;margin-bottom:10px;' },
		 {cmd:'cmdShowForgot', ac:'App.Button', label:'Forgot password?', 
		     config:{type:'link'}, style:'float:right;font-size:105%;margin-bottom:10px;' }
	 	 ]
	};
	
   var forgotList = {name:'forgot-pass-form', lc:'App.FormHandler', 
			 	config:{title:'I Forgot my Password', listener:this, pageStyle:true}, items: 
		 [
		 {html:'div', value:'Forgot Your Password?', Style:'font-size:140%' },
		 {html:'div', style:'height:5px;'},		 		 
		 {name:'fgMsg', ac:'App.Message' },
		 {html:'div', style:'height:20px;'},
		  
		 {html:'p', value:'Enter your registered email address, and we will email you a reset password link:'},
		 {name:'lgEmail', ac:'App.TextField', info:'Email address', required:true, pattern:'email'},				 
	     {html:'div', style:'height:15px;'},
			 
	     {cmd:'cmdEmailPass', ac:'App.Button', label:'Email me link'},
		 //{cmd:'cmdCancel', ac:'App.Button', label:'Cancel', config:{theme:'blank'} },
		 {html:'div', style:'height:25px;'}
		 ]
	 };
	
	var createList = {name:'create-acct-form', lc:'App.FormHandler', 
		 	config:{title:'Create New Account', listener:this, pageStyle:true}, items: 
		 [
		 {html:'div', value:'Create New Account', Style:'font-size:140%' },
		 {html:'div', style:'height:5px;'},		 

		 {name:'crMsg', ac:'App.Message' },
		 {html:'div', style:'height:12px;'},
		  
		 {name:'crName', ac:'App.TextField', info:'Name: First Last ', 
			 required:true, pattern:'text' },

		 {name:'lgEmail', ac:'App.TextField', info:'Email address',
			 required:true, pattern:'email', config:{type:'email'} },
		 
		 {name:'crPassword', ac:'App.TextField', info:'Password', config:{type:'password'},
				 required:true, pattern:'text' },
			 
		 {html:'div', style:'height:10px;'},

		 {html:'div', style:'font-size:90%;', 
			 value:'By clicking "Create new account" below, you agree to ' + 
			 '<a style="font-size:110%" target="_blank" href="app/res/text/EULA.html" target="_blank">this End User License Agreement</a>'},

		 /*
		 {cmd:'cmdShowAgreement', ac:'App.Button', style:'font-size:85%',
			 label:'By clicking "Create new account" below you agree to <b>this License Agreement</b>', 
			 config:{type:'link'} },
		 */
		 
		 {html:'div', style:'height:10px;'},
		 
		 {cmd:'cmdCreateAcct', ac:'App.Button', label:'Create new account'},
		 
		 {html:'div', style:'height:20px;'},
		 
		 {cmd:'cmdShowLogin', ac:'App.Button', label:'I already have an account', 
			 style:'font-size:110%', config:{type:'link'} },
		 ]
	 };
	
	var resetPassForm = {name:'password-reset-form', lc:'App.FormHandler', 
		 	config:{title:'Reset Your Password', listener:this, pageStyle:true}, items: 
		 [
		 {html:'div', value:'Reset Password Form', Style:'font-size:140%' },
		 {html:'div', style:'height:5px;'},		 

		 {name:'lgrMsg', ac:'App.Message' },
		 {html:'div', style:'height:12px;'},
		 
		 {name:'passToken', ac:'App.Variable'},
		 
		 //{html:'div', style:'height:4px;'},
		 {name:'lgrPassword1', ac:'App.TextField', info:'New Password', required:true, pattern:'text',
			 config:{type:'password'}},
			 
		 {name:'lgrPassword2', ac:'App.TextField', info:'Re-type New Password', required:true, pattern:'text',
			 config:{type:'password'}},

		 {html:'div', style:'height:10px;'},
		  
		 {cmd:'cmdResetLogin', ac:'App.Button', label:'Save Password', config:{theme:'color'} },

		 {html:'div', style:'height:25px;'},
	 	 ]
	};

	/**
	 * This method creates the UI based on the lists provided
	 * 
	 * param name: imageUrl
	 * param name: ilists
	 */
	this.createUI = function ( parentList, config )
	{
		myId = this.compId;
		myInst = this;
		return '';
	}
	
	/**
	 * Gets the login UI
	 */
	this.getLoginUI = function ()
	{
		App.util.stopWorking();
		
		// show login dialog 
		var userName = SA.getAppData ( 'userName' );
		
		var html = showFormHtml ( loginList, userName, true );
		return '<div id="login-ui">' + html + '</div>';
	}
	
	/**
	 * Gets the login UI
	 */
	this.getResetPassUI = function ( token)
	{
		App.util.stopWorking();
		
		updateList ( resetPassForm, {passToken: token} );
		var html = showFormHtml ( resetPassForm, '', true );
		return '<div id="login-ui">' + html + '</div>';
	}
	
	/**
	 * Notify when form is submitted
	 */
	this.notifySubmit = function ( actionAtom, atomList, dataObj )
	{
		if ( actionAtom.cmd == 'cmdShowCreate' ) {
			var userName = SA.getAppData ( 'userName' );
			showFormHtml ( createList );			
		}
		else if ( actionAtom.cmd == 'cmdShowForgot' ) {
			var userName = SA.getAppData ( 'userName' );
			showFormHtml ( forgotList, userName );	
		}		
		else if ( actionAtom.cmd == 'cmdShowLogin' ) {
			var userName = SA.getAppData ( 'userName' );
			showFormHtml ( loginList, userName );			
		}
		else if ( actionAtom.cmd == 'cmdShowAgreement' ) {
			var ban = SA.lookupComponent ('banner');
			var comp = SA.createComponent ( 'ttf-frame', 'App.LinkFrame' );
		    var html = comp.createUI ('', {srcUrl:'app/res/text/EULA.html'} );
			ban.showSinglePage ( true, html );
		}
		else { 
			// Login command
			if ( actionAtom.cmd == 'cmdLogin' ) {
				lastErrDivId = 'lgMsg';
				if ( validate ( 'lgMsg', atomList, dataObj )  ) {
					var data = {};
					data.email = dataObj.lgEmail;
					data.authToken = dataObj.lgPassword;
					showWaiting ( true );
					var dm = SA.lookupComponent ('dataManager');
					dm.authLogin ( data, authResult );
				}
			}
			// Create Account command			
			else if ( actionAtom.cmd == 'cmdCreateAcct' ) {
				lastErrDivId = 'crMsg';				
				if ( validate ( 'crMsg', atomList, dataObj ) ) {
					var data = {};
					data.firstName = App.util.getName (dataObj.crName, true);
					data.lastName = App.util.getName (dataObj.crName, false);
					data.email = dataObj.lgEmail;
					data.authToken = dataObj.crPassword;
					showWaiting ( true );
					var dm = SA.lookupComponent ('dataManager');
					dm.authCreateAcct ( data, authResult );
				}		
			}
			// Change password command						
			else if ( actionAtom.cmd == 'cmdEmailPass' ) {
				lastErrDivId = 'fgMsg';
				if ( validate ( 'fgMsg', atomList, dataObj ) ) {
					var data = {};
					data.msg = "EMAIL-ME-RESET-PASSWORD";
					data.userId = dataObj.lgEmail;
					showWaiting ( true );
					var dm = SA.lookupComponent ('dataManager');
					dm.authEmailReset ( data, resetResult );
				}
			}	
			else if ( actionAtom.cmd == 'cmdResetLogin' ) {
				if ( validatePass ( 'lgrMsg', atomList, dataObj ) ) {
					var data = {};
					data.email = dataObj.passToken;
					data.authToken = dataObj.lgrPassword1;
					data.resetPassword = "true";
					showWaiting ( true );
					SA.server.set ("/rs/user", data, postResetSuccess);
				}
			}			
		}
	}
	
	/**
	 * Logging out user
	 */
	this.logoutUser = function ()
	{
		SA.deleteUserAuth();
	}
	
	/**
	 * Enable / disable form wait
	 */
	function showWaiting ( isWaiting )
	{
		if ( isWaiting == true ) {
			currentFormComp = SA.lookupComponent (currentFormName);
			currentFormComp.setWaiting ( true );
		}
		else {
			currentFormComp.setWaiting ( false );
		}
	}

	/**
	 * Show new form html
	 */
	function showFormHtml ( renderList, userName, retHtml )
	{
		// TODO: Need to pre-load username in list to show
		if ( userName ) {
			updateList (renderList, {lgEmail:userName} );
		}
		currentFormName = renderList.name;
		var html =  SA.createUI ( myId, renderList );
		
		if ( retHtml == true )
			return html;
		else 
			$('#login-ui').html ( html );
	}
	
	/*
	 * Password reset successful post result 
	 */
	function updateList ( listObj, dataObj )
	{
		App.util.mergeList ( listObj, dataObj );
	}
	
	/*
	 * Password reset successful post result 
	 */
	function resetResult ( respStr )
	{
		showMessage ( lastErrDivId, "An email has been sent to the address below", true);
		showWaiting ( false );
	}
	
	/*
	 * Validate login form
	 */
	function validate ( divId, atomList, data )
	{
		var msg = SA.validate.evalObj(atomList, data);
		if ( msg != '' ) {
			showMessage ( divId, msg, false );
			return false;
		}
		else if (data.crPassword && data.crPassword.length<6 ) {
			showMessage ( divId, "Password too short, minimum 6 characters!", false );			
			return false;
		}
		else {
			$( '#'+divId ).html ( "" );
			ret = true;
		}
		return true;
	}
	
	/*
	 * Validate password (used for reset pass)
	 */
	function validatePass ( divId, atomList, data )
	{
		var msg = SA.validate.evalObj(atomList, data);
		if ( msg != '' ) {
			showMessage ( divId, msg, false );
			return false;
		}
		else if ( data.lgrPassword1 != data.lgrPassword2 ) {
			showMessage ( divId, "Passwords do not match!", false );	
			return false;
		}
		else if ( data.lgrPassword1.length < 6 ) {
			showMessage ( divId, "Password too short, minimum 6 characters!", false );	
			return false;
		}
		return true;
	}
	
	/*
	 * Reset password result  
	 */
	function postResetSuccess ( result )
	{
		var respObj = jQuery.parseJSON( result );
		if ( respObj.status == 'OK') {
			$('#login-ui').html ( '<div style="font-size:115%;padding:10px;">You password has been reset successfully! <br><br>Please go to the Local5 app and Sign In with your new password.</div>' );
			//showMessage ( 'lgrMsg', "Reset Successful. Go to the app and Sign In", true );			
		}
		else {
			$('#login-ui').html ( '<h2 style="font-size:115%;padding:10px;">You password reset has failed! <br><br>Please try the reset again from the Local5 app.</div>' );			
			//showMessage ( 'lgrMsg', "Reset Password Failed" );						
		}
		// close current dialog
		showWaiting ( false );
	}
	
	/*
	 * successful postSuccess to server
	 */
	function authResult ( status, respObj )
	{
		// login success
		if ( status == 'OK') {
			showMessage ( lastErrDivId, "Successful", true);
			
			// close current dialog
			showWaiting ( false );
			
			// postSignIn: fire postSignIn event to home
			//SA.fireEvent('home', {cmd:'postSignIn'} );
			var homeComp = SA.lookupComponent ( 'home' );
			homeComp.handleEvent ( {cmd:'postSignIn'} );
		}
		else {
			if ( respObj.error == 'USERNAME_EXISTS' ) {
				showMessage ( lastErrDivId, "Username already exists!", false);
			}
			else {
				showMessage ( lastErrDivId, "Authentication failure!", false);
			}
			showWaiting ( false );
		}
	}
	
	/**
	 * Show auth result message
	 */
	function showMessage ( name, msg, success )
	{
		var msgComp = SA.comps.getCompByName ( name );
		msgComp.showMessage ( msg, success );
	}
}

