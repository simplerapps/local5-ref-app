/**
 * The App.Home list component. This component represents the "controller" for the home page. It has a 
 * reference to:
 */
App.SvcSearch = function ()
{
	// Other variables
	var myInst = undefined;
	var myId = undefined;
	var currentDlg = undefined;
	var curSvcDivId, curSvcLatestConf, serviceListener;
	var serviceComp = undefined;	
	var initialized = false;
	var myServices = false;
	
	var mleft = $(window).width()/2 - 60;
	var sheight = ($(window).height() - 150) + 'px';
	var svheight = ($(window).height() - 230) + 'px';	
	
	/**
	 * Login flow list
	 */
	var flowList = { items: 
		[
		{name:'svc-find-dlg', lc:'App.Dialog', config:{pageStyle:false}, items:
			 [
			 {name:'svc-find-form', lc:'App.FormHandler', 
				 	config:{title:'', listener:this, fitHeight:true}, items:   
				 [
				 {name:'ssDivId', ac:'App.Variable'},
				 {html:'div', name:'svc-find-title', style:'text-align:center;font-size:135%;margin-top:30px;margin-bottom:5px;', 
					 value:'Add a New Business' }, 
				 
				 {name:'ssMsg', ac:'App.Message' },
				 {html:'div', style:'height:5px;'},				 
				 
				 {html:'div', id:'ssSearchBlock', items:
					 [
					 /*
					 {name:'ssSearch', ac:'App.TextField', info:'Search for Service or Business', 
						 required:true, pattern:'text' },
				     */
					 {id:'svc-find-desc', html:'div', style:'font-size:90%;margin-bottom:2px;color:gray', 
						 value:' Click on a business below to add:' }, 					  
					 ]},
				 
				 {html:'div', id:'ssCont', style:'overflow-y:scroll;-webkit-overflow-scrolling:touch;height:'+sheight, items:
					 [
					 {html:'div', id:'ssResult' }
					 ]
				 },
				 {html:'div', style:'height:10px;'},

				 {name:'cmdSSCancel', cmd:'cmdSSCancel', ac:'App.Button', label:'Cancel', style:'margin-right:15px;margin-left:'+mleft+'px', 
					 config:{theme:'color'} },
				 {name:'cmdSSAdd', cmd:'cmdSSAdd', ac:'App.Button', label:'Add New', style:'display:none', 
						 config:{theme:'blank'} }
				 ]
			 }
			 ]
		}
		]
	};
	
	/**
	 * This method creates the UI based on the lists provided
	 * 
	 */
	this.createUI = function ( parentList, config )
	{
		myId = this.compId;
		myInst = this;
		serviceComp = SA.createComponent ( 'service', 'App.Service' );
	}
	
	/**
	 * Search for existing services
	 */
	this.showDialog = function ( newTitle, ssDivId, mappComp )
	{
		if ( !initialized ) {
			SA.createUI ( myId, flowList );
			initialized = true;
		}
		curSvcDivId = ssDivId;
		serviceListener = mappComp;
		myServices = false;
		showDlg ( newTitle, 'svc-find-dlg', 
				{ssDivId:ssDivId, 'svc-find-title':'Add a New Business'} );
		SA.fireEvent ( myId, {cmd:'showLatest'} );
	}
	
	/**
	 * Dialog to pick services owned by logged in user
	 */
	this.showForSignedIn = function ( newTitle, listenerComp )
	{
		if ( !initialized ) {
			SA.createUI ( myId, flowList );
			initialized = true;
		}
		curSvcDivId = '';
		serviceListener = listenerComp;
		myServices = true;
		showDlg ( newTitle, 'svc-find-dlg', {ssDivId:'', 'svc-find-title':newTitle} );
		
		// show add service
		$('#cmdSSAdd').show ();
		$('#ssSearch').hide();
		$('#cmdSSCancel').css ( 'margin-left', mleft-50+'px' );
		$('#ssCont').css ( 'height', svheight );
		
		var msg = '<p style="font-size:120%;font-weight:bold">Feel free to add a business service icon and tell your users about it. ' +
			'This feature is currently free.</p>' +		
			'<br>Modify services created by me:';
		$('#svc-find-desc').html ( msg );
		
		// show services for logged in user
		SA.fireEvent ( myId, {cmd:'showLatest', userId:'signed-in' } );
	}

	
	/**
	 * Notify when form is submitted
	 */
	this.notifySubmit = function ( actionAtom, atomList, dataObj )
	{
		if ( actionAtom.cmd == 'cmdSSAdd' ) {
			// close my search dialog
			currentDlg.showDialog (false);

			// call to create a new service
			serviceListener.performAction ( {cmd:'svcNew'} );
		}
		else if ( actionAtom.cmd == 'cmdSSCancel' ) {
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
	 * Called to handle events specific for this component
	 */
	this.handleEvent = function ( event )
	{
		if ( event.cmd == 'showLatest' ) {
			$('#ssResult').html ( 'Loading please wait..' );
			
			// load data
			var dm = SA.lookupComponent ('dataManager');
			var svcConfList ;
			// Provider: get my services
			if ( event.userId ) {
				svcConfList = dm.getMyServices ( {userId:event.userId}, handleData );
			}
			// Consumer: get all services
			else {
				svcConfList = dm.getServices ( {}, handleData, false );
			}
			
			/*
			 * Data handler call back from dataManager comp
			 */
			function handleData ( status, data )
			{
				var ret = 'No services found';
				
				if ( status == 'OK' ) {
					if ( data && data.length > 0 ) {
						ret = '<div id="' + myId + '" class="list-group">'
						for ( i=0; i<data.length; i++ ) {
							var item = serviceComp.titleHtml ( data[i] );
							ret += '<a id="svs-' + i + 
								'" href="#" class="list-group-item"><div class="list-group-item-text">' + 
								item + '</div></a>';
						}
						curSvcLatestConf = data;
						ret += '</div>';
					}
				}
				$('#ssResult').html ( ret );
			}
		}
	}
	
	/**
	 * After compoent is loaded in page  
	 */
	this.postLoad = function ()
	{	
		$( '.list-group-item' ).hammer().bind("tap", function(event) {
			var id = $(this).attr('id');
			var idx = id.substring (id.indexOf ('-')+1);
			
			// Notify that new service will be added to MappList
			var sconf = curSvcLatestConf[idx];

			currentDlg.showDialog (false);

			if ( myServices == true ) {
				serviceListener.performAction ( {cmd:'svcEdit', config:sconf} );
			}
			else {
				// notify the listener component that the server needs to be added to the UI
				serviceListener.performAction ( {cmd:'svcAdded', config:sconf, svcDivId:curSvcDivId} );
			}
		});
		
		$( '#ssCancel' ).hammer().bind("tap", function(event) {
			console.debug ('cancel' );
		});
	}
}
