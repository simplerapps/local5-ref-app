
/**
 * Text Area component
 */
App.Loading = function () 
{		    
    var myId = undefined;
    
	/**
	 * If defined it will allow this component to create UI based on the lists provided
	 */
	this.createUI = function ( atomObj, config )
	{
		myId = 'load-' + this.compId;
		var html = getIconHtml();
		
		// Create an element with id == flowList.name ( or eq divElementId )
		var $etc = $("#page-etc");
		if ( !$etc.length  ) {
			$etc = $('<div id="page-etc" />').appendTo('body');
			$etc.append ( html );
		}
		return '';
	}
	
	/**
	 * Show icon centered in page
	 */
	function getIconHtml ()
	{
		var winWidth = $(window).width();
		var winHeight = $(window).height();
		
		var divHeight = 50;
		var top = winHeight/2 - divHeight/2 - 20;
		
		var divWidth = 80;
		var left = winWidth/2 - divWidth/2 + 25;
		var imgWidth = divWidth /3;
		
		var nstyle = 'display:none;border-radius:10%;position:fixed;top:' + top + 
			'px;left:' + left + 'px;z-index:1000;width:' + divWidth + 'px;height:' + divHeight + 'px';
		
		var html = '<div id="' + myId + '" style="' + nstyle + '" >' + 
			'<img src="app/res/img/350.gif" width="' + imgWidth +'" /></div>';

		return html;
	}
	
	/**
	 * start animation 
	 */
	this.start = function ()
	{
		var $myId = $('#'+myId);
		$myId.show ();
	}
	
	/**
	 * Stop animation 
	 */
	this.stop = function ()
	{
		var $myId = $('#'+myId);
		$myId.hide ();
	}
}

