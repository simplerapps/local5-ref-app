/**
 * The App.Home list component. This component represents the "controller" for the home page. It has a 
 * reference to:
 */
App.FlexAdmin = function ()
{
	// Other variables
	var myInst = undefined;
	var myId = undefined;
	var currentDlg = undefined;
	var curSvcDivId, curSvcLatestConf, curMappComp;
	var serviceComp = undefined;
	
	var initialized = false; 
	
	/**
	 * Group flow list
	 */
	var groupForm = {name:'flex_add_form', lc:'App.FormHandler', 
		config:{title:'Add new group', listener:this, pageStyle:true}, items: 
		[
		{html:'div', style:'height:5px;'},		
		{html:'div', style:'font-size:140%', value:'Group Handler'},		
		
		{name:'flex_msg', ac:'App.Message' },
		
		{html:'div', style:'height:8px;'},		

		{name:'flex_id', ac:'App.Variable'},

		// business address
		{name:'flex_name', ac:'App.TextField', info:'Participation Group Name', required:true, pattern:'text' },
		{name:'flex_dispName', ac:'App.TextField', info:'Group Label', required:true, pattern:'text' },
		{name:'flex_dispStyle', ac:'App.TextField', info:'Group CSS Style', required:false, pattern:'text' },
		
		// Save changes
		{html:'div', style:'height:5px;'},	
		{cmd:'flex_cmd_save', ac:'App.Button', label:'Save Changes'}
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
		
		var qstr = SA.getConfig ( parentList, 'qstr' );
		if ( qstr && qstr.length>0 ) {
			var i = qstr.indexOf ('id=');
			if ( i == 0 ) {
				SA.fireEvent ( myId, {cmd:'loadData', id:qstr.substring(3), kind:'group'} );
			}
		}
		return SA.createUI ( myId, groupForm );
	}
	
	/**
	 * Notify when form is submitted
	 */
	this.notifySubmit = function ( actionAtom, atomList, dataObj )
	{
		if ( actionAtom.cmd == 'flex_cmd_save' ) {
			if ( validate ( 'flex_msg', atomList, dataObj ) ) {
				var form = getForm ( dataObj );
				if ( dataObj.flex_id && dataObj.flex_id > 0 ) { 
					SA.server.putForm ("/rs/group", form, postSuccess);
				}
				else { 
					SA.server.postForm ("/rs/group", form, postSuccess);
				}
			}
		}
	}
	
	/*
	 * Convert object to form
	 */
	function getForm ( dataObj ) 
	{
		var form = new FormData();
		
		for ( var key in dataObj ) {
			
			var i = key.indexOf ('flex_');
			if ( i == 0 ) {
				var val =  dataObj [key];
				if ( val ) {
					form.append ( key.substring(5), val );
				}
			}
		}
		return form;
	}
	
	/*
	 * Success after adding service 
	 */
	function postSuccess ( respStr )
	{
		var respObj = jQuery.parseJSON( respStr );
		if ( respObj.status == 'OK') {
			showMessage ( 'flex_msg', 'Service added successfully', true );
			
			// go back to main page
			var banner = SA.lookupComponent ( 'banner' );
			banner.showPrev ();
		}
		else {
			showMessage ( 'flex_msg', respObj.message, false );
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
	 * Called to handle events specific for this component
	 */
	this.handleEvent = function ( event )
	{
		if ( event.cmd == 'loadData' ) {
			var id = event.id;
			var kind = event.kind;
			SA.server.get ('/rs/' + kind, {id:id}, dataHandler );
			
			function dataHandler ( data ) 
			{
				var respObj = jQuery.parseJSON( data );
				
				if ( respObj.status == 'OK') {
					
					var dataObj = respObj.respData;
					var listObj = {};
					
					for ( var key in dataObj ) {
						listObj [ 'flex_' + key ] = dataObj [key];
					}
					
					var form = SA.lookupComponent ('flex_add_form');
					form.updateForm ( listObj );
				}
				else {
					showMessage ( 'flex_msg', respObj.message, false );
				}
			}				
		}
	}
	
	/**
	 * After compoent is loaded in page  
	 */
	this.postLoad = function ()
	{	
	}
}
