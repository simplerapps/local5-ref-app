package com.hqapps.pns;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
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

class ApnPushNotification 
{
	private static final Logger log = Logger.getLogger(ApnPushNotification.class.getName());

	private static ApnsService apnsService = null;
	
	private static ApnPushNotification inst = new ApnPushNotification();
	
	private ApnPushNotification ()
	{}
	
	public static void init (ServletContext sctx) throws Exception
	{
		InputStream certificate = sctx.getResourceAsStream ( "/WEB-INF/data/apns-push.p12" );
		
		if ( certificate != null ) {
			apnsService = com.notnoop.apns.APNS.newService()
			        .withCert(certificate, new String("password123"))
			        .withAppleDestination(true)			// false developer
			        .withNoErrorDetection().build();
		}
		
		if ( apnsService == null ) {
			throw new IOException ( "APNS Services API not initialized properly" );
		}
		
		// starting apns service (it is NOP)
		apnsService.start();
		
		//apnsService.testConnection();
	}
	
	static ApnPushNotification getInst ()
	{
		return inst;
	}
	
	private ApnsDelegate getDelegate() 
	{
	    return new ApnsDelegate() {
	        public void notificationsResent(int resendCount) {
	            log.warning(">>resendCount=" +  resendCount);
	        }

	        public void messageSent(ApnsNotification message, boolean resent) {
	        	log.warning(">>Message sent. Payload=" + message);
	        }

	        public void messageSendFailed(ApnsNotification message, Throwable e) {
	        	log.warning(">>Message send failed. Message=" +  message.toString() + ", reason=" + 
	        			e.getLocalizedMessage() );
	        }

	        public void cacheLengthExceeded(int newCacheLength) {
	        	log.warning(">>newCacheLength = " + newCacheLength);
	        }

			@Override
			public void connectionClosed (DeliveryError e, int messageIdentifier) {
				// TODO Auto-generated method stub
				log.warning(">>connection closed. Error: " + e.toString() );
			}
	    };
	}
	
	public void close () 
	{
		apnsService.stop ();
	}
	
	public void sendNotification ( List<String> deviceIds, String message, Long serviceId )
	 	throws Exception
	{
		String payload = APNS.newPayload().alertBody(message)
				.customField("serviceId", String.valueOf(serviceId))
				.build();
		
		//ApnsNotification notif = apnsService.push(token, payload );
		apnsService.push(deviceIds, payload );
	}
}



