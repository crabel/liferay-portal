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

<%@ include file="/message_boards/init.jsp" %>

<%
MBCategory category = (MBCategory)request.getAttribute(WebKeys.MESSAGE_BOARDS_CATEGORY);

long categoryId = MBUtil.getCategoryId(request, category);

MBCategoryDisplay categoryDisplay = new MBCategoryDisplay(scopeGroupId, categoryId);

PortletURL portletURL = renderResponse.createRenderURL();

portletURL.setParameter("mvcRenderCommandName", "/message_boards/view_statistics");
portletURL.setParameter("mbCategoryId", String.valueOf(categoryId));
%>

<liferay-util:include page="/message_boards/nav.jsp" servletContext="<%= application %>" />

<div class="main-content-body">
	<h3><liferay-ui:message key="statistics" /></h3>

	<liferay-ui:panel-container
		cssClass="statistics-panel"
		extended="<%= false %>"
		id="messageBoardsStatisticsPanelContainer"
		markupView="lexicon"
		persistState="<%= true %>"
	>
		<liferay-ui:panel
			collapsible="<%= true %>"
			cssClass="statistics-panel-content"
			extended="<%= true %>"
			id="messageBoardsGeneralStatisticsPanel"
			markupView="lexicon"
			persistState="<%= true %>"
			title="general"
		>
			<dl>
				<dt>
					<liferay-ui:message key="categories" />:
				</dt>
				<dd>
					<%= numberFormat.format(categoryDisplay.getAllCategoriesCount()) %>
				</dd>
				<dt>
					<c:choose>
						<c:when test="<%= MBStatsUserLocalServiceUtil.getMessageCountByGroupId(scopeGroupId) == 1 %>">
							<liferay-ui:message key="post" />:
						</c:when>
						<c:otherwise>
							<liferay-ui:message key="posts" />:
						</c:otherwise>
					</c:choose>
				</dt>
				<dd>
					<%= numberFormat.format(MBStatsUserLocalServiceUtil.getMessageCountByGroupId(scopeGroupId)) %>
				</dd>
				<dt>
					<liferay-ui:message key="participants" />:
				</dt>
				<dd>
					<%= numberFormat.format(MBStatsUserLocalServiceUtil.getStatsUsersByGroupIdCount(scopeGroupId)) %>
				</dd>
			</dl>
		</liferay-ui:panel>

		<liferay-ui:panel
			collapsible="<%= true %>"
			cssClass="statistics-panel-content"
			extended="<%= true %>"
			id="messageBoardsTopPostersPanel"
			markupView="lexicon"
			persistState="<%= true %>"
			title="top-posters"
		>
			<liferay-ui:search-container
				emptyResultsMessage="there-are-no-top-posters"
				iteratorURL="<%= portletURL %>"
				total="<%= MBStatsUserLocalServiceUtil.getStatsUsersByGroupIdCount(scopeGroupId) %>"
			>
				<liferay-ui:search-container-results
					results="<%= MBStatsUserLocalServiceUtil.getStatsUsersByGroupId(scopeGroupId, searchContainer.getStart(), searchContainer.getEnd()) %>"
				/>

				<liferay-ui:search-container-row
					className="com.liferay.message.boards.model.MBStatsUser"
					keyProperty="statsUserId"
					modelVar="statsUser"
				>
					<%@ include file="/message_boards/top_posters_user_display.jspf" %>
				</liferay-ui:search-container-row>

				<liferay-ui:search-iterator
					displayStyle="descriptive"
					markupView="lexicon"
				/>
			</liferay-ui:search-container>
		</liferay-ui:panel>
	</liferay-ui:panel-container>
</div>

<%
PortalUtil.setPageSubtitle(LanguageUtil.get(request, "statistics"), request);
PortalUtil.addPortletBreadcrumbEntry(request, LanguageUtil.get(request, TextFormatter.format("statistics", TextFormatter.O)), portletURL.toString());
%>