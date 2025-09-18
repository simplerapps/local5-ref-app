
/**
 * Create data entry form handler
 */
App.FormHandler = function ()
{
	// create new instance every time referenced in list
	this.stateful = true;
	
	// form listener
	var formListener ;
	
	// components in this form
	var compsList = new Array ();
	
	// define my form id
	var myId ;
	
	// my current flow list
	var myFlowList;
	
	// local css names
	var formCss ;
	var headerCss;
	
	// my comp
	var thisComp ;
	var title ;
	var pageStyle ;
	var fitHeight;
	
	// comp trigger action
	var triggeringComp ;
	
	this.css = { items: 
		[
			/* Everything else */
			{name: '@media (min-width: 481px)', items: 
				[
				{name:'.header', value:'padding:0px;font-size:135%;margin:0 0 0 0;'},				 
				{name:'.form', value:'width:90%;padding:15px;font-size:110%;'}				 
				]
			},
			 
			/* Mobile sizes */
			{name: '@media (max-width: 480px)', items: 
				[
				{name:'.header', value:'padding:0px;font-size:130%;margin:0 0 0 0;'},			 				 
				{name:'.form', value:'width:100%;font-size:85%;'}
				]
			}
		]
	};	
	
	/**
	 * This method creates the UI based on the lists provided
	 * 
	 * items:
	 * All Action Atom objects in a list will be placed in form
	 * html elements will be static elements on form
	 * 
	 * config:
	 * listener: the listener component
	 * title: login form title
	 * fitHeight: true/false to fit in height of window
	 * 
	 */
	this.createUI = function ( flowList, allConfig )
	{
		myFlowList = flowList;
		thisComp = this;
		formListener = SA.getConfig ( flowList, 'listener' );
		fitHeight = SA.getConfig ( flowList, 'fitHeight');
		
		if ( !flowList.items )
			return;
		
		// get form ID
		myId = this.compId;
		if ( flowList.name ) {
			myId = flowList.name;
		}
		
		// local form css
		formCss = SA.localCss ( this, 'form' );
		headerCss = SA.localCss ( this, 'header' );
		
		// page style ?
		pageStyle = SA.getConfig ( flowList, 'pageStyle', false );
		
		var style = 'margin:20px';
		if ( flowList.style && flowList.style.length>0 )
			style = flowList.style;
		
		// col-md-8 col-md-offset-2
		
		var retHtml;
		if ( pageStyle ) {
			retHtml =
			'<div id="'+myId+'" style="'+ style +'" >'  +
				createFormUI ( flowList ) + 
			'</div>'; 
		}
		else {
			retHtml =
			'<div id="' + myId + '" class="container ' + formCss + ' style="'+ style +'" >'  +
				createFormUI ( flowList ) + 
			'</div>';
		}
		return retHtml;
	}
	
	/**
	 * Updates form data
	 */
	this.updateForm = function ( dataObj )
	{
		// merge my data list + data obj
		SA.utils.mergeList(myFlowList, dataObj);
		var retHtml = createFormUI ( myFlowList );
		
		// update ui
		$( '#' + myId ).html (retHtml);
	}
	
	/**
	 * Creates form UI 
	 */
	function createFormUI ( flowList )
	{
		compsList = new Array ();
		var atomList = flowList.items;

		// set div.id == compId, this way you can always lookup component instance from divId
		var divId = this.compId;
		title = SA.getConfigValue ( flowList, 'title' );
		
		var titleLine = '';
		if ( !pageStyle && title && title.length>0 ) {
			titleLine = 
			'<div class="panel-heading" style="border-bottom:0px;">';
				'<p class="' + headerCss + '" >' + title + '</p>' + 
			'</div>' ;
		}
		
		var winHeight = '';
		if ( fitHeight ==  true ) { 
			winHeight = 'height:' + (window.innerHeight-5) + 'px';
		}
		
		var retHtml = 
		'<div class="panel panel-default" ' + 
			'style="border-width:0px;background-color:transparent;box-shadow:none;-webkit-box-shadow:none;' +winHeight+ '">' +		
			titleLine +			 		
			'<div class="row">' +
				'<div class="col-md-12">' +
			  	    '<div>' + 
					   '<form class="form-horizontal" action="" method="post">' ;
				  		   //'<div style="padding-bottom:15px;" />' ;
				  
		// now add all the buttons inside
		var j = 0;
		for ( j=0; j<atomList.length; j++ ) {
			var lobj = atomList [j];
			
			// if not atom component, just render  
			if ( !lobj.ac ) {
				retHtml += SA.listCreateUI ( lobj.compId, lobj, undefined, true );
				continue;
			}
			
			// get atom comp
			var atomComp = SA.getAtomComponent ( lobj.name, lobj.ac );
			compsList.push ( atomComp );
			
			// if button implements setActionListener method, call it and asso my self with it
			if ( atomComp.setActionListener ) 
				atomComp.setActionListener ( thisComp );
				
			// get html
			var html = atomComp.createUI ( lobj, null );
			
			retHtml += html;
		}
		retHtml += '</form></div></div></div></div>';

		return retHtml;
	}
	
	/**
	 * show / hide form element
	 */
	this.showElement= function ( elementName, show ) 
	{
		if ( !show ) {
			$ ('#' + elementName).hide ();
		}
		else { 
			$ ('#' + elementName).show ();
		}
	}
	
	/**
	 * Component that gets notified about form events
	 */
	this.addFormListener = function ( listener )
	{
		formListener = listener;
	}
	
	/**
	 * Set or reset waiting (when action is being perform)
	 */
	this.setWaiting = function ( isWaiting )
	{
		if ( triggeringComp && triggeringComp.setWaiting ) {
			triggeringComp.setWaiting ( isWaiting );
		}
		if ( isWaiting) {
			$('#' + myId).find(':input').prop('disabled', true);
		}
		else {
			$('#' + myId).find(':input').prop('disabled', false);
		}
	}
	
	/**
	 * The child components call this when an action is performed (i.e. key press)
	 */
	this.performAction = function ( compId, actionAtom, actionComp )
	{
		//console.log ( "action performed ");
		
		// notify form listener 
		if ( formListener ) {
			if ( formListener.notifySubmit ) {
				triggeringComp = actionComp;
				
				// get data objects from form
				var dataObj = getFormDataInt( compsList );

				// pass to listener
				formListener.notifySubmit (actionAtom, myFlowList.items, dataObj );
			}
		}
	}
	
	/**
	 * Gets form data after filled 
	 */
	this.getFormComps = function ()
	{
		return compsList;
	}
	
	/**
	 * Gets form component object
	 */
	this.getFormComponent = function ( compName )
	{
		for (i=0; i<compsList.length; i++ ) {
			var c = compsList[i];
			if ( c.getName && c.getName == compName ) {
				return c;
			}
		}
	}
	
	/**
	 * Programatically add components to form
	 */
	this.addComponent = function ( name, compObj )
	{
		var comp = SA.getAtomComponent ( name, compObj );
		compsList.push ( comp );
	}
	
	/**
	 * Remove form component 
	 */
	this.removeComponent = function ( name )
	{
		var i;
		for (i=0; i<compsList.length; i++ ) {
			var cmp = compsList[i];
			if ( cmp.getName ) {
				var cname = cmp.getName();
				if ( cname == name ) {
					compsList.splice (i,1);
					if ( $('#'+cmp.compId).length>0 ) {
						$('#'+cmp.compId).hide();
					}
					else { 
						$('#'+name).hide();
					}
					break;
				}
			}
		}
	}
			
	/**
	 * Gets form data from all child components 
	 */
	function getFormDataInt ( compsList )
	{
		var data = {};
		
		for (i=0; i<compsList.length; i++ ) {
			
			var c = compsList [i];
			// component need a name to be placed on form
			if ( c.getName && c.getValue ) {
				var name = c.getName();
				var value = c.getValue();
				if ( value != undefined ) {
					if ( value != '' ) {
						data [ name ] = value ;
					}
					else if ( value==true || value==false ) {
						data [ name ] = value;
					}
				}
			}
		}
		return data;
	}
	
	/**
	 * If defined it will be called after page is loaded (to give chance to initialize after the DOM
	 * is created)
	 */ 
	this.postLoad = function ()
	{
	}
}
