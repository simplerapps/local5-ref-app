
/**
 * Button Action Atom component. Action atoms components cause code execution in the system. Can thought off as the 
 * Mini Catalyst Controllers that alter the system's state. The acton button operates as the following:
 * 
 */
App.ButtonYN = function ()
{	
	var myId, myInst;
	var name, value;
	
	/**
	 * If defined it will allow this component to create UI based on the lists provided
	 * value: yes | no
	 */
	this.createUI = function ( atom, allConfig )
	{
		myId = this.compId;
		myInst = this;
		var style = '';
		if ( atom.style ) {
			style = atom.style;
		}
		name = atom.name;
		value = atom.value;
		label = atom.label;
		
		var activeCls = '';
		if ( value && value==true ) {
			activeCls = 'active';
		}
		var retHtml = '<button id="' + myId + '" style="' + style + 
			'" type="button" class="btn btn-default ' + activeCls +'" data-toggle="button" >'+ label + '</button>';
		return retHtml;
	}
	
	this.getName = function()
	{
		return name;
	}
	
	this.getValue = function()
	{
		value = $('#'+myId).hasClass('active');
		return value;
	}
	
	this.postLoad = function ()
	{
		$('#'+myId).hammer().bind("tap", function(event) {
			if ( myInst.getValue() ) {
				$('#'+myId).blur();
			}
		});
	}
}

