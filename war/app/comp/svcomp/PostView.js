/**
 * Component works with prototyping UI based on resource tabs and tab contents
 */
App.PostView = function ()
{
	// Other variables
	var myInst = undefined;
	var myId = undefined;
	
	var cardCss, titleCss, paragCss;
	var editCls, delCss;
	
	// some config
	var showPoster, showComments, groupId;
	
	this.css = { items: 
		[
		/* Everything else */
		{name: '@media (min-width: 481px)', items: 
			[ 
			{name:'.card', value:'margin-bottom:40px; border: 1px solid #f0f0f0;border-radius:5px;padding:10px;background-color:#fff;' },			 
			{name:'.title', value:'font-size:160%;margin-top:4px;margin-bottom:4px;'},
			{name:'.parag', value:'font-size:90%;margin-top:4px;margin-bottom:6px;'}
			]
		},
		  
		/* Mobile sizes */
		{name: '@media (max-width: 480px)', items: 
			[
			{name:'.card', value:'margin-bottom:18px; border: 1px solid #f0f0f0;border-radius:5px;padding:5px;background-color:#fff;' },			 
			{name:'.title', value:'font-size:130%;margin-bottom:2px;'},
			{name:'.parag', value:'font-size:90%;margin-top:4px;margin-bottom:4px;'}			
			]
		},
		{name: '.editCls', value: 'color:#d0d0d0;float:right' },
		{name: '.delCls', value: 'color:#d0d0d0;float:right' },
		]
	};
	
	/**
	 * This method creates the UI based on the lists provided
	 * 
	 * config:
	 * 
	 */
	this.createUI = function ( atom, config )
	{
		myId = this.compId;
		myInst = this;
		
		cardCss = SA.localCss ( this, 'card');
		titleCss = SA.localCss ( this, 'title');
		paragCss = SA.localCss ( this, 'parag' );
		editCls = SA.localCss (this, 'editCls' );
		delCls = SA.localCss (this, 'delCls' );

		// some config
		showPoster = SA.getConfig (atom, 'showPoster', true);
		showComments = SA.getConfig (atom, 'showComm', true);
		groupId = SA.getConfig (atom, 'groupId' );
		
		var postData = atom.config.data;
		
		return createHtml ( postData );
	}
	
	/*
	 * Create ui from post data
	 */
	function createHtml ( pdata ) 
	{
		var html = 
			'<div id="' + myId + '" class="' + cardCss + '" >' ;
		
		if ( showPoster == true ) {
			html += getPoster (pdata);
		}
		html += '<div class="' + paragCss + '">' + formatMsg(pdata.msg) + '</div>' + getPhotos (pdata) ;

		// show comments, likes, admin menu bar
		html += getLikesBar (pdata, showComments) ;

		return html + '</div>';
	}
	
	function getLikesBar ( pdata, showComments ) 
	{
		var numComm = 0;
		var numLikes = 0;
		
		var editId = 'ped-' + pdata.serviceId + '-' + pdata.id;
		var delId =  'pdl-' + pdata.serviceId + '-' + pdata.id;
		
		var html = '<div style="margin-top:5px;padding:5px;font-size:80%;font-weight:bold;height:30px;width:100%;color:#407fbf">';
			
		if ( showComments == true ) {
			html += '<div style="float:left">' + numComm + ' Comments&nbsp;&nbsp;&nbsp;&nbsp' + numLikes + ' Likes </div>' ;
		}
		
		// If can admin allow to edit
		if ( App.util.canAdminSvc ( pdata.serviceId, groupId ) ) { 
			html += '<div><div class="' + delCls + '" id="' + delId + '">  |&nbsp; Del  )</div><div class="' + 
				editCls + '" id="' + editId + '">(  Edit&nbsp;&nbsp;</div></div>';
		}
		
		return html + '</div>';
	}
	
	function getPoster ( pdata )
	{
		var html = '<div><img style="float:left;width:30px;margin-right:10px;" src="app/res/img/unknown.png" />';
		
		html += '<div style=""><div style="font-size:90%;font-weight:bold">' + pdata.userComName + '</div>';
		
		var time = App.util.getFriendlyTime (pdata.modifiedMs);
		html += '<div style="font-size:70%;margin-bottom:10px">' + time + '</div></div>';
		
		return html + '</div>';
	}
	
	function getPhotos ( pdata )
	{
		var ret = '';
		var i=0;
		if ( pdata.mediaIdList && pdata.mediaIdList.length>0 ) {
			for (i=0; i<pdata.mediaIdList.length; i++ ) {
				var url = SA.server.getMediaUrl (pdata.mediaIdList[i]);
				ret += '<div><img style="width:100%" src="'+url+'" /></div>';
				
				if ( pdata.msgList && i<pdata.msgList.length ) {
					ret += '<div style="font-size:85%;margin:8px;">' + 
						formatMsg(pdata.msgList[i]) + '</div>';
				}
			}
		}
		return ret;
	}
	
	/**
	 * Post load handling 
	 */
	var lastTime = 0;
	this.postLoad = function ()
	{
		// tap on edit class of any edit link
		$ ( '.'+editCls ).hammer().bind("tap", function(event) {
			if ( accept (event) ) {
				var id = $(this).attr('id');
				var idObj = extractIds ( id );
				var dm = SA.lookupComponent ( 'dataManager' );
				var post = dm.getPostingById ( idObj.sid, idObj.pid );
				
				//console.debug (post );
				SA.fireEvent ( 'App.Comm', {cmd:'editPost', data:post} );
			}
		});
		
		// tap on del
		$ ( '.'+delCls ).hammer().bind("tap", function(event) {
			if ( accept (event) ) {
				var id = $(this).attr('id');
				var idObj = extractIds ( id );
				var dh = SA.lookupComponent ( 'dlgHelper' );
				dh.showYNDialog ( 'Delete this post message?', idObj.pid, dlgHandler);
				function dlgHandler ( status, id ) {
					if ( status == 'YES' ) {
						SA.fireEvent ( 'App.Comm', {cmd:'delPost', sid:idObj.sid, pid:idObj.pid} );
					}
				}
			}
		});
		
		function extractIds ( divId ) 
		{
			var idx = divId.indexOf ('-',4);
			var sid = Number(divId.substring ( 4, idx ));
			var pid = Number(divId.substring (idx+1));
			return {sid:sid, pid:pid};
		}
		
		// accept event
		function accept (event )
		{
			var ret = event.timeStamp > lastTime;
			lastTime = event.timeStamp;
			return ret;
		}	
	}
			
	
	
	
	/*
	 * Message formatter logic (convert special codes to html)
	 * 
	 * {h}Header Message{h}
	 * {code}fixed format text{code}
	 * {link}linkname,url{link}
	 * {p}some paragraph{p}
	 */
	function formatMsg ( msg )
	{
		//console.debug ( msg );
		var tag = {endIdx:-1};
		var html = '';
		var lastIdx = 0;
		
		while ( true && tag ) 
		{
			tag = getNextTag ( tag, tag.endIdx+1, msg );
			// no more tags get after 'lastIdx'
			if ( !tag ) {
				html += msg.substring (lastIdx);
				break;
			}
			
			// copy extra text if any 
			if ( lastIdx > 0 )
				html += msg.substring ( lastIdx, tag.startIdx );
			
			if ( tag.val == 'h' ) {
				html += '<p><b>';
				lastIdx = tag.endIdx+1;
				tag = getNextTag ( tag, lastIdx, msg );
				if ( tag && tag.val == 'h' ) {
					html += msg.substring (lastIdx, tag.endIdx-2);
					html += '</b></p>';
					lastIdx = tag.endIdx+1;
				}
			}
			else if ( tag.val == 'f' ) {
				html += '<pre>';
				lastIdx = tag.endIdx+1;
				tag = getNextTag ( tag, lastIdx, msg );
				if ( tag && tag.val == 'f' ) {
					html += msg.substring (lastIdx, tag.endIdx-2);
					html += '</pre>';
					lastIdx = tag.endIdx+1;
				}
			}
			else if ( tag.val == 'l' ) {
				html += '<a ';
				lastIdx = tag.endIdx+1;
				tag = getNextTag ( tag, lastIdx, msg );
				if ( tag && tag.val == 'l' ) {
					html += getLinkHtml(msg.substring (lastIdx, tag.endIdx-2));
					html += '</a><br>';
					lastIdx = tag.endIdx+1;
				}
			}
			else if ( tag.val == 'p' ) {
				html += '<p>';
				lastIdx = tag.endIdx+1;
				tag = getNextTag ( tag, lastIdx, msg );
				if ( tag && tag.val == 'p' ) {
					html += msg.substring (lastIdx, tag.endIdx-2);
					html += '</p>';
					lastIdx = tag.endIdx+1;
				}
			}
		}		
		return html;
	}
	
	/*
	 * Gets the link value between the <a> tags
	 */
	function getLinkHtml ( linkVal )
	{
		var html = '';
		var items = linkVal.split (',');
		var link, label;
		
		for ( var i=0; i<items.length; i++ ) {
			var item = items[i].trim();
			if ( item.indexOf ('http') ==0 ) 
				link = item;
			else 
				label = item;
		}
		if ( link ) {
			html += 'href="' + link +'" target="_blank">';
			if ( label ) 
				html += label;
			else 
				html += link;
		}
		else {
			html = 'BAD link format! {link}label,url{link}';
		}
		return html;
	}	
	
	/*
	 * Parse next tag from tags formatted message
	 */
	function getNextTag ( tag, idx, msg )
	{
		var i0 = msg.indexOf ( '{', idx );
		if ( i0 >= 0 ) {
			var i1 = msg.indexOf ( '}', i0+1 );
			if ( i1 > 0 ) {
				tag.val = msg.substring ( i0+1, i1 ).toLowerCase();
				tag.startIdx = i0;
				tag.endIdx = i1;
				return tag;
			}
		}
	}
	
}
