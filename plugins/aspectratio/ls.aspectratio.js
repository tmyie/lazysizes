(function(window, document){
	'use strict';

	var imageRatio, extend$;

	var regPicture = /^picture$/i;
	var aspectRatioAttr = 'data-aspectratio';
	var aspectRatioSel = 'img[' + aspectRatioAttr + ']';

	var matchesMedia = function(media){
		if(window.matchMedia){
			matchesMedia = function(media){
				return !media || (matchMedia(media) || {}).matches;
			};
		} else if(window.Modernizr && Modernizr.mq){
			return !media || Modernizr.mq(media);
		} else {
			return !media;
		}
		return matchesMedia(media);
	};

	function AspectRatio(){
		this.ratioElems = document.getElementsByClassName('lazyaspectratio');
		this._setupEvents();
		this.processImages();
	}

	AspectRatio.prototype = {
		_setupEvents: function(){
			var module = this;

			var addRemoveAspectRatio = function(elem){
				if(elem.naturalWidth < 50){
					module.addAspectRatio(elem, true);
				} else {
					module.removeAspectRatio(elem, true);
				}
			};
			var onload = function(){
				module.processImages();
			};

			document.addEventListener('load', function(e){
				if(e.target.getAttribute && e.target.getAttribute(aspectRatioAttr)){
					addRemoveAspectRatio(e.target);
				}
			}, true);

			addEventListener('resize', (function(){
				var timer;
				var resize = function(){
					var i, len;
					for(i = 0, len = module.ratioElems.length; i < len; i++){
						addRemoveAspectRatio(module.ratioElems[i]);
					}
				};

				return function(){
					clearTimeout(timer);
					timer = setTimeout(resize, 33);
				};
			})());

			document.addEventListener('DOMContentLoaded', onload);

			addEventListener('load', onload);
		},
		processImages: function(context){
			var elements, i;

			if(!context){
				context = document;
			}

			if('length' in context && !context.nodeName){
				elements = context;
			} else {
				elements = context.querySelectorAll(aspectRatioSel);
			}

			for(i = 0; i < elements.length; i++){
				if(elements[i].naturalWidth > 50){
					this.removeAspectRatio(elements[i]);
					continue;
				}
				this.addAspectRatio(elements[i]);
			}
		},
		getSelectedRatio: function(img){
			var i, len, sources, customMedia, ratio;
			var parent = img.parentNode;
			if(parent && regPicture.test(parent.nodeName || '')){
				sources = parent.getElementsByTagName('source');

				for(i = 0, len = sources.length; i < len; i++){
					customMedia = sources[i].getAttribute('data-media') || sources[i].getAttribute('media');

					if(lazySizesConfig.customMedia[customMedia]){
						customMedia = lazySizesConfig.customMedia[customMedia];
					}

					if(matchesMedia(customMedia)){
						ratio = sources[i].getAttribute(aspectRatioAttr);
						break;
					}
				}
			}

			return ratio || img.getAttribute(aspectRatioAttr) || '';
		},
		parseRatio: (function(){
			var regRatio = /^\s*([+\d\.]+)(\s*[\/x]\s*([+\d\.]+))?\s*$/;
			var ratioCache = {};
			return function(ratio){

				if(!ratioCache[ratio] && ratio.match(regRatio)){
					if(RegExp.$3){
						ratioCache[ratio] = RegExp.$1 / RegExp.$3;
					} else {
						ratioCache[ratio] = RegExp.$1 * 1;
					}
				}

				return ratioCache[ratio];
			};
		})(),
		addAspectRatio: function(img, notNew){
			var ratio;
			var width = img.offsetWidth;

			if(!notNew){
				lazySizes.aC(img, 'lazyaspectratio');
			}

			if(!width){return;}

			ratio = this.getSelectedRatio(img);
			ratio = this.parseRatio(ratio);

			if(ratio){
				img.style.height = (width / ratio) + 'px';
			}
		},
		removeAspectRatio: function(img){
			lazySizes.rC(img, 'lazyaspectratio');
			img.style.height = '';
			img.removeAttribute(aspectRatioAttr);
		}
	};

	extend$ = function(){
		var $ = window.jQuery || window.Zepto || window.shoestring || window.$;
		if($ && $.fn && !$.fn.imageRatio && $.fn.filter && $.fn.add && $.fn.find){
			$.fn.imageRatio = function(){
				imageRatio.processImages(this.find(aspectRatioSel).add(this.filter(aspectRatioSel)));
				return this;
			};
		}
	};

	extend$();
	setTimeout(extend$);

	imageRatio = new AspectRatio();

	window.imageRatio = imageRatio;

	if(typeof module == 'object' && module.exports){
		module.exports = imageRatio;
	} else if (typeof define == 'function' && define.amd) {
		define(imageRatio);
	}

})(window, document);
