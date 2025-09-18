package com.hqapps.util;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.jdo.PersistenceManager;
import javax.servlet.http.HttpServletRequest;

import com.google.appengine.api.blobstore.BlobKey;
import com.google.appengine.api.blobstore.BlobstoreService;
import com.google.appengine.api.blobstore.BlobstoreServiceFactory;
import com.google.appengine.api.datastore.Blob;
import com.google.appengine.api.datastore.Key;
import com.google.gson.Gson;
import com.hqapps.entity.EntityManager;
import com.hqapps.pres.ReqMsg;
import com.hqapps.pres.msg.*;

import org.apache.commons.fileupload.FileItemStream;
import org.apache.commons.fileupload.FileItemIterator;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.apache.commons.fileupload.util.Streams;
import org.apache.commons.io.IOUtils;

public class ReqUtils 
{
	public static String dataFromStream(InputStream is) throws Exception 
	{
		final char[] buffer = new char[2048];
		final StringBuilder out = new StringBuilder();
		try {
			final Reader in = new InputStreamReader(is, "UTF-8");
			for (;;) {
				int rsz = in.read(buffer, 0, buffer.length);
				if (rsz < 0)
					break;
				out.append(buffer, 0, rsz);
			}
			return out.toString();			
		} 
		catch (UnsupportedEncodingException ex) {
			throw ex;
		} 
		catch (IOException ex) {
			throw ex;   
		}
	}
	
	public static String dataFromParams ( Map paramsMap )
	{
		Gson gson = new Gson();
		HashMap<String,Object> vals = new HashMap<String,Object>();
		
		for ( Iterator it=paramsMap.entrySet().iterator(); it.hasNext(); ) {
			Map.Entry entry = (Map.Entry)it.next();
			String value;
			if ( entry.getValue() instanceof String[] ) {
				value = ((String []) entry.getValue()) [0];
			}
			else {
				value = (String)entry.getValue();
			}
			vals.put ( (String)entry.getKey(), value);
		}
		return gson.toJson ( vals );
	}
	
	public static String getCompleteHost ( HttpServletRequest req )  throws Exception
	{
		String url = req.getScheme() + "://" + req.getServerName() ;
		Integer port = req.getServerPort();
		if ( port!=80 && port!=443 ) {
			url += ":" + port;
		}
		return url;
	}
	
	public static ReqMsg processMPartMessage ( HttpServletRequest req, ReqMsg msg )  throws Exception
	{
		if ( !msg.isMultipart() ) {
			return msg;
		}
		
		ServletFileUpload upload = new ServletFileUpload();
		FileItemIterator iter = upload.getItemIterator(req);
		
		HashMap<String,Object> values = new HashMap<String,Object>();
		
		// multi value map
		HashMap<String,List> mvalues = new HashMap<String,List>();
		int mvalIdx = -1;
		
		// Parse the request
		while (iter.hasNext())  
		{
		    FileItemStream item = iter.next();
		    String name = item.getFieldName();
		    InputStream stream = item.openStream();
		    
		    mvalIdx = name.indexOf ('-');

		    if (item.isFormField()) {
		    	if ( mvalIdx > 0 ) {
		    		addMVal (mvalues, name.substring(0,mvalIdx), Streams.asString(stream)  );
		    	}
		    	else {
		    		values.put(name, Streams.asString(stream) );
		    	}
		    } 
		    else {
		    	byte [] imgBytes = IOUtils.toByteArray(stream);
		    	int imageSize1 = imgBytes.length;
		    	
		    	// scale image to fit withing 1MB 
		    	if ( imageSize1 > 1000000 ) {
		    		imgBytes = ImageUtils.resizeImage(imgBytes);
		    	}
		    	
		    	Blob imageBlob = new Blob(imgBytes);
		    	Media image = new Media ();
		    	image.setName(name);
		    	image.setData(imageBlob); 
		    	image.setContentType(item.getContentType());
		    	
		    	Key imgKey = EntityManager.getInstance().storeImage(null, image);
		    	
		    	if ( mvalIdx > 0 ) {
		    		addMVal (mvalues, name.substring(0,mvalIdx), imgKey.getId() );
		    	}
		    	else {
		    		values.put(name, imgKey.getId());
		    	}
		    }		    
		}
	    // deal with multi-values
	    if ( mvalues.size() > 0 ) {
	    	for ( Iterator it=mvalues.keySet().iterator(); it.hasNext(); ) {
	    		String key = (String)it.next();
	    		values.put( key+"List", mvalues.get(key) );
	    	}
	    }
		
		// Construct the msg object from values map 
		msg.fromDataMap(values);
		return msg;
	}
	
	private static void addMVal (Map<String,List>mvals, String name, Object val) 
	{
		List<Object> l = (List<Object>)mvals.get( name );
		if ( l == null ) {
			l = new ArrayList<Object>(5);
			mvals.put(name, l );
		}
		l.add (val);
	}

}

