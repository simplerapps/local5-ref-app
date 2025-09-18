
/**
 * Button Action Atom component. Action atoms components cause code execution in the system. Can thought off as the 
 * Mini Catalyst Controllers that alter the system's state. The acton button operates as the following:
 * 
 */
App.Circles = function ()
{	
	// CSS defined here exactly the same as css syntax but as javascript array of objects. Also
	// these css class names are unique to this class. For example if another class has the name 'round-clear'
	// it would be a different name because the names are distinguished based on unique class component type ids
	this.css = { items:
		[
		{name:'.round', value:'display:block;width:15px;height:15px;border:1px solid #e5e5e5;'+
			'border-radius: 50%;box-shadow: 0 0 1px gray;float:left;margin-right:5px;'},
		{name:'.selected', value:'background: #e0e0e0;'}
		]			
	};
	
	var myId, myInst;
	var count, cls1, selCls;

	
	/**
	 * If defined it will allow this component to create UI based on the lists provided
	 * 
	 * config:
	 * count: number of circles
	 */
	this.createUI = function ( atomObj, allConfig )
	{
		myInst = this;
		myId = this.compId;
		
		if ( atomObj.name ) {
			myId = atomObj.name;
		}
		
		count = SA.getConfig ( atomObj, 'count', 3 );
		cls1 = SA.localCss ( this, "round");	
		selCls = SA.localCss ( this, "selected");

		var html = '<div style="display:none" id="' + myId + '" />';
		return html;
	}
	
	/**
	 * Draw the actual circles based on layout
	 */
	this.draw = function ( ypos, selIdx )
	{
		var html = '';		
		for ( var i=0; i<count; i++ ) {
			html += '<div id="' + (myId+'-'+i) + '" class="'+ cls1 + '" />'; 
		}
		var winWidth = $(window).width();
		var circWidth = count * 20;
		var xpos = (winWidth - circWidth) / 2;
				
		var $div = $('#'+myId);
		$div.html ( html );
		$div.css ('position', 'absolute');
		$div.css ('top', ypos+'px' );
		$div.css ('left', xpos+'px' );		
		$div.show ();
		
		selectIdx ( selIdx );
	}
	
	/**
	 * Adds an action listener
	 */
	function selectIdx ( idx )
	{
		$( '#' + (myId+'-'+idx) ).addClass ( selCls );	
	}

}


