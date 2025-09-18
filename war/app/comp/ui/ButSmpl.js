
/**
 * Button Action Atom component. Action atoms components cause code execution in the system. Can thought off as the 
 * Mini Catalyst Controllers that alter the system's state. The acton button operates as the following:
 * 
 */
App.ButSmpl = function ()
{	
	// state variables
	var actionListener = undefined;
	var myId, myInst;
	
	// CSS defined here for button component
	this.css = { items:
    	[
		{name:'.btcls', 
			value:'border-style:solid;border-width:1px;border-radius:3px;border-color:#e3e3e3;'+
				'font-size:90%;text-align:center;padding:3px;background-color:#f5f5f5'}
		]
	}; 
	
	/**
	 * If defined it will allow this component to create UI based on the lists provided
	 * 
	 * atomObj:
	 * label: button label
	 * style: button style
	 * 
	 * config: 
	 * listener: action listener component (default none)
	 * 
	 */
	this.createUI = function ( atomObj, allConfig )
	{
		myId = this.compId;
		myInst = this;
		
		if ( atomObj.name && atomObj.name.length>0 )
			myId = atomObj.name;
		
		var style = '';
		if (atomObj.style && atomObj.style.length>0 )
			style = atomObj.style;
		
		var cls = SA.localCss (myInst, 'btcls' );
		
		var label = atomObj.label;
		if ( !label )
			label = 'Label';
		
		var html = '<div id="' + myId + '" style="' + style + '" class="' + cls + '">' + label + '</div>'; 
		return html;
	}
	
	/**
	 * Change the label
	 */
	this.setLabel = function ( newLabel, newStyleObj )
	{
		var $id = $('#'+myId);
		$id.html ( newLabel );
		if ( newStyleObj ) {
			$id.css ( newStyleObj );
		}
	}
	
	/**
	 * Move to position
	 */
	this.moveTo = function ( x, y )
	{
		var $id = $('#'+myId);
		$id.css ('position', 'absolute');
		$id.css ('left', x);
		$id.css ('top', y );
	}
}
