/**

 * BannertHandler Object  
 */
App.Banner = function ()
{
	// default color
	var DEF_COLOR = '#f0f0f0';
	var backgroundColor;
	
	// stylesheets for this component
	this.css = { items: 
		[
		// slide down panel
		{name:'.slide-pan', 
			value:'position:absolute;left:0px;background-image:url("app/res/img/footer_lodyas2.png");background-repeat:repeat;width:100%;z-index:999;' },
		// external panel
		{name:'.ext-pan', 
			value:'position:absolute;top:0px;left:0px;width:100%;height:100%;z-index:999;background-color:white;' },
		
		// header class
		{name:'.header',
			value:'z-index:300;height:65px;width:100%;border-bottom:1px solid #e0e0e0;background-color:'+
				DEF_COLOR+'; position:fixed;top:0px;left: 0px;text-align:center;color:#f9f9f9;'},
		// slide content class
		{name:'.content',
			value:'padding-top:65px;'}
		]
	};
	
	// local variables
	var myId, myInst, myIdInner;
	var headId, leftId, contentId;
	var slidePanId, slideMaskId, extPageId;
	var homeListener, bodyfComp, headerfComp;
	var headerDivId;
	
	// define login atom onj
	var fviewHeader = { name:'headerFlip', lc:'App.SlickFlip', config:{} };
	var fviewBody = { name:'bodyFlip', lc:'App.SlickFlip', config:{} };
	
	
	var mleft = $(window).width()/2 - 60;
	
	var slideDownPanel = {name:'ban-sp-form', lc:'App.FormHandler', 
			config:{title:'', listener:this }, items:   
		 [
		 //{html:'div', style:'height:5px;'},
		 
		 //{html:'div', style:'font-size:140%;text-align:center', value:'User Menu' },

 		 {html:'div', style:'height:40px;'},
		 {html:'div', id:'ban-feedback', style:'margin-left:40px;font-size:130%;color:#b9b9b9;', 
			 value:'Send Feedback' },
		 
		 {html:'div', style:'height:20px;'},
		 {html:'div', id:'ban-my-account', style:'margin-left:40px;font-size:130%;color:#b9b9b9;', 
			 value:'My Account' },

		 {html:'div', style:'height:20px;'},
		 {html:'div', id:'ban-sign-out', style:'margin-left:40px;font-size:130%;color:#b9b9b9;', 
			 value:'Sign Out' },

		 {html:'div', style:'height:20px;'},
		 
		 {html:'div', id:'ban-add-svc', style:'margin-left:40px;font-size:130%;color:gray;', 
			 value:'Add a Business Icon<br><div style="font-size:80%;">(For business use only)</div>' },

		 {html:'div', style:'height:30px;'},

		 {cmd:'cmdBSPCancel', ac:'App.Button', label:'Close', style:'margin-left:'+(mleft+10)+'px', 
			 config:{theme:'color'} },

		 {html:'div', style:'height:5px;'}
		 ]
	 };
	
	var extPagePanel = {name:'ban-ext-form', lc:'App.FormHandler', config:{title:'', listener:this }, items:  
		[
		{cmd:'cmdExtPageCancel', ac:'App.Button', label:'Close', style:'position:fixed;top:0px;margin-top:20px;font-size:95%', 
			config:{theme:'color'} },
	
		{html:'div', style:'margin-top:52px;', id:'ext-page-content' }
		]
	};

	/**
	 * This method creates the UI based on the lists provided
	 * 
	 * parentList:
	 * 
	 * config:
	 * name: 'imageUrl' is the URL for image for that banner
	 * bindDivId: divId to bind the UI to
	 * 
	 * items: 
	 * list of action Atom objects
	 */  
	this.createUI = function ( list, allConfig )
	{
		myId = this.compId;
		myInst = this;
		
		if ( list.name ) {
			myId = list.name;
		}
		
		// Do some validation here
		imageUrl = SA.getConfig ( list, 'imageUrl');
		
		// get listener
		homeListener = SA.getConfig (list, 'listener');

		// get local css classes
		var headerCls = SA.localCss ( this, 'header' );
		var contentCls = SA.localCss ( this, 'content' );

		// header slider
		fviewHeader.config = {fade:true, speed:250};
		var headerTmHtml = SA.createUI (myId, fviewHeader );
		
		// body slider 
		fviewBody.config = {cls:contentCls, listener:this};
		var bodyTmHtml = SA.createUI (myId, fviewBody );
		
		// get comps from registry
		headerfComp = SA.lookupComponent ( 'headerFlip' );
		bodyfComp = SA.lookupComponent ( 'bodyFlip' );

		// content id
		contentId = 'cont-' + myId;
		extPageId = 'ext-' + myId;
		myIdInner = 'in-' + myId;
		leftId = 'left-' + myId; 
		
		// set background color
		backgroundColor = DEF_COLOR;
		
		// HIDE: render slide-down panel html
		var slidePanHtml = getSlidePanelHtml ();
		var extPageHtml = getExtPageHtml();
		
		// get header div id
		setHeaderTm ( headerCls, allConfig.hidden, headerTmHtml );
		
		// wrap with my own div
		var ret = '<div style="display:none" id="' + myId + '">' + 
					bodyTmHtml + '</div>' + slidePanHtml + extPageHtml;
		
		return ret;
	}
	
	function setHeaderTm ( cls, hidden, html )
	{
		headerDivId = App.util.getMainComp().getConfig().headerDivId;
		var $headDiv = $('#'+headerDivId);
		$headDiv.addClass ( cls );
		if ( hidden == true ) 
			$headDiv.css ( 'display', 'none' );
		$headDiv.html (  html );
	}
	
	
	/**
	 * Change the banner's heading html
	 */
	this.changeUI = function ( headHtml, newStyle )
	{
		if ( newStyle ) {
			var bgst = extractStyle ('background-color:', newStyle);
			if ( bgst ) {
				backgroundColor = bgst;
				$('#'+myIdInner).css ('background-color', bgst );
			}
		}
		else {
			backgroundColor = DEF_COLOR;
			$('#'+myIdInner).css ('background-color', backgroundColor );
		}

		if ( headHtml ) {
			$('#'+headId).html ( headHtml );
		}
	}
	
	/**
	 * Extract style from css styles
	 */
	function extractStyle ( name, styles )
	{
		if ( !styles ) return;
		var i0 = styles.indexOf ( name );
		if ( i0 >=0 ) {
			var i1 = styles.indexOf ( ';', i1+1 );
			if ( i1 > 0 ) 
				return styles.substring (i0+name.length, i1);
			else 
				return styles.substring (i0+name.length);	
		}
	}
	
	/**
	 * Show first page
	 */
	this.showFirst = function ( dataId, banHtml, pageHtml )	
	{
		headerfComp.reset();
		bodyfComp.reset();
		if ( bodyfComp.curPageIdx() == 0 ) {
			$('#'+myId).show ();
		}
		// set whole page html
		setWholePageHtml( getHeaderHtml (banHtml), getContentHtml(pageHtml) );
	}
	
	/**
	 * Show next page. If passedTitle == true, then banHtml only contains title,
	 * otherwise a full header 
	 */
	this.showNext = function ( dataId, banHtml, pageHtml, passedTitle )
	{
		if ( bodyfComp.curPageIdx() == 0 ) {
			myInst.show ( true );
		}

		// if passedTitle flag set, then banHtml == title
		if ( passedTitle == true ) {
			setWholePageHtml ( getHeaderHtml (getBackBanner(banHtml)), pageHtml);
		}
		else {
			setWholePageHtml ( banHtml, pageHtml);
		}
	}
	
	/**
	 * Make a whole page from header and content
	 */
	function setWholePageHtml ( bannerHtml, contentHtml )
	{
		 var headHtml = '<div oid="' + myId + '">' + bannerHtml + '</div>';
		 var bodyHtml = '<div oid="' + myId + '">' + contentHtml + '</div>';
		 
		 headerfComp.setNextPage ( headHtml );
		 bodyfComp.setNextPage ( bodyHtml );
	}
	
	/**
	 * Show previous page
	 */
	this.showPrev = function () 
	{
		headerfComp.showPrev();
		bodyfComp.showPrev ();
	}	
	
	/**
	 * MAIN MENU: Show a slide-down panel
	 */
	var spPanelShown = false;
	this.showSPanel = function ()
	{
		if ( !spPanelShown ) {
			var $mask = $('#'+slideMaskId);
			$mask.css ( 'top', '65px' );
			$mask.show ();
			
			var $pan = $('#'+slidePanId);
			$pan.css ( 'top', '65px' );
			$pan.slideDown( 200 );
			spPanelShown = true;
		}
		else {
			var $pan = $('#'+slidePanId);
			$pan.slideUp( 100 );
			var $mask = $('#'+slideMaskId);
			$mask.hide ();
			
			spPanelShown = false;			
		}		
	}
	
	/**
	 * SINGLE PAGE: showing method
	 */
	this.showSinglePage = function ( show, panelHtml )
	{
		if ( show == true ) {
			$('#ext-page-content').html ( panelHtml );
			$('#'+extPageId).fadeIn ( 'fast' );
		}
		else {
			$('#ext-page-content').html ('');
			$('#'+extPageId).hide ();
		}
	}
	
	/**
	 * Notify when form is submitted
	 */
	this.notifySubmit = function ( actionAtom, atomList, dataObj )
	{
		if ( actionAtom.cmd == 'cmdBSPCancel' ) {
			myInst.showSPanel ();
		}
		else if ( actionAtom.cmd == 'cmdExtPageCancel') {
			myInst.showSinglePage (false);
		}
	}
	
	/**
	 * Action performed listener notification 
	 */
	this.actionPerformed = function ( event )
	{
		// got notification from body changed page
		if ( event.cmd == 'showNext' ) {
			var idx = event.curIdx;
			// show corresponding header 
			headerfComp.showPageIdx ( idx );
		}
	}
		
	/**
	 * Reset banner flipper
	 */
	this.reset = function ()
	{
		headerfComp.reset();
		bodyfComp.reset();
	}
	
	/**
	 * Show / hide banner
	 */
	this.show = function ( isShown )
	{
		if ( isShown == true ) {
			$('#'+myId).show ();
			myInst.showHeader ( true );
		}
		else { 
			$('#'+myId).hide ();
			myInst.showHeader ( false );			
		}
	}
	
	/**
	 * Set page scroll start (true), stop (false)
	 */
	this.showHeader = function ( show )
	{
		if ( show ) {
			$('#'+headerDivId).show();
		}
		else {
			$('#'+headerDivId).hide();
		}
	}
	
	/**
	 * Make custom banner 
	 */
	this.getCustom = function ( banHtml, newStyle )
	{
		return getHeaderHtml (banHtml, newStyle);
	}
	
	/**
	 * Content html under the header
	 */
	function getContentHtml ( html )
	{
		return '<div id="' + contentId + '">' + html + '</div>';
	}
	
	/**
	 * Get external page html
	 */
	function getExtPageHtml ()
	{
		var cls = SA.localCss ( myInst, 'ext-pan');
		return '<div id="' + extPageId +'" class="' + cls + '" style="display:none" >' + 
			SA.createUI ( myId, extPagePanel ) + '</div>';
	}
	
	/**
	 * Get slide down panel and dark background mask
	 */
	function getSlidePanelHtml ()
	{
		slideMaskId = 'ban-smp-' + myId;
		var smpHtml = '<div style="display:none;position:absolute;left:0px;background-color:#000;opacity:0.5;width:100%;height:100%;z-index:100;" id="' + 
			slideMaskId + '"/>' ;
		
		var css = SA.localCss (myInst, 'slide-pan' );
		slidePanId = 'ban-sdp-' + myId;
		var sdpHtml = '<div class="' + css + '" style="display:none;" id="' + slidePanId + '">' + 
			SA.createUI ( myId, slideDownPanel ) + '</div>';
		
		return smpHtml + sdpHtml ;
	}
	
	/**
	 * Render general banner
	 */
	function getHeaderHtml ( headerHtml, newStyle )
	{
		var width = $(window).width();
		
		var style1 = 'background-color:'+backgroundColor;
			//'position:fixed;top:0px;background-color:'+backgroundColor+';margin:0px;height:'+ bannerHeight+'px;width:'+width+'px';
		var style2 = 'width:93%;margin-left:auto;margin-right:auto;';
		
		if ( newStyle )
			style1 = newStyle;
		
		headId = 'head-' + myId;
		
		var html = 
		'<div oid="' + myId + '" id="' + myIdInner + '" style="' + style1 + '"  >' +
			'<div style="' + style2 + '">';
		
		html += '<div id="' + headId + '">' + headerHtml + '</div></div></div>'; 			
		return html;
	}
	
	function getHomeBanner ()
	{
		return '<div style="display:none">home</div>';
	}
	
	function getBackBanner (title, colBG)
	{
		var titleHtml = '';
		if ( title && title.length>0 ) {
			titleHtml = '<div style="text-align:center;padding-top:26px;color:gray;font-size:140%;margin-top:-75px">' + 
			title + '</div>';
		}
		
		var backImgUrl = 'app/res/img/backicon-wt.png';
		var backButton =  '<img id="' + leftId + '" src="' + backImgUrl + 
				'" style="width:45px;margin-left:10px;padding-top:20px;padding-bottom:20px;" />';
		return '<div>' + backButton + titleHtml +'</div>';
	}
	
	/**
	 * If defined it will be called after page is loaded (to give chance to initialize after the DOM
	 * is created)
	 */ 
	var lastTime = 0;
	this.postLoad = function ()
	{
		// go back
		$( '#'+leftId ).hammer().bind("tap", function(event) {
			lastDataId = '';
			if ( !accept (event) ) return;
			
			if ( bodyfComp.curPageIdx() == 0 ) {
				// hide banner
				myInst.show ( false );
				// back to home
				homeListener.actionPerformed ( {cmd:'back'} );
			}
			// show previous banner and header
			myInst.showPrev ();
		});
		
		// menu - add service (not used for now)
		$('#ban-add-svc').hammer().bind("tap", function(event) {
			if ( !accept (event) ) return;
			myInst.showSPanel (); // hide
			var comp = SA.lookupComponent ('svcAdmin');
			comp.adminService ();
		});
		
		// menu - get feedback
		$('#ban-feedback').hammer().bind("tap", function(event) {
			if ( !accept (event) ) return;
			myInst.showSPanel (); // hide
			var comp = SA.lookupComponent ('feedBack');
			comp.showFeedbackDlg ();
		});
		
		// menu - my account option 
		$('#ban-my-account').hammer().bind("tap", function(event) {
			lastDataId = '';
			if ( !accept (event) ) return;
			myInst.showSPanel (); // hide

			// TEST // //6014328603934720,5073146650558464
			//SA.fireEvent ( 'home', {cmd:'setBadge', serviceId:5130321255202816} );
			//SA.fireEvent ( 'home', {cmd:'setBadge', serviceId:5411796231913472} );
			// 
			
			var userAdmin = SA.lookupComponent ('userAdmin');
			var banner = SA.lookupComponent ( 'banner' );
			banner.showNext ( 'adminUser', 'My Account', 
					userAdmin.getAdminUI(), true );
		});
		
		$('#ban-sign-out').hammer().bind("tap", function(event) {
			lastDataId = '';
			if ( !accept (event) ) return;
			// logout user
			SA.deleteUserAuth();			
			myInst.showSPanel ();
			var home = SA.lookupComponent ( 'home' );
			home.reload();
		});

		/*
		var lastScrollTop = 0;
		$('#page').scroll(function(event)  {
			var st = $(this).scrollTop();
			var diff = st - lastScrollTop;
			console.log ( 'scroll diff=' + diff );
			if ( diff > 80 ){		// down
				myInst.showHeader (false);
			} 
			else {	// up
				myInst.showHeader (true);
			}
			lastScrollTop = st;
		});
		*/
		
		// accept event
		function accept (event ){
			var ret = (event.timeStamp - lastTime) > 100;
			lastTime = event.timeStamp;
			return ret;
		}		
	}
};
