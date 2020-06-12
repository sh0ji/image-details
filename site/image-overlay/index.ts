import { ImageDetails, ImageOverlay } from '../../src';

ImageOverlay.enhanceAll({
	selector: '.overlay',
	onGetDescription: console.log,
}).then(console.log);

ImageDetails.enhanceAll({
	selector: '.details',
	onGetDescription: console.log,
}).then(console.log);
