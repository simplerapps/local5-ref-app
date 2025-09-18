
/**
 * Text Area component
 */
App.TextArea = function ()
{	
	// specify if the component contains state or not
	// TODO: This does not work for scope
	this.stateful = true;
	
	this.actionListener = undefined;
	this.atomObj = undefined;
	
	// remember value entered
	var fieldValue = '';
	var divId, atomObj;
	
	// CSS defined here exactly the same as css syntax but as javascript array of objects. Also
	// these css class names are unique to this class. For example if another class has the name 'round-clear'
	// it would be a different name because the names are distinguished based on unique class component type ids
	this.css = { 
	};
	
	/**
	 * If defined it will allow this component to create UI based on the lists provided
	 * 
	 * config: 
	 * rows: number of rows
	 * cols: number of columns 
	 */
	this.createUI = function ( myObj, config )
	{
		atomObj = myObj;
		divId = this.compId;
		
		if ( atomObj.name )
			divId = atomObj.name;
		
		//var rows = SA.getConfig ( atomObj, 'rows', 3);
		var rows = 1;	// autosize based on text
		var cols = SA.getConfig ( atomObj, 'cols', -1 );
		var style = SA.getConfig ( atomObj, 'style', '' );
		var nosize = SA.getConfig ( atomObj, 'nosize', '' );
		
		var placeHolder = '';
		
		if ( atomObj.info ) {
			var reqtext = '';
			//if ( atomObj.required ) 
				//reqtext = ' (required)';
			placeHolder = ' placeholder="' + atomObj.info + reqtext + '"'; 
		}

		// get label
		var labelStr = '';
		if ( atomObj.label ) {
			labelStr = '<label class="col-md-3 control-label" for="email">'+ atomObj.label +'</label>';
		}
		
		fieldValue = atomObj.value;
		var valStr = '';		
		if ( fieldValue && fieldValue != '' ) {
			valStr = fieldValue;
		}		
		else {
			fieldValue = '';
		}
		
		var html =
		'<div class="form-group" >'+ labelStr +   
			'<div class="col-md-12">' +
		  		'<textarea style="font-size:110%;overflow:hidden;' + style + '" class="form-control" id="' + 
		  			divId + '" ' + placeHolder +' >' + fieldValue + '</textarea>' +
		  	'</div>' +
		'</div>';
		
		if ( nosize != true )
			SA.fireEvent ( divId );
		
		return html;
	}
	
	this.getValue = function ()
	{
		fieldValue = $("#" + divId).val();
		return fieldValue;
	}
	
	this.getName = function()
	{
		return atomObj.name;
	}
	
	this.refresh = function ()
	{
		SA.fireEvent ( divId );
	}
	
	this.handleEvent = function ( event )
	{
		$ta = $('#'+divId);
		$ta.textareaAutoSize();
	}	
}
