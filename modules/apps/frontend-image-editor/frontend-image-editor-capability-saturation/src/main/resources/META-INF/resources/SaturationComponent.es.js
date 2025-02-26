import Component from 'metal-component';
import {Slider} from 'frontend-js-web';
import Soy from 'metal-soy';
import debounce from 'metal-debounce';
import {CancellablePromise} from 'metal-promise';
import {core} from 'metal';

import componentTemplates from './SaturationComponent.soy';
import controlsTemplates from './SaturationControls.soy';

/**
 * Creates a Saturation component.
 */
class SaturationComponent extends Component {
	/**
	 * @inheritDoc
	 */
	attached() {
		this.requestImageEditorPreview_ = debounce(
			this.requestImageEditorPreview,
			50
		);

		this.cache_ = {};
	}

	/**
	 * @inheritDoc
	 */
	detached() {
		this.cache_ = {};
	}

	/**
	 * Applies a saturation filter to the image.
	 *
	 * @param  {ImageData} imageData The image data representation of the image.
	 * @return {CancellablePromise} A promise that resolves when the webworker
	 * finishes processing the image.
	 */
	preview(imageData) {
		return this.process(imageData);
	}

	/**
	 * Applies a saturation filter to the image.
	 *
	 * @param  {ImageData} imageData The image data representation of the image.
	 * @return {CancellablePromise} A promise that resolves when the webworker
	 * finishes processing the image.
	 */
	process(imageData) {
		const saturationValue = this.components.slider.value;
		let promise = this.cache_[saturationValue];

		if (!promise) {
			promise = this.spawnWorker_({
				saturationValue,
				imageData
			});

			this.cache_[saturationValue] = promise;
		}

		return promise;
	}

	/**
	 * Notifies the editor that this component wants to generate a different
	 * preview version of the current image. It debounces the calls.
	 */
	requestPreview() {
		this.requestImageEditorPreview_();
	}

	/**
	 * Spawns a webworker to process the image in a different thread.
	 *
	 * @param  {Object} message The image and saturation value.
	 * @return {CancellablePromise} A promise that resolves when the webworker
	 * finishes processing the image.
	 */
	spawnWorker_(message) {
		return new CancellablePromise((resolve, reject) => {
			const workerURI = this.modulePath + '/SaturationWorker.js';
			const processWorker = new Worker(workerURI);

			processWorker.onmessage = event => resolve(event.data);
			processWorker.postMessage(message);
		});
	}
}

/**
 * State definition.
 *
 * @static
 * @type {!Object}
 */
SaturationComponent.STATE = {
	/**
	 * Path of this module.
	 *
	 * @type {String}
	 */
	modulePath: {
		validator: core.isString
	},

	/**
	 * Injected method that notifies the editor that this component wants to
	 * generate a preview version of the image.
	 *
	 * @type {Function}
	 */
	requestImageEditorPreview: {
		validator: core.isFunction
	}
};

Soy.register(SaturationComponent, componentTemplates);

export default SaturationComponent;
