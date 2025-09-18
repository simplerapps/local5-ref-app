/**
 * The App.Home list component. This component represents the "controller" for the home page. It has a 
 * reference to:
 */
App.SvcAdmin = function ()
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
	var serviceList = {name:'service-add-form', lc:'App.FormHandler', 
		config:{title:'Add new service', listener:this, pageStyle:true}, items: 
		[
		//{html:'div', style:'height:5px;'},		
		{name:'svc-add-Msg', ac:'App.Message' },
		
		{html:'div', style:'height:8px;'},		

		{name:'id', ac:'App.Variable'},

		{name:'title', ac:'App.TextField', info:'Service title', required:true, pattern:'text' },
		{name:'titleColor', ac:'App.TextField', info:'Title color value', required:true, pattern:'text' },
		//{name:'titleBG', ac:'App.TextField', info:'Title background value', required:true, pattern:'text' },
		
		// size: 325 x 280
		{name:'iconUrl', ac:'App.UploadSmpl', info:'Icon image', required:false, 
			config:{prefWidth:325, prefHeight:280} },
		{html:'div', style:'color:gray;margin-bottom:5px;font-size:85%', value:'Note: use fingers to move and resize photo' }, 
			
		{name:'iconBG', ac:'App.TextField', info:'Icon background color value', required:true, pattern:'text' },

		// business info
		//{name:'info', ac:'App.TextArea', info:'Description (optional)', required:false, pattern:'text' },

		// business address
		{name:'address', ac:'App.TextField', info:'Service street address', required:true, pattern:'text' },
		{name:'city', ac:'App.TextField', info:'City', required:true, pattern:'text' },
		{name:'state', ac:'App.TextField', info:'State', required:true, pattern:'text' },
		{name:'zip', ac:'App.TextField', info:'Zip code', required:true, pattern:'text' },		
		{name:'country', ac:'App.TextField', info:'Country (optional)', required:false, pattern:'text' },
		
		// Admin email list
		{name:'adUserIds', ac:'App.TextArea', info:'Admin emails seperated by ,  (optional: you are the admin by default)', pattern:'text',
			config:{rows:3} },
			
		// associated component
		{html:'div', style:'color:gray;margin-top:8px;margin-bottom:5px;font-size:90%', 
			value:'Associated custom component (Optional)' },
		{name:'compName', ac:'App.TextField', info:'Component name', required:false, pattern:'text' },
		{name:'compDef', ac:'App.TextArea', info:'Component code', required:false, pattern:'text',
			config:{'nosize':true}},
		{name:'compConfig', ac:'App.TextArea', info:'Component config', required:false, pattern:'text',
			config:{'nosize':true}},

		{html:'div', style:'color:gray;margin-top:15px;margin-bottom:5px;font-size:85%', 
			value:'Tap to toggle select options below:' }, 
		{name:'showComm', ac:'App.ButtonYN', label:'Show Comments', style:'font-size:80%' },
		{name:'showPoster', ac:'App.ButtonYN', label:'Show Poster', style:'font-size:80%;margin-left:5px;' },
		
		// Save changes
		{html:'div', style:'height:20px;'},
		{cmd:'cmdNewService', ac:'App.Button', label:'Save Changes'}
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
	 * Administer a service 
	 */
	this.adminService = function ()
	{
		var svcSearch = SA.lookupComponent ('svcSearch');
		svcSearch.showForSignedIn ('Add or Modify Service Icons', myInst)
	}

	/**
	 * Notify when form is submitted
	 */
	this.notifySubmit = function ( actionAtom, atomList, dataObj )
	{
		if ( actionAtom.cmd == 'cmdNewService' ) {
			showWaiting (true);
			if ( validate ( 'svc-add-Msg', atomList, dataObj ) ) {
				var form = getForm ( dataObj );
				if ( dataObj.id && dataObj.id > 0 ) { 
					SA.server.putForm ("/rs/service", form, postSuccess);
				}
				else { 
					SA.server.postForm ("/rs/service", form, postSuccess);
				}
			}
			else {
				showWaiting (false);
			}
		}
	}
	
	/*
	 * getSvcSuccess
	 */
	function querySvcSuccess ( respStr )
	{
		var respObj = jQuery.parseJSON( respStr );
		if ( respObj.status == 'OK') {
			if (respObj.respData ) {
				var data = respObj.respData;
				
				var imgUrl = data.iconUrl;
				var comp = App.util.getListItem ('iconUrl', serviceList );
				comp.config.imgUrl = imgUrl;
				
				data.iconUrl = undefined;
				
				// decode all base64 encoded values
				data.compDef = window.atob ( data.compDef );
				data.compConfig = window.atob ( data.compConfig );
				
				// merge the data with declared list 
				App.util.mergeList (serviceList, data );
				
				var html = SA.createUI ( myInst, serviceList);
				App.util.stopWorking ();
				
				var banner = SA.lookupComponent ( 'banner' );
				banner.showNext ( 'adminSvc', 'Modify Existing Service', html, true );
			}
		}
		showWaiting (false);
	}

	/**
	 * Enable / disable form wait
	 */
	function showWaiting ( isWaiting )
	{
		var comp = SA.lookupComponent ('service-add-form');
		if ( isWaiting == true ) {
			comp.setWaiting ( true );
		}
		else {
			comp.setWaiting ( false );
		}
	}	
	
	/*
	 * Convert object to form
	 */
	function getForm ( obj ) 
	{
		var form = new FormData();
		form.append ('title', obj.title );
		if (  obj.titleColor )
			form.append ('titleColor', obj.titleColor);
		if ( obj.titleBG )
			form.append ('titleBG', obj.titleBG);
		
		if ( obj.iconUrl  )
			form.append ('iconUrl', obj.iconUrl );
		if ( obj.iconBG )
			form.append ('iconBG', obj.iconBG );
		
		if ( obj.info  )
			form.append ('info', obj.info );
		
		if ( obj.adUserIds ) 
			form.append ('adUserIds', obj.adUserIds );
		
		form.append ('address', obj.address );
		form.append ('zip', obj.zip );
		form.append ('city', obj.city );
		
		if ( obj.state )
			form.append ('state', obj.state );
		
		if ( obj.country)
			form.append ('country', obj.country );
		
		if ( obj.id ) 
			form.append ('id', obj.id );
		
		if ( obj.compName && obj.compName.length>0 )
			form.append ('compName', obj.compName );
		else 
			form.append ('compName', '~nv' );
		
		if ( obj.compDef && obj.compDef.length>0 ) {
			var defEnc =  window.btoa (obj.compDef) ;
			form.append ('compDef', defEnc )
		}
		else {
			form.append ('compDef', '~nv' );
		}
			
		if ( obj.compConfig && obj.compConfig.length>0 ) {
			var confEnc =  window.btoa (obj.compConfig) ;
			form.append ('compConfig', confEnc);
		}
		else { 
			form.append ('compConfig', '~nv' );
		}
		
		// get my group id
		form.append ( 'groupId', App.util.getGroupId() );
		form.append ( 'showComm', obj.showComm );
		form.append ( 'showPoster', obj.showPoster );
		
		return form;
	}
	
	/*
	 * Success after adding service 
	 */
	function postSuccess ( respStr )
	{
		var respObj = jQuery.parseJSON( respStr );
		if ( respObj.status == 'OK') {
			showMessage ( 'svc-add-Msg', 'Service added successfully', true );
			
			// ALLOW: to  edit the service i just added (on the front-end)
			App.util.canAdminSvcAllow ( respObj.respData.id );
			
			// clear user services
			//var dm = SA.lookupComponent ('dataManager');
			//dm.clearUserServices ();
			
			// go back to main page
			var banner = SA.lookupComponent ( 'banner' );
			banner.showPrev ();
		}
		else {
			showMessage ( 'svc-add-Msg', respObj.message, false );
		}
	}
	
	/*
	 * Validate function
	 */
	function validate ( divId, atomList, data )
	{
		var msg = SA.validate.evalObj(atomList, data);
		if ( msg != '' ) {
			showMessage ( divId, msg, false );
			return false;
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
	
	/**
	 * Called when clicking on action buttons or from other components
	 * 
	 * event = {cmd:'', config:sconf}
	 */
	this.performAction = function (  action  )
	{
		// update form list with data before showing the dialog
		var formComp = SA.lookupComponent ('svc-find-form');
		
		// for edit user listId and cardId
		if ( action.cmd == 'svcNew' ) {
			App.util.mergeList (serviceList, {} );
			var comp = App.util.getListItem ('iconUrl', serviceList );
			comp.config.imgUrl = '';
			var html = SA.createUI ( myInst, serviceList);
			var banner = SA.lookupComponent ( 'banner' );
			banner.showNext ( 'adminSvc', 'Add Service', html, true );
		}
		else if ( action.cmd == 'svcEdit' ) {
			var sconf = action.config;
			App.util.startWorking ();
			SA.server.get ( "/rs/service", {id:sconf.id}, querySvcSuccess);
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
	 * After compoent is loaded in page  
	 */
	this.postLoad = function ()
	{	
		$( '.list-group-item' ).hammer().bind("tap", function(event) {

		});
		
		// Prev page 
		$('#' + myId ).hammer().bind( "swiperight", function( event ) {
			//console.log ( 'swipe -->' );
			if ( !accept (event) ) return;			
			//console.log ( 'swipe --> ts: ' + event.timeStamp );
			var pages = SA.lookupComponent ( 'banner' );
			pages.showPrev ();
		});	
		
		// accept event
		function accept (event ) {
			var ret = event.timeStamp > lastTime;
			lastTime = event.timeStamp;
			return ret;
		}		

		
	}
}
