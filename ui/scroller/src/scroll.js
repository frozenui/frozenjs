(function (window, document, Math) {


/*
 * 使用 requestAnimationFrame 兼容不支持 Transform 属性的浏览器
 * 当原生 RAF 没有得到支持的时候，用 setTimeout 来模拟(60FPS)
 */
var rAF = window.requestAnimationFrame	||
	window.webkitRequestAnimationFrame	||
	window.mozRequestAnimationFrame		||
	window.oRequestAnimationFrame		||
	window.msRequestAnimationFrame		||
	function (callback) { window.setTimeout(callback, 1000 / 60); };



/*
 * 工具类
 */
var utils = (function () {


	/*
	 * 最后用于返回的对象
	 */
	var me = {};


	/*
	 * 检测前缀，并按照支持度赋予
	 */
	var _elementStyle = document.createElement('div').style;
	var _vendor = (function () {
		var vendors = ['t', 'webkitT', 'MozT', 'msT', 'OT'],
			transform,
			i = 0,
			l = vendors.length;

		for ( ; i < l; i++ ) {
			transform = vendors[i] + 'ransform';
			if ( transform in _elementStyle ) return vendors[i].substr(0, vendors[i].length-1);
		}

		return false;
	})();

	function _prefixStyle (style) {
		if ( _vendor === false ) return false;
		if ( _vendor === '' ) return style;
		return _vendor + style.charAt(0).toUpperCase() + style.substr(1);
	}




	/*
	 * 获取当前时间
	 */
	me.getTime = Date.now || function getTime () { return new Date().getTime(); };




	/*
	 * 扩展属性
	 */
	me.extend = function (target, obj) {
		for ( var i in obj ) {
			target[i] = obj[i];
		}
	};



	/*
	 * 添加/解除事件绑定
	 */
	me.addEvent = function (el, type, fn, capture) {
		el.addEventListener(type, fn, !!capture);	
	};

	me.removeEvent = function (el, type, fn, capture) {
		el.removeEventListener(type, fn, !!capture);
	};




	/*
	 * Pointer Evnet 是 Microsoft 提出的指针事件，和 Touch 事件类似
	 * http://www.iefans.net/zhizhen-shijian-pointer-event/
	 */
	me.prefixPointerEvent = function (pointerEvent) {
		return window.MSPointerEvent ? 
			'MSPointer' + pointerEvent.charAt(9).toUpperCase() + pointerEvent.substr(10):
			pointerEvent;
	};




	/*
	 * ====重要====
	 *   设置动量
	 */
	me.momentum = function (current, start, time, lowerMargin, wrapperSize, deceleration) {
		var distance = current - start,
			speed = Math.abs(distance) / time,
			destination,
			duration;

		deceleration = deceleration === undefined ? 0.0006 : deceleration;

		destination = current + ( speed * speed ) / ( 2 * deceleration ) * ( distance < 0 ? -1 : 1 );
		duration = speed / deceleration;

		if ( destination < lowerMargin ) {
			destination = wrapperSize ? lowerMargin - ( wrapperSize / 2.5 * ( speed / 8 ) ) : lowerMargin;
			distance = Math.abs(destination - current);
			duration = distance / speed;
		} else if ( destination > 0 ) {
			destination = wrapperSize ? wrapperSize / 2.5 * ( speed / 8 ) : 0;
			distance = Math.abs(current) + destination;
			duration = distance / speed;
		}

		return {
			destination: Math.round(destination),
			duration: duration
		};
	};





	/* 
	 * 动画能力嗅探与装饰
	 * 如支持的属性、CSS 前缀绑定
	 */
	var _transform = _prefixStyle('transform');

	me.extend(me, {
		hasTransform: _transform !== false,
		hasPerspective: _prefixStyle('perspective') in _elementStyle,
		hasTouch: 'ontouchstart' in window,
		hasPointer: window.PointerEvent || window.MSPointerEvent, // IE10 is prefixed
		hasTransition: _prefixStyle('transition') in _elementStyle
	});

	// This should find all Android browsers lower than build 535.19 (both stock browser and webview)
	me.isBadAndroid = /Android /.test(window.navigator.appVersion) && !(/Chrome\/\d/.test(window.navigator.appVersion));

	me.extend(me.style = {}, {
		transform: _transform,
		transitionTimingFunction: _prefixStyle('transitionTimingFunction'),
		transitionDuration: _prefixStyle('transitionDuration'),
		transitionDelay: _prefixStyle('transitionDelay'),
		transformOrigin: _prefixStyle('transformOrigin')
	});




	/* 
	 * 类名操作
	 */
	me.hasClass = function (e, c) {
		var re = new RegExp("(^|\\s)" + c + "(\\s|$)");
		return re.test(e.className);
	};

	me.addClass = function (e, c) {
		if ( me.hasClass(e, c) ) {
			return;
		}

		var newclass = e.className.split(' ');
		newclass.push(c);
		e.className = newclass.join(' ');
	};

	me.removeClass = function (e, c) {
		var i,
			l = e.length;
		
		for (i=0; i<l; i++) {
			
			if (me.hasClass(e[i], c)) {
				var re = new RegExp("(^|\\s)" + c + "(\\s|$)", 'g');
				e[i].className = e[i].className.replace(re, ' ');
			}
		}
	};





	/*
	 * 获取元素的偏移值
	 */
	me.offset = function (el) {

		/*
		 * HTMLElement.offsetLeft 是一个只读属性，返回当前元素左上角相对于 HTMLElement.offsetParent 节点的左边界偏移的像素数。
		 * 对块级元素来说，offsetTop、offsetLeft、offsetWidth 及 offsetHeight 描述的是一个元素相对于 offsetParent 的 border-box 的偏移量。
		 */
		var left = -el.offsetLeft,
			top = -el.offsetTop;

		/*
		 * HTMLElement.offsetParent 是一个只读属性，返回一个指向最近的（closest，指包含层级上的最近）包含该元素的定位元素。
		 * 定位元素即设置了 position: relative/absolute/fixed 属性的元素。
		 * 如果没有定位的元素，则 offsetParent 为最近的 table 元素对象或根元素（标准模式下为 html；quirks 模式下为 body）。
		 * 当元素的 style.display 设置为 "none" 时，offsetParent 返回 null。offsetParent 很有用，因为 offsetTop 和 offsetLeft 都是相对于其内边距边界的（padding）。
		 */
		// 若存在这么一个定位元素，则减去它。而且是递归的。这里希望得到的是一个相对于根节点的绝对定位坐标，这样才更准确。
		while (el = el.offsetParent) {
			left -= el.offsetLeft;
			top -= el.offsetTop;
		}

		return {
			left: left,
			top: top
		};
	};




	me.preventDefaultException = function (el, exceptions) {
		for ( var i in exceptions ) {
			if ( exceptions[i].test(el[i]) ) {
				return true;
			}
		}

		return false;
	};




	/* 
	 * 标识不同的事件类型
	 */
	me.extend(me.eventType = {}, {
		touchstart: 1,
		touchmove: 1,
		touchend: 1,

		mousedown: 2,
		mousemove: 2,
		mouseup: 2,

		pointerdown: 3,
		pointermove: 3,
		pointerup: 3,

		MSPointerDown: 3,
		MSPointerMove: 3,
		MSPointerUp: 3
	});





	/* 
	 * 过渡动画扩展
	 * 保存两个属性：一个是贝塞尔曲线，一个是相关的函数
	 */
	me.extend(me.ease = {}, {
		quadratic: {
			style: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
			fn: function (k) {
				return k * ( 2 - k );
			}
		},
		circular: {
			style: 'cubic-bezier(0.1, 0.57, 0.1, 1)',	// Not properly "circular" but this looks better, it should be (0.075, 0.82, 0.165, 1)
			fn: function (k) {
				return Math.sqrt( 1 - ( --k * k ) );
			}
		},
		back: {
			style: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
			fn: function (k) {
				var b = 4;
				return ( k = k - 1 ) * k * ( ( b + 1 ) * k + b ) + 1;
			}
		},
		bounce: {
			style: '',
			fn: function (k) {
				if ( ( k /= 1 ) < ( 1 / 2.75 ) ) {
					return 7.5625 * k * k;
				} else if ( k < ( 2 / 2.75 ) ) {
					return 7.5625 * ( k -= ( 1.5 / 2.75 ) ) * k + 0.75;
				} else if ( k < ( 2.5 / 2.75 ) ) {
					return 7.5625 * ( k -= ( 2.25 / 2.75 ) ) * k + 0.9375;
				} else {
					return 7.5625 * ( k -= ( 2.625 / 2.75 ) ) * k + 0.984375;
				}
			}
		},
		elastic: {
			style: '',
			fn: function (k) {
				var f = 0.22,
					e = 0.4;

				if ( k === 0 ) { return 0; }
				if ( k == 1 ) { return 1; }

				return ( e * Math.pow( 2, - 10 * k ) * Math.sin( ( k - f / 4 ) * ( 2 * Math.PI ) / f ) + 1 );
			}
		}
	});




	/*
	 * 触摸事件定义
	 */
	me.tap = function (e, eventName) {
		var ev = document.createEvent('Event');
		ev.initEvent(eventName, true, true);
		ev.pageX = e.pageX;
		ev.pageY = e.pageY;
		e.target.dispatchEvent(ev);
	};



	/* 
	 * 自定义 Click 事件，如果选中是下面的表单元素，则不返回 click 事件
	 */
	me.click = function (e) {
		var target = e.target,
			ev;

		if ( !(/(SELECT|INPUT|TEXTAREA)/i).test(target.tagName) ) {
			ev = document.createEvent('MouseEvents');
			ev.initMouseEvent('click', true, true, e.view, 1,
				target.screenX, target.screenY, target.clientX, target.clientY,
				e.ctrlKey, e.altKey, e.shiftKey, e.metaKey,
				0, null);

			ev._constructed = true;
			target.dispatchEvent(ev);
		}
	};


	return me;
})();






/*
 * Scroll 构造函数
 */
function Scroll (el, options) {

	// 通过 querySelector 只获取第一个元素
	this.wrapper = typeof el == 'string' ? document.querySelector(el) : el;


	// 默认属性
	this.options = {

		startX: 0,					// 初始化 X 坐标
		startY: 0,					// 初始化 Y 坐标
		scrollY: true,				// 竖向滚动
		directionLockThreshold: 5,	// 在竖向滚动的时候，锁定水平滚动的阈值（如水平滚动不超过 5 像素的时候不会水平滚）
		momentum: true,				// 是否开启惯性滚动

		bounce: true,				// 是否有反弹动画
		bounceTime: 600,			// 反弹动画时间
		bounceEasing: '',			// 反弹动画类型：'quadratic', 'circular', 'back', 'bounce', 'elastic'
									// 可以自定义 Name: {style: 'cubic-bezier(0,0,1,1)',fn: function (k) { return k; }}

		/* 
		 * 注意：
		 *  1、eventPassthrough 的优先级要大于 preventDefault，如果前者设置了某一方向，那么另外一个方向不会冒泡事件，不管后者是否设置为 false。
		 * 	2、默认情况下会阻止事件冒泡，即在 wrapper 范围内事件不会出去
		 */
		preventDefault: true,		// 是否阻止事件冒泡
		eventPassthrough: '',		// vertical / horizontal：允许某个方向的事件冒泡

		freeScroll: false,			// 任意方向的滚动。若 scrollX 和 scrollY 同时开启，则相当于 freeScroll

		preventDefaultException: { tagName: /^(INPUT|TEXTAREA|BUTTON|SELECT)$/ },

		HWCompositing: true, 		// 硬件加速
		useTransition: true,		// Transition || requestAnimationFrame
		useTransform: true			// Translate || Left/Top
	};




	// 覆盖或重置新属性
	for ( var i in options ) {
		this.options[i] = options[i];
	}



	// slide
	// ==================================

	if (this.options.role === 'slider') {

		this.options.scrollX = true;
		this.options.scrollY = false;
		this.options.momentum = false;

		this.scroller = document.querySelector('.ui-slider-content');
		this.indicator = this.options.indicator ? document.querySelector('.ui-slider-indicators') : null;

		this.currentPage = 0;
		
		this.count = this.scroller.children.length;
		this.itemWidth = this.scroller.children[0].clientWidth;
		this.scrollWidth = this.itemWidth * this.count;
		
		if (this.indicator) {
			utils.addClass(this.indicator.children[0], 'current');
		}
	}


	// tab
	// ==================================

	else if (this.options.role === 'tab') {

		this.options.scrollX = true;
		this.options.scrollY = false;
		this.options.momentum = false;

		this.scroller = document.querySelector('.ui-tab-content');
		this.nav = document.querySelector('.ui-tab-nav');

		this.currentPage = 0;
		
		this.count = this.scroller.children.length;
		this.itemWidth = this.scroller.children[0].clientWidth;
		this.scrollWidth = this.itemWidth * this.count;
		
		for (var i=0; i<this.count; i++) {
			this.nav.children[i]['id'] = i;
		}
		utils.addClass(this.nav.children[0], 'current');
		
	}

	else {
		this.scroller = this.wrapper.children[0];
	}


	// cache style for better performance
	// 缓存样式
	this.scrollerStyle = this.scroller.style;


	// 这里的设置会覆盖用户的设置，主要是最一些不合理的设置进行重置

	// 有了 perspective 之后开启硬件加速才有效？
	this.translateZ = utils.hasPerspective && this.options.HWCompositing ? ' translateZ(0)' : '';

	this.options.useTransition = utils.hasTransition && this.options.useTransition;
	this.options.useTransform = utils.hasTransform && this.options.useTransform;

	this.options.eventPassthrough = this.options.eventPassthrough === true ? 'vertical' : this.options.eventPassthrough;
	this.options.preventDefault = !this.options.eventPassthrough && this.options.preventDefault;

	// If you want eventPassthrough I have to lock one of the axes
	this.options.scrollX = this.options.eventPassthrough == 'horizontal' ? false : this.options.scrollX;
	this.options.scrollY = this.options.eventPassthrough == 'vertical' ? false : this.options.scrollY;

	// With eventPassthrough we also need lockDirection mechanism
	this.options.freeScroll = this.options.freeScroll && !this.options.eventPassthrough;
	this.options.directionLockThreshold = this.options.eventPassthrough ? 0 : this.options.directionLockThreshold;

	this.options.bounceEasing = typeof this.options.bounceEasing == 'string' ? utils.ease[this.options.bounceEasing] || utils.ease.circular : this.options.bounceEasing;

	this.options.resizePolling = this.options.resizePolling === undefined ? 60 : this.options.resizePolling;

	if ( this.options.tap === true ) {
		this.options.tap = 'tap';
	}





	// Some defaults	
	this.x = 0;
	this.y = 0;
	this.directionX = 0;
	this.directionY = 0;
	this._events = {};		// 存放绑定事件的对象




	this._init();	// 绑定各种事件
	this.refresh();	// 

	this.scrollTo(this.options.startX, this.options.startY);	// 滚动到指定位置
	this.enable();	// 设置能否滑动

	if (this.options.autoplay) {
		var context = this;

		this.options.interval = this.options.interval || 2000;

		this.options.flag = setTimeout(function(){
			context._autoplay.apply(context)
		}, context.options.interval);
	}
	
}





/* 
 * Scroll 原型扩展
 */
Scroll.prototype = {
	// version: '5.1.3',

	_init: function () {
		this._initEvents();

	},
	

	/*
	 * 事件绑定
	 */
	_initEvents: function (remove) {

		var eventType = remove ? utils.removeEvent : utils.addEvent,
			target = this.options.bindToWrapper ? this.wrapper : window;

		/*
		 * 给 addEventListener 传递 this
		 * 程序会自动找到 handleEvent 方法作为回调函数
		 */
		eventType(window, 'orientationchange', this);
		eventType(window, 'resize', this);

		if ( this.options.click ) {
			eventType(this.wrapper, 'click', this, true);
		}

		if ( !this.options.disableMouse ) {
			eventType(this.wrapper, 'mousedown', this);
			eventType(target, 'mousemove', this);
			eventType(target, 'mousecancel', this);
			eventType(target, 'mouseup', this);
		}

		if ( utils.hasPointer && !this.options.disablePointer ) {
			eventType(this.wrapper, utils.prefixPointerEvent('pointerdown'), this);
			eventType(target, utils.prefixPointerEvent('pointermove'), this);
			eventType(target, utils.prefixPointerEvent('pointercancel'), this);
			eventType(target, utils.prefixPointerEvent('pointerup'), this);
		}

		if ( utils.hasTouch && !this.options.disableTouch ) {
			eventType(this.wrapper, 'touchstart', this);
			eventType(target, 'touchmove', this);
			eventType(target, 'touchcancel', this);
			eventType(target, 'touchend', this);
		}

		eventType(this.scroller, 'transitionend', this);
		eventType(this.scroller, 'webkitTransitionEnd', this);
		eventType(this.scroller, 'oTransitionEnd', this);
		eventType(this.scroller, 'MSTransitionEnd', this);



		// tab
		// =============================
		if (this.options.role === 'tab') {
			eventType(this.nav, 'touchend', this);
			eventType(this.nav, 'mouseup', this);
			eventType(this.nav, 'pointerup', this);
		}

	},


	
	refresh: function () {
		var rf = this.wrapper.offsetHeight;		// Force reflow


		/*
		 * clientWidth/Height
		 * offsetWidth/Height
		 * 详情看这里：http://jsfiddle.net/y8Y32/25/
		 */
		this.wrapperWidth	= this.wrapper.clientWidth;
		this.wrapperHeight	= this.wrapper.clientHeight;


		var matrix = window.getComputedStyle(this.wrapper, null);

		var pt = matrix['padding-top'].replace(/[^-\d.]/g, ''),
			pb = matrix['padding-bottom'].replace(/[^-\d.]/g, ''),
			pl = matrix['padding-left'].replace(/[^-\d.]/g, ''),
			pr = matrix['padding-right'].replace(/[^-\d.]/g, '');


		this.scrollerWidth	= this.scroller.offsetWidth+parseInt(pl)+parseInt(pr);
		this.scrollerHeight	= this.scroller.offsetHeight+parseInt(pt)+parseInt(pb);

		// this.scrollerWidth	= this.scroller.scrollWidth;
		// this.scrollerHeight	= this.scroller.scrollHeight;


		// slide
		// ==================================
		if (this.options.role === 'slider' || this.options.role === 'tab') {
			this.scrollerWidth = this.scrollWidth;
		}


		this.maxScrollX		= this.wrapperWidth - this.scrollerWidth;
		this.maxScrollY		= this.wrapperHeight - this.scrollerHeight;

		this.hasHorizontalScroll	= this.options.scrollX && this.maxScrollX < 0;
		this.hasVerticalScroll		= this.options.scrollY && this.maxScrollY < 0;


		if ( !this.hasHorizontalScroll ) {
			this.maxScrollX = 0;
			this.scrollerWidth = this.wrapperWidth;
		}

		if ( !this.hasVerticalScroll ) {
			this.maxScrollY = 0;
			this.scrollerHeight = this.wrapperHeight;
		}

		this.endTime = 0;
		this.directionX = 0;
		this.directionY = 0;

		this.wrapperOffset = utils.offset(this.wrapper);

		this._execEvent('refresh');

		this.resetPosition();

	},
	
	


	/*
	 * 统一事件接口
	 */
	handleEvent: function (e) {
		switch ( e.type ) {
			case 'touchstart':
			case 'pointerdown':
			case 'MSPointerDown':
			case 'mousedown':
				this._start(e);
				break;
			case 'touchmove':
			case 'pointermove':
			case 'MSPointerMove':
			case 'mousemove':
				this._move(e);
				break;
			case 'touchend':
			case 'pointerup':
			case 'MSPointerUp':
			case 'mouseup':
			case 'touchcancel':
			case 'pointercancel':
			case 'MSPointerCancel':
			case 'mousecancel':
				this._end(e);
				break;
			case 'orientationchange':
			case 'resize':
				this._resize();
				break;
			case 'transitionend':
			case 'webkitTransitionEnd':
			case 'oTransitionEnd':
			case 'MSTransitionEnd':
				this._transitionEnd(e);
				break;
			case 'wheel':
			case 'DOMMouseScroll':
			case 'mousewheel':
				this._wheel(e);
				break;
			case 'keydown':
				this._key(e);
				break;
			case 'click':
				if ( !e._constructed ) {
					e.preventDefault();
					e.stopPropagation();
				}
				break;
		}
	},



	_start: function (e) {

		// React to left mouse button only
		// 如果是鼠标点击，则只响应鼠标左键，其他键不做响应，包括滚轮
		if ( utils.eventType[e.type] != 1 ) {

			// e.button  0：鼠标左键 1：鼠标滚轮 2：鼠标右键
			if ( e.button !== 0 ) {
				return;
			}
		}
		

		if ( !this.enabled || (this.initiated && utils.eventType[e.type] !== this.initiated) ) {
			return;
		}

		if ( this.options.preventDefault && !utils.isBadAndroid && !utils.preventDefaultException(e.target, this.options.preventDefaultException) ) {
			e.preventDefault();
		}

		var point = e.touches ? e.touches[0] : e,	// 检验是触摸事件对象还是鼠标事件对象
			pos;

		this.initiated	= utils.eventType[e.type];	// 初始化事件类型（触摸：1，鼠标：2，pointer：3）
		this.moved		= false;					// 是否移动
		this.distX		= 0;
		this.distY		= 0;
		this.directionX = 0;
		this.directionY = 0;
		this.directionLocked = 0;

		this._transitionTime();				// 设置 scroller 的缓动时间

		this.startTime = utils.getTime();	// 记录滑动开始时间


		// 场景：若 scroller 正在惯性滚动，同时被按住（使用 Transition 属性）
		// 结果：立马定住正在滑动的 scroller
		if ( this.options.useTransition && this.isInTransition ) {
			this.isInTransition = false;
			pos = this.getComputedPosition();						// {x:x, y:y}
			this._translate(Math.round(pos.x), Math.round(pos.y));	// 立马定住 scroller 的位置
			this._execEvent('scrollEnd');							// 发出滚动结束的事件
		}

		// 场景：（没有使用 Transition 属性）
		else if ( !this.options.useTransition && this.isAnimating ) {
			this.isAnimating = false;
			this._execEvent('scrollEnd');
		}

		this.startX    = this.x;	// 相对于 wrapper 的偏移量
		this.startY    = this.y;	// 相对于 wrapper 的偏移量
		this.absStartX = this.x;
		this.absStartY = this.y;
		this.pointX    = point.pageX;	// 相对于 document 的偏移量
		this.pointY    = point.pageY;	// 相对于 document 的偏移量


		this._execEvent('beforeScrollStart');

		if (this.options.role === 'slider' || this.options.role === 'tab') {
			this._execEvent('slideStart');
		}



		// throttle
		// ======================
		if (this.options.autoplay) {
			var context = this;

			clearTimeout(this.options.flag);
			this.options.flag = setTimeout(function() {
									context._autoplay.apply(context);
								}, context.options.interval);
		}
		
	},



	_move: function (e) {
		if ( !this.enabled || utils.eventType[e.type] !== this.initiated ) {
			return;
		}

		if ( this.options.preventDefault ) {	// increases performance on Android
			e.preventDefault();					// 貌似这么做才能确保 Android 下 touchend 能被正常触发
		}

		var point		= e.touches ? e.touches[0] : e,
			deltaX		= point.pageX - this.pointX,		// 偏移量X
			deltaY		= point.pageY - this.pointY,		// 偏移量Y
			timestamp	= utils.getTime(),					// 获取当前时间戳
			newX, newY,
			absDistX, absDistY;

		this.pointX		= point.pageX;		// 重新赋值当前偏移量X
		this.pointY		= point.pageY;		// 重新赋值当前偏移量Y

		this.distX		+= deltaX;			// 距离X 的偏移量
		this.distY		+= deltaY;			// 距离Y 的偏移量
		absDistX		= Math.abs(this.distX);
		absDistY		= Math.abs(this.distY);
		

		// We need to move at least 10 pixels for the scrolling to initiate
		// 如果在很长的时间内只移动了少于 10 像素的距离，那么不会触发惯性滚动
		if ( timestamp - this.endTime > 300 && (absDistX < 10 && absDistY < 10) ) {
			return;
		}
		

		// If you are scrolling in one direction lock the other
		if ( !this.directionLocked && !this.options.freeScroll ) {
			if ( absDistX > absDistY + this.options.directionLockThreshold ) {
				this.directionLocked = 'h';		// lock horizontally
			} else if ( absDistY >= absDistX + this.options.directionLockThreshold ) {
				this.directionLocked = 'v';		// lock vertically
			} else {
				this.directionLocked = 'n';		// no lock
			}
		}

		if ( this.directionLocked == 'h' ) {
			if ( this.options.eventPassthrough == 'vertical' ) {
				e.preventDefault();
			} else if ( this.options.eventPassthrough == 'horizontal' ) {
				this.initiated = false;		// 滑动事件类型设置 false
				return;
			}

			deltaY = 0;
		} else if ( this.directionLocked == 'v' ) {
			if ( this.options.eventPassthrough == 'horizontal' ) {
				e.preventDefault();
			} else if ( this.options.eventPassthrough == 'vertical' ) {
				this.initiated = false;		// 滑动事件类型设置 false
				return;
			}

			deltaX = 0;
		}

		

		deltaX = this.hasHorizontalScroll ? deltaX : 0;
		deltaY = this.hasVerticalScroll ? deltaY : 0;
		
		newX = this.x + deltaX;
		newY = this.y + deltaY;

		// Slow down if outside of the boundaries
		if ( newX > 0 || newX < this.maxScrollX ) {
			newX = this.options.bounce ? this.x + deltaX / 3 : newX > 0 ? 0 : this.maxScrollX;
		}
		if ( newY > 0 || newY < this.maxScrollY ) {
			newY = this.options.bounce ? this.y + deltaY / 3 : newY > 0 ? 0 : this.maxScrollY;
		}

		this.directionX = deltaX > 0 ? -1 : deltaX < 0 ? 1 : 0;
		this.directionY = deltaY > 0 ? -1 : deltaY < 0 ? 1 : 0;

		if ( !this.moved ) {
			this._execEvent('scrollStart');
		}

		this.moved = true;	// 滚动开始

		this._translate(newX, newY);
		


		/*
		 * 300ms 应该是一个阈值，若是人为的滚动一般都会超过 300ms
		 * 所以每次滑动后都会重置当前时间和当前位置
		 */
		if ( timestamp - this.startTime > 300 ) {
			this.startTime = timestamp;
			this.startX = this.x;
			this.startY = this.y;
		}
	},



	_end: function (e) {

		if ( !this.enabled || utils.eventType[e.type] !== this.initiated ) {
			return;
		}

		if ( this.options.preventDefault && !utils.preventDefaultException(e.target, this.options.preventDefaultException) ) {
			e.preventDefault();
		}


		// 移开屏幕的那个触摸点，只会包含在changedTouches列表中
		// 而不会包含在 touches 或 targetTouches 列表中
		var point = e.changedTouches ? e.changedTouches[0] : e,
			momentumX,
			momentumY,
			duration = utils.getTime() - this.startTime,
			newX = Math.round(this.x),
			newY = Math.round(this.y),
			distanceX = Math.abs(newX - this.startX),
			distanceY = Math.abs(newY - this.startY),
			time = 0,
			easing = '';

		this.isInTransition = 0;
		this.initiated = 0;
		this.endTime = utils.getTime();

		// reset if we are outside of the boundaries
		if ( this.resetPosition(this.options.bounceTime) ) {
			return;
		}

		this.scrollTo(newX, newY);	// ensures that the last position is rounded

		// we scrolled less than 10 pixels
		if ( !this.moved && !this.options.role === 'tab') {
			if ( this.options.tap ) {
				utils.tap(e, this.options.tap);
			}

			if ( this.options.click ) {
				utils.click(e);
			}

			this._execEvent('scrollCancel');
			return;
		}


		/*
		 * flick 意为「轻拍，快速拂动」，即短时间内很快地划过，这个时候插件会取消惯性滚动
		 * 如果你注册了这个事件（on('flick',function(){})）那么就会启动它，所以不要注册
		 */
		if ( this._events.flick && duration < 200 && distanceX < 100 && distanceY < 100 ) {
			this._execEvent('flick');
			return;
		}

		// start momentum animation if needed
		// 300ms 内的滑动要启动惯性滚动
		if ( this.options.momentum && duration < 300 ) {
			momentumX = this.hasHorizontalScroll ? utils.momentum(this.x, this.startX, duration, this.maxScrollX, this.options.bounce ? this.wrapperWidth : 0, this.options.deceleration) : { destination: newX, duration: 0 };
			momentumY = this.hasVerticalScroll ? utils.momentum(this.y, this.startY, duration, this.maxScrollY, this.options.bounce ? this.wrapperHeight : 0, this.options.deceleration) : { destination: newY, duration: 0 };
			newX = momentumX.destination;
			newY = momentumY.destination;
			time = Math.max(momentumX.duration, momentumY.duration);
			this.isInTransition = 1;
		}


		if ( newX != this.x || newY != this.y ) {
			// change easing function when scroller goes out of the boundaries
			if ( newX > 0 || newX < this.maxScrollX || newY > 0 || newY < this.maxScrollY ) {
				easing = utils.ease.quadratic;
			}

			this.scrollTo(newX, newY, time, easing);
			return;
		}


		// tab
		// ==========================
		if (this.options.role === 'tab' && event.target.parentNode.className === 'ui-tab-nav') {
			
			utils.removeClass(this.nav.children, 'current');
			utils.addClass(event.target, 'current');

			this.currentPage = event.target.id;
		}


		// slider & tab
		// ==============================
		if (this.options.role === 'slider' || this.options.role === 'tab') {

			if (distanceX < 50) {
				this.scrollTo(-this.itemWidth*this.currentPage, 0, this.options.bounceTime, this.options.bounceEasing);
			}
			else if (distanceX >= 50 && newX-this.startX<0) {
				this.scrollTo(-this.itemWidth*++this.currentPage, 0, this.options.bounceTime, this.options.bounceEasing);
				
				if (this.indicator) {
					utils.removeClass(this.indicator.children, 'current');
					utils.addClass(this.indicator.children[this.currentPage], 'current');	
				}
				else if (this.nav) {
					utils.removeClass(this.nav.children, 'current');
					utils.addClass(this.nav.children[this.currentPage], 'current');		
				}
			}
			else if (distanceX >= 50 && newX-this.startX>=0) {
				this.scrollTo(-this.itemWidth*--this.currentPage, 0, this.options.bounceTime, this.options.bounceEasing);
				
				if (this.indicator) {
					utils.removeClass(this.indicator.children, 'current');
					utils.addClass(this.indicator.children[this.currentPage], 'current');
				}
				else if (this.nav) {
					utils.removeClass(this.nav.children, 'current');
					utils.addClass(this.nav.children[this.currentPage], 'current');	
				}
			}

			this._execEvent('slideEnd');
		}


		this._execEvent('scrollEnd');
	},




	/*
	 * 窗体大小改变时的布局重新计算
	 */
	_resize: function () {
		var that = this;

		clearTimeout(this.resizeTimeout);

		this.resizeTimeout = setTimeout(function () {
			that.refresh();
		}, this.options.resizePolling);
	},




	/*
	 * 动画结束后
	 */
	_transitionEnd: function (e) {
		if ( e.target != this.scroller || !this.isInTransition ) {
			return;
		}

		this._transitionTime();
		if ( !this.resetPosition(this.options.bounceTime) ) {
			this.isInTransition = false;
			this._execEvent('scrollEnd');
		}
	},



	/* 
	 * 把所有事件绑定给去掉 
	 */
	destroy: function () {
		this._initEvents(true);		// 去除事件绑定
		this._execEvent('destroy');
	},

	

	/*
	 * 归位：超出边界后回到原来的位置
	 */ 
	resetPosition: function (time) {
		var x = this.x,
			y = this.y;

		time = time || 0;

		if ( !this.hasHorizontalScroll || this.x > 0 ) {
			x = 0;
		} else if ( this.x < this.maxScrollX ) {
			x = this.maxScrollX;
		}

		if ( !this.hasVerticalScroll || this.y > 0 ) {
			y = 0;
		} else if ( this.y < this.maxScrollY ) {
			y = this.maxScrollY;
		}

		if ( x == this.x && y == this.y ) {
			return false;
		}
		this.scrollTo(x, y, time, this.options.bounceEasing);

		return true;
	},





	disable: function () {
		this.enabled = false;
	},

	enable: function () {
		this.enabled = true;
	},




	/* 
	 * 自定义事件监听方法，支持监听多个同类型的事件
	 * 如：myScroll.on('scrollEnd', function(){ console.log('1') })
	 *    myScroll.on('scrollEnd', function(){ console.log('2') })
	 */
	on: function (type, fn) {
		if ( !this._events[type] ) {
			this._events[type] = [];
		}

		this._events[type].push(fn);
	},

	off: function (type, fn) {
		if ( !this._events[type] ) {
			return;
		}

		var index = this._events[type].indexOf(fn);

		if ( index > -1 ) {
			this._events[type].splice(index, 1);
		}
	},



	/*
	 * 执行事件
	 * 这个事件的牛逼指出在于，如果你没有设置 on 的话，那么事件是不会执行的。
	 * 就是说 var myScroll = new Scroll(..); myScroll.on('xxx', functino(){}) 注册后才会有这个xxx事件
	 */
	_execEvent: function (type) {

		// 若没有事先 on(type)，则跳出（不执行事件）
		if ( !this._events[type] ) {
			return;
		}

		var i = 0,
			l = this._events[type].length;

		if ( !l ) {
			return;
		}

		// 循环回调绑定的函数
		for ( ; i < l; i++ ) {
			// [].slice.call(arguments) 能将具有 length 属性的对象转成数组
			// 等价于 Array.prototype.slice.call(argument)
			// 但是这里的 [].slice.call(arguments, 1) 没有意义，因为 argument 只有一个参数
			// [].slice.call(arguments, 1) 永远得到的是一个空数组 []
			// 这里这么写暂时不知道为什么，也许是为了兼容
			this._events[type][i].apply(this, [].slice.call(arguments, 1));
		}
	},




	/*
	 * 从当前位置开始移动，允许设置偏移量
	 * 而 scrollTo 方法需要明确的位置 x、y
	 */
	scrollBy: function (x, y, time, easing) {
		x = this.x + x;
		y = this.y + y;
		time = time || 0;

		this.scrollTo(x, y, time, easing);
	},





	scrollTo: function (x, y, time, easing) {
		easing = easing || utils.ease.circular;

		this.isInTransition = this.options.useTransition && time > 0;

		if ( !time || (this.options.useTransition && easing.style) ) {
			this._transitionTimingFunction(easing.style);
			this._transitionTime(time);
			this._translate(x, y);
		} else {
			this._animate(x, y, time, easing.fn);
		}
	},





	scrollToElement: function (el, time, offsetX, offsetY, easing) {
		el = el.nodeType ? el : this.scroller.querySelector(el);

		if ( !el ) {
			return;
		}

		var pos = utils.offset(el);

		pos.left -= this.wrapperOffset.left;
		pos.top  -= this.wrapperOffset.top;

		// if offsetX/Y are true we center the element to the screen
		// 若 offsetX/Y 都是 true，则会滚动到元素在屏幕中间的位置
		if ( offsetX === true ) {
			offsetX = Math.round(el.offsetWidth / 2 - this.wrapper.offsetWidth / 2);
		}
		if ( offsetY === true ) {
			offsetY = Math.round(el.offsetHeight / 2 - this.wrapper.offsetHeight / 2);
		}

		pos.left -= offsetX || 0;
		pos.top  -= offsetY || 0;

		pos.left = pos.left > 0 ? 0 : pos.left < this.maxScrollX ? this.maxScrollX : pos.left;
		pos.top  = pos.top  > 0 ? 0 : pos.top  < this.maxScrollY ? this.maxScrollY : pos.top;

		time = time === undefined || time === null || time === 'auto' ? Math.max(Math.abs(this.x-pos.left), Math.abs(this.y-pos.top)) : time;

		this.scrollTo(pos.left, pos.top, time, easing);
	},





	/* 
	 * 缓动时间
	 */
	_transitionTime: function (time) {
		time = time || 0;

		// 之前缓存的 scroller 的样式
		this.scrollerStyle[utils.style.transitionDuration] = time + 'ms';

		if ( !time && utils.isBadAndroid ) {
			this.scrollerStyle[utils.style.transitionDuration] = '0.001s';
		}
	},




	_transitionTimingFunction: function (easing) {
		this.scrollerStyle[utils.style.transitionTimingFunction] = easing;
	},




	_translate: function (x, y) {
		if ( this.options.useTransform ) {

			this.scrollerStyle[utils.style.transform] = 'translate(' + x + 'px,' + y + 'px)' + this.translateZ;

		} else {
			x = Math.round(x);
			y = Math.round(y);
			this.scrollerStyle.left = x + 'px';
			this.scrollerStyle.top = y + 'px';
		}

		this.x = x;
		this.y = y;
	},



	/* 
	 * 计算当前位置
	 */
	getComputedPosition: function () {

		// getComputedStyle 是一个可以获取当前元素所有最终使用的 CSS 属性值。
		// 返回的是一个 CSS 样式声明对象 ([object CSSStyleDeclaration])，只读。
		var matrix = window.getComputedStyle(this.scroller, null),
			x, y;

		if ( this.options.useTransform ) {
			matrix = matrix[utils.style.transform].split(')')[0].split(', ');
			x = +(matrix[12] || matrix[4]);
			y = +(matrix[13] || matrix[5]);
		} else {
			x = +matrix.left.replace(/[^-\d.]/g, '');
			y = +matrix.top.replace(/[^-\d.]/g, '');
		}

		return { x: x, y: y };
	},

	


	_animate: function (destX, destY, duration, easingFn) {
		var that = this,
			startX = this.x,
			startY = this.y,
			startTime = utils.getTime(),
			destTime = startTime + duration;

		function step () {
			var now = utils.getTime(),
				newX, newY,
				easing;

			if ( now >= destTime ) {
				that.isAnimating = false;
				that._translate(destX, destY);

				if ( !that.resetPosition(that.options.bounceTime) ) {
					that._execEvent('scrollEnd');
				}

				return;
			}

			now = ( now - startTime ) / duration;
			easing = easingFn(now);
			newX = ( destX - startX ) * easing + startX;
			newY = ( destY - startY ) * easing + startY;
			that._translate(newX, newY);

			if ( that.isAnimating ) {
				rAF(step);
			}
		}

		this.isAnimating = true;
		step();
	},


	_autoplay: function() {
		var self = this;

		self.currentPage = self.currentPage >= self.count-1 ? 0 : ++self.currentPage;

		self.scrollTo(-self.itemWidth*self.currentPage, 0, self.options.bounceTime, self.options.bounceEasing);

		if (self.indicator) {
			utils.removeClass(self.indicator.children, 'current');
			utils.addClass(self.indicator.children[self.currentPage], 'current');	
		}
		else if (self.nav) {
			utils.removeClass(self.nav.children, 'current');
			utils.addClass(self.nav.children[self.currentPage], 'current');		
		}

		self.options.flag = setTimeout(function() {
								self._autoplay.apply(self);
							}, self.options.interval);

	}

};




Scroll.utils = utils;
window.Scroll = Scroll;


/*
 * 兼容 RequireJS 和 Sea.js
 */
if (typeof define === "function") {
	define(function(require, exports, module) {
		module.exports = Scroll;
	})
}


})(window, document, Math);