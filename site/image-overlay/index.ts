import { ImageDetails, ImageOverlay } from '../../src';

const noop = () => {};	// eslint-disable-line @typescript-eslint/no-empty-function

ImageOverlay.enhanceAll({
	selector: '.overlay',
}).then(console.log, noop);

ImageDetails.enhanceAll({
	selector: '.details',
}).then(console.log, noop);
