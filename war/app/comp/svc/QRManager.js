/**
 * The App.Home list component. This component represents the "controller" for the home page. It has a 
 * reference to:
 */
App.QRManager = function ()
{
	// Other variables
	var myInst, myId ;	
	var initialized = false;
	var currentDlg;
	
	var mleft = $(window).width()/2 - 65;
	
	/**
	 * Login flow list
	 */
	var flowList = { items: 
		[
		{name:'svc-qr-dlg', lc:'App.Dialog', config:{pageStyle:false}, items:
			 [
			 {name:'svc-qr-form', lc:'App.FormHandler', style:'text-align:center',
				 	config:{title:'', listener:this, fitHeight:true}, items:   
				 [
				 {name:'qrMsg', ac:'App.Message' },
				 {html:'div', style:'height:50px;'},
				 
				 {html:'div', style:'text-align:center;font-size:100%;margin-bottom:5px;color:green', 
					 value:'As a provider scan your customer code below..'},
				 {cmd:'cmdQRScan', ac:'App.Button', label:'Scan Code', style:'margin-left:'+mleft+'px', 
					 config:{theme:'blank',defButton:true}},

				 {html:'div', style:'height:30px;'},

				 {html:'div', style:'text-align:center;font-size:100%;margin-bottom:5px;color:green', 
					 value:'Your information and QR code are shown below..'},
				 {html:'div', name:'qrName', style:'text-align:center;font-size:120%', value:'Your Name'},
				 {html:'div', name:'qrEmail', style:'text-align:center;font-size:110%', value:'youremail@host.com'},

				 {html:'div', style:'height:20px;'},

				 {div:'html', id:'qrCode', 
					 value:'<img style="width:80%;margin-left:20px;" src="app/res/gallery/qr-sample.png"/>' },
				 
				 {html:'div', style:'height:20px;'},

				 {cmd:'cmdQRCancel', ac:'App.Button', label:'Close', style:'margin-left:'+(mleft+10)+'px', 
					 config:{theme:'color'} },
					 
				 {html:'div', style:'text-align:center;font-size:100%;margin-bottom:5px;margin-top:15px;color:brown', 
						 value:'Note: in this release, this form is not functional yet!'},
						 
				 {html:'div', style:'height:5px;'}
				 ]
			 }
			 ]
		}
		]
	};
	
	/**
	 * This method creates the UI based on the lists provided
	 */
	this.createUI = function ( parentList, config )
	{
		myId = this.compId;
		myInst = this;
		
		if ( !initialized ) {
			SA.createUI ( myId, flowList );
			initialized = true;
		}
	}
	
	/**
	 * Show a dialog with name
	 */
	this.showDialog = function ()
	{
		var auth = SA.getUserAuth().respData;
		var obj = {};
		obj.qrName = auth.firstName + ' ' + auth.lastName;
		obj.qrEmail = auth.email;
		showDlg ( 'My QR Code', 'svc-qr-dlg', obj );
	}
	
	/**
	 * Notify when form is submitted
	 */
	this.notifySubmit = function ( actionAtom, atomList, dataObj )
	{
		if ( actionAtom.cmd == 'cmdSSAdd' ) {
		}
		else if ( actionAtom.cmd == 'cmdQRCancel' ) {
			currentDlg.showDialog (false);
		}
	}
	
	/*
	 * internal showDlg helper
	 */
	function showDlg ( title, newDlgName, newForm )
	{
		currentDlgName = newDlgName;
		currentDlg = SA.lookupComponent ( currentDlgName );
		if ( currentDlg ) {
			if ( newForm )
				currentDlg.updateForm ( newForm );
			currentDlg.showDialog (true, title );
		}
	}	

	/**
	 * Called when clicking on action buttons
	 */
	this.performAction = function ( compId, atomObj )
	{
		// update form list with data before showing the dialog
		var formComp = SA.lookupComponent ('svc-qr-form');
		
		// for edit user listId and cardId
		if ( atomObj.cmd == 'edit' ) {

		}
		else { // new 
		
		}
	}

	/**
	 * Called to handle events specific for this component
	 */
	this.handleEvent = function ( event )
	{
		if ( event.cmd == 'showLatest' ) {
			
		}
	}
	
	/**
	 * After component is loaded in page  
	 */
	this.postLoad = function ()
	{	
		$( '.list-group-item' ).hammer().bind("tap", function(event) {
			var id = $(this).attr('id');
			var idx = id.substring (id.indexOf ('-')+1);
			
			// Notify that new service will be added to MappList
			var sconf = curSvcLatestConf[idx];			
			curMappComp.actionPerformed ( {cmd:'svcAdded', config:sconf, svcDivId:curSvcDivId} );
			
			currentDlg.showDialog (false);
		});
		
		$( '#ssCancel' ).hammer().bind("tap", function(event) {
			console.debug ('cancel' );
		});
	}
}
