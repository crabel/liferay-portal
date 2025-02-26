AUI.add(
	'liferay-ddm-form-renderer-field-validation',
	function(A) {
		var Lang = A.Lang;

		var FieldValidationSupport = function() {};

		FieldValidationSupport.ATTRS = {
			required: {
				state: true,
				value: false
			},

			valid: {
				value: true
			}
		};

		FieldValidationSupport.prototype = {
			initializer: function() {
				var instance = this;

				instance._eventHandlers.push(
					instance.after('blur', instance._afterBlur),
					instance.after('validChange', instance._afterValidChange)
				);
			},

			hasErrors: function() {
				var instance = this;

				return (
					instance.get('enabled') &&
					instance.get('visible') &&
					!instance.get('valid')
				);
			},

			validate: function(callback) {
				var instance = this;

				var evaluator = instance.get('evaluator');

				if (!instance.get('readOnly') && evaluator) {
					evaluator.evaluate(instance, function(result) {
						if (callback) {
							var hasErrors = instance.hasErrors();

							if (!result || !Lang.isObject(result)) {
								hasErrors = true;
							}

							callback.call(instance, hasErrors, result);
						}
					});
				} else if (callback) {
					callback.call(instance, true);
				}
			},

			_afterBlur: function() {
				var instance = this;

				var evaluator = instance.get('evaluator');

				if (evaluator && evaluator.isEvaluating()) {
					evaluator.onceAfter('evaluationEnded', function() {
						if (!instance.hasFocus()) {
							instance.showErrorMessage();
						}
					});
				} else if (
					['checkbox_multiple', 'radio'].indexOf(
						instance.get('type')
					) !== -1
				) {
					setTimeout(function() {
						instance.showPendingErrorMessage();
					}, 100);
				} else {
					instance.showErrorMessage();
				}
			},

			_afterValidChange: function(event) {
				var instance = this;

				if (event.newVal) {
					instance.hideErrorMessage();
				} else if (!instance.hasFocus()) {
					instance.showErrorMessage();
				}
			}
		};

		Liferay.namespace(
			'DDM.Renderer'
		).FieldValidationSupport = FieldValidationSupport;
	},
	'',
	{
		requires: ['liferay-ddm-form-renderer-expressions-evaluator']
	}
);
