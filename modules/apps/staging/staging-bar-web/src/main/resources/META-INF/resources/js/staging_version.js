AUI.add(
	'liferay-staging-version',
	function(A) {
		var StagingBar = Liferay.StagingBar;

		var MAP_CMD_REVISION = {
			redo: 'redo_layout_revision',
			undo: 'undo_layout_revision'
		};

		var MAP_TEXT_REVISION = {
			redo: Liferay.Language.get(
				'are-you-sure-you-want-to-redo-your-last-changes'
			),
			undo: Liferay.Language.get(
				'are-you-sure-you-want-to-undo-your-last-changes'
			)
		};

		A.mix(StagingBar, {
			destructor: function() {
				var instance = this;

				instance._cleanup();
			},

			_cleanup: function() {
				var instance = this;

				if (instance._eventHandles) {
					A.Array.invoke(instance._eventHandles, 'detach');
				}
			},

			_getNotification: function() {
				var instance = this;

				var notification = instance._notification;

				if (!notification) {
					notification = new Liferay.Notice({
						closeText: false,
						content: Liferay.Language.get(
							'there-was-an-unexpected-error.-please-refresh-the-current-page'
						),
						noticeClass: 'hide',
						timeout: 10000,
						toggleText: false,
						type: 'warning',
						useAnimation: true
					});

					instance._notification = notification;
				}

				return notification;
			},

			_onInit: function(event) {
				var instance = this;

				instance._cleanup();

				var namespace = instance._namespace;

				var eventHandles = [
					Liferay.on(
						namespace + 'redo',
						instance._onRevisionChange,
						instance,
						'redo'
					),
					Liferay.on(
						namespace + 'submit',
						instance._onSubmit,
						instance
					),
					Liferay.on(
						namespace + 'undo',
						instance._onRevisionChange,
						instance,
						'undo'
					),
					Liferay.on(
						namespace + 'viewHistory',
						instance._onViewHistory,
						instance
					)
				];

				var layoutRevisionDetails = A.byIdNS(
					namespace,
					'layoutRevisionDetails'
				);

				var layoutRevisionStatus = A.byIdNS(
					namespace,
					'layoutRevisionStatus'
				);

				if (layoutRevisionDetails) {
					eventHandles.push(
						Liferay.after('updatedLayout', function(event) {
							A.io.request(
								instance.markAsReadyForPublicationURL,
								{
									on: {
										failure: function(event, id, obj) {
											layoutRevisionDetails.setContent(
												Liferay.Language.get(
													'there-was-an-unexpected-error.-please-refresh-the-current-page'
												)
											);
										},
										success: function(event, id, obj) {
											var response = this.get(
												'responseData'
											);

											layoutRevisionDetails.plug(
												A.Plugin.ParseContent
											);

											layoutRevisionDetails.setContent(
												response
											);

											Liferay.fire('updatedStatus');
										}
									}
								}
							);
						})
					);
				}

				if (layoutRevisionStatus) {
					Liferay.after('updatedStatus', function(event) {
						A.io.request(instance.layoutRevisionStatusURL, {
							on: {
								failure: function(event, id, obj) {
									layoutRevisionStatus.setContent(
										Liferay.Language.get(
											'there-was-an-unexpected-error.-please-refresh-the-current-page'
										)
									);
								},
								success: function(event, id, obj) {
									var response = this.get('responseData');

									layoutRevisionStatus.plug(
										A.Plugin.ParseContent
									);

									layoutRevisionStatus.setContent(response);
								}
							}
						});
					});
				}

				instance._eventHandles = eventHandles;
			},

			_onRevisionChange: function(event, type) {
				var instance = this;

				var cmd = MAP_CMD_REVISION[type];
				var confirmText = MAP_TEXT_REVISION[type];

				if (confirm(confirmText)) {
					instance._updateRevision(
						cmd,
						event.layoutRevisionId,
						event.layoutSetBranchId
					);
				}
			},

			_onSubmit: function(event) {
				var instance = this;

				var namespace = instance._namespace;

				var layoutRevisionDetails = A.byIdNS(
					namespace,
					'layoutRevisionDetails'
				);

				var layoutRevisionInfo = layoutRevisionDetails.one(
					'.layout-revision-info'
				);

				if (layoutRevisionInfo) {
					layoutRevisionInfo.addClass('loading');
				}

				var submitLink = A.byIdNS(namespace, 'submitLink');

				if (submitLink) {
					submitLink.html(Liferay.Language.get('loading') + '...');
				}

				A.io.request(event.publishURL, {
					after: {
						failure: function() {
							layoutRevisionDetails.addClass(
								'alert alert-danger'
							);

							layoutRevisionDetails.setContent(
								Liferay.Language.get(
									'there-was-an-unexpected-error.-please-refresh-the-current-page'
								)
							);
						},
						success: function() {
							if (event.incomplete) {
								location.href = event.currentURL;
							} else {
								Liferay.fire('updatedLayout');
							}
						}
					}
				});
			},

			_onViewHistory: function(event) {
				Liferay.Util.openWindow({
					dialog: {
						after: {
							destroy: function(event) {
								window.location.reload();
							}
						},
						destroyOnHide: true
					},
					title: Liferay.Language.get('history'),
					uri: StagingBar.viewHistoryURL
				});
			},

			_updateRevision: function(
				cmd,
				layoutRevisionId,
				layoutSetBranchId
			) {
				var instance = this;

				A.io.request(
					themeDisplay.getPathMain() + '/portal/update_layout',
					{
						data: {
							cmd: cmd,
							doAsUserId: themeDisplay.getDoAsUserIdEncoded(),
							layoutRevisionId: layoutRevisionId,
							layoutSetBranchId: layoutSetBranchId,
							p_auth: Liferay.authToken,
							p_l_id: themeDisplay.getPlid(),
							p_v_l_s_g_id: themeDisplay.getSiteGroupId()
						},
						on: {
							failure: function() {
								instance._getNotification().show();
							},
							success: function(event, id, obj) {
								window.location.reload();
							}
						}
					}
				);
			}
		});

		Liferay.on('initStagingBar', StagingBar._onInit, StagingBar);
	},
	'',
	{
		requires: ['aui-button', 'liferay-staging']
	}
);
