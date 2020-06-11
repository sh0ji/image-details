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

## Reader Experience

EID allows screenreader users to access extended descriptions of images, that can include markup.

It also allows sighted readers of your documents to see the descriptions you provide for screenreader users. Many readers can benefit from this added information.

The descriptions can include image credits-- information that often must be provided, but readers may not always want to see.

Sighted users will have a control that appears when they hover over the upper right corner of the image. Screen reader users will have a control that comes right after the alt text for an image, and allows them to navigate into the extended description or not, as they choose.

Sighted readers can reposition the information, so that they can see the image and the description at the same time. Using a pointing device this is done by dragging the description. When a description is open, the arrow keys move the description.

[future] They can also resize the information, in case the information is too big to fit in a small text box. This can also be done by keyboard control.

### Handling alt-text

EID adds the `alt-text` for an image along with other descriptive information, so that sighted readers will see it if they activate the control. But since screen reader users will already have heard the `alt-text` when they visit an image, this information is not read out again when they access the control.

## Author Experience

EID is enabled by preprocessing your markup that contains `<figure>` tags, as described further below. EID automatically collects all of the information associated with a figure, and creates a uniform user experience, for all of this information, as described above. Besides `alt-text`, the information can be any of

- `longdesc`
- `aria-describedby`
- `aria-details`

You do not have to put this information in any special location in your markup-- EID will find it.

[future] If you have markup that you do not want EID to process, you can use the ??No-EID tag to indicate that.

## Examples

Your image is specified in HTML in a `<figure>` element, as in the following example:

```html
<figure>
  <img src="images/louvre.jpg" alt="The Louvre" aria-details="ext1" />
  <details id="ext1">
    This is a photograph of the Louvre Museum in France at night. The entrance
    to the museum is a large pyramid made out of glass.
  </details>
</figure>
```

As you see, in this example the description is specified in a `<details>` element associated with the figure.

Note that "ext1" is an `id-ref`, that links the figure to its details. This must be unique for each figure on the HTML page. It's crucial that the same id-ref appear in the figure and its details. The details element itself can be anywhere on the page-- it does not have be inside the `<figure>` element.

The description does not have to be specified as `<details>`. As the following example shows, it can also be in `aria-describedby`:

```html
<figure>
  <img src="images/louvre.jpg" alt="The Louvre" aria-descibedby="ext1" />
</figure>
<div id="ext1">
  This is a photograph of the Louvre Museum in France at night. The entrance to
  the museum is a large pyramid made out of glass.
</div>
```

In these examples, the descriptions are just text. But you can put any markup you want in the `<details>` element. You can also use `longdesc` for this:

```html
<figure class="example">
  <img src="images/louvre.jpg" alt="The Louvre" longdesc="longdesc-1.html" />
</figure>
```

Here the `longdesc`, which can contain any markup you want, is in another document, but it could be in an element in the same document, using # to refer to an element by its id:

`longdesc="#ext1"`

## Making EID work

As mentioned above, EID works by preprocessing your markup to locate any descriptive information you have provided for figures, and create the reader presentation described above. To perform the preprocessing, you do the following:

`describe process here`

## EID Style sheet

Some aspects of EID's behavior are specified in EID's CSS style sheet:

`provide appropriate link here`

If you don't include this style sheet in your project, you may see some divergence from the description above.
