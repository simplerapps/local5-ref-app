package com.hqapps.server;

import java.io.IOException;
import java.util.logging.Logger;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.*;

import com.hqapps.pns.PushNotification;
import com.hqapps.pres.handler.MsgProcessor;

@SuppressWarnings("serial")
public class SystemServlet extends HttpServlet 
{	
	private static final Logger log = Logger.getLogger(SystemServlet.class.getName());

	public void init(ServletConfig config) throws ServletException 
	{
		super.init(config);
		
		System.out.println( "LOCAL-5 Services Initializing ..");
		
		try {
			PushNotification.init ( this.getServletContext() );
		}
		catch ( Exception ex ) {
			log.severe("APNS Services did not initialize properly. Cause: " + ex.toString()  );
			throw new ServletException (ex );
		}
		
		System.out.println( "LOCAL-5 Services Initialization complete.");
	}
	
	public void destroy ()
	{
		super.destroy();
		PushNotification.getInst().close();
	}
	
	public void doGet (HttpServletRequest req, HttpServletResponse resp)
		throws IOException 
	{
		resp.setContentType("text/plain");
		resp.getWriter().println("Local-5 Services version 1.0.");		
	}
}
