package com.hqapps.pns;

import java.util.List;
import java.util.logging.Logger;

import com.google.android.gcm.server.Message;
import com.google.android.gcm.server.MulticastResult;
import com.google.android.gcm.server.Sender;

class GcmPushNotification 
{
    // The SENDER_ID here is the "Browser Key" that was generated when I
    // created the API keys for my Google APIs project.
    private static final String SERVER_API_KEY = "AIzaSyAYEXPc_kn0mb0Udu91w11HaNsPkSPhmb0";
    
	private static final Logger log = Logger.getLogger(GcmPushNotification.class.getName());
    
    private static GcmPushNotification inst = new GcmPushNotification();
     
    /**
     * GcmPushNotification
     */
    private GcmPushNotification() 
    {}
    
    static GcmPushNotification getInst ()
    {
    	return inst;
    }
    
    /**
     * Send notification to GCM service
     * @param deviceIds
     * @param message
     * @param serviceId
     */
	public void sendNotification ( List<String> deviceIds, String message, Long serviceId )
		throws Exception
	{
        // We'll collect the "CollapseKey" and "Message" values from our JSP page
        String collapseKey = String.valueOf(serviceId);
         	 
        // Instance of com.android.gcm.server.Sender, that does the
        // transmission of a Message to the Google Cloud Messaging service.
        Sender sender = new Sender(SERVER_API_KEY);
         
        // This Message object will hold the data that is being transmitted
        // to the Android client devices.  For this demo, it is a simple text
        // string, but could certainly be a JSON object.
        Message reqMessage = new Message.Builder()
         
        // If multiple messages are sent using the same .collapseKey()
        // the android target device, if it was offline during earlier message
        // transmissions, will only receive the latest message for that key when
        // it goes back on-line.
        .collapseKey(collapseKey)
        .timeToLive(30)
        .delayWhileIdle(true)
        .addData("message", message)
        .build();
         
        // use this for multicast messages.  The second parameter
        // of sender.send() will need to be an array of register ids.
        MulticastResult result = sender.send(reqMessage, deviceIds, 1);
         
        if (result.getResults() != null) {
            int canonicalRegId = result.getCanonicalIds();
            if (canonicalRegId != 0) {
                 
            }
        } else {
            int error = result.getFailure();
            throw new Exception ( "GCM Broadcast failure: " + error );
        }
    }	 
}


