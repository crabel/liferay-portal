import '../SuccessPage/SuccessPagePaginationItem.soy.js';
import '../SuccessPage/SuccessPageRenderer.soy.js';
import '../SuccessPage/SuccessPageWizardItem.soy.js';
import Component from 'metal-jsx';
import {ClayActionsDropdown} from 'clay-dropdown';
import {Config} from 'metal-state';
import {
	focusedFieldStructure,
	pageStructure,
	ruleStructure
} from '../../util/config.es';
import {setValue} from '../../util/i18n.es';

const withMultiplePages = ChildComponent => {
	class MultiplePages extends Component {
		getPages() {
			let {pages} = this.props;
			const {successPageSettings} = this.props;

			if (successPageSettings.enabled) {
				pages = [
					...pages,
					{
						contentRenderer: 'success',
						paginationItemRenderer: 'success',
						rows: [],
						successPageSettings
					}
				];
			}

			return pages;
		}

		getPaginationPosition() {
			const {pages, paginationMode} = this.props;
			const position = paginationMode === 'wizard' ? 'top' : 'bottom';

			return pages.length > 1 ? position : 'top';
		}

		isDropdownDisabled() {
			const {defaultLanguageId, editingLanguageId} = this.props;

			return defaultLanguageId !== editingLanguageId;
		}

		render() {
			const {dropdownExpanded} = this.state;
			const {spritemap, view} = this.props;

			return (
				<div
					class={`container ddm-paginated-builder ${this.getPaginationPosition()}`}
				>
					<ChildComponent {...this.props} pages={this.getPages()} />

					{view !== 'fieldSets' && (
						<ClayActionsDropdown
							disabled={this.isDropdownDisabled()}
							elementClasses={'ddm-paginated-builder-dropdown'}
							events={{
								expandedChanged: this._handleExpandedChanged.bind(
									this
								),
								itemClicked: this._handleDropdownItemClicked.bind(
									this
								)
							}}
							expanded={dropdownExpanded}
							items={this._getPageSettingsItems()}
							spritemap={spritemap}
						/>
					)}
				</div>
			);
		}

		_addPage() {
			const {dispatch} = this.context;

			dispatch('pageAdded');
		}

		_addSuccessPage() {
			const {dispatch} = this.context;
			const {pages} = this.props;

			this._updateSuccessPage({
				body: Liferay.Language.get(
					'your-information-was-successfully-received-thanks-for-fill-out'
				),
				enabled: true,
				title: Liferay.Language.get('done')
			});

			dispatch('activePageUpdated', pages.length);
		}

		_deletePage() {
			const {dispatch} = this.context;

			dispatch('pageDeleted', this.props.activePage);
		}

		_deleteSuccessPage() {
			const {dispatch} = this.context;

			this._updateSuccessPage({
				enabled: false
			});

			dispatch('activePageUpdated', this.props.pages.length - 1);
		}

		_getPageSettingsItems() {
			const {pages, paginationMode, successPageSettings} = this.props;
			const pageSettingsItems = [
				{
					label: Liferay.Language.get('add-new-page'),
					settingsItem: 'add-page'
				}
			];

			if (this.getPages().length === 1) {
				pageSettingsItems.push({
					label: Liferay.Language.get('reset-page'),
					settingsItem: 'reset-page'
				});
			} else {
				pageSettingsItems.push({
					label: Liferay.Language.get('delete-current-page'),
					settingsItem: 'delete-page'
				});
			}

			if (!successPageSettings.enabled) {
				pageSettingsItems.push({
					label: Liferay.Language.get('add-success-page'),
					settingsItem: 'add-success-page'
				});
			}

			if (pages.length > 1) {
				let label = Liferay.Language.get('switch-pagination-to-top');

				if (paginationMode == 'wizard') {
					label = Liferay.Language.get('switch-pagination-to-bottom');
				}

				pageSettingsItems.push({
					label,
					settingsItem: 'switch-pagination-mode'
				});
			}

			return pageSettingsItems;
		}

		_handleDropdownItemClicked({data}) {
			const {activePage, successPageSettings} = this.props;
			const {settingsItem} = data.item;

			this.setState({
				dropdownExpanded: false
			});

			if (settingsItem == 'add-page') {
				this._addPage();
			} else if (settingsItem === 'reset-page') {
				this._resetPage();
			} else if (settingsItem === 'delete-page') {
				if (
					successPageSettings.enabled &&
					activePage == this.getPages().length - 1
				) {
					this._deleteSuccessPage();
				} else {
					this._deletePage();
				}
			} else if (settingsItem == 'switch-pagination-mode') {
				this._switchPaginationMode();
			} else if (settingsItem == 'add-success-page') {
				this._addSuccessPage();
			}
		}

		_handleExpandedChanged({newVal}) {
			this.setState({
				dropdownExpanded: newVal
			});
		}

		_resetPage() {
			const {dispatch} = this.context;

			dispatch('pageReset');
		}

		_switchPaginationMode() {
			const {dispatch} = this.context;

			dispatch('paginationModeUpdated');
		}

		_updateSuccessPage({body = '', title = '', enabled}) {
			const {dispatch} = this.context;
			const {editingLanguageId} = this.props;
			const successPageSettings = {
				body: {},
				enabled,
				title: {}
			};

			setValue(successPageSettings, editingLanguageId, 'body', body);
			setValue(successPageSettings, editingLanguageId, 'title', title);

			dispatch('successPageChanged', successPageSettings);
		}
	}

	MultiplePages.PROPS = {
		/**
		 * @default
		 * @instance
		 * @memberof FormBuilder
		 * @type {?number}
		 */

		activePage: Config.number().value(0),

		/**
		 * @default undefined
		 * @instance
		 * @memberof FormBuilder
		 * @type {?string}
		 */

		defaultLanguageId: Config.string(),

		/**
		 * @default undefined
		 * @instance
		 * @memberof FormBuilder
		 * @type {?string}
		 */

		editingLanguageId: Config.string(),

		/**
		 * @default []
		 * @instance
		 * @memberof Sidebar
		 * @type {?(array|undefined)}
		 */

		fieldTypes: Config.array().value([]),

		/**
		 * @default {}
		 * @instance
		 * @memberof FormBuilder
		 * @type {?object}
		 */

		focusedField: focusedFieldStructure.value({}),

		/**
		 * @default []
		 * @instance
		 * @memberof FormBuilder
		 * @type {?array<object>}
		 */

		pages: Config.arrayOf(pageStructure).value([]),

		/**
		 * @instance
		 * @memberof FormBuilder
		 * @type {string}
		 */

		paginationMode: Config.string().required(),

		/**
		 * @instance
		 * @memberof FormBuilder
		 * @type {string}
		 */

		rules: Config.arrayOf(ruleStructure).required(),

		/**
		 * @default undefined
		 * @instance
		 * @memberof FormRenderer
		 * @type {!string}
		 */

		spritemap: Config.string().required(),

		/**
		 * @instance
		 * @memberof MultiplePages
		 * @type {object}
		 */

		successPageSettings: Config.shapeOf({
			body: Config.object(),
			enabled: Config.bool(),
			title: Config.object()
		}).value({})
	};

	MultiplePages.STATE = {
		/**
		 * @default false
		 * @instance
		 * @memberof FormRenderer
		 * @type {boolean}
		 */

		dropdownExpanded: Config.bool()
			.value(false)
			.internal()
	};

	return MultiplePages;
};

export default withMultiplePages;
