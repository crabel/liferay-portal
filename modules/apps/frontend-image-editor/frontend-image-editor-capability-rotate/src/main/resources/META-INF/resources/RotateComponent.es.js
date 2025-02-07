import Component from 'metal-component';
import Soy from 'metal-soy';
import {CancellablePromise} from 'metal-promise';
import {core} from 'metal';

import componentTemplates from './RotateComponent.soy';
import controlsTemplates from './RotateControls.soy';

/**
 * Creates a Rotate component.
 */
class RotateComponent extends Component {
	/**
	 * @inheritDoc
	 */
	attached() {
		this.cache_ = {};
		this.rotationAngle_ = 0;
	}

	/**
	 * @inheritDoc
	 */
	detached() {
		this.cache_ = {};
	}

	/**
	 * Rotates the image to the current selected rotation angle.
	 *
	 * @param  {ImageData} imageData The image data representation of the image.
	 * @return {CancellablePromise} A promise that resolves when processing is
	 * complete.
	 */
	preview(imageData) {
		return this.process(imageData);
	}

	/**
	 * Rotates the image to the current selected rotation angle.
	 *
	 * @param  {ImageData} imageData The image data representation of the image.
	 * @return {CancellablePromise} A promise that resolves when processing is
	 * complete.
	 */
	process(imageData) {
		let promise = this.cache_[this.rotationAngle_];

		if (!promise) {
			promise = this.rotate_(imageData, this.rotationAngle_);

			this.cache_[this.rotationAngle_] = promise;
		}

		return promise;
	}

	/**
	 * Rotates the passed image data to the current rotation angle.
	 *
	 * @param  {ImageData} imageData The image data to rotate.
	 * @param  {number} rotationAngle The normalized rotation angle (in degrees)
	 * in the range [0-360).
	 * @protected
	 * @return {CancellablePromise} A promise that resolves when the image is
	 * rotated.
	 */
	rotate_(imageData, rotationAngle) {
		const cancellablePromise = new CancellablePromise((resolve, reject) => {
			const imageWidth = imageData.width;
			const imageHeight = imageData.height;

			const swapDimensions = (rotationAngle / 90) % 2;

			const imageCanvas = document.createElement('canvas');
			imageCanvas.width = imageWidth;
			imageCanvas.height = imageHeight;
			imageCanvas.getContext('2d').putImageData(imageData, 0, 0);

			const offscreenCanvas = document.createElement('canvas');
			offscreenCanvas.width = swapDimensions ? imageHeight : imageWidth;
			offscreenCanvas.height = swapDimensions ? imageWidth : imageHeight;

			const offscreenContext = offscreenCanvas.getContext('2d');
			offscreenContext.save();
			offscreenContext.translate(
				offscreenCanvas.width / 2,
				offscreenCanvas.height / 2
			);
			offscreenContext.rotate((rotationAngle * Math.PI) / 180);
			offscreenContext.drawImage(
				imageCanvas,
				-imageCanvas.width / 2,
				-imageCanvas.height / 2
			);
			offscreenContext.restore();

			resolve(
				offscreenContext.getImageData(
					0,
					0,
					offscreenCanvas.width,
					offscreenCanvas.height
				)
			);
		});

		return cancellablePromise;
	}

	/**
	 * Rotates the image 90º counter-clockwise.
	 */
	rotateLeft() {
		this.rotationAngle_ = (this.rotationAngle_ - 90) % 360;
		this.requestImageEditorPreview();
	}

	/**
	 * Rotates the image 90º clockwise.
	 */
	rotateRight() {
		this.rotationAngle_ = (this.rotationAngle_ + 90) % 360;
		this.requestImageEditorPreview();
	}
}

/**
 * State definition.
 *
 * @static
 * @type {!Object}
 */
RotateComponent.STATE = {
	/**
	 * Path of this module.
	 *
	 * @type {Function}
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

Soy.register(RotateComponent, componentTemplates);

export default RotateComponent;
