
/**
 * Text Area component
 */
App.UploadBrowser2 = function () 
{	
	// remember value entered
	var imgFile, ytubeUrl;
	var myId, atomObj;
	
	// what to show as default picture
	var defaultPicUrl = 'app/res/icon/icon-preview.jpg';
	
	var listener = undefined;
	var isNewlyAdded = true;
	var previewDiv, imageDiv;
	var captCompUI ;
	
	// clipping (resize and crop)
	var aspectRatio, clipWidth, clipHeight, imageWidth;
	
	// CSS defined here exactly the same as css syntax but as javascript array of objects. Also
	// these css class names are unique to this class. For example if another class has the name 'round-clear'
	// it would be a different name because the names are distinguished based on unique class component type ids
	this.css = { items: 
		[
		{name:'.card', value:'margin-bottom:1px; border: 1px solid #dddddd;padding:0px;background-color:#f9f8f7' },
		{name:'.frame', value:'margin-bottom:1px; border: 1px solid gray;padding:0px;' },		
		]
	};
	
	/**
	 * YouTube share URL
	 */
	this.flow = { items: 
		[		
		{name:'youtube-dlg', lc:'App.Dialog', items:
			[
			{name:'youtube-form', lc:'App.FormHandler', 
				config:{title:'Embed YouTube Video', listener:this}, items: 
				[
				{html:'p', style:'font-size:100%', 
					 value:"YouTube video URL (copy and paste video link here)" },				
				{name:'youtubeUrl', ac:'App.TextField', info:'YouTue video URL', required:true, pattern:'text' },
				{html:'div', style:'height:6px;'},
				
			    {cmd:'cmdUTubeUrl', ac:'App.Button', label:'OK', config:{theme:'color'}},
			    {cmd:'cmdUTubeCancel', ac:'App.Button', label:'Cancel', config:{theme:'blank'} },
				{html:'div', style:'height:6px;'}			    
				]
			}
			]
		}
		]
	};	
	
	/**
	 * If defined it will allow this component to create UI based on the lists provided
	 * 
	 * Config obj:
	 * prefWidth: preferred width number of pixels
	 * prefHeight: preferred height number if pixels
	 * youTube: allow you tube (true/false)
	 * btText: upload pic button text to show on button
	 * imgUrl: pass image Url (or icon id)
	 * imgCap: pass image caption
	 */
	this.createUI = function ( obj, config )
	{
		myId = this.compId;
		atomObj = obj;
		
		previewDiv = 'preview-' + myId;
		imageDiv = 'image-' + myId;
		
		// allow dialog to get created
		SA.listCreateUI ( myId, this.flow );
		
		// pref width and height
		var prefWidth = SA.getConfig ( obj, 'prefWidth' );
		var prefHeight = SA.getConfig ( obj, 'prefHeight' );
		aspectRatio = prefHeight / prefWidth;
		
		// get passed listener in config (if any)
		listener = SA.getConfig ( obj, 'listener' );
		
		// add Caption flag
		var addCap = SA.getConfig (obj, 'addCap');

		// get img caption of URL if passed
		var imgUrl = SA.getConfig (obj, 'imgUrl');
		var imgCap = SA.getConfig (obj, 'imgCap');
		if ( imgCap ) addCap = true;
		
		// add caption flag
		if ( addCap == true ) {
			captCompUI = getCaptCompUI (obj, imgCap);
		}
		
		var style = 'float:left;width:90px;font-size:90%;margin-right:5px;';
		if ( obj.style && obj.style.length> 0 )
			style = obj.style;
		
		var placeHolder = '';

		// get info
		if ( atomObj.info ) {
			placeHolder = 'placeholder="' + atomObj.info + '"'; 
		}
				
		var btText = SA.getConfig (obj, 'btText');
		if ( !btText ) {
			btText = 'Set Photo';
		}
		isNewlyAdded = true;
		
		// EDIT OP: assume the picture URL is in value 
		if ( imgUrl && imgUrl.length>0 ) {
			defaultPicUrl = App.util.getMediaUrl (imgUrl);
			// reset values
			atomObj.value = imgUrl;
			imgFle = undefined;
			isNewlyAdded = false;
			SA.fireEvent ( myId, { cmd:'loadExisting'} );
		}
		else {
			defaultPicUrl = 'app/res/icon/icon-preview.jpg';
		}
		
		var setPT = {name:'set-photo-'+myId, ac:'App.ButSmpl', style:style, 
				label:btText, config:{theme:'blank'} };
		/*
		var delPT = {name:'del-photo-'+myId, ac:'App.ButSmpl', style:'float:left;width:40px;font-size:90%;', 
				label:'Del', config:{theme:'blank'} };
		*/
		var setUT = {name:'set-utube-'+myId, ac:'App.ButSmpl', style:'font-size:90%;margin-right:5px;', 
				label:'YouTube', config:{theme:'blank'} };
		
		var remObj = {name:'rem-photo-'+myId, cmd:myId, ac:'App.Button', style:'font-size:90%;', 
				label:'Remove', config:{theme:'blank'} };
		
		var setPTHtml = SA.listCreateUI ( myId, setPT, null, true );
		setPTHtml = SA.injectClass ( setPTHtml, 'needsclick');
		
		//var delPTHtml = SA.listCreateUI ( myId, delPT, null, true );
		
		var setUTHtml = '';
		if ( SA.getConfig(obj, 'youTube') == true ) {
			var setUTHtml = SA.listCreateUI ( myId, setUT, null, true );
			setUTHtml = SA.injectClass ( setUTHtml, 'needsclick');
		}
		
		// get local css name (i.e. css name defined in this object)
		var cssCard = SA.localCss(this, 'card');
		var cssFrame = SA.localCss(this, 'frame');
		
		var mediaHtml = '';
		if ( isEmbedVideoUrl ( defaultPicUrl ) ) {
			mediaHtml = App.util.getYouTubeHtml ( defaultPicUrl );
		}
		else {
			mediaHtml = '<img  class="img-responsive" src="' + defaultPicUrl + '">' ;
		}
		
		var html =
		'<div id="' + myId + '" class="form-group">'+ 
			'<div class="col-md-12">' +
				'<div id="' + previewDiv + '" style="display:none" class="' + cssCard + '">' +
					mediaHtml + 
				'</div>' +
				'<div>' + setPTHtml + '<div id="captf-' + myId + '" />' +  
					'<input type="file" id="file-' + myId + '" style="display:none" />' +
					setUTHtml +
					//remHtml +
				'</div>'+
			'</div>' +			
		'</div>';
		
		return html;
	}
	
	/*
	 * Create atom comp UI
	 */
	function getCaptCompUI (atObj, capVal)
	{
		var capValue = capVal;
		if ( !capValue ) capValue = '';
		var ctext = {name:'cap-'+myId, ac:'App.TextArea', info:'Set caption..', value:capValue, 
				config: {style:'border-color:#f5f5f5;font-size:90%;', rows:1} };
		return SA.createUI (myId, ctext);
	}
		
	/*
	 * True for embedded video URL
	 */
	function isEmbedVideoUrl ( url )
	{
		return url.indexOf ('youtu') > 0 ;
	}
	
	/**
	 * getValue() needed for FORM atom component (work with FormHandler)
	 */
	this.getValue = function ()
	{
		if ( ytubeUrl )
			return ytubeUrl;
		
		if ( imgFile )
			return imgFile;
		else if ( atomObj.value )
			return atomObj.value;
	}
	
	/**
	 * getName() needed for FORM atom component  (work with FormHandler)
	 */
	this.getName = function()
	{
		return atomObj.name
	}
	
	/**
	 * Gets caption
	 */
	this.getCaption = function ()
	{
		var capComp = SA.lookupComponent ( 'cap-' + myId );
		return capComp.getValue();
	}
	
	/**
	 * Show a dialog with name
	 */
	function showDialog (  dialogName )
	{
		var dlg = SA.lookupComponent ( dialogName );
		if ( dlg ) {
			dlg.showDialog (true, '', 'appBanner' );
		}
		return dlg;
	}
	
	function hideDialog ()
	{
		var dlg = SA.lookupComponent ( 'youtube-dlg' );
		dlg.showDialog (false, '', 'appBanner');
	}	
	
	/**
	 * validation 
	 */
	function validate ( divId, atomList, data )
	{
		var msg = SA.validate.evalObj(atomList, data);
		if ( msg != '' ) {
			return false;
		}
		return true;
	}
	
	/**
	 * Notify when form is submitted
	 */
	this.notifySubmit = function ( actionAtom, atomList, dataObj )
	{
		if ( actionAtom.cmd == 'cmdUTubeUrl' ) {
			if ( validate ( 'commMsg', atomList, dataObj ) ) {
				ytubeUrl =  dataObj.youtubeUrl;
				var embedHtml = App.util.getYouTubeHtml ( ytubeUrl );
				setPreviewHtml ( embedHtml );
			}
		}
		// hide dialog
		hideDialog ();
	}
	
	/**
	 * Handle async. event 
	 */
	this.handleEvent = function ( event )
	{
		if ( event.cmd == 'loadExisting' ) {
			setPreviewImg ();
		}
	}
	
	this.handleEvent = function ( event ) 
	{
		if ( event.cmd == 'refresh' ) {
			var $pdiv = $('#'+previewDiv);
			var left = $pdiv.offset().left;
			var top = $pdiv.position().top;
			
			clipWidth = $pdiv.width() + 2;
			clipHeight = Math.round(clipWidth * aspectRatio);
	
			// image inside
			var $imageDiv = $( '#' + imageDiv );

			imageWidth = clipWidth;
			$pdiv.css ('height', clipHeight+'px')
			//$pdiv.css ('position', 'absolute' );

			$imageDiv.cropper({
		        viewMode: 3,
		        dragMode: 'move',
		        autoCropArea: 1,
		        restore: false,
		        modal: false,
		        guides: false,
		        highlight: false,
		        cropBoxMovable: false,
		        cropBoxResizable: false,
		        built: function () {
		        	$imageDiv.cropper("setCropBoxData", {  width: clipWidth, height: clipHeight });			        
		        }
			});
		}
	}
	
	function clearImage ()
	{
		imgFile = undefined;
		setPreviewImg ( undefined );
		$( '#file-'+myId ).val ( '' );
	}
	
	/**
	 * Set img source to new image
	 */
	function setPreviewImg ( newImageSrc ) 
	{
		var html = '';

		var imgStyle = 'class="img-responsive"';

		if ( !newImageSrc ) {
			html = '<img ' + imgStyle + ' id="' + imageDiv +'" src="' + defaultPicUrl + '">';
		}
		else {
			html = '<img ' + imgStyle + ' id="' + imageDiv +'" src="' + newImageSrc + '">';			
		}
		setPreviewHtml ( html );
		
		if ( listener && listener.performAction ) {
			if ( isNewlyAdded == true ) {
				listener.performAction ( myId, {cmd:'imgAdded'}, this );
				isNewlyAdded = false;
			}
			else if ( isNewlyAdded == false ) {
				listener.performAction ( myId, {cmd:'imgUpdated'}, this );
			}
		}
	}
	
	/**
	 * Set img source to new image
	 */
	function setPreviewHtml ( newHtml ) 
	{
		// show preview div
		var $prev = $('#' + previewDiv );
		$prev.html ( newHtml );
		$prev.fadeIn ( 'slow' );

		var $cap = $( '#captf-' + myId );
		var top = 5;
		
		var btPhoto = SA.lookupComponent ('set-photo-'+myId);
		btPhoto.setLabel ('Change', 
				{background:'rgba(200,200,200,0.4)', 'color':'black', 'border-color':'silver', width:'70px'} );
		btPhoto.moveTo ( $prev.position().left+5, top );
		
		// show caption comp
		if ( captCompUI ) {
			$cap.html ( captCompUI );
		}
		
		// only to handle (image resize and crop) 
		if ( aspectRatio && aspectRatio>0 ) {
			SA.fireEvent ( myId, {cmd:'refresh'} );
		}
	}
	
	/**
	 * Page just loaded this component
	 */
	this.postLoad = function ()
	{
		var $setPhoto = $( '#set-photo-'+myId);
		var $delPhoto = $( '#del-photo-'+myId);
		var $upload   = $( '#file-'+myId );
		var $setUTube = $( '#set-utube-'+myId);
		
		// do tap instead of click
		$setPhoto.hammer().bind("tap", function(event) {
			ytubeUrl = undefined;
			$upload.trigger('click');
		});
		
		// set youtube click event 
		$setUTube.click ( function (event) {
			showDialog ( 'youtube-dlg' );
		});
		
		// click on del
		$delPhoto.click (function (event) {
			listener.performAction ( myId, {cmd:'imgRemoved'}, this );
		});
		
		// upload photo changed event (when file is opened)
		$upload.change ( function (e) {
			e.preventDefault();

			imgFile = this.files[0],
			reader = new FileReader();
			reader.onload = function (event) {
				setPreviewImg ( event.target.result );
			};
			if ( imgFile )
				reader.readAsDataURL(imgFile);
			return false;
		});
	}	
}

