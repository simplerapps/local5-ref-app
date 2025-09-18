package com.hqapps.pns;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.logging.Logger;

import javax.servlet.ServletContext;

import com.hqapps.server.SystemServlet;
import com.notnoop.apns.APNS;
import com.notnoop.apns.ApnsDelegate;
import com.notnoop.apns.ApnsNotification;
import com.notnoop.apns.ApnsService;
import com.notnoop.apns.ApnsServiceBuilder;
import com.notnoop.apns.DeliveryError;
import com.notnoop.apns.PayloadBuilder;

public class PushNotification 
{
	private static final Logger log = Logger.getLogger(PushNotification.class.getName());

	private static ApnsService apnsService = null;
	
	private static PushNotification inst = new PushNotification();
	
	private ArrayList<String> androidDevIds = new ArrayList<String>();
	
	private PushNotification ()
	{}
	
	public static void init (ServletContext sctx) throws Exception
	{
		// init apple APNS service
		ApnPushNotification.init(sctx);
		
		// no need to init GCM service AFAIK
	}
	
	public static PushNotification getInst ()
	{
		return inst;
	}
		
	public void close () 
	{
		apnsService.stop ();
	}
	
	public void sendNotification ( List<String> deviceIds, String message, Long serviceId )
	{
		androidDevIds.clear();
		
		for ( Iterator<String> it=deviceIds.iterator(); it.hasNext(); ) {
			String devId = it.next();
			if ( devId.length() > 90  ) {
				androidDevIds.add ( devId );
				it.remove();
			}
		}
		
		try {
			// Do apple APNS first
			if ( deviceIds.size() > 0 ) {
				log.warning ("Sending APNS msgs #devices: " + deviceIds.size() );
				ApnPushNotification.getInst().sendNotification(deviceIds, message, serviceId);
			}
		}
		catch ( Exception ex ) {
			log.warning ("ERRORS Sending Notifications to APNS. Cause: " + ex.getMessage() );
		}

		try {
			// Do Android GCM next
			if ( androidDevIds.size() > 0 ) {
				log.warning ("Sending GCM msgs #devices: " + androidDevIds.size() );				
				GcmPushNotification.getInst().sendNotification(androidDevIds, message, serviceId);
			}
		}
		catch ( Exception ex ) {
			log.warning ("ERRORS Sending Notifications to GCM. Cause: " + ex.getMessage() );
		}
			
	}
}



