package com.hqapps.util;

import java.util.HashMap;

public class AdminUtils 
{
	private static final HashMap<String,String> superAdmins = new HashMap<String,String>();
	
	static {
		superAdmins.put("sami@yahoo.com", "");
		superAdmins.put("sadranly@gmail.com", "" );		
	}
	
	/**
	 * Add super admins to the list (if not there)
	 * @param adminIds
	 * @return
	public static String addSuperAdmins ( String adminIds )
	{
		StringBuilder sb = new StringBuilder (2048);
		sb.append(adminIds);
		for ( int i=0; i<SUPER_ADMINS.length; i++ ) {
			if ( sb.indexOf( SUPER_ADMINS[i] ) < 0 ) {
				sb.append(',').append(SUPER_ADMINS[i]);
			}
		}
		return sb.toString();
	}
	*/
	
	public static boolean isSuperAdmin ( String adminId )
	{
		return superAdmins.get( adminId ) != null;
	}
	
}






