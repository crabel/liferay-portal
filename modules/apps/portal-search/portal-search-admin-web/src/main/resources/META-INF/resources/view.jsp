<%--
/**
 * Copyright (c) 2000-present Liferay, Inc. All rights reserved.
 *
 * This library is free software; you can redistribute it and/or modify it under
 * the terms of the GNU Lesser General Public License as published by the Free
 * Software Foundation; either version 2.1 of the License, or (at your option)
 * any later version.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 * details.
 */
--%>

<%@ include file="/init.jsp" %>

<%
SearchAdminDisplayContext searchAdminDisplayContext = (SearchAdminDisplayContext)request.getAttribute(WebKeys.PORTLET_DISPLAY_CONTEXT);

String selectedTab = searchAdminDisplayContext.getSelectedTab();
%>

<clay:navigation-bar
	inverted="<%= true %>"
	navigationItems="<%= searchAdminDisplayContext.getNavigationItemList() %>"
/>

<c:choose>
	<c:when test='<%= selectedTab.equals("index-actions") %>'>
		<liferay-util:include page="/index_actions.jsp" servletContext="<%= application %>" />
	</c:when>
	<c:when test='<%= selectedTab.equals("field-mappings") %>'>
		<liferay-util:include page="/field_mappings.jsp" servletContext="<%= application %>" />
	</c:when>
</c:choose>