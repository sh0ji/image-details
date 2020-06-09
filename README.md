# Image Details

> Tools for image descriptions

## Enhancements

Image _enhancements_ are methods for progressive enhancement of existing images and their descriptions.
There are currently two planned enhancements: `ImageOverlay` and `ImageModal`.

### ImageOverlay

The `ImageOverlay` enhancement takes an existing image description and embeds it in a [`<details>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/details) immediately following the image.
The resulting structure will allow the `<details>` to be overlaid on top of the image, which is demonstrated in the examples.
By default, the structure is given [BEM](https://en.bem.info/)-style classes, which allow you to create your own styles for each piece of the structure.

- `div.overlaid`
  - `img.overlaid__image`
  - `details.overlaid__details`
    - `summary.overlaid__summary`
      - `span.overlaid__marker`
    - `div.overlaid__content`
      - `section.overlaid__alt`
      - `section.overlaid__desc`

```html
<div class="overlaid">
  <img
    class="overlaid__image"
    src="{img_src}"
    alt="{img_alt}"
    aria-details="details"
  />
  <details class="overlaid__details">
    <summary
      class="overlaid__summary"
      aria-label="Description"
      title="Description"
    >
      <span class="overlaid__marker" />
    </summary>
    <div class="overlaid__contents">
      <section class="overlaid__alt" aria-hidden="true">
        <h2>Alt Text</h2>
        <p>{img_alt}</p>
      </section>
      <section class="overlaid__desc">
        <h2>Image Description</h2>
        <div id="details">
          {longdesc}
        </div>
      </section>
    </div>
  </details>
</div>
```

### ImageModal

The `ImageModal` enhancement takes an existing image description and renders it in a modal dialog along with the image.
This enhancement has not yet been built.

## Development

Make sure you have Node.js and npm installed and then install all dev dependencies after cloning the repository.
You can then run the examples site in your browser as a live development environment.

```sh
# install dev dependencies
npm install
# run documentation
npm run dev
```


