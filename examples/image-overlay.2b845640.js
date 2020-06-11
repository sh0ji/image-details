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
})({"kT6y":[function(require,module,exports) {
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
exports.appendContent = exports.getFocusable = exports.focusableSelectors = exports.createIcon = exports.icons = void 0;
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

exports.appendContent = (to, ...contents) => {
  contents.forEach(content => {
    if (typeof content === 'string') {
      const div = document.createElement('div');
      div.innerHTML = content;
      to.append(div.firstChild);
    } else {
      to.append(content);
    }
  });
};
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
exports.srOnly = exports.setStyle = exports.noop = void 0;

__exportStar(require("./description"), exports);

__exportStar(require("./elements"), exports); // eslint-disable-next-line @typescript-eslint/no-empty-function


exports.noop = () => {};

const styleString = style => Object.keys(style).reduce((a, attr) => {
  const val = style[attr];
  return val ? "".concat(a, " ").concat(attr, ": ").concat(val, ";") : a;
}, '').trim();

exports.setStyle = (el, style) => {
  el.setAttribute('style', styleString(style));
};

exports.srOnly = el => exports.setStyle(el, {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: '0',
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: '0'
});
},{"./description":"kT6y","./elements":"kr1d"}],"ni5T":[function(require,module,exports) {
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
exports.ImageDetails = void 0;

const utilities_1 = require("../../utilities");

const ImageDetailsInstances = new Set();

class ImageDetails {
  constructor(image, options) {
    this.image = image;
    this.options = options;
    this.descriptionSection = null;
    this.descriptionAttribute = null;
    this.originalDetails = null;
    this.descriptionAdded = false;
    this.originalImage = this.image.cloneNode(true);
    this.image.classList.add(this.getClass('image'));
    this.container = this.createContainer();
    this.details = this.createDetails();
    this.container.append(this.image, this.details);
    ImageDetailsInstances.add(this);
  }

  get hasDescription() {
    return Object.values(utilities_1.DescriptionAttribute).some(attr => this.image.getAttribute(attr));
  }

  addDescription(description) {
    return __awaiter(this, void 0, void 0, function* () {
      if (this.descriptionAdded) return;
      const {
        descriptionHeading,
        onGetDescription = utilities_1.noop
      } = this.options;

      if (description) {
        this.description = description;
      } else {
        const descriptions = yield utilities_1.getDescription(this.image);
        onGetDescription.call(this, descriptions);

        if (descriptions.length) {
          const [{
            attr,
            value
          }] = descriptions;
          this.descriptionAttribute = attr;
          this.description = value;
        }
      }

      if (this.description && this.descriptionSection) {
        utilities_1.appendContent(this.descriptionSection, descriptionHeading(), this.description);
        this.descriptionAdded = true;
      }
    });
  }

  destroy() {
    (this.container.parentNode || document).insertBefore(this.originalImage, this.container);

    if (this.originalDetails) {
      const {
        detailsPlacement
      } = this.options;
      const refChild = detailsPlacement === 'after-image' ? this.originalImage.nextSibling : this.originalImage;
      (this.originalImage.parentNode || document).insertBefore(this.originalDetails, refChild);
    }

    this.container.remove();
    ImageDetailsInstances.delete(this);
    return this;
  } // element constructors


  createContainer() {
    if (this.container) return this.container;
    const {
      blockName
    } = this.options;
    const {
      parentElement
    } = this.image;
    const container = parentElement instanceof HTMLElement && parentElement.classList.contains(blockName) ? parentElement : document.createElement('div');
    container.classList.add(blockName);
    if (container.contains(this.image)) return container; // append to the document

    (parentElement || document).insertBefore(container, this.image);
    return container;
  }

  createDetails() {
    if (this.details) return this.details;
    const {
      detailsPlacement
    } = this.options;
    let details = document.createElement('details');
    const detailsCandidate = detailsPlacement === 'after-image' ? this.image.nextElementSibling : this.image.previousElementSibling;

    if (detailsCandidate instanceof HTMLDetailsElement) {
      // `img + details` already exists so use it, storing a copy of the original
      this.originalDetails = detailsCandidate.cloneNode(true);
      details = detailsCandidate;
    } else {
      // add the new details to the document
      const refChild = detailsPlacement === 'after-image' ? this.image.nextSibling : this.image;
      (this.image.parentNode || document).insertBefore(details, refChild); // create the summary

      this.summary = this.createSummary();
      details.prepend(this.summary); // create the summary marker

      this.marker = this.createMarker();
      this.summary.prepend(this.marker); // create the contents

      this.contents = this.createContents();
      details.append(this.contents);
    }

    details.classList.add(this.getClass('details'));
    return details;
  }

  createSummary() {
    const {
      displaySummaryText,
      summaryText
    } = this.options;
    const summary = document.createElement('summary');
    summary.classList.add(this.getClass('summary'));
    const text = summaryText(this.hasDescription);
    const span = document.createElement('span');
    utilities_1.appendContent(span, text);
    if (!displaySummaryText) utilities_1.srOnly(span);
    summary.append(span);
    return summary;
  }

  createMarker() {
    const {
      summaryMarker
    } = this.options;
    const innerMarker = summaryMarker();
    const marker = document.createElement('span');
    marker.classList.add(this.getClass('marker'));
    if (innerMarker) marker.append(innerMarker);
    return marker;
  }

  createContents() {
    const {
      addAltText
    } = this.options;
    const contents = document.createElement('div');
    contents.classList.add(this.getClass('contents'));
    if (addAltText) contents.append(this.createAltSection());
    contents.append(this.createDescriptionSection());
    return contents;
  }

  createAltSection() {
    const {
      altSectionHeading
    } = this.options;
    const section = document.createElement('section');
    section.classList.add(this.getClass('alt'));
    section.setAttribute('aria-hidden', 'true');
    utilities_1.appendContent(section, altSectionHeading(), "<p>".concat(this.image.alt, "</p>"));
    return section;
  }

  createDescriptionSection() {
    const section = document.createElement('section');
    section.classList.add(this.getClass('desc'));
    this.descriptionSection = section;
    return section;
  }

  getClass(element, asSelector = false) {
    const {
      blockName
    } = this.options;
    const className = "".concat(blockName, "__").concat(element);
    if (asSelector) return ".".concat(className);
    return className;
  }

  static enhance(image, options) {
    return __awaiter(this, void 0, void 0, function* () {
      const opts = Object.assign(Object.assign({}, ImageDetails.defaultOptions), options);
      const hasDesc = Object.values(utilities_1.DescriptionAttribute).some(attr => image.getAttribute(attr));
      if (!hasDesc && !image.alt) return null;
      const instance = new ImageDetails(image, opts);
      yield instance.addDescription();
      return instance;
    });
  }

  static enhanceAll(_a = {}) {
    var {
      selector = 'img'
    } = _a,
        options = __rest(_a, ["selector"]);

    return __awaiter(this, void 0, void 0, function* () {
      yield Promise.all(Array.from(document.querySelectorAll(selector)).map(el => __awaiter(this, void 0, void 0, function* () {
        return ImageDetails.enhance(el, options);
      })));
      return ImageDetails.instances;
    });
  }

  static get instances() {
    return Array.from(ImageDetailsInstances);
  }

}

exports.ImageDetails = ImageDetails; // private hasAdjacentDetails = false;
// private existingDetailsDescription = false;

ImageDetails.baseName = 'image-details';
ImageDetails.defaultOptions = {
  addAltText: true,
  detailsPlacement: 'after-image',
  displaySummaryText: true,
  closeOnEscape: true,
  altSectionHeading: () => '<h2>Alt Text</h2>',
  descriptionHeading: () => '<h2>Image Description</h2>',
  summaryMarker: () => null,
  summaryText: hasDescription => {
    let text = 'Description';
    if (!hasDescription) text += ' (only alt text)';
    return text;
  },
  blockName: 'image-details',
  onGetDescription: utilities_1.noop
};
},{"../../utilities":"AMii"}],"IrGc":[function(require,module,exports) {
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

const utilities_1 = require("../../utilities");

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
        const excluded = [...(typeof excludedElements === 'function' ? excludedElements(this.el) : excludedElements), ...(excludeFocusable ? Array.from(utilities_1.getFocusable(this.el)) : [])].filter(el => el && e.composedPath().includes(el));
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

    if (this.keyboardEl) {
      this.keyboardEl.addEventListener('keydown', this.moveWithKeyboard);
    }
  }

  move(x, y) {
    const {
      top,
      left
    } = this.pos;

    if (top !== null && left !== null) {
      utilities_1.setStyle(this.el, {
        position: 'absolute',
        left: "".concat(left + x, "px"),
        top: "".concat(top + y, "px")
      });
    }

    this.options.onMove();
  }

  resetPosition() {
    utilities_1.setStyle(this.el, {
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
  onDrag: utilities_1.noop,
  onGrab: utilities_1.noop,
  onMove: utilities_1.noop,
  onRelease: utilities_1.noop
};
exports.makeDraggable = Draggable.makeDraggable;
},{"../../utilities":"AMii"}],"tPG0":[function(require,module,exports) {
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

const ImageDetails_1 = require("../ImageDetails");

const utilities_1 = require("../../utilities");

const draggable_1 = require("./draggable");

const ImageOverlayInstances = new Set();

class ImageOverlay {
  constructor(image, options) {
    this.image = image;
    this.options = options;
    this.enabled = false;
    this.ImageDetails = null;

    this.onToggle = () => {
      if (!this.ImageDetails) return;
      const {
        draggableClass,
        resizableClass
      } = this.options;
      const {
        details,
        marker
      } = this.ImageDetails;

      if (details.open) {
        details.classList.add(draggableClass);
        details.classList.add(resizableClass);
        marker.innerHTML = utilities_1.createIcon(utilities_1.icons.close).outerHTML;
      } else {
        details.classList.remove(draggableClass);
        details.classList.remove(resizableClass);
        details.removeAttribute('style');
        marker.innerHTML = utilities_1.createIcon(utilities_1.icons.details).outerHTML;
      }
    };

    this.onDocumentKeydown = e => {
      if (!this.ImageDetails || e.key !== 'Escape') return;
      const {
        closeAllOnEscape
      } = this.options;
      const {
        details
      } = this.ImageDetails;
      if (closeAllOnEscape) details.removeAttribute('open');
    };

    ImageOverlayInstances.add(this);
  }

  enable() {
    return __awaiter(this, void 0, void 0, function* () {
      if (this.enabled) return;
      this.ImageDetails = yield ImageDetails_1.ImageDetails.enhance(this.image, {
        blockName: 'overlaid',
        displaySummaryText: false,
        summaryMarker: () => utilities_1.createIcon(utilities_1.icons.details)
      });
      if (!this.ImageDetails) return;
      const {
        details,
        summary
      } = this.ImageDetails;
      const {
        draggingClass
      } = this.options;
      draggable_1.makeDraggable({
        el: details,
        keyboardEl: summary,
        onDrag: () => {
          details.classList.add(draggingClass);
        },
        onRelease: () => {
          details.classList.remove(draggingClass);
        }
      });
      details.addEventListener('toggle', this.onToggle);
      document.addEventListener('keydown', this.onDocumentKeydown);
      this.enabled = true;
    });
  }

  disable() {
    if (!this.enabled || !this.ImageDetails) return this;
    const {
      details
    } = this.ImageDetails;
    details.removeEventListener('toggle', this.onToggle);
    document.removeEventListener('keydown', this.onDocumentKeydown);
    this.enabled = false;
    return this;
  }

  destroy() {
    if (this.enabled) this.disable();
    if (this.ImageDetails) this.ImageDetails.destroy();
    ImageOverlayInstances.delete(this);
    return this;
  }

  get isOpen() {
    return this.ImageDetails ? this.ImageDetails.details.open : false;
  }

  static enhance(image, options) {
    return __awaiter(this, void 0, void 0, function* () {
      const opts = Object.assign(Object.assign({}, ImageOverlay.defaultOptions), options);
      const hasDesc = Object.values(utilities_1.DescriptionAttribute).some(attr => image.getAttribute(attr));
      if (!hasDesc && !image.alt) return null;
      const instance = new ImageOverlay(image, opts);
      yield instance.enable();
      return instance;
    });
  }

  static enhanceAll(_a = {}) {
    var {
      selector = 'img'
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
ImageOverlay.defaultOptions = {
  closeAllOnEscape: true,
  draggingClass: 'dragging',
  draggableClass: 'draggable',
  resizableClass: 'resizable'
};
},{"../ImageDetails":"ni5T","../../utilities":"AMii","./draggable":"IrGc"}],"etm4":[function(require,module,exports) {
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
exports.ImageModal = void 0;
const ImageModalInstances = new Set();
/**
 * TODO: implement an enhancement that displays the image and its description in
 * a modal dialog interface.
 */

class ImageModal {
  constructor(image, options) {
    this.image = image;
    this.options = options;
    ImageModalInstances.add(this);
  }

  static get instances() {
    return Array.from(ImageModalInstances);
  }

  static enhance(image, options) {
    return __awaiter(this, void 0, void 0, function* () {
      const opts = Object.assign(Object.assign({}, ImageModal.defaultOptions), options);
      const hasDesc = Object.values(DescriptionAttribute).some(attr => image.getAttribute(attr));
      if (!hasDesc && !image.alt) return null;
      const instance = new ImageModal(image, opts);
      yield instance.enable();
      return instance;
    });
  }

  static enhanceAll(_a = {}) {
    var {
      selector = ImageModal.selector
    } = _a,
        options = __rest(_a, ["selector"]);

    return __awaiter(this, void 0, void 0, function* () {
      yield Promise.all(Array.from(document.querySelectorAll(selector)).map(el => __awaiter(this, void 0, void 0, function* () {
        return ImageModal.enhance(el, options);
      })));
      return ImageModal.instances;
    });
  }

}

exports.ImageModal = ImageModal;
ImageModal.selector = 'img';
ImageModal.defaultOptions = {
  foo: ''
};
},{}],"fUdq":[function(require,module,exports) {
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

__exportStar(require("./enhancements/ImageDetails"), exports);

__exportStar(require("./enhancements/ImageOverlay"), exports);

__exportStar(require("./enhancements/ImageModal"), exports);

__exportStar(require("./utilities"), exports);
},{"./enhancements/ImageDetails":"ni5T","./enhancements/ImageOverlay":"tPG0","./enhancements/ImageModal":"etm4","./utilities":"AMii"}],"zLsf":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

const src_1 = require("../../src");

src_1.ImageOverlay.enhanceAll().then(console.log);
},{"../../src":"fUdq"}]},{},["zLsf"], null)
//# sourceMappingURL=/image-overlay.2b845640.js.map