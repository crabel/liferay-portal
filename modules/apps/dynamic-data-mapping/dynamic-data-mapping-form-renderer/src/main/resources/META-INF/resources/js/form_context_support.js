AUI.add(
	'liferay-ddm-form-renderer-context',
	function(A) {
		var AArray = A.Array;
		var AObject = A.Object;
		var FieldSettings = [
			'autosaveEnabled',
			'cacheable',
			'emailFromAddress',
			'emailFromName',
			'emailSubject',
			'emailToAddress',
			'filterable',
			'filterParameterName',
			'inputParameters',
			'outputParameters',
			'pagination',
			'paginationEndParameterName',
			'paginationStartParameterName',
			'password',
			'published',
			'redirectURL',
			'requireAuthentication',
			'requireCaptcha',
			'sendEmailNotification',
			'storageType',
			'timeout',
			'url',
			'username',
			'workflowDefinition'
		];
		var Renderer = Liferay.DDM.Renderer;

		var FieldTypes = Renderer.FieldTypes;
		var Util = Renderer.Util;

		var FormContextSupport = function() {};

		FormContextSupport.ATTRS = {
			context: {
				getter: '_getContext',
				setter: function(val) {
					var retVal = val;

					if (A.Lang.isString(val)) {
						retVal = JSON.parse(val);
					}

					return retVal;
				},
				valueFn: '_valueContext'
			},

			fields: {
				valueFn: '_valueFields'
			},

			visitor: {
				valueFn: '_valueVisitor'
			}
		};

		FormContextSupport.prototype = {
			initializer: function() {
				var instance = this;

				instance._eventHandlers.push(
					instance.on('contextChange', instance._onContextChange)
				);
			},

			destructor: function() {
				var instance = this;

				instance.disposeScheduled();

				instance.get('visitor').destroy();
			},

			disposeScheduled: function() {
				var instance = this;

				if (instance._scheduledToDisposal) {
					instance._scheduledToDisposal.forEach(function(component) {
						if (component.destroy) {
							component.destroy();
						}
					});

					instance._scheduledToDisposal = null;
				}
			},

			_createField: function(context, fieldsMap) {
				var instance = this;

				var name = Util.getFieldNameFromQualifiedName(context.name);

				var alreadyAdded = fieldsMap[name];

				var repeatedIndex = 0;

				if (alreadyAdded) {
					var repetitions = alreadyAdded[0].get('repetitions');

					repeatedIndex = repetitions.length;
				} else {
					fieldsMap[name] = [];
				}

				if (instance.get('viewMode')) {
					var editingLanguageId = instance.get('editingLanguageId');

					context.localizedValue = {};

					context.locale = editingLanguageId;
					context.localizable = false;
					context.localizedValue[editingLanguageId] = context.value;
				}

				var config = A.merge(context, {
					context: A.clone(context),
					parent: instance,
					portletNamespace: instance.get('portletNamespace'),
					repeatedIndex: repeatedIndex
				});

				var fieldType = FieldTypes.get(context.type);

				var fieldClassName = fieldType.get('className');

				var fieldClass = AObject.getValue(
					window,
					fieldClassName.split('.')
				);

				var field = new fieldClass(config);

				instance._scheduleFieldDisposal(field);

				fieldsMap[name].push(field);

				fieldsMap[name].forEach(function(
					repetition,
					index,
					repetitions
				) {
					repetition.set('repetitions', repetitions);
				});

				return alreadyAdded ? null : field;
			},

			_createFieldsFromContext: function(context) {
				var instance = this;

				var fields = [];

				var fieldsMap = {};

				var visitor = instance.get('visitor');

				visitor.set('fieldHandler', function(fieldContext) {
					var field = instance._createField(fieldContext, fieldsMap);

					if (field) {
						fields.push(field);
					}
				});

				visitor.visit();

				return fields;
			},

			_getContext: function(context) {
				var instance = this;

				var visitor = instance.get('visitor');

				visitor.set('pages', context.pages);

				visitor.set('fieldHandler', function(
					fieldContext,
					args,
					columnFieldContexts
				) {
					var field = instance.getField(
						fieldContext.fieldName,
						fieldContext.instanceId
					);

					if (field) {
						var repeatedSiblings = field.getRepeatedSiblings();

						repeatedSiblings.forEach(function(repeatedSibling) {
							if (repeatedSibling) {
								var repeatedContext = repeatedSibling.get(
									'context'
								);

								var foundFieldContext = AArray.find(
									columnFieldContexts,
									function(columnFieldContext) {
										return (
											columnFieldContext.fieldName ===
												repeatedContext.fieldName &&
											columnFieldContext.instanceId ===
												repeatedContext.instanceId
										);
									}
								);

								if (foundFieldContext) {
									A.mix(
										foundFieldContext,
										repeatedContext,
										true
									);
								} else {
									columnFieldContexts.push(repeatedContext);
								}
							}
						});

						instance._removeFieldContexts(
							columnFieldContexts,
							repeatedSiblings
						);
					}
				});

				visitor.visit();

				return context;
			},

			_onContextChange: function(event) {
				var instance = this;

				var context = event.newVal;

				var visitor = instance.get('visitor');

				AArray.invoke(instance.get('fields'), 'destroy');

				instance.disposeScheduled();

				visitor.set('pages', context.pages);

				instance.set(
					'fields',
					instance._createFieldsFromContext(context)
				);
			},

			_removeFieldContexts: function(
				columnFieldContexts,
				repeatedSiblings
			) {
				var removeContext = [];
				var repeatedContext = [];

				repeatedSiblings.forEach(function(context) {
					repeatedContext.push(context.get('context'));
				});

				columnFieldContexts.forEach(function(columnFieldContext) {
					if (
						FieldSettings.indexOf(columnFieldContext.fieldName) ===
						-1
					) {
						var foundFieldContext = AArray.find(
							repeatedContext,
							function(repeatedContext) {
								return (
									columnFieldContext.fieldName ===
										repeatedContext.fieldName &&
									columnFieldContext.instanceId ===
										repeatedContext.instanceId
								);
							}
						);

						if (!foundFieldContext) {
							removeContext.push(columnFieldContext);
						}
					}
				});

				for (var i in removeContext) {
					columnFieldContexts.splice(
						columnFieldContexts.indexOf(removeContext[i]),
						1
					);
				}
			},

			_scheduleFieldDisposal: function(field) {
				var instance = this;

				if (!instance._scheduledToDisposal) {
					instance._scheduledToDisposal = [];
				}

				instance._scheduledToDisposal.push(field);
			},

			_valueFields: function(val) {
				var instance = this;

				var context = instance.get('context');

				return instance._createFieldsFromContext(context);
			},

			_valueVisitor: function() {
				var instance = this;

				return new Liferay.DDM.LayoutVisitor();
			}
		};

		Liferay.namespace(
			'DDM.Renderer'
		).FormContextSupport = FormContextSupport;
	},
	'',
	{
		requires: [
			'liferay-ddm-form-renderer-layout-visitor',
			'liferay-ddm-form-renderer-types',
			'liferay-ddm-form-renderer-util'
		]
	}
);
