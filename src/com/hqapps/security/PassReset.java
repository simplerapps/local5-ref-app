package com.hqapps.security;

import java.io.UnsupportedEncodingException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.NoSuchProviderException;
import java.security.SecureRandom;

import java.util.Properties;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.AddressException;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import javax.servlet.http.HttpServletRequest;

import com.hqapps.entity.EntityManager;
import com.hqapps.pres.RespMsg;
import com.hqapps.pres.msg.User;
import com.hqapps.server.ResourceServlet;
import com.hqapps.util.Base64Coder;
import com.hqapps.util.ReqUtils;

public class PassReset 
{
	private static final Logger log = Logger.getLogger(PassReset.class.getName());
	
	public static void sendResetEmail ( HttpServletRequest req, User uinfo )
	{
		Properties props = new Properties();
		Session session = Session.getInstance(props);
	
		try {
			String sirName = EntityManager.getInstance().getUserNames(uinfo);
			String fname = uinfo.getFirstName()==null? "user" : uinfo.getFirstName();
			
		    Message msg = new MimeMessage(session);
			msg.setFrom(new InternetAddress( "hqapps.support@gmail.com", "Local5 Team"));
		    msg.addRecipient(Message.RecipientType.TO,
		    		new InternetAddress(uinfo.getEmail(), sirName));
		    msg.setSubject("Resetting your 'Local5' password");
		    
		    String resetLink = ReqUtils.getCompleteHost(req) + "/?reset=" + createRecoverToken(
		    		uinfo.getEmail(), uinfo.getAuthToken() );
		    log.warning ("SENT TO name:" + sirName + ", address:"  + uinfo.getEmail() );
		    
		    String body = "Dear " + fname + "\n\nWe are resetting your password based on your request. Here is the reset link: " + resetLink + 
		    		"\n\nIMPORTANT NOTE: If you did not request a password reset link, please do not click on the link and send us an email to: services@hqapps.com" + 
		    		"\n\nBest,\nThe Local5 Team";
		    
		    log.warning ("MAIL BODY: " + body );
		    
		    msg.setText( body );
		    Transport.send(msg);
		} 
		catch (UnsupportedEncodingException e) {
			log.log(Level.SEVERE, "Error sending email1", e);
		} 
		catch (AddressException e) {
			log.log(Level.SEVERE, "Error sending email2", e);
		} 
		catch (MessagingException e) {
			log.log(Level.SEVERE, "Error sending email3", e);
		}
		catch ( Exception e ) {
			log.log(Level.SEVERE, "Error sending email4", e);			
		}
	}
	
	public static String decodeToken ( String token )
	{
		String decoded = Base64Coder.decodeString (token );
		return decoded;
	}
	
	public static String encodeToken ( String token )
	{
		return Base64Coder.encodeString ( token );
	}
	
	public static String getEmailFromTok ( String decToken )
	{
		int i0 = decToken.indexOf(':');
		int i1 = decToken.indexOf('-', i0+5);
		if ( i0>0 && i1>0 ) {
			return decToken.substring(i0+1, i1 );
		}
		return "";
	}
	
	public static String getSecretFromToken ( String decToken )
	{
		int idx = decToken.indexOf('-');
		if ( idx > 0 ) {
			String secret = decToken.substring(idx+1);
			secret = secret.substring(0, secret.length()-6); 
			return secret;
		}
		return "";
	}
	
	public static String createSecurityToken ( String email, String authTok )
	{
		long time = System.currentTimeMillis();
		String timeStr = Long.toHexString(time);
		
		String token = timeStr + ":" + email + "-" + authTok + timeStr.substring(timeStr.length()-6);
		String tokenEncoded = encodeToken ( token );
		
		//System.out.println( "Encoded = " + tokenEncoded );
		return tokenEncoded;
	}
	
	public static String createRecoverToken ( String email, String userSalt)
	{
		return createSecurityToken ( email, userSalt );
	}
	
	public static boolean validateRecoverToken ( String decToken, String userSalt )
	{
		int idx = decToken.indexOf('-');
		//System.out.println( "Decoded = " + decToken );		
		if ( idx > 0 ) {
			String salt = decToken.substring(idx+1);
			salt = salt.substring(0, salt.length()-6); 

			return salt.equals(userSalt );  
		}
		return false;
	}
	
	public static void main ( String [] args )
	{
		String userSalt = "[B@5ebb55e1"; 
		
		String tok1 = createRecoverToken ( "sami@yahoo.com", userSalt );
		System.out.println ( "Tok1 = " + tok1 );
		
		for ( int i=0; i<10000000L; i++ );
		String tok2 = createRecoverToken ( "sami@yahoo.com", userSalt );
		System.out.println ( "Tok2 = " + tok2 );
		
		String dtok1 = decodeToken ( tok1 );
		System.out.println ( "D-Tok1 =" + dtok1 );
		
		String dtok2 = decodeToken ( tok2 );
		System.out.println ( "D-Tok2 =" + dtok2 );
		
		boolean valid1 = validateRecoverToken (dtok1, userSalt );
		boolean valid2 = validateRecoverToken (dtok2, userSalt );
		
		System.out.println( "valid1=" + valid1 + ", valid2=" + valid2 );
		
		// login token stuff
		String lTok1 = createSecurityToken ( "sami@yahoo.com", "ab0ecdf2ed3bde70ad1ef462b6c92be4" );
		System.out.println ( "lTok1 = " + lTok1 );
		
		String dlTok1 = decodeToken ( lTok1 );
		System.out.println ( "d-lTok1 = " + dlTok1 );
		System.out.println ( "ltok email: " + getEmailFromTok(dlTok1) );
		System.out.println ( "ltok secret: " + getSecretFromToken(dlTok1) );
	}
}
