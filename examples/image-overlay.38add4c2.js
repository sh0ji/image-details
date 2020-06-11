// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"etm4":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ImageModal = void 0;
/**
 * TODO: implement an enhancement that displays the image and its description in
 * a modal dialog interface.
 */

class ImageModal {}

exports.ImageModal = ImageModal;
},{}],"kT6y":[function(require,module,exports) {
"use strict";

var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function (resolve) {
      resolve(value);
    });
  }

  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }

    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }

    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }

    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDescription = exports.getDescriptionByAttr = exports.DescriptionAttribute = exports.fetchElement = void 0;

const omitTags = (...tagNames) => n => {
  if (n instanceof HTMLElement) {
    return !tagNames.some(tagName => tagName.toUpperCase() === n.tagName.toUpperCase());
  }

  return true;
};

const filterNode = (node, filters) => node && filters.some(test => test(node)) ? node : null;
/**
 * Fetch an element from a given url. If the URL is a whole document, the entire
 * body will be returned inside a `DocumentFragment`. Returns `null` if nothing
 * is found.
 */


exports.fetchElement = (url, init, filters = [omitTags('script', 'style')]) => __awaiter(void 0, void 0, void 0, function* () {
  const req = new Request(url);
  const {
    hash,
    origin,
    pathname
  } = new URL(req.url);
  const currentPage = window.location.origin + window.location.pathname; // same-page reference

  if (origin + pathname === currentPage) {
    return filterNode(document.querySelector(hash), filters);
  } // reference to another page


  const res = yield fetch(req, init);

  if (res.status === 200) {
    const html = yield res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html'); // a fragment on another page

    if (hash) {
      return filterNode(document.querySelector(hash), filters);
    } // the body doesn't have any contents


    if (doc.body.firstChild === null) return null;
    const contents = new DocumentFragment();
    Array.from(doc.body.childNodes).forEach(node => {
      if (filters.some(test => test(node))) {
        contents.append(node);
      }
    });
    return contents;
  }

  return null;
});
/** All of the HTML attributes that can be used to reference a description. */


var DescriptionAttribute;

(function (DescriptionAttribute) {
  DescriptionAttribute["ARIA_DETAILS"] = "aria-details";
  DescriptionAttribute["ARIA_DESCRIBEDBY"] = "aria-describedby";
  DescriptionAttribute["LONGDESC"] = "longdesc";
})(DescriptionAttribute = exports.DescriptionAttribute || (exports.DescriptionAttribute = {}));

exports.getDescriptionByAttr = (el, attr) => __awaiter(void 0, void 0, void 0, function* () {
  const attrValue = el.getAttribute(attr);
  if (!el.hasAttribute(attr) || !attrValue) return null; // longdesc: retrieve the description from a separate document

  if (attr === DescriptionAttribute.LONGDESC) {
    const contents = yield exports.fetchElement(attrValue);

    if (contents instanceof DocumentFragment) {
      const desc = document.createElement('div');
      desc.append(contents);
      return desc;
    }

    return contents;
  }

  const ref = document.getElementById(attrValue);
  if (ref) return ref.cloneNode(true);
  return null;
});
/**
 * Get the image's long description.
 * Look for description attributes on the image and return the value of the
 * description. Attribute preference is `aria-details` > `longdesc` >
 * `aria-describedby`.
 */


exports.getDescription = el => __awaiter(void 0, void 0, void 0, function* () {
  return Promise.all(Object.values(DescriptionAttribute).filter(attr => el.hasAttribute(attr)).map(attr => __awaiter(void 0, void 0, void 0, function* () {
    return {
      attr,
      value: yield exports.getDescriptionByAttr(el, attr)
    };
  })));
});
},{}],"kr1d":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getFocusable = exports.focusableSelectors = exports.createIcon = exports.icons = void 0;
const materialViewBox = '0 0 24 24';
exports.icons = {
  details: {
    d: 'M3 4l9 16 9-16H3zm3.38 2h11.25L12 16 6.38 6z',
    viewBox: materialViewBox,
    source: 'https://material.io/resources/icons/?icon=details&style=baseline'
  },
  close: {
    d: 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
    viewBox: materialViewBox,
    source: 'https://material.io/resources/icons/?icon=close&style=baseline'
  }
};
const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

exports.createIcon = ({
  viewBox,
  d,
  source
}, {
  label,
  className
} = {}) => {
  const attributes = [['xmlns', SVG_NAMESPACE], ['focusable', 'false'], ['role', 'img'], ['viewBox', viewBox]];
  attributes.push(label ? ['aria-label', label] : ['aria-hidden', 'true']);
  if (className) attributes.push(['class', className]);
  const svg = document.createElementNS(SVG_NAMESPACE, 'svg');
  attributes.forEach(attr => svg.setAttribute(...attr));
  if (source) svg.append(document.createComment(source));
  const path = document.createElementNS(SVG_NAMESPACE, 'path');
  path.setAttribute('fill', 'currentColor');
  path.setAttribute('d', d);
  svg.append(path);
  return svg;
};

exports.focusableSelectors = ['[contentEditable=true]:not([tabindex="-1"])', '[tabindex]:not([tabindex="-1"])', 'a[href]:not([tabindex="-1"])', 'button:not([disabled]):not([tabindex="-1"])', 'dialog', 'embed:not([tabindex="-1"])', 'iframe:not([tabindex="-1"])', 'input:not([disabled]):not([tabindex="-1"])', 'map[name] area[href]:not([tabindex="-1"])', 'object:not([tabindex="-1"])', 'select:not([disabled]):not([tabindex="-1"])', 'summary:not([tabindex="-1"])', 'textarea:not([disabled]):not([tabindex="-1"])'];

exports.getFocusable = (el = document) => el.querySelectorAll(exports.focusableSelectors.join(','));
},{}],"j3te":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.noop = exports.setStyle = void 0;

const styleString = style => Object.keys(style).reduce((a, attr) => {
  const val = style[attr];
  return val ? "".concat(a, " ").concat(attr, ": ").concat(val, ";") : a;
}, '').trim();

exports.setStyle = (el, style) => {
  el.setAttribute('style', styleString(style));
}; // eslint-disable-next-line @typescript-eslint/no-empty-function


exports.noop = () => {};
},{}],"AMii":[function(require,module,exports) {
"use strict";

var __createBinding = this && this.__createBinding || (Object.create ? function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  Object.defineProperty(o, k2, {
    enumerable: true,
    get: function get() {
      return m[k];
    }
  });
} : function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  o[k2] = m[k];
});

var __exportStar = this && this.__exportStar || function (m, exports) {
  for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

__exportStar(require("./description"), exports);

__exportStar(require("./elements"), exports);

__exportStar(require("./misc"), exports);
},{"./description":"kT6y","./elements":"kr1d","./misc":"j3te"}],"IrGc":[function(require,module,exports) {
"use strict";

var __rest = this && this.__rest || function (s, e) {
  var t = {};

  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];

  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeDraggable = exports.Draggable = void 0;

const elements_1 = require("../../utilities/elements");

const misc_1 = require("../../utilities/misc");

class Draggable {
  constructor(el, keyboardEl, options) {
    this.el = el;
    this.keyboardEl = keyboardEl;
    this.moveX = 0;
    this.moveY = 0;
    this.canGrab = false;
    this.grabbed = false;

    this.grab = e => {
      if (!this.canGrab) return;
      this.moveX = e.clientX;
      this.moveY = e.clientY;
      this.grabbed = true;
      this.options.onGrab();
    };

    this.release = () => {
      this.moveX = 0;
      this.moveY = 0;
      this.grabbed = false;
      this.options.onRelease();
    };

    this.drag = ({
      clientX,
      clientY
    }) => {
      this.move(clientX - this.moveX, clientY - this.moveY);
      this.moveX = clientX;
      this.moveY = clientY;
      this.options.onDrag();
    };

    this.pointermove = e => {
      if (this.grabbed) {
        this.drag(e);
      } else {
        const {
          excludedElements,
          excludeFocusable
        } = this.options;
        const excluded = [...(typeof excludedElements === 'function' ? excludedElements(this.el) : excludedElements), ...(excludeFocusable ? Array.from(elements_1.getFocusable(this.el)) : [])].filter(el => el && e.composedPath().includes(el));
        this.canGrab = !excluded.some(Boolean);
      }
    };

    this.moveWithKeyboard = e => {
      const mod = e.shiftKey ? 20 : 1;
      const step = mod * 1;
      let left = 0;
      let top = 0;

      switch (e.key) {
        case 'ArrowRight':
          left = 5;
          break;

        case 'ArrowLeft':
          left = -5;
          break;

        case 'ArrowDown':
          top = 5;
          break;

        case 'ArrowUp':
          top = -5;
          break;

        case 'Home':
          e.preventDefault();
          this.resetPosition();
          return;

        default:
          return;
      }

      e.preventDefault();
      this.move(left * step, top * step);
    };

    this.options = Object.assign(Object.assign({}, Draggable.defaultOptions), options);
    this.el.addEventListener('pointerdown', this.grab);
    this.el.addEventListener('pointerleave', this.release);
    this.el.addEventListener('pointermove', this.pointermove);
    this.el.addEventListener('pointerup', this.release);
    this.keyboardEl.addEventListener('keydown', this.moveWithKeyboard);
  }

  move(x, y) {
    const {
      top,
      left
    } = this.pos;

    if (top !== null && left !== null) {
      misc_1.setStyle(this.el, {
        position: 'absolute',
        left: "".concat(left + x, "px"),
        top: "".concat(top + y, "px")
      });
    }

    this.options.onMove();
  }

  resetPosition() {
    misc_1.setStyle(this.el, {
      position: null,
      top: null,
      left: null
    });
  }

  get pos() {
    const {
      top = '0',
      left = '0'
    } = window.getComputedStyle(this.el);
    return {
      top: top === 'auto' ? null : parseInt(top, 10),
      left: top === 'auto' ? null : parseInt(left, 10)
    };
  }

  static makeDraggable(_a) {
    var {
      el,
      keyboardEl
    } = _a,
        options = __rest(_a, ["el", "keyboardEl"]);

    return new Draggable(el, keyboardEl, options);
  }

}

exports.Draggable = Draggable;
Draggable.defaultOptions = {
  excludedElements: [],
  excludeFocusable: true,
  onDrag: misc_1.noop,
  onGrab: misc_1.noop,
  onMove: misc_1.noop,
  onRelease: misc_1.noop
};
exports.makeDraggable = Draggable.makeDraggable;
},{"../../utilities/elements":"kr1d","../../utilities/misc":"j3te"}],"tPG0":[function(require,module,exports) {
"use strict";

var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function (resolve) {
      resolve(value);
    });
  }

  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }

    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }

    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }

    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};

var __rest = this && this.__rest || function (s, e) {
  var t = {};

  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];

  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ImageOverlay = void 0;

const utilities_1 = require("../../utilities");

const draggable_1 = require("./draggable");

const ImageOverlayInstances = new Set();

class ImageOverlay {
  // private hasAdjacentDetails = false;
  // private existingDetailsDescription = false;
  constructor(image, options) {
    this.image = image;
    this.options = options;
    this.enabled = false;

    this.onToggle = () => {
      const {
        draggable,
        resizable
      } = this.options;

      if (this.details.open) {
        this.details.classList.add(draggable);
        this.details.classList.add(resizable);
      } else {
        this.details.classList.remove(draggable);
        this.details.classList.remove(resizable);
        this.details.removeAttribute('style');
      }

      this.updateMarker();
    };

    this.onDocumentKeydown = e => {
      if (e.key !== 'Escape') return;
      const {
        closeOnEscape
      } = this.options;
      if (closeOnEscape) this.details.open = false;
    };

    ImageOverlayInstances.add(this);
  }

  enable() {
    return __awaiter(this, void 0, void 0, function* () {
      if (this.enabled) return;
      this.originalImage = this.image.cloneNode();
      const descriptions = yield utilities_1.getDescription(this.image);

      if (descriptions.length) {
        const [{
          attr,
          value
        }] = descriptions;
        this.descriptionAttribute = attr;
        this.description = value;
      }

      const {
        image,
        dragging
      } = this.options;
      this.image.classList.add(image);
      this.overlay = this.createOverlay();
      this.details = this.createDetails();
      this.summary = this.createSummary();
      this.marker = this.createMarker();
      this.contents = this.createContents(this.details);
      draggable_1.makeDraggable({
        el: this.details,
        keyboardEl: this.summary,
        onDrag: () => {
          this.details.classList.add(dragging);
        },
        onRelease: () => {
          this.details.classList.remove(dragging);
        }
      });
      this.details.addEventListener('toggle', this.onToggle);
      document.addEventListener('keydown', this.onDocumentKeydown);
      this.enabled = true;
    });
  }

  disable() {
    if (!this.enabled) return this;
    this.details.removeEventListener('toggle', this.onToggle);
    document.removeEventListener('keydown', this.onDocumentKeydown);
    this.enabled = false;
    return this;
  }

  destroy() {
    if (this.enabled) this.disable();
    (this.overlay.parentNode || document).insertBefore(this.originalImage, this.overlay);
    this.overlay.remove();
    ImageOverlayInstances.delete(this);
    return this;
  }

  createOverlay() {
    if (this.overlay && this.overlay instanceof HTMLElement) return this.overlay;
    const {
      overlay: overlayClass
    } = this.options;
    const {
      parentElement
    } = this.image;
    const overlay = parentElement instanceof HTMLElement && parentElement.classList.contains(overlayClass) ? parentElement : document.createElement('div');
    overlay.classList.add(overlayClass);
    if (overlay.contains(this.image)) return overlay; // append to the document

    (parentElement || document).insertBefore(overlay, this.image);
    overlay.append(this.image);
    return overlay;
  }

  createDetails() {
    if (this.details instanceof HTMLDetailsElement) return this.details;
    const {
      detailsPlacement,
      screenReaderOnly,
      details: detailsClass
    } = this.options;

    if (this.description) {
      if (this.description instanceof HTMLDetailsElement) {// this.existingDetailsDescription = true;
      }

      if (screenReaderOnly && this.description.classList.contains(screenReaderOnly)) {
        this.description.classList.remove(screenReaderOnly);
      }
    }

    const {
      nextElementSibling
    } = this.image; // next element is a <details>

    if (nextElementSibling && nextElementSibling instanceof HTMLDetailsElement) {
      // this.hasAdjacentDetails = true;
      // next element is the description or contains it
      if (this.description && (nextElementSibling === this.description || nextElementSibling.contains(this.description))) {
        nextElementSibling.classList.add(detailsClass);
        return nextElementSibling;
      } // TODO: handle adjacent <details> that aren't the description?

    }

    const details = document.createElement('details');
    details.classList.add(detailsClass); // add to the document

    const refChild = detailsPlacement === 'after-image' ? this.image.nextSibling : this.image;
    (this.image.parentNode || document).insertBefore(details, refChild);
    return details;
  }

  createSummary() {
    const {
      summary: summaryClass,
      displaySummaryText,
      summaryText
    } = this.options;
    const existingSummary = this.details.querySelector('summary');

    if (existingSummary) {
      existingSummary.classList.add(summaryClass);
      return existingSummary;
    }

    const summary = document.createElement('summary');
    summary.classList.add(summaryClass);
    const text = typeof summaryText === 'string' ? summaryText : summaryText(Boolean(this.description));

    if (displaySummaryText) {
      summary.append(text);
    } else {
      summary.setAttribute('aria-label', text);
      summary.setAttribute('title', text);
    } // add to the document


    this.details.prepend(summary);
    return summary;
  }

  createMarker() {
    const {
      marker: markerClass
    } = this.options;
    const marker = document.createElement('span');
    marker.classList.add(markerClass); // add to the document

    this.summary.prepend(this.updateMarker(marker));
    return marker;
  }

  updateMarker(marker = this.marker) {
    const {
      summaryMarker
    } = this.options;

    if (typeof summaryMarker === 'object' && 'open' in summaryMarker) {
      // remove current child and add the updated one
      while (marker.firstChild) marker.firstChild.remove();

      const {
        open,
        closed
      } = summaryMarker;
      marker.append(this.details.open ? open : closed);
      return marker;
    }

    if (!marker.children.length) marker.append(summaryMarker);
    return marker;
  }

  createContents(details) {
    const {
      addAltText,
      contents: contentsClass
    } = this.options;
    const contents = document.createElement('div');
    contents.classList.add(contentsClass);
    const descSection = this.createDescSection();
    if (addAltText) contents.append(this.createAltSection());
    if (descSection) contents.append(descSection); // add to the details

    details.append(contents);
    return contents;
  }

  createAltSection() {
    const {
      altText: altClass,
      altSectionHeading
    } = this.options;
    const section = document.createElement('section');
    section.classList.add(altClass);
    section.setAttribute('aria-hidden', 'true');
    section.innerHTML = "".concat(altSectionHeading, "<p>").concat(this.image.alt, "</p>");
    return section;
  }

  createDescSection() {
    if (!this.description) return null;
    const {
      descriptionHeading,
      description: descClass
    } = this.options;
    const section = document.createElement('section');
    section.classList.add(descClass);
    section.innerHTML = descriptionHeading;
    section.append(this.description);
    return section;
  }

  static enhance(image, options) {
    return __awaiter(this, void 0, void 0, function* () {
      const opts = Object.assign(Object.assign(Object.assign({}, ImageOverlay.defaultOptions), ImageOverlay.defaultClasses), options);
      const hasDesc = Object.values(utilities_1.DescriptionAttribute).some(attr => image.getAttribute(attr));
      if (!hasDesc && !image.alt) return null;
      const instance = new ImageOverlay(image, opts);
      yield instance.enable();
      return instance;
    });
  }

  static enhanceAll(_a = {}) {
    var {
      selector = ImageOverlay.selector
    } = _a,
        options = __rest(_a, ["selector"]);

    return __awaiter(this, void 0, void 0, function* () {
      yield Promise.all(Array.from(document.querySelectorAll(selector)).map(el => __awaiter(this, void 0, void 0, function* () {
        return ImageOverlay.enhance(el, options);
      })));
      return ImageOverlay.instances;
    });
  }

  static get instances() {
    return Array.from(ImageOverlayInstances);
  }

}

exports.ImageOverlay = ImageOverlay;
ImageOverlay.selector = 'img';
ImageOverlay.baseName = 'overlaid';
ImageOverlay.defaultClasses = {
  overlay: ImageOverlay.baseName,
  image: "".concat(ImageOverlay.baseName, "__image"),
  details: "".concat(ImageOverlay.baseName, "__details"),
  summary: "".concat(ImageOverlay.baseName, "__summary"),
  marker: "".concat(ImageOverlay.baseName, "__marker"),
  contents: "".concat(ImageOverlay.baseName, "__contents"),
  altText: "".concat(ImageOverlay.baseName, "__alt"),
  description: "".concat(ImageOverlay.baseName, "__desc"),
  draggable: "".concat(ImageOverlay.baseName, "--draggable"),
  resizable: "".concat(ImageOverlay.baseName, "--resizable"),
  dragging: 'dragging',
  screenReaderOnly: 'sr-only'
};
ImageOverlay.defaultOptions = {
  addAltText: true,
  altSectionHeading: '<h2>Alt Text</h2>',
  descriptionHeading: '<h2>Image Description</h2>',
  detailsPlacement: 'after-image',

  // getter used for summaryMarker so that icon elements are cloned
  get summaryMarker() {
    return {
      open: utilities_1.createIcon(utilities_1.icons.close),
      closed: utilities_1.createIcon(utilities_1.icons.details)
    };
  },

  summaryText: hasDescription => {
    let text = 'Description';
    if (!hasDescription) text += ' (Only alt text)';
    return text;
  },
  displaySummaryText: false,
  closeOnEscape: true
};
},{"../../utilities":"AMii","./draggable":"IrGc"}],"fUdq":[function(require,module,exports) {
"use strict";

var __createBinding = this && this.__createBinding || (Object.create ? function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  Object.defineProperty(o, k2, {
    enumerable: true,
    get: function get() {
      return m[k];
    }
  });
} : function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  o[k2] = m[k];
});

var __exportStar = this && this.__exportStar || function (m, exports) {
  for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

__exportStar(require("./enhancements/ImageModal"), exports);

__exportStar(require("./enhancements/ImageOverlay"), exports);
},{"./enhancements/ImageModal":"etm4","./enhancements/ImageOverlay":"tPG0"}],"zLsf":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

const src_1 = require("../../src");

src_1.ImageOverlay.enhanceAll().then(console.log);
},{"../../src":"fUdq"}]},{},["zLsf"], null)
//# sourceMappingURL=/image-overlay.38add4c2.js.map