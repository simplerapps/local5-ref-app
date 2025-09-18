/**
 * Component works with prototyping UI based on resource tabs and tab contents
 */
App.PostUI = function ()
{
	// local variables
	var myInst, myId ;
	var numberOfPhotos = 0;
	var svcConfig ;
	var postData;
	
	// post data
	var postMsg = '';
	var imgFileList = [];
	var imgMsgList = [];
	
	/**
	 * Service flow list 
	 */
	var postForm = {name:'service-post-form', lc:'App.FormHandler', style:'margin:5px',
		config:{title:'', listener:this, pageStyle:true}, items: 
		[
		{name:'postErr', ac:'App.Message', style:'margin:3px' },

		{name:'postMsg', ac:'App.TextArea', info:'Write something', 
			config: {style:'border-color:#f5f5f5;font-size:100%;', rows:6} },

		{html:'div', id:'formatHelp', value:' Formatting help?', style:'font-size:80%;margin-bottom:10px;' },
			
		{name:'postPic-0', ac:'App.UploadSmpl', 
			config:{btText:'Add photo', listener:this, addCap:true} },
		
		// extra div to grow form dynamically 
		{html:'div', id:'postExtra' }
		]
	};
		
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
		
		// svc config
		svcConfig = list.config.sconf;
		
		// First: set passed postData (ONLY for edit mode)
		postData = list.config.pdata;
		
		var taHt = getPostText (postData);

		// no banner
		//var chtml = getBanHt(postData) + taHt;
		
		var ret = '<div id="' + myId + '">' + taHt + '</div>';
		
		// Second: if postData passed, populate for edit 
		if ( postData ) {
			SA.fireEvent ( myId, {cmd:'loadForEdit', pdata:postData} );
		}
		return ret;
	}
	
	/**
	 * performAction called by button
	 */
	this.performAction = function ( compId, obj, myComp )
	{
		if ( obj.cmd == 'attPhoto' ) {
			//alert ('add photos');
			
			window.imagePicker.getPictures(
				function(results) {
					for (var i = 0; i < results.length; i++) {
						//console.log('Image URI: ' + results[i]);
						alert ( 'url: ' + results[i] );
					}
				}, 
				function (error) {
					alert ( 'error: ' + error);
					//console.log('Error: ' + error);
				},
				{
					maximumImagesCount: 10,
					width: 200
				}
			);
		}
		else if ( obj.cmd == 'imgAdded' ) {
			numberOfPhotos++;
			var npbut = {name:'postPic-' + numberOfPhotos, ac:'App.UploadSmpl', 
					style:'float:left;width:100px;font-size:90%;',
					config:{btText:'+ Add more', listener:this, addCap:true, imgUrl:obj.imgUrl, imgCap:obj.imgCap} };
			var nbHt = SA.createUI (myId, npbut);
			$('#postExtra').append (nbHt);
			
			// prog. add comp to form
			var form = SA.lookupComponent ( 'service-post-form' );
			form.addComponent (npbut.name, npbut.ac);
			
			// scroll to end of page
			//scrollToEnd ();
		}
	}
	
	this.getBanner = function ( isEdit )
	{
		var bstyle = 'background-color:#999999;margin:0px;height:65px;';
		
		var postLabel = ' Post ';
		if ( isEdit == true ) {
			postLabel = ' Re-Post ';
		}

		var bcont = 
			'<div style="text-align:center;padding-top:22px;font-size:120%;color:silver;margin-bottom:-15px;"><b>Post Message</b></div>' +
			'<div><div style="float:left;font-size:110%;color:white;padding:5px;" id="postCan"> Cancel </div>' + 
			'<div style="float:right;font-weight:bold;font-size:115%;color:white;padding:5px;" id="postDo">' + postLabel + '</div></div>';
		
		var bcomp = SA.lookupComponent ('banner');
		var banHt = bcomp.getCustom ( bcont, bstyle );
		
		return banHt;
	}
	
	function getPostText ( pdata )
	{
		if ( pdata ) {
			postForm.items[1].value = pdata.msg;
		}
		else {
			postForm.items[1].value = '';			
		}
		var html = SA.createUI ( myId, postForm );
		return html;
	}
	
	/**
	 * Scroll to end of page
	 */
	function scrollToEnd ()
	{
		$( '#' + myId ).css ( 'top', '600px' );
	}
	
	/*
	 * showMessage
	 */
	function showMessage (name, msg, success )
	{
		var msgComp = SA.lookupComponent ( name );
		msgComp.showMessage ( msg, success );
	}
	
	/**
	 * Handle form post
	 */
	function handleFormPost ()
	{
		var pform = new FormData();
		
		var form = SA.lookupComponent ( 'service-post-form' );
		var fcomps = form.getFormComps ();
		
		var mediaIdList = [];
		var msgList = [];
		
		for ( i=0; i<fcomps.length; i++ ) {
			var c = fcomps[i];
			if ( c.getName && c.getValue ) {
				var name = c.getName();
				if ( name == 'postMsg') {
					var mval = c.getValue();
					if ( !mval || mval.trim().length==0 ) {
						showMessage ( 'postErr', 'Post message cannot be blank', false);
						return;
					}
					mval = App.util.safeHtml ( mval );
					pform.append ('msg', mval );
				}
				else if ( name.indexOf ('postPic') >=0 ) {
					// if there is a file accept the File object
					if (  c.getValue() ) {
						mediaIdList.push ( c.getValue() );
						var cap = '';
						if ( c.getCaption() ) {
							cap = c.getCaption();
							cap = App.util.safeHtml (cap);
						}
						msgList.push ( cap );
					}
				}
			}	
		}
		pform.append ( 'serviceId', svcConfig.id );
		pform.append ( 'serviceTitle', svcConfig.title );
		
		// add all files and msgs to form (array is created on server because of '-' )
		for (i=0; i<mediaIdList.length; i++ ) {
			pform.append ( 'mediaId-' + i, mediaIdList[i] );
			pform.append ( 'msg-' + i, msgList[i] );
		}
		
		if ( postData ) {
			pform.append ( 'id', postData.id );
		}
		
		// post thru the data manager
		var dmgr = SA.lookupComponent ( 'dataManager' );
		dmgr.savePosting ( pform, dataHandler, postData != undefined  );
		// clear cache
		dmgr.clearFeedsCache ( svcConfig.id );
		
		App.util.startWorking ();
		
		function dataHandler ( status, data ) 
		{
			if ( status=='OK' ) {
				SA.fireEvent ( 'App.Comm', {cmd:'loadFeeds', serviceId:svcConfig.id} );
				showMessage ( 'postErr', 'Post Successful', true);
				App.util.stopWorking ();
				$( '#postCan' ).trigger('tap');
			}
			else {
				showMessage ( 'postErr', 'Service errors encountered! Please try again later.', false);
				App.util.stopWorking ();
			}
		}
	}
	
	/**
	 * Handle events fired by SA.fireEvent (e) calls 
	 */
	this.handleEvent = function ( event )
	{
		// Edit mode: load data
		if ( event.cmd == 'loadForEdit' ) {
			var data = event.pdata;
			if ( !data.mediaIdList )
				return;
			var i;
			for ( i=0; i<data.mediaIdList.length; i++ ) {
				var imgUrl = data.mediaIdList [ i ];
				var imgCap = '';
				if (data.msgList && data.msgList[i]) {
					imgCap = data.msgList[i];
				}
				myInst.performAction ( myId, 
						{cmd:'imgAdded', imgUrl:imgUrl, imgCap:imgCap}, 
						myInst );
			} 
			
			// remove the first add button (when editing)
			var form = SA.lookupComponent ( 'service-post-form' );
			form.removeComponent ( 'postPic-0' );
		}
	}
	
	/**
	 * After compoent is loaded in page  
	 */
	this.postLoad = function ()
	{	
		$( '#postCan').hammer().bind("tap", function(event) {
			var ban = SA.lookupComponent ( 'banner' );
			ban.showPrev ();
		});
		
		$( '#postDo' ).hammer().bind("tap", function(event) {
			handleFormPost ();
		});
		
		$( '#formatHelp').hammer().bind("tap", function(event) {
			var dh = SA.lookupComponent ('dlgHelper');
			var msg = 
			'<div style="font-size:110%"><p><b>You can use the following tags to format your message:</b></p><code>'+
				'{h} Header Name {h}<br>' +
				'{f} Fixed font text {f}<br>' +
				'{p} Regular paragraph {p}<br>' + 
				'{l} Link label, http://link-url {l}<br><br>' + 
				'Or you can just type plain text.<br><br>' +
			'</code></div>';
			
			dh.showOKDialog ( msg );
		});
	}
}
