package com.hqapps.pres.handler;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Query.FilterPredicate;
import com.hqapps.entity.EntityManager;
import com.hqapps.entity.UserCache;
import com.hqapps.pres.Method;
import com.hqapps.pres.ReqMsg;
import com.hqapps.pres.RespMsg;
import com.hqapps.pres.RespMsg.Error;
import com.hqapps.pres.RespMsg.Status;
import com.hqapps.pres.msg.Admin;
import com.hqapps.pres.msg.Service;
import com.hqapps.util.AdminUtils;
import com.hqapps.util.ListUtils;
import com.hqapps.util.StrUtils;
import com.google.appengine.api.datastore.Query.CompositeFilterOperator;
import com.google.appengine.api.datastore.Query.Filter;
import com.google.appengine.api.datastore.Query.FilterPredicate;
import com.google.appengine.api.datastore.Query.FilterOperator;


public class ServiceProc extends DefaultProc 
{
	private static final Logger log = Logger.getLogger(MsgProcessor.class.getName());
	
	/**
	 * handle User resource messages
	 * @param method
	 * @param user
	 * @return
	 */
	@Override
	public RespMsg process ( Method method, ReqMsg msg, String authUserId ) 
			throws Exception
	{
		EntityManager em = EntityManager.getInstance();
		
		Service svc = (Service)msg;
		
		if ( authUserId == null ) {
			return new RespMsg (Status.ERROR, Error.NEED_TO_AUTHENTICATE, "Need to Authenticate" );
		}		

		String authId = authUserId.toLowerCase();

		if ( method  == Method.GET ) {
			
			// search for title=??
			if ( !StrUtils.isEmpty(svc.getTitle()) ) {
				Filter filter = new FilterPredicate("title",FilterOperator.EQUAL, svc.getTitle());
				Service ret= (Service)em.loadObject(msg.getClass(), filter);
				ret.setAdUserIds(loadAdminsAsCsv(ret.getId()));
				return new RespMsg ( ret );
			}
			// ID found: get specific service for ID
			else if ( svc.getId() != null ) {
				Service ret = (Service)em.loadObject(msg.getId(), msg.getRelClass() );
				ret.setAdUserIds(loadAdminsAsCsv(ret.getId()));
				return new RespMsg ( ret );
			}
			// No ID: get a bunch of services
			else if ( svc.getId() == null ) 
			{
				List<ReqMsg> resps = null;
				if ( svc.getGroupId() !=null && svc.getGroupId()> 0 ) {
					// FILTER: filter per groupId if passed
					Filter filter = new FilterPredicate("groupId",FilterOperator.EQUAL, svc.getGroupId());
					resps = em.loadObjects(msg.getRelClass(), 100, filter);					
				}
				
				// LOAD ALL: if no specific user or super admin logged in user
				else if ( StrUtils.isEmpty(svc.getUserId()) ) {
					//Filter f = new FilterPredicate ("groupId", FilterOperator.LESS_THAN, new Long(1) );
					resps = em.loadObjects(msg.getRelClass(), 100, null);
					resps = removePrivateServices ( resps );
				}
				
				// Passed UserId: filter per user
				else if ( !StrUtils.isEmpty(svc.getUserId()) ) {
					// FILTER: filter for my services (as logged in user)
					Filter f1 = new FilterPredicate("userId",FilterOperator.EQUAL, authId);
					resps = em.loadObjects(msg.getRelClass(), 100, f1 );
				}
				
				// sort before returning
				if ( resps != null ) {
					ListUtils.sortServices( resps );
					return new RespMsg ( resps );
				}
			}
		}
		else if ( method == Method.POST || method == Method.PUT ) {
			RespMsg resp = null;
			
			String adminIds = svc.getAdUserIds();

			// add auth id if not there
			if ( StrUtils.isEmpty(adminIds)  ) {
				adminIds = authId;
			}
			else {
				adminIds = adminIds.toLowerCase();
				if ( adminIds.indexOf(authId) < 0 ) {
					adminIds += "," + authId;
				}
			}
			// list from csv string
			List<String> idList = ListUtils.listFromCsvString(adminIds);

			// POST: Person authenticated is the owner of service by default
			if ( method == Method.POST ) {
				svc.setUserId(authId);
				resp = super.process(method, msg, authId);
				svc = (Service)resp.getRespData();
				
				// new admins
				updAdminIdsForService (idList,  svc.getId(), false);
			}
			else {	
				resp = super.process(method, msg, authId);
				
				// update admins
				updAdminIdsForService (idList,  svc.getId(), true);
			}
			
			// remove unwanted admins from cache
			if ( idList != null ) {
				for (int i=0; i<idList.size(); i++ ) {
					UserCache.getInst().flushAdminServices(idList.get(i));
				}
			}
			
			// process update
			return resp; 
		}
		return new RespMsg (Status.ERROR, "Missing id or message not Found"  );
	}
	
	/**
	 * Remove all private groups services
	 * @param svcList
	 * @return
	 */
	private List<ReqMsg> removePrivateServices ( List<ReqMsg> svcList )
	{
		for ( Iterator<ReqMsg> it=svcList.iterator(); it.hasNext(); ) {
			Service svc = (Service)it.next();
			if ( svc.getGroupId()!=null && svc.getGroupId() > 0L ) {
				it.remove();
			}
		}
		return svcList;
	}
	
	/**
	 * Update admin ids list 
	 * @param idList
	 * @param serviceId
	 * @param isUpdate
	 */
	private void updAdminIdsForService (List<String>idList,  Long serviceId, boolean isUpdate) 
			throws Exception
	{
		HashMap<String,String> idsMap = new HashMap<String,String>();
		// rem duplicates
		for (int i=0; i<idList.size(); i++ ) {
			String id = idList.get(i);
			if ( idsMap.get(id) == null ) {
				idsMap.put(id, "");
			}
		}
		// now upate
		EntityManager em = EntityManager.getInstance();	
		List <ReqMsg> res = loadAdmins ( serviceId );
		
		// add new
		if (res==null || res.size()==0 || isUpdate == false) {
			for (Iterator<String> it = idsMap.keySet().iterator(); it.hasNext(); ) {
				Admin ad = new Admin ();
				ad.setServiceId(serviceId);
				ad.setUserId(it.next());
				em.storeNew(null, Admin.KIND, ad.toDataMap() );
			}
			return;
		}
		
		// update, remove all extra admins
		for ( int i=0; i<res.size(); i++ ) {
			Admin ad = (Admin)res.get(i);
			// admin no longer exists, delete
			if ( idsMap.get(ad.getUserId()) == null ) {
				em.deleteObject(ad.getId(), Admin.KIND);
			}
			else {
				idsMap.remove(ad.getUserId());
			}
		}
		// update, add all new admins
		if ( idsMap.size() > 0 ) {
			for (Iterator<String> it = idsMap.keySet().iterator(); it.hasNext(); ) {
				Admin ad = new Admin ();
				ad.setServiceId(serviceId);
				ad.setUserId(it.next());
				em.storeNew(null, Admin.KIND, ad.toDataMap() );
			}
		}
	}
	

	/**
	 * Load all admins for this service and return on form of Csv list
	 * @param serviceId
	 * @return
	 * @throws Exception
	 */
	private String loadAdminsAsCsv ( Long serviceId ) throws Exception
	{
		List <ReqMsg> res = loadAdmins ( serviceId );
		
		if ( res!=null && res.size()>0 ) {
			ArrayList<String> ids = new ArrayList<String>(res.size());
			for ( int i=0; i<res.size(); i++ ) {
				Admin ad = (Admin)res.get(i);
				ids.add( ad.getUserId() );
			}
			return ListUtils.csvStringFromList(ids);
		}
		return "";
	}
	
	private List<ReqMsg> loadAdmins ( Long serviceId ) throws Exception
	{
		EntityManager em = EntityManager.getInstance();		
		Filter filter = new FilterPredicate("serviceId",FilterOperator.EQUAL, serviceId );
		List<ReqMsg> res = em.loadObjects(Admin.class, 30,  filter);
		return res;
	}
}
