const e=(...e)=>t=>!(t instanceof HTMLElement)||!e.some((e=>e.toUpperCase()===t.tagName.toUpperCase())),t=(e,t)=>e&&t.some((t=>t(e)))?e:null;let s;var i;(i=s||(s={})).ARIA_DETAILS="aria-details",i.ARIA_DESCRIBEDBY="aria-describedby",i.LONGDESC="longdesc";const n=async(i,n)=>{const a=i.getAttribute(n);if(!i.hasAttribute(n)||!a)return null;if(n===s.LONGDESC){const s=await(async(s,i,n=[e("script","style")])=>{const a=new Request(s),{hash:r,origin:o,pathname:l}=new URL(a.url);if(o+l===window.location.origin+window.location.pathname)return t(document.querySelector(r),n);const c=await fetch(a,i);if(200===c.status){const e=await c.text(),s=(new DOMParser).parseFromString(e,"text/html");if(r)return t(document.querySelector(r),n);if(null===s.body.firstChild)return null;const i=new DocumentFragment;return Array.from(s.body.childNodes).forEach((e=>{n.some((t=>t(e)))&&i.append(e)})),i}return null})(a);if(s instanceof DocumentFragment){const e=document.createElement("div");return e.append(s),e}return s}const r=document.getElementById(a);return r?r.cloneNode(!0):null},a=['[contentEditable=true]:not([tabindex="-1"])','[tabindex]:not([tabindex="-1"])','a[href]:not([tabindex="-1"])','button:not([disabled]):not([tabindex="-1"])',"dialog",'embed:not([tabindex="-1"])','iframe:not([tabindex="-1"])','input:not([disabled]):not([tabindex="-1"])','map[name] area[href]:not([tabindex="-1"])','object:not([tabindex="-1"])','select:not([disabled]):not([tabindex="-1"])','summary:not([tabindex="-1"])','textarea:not([disabled]):not([tabindex="-1"])'],r=(e=document)=>e.querySelectorAll(a.join(",")),o=(e,...t)=>{t.forEach((t=>{if("string"==typeof t){const s=document.createElement("div");s.innerHTML=t,e.append(s.firstChild)}else e.append(t)}))},l=()=>{},c=(e,t)=>{e.setAttribute("style",(e=>Object.keys(e).reduce(((t,s)=>{const i=e[s];return i?`${t} ${s}: ${i};`:t}),"").trim())(t))};function d(e,t,s){return t in e?Object.defineProperty(e,t,{value:s,enumerable:!0,configurable:!0,writable:!0}):e[t]=s,e}class h{constructor(e,t){d(this,"descriptionSection",null),d(this,"descriptionAttribute",null),d(this,"originalDetails",null),d(this,"descriptionAdded",!1),this.image=e,this.options=t,this.originalImage=this.image.cloneNode(!0),this.image.classList.add(this.getClass("image")),this.container=this.createContainer(),this.details=this.createDetails(),this.container.append(this.image,this.details),h.Instances.add(this)}get hasDescription(){return Object.values(s).some((e=>this.image.getAttribute(e)))}async addDescription(e){if(this.descriptionAdded)return;const{descriptionHeading:t,onGetDescription:i=l}=this.options;if(e)this.description=e;else{const e=await(async e=>Promise.all(Object.values(s).filter((t=>e.hasAttribute(t))).map((async t=>({attr:t,value:await n(e,t)})))))(this.image);if(i.call(this,e),e.length){const[{attr:t,value:s}]=e;this.descriptionAttribute=t,this.description=s}}this.description&&this.descriptionSection&&(o(this.descriptionSection,t(),this.description),this.descriptionAdded=!0)}destroy(){if((this.container.parentNode||document).insertBefore(this.originalImage,this.container),this.originalDetails){const{detailsPlacement:e}=this.options,t="after-image"===e?this.originalImage.nextSibling:this.originalImage;(this.originalImage.parentNode||document).insertBefore(this.originalDetails,t)}return this.container.remove(),h.Instances.delete(this),this}createContainer(){if(this.container)return this.container;const{blockName:e}=this.options,{parentElement:t}=this.image,s=t instanceof HTMLElement&&t.classList.contains(e)?t:document.createElement("div");return s.classList.add(e),s.contains(this.image)||(t||document).insertBefore(s,this.image),s}createDetails(){if(this.details)return this.details;const{detailsPlacement:e}=this.options;let t=document.createElement("details");const s="after-image"===e?this.image.nextElementSibling:this.image.previousElementSibling;if(s instanceof HTMLDetailsElement)this.originalDetails=s.cloneNode(!0),t=s;else{const s="after-image"===e?this.image.nextSibling:this.image;(this.image.parentNode||document).insertBefore(t,s),this.summary=this.createSummary(),t.prepend(this.summary),this.marker=this.createMarker(),this.summary.prepend(this.marker),this.contents=this.createContents(),t.append(this.contents)}return t.classList.add(this.getClass("details")),t}createSummary(){const{displaySummaryText:e,summaryText:t}=this.options,s=document.createElement("summary");s.classList.add(this.getClass("summary"));const i=t(this.hasDescription);if(e){const e=document.createElement("span");o(e,i),s.append(e)}else s.setAttribute("aria-label",i),s.setAttribute("title",i);return s}createMarker(){const{summaryMarker:e}=this.options,t=e(),s=document.createElement("span");return s.classList.add(this.getClass("marker")),t&&s.append(t),s}createContents(){const{addAltText:e}=this.options,t=document.createElement("div");return t.classList.add(this.getClass("contents")),e&&t.append(this.createAltSection()),t.append(this.createDescriptionSection()),t}createAltSection(){const{altSectionHeading:e}=this.options,t=document.createElement("section");return t.classList.add(this.getClass("alt")),t.setAttribute("aria-hidden","true"),o(t,e(),`<p>${this.image.alt}</p>`),t}createDescriptionSection(){const e=document.createElement("section");return e.classList.add(this.getClass("desc")),this.descriptionSection=e,e}updateMarker(e){for(;this.marker.firstChild;)this.marker.removeChild(this.marker.firstChild);return e&&this.marker.append(e),this}getClass(e,t=!1){const{blockName:s}=this.options,i=`${s}__${e}`;return t?"."+i:i}static async enhance(e,t){const i={...h.defaultOptions,...t};if(!Object.values(s).some((t=>e.getAttribute(t)))&&!e.alt)return null;const n=new h(e,i);return await n.addDescription(),n}static async enhanceAll({selector:e="img",...t}={}){return await Promise.all(Array.from(document.querySelectorAll(e)).map((async e=>h.enhance(e,t)))),h.instances}static get instances(){return Array.from(h.Instances)}}function m(e,t,s){return t in e?Object.defineProperty(e,t,{value:s,enumerable:!0,configurable:!0,writable:!0}):e[t]=s,e}d(h,"Instances",new Set),d(h,"baseName","image-details"),d(h,"defaultOptions",{addAltText:!0,detailsPlacement:"after-image",displaySummaryText:!0,closeOnEscape:!0,altSectionHeading:()=>"<h2>Short description</h2>",descriptionHeading:()=>"<h2>Long description</h2>",summaryMarker:()=>null,summaryText:e=>{let t="Description";return e||(t+=" (only alt text)"),t},blockName:"image-details",onGetDescription:l});class u{constructor(e,t,s){m(this,"moveX",0),m(this,"moveY",0),m(this,"canGrab",!1),m(this,"grabbed",!1),m(this,"grab",(e=>{this.canGrab&&(this.moveX=e.clientX,this.moveY=e.clientY,this.grabbed=!0,this.options.onGrab())})),m(this,"release",(()=>{this.moveX=0,this.moveY=0,this.grabbed=!1,this.options.onRelease()})),m(this,"drag",(({clientX:e,clientY:t})=>{this.move(e-this.moveX,t-this.moveY),this.moveX=e,this.moveY=t,this.options.onDrag()})),m(this,"pointermove",(e=>{if(this.grabbed)this.drag(e);else{const{excludedElements:t,excludeFocusable:s}=this.options,i=[..."function"==typeof t?t(this.el):t,...s?Array.from(r(this.el)):[]].filter((t=>t&&e.composedPath().includes(t)));this.canGrab=!i.some(Boolean)}})),m(this,"moveWithKeyboard",(e=>{const t=e.shiftKey?20:1,s=u.getKeyboardPosition(e.key,5*t);if(s)if(e.preventDefault(),"reset"===s)this.resetPosition();else{const{left:e,top:t}=s;this.move(e,t)}})),this.el=e,this.keyboardEl=t,this.options={...u.defaultOptions,...s},this.el.addEventListener("pointerdown",this.grab),this.el.addEventListener("pointerleave",this.release),this.el.addEventListener("pointermove",this.pointermove),this.el.addEventListener("pointerup",this.release),this.keyboardEl&&this.keyboardEl.addEventListener("keydown",this.moveWithKeyboard)}move(e,t){const{top:s,left:i}=this.pos;null!==s&&null!==i&&c(this.el,{position:"absolute",left:i+e+"px",top:s+t+"px"}),this.options.onMove()}resetPosition(){c(this.el,{position:null,top:null,left:null})}get pos(){const{top:e="0",left:t="0"}=window.getComputedStyle(this.el);return{top:"auto"===e?null:parseInt(e,10),left:"auto"===e?null:parseInt(t,10)}}static getKeyboardPosition(e,t){switch(e){case"ArrowRight":return{left:t,top:0};case"ArrowLeft":return{left:-t,top:0};case"ArrowDown":return{left:0,top:t};case"ArrowUp":return{left:0,top:-t};case"Home":return"reset";default:return null}}}m(u,"defaultOptions",{excludedElements:[],excludeFocusable:!0,onDrag:l,onGrab:l,onMove:l,onRelease:l}),m(u,"makeDraggable",(({el:e,keyboardEl:t,...s})=>new u(e,t,s)));const{makeDraggable:p}=u,g="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z",b="M9,5v2h6.59L4,18.59L5.41,20L17,8.41V15h2V5H9z",f=(e=!1)=>{const t=document.createElementNS("http://www.w3.org/2000/svg","svg");t.setAttribute("role","img"),t.setAttribute("viewBox","0 0 24 24"),t.setAttribute("focusable","false"),t.setAttribute("aria-hidden","true");const s=document.createElementNS("http://www.w3.org/2000/svg","path");return s.setAttribute("fill","currentColor"),s.setAttribute("d",e?g:b),t.append(s),t};function y(e,t,s){return t in e?Object.defineProperty(e,t,{value:s,enumerable:!0,configurable:!0,writable:!0}):e[t]=s,e}class v{constructor(e,t){y(this,"enabled",!1),y(this,"ImageDetails",null),y(this,"onToggle",(()=>{if(!this.ImageDetails)return;const{draggableClass:e,resizableClass:t}=this.options,{details:s}=this.ImageDetails;s.open?(s.classList.add(e),s.classList.add(t),this.ImageDetails.updateMarker(this.markerOpen)):(s.classList.remove(e),s.classList.remove(t),s.removeAttribute("style"),this.ImageDetails.updateMarker(this.markerClosed))})),y(this,"onDocumentKeydown",(e=>{if(!this.ImageDetails||"Escape"!==e.key)return;const{closeAllOnEscape:t}=this.options,{details:s}=this.ImageDetails;t&&s.removeAttribute("open")})),this.image=e,this.options=t,v.Instances.add(this)}get markerOpen(){const{marker:e}=this.options;return"open"in e&&"function"==typeof e.open?e.open():"function"==typeof e?e():null}get markerClosed(){const{marker:e}=this.options;return"closed"in e&&"function"==typeof e.closed?e.closed():"function"==typeof e?e():null}async enable(){if(this.enabled)return;const{onGetDescription:e,draggingClass:t}=this.options;if(this.ImageDetails=await h.enhance(this.image,{blockName:"overlaid",displaySummaryText:!1,summaryMarker:()=>this.markerClosed,onGetDescription:e}),!this.ImageDetails)return;const{details:s,summary:i}=this.ImageDetails;p({el:s,keyboardEl:i,onDrag:()=>{s.classList.add(t)},onRelease:()=>{s.classList.remove(t)}}),s.addEventListener("toggle",this.onToggle),document.addEventListener("keydown",this.onDocumentKeydown),this.enabled=!0}disable(){if(!this.enabled||!this.ImageDetails)return this;const{details:e}=this.ImageDetails;return e.removeEventListener("toggle",this.onToggle),document.removeEventListener("keydown",this.onDocumentKeydown),this.enabled=!1,this}destroy(){return this.enabled&&this.disable(),this.ImageDetails&&this.ImageDetails.destroy(),v.Instances.delete(this),this}get isOpen(){return!!this.ImageDetails&&this.ImageDetails.details.open}static async enhance(e,t){const i={...v.defaultOptions,...t};if(!Object.values(s).some((t=>e.getAttribute(t)))&&!e.alt)return null;const n=new v(e,i);return await n.enable(),n}static async enhanceAll({selector:e="img",...t}={}){return await Promise.all(Array.from(document.querySelectorAll(e)).map((async e=>v.enhance(e,t)))),v.instances}static get instances(){return Array.from(v.Instances)}}function A(e,t,s){return t in e?Object.defineProperty(e,t,{value:s,enumerable:!0,configurable:!0,writable:!0}):e[t]=s,e}y(v,"Instances",new Set),y(v,"defaultOptions",{closeAllOnEscape:!0,draggingClass:"dragging",draggableClass:"draggable",resizableClass:"resizable",onGetDescription:l,marker:{open:f.bind(null,!0),closed:f.bind(null,!1)}});class w{constructor(e,t){this.image=e,this.options=t,w.Instances.add(this)}enable(){return console.log(this),Promise.resolve()}static get instances(){return Array.from(w.Instances)}static async enhance(e,t){const i={...w.defaultOptions,...t};if(!Object.values(s).some((t=>e.getAttribute(t)))&&!e.alt)return null;const n=new w(e,i);return await n.enable(),n}static async enhanceAll({selector:e=w.selector,...t}={}){return await Promise.all(Array.from(document.querySelectorAll(e)).map((async e=>w.enhance(e,t)))),w.instances}}A(w,"Instances",new Set),A(w,"selector","img"),A(w,"defaultOptions",{foo:""});const D=()=>{};v.enhanceAll({selector:".overlay"}).then(console.log,D),h.enhanceAll({selector:".details"}).then(console.log,D);
//# sourceMappingURL=index.d2c0ab32.js.map
