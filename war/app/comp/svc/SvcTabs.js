/**
 * The App.Home list component. This component represents the "controller" for the home page. It has a 
 * reference to:
 */
App.SvcTabs = function ()
{
	// Other variables
	var myInst, myId ;
	var svcComp, userService, tabcls;
	var tabPrefId = 'tab-';
	var maxTabs, listener;
	var firstTime = true;
	
    // Application Global Styles
    this.css =  { items:
    	[
		/* Everything else */
		{name: '@media (min-width: 481px)', items: 
			[
			{name:'.cls', value:'width:100%;height:40px;background-color:#f6f6f6'},
			{name:'.tab', value:'float:left;color:#101010;font-size:90%;margin:10px;border-right:solid white' }			
			]
		},
		 
		/* Mobile larger */
		{name: '@media (max-width: 480px)', items: 
			[
			{name:'.cls', value:'width:100%;height:30px;background-color:#f6f6f6'},
			{name:'.tab', 
				value:'float:left;color:#101010;font-size:95%;padding:8px;border-right:solid white;border-width:1px;' }			
			]
		},
		
		/* Mobile smaller */
		{name: '@media (max-width: 326px)', items: 
			[
			{name:'.cls', value:'width:100%;height:30px;background-color:#f6f6f6'},
			{name:'.tab', 
				value:'float:left;color:#101010;font-size:85%;padding:7px;border-right:solid white;border-width:1px;' }			
			]
		}    	 		
    	]
    };
    
    var tabsText ;
	
	/**
	 * This method creates the UI based on the lists provided
	 * 
	 * config:
	 * 
	 * svcCompName; service component obj name
	 * userService: userService object
	 * listener: tabs listener (implement performAction)
	 */
	this.createUI = function ( list, config )
	{
		myInst = this;
		myId = this.compId;
		
		// get listener to tabs
		listener = SA.getConfig (list, 'listener' );
	
		// get passed svc component name
		var compName = SA.getConfig (list, 'svcCompName' );
		
		// get passed user service
		userService = SA.getConfig (list, 'userService' );
		
		tabPrefId += myId + '-';
		
		// create component instance as Singleton (always same name)
		svcComp = SA.createComponent ( compName, compName );
		svcComp.createUI ();
		
		// tab bar component		
		tabsText = svcComp.getProtoTabs ( userService.sconf );
		maxTabs = tabsText.length;
		
		tabcls = SA.localCss (myInst, 'tab');
		
		var cls = SA.localCss (myInst, 'cls');
		
		var tabsHtml = getTabsHtml (maxTabs);
		
		var html = '';
		if ( maxTabs > 0 ) {
			html = '<div class="'+cls+'" id="' + myId + '" >' + tabsHtml + '</div>';
		}
		else {
			html = '<div id="' + myId + '" >' + tabsHtml + '</div>';			
		}
		return html;
	}
	
	/*
	 * Gets tabs html
	 */
	function getTabsHtml (count)
	{
		// set max tabs
		maxTabs = count;
		var html = '<div>';
		for ( i=0; i<count; i++ ) {
			var ttext = tabsText [i];
			
			var id = tabPrefId + i;
			html += '<div id="'+id+'" class="' +tabcls+ '" >' + ttext + '</div>';
		}
		html += '</div>';
		return html;
	}
	
	/*
	 * Select a tab
	 */
	function selectTab ( id )
	{
		var html = '';
		if ( maxTabs > 0 ) {
			var tidx = Number(id);
			for (i=0; i<maxTabs; i++ ) {
				var $div = $('#'+tabPrefId+i);
				if ( i == tidx ) {
					$div.css ('background-color', 'white' );
					$div.css ('height', '30px' );
					$div.css ('font-weight', 'bold');
				}
				else {
					$div.css ('background-color', '#f6f6f6' );
					$div.css ('height', '30px' );
					$div.css ('font-weight', 'normal');				
				}
			}
			html = svcComp.getProtoTabHtml ( userService.sconf, tidx );
		}
		else {
			html = svcComp.getProtoTabHtml ( userService.sconf, 0 );
		}
		//console.debug ( html );
		listener.peformAction ( {cmd:'showHtml', data:html} );
	}
	
	/**
	 * After component is loaded in page  
	 */
	this.postLoad = function ()
	{
		// select tab 0 (only once)
		if ( firstTime ) {
			selectTab (0);
			firstTime = false;
		}
		
		$ ( '.'+tabcls ).hammer().bind("tap", function(event) {
			var id = $(this).attr('id');			
			selectTab ( id.substring(tabPrefId.length) );
		});
	}
}
