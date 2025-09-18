/**
 * The App.Home list component. This component represents the "controller" for the home page. It has a 
 * reference to:
 */
App.DlgHelper = function ()
{
	// Other variables
	var myInst, myId ;
	var dialogHandler;
	var initialized = false;	
	var okDlgInit = false;	
	
	var mleftO = $(window).width()/2 - 70;
	var mleft1 = $(window).width()/2 - 130;
    
    // delete dialog
    var yesNoDialog =  { items: 
		[
	    {name:'dh-yesno', lc:'App.Dialog', config:{small:true}, items:
			[
			{name:'dh-yesno-form', lc:'App.FormHandler', 
				config:{title:'', listener:this}, items: 
				[
				{html:'div', style:'height:25px;'},
				{name:'dh-id', ac:'App.Variable'},				
				{name:'dh-yesNoMsg', html:'p', style:'text-align:center;font-size:110%', value:''},
				{html:'div', style:'height:6px;'},
				
			    {cmd:'dh-cmdYes', ac:'App.Button', label:'Yes I am Sure', config:{theme:'color'},
					style:'margin-left:'+mleft1+'px;margin-right:5px;'},
			    {cmd:'dh-cmdNo', ac:'App.Button', label:'Cancel', config:{theme:'blank'} },
			    
			    {html:'div', style:'height:5px;'}
				]
			}
			]
		}
	    ] };
    
    // delete dialog
    var okDialog =  { items: 
		[
	    {name:'dh-ok', lc:'App.Dialog', config:{small:true}, items:
			[
			{name:'dh-ok-form', lc:'App.FormHandler', 
				config:{title:'', listener:this}, items: 
				[
				{html:'div', style:'height:25px;'},			
				{name:'dh-okMsg', html:'div', value:''},
				{html:'div', style:'height:6px;'},
				
			    {cmd:'dh-cmdOk', ac:'App.Button', label:'Close', config:{theme:'color'},
			    	style:'margin-left:'+mleftO+'px' },
			    
			    {html:'div', style:'height:5px;'}
				]
			}
			]
		}
	    ] };    
    
	/**
	 * This method creates the UI based on the lists provided
	 * 
	 * config:
	 */
	this.createUI = function ( list, config )
	{
		myId = this.compId;
		myInst = this;
	}
	
	/**
	 * 
	 */
	this.showOKDialog = function ( msgHtml  )
	{
		if ( okDlgInit == false ) {
			okDlgInit = true;
			SA.createUI (myId, okDialog);	
		}
		var dlg = SA.lookupComponent ( 'dh-ok' );
		if ( dlg ) {
			var form = {'dh-okMsg':msgHtml };
			dlg.updateForm (form );
			dlg.showDialog (true);
		}
	}
	
	/**
	 * 
	 */
	this.showYNDialog = function ( msg, id, handler )
	{
		if ( initialized == false ) {
			initialized = true;
			SA.createUI (myId, yesNoDialog);	
		}
		
		var dlg = SA.lookupComponent ( 'dh-yesno' );
		if ( dlg ) {
			// set handler
			dialogHandler = handler;
			
			var form = {'dh-yesNoMsg':msg, 'dh-id':id };
			dlg.updateForm (form );
			dlg.showDialog (true);
		}
	}
		
	/**
	 * Notify when form is submitted
	 */
	this.notifySubmit = function ( actionAtom, atomList, dataObj )
	{
		var dlg;
		if ( actionAtom.cmd == 'dh-cmdYes' ) {
			dlg = SA.lookupComponent ( 'dh-yesno' );
			dlg.setWaiting ( true );
			// answer caller 'YES'
			dialogHandler ( 'YES', dataObj ['dh-id'] );
			// disable waiting 
			dlg.setWaiting ( false );
			dlg.showDialog (false);
		}
		else if ( actionAtom.cmd == 'dh-cmdNo' ) {
			dlg = SA.lookupComponent ( 'dh-yesno' );
			dlg.showDialog (false);
			// answer caller 'NO'
			dialogHandler ( 'NO', dataObj ['dh-id']);
		}
		else if ( actionAtom.cmd == 'dh-cmdOk' ) {
			dlg = SA.lookupComponent ( 'dh-ok' );
			dlg.showDialog (false);
		}
	}	
}
