/**
 * Button Action component
 */
App.Dialog = function ()
{	
	// specify if the component contains state or not
	this.stateful = true;
	
	// store obj-based templ here
	this.htmlTempl = undefined;
	
	this.css = { items: 
		[
			/* Everything else */
			{name: '@media (min-width: 481px)', items: 
				[
				{name:'.dlg', value:'width:520px;position:absolute; '+
					'top:6%;left:45%;margin-top:-30px;margin-left:-200px;padding:20px;' }
				]
			},
			 
			/* Mobile sizes */
			{name: '@media (max-width: 480px)', items:
				[
				{name:'.dlg', value:'width:100%;position:absolute;top:0px;margin-top:0px;padding:0px;margin-left:0px' },
				{name:'.dlg-sml', value:'width:90%;position:absolute;top:20%;margin-left:16px;padding:0px;' }
				]
			}
		]
	};	
	
	var dlgId = undefined; 
	var pageId = undefined;
	var isPageStyle = undefined;
	var myFlowList = undefined;
	var dlgFormComp = undefined;
	
	/**
	 * If defined it will allow this component to create UI based on the lists provided
	 * 
	 * flow: Optional expect child list of content of dialog
	 * 
	 */
	this.createUI = function ( flowList, allConfig )
	{
		var pageConfig = SA.getConfig ( flowList, 'pageStyle', false );
		var small = SA.getConfig (  flowList, 'small' );
		
		// get is page style (full page or dialog)
		var isMobile = SA.utils.isMobileDevice();
		isMobile = true;
		isPageStyle = pageConfig && isMobile;
		
		// The dlgId initialized in DOM, if already there simply show it ( If NOT in DOM create one)
		if ( dlgId ) {
			return '';
		}
		
		// initialize dlgId
		dlgId = this.compId;
		pageId = dlgId + '-page';
		
		myFlowList = flowList;
		
		// fihure out title
		var title = flowList.label;
		if ( !title ) {
			title = 'No title provided in label field';
		}
		
		var style = '';
		if ( flowList.style ) {
			style = flowList.style;
		}
		
		// content stored here
		var content = '';
		if ( flowList.items &&  flowList.items.length>0 ) {
			content = SA.listCreateUI ( this.compId, flowList.items[0], {'pageStyle':isPageStyle} );
		}
		
		// local css cls
		var ldlgcss = SA.localCss (this, 'dlg');
		if ( small == true )
			ldlgcss = SA.localCss (this, 'dlg-sml');
			 
		var retHtml = '<div class="modal fade" id="'+ dlgId + '" tabindex="-1" role="dialog" aria-labelledby="" aria-hidden="true">'+
	
		'<div class="modal-dialog ' + ldlgcss + '" style="' + style + '" >' +
			'<div id="' + pageId + '" class="modal-content">' +
				'<div class="modal-body" style="height:100%;width:100%;" >'+
					content +  
				'</div>'+
			'</div>'+
		  '</div>'+
	    '</div>';

		// Create an element with id == flowList.name ( or eq divElementId )
		$("#page-etc").append("<div id='" + flowList.name + "'></div>" );

		// Now append the dlg html inside the div set the html value
		$( "#"+flowList.name ).html ( retHtml );

		return undefined;
	}
	
	/**
	 * Make dialog and contents wait for processing
	 */
	this.setWaiting = function ( isWaiting )
	{
		 var form = getDialogForm();
		 if ( form ) {
			 form.setWaiting ( isWaiting );
		 }
	}
	
	/**
	 * Show and hide dialog
	 */
	this.showDialog = function ( show, title, bannerName, noToolbar  )
	{
		if ( isPageStyle ) {
			var appBanner = SA.lookupComponent ( bannerName );
			if ( show ) 
				appBanner.showNextPage ( title, pageId, $('#'+pageId).html(), undefined, noToolbar );
			else
				appBanner.showPrevious ();
		}
		else {
			if ( show ) 
				$('#'+dlgId).modal({ show: show  });
			else 
				$('#'+dlgId).modal('hide');
		}
	}
	
	/**
	 * Update the form with new one (used for edit mode)
	 */
	this.updateForm = function ( valuesObj )  
	{
		 var form = getDialogForm();
		 if ( form ) {
			 form.updateForm ( valuesObj )
		 }
	}
	
	/**
	 * Show and hide form element
	 */
	this.showElement = function ( name, show)
	{ 
		 var form = getDialogForm();
		 if ( form ) {
			 form.showElement ( name, show );
		 }
	}
	
	/**
	 * Gets the underlaying dialog form 
	 */
	function getDialogForm ()
	{
		if ( !dlgFormComp ) {
			 var formName = myFlowList.items[0].name;
			 dlgFormComp = SA.comps.getCompByIdOrName(formName);
		}
		return dlgFormComp;
	}
	
	/**
	 * If defined it will be called after page is loaded (to give chance to initialize after the DOM
	 * is created) 
	 */
	this.postLoad = function ()
	{ 
	}
}
