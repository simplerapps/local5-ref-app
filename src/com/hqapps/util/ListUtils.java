package com.hqapps.util;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

import com.hqapps.pres.ReqMsg;
import com.hqapps.pres.msg.Comment;
import com.hqapps.pres.msg.Service;

public class ListUtils 
{
	// this is always filtered out from client side
	private static final String DELIM = "~";	
	
	public static String listCompact ( List list)
	{
		if ( list==null || list.size()==0 )
			return "";
		
		StringBuilder sb = new StringBuilder (1024);
		for (int i=0; i<list.size(); i++ ) {
			sb.append(list.get(i).toString());
			sb.append(DELIM);
		}
		sb.setLength( sb.length() - DELIM.length() );
		return sb.toString();
	}
	
	public static ArrayList<String> listExtract ( String compVal ) 
	{
		if ( compVal==null || compVal.length()==0 )
			return null;
		
		ArrayList<String> list = new ArrayList<String>(10);
		String [] parts = compVal.split ( DELIM );
		for ( int i=0; i<parts.length; i++ ) {
			list.add( parts[i] );
		}
		return list;
	}
	
	public static String csvStringFromList ( List items )
	{
		if ( items==null || items.size()==0 )
			return "";
		
		StringBuilder sb = new StringBuilder (256);
		for (int i=0; i<items.size(); i++ ) {
			sb.append(items.get(i).toString());
			sb.append(',');
		}
		sb.setLength( sb.length()-1 );
		return sb.toString();
	}
	
	public static List<String> listFromCsvString ( String csvString )
	{
		if ( csvString!=null && csvString.length()> 0 ) {
			
			String [] parts = csvString.split(",");
			ArrayList<String> ret = new ArrayList<String> ( parts.length );
			for (int i=0; i<parts.length; i++ ) {
				ret.add( parts[i].trim() );
			}
			return ret;
		}
		return null;
	}
	
	public static void sortServices ( List<ReqMsg> svcList ) 
	{
		Collections.sort(svcList, new Comparator<ReqMsg>() {
			int result = 0;
			
			@Override 
			public int compare(ReqMsg o1, ReqMsg o2) {
				String t1 = ((Service)o1).getTitle();
				String t2 = ((Service)o2).getTitle();
				
				
				if ( t1!=null && t2!=null ) {
					result = t1.compareTo ( t2 );
				}
				return result;
			}
	    });
	}

	public static void sortComments ( List<Comment> commList ) 
	{
		Collections.sort(commList, new Comparator<Comment>() {
			int result = 0;
			
			@Override 
			public int compare(Comment o1, Comment o2) {
				if ( o1.getModified()!=null && o2.getModified()!=null ) {
					result = o1.getModified().compareTo ( o2.getModified() );
				}
				return result;
			}
	    });
	}
	
	public static void sort ( List<ReqMsg> list ) 
	{
		Collections.sort(list, new Comparator<ReqMsg>() {
			int result = 0;
			
			@Override 
			public int compare(ReqMsg o1, ReqMsg o2) {
				if ( o1.getModified()!=null && o2.getModified()!=null ) {
					result = o1.getModified().compareTo ( o2.getModified() );
				}
				return -result;
			}
	    });
	}
}

