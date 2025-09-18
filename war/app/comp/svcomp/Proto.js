/**
 * Component works with prototyping UI based on resource tabs and tab contents
 */
App.Proto = function ()
{
	// Other variables
	var myInst = undefined;
	var myId = undefined;
	var svcConfig;
	
	/**
	 * This method creates the UI based on the lists provided
	 * 
	 * config:
	 * 
	 */
	this.createUI = function ( list, config )
	{
		myId = this.compId;
		myInst = this;
	}
	
	/**
	 * Return prototype tab names in array
	 *  
	 * NOTE: it looks for resource str name: STR:<svcTitle>:tabs
	 */
	this.getProtoTabs = function ( sconf )
	{
		var title = sconf.title.toLowerCase().replace (' ', '-');
		var tabs = SA.res.getValue ( 'STR:' + title + '.tabs' );
		if ( tabs && tabs.length> 0 ) {			
			var tabsArr = tabs.split (',');
			return tabsArr;
		}
		else {
			return [];
		}
	}
	
	/**
	 * Returns prototype tab index html
	 * 
	 * NOTE: it looks for resource str name: STR:<svcTitle>:tab<idx>
	 */
	this.getProtoTabHtml = function ( sconf, tabIdx )
	{
		var title = sconf.title.toLowerCase().replace (' ', '-');
		var thtml = SA.res.getValue ( 'STR:' + title + '.tab' + tabIdx );
		if ( thtml && thtml.length>0 )
			return thtml;
		else 
			return getDefHome ( sconf);
	}
	
	/**
	 * Gets default (stub) service content 
	 */
	function getDefHome (sconf)
	{
		var svcComp = SA.createComponent ( 'service', 'App.Service' );		
		
		var pic = '';

		if ( sconf.title=='CYCLE SPORTS' ) {
			pic = '<img style="width:100%" src="app/res/gallery/cs.jpg" />';
		}
		else if ( sconf.title=='Philz Coffee' ) { 
			pic = '<img style="width:100%" src="app/res/gallery/pc.jpg" />';			
		}
		else if ( sconf.title=='Encinal Hardware' ) { 
			pic = '<img style="width:100%" src="app/res/gallery/eh.jpg" />';			
		}
		else if ( sconf.title=='Alameda Theatre'  ) {
			pic = '<img style="width:100%" src="app/res/gallery/at.jpg" />';						
		}
		else if ( sconf.title=='OAKLAND ZOO' ) {
			pic = '<img style="width:100%" src="app/res/gallery/ozoo.jpg" />';									
		}
		else if ( sconf.title=='Cinema Grill' ) {
			pic = '<img style="width:100%" src="app/res/gallery/cg.jpg" />';
		}
		else {
			var mediaUrl = SA.server.getMediaUrl (sconf.iconUrl);
			pic = '<img style="width:60%" src="' + mediaUrl + '" />';
		}
		
		var titleHt = svcComp.titleHtml (sconf);
				
		var html = '<div>' + 
			'<div style="margin-bottom:10px;">' + titleHt + '</div>' +  
			'<div>' + pic + '</div>' +  
			'<div style="color:#B80000;margin-top:20px;" id="svc-rem" >Remove This Service<div></div>';
		
		return html;
	}
}
