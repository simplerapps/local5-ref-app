/**
 * BannertHandler Object  
 */
App.Feedback = function ()
{
	var mleft = $(window).width()/2 - 140;
	
	/**
	 * Login flow list
	 */
	var flowList = { items: 
		[
		{name:'feedback-dlg', lc:'App.Dialog', config:{small:true}, items:
			 [
			 {name:'feedback-form', lc:'App.FormHandler', 
				 	config:{title:'', listener:this}, items:   
				 [
				 {html:'div', style:'height:25px;'},
				 {html:'div', style:'font-size:115%', value:'Please send us your feedback or complaint and we will email you back. <b>We appreciate your feedback and your business!</b>'},				  
				  
				 {name:'relItemId', ac:'App.Variable'},

				 {html:'div', style:'height:5px;'},  
				 {name:'feedMsg', ac:'App.Message' },
				 {html:'div', style:'height:12px;'},  
				 
				 {name:'feedText', ac:'App.TextArea', info:'Please type your message here..', 
					 required:true, pattern:'text', config:{rows:3} },
				 
				 {html:'div', style:'height:10px;'},

				 {cmd:'cmdPostFeed', ac:'App.Button', label:'Send Feedback', config:{theme:'color',defButton:true},
					 style:'margin-right:10px;margin-left:'+mleft+'px'},
				 {cmd:'cmdCancelFeed', ac:'App.Button', label:'Cancel', config:{theme:'blank'} },

				 {html:'div', style:'height:10px;'},
				 ]
			 }
			 ]
		}
		]
	};
	
	var myId, myInst;
	var curListId;
	var currentDlg;
	var initialized = false;
	
	/**
	 * This method creates the UI based on the lists provided
	 */  
	this.createUI = function ( list, allConfig )
	{
		myId = this.compId;
		myInst = this;
	}
	
	/**
	 * Show feedback dialog
	 */
	this.showFeedbackDlg = function ( listId )
	{
		if ( !initialized ) {
			initialized = true;
			SA.createUI (myId, flowList);
		}		
		curListId = listId;
		showDialog ( 'feedback-dlg', {} );
	}
	
	/**
	 * Action performed by button clicks
	 */
	this.performAction = function ( shareActionName )
	{
		//console.debug ( 'action perf: ' + event );
		if ( listener && listener.actionPerformed ) {
			listener.actionPerformed ( {cmd:shareActionName})
		}
	}
	
	/**
	 * Notify when form is submitted
	 */
	this.notifySubmit = function ( action, atomList, dataObj )
	{
		if ( action.cmd == 'cmdPostFeed' ) {
			if ( validate ( 'feedMsg', atomList, dataObj ) ) {
				var form = new FormData();
				form.append ( 'msg', App.util.safeHtml(dataObj.feedText) );
				form.append ( 'relItemId', curListId );
				currentDlg.setWaiting (true);
				SA.server.postForm ("/rs/feedback", form, postFBSuccess);
			}
		}
		else if ( action.cmd == 'cmdCancelFeed' ) {
			// hide dialog
			hideDialogFeedback ();
		}
	}
	
	/**
	 * Post success
	 */
	function postFBSuccess (respStr)
	{
		// hide dialog
		hideDialogFeedback ();
	}
	
	/**
	 * validation 
	 */
	function validate ( divId, atomList, data )
	{
		var msg = SA.validate.evalObj(atomList, data);
		if ( msg != '' ) {
			showMessage ( divId, 'Message cannot be empty!', false );
			return false;
		}
		return true;
	}
	
	/*
	 * Shows a messaage 
	 */
	function showMessage ( name, msg, success )
	{
		var msgComp = SA.lookupComponent ( name );
		msgComp.showMessage ( msg, success );
	}
	
	/*
	 * Show a dialog with name
	 */
	function showDialog ( dialogName, newForm )
	{
		currentDlg = SA.lookupComponent ( dialogName );
		if ( currentDlg ) {
			if ( newForm )
				currentDlg.updateForm ( newForm );
			currentDlg.showDialog (true );
		}
		return currentDlg;
	}
	
	function hideDialogFeedback ()
	{
		currentDlg.setWaiting (false);
		currentDlg.showDialog (false );
	}
};
