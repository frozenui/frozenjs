/**
 * User: jeakeyliang
 * Date: 14-08-22
 * Time: 下午9:20
 */


;(function($){
  var data = {}, dataAttr = $.fn.data, camelize = $.camelCase,
    exp = $.expando = 'Zepto' + (+new Date()), emptyArray = []

  // Get value from node:
  // 1. first try key as given,
  // 2. then try camelized key,
  // 3. fall back to reading "data-*" attribute.
  function getData(node, name) {
    var id = node[exp], store = id && data[id]
    if (name === undefined) return store || setData(node)
    else {
      if (store) {
        if (name in store) return store[name]
        var camelName = camelize(name)
        if (camelName in store) return store[camelName]
      }
      return dataAttr.call($(node), name)
    }
  }

  // Store value under camelized key on node
  function setData(node, name, value) {
    var id = node[exp] || (node[exp] = ++$.uuid),
      store = data[id] || (data[id] = attributeData(node))
    if (name !== undefined) store[camelize(name)] = value
    return store
  }

  // Read all "data-*" attributes from a node
  function attributeData(node) {
    var store = {}
    $.each(node.attributes || emptyArray, function(i, attr){
      if (attr.name.indexOf('data-') == 0)
        store[camelize(attr.name.replace('data-', ''))] =
          $.zepto.deserializeValue(attr.value)
    })
    return store
  }

  $.fn.data = function(name, value) {
    return value === undefined ?
      // set multiple values via object
      $.isPlainObject(name) ?
        this.each(function(i, node){
          $.each(name, function(key, value){ setData(node, key, value) })
        }) :
        // get value from first element
        (0 in this ? getData(this[0], name) : undefined) :
      // set value on all elements
      this.each(function(){ setData(this, name, value) })
  }

  $.fn.removeData = function(names) {
    if (typeof names == 'string') names = names.split(/\s+/)
    return this.each(function(){
      var id = this[exp], store = id && data[id]
      if (store) $.each(names || store, function(key){
        delete store[names ? camelize(this) : key]
      })
    })
  }

  // Generate extended `remove` and `empty` functions
  ;['remove', 'empty'].forEach(function(methodName){
    var origFn = $.fn[methodName]
    $.fn[methodName] = function() {
      var elements = this.find('*')
      if (methodName === 'remove') elements = elements.add(this)
      elements.removeData()
      return origFn.call(this)
    }
  })
})(window.Zepto);

!function ($) {
	var _private = {};
	_private.cache = {};
	$.tpl = function (str, data, env) {
		// 判断str参数，如str为script标签的id，则取该标签的innerHTML，再递归调用自身
		// 如str为HTML文本，则分析文本并构造渲染函数
		var fn = !/[^\w\-\.:]/.test(str)
			? _private.cache[str] = _private.cache[str] || this.get(document.getElementById(str).innerHTML)
			: function (data, env) {
			var i, variable = [], value = []; // variable数组存放变量名，对应data结构的成员变量；value数组存放各变量的值
			for (i in data) {
				variable.push(i);
				value.push(data[i]);
			}
			return (new Function(variable, fn.code))
				.apply(env || data, value); // 此处的new Function是由下面fn.code产生的渲染函数；执行后即返回渲染结果HTML
		};

		fn.code = fn.code || "var $parts=[]; $parts.push('"
			+ str
			.replace(/\\/g, '\\\\') // 处理模板中的\转义
			.replace(/[\r\t\n]/g, " ") // 去掉换行符和tab符，将模板合并为一行
			.split("<%").join("\t") // 将模板左标签<%替换为tab，起到分割作用
			.replace(/(^|%>)[^\t]*/g, function(str) { return str.replace(/'/g, "\\'"); }) // 将模板中文本部分的单引号替换为\'
			.replace(/\t=(.*?)%>/g, "',$1,'") // 将模板中<%= %>的直接数据引用（无逻辑代码）与两侧的文本用'和,隔开，同时去掉了左标签产生的tab符
			.split("\t").join("');") // 将tab符（上面替换左标签产生）替换为'); 由于上一步已经把<%=产生的tab符去掉，因此这里实际替换的只有逻辑代码的左标签
			.split("%>").join("$parts.push('") // 把剩下的右标签%>（逻辑代码的）替换为"$parts.push('"
			+ "'); return $parts.join('');"; // 最后得到的就是一段JS代码，保留模板中的逻辑，并依次把模板中的常量和变量压入$parts数组

		return data ? fn(data, env) : fn; // 如果传入了数据，则直接返回渲染结果HTML文本，否则返回一个渲染函数
	};
	$.adaptObject =  function (element, defaults, option,template,plugin,pluginName) {
    var $this= element;

    if (typeof option != 'string'){
    
    // 获得配置信息
    var context=$.extend({}, defaults,  typeof option == 'object' && option);

    var isFromTpl=false;
    // 如果传入script标签的选择器
    if($.isArray($this) && $this.length && $($this)[0].nodeName.toLowerCase()=="script"){
      // 根据模板获得对象并插入到body中
      $this=$($.tpl($this[0].innerHTML,context)).appendTo("body");
      isFromTpl=true;
    }
    // 如果传入模板字符串
    else if($.isArray($this) && $this.length && $this.selector== ""){
      // 根据模板获得对象并插入到body中
      $this=$($.tpl($this[0].outerHTML,context)).appendTo("body");
      isFromTpl=true;
    }
    // 如果通过$.dialog()的方式调用
    else if(!$.isArray($this)){
      // 根据模板获得对象并插入到body中
      $this=$($.tpl(template,context)).appendTo("body");
      isFromTpl=true;
    }

    }

    return $this.each(function () {

      var el = $(this);
      // 读取对象缓存
  
      var data  = el.data('fz.'+pluginName);
      


      if (!data) el.data('fz.'+pluginName, 
        (data = new plugin(this,$.extend({}, defaults,  typeof option == 'object' && option),isFromTpl)

      ));

      if (typeof option == 'string') data[option]();
    })
  }
}(window.Zepto);



/*! Tappy! - a lightweight normalized tap event. Copyright 2013 @scottjehl, Filament Group, Inc. Licensed MIT */
(function( w, $, undefined ){

  // handling flag is true when an event sequence is in progress (thx androood)
  w.tapHandling = false;
  var untap = function( $els ){
    return $els.off( ".fz.tap" );
  };
  var tap = function( $els ){
    return $els.each(function(){

      var $el = $( this ),
        resetTimer,
        startY,
        startX,
        cancel,
        scrollTolerance = 10;

      function trigger( e ){
        $( e.target ).trigger( "tap", [ e, $( e.target ).attr( "href" ) ] );
        e.stopPropagation();
      }

      function getCoords( e ){
        var ev = e.originalEvent || e,
          touches = ev.touches || ev.targetTouches;

        if( touches ){
          return [ touches[ 0 ].pageX, touches[ 0 ].pageY ];
        }
        else {
          return null;
        }
      }

      function start( e ){
        if( e.touches && e.touches.length > 1 || e.targetTouches && e.targetTouches.length > 1 ){
          return false;
        }

        var coords = getCoords( e );
        startX = coords[ 0 ];
        startY = coords[ 1 ];
      }

      // any touchscroll that results in > tolerance should cancel the tap
      function move( e ){
        if( !cancel ){
          var coords = getCoords( e );
          if( coords && ( Math.abs( startY - coords[ 1 ] ) > scrollTolerance || Math.abs( startX - coords[ 0 ] ) > scrollTolerance ) ){
            cancel = true;
          }
        }
      }

      function end( e ){
        clearTimeout( resetTimer );
        resetTimer = setTimeout( function(){
          w.tapHandling = false;
          cancel = false;
        }, 1000 );

        // make sure no modifiers are present. thx http://www.jacklmoore.com/notes/click-events/
        if( ( e.which && e.which > 1 ) || e.shiftKey || e.altKey || e.metaKey || e.ctrlKey ){
          return;
        }

        e.preventDefault();

        // this part prevents a double callback from touch and mouse on the same tap

        // if a scroll happened between touchstart and touchend
        if( cancel || w.tapHandling && w.tapHandling !== e.type ){
          cancel = false;
          return;
        }

        w.tapHandling = e.type;
        trigger( e );
      }

      $el
        .bind( "touchstart.fz.tap MSPointerDown.fz.tap", start )
        .bind( "touchmove.fz.tap MSPointerMove.fz.tap", move )
        .bind( "touchend.fz.tap MSPointerUp.fz.tap", end )
        .bind( "click.fz.tap", end );
    });
  };

  

  // use special events api
  if( $.event && $.event.special ){
    $.event.special.tap = {
      add: function( handleObj ) {
        tap( $( this ) );
      },
      remove: function( handleObj ) {
        untap( $( this ) );
      }
    };
  }
  else{
    // monkeybind
    var oldOn = $.fn.on,
      oldOff = $.fn.off;
    $.fn.on = function( evt ){
      if( /(^| )tap( |$)/.test( evt ) ){
        untap(this);
        tap( this );
      }
      return oldOn.apply( this, arguments );
    };
    $.fn.off = function( evt ){
      if( /(^| )tap( |$)/.test( evt ) ){
        untap( this );
      }
      return oldOff.apply( this, arguments );
    };
    
  }
  $.fn.tap=function(callback){
    this.on("tap",callback);
  }

}( this, Zepto ));
/**
 * User: jeakeyliang
 * Date: 14-08-22
 * Time: 下午9:20
 */

!function($){

	// 默认模板
	var _dialogTpl='<div class="ui-dialog">'+
        '<div class="ui-dialog-cnt">'+
            '<div class="ui-dialog-bd">'+
                '<div>'+
                '<h4><%=title%></h4>'+
                '<div><%=content%></div></div>'+
            '</div>'+
            '<div class="ui-dialog-ft ui-btn-group">'+
            	'<% for (var i = 0; i < button.length; i++) { %>' +
				'<% if (i == select) { %>' +
				'<button type="button" data-role="button"  class="select" id="dialogButton<%=i%>"><%=button[i]%></button>' +
				'<% } else { %>' +
				'<button type="button" data-role="button" id="dialogButton<%=i%>"><%=button[i]%></div>' +
				'<% } %>' +
				'<% } %>' +
            '</div>'+
        '</div>'+        
    '</div>';
	// 默认参数
	var defaults={
		title:'',
		content:'',
		button:['确认'],
		select:0,
		allowScroll:false,
		callback:function(){}
	}
	// 构造函数
	var Dialog   = function (el,option,isFromTpl) {

		this.option=$.extend(defaults,option);
		this.element=$(el);
		this._isFromTpl=isFromTpl;
		this.button=$(el).find('[data-role="button"]');
		this._bindEvent();
		this.toggle();
	}
	Dialog.prototype={
		_bindEvent:function(){
			var self=this;
			self.button.on("tap",function(){
				var index=$(self.button).index($(this));
				self.option.callback("button",index);
				self.hide.apply(self);
			});
		},
		toggle:function(){
			if(this.element.hasClass("show")){
				this.hide();
			}else{
				this.show();
			}
		},
		show:function(){
			var self=this;
			self.option.callback("show");
			self.element.addClass("show");
			this.option.allowScroll && self.element.on("touchmove" , _stopScroll);

		},
		hide :function () {
			var self=this;
			self.option.callback("hide");
			self.element.off("touchmove" , _stopScroll);
			self.element.removeClass("show");
			
			self._isFromTpl&&self.element.remove();
		}
	}
	// 禁止冒泡
	function _stopScroll(){
		return false;
	}
	function Plugin(option) {

		return $.adaptObject(this, defaults, option,_dialogTpl,Dialog,"dialog");
	}
	$.fn.dialog=$.dialog= Plugin;
}(window.Zepto)
	


/**
 * User: jeakeyliang
 * Date: 14-11-07
 * Time: 下午9:20
 */

!function($){

	// 默认模板
	var _loadingTpl='<div class="ui-dialog ui-dialog-notice show">'+
		    '<div class="ui-dialog-cnt">'+
		      '<i class="ui-loading-bright"></i>'+
		      '<p><%=content%></p>'+
		   '</div>'+
		 '</div>';
	
	// 默认参数
	var defaults={
		content:'加载中...'
	}
	// 构造函数
	var Loading   = function (el,option,isFromTpl) {
		var self=this;
		this.element=$(el);
		this._isFromTpl=isFromTpl;
		this.option=$.extend(defaults,option);
		this.show();
	}
	Loading.prototype={
		show:function(){
			this.element.show();
		},
		hide :function () {
			this.element.hide();
		}
	}
	function Plugin(option) {

		return $.adaptObject(this, defaults, option,_loadingTpl,Loading,"loading");
	}
	$.fn.loading=$.loading= Plugin;
}(window.Zepto)
	


!function(t,i,s){function e(t,s){this.wrapper="string"==typeof t?i.querySelector(t):t,this.options={startX:0,startY:0,scrollY:!0,directionLockThreshold:5,momentum:!0,bounce:!0,bounceTime:600,bounceEasing:"",preventDefault:!0,eventPassthrough:"",freeScroll:!1,preventDefaultException:{tagName:/^(INPUT|TEXTAREA|BUTTON|SELECT)$/},HWCompositing:!0,useTransition:!0,useTransform:!0};for(var e in s)this.options[e]=s[e];if("slider"===this.options.role)this.options.scrollX=!0,this.options.scrollY=!1,this.options.momentum=!1,this.scroller=i.querySelector(".ui-slider-content"),this.indicator=this.options.indicator?i.querySelector(".ui-slider-indicators"):null,this.currentPage=0,this.count=this.scroller.children.length,this.itemWidth=this.scroller.children[0].clientWidth,this.scrollWidth=this.itemWidth*this.count,this.indicator&&o.addClass(this.indicator.children[0],"current");else if("tab"===this.options.role){this.options.scrollX=!0,this.options.scrollY=!1,this.options.momentum=!1,this.scroller=i.querySelector(".ui-tab-content"),this.nav=i.querySelector(".ui-tab-nav"),this.currentPage=0,this.count=this.scroller.children.length,this.itemWidth=this.scroller.children[0].clientWidth,this.scrollWidth=this.itemWidth*this.count;for(var e=0;e<this.count;e++)this.nav.children[e].id=e;o.addClass(this.nav.children[0],"current")}else this.scroller=this.wrapper.children[0];if(this.scrollerStyle=this.scroller.style,this.translateZ=o.hasPerspective&&this.options.HWCompositing?" translateZ(0)":"",this.options.useTransition=o.hasTransition&&this.options.useTransition,this.options.useTransform=o.hasTransform&&this.options.useTransform,this.options.eventPassthrough=this.options.eventPassthrough===!0?"vertical":this.options.eventPassthrough,this.options.preventDefault=!this.options.eventPassthrough&&this.options.preventDefault,this.options.scrollX="horizontal"==this.options.eventPassthrough?!1:this.options.scrollX,this.options.scrollY="vertical"==this.options.eventPassthrough?!1:this.options.scrollY,this.options.freeScroll=this.options.freeScroll&&!this.options.eventPassthrough,this.options.directionLockThreshold=this.options.eventPassthrough?0:this.options.directionLockThreshold,this.options.bounceEasing="string"==typeof this.options.bounceEasing?o.ease[this.options.bounceEasing]||o.ease.circular:this.options.bounceEasing,this.options.resizePolling=void 0===this.options.resizePolling?60:this.options.resizePolling,this.options.tap===!0&&(this.options.tap="tap"),this.x=0,this.y=0,this.directionX=0,this.directionY=0,this._events={},this._init(),this.refresh(),this.scrollTo(this.options.startX,this.options.startY),this.enable(),this.options.autoplay){var n=this;this.options.interval=this.options.interval||2e3,this.options.flag=setTimeout(function(){n._autoplay.apply(n)},n.options.interval)}}var n=t.requestAnimationFrame||t.webkitRequestAnimationFrame||t.mozRequestAnimationFrame||t.oRequestAnimationFrame||t.msRequestAnimationFrame||function(i){t.setTimeout(i,1e3/60)},o=function(){function e(t){return r===!1?!1:""===r?t:r+t.charAt(0).toUpperCase()+t.substr(1)}var n={},o=i.createElement("div").style,r=function(){for(var t,i=["t","webkitT","MozT","msT","OT"],s=0,e=i.length;e>s;s++)if(t=i[s]+"ransform",t in o)return i[s].substr(0,i[s].length-1);return!1}();n.getTime=Date.now||function(){return(new Date).getTime()},n.extend=function(t,i){for(var s in i)t[s]=i[s]},n.addEvent=function(t,i,s,e){t.addEventListener(i,s,!!e)},n.removeEvent=function(t,i,s,e){t.removeEventListener(i,s,!!e)},n.prefixPointerEvent=function(i){return t.MSPointerEvent?"MSPointer"+i.charAt(9).toUpperCase()+i.substr(10):i},n.momentum=function(t,i,e,n,o,r){var h,a,l=t-i,c=s.abs(l)/e;return r=void 0===r?6e-4:r,h=t+c*c/(2*r)*(0>l?-1:1),a=c/r,n>h?(h=o?n-o/2.5*(c/8):n,l=s.abs(h-t),a=l/c):h>0&&(h=o?o/2.5*(c/8):0,l=s.abs(t)+h,a=l/c),{destination:s.round(h),duration:a}};var h=e("transform");return n.extend(n,{hasTransform:h!==!1,hasPerspective:e("perspective")in o,hasTouch:"ontouchstart"in t,hasPointer:t.PointerEvent||t.MSPointerEvent,hasTransition:e("transition")in o}),n.isBadAndroid=/Android /.test(t.navigator.appVersion)&&!/Chrome\/\d/.test(t.navigator.appVersion),n.extend(n.style={},{transform:h,transitionTimingFunction:e("transitionTimingFunction"),transitionDuration:e("transitionDuration"),transitionDelay:e("transitionDelay"),transformOrigin:e("transformOrigin")}),n.hasClass=function(t,i){var s=new RegExp("(^|\\s)"+i+"(\\s|$)");return s.test(t.className)},n.addClass=function(t,i){if(!n.hasClass(t,i)){var s=t.className.split(" ");s.push(i),t.className=s.join(" ")}},n.removeClass=function(t,i){var s,e=t.length;for(s=0;e>s;s++)if(n.hasClass(t[s],i)){var o=new RegExp("(^|\\s)"+i+"(\\s|$)","g");t[s].className=t[s].className.replace(o," ")}},n.offset=function(t){for(var i=-t.offsetLeft,s=-t.offsetTop;t=t.offsetParent;)i-=t.offsetLeft,s-=t.offsetTop;return{left:i,top:s}},n.preventDefaultException=function(t,i){for(var s in i)if(i[s].test(t[s]))return!0;return!1},n.extend(n.eventType={},{touchstart:1,touchmove:1,touchend:1,mousedown:2,mousemove:2,mouseup:2,pointerdown:3,pointermove:3,pointerup:3,MSPointerDown:3,MSPointerMove:3,MSPointerUp:3}),n.extend(n.ease={},{quadratic:{style:"cubic-bezier(0.25, 0.46, 0.45, 0.94)",fn:function(t){return t*(2-t)}},circular:{style:"cubic-bezier(0.1, 0.57, 0.1, 1)",fn:function(t){return s.sqrt(1- --t*t)}},back:{style:"cubic-bezier(0.175, 0.885, 0.32, 1.275)",fn:function(t){var i=4;return(t-=1)*t*((i+1)*t+i)+1}},bounce:{style:"",fn:function(t){return(t/=1)<1/2.75?7.5625*t*t:2/2.75>t?7.5625*(t-=1.5/2.75)*t+.75:2.5/2.75>t?7.5625*(t-=2.25/2.75)*t+.9375:7.5625*(t-=2.625/2.75)*t+.984375}},elastic:{style:"",fn:function(t){var i=.22,e=.4;return 0===t?0:1==t?1:e*s.pow(2,-10*t)*s.sin((t-i/4)*2*s.PI/i)+1}}}),n.tap=function(t,s){var e=i.createEvent("Event");e.initEvent(s,!0,!0),e.pageX=t.pageX,e.pageY=t.pageY,t.target.dispatchEvent(e)},n.click=function(t){var s,e=t.target;/(SELECT|INPUT|TEXTAREA)/i.test(e.tagName)||(s=i.createEvent("MouseEvents"),s.initMouseEvent("click",!0,!0,t.view,1,e.screenX,e.screenY,e.clientX,e.clientY,t.ctrlKey,t.altKey,t.shiftKey,t.metaKey,0,null),s._constructed=!0,e.dispatchEvent(s))},n}();e.prototype={_init:function(){this._initEvents()},_initEvents:function(i){var s=i?o.removeEvent:o.addEvent,e=this.options.bindToWrapper?this.wrapper:t;s(t,"orientationchange",this),s(t,"resize",this),this.options.click&&s(this.wrapper,"click",this,!0),this.options.disableMouse||(s(this.wrapper,"mousedown",this),s(e,"mousemove",this),s(e,"mousecancel",this),s(e,"mouseup",this)),o.hasPointer&&!this.options.disablePointer&&(s(this.wrapper,o.prefixPointerEvent("pointerdown"),this),s(e,o.prefixPointerEvent("pointermove"),this),s(e,o.prefixPointerEvent("pointercancel"),this),s(e,o.prefixPointerEvent("pointerup"),this)),o.hasTouch&&!this.options.disableTouch&&(s(this.wrapper,"touchstart",this),s(e,"touchmove",this),s(e,"touchcancel",this),s(e,"touchend",this)),s(this.scroller,"transitionend",this),s(this.scroller,"webkitTransitionEnd",this),s(this.scroller,"oTransitionEnd",this),s(this.scroller,"MSTransitionEnd",this),"tab"===this.options.role&&(s(this.nav,"touchend",this),s(this.nav,"mouseup",this),s(this.nav,"pointerup",this))},refresh:function(){this.wrapper.offsetHeight,this.wrapperWidth=this.wrapper.clientWidth,this.wrapperHeight=this.wrapper.clientHeight,this.scrollerWidth=this.scroller.offsetWidth,this.scrollerHeight=this.scroller.offsetHeight,("slider"===this.options.role||"tab"===this.options.role)&&(this.scrollerWidth=this.scrollWidth),this.maxScrollX=this.wrapperWidth-this.scrollerWidth,this.maxScrollY=this.wrapperHeight-this.scrollerHeight,this.hasHorizontalScroll=this.options.scrollX&&this.maxScrollX<0,this.hasVerticalScroll=this.options.scrollY&&this.maxScrollY<0,this.hasHorizontalScroll||(this.maxScrollX=0,this.scrollerWidth=this.wrapperWidth),this.hasVerticalScroll||(this.maxScrollY=0,this.scrollerHeight=this.wrapperHeight),this.endTime=0,this.directionX=0,this.directionY=0,this.wrapperOffset=o.offset(this.wrapper),this._execEvent("refresh"),this.resetPosition()},handleEvent:function(t){switch(t.type){case"touchstart":case"pointerdown":case"MSPointerDown":case"mousedown":this._start(t);break;case"touchmove":case"pointermove":case"MSPointerMove":case"mousemove":this._move(t);break;case"touchend":case"pointerup":case"MSPointerUp":case"mouseup":case"touchcancel":case"pointercancel":case"MSPointerCancel":case"mousecancel":this._end(t);break;case"orientationchange":case"resize":this._resize();break;case"transitionend":case"webkitTransitionEnd":case"oTransitionEnd":case"MSTransitionEnd":this._transitionEnd(t);break;case"wheel":case"DOMMouseScroll":case"mousewheel":this._wheel(t);break;case"keydown":this._key(t);break;case"click":t._constructed||(t.preventDefault(),t.stopPropagation())}},_start:function(t){if(!(1!=o.eventType[t.type]&&0!==t.button||!this.enabled||this.initiated&&o.eventType[t.type]!==this.initiated)){!this.options.preventDefault||o.isBadAndroid||o.preventDefaultException(t.target,this.options.preventDefaultException)||t.preventDefault();var i,e=t.touches?t.touches[0]:t;if(this.initiated=o.eventType[t.type],this.moved=!1,this.distX=0,this.distY=0,this.directionX=0,this.directionY=0,this.directionLocked=0,this._transitionTime(),this.startTime=o.getTime(),this.options.useTransition&&this.isInTransition?(this.isInTransition=!1,i=this.getComputedPosition(),this._translate(s.round(i.x),s.round(i.y)),this._execEvent("scrollEnd")):!this.options.useTransition&&this.isAnimating&&(this.isAnimating=!1,this._execEvent("scrollEnd")),this.startX=this.x,this.startY=this.y,this.absStartX=this.x,this.absStartY=this.y,this.pointX=e.pageX,this.pointY=e.pageY,this._execEvent("beforeScrollStart"),("slider"===this.options.role||"tab"===this.options.role)&&this._execEvent("slideStart"),this.options.autoplay){var n=this;clearTimeout(this.options.flag),this.options.flag=setTimeout(function(){n._autoplay.apply(n)},n.options.interval)}}},_move:function(t){if(this.enabled&&o.eventType[t.type]===this.initiated){this.options.preventDefault&&t.preventDefault();var i,e,n,r,h=t.touches?t.touches[0]:t,a=h.pageX-this.pointX,l=h.pageY-this.pointY,c=o.getTime();if(this.pointX=h.pageX,this.pointY=h.pageY,this.distX+=a,this.distY+=l,n=s.abs(this.distX),r=s.abs(this.distY),!(c-this.endTime>300&&10>n&&10>r)){if(this.directionLocked||this.options.freeScroll||(this.directionLocked=n>r+this.options.directionLockThreshold?"h":r>=n+this.options.directionLockThreshold?"v":"n"),"h"==this.directionLocked){if("vertical"==this.options.eventPassthrough)t.preventDefault();else if("horizontal"==this.options.eventPassthrough)return this.initiated=!1,void 0;l=0}else if("v"==this.directionLocked){if("horizontal"==this.options.eventPassthrough)t.preventDefault();else if("vertical"==this.options.eventPassthrough)return this.initiated=!1,void 0;a=0}a=this.hasHorizontalScroll?a:0,l=this.hasVerticalScroll?l:0,i=this.x+a,e=this.y+l,(i>0||i<this.maxScrollX)&&(i=this.options.bounce?this.x+a/3:i>0?0:this.maxScrollX),(e>0||e<this.maxScrollY)&&(e=this.options.bounce?this.y+l/3:e>0?0:this.maxScrollY),this.directionX=a>0?-1:0>a?1:0,this.directionY=l>0?-1:0>l?1:0,this.moved||this._execEvent("scrollStart"),this.moved=!0,this._translate(i,e),c-this.startTime>300&&(this.startTime=c,this.startX=this.x,this.startY=this.y)}}},_end:function(t){if(this.enabled&&o.eventType[t.type]===this.initiated){this.options.preventDefault&&!o.preventDefaultException(t.target,this.options.preventDefaultException)&&t.preventDefault();var i,e,n=(t.changedTouches?t.changedTouches[0]:t,o.getTime()-this.startTime),r=s.round(this.x),h=s.round(this.y),a=s.abs(r-this.startX),l=s.abs(h-this.startY),c=0,p="";if(this.isInTransition=0,this.initiated=0,this.endTime=o.getTime(),!this.resetPosition(this.options.bounceTime)){if(this.scrollTo(r,h),!this.moved&&"tab"===!this.options.role)return this.options.tap&&o.tap(t,this.options.tap),this.options.click&&o.click(t),this._execEvent("scrollCancel"),void 0;if(this._events.flick&&200>n&&100>a&&100>l)return this._execEvent("flick"),void 0;if(this.options.momentum&&300>n&&(i=this.hasHorizontalScroll?o.momentum(this.x,this.startX,n,this.maxScrollX,this.options.bounce?this.wrapperWidth:0,this.options.deceleration):{destination:r,duration:0},e=this.hasVerticalScroll?o.momentum(this.y,this.startY,n,this.maxScrollY,this.options.bounce?this.wrapperHeight:0,this.options.deceleration):{destination:h,duration:0},r=i.destination,h=e.destination,c=s.max(i.duration,e.duration),this.isInTransition=1),r!=this.x||h!=this.y)return(r>0||r<this.maxScrollX||h>0||h<this.maxScrollY)&&(p=o.ease.quadratic),this.scrollTo(r,h,c,p),void 0;"tab"===this.options.role&&"ui-tab-nav"===event.target.parentNode.className&&(o.removeClass(this.nav.children,"current"),o.addClass(event.target,"current"),this.currentPage=event.target.id),("slider"===this.options.role||"tab"===this.options.role)&&(50>a?this.scrollTo(-this.itemWidth*this.currentPage,0,this.options.bounceTime,this.options.bounceEasing):a>=50&&r-this.startX<0?(this.scrollTo(-this.itemWidth*++this.currentPage,0,this.options.bounceTime,this.options.bounceEasing),this.indicator?(o.removeClass(this.indicator.children,"current"),o.addClass(this.indicator.children[this.currentPage],"current")):this.nav&&(o.removeClass(this.nav.children,"current"),o.addClass(this.nav.children[this.currentPage],"current"))):a>=50&&r-this.startX>=0&&(this.scrollTo(-this.itemWidth*--this.currentPage,0,this.options.bounceTime,this.options.bounceEasing),this.indicator?(o.removeClass(this.indicator.children,"current"),o.addClass(this.indicator.children[this.currentPage],"current")):this.nav&&(o.removeClass(this.nav.children,"current"),o.addClass(this.nav.children[this.currentPage],"current"))),this._execEvent("slideEnd")),this._execEvent("scrollEnd")}}},_resize:function(){var t=this;clearTimeout(this.resizeTimeout),this.resizeTimeout=setTimeout(function(){t.refresh()},this.options.resizePolling)},_transitionEnd:function(t){t.target==this.scroller&&this.isInTransition&&(this._transitionTime(),this.resetPosition(this.options.bounceTime)||(this.isInTransition=!1,this._execEvent("scrollEnd")))},destroy:function(){this._initEvents(!0),this._execEvent("destroy")},resetPosition:function(t){var i=this.x,s=this.y;return t=t||0,!this.hasHorizontalScroll||this.x>0?i=0:this.x<this.maxScrollX&&(i=this.maxScrollX),!this.hasVerticalScroll||this.y>0?s=0:this.y<this.maxScrollY&&(s=this.maxScrollY),i==this.x&&s==this.y?!1:(this.scrollTo(i,s,t,this.options.bounceEasing),!0)},disable:function(){this.enabled=!1},enable:function(){this.enabled=!0},on:function(t,i){this._events[t]||(this._events[t]=[]),this._events[t].push(i)},off:function(t,i){if(this._events[t]){var s=this._events[t].indexOf(i);s>-1&&this._events[t].splice(s,1)}},_execEvent:function(t){if(this._events[t]){var i=0,s=this._events[t].length;if(s)for(;s>i;i++)this._events[t][i].apply(this,[].slice.call(arguments,1))}},scrollBy:function(t,i,s,e){t=this.x+t,i=this.y+i,s=s||0,this.scrollTo(t,i,s,e)},scrollTo:function(t,i,s,e){e=e||o.ease.circular,this.isInTransition=this.options.useTransition&&s>0,!s||this.options.useTransition&&e.style?(this._transitionTimingFunction(e.style),this._transitionTime(s),this._translate(t,i)):this._animate(t,i,s,e.fn)},scrollToElement:function(t,i,e,n,r){if(t=t.nodeType?t:this.scroller.querySelector(t)){var h=o.offset(t);h.left-=this.wrapperOffset.left,h.top-=this.wrapperOffset.top,e===!0&&(e=s.round(t.offsetWidth/2-this.wrapper.offsetWidth/2)),n===!0&&(n=s.round(t.offsetHeight/2-this.wrapper.offsetHeight/2)),h.left-=e||0,h.top-=n||0,h.left=h.left>0?0:h.left<this.maxScrollX?this.maxScrollX:h.left,h.top=h.top>0?0:h.top<this.maxScrollY?this.maxScrollY:h.top,i=void 0===i||null===i||"auto"===i?s.max(s.abs(this.x-h.left),s.abs(this.y-h.top)):i,this.scrollTo(h.left,h.top,i,r)}},_transitionTime:function(t){t=t||0,this.scrollerStyle[o.style.transitionDuration]=t+"ms",!t&&o.isBadAndroid&&(this.scrollerStyle[o.style.transitionDuration]="0.001s")},_transitionTimingFunction:function(t){this.scrollerStyle[o.style.transitionTimingFunction]=t},_translate:function(t,i){this.options.useTransform?this.scrollerStyle[o.style.transform]="translate("+t+"px,"+i+"px)"+this.translateZ:(t=s.round(t),i=s.round(i),this.scrollerStyle.left=t+"px",this.scrollerStyle.top=i+"px"),this.x=t,this.y=i},getComputedPosition:function(){var i,s,e=t.getComputedStyle(this.scroller,null);return this.options.useTransform?(e=e[o.style.transform].split(")")[0].split(", "),i=+(e[12]||e[4]),s=+(e[13]||e[5])):(i=+e.left.replace(/[^-\d.]/g,""),s=+e.top.replace(/[^-\d.]/g,"")),{x:i,y:s}},_animate:function(t,i,s,e){function r(){var u,d,f,v=o.getTime();return v>=p?(h.isAnimating=!1,h._translate(t,i),h.resetPosition(h.options.bounceTime)||h._execEvent("scrollEnd"),void 0):(v=(v-c)/s,f=e(v),u=(t-a)*f+a,d=(i-l)*f+l,h._translate(u,d),h.isAnimating&&n(r),void 0)}var h=this,a=this.x,l=this.y,c=o.getTime(),p=c+s;this.isAnimating=!0,r()},_autoplay:function(){var t=this;t.currentPage=t.currentPage>=t.count-1?0:++t.currentPage,t.scrollTo(-t.itemWidth*t.currentPage,0,t.options.bounceTime,t.options.bounceEasing),t.indicator?(o.removeClass(t.indicator.children,"current"),o.addClass(t.indicator.children[t.currentPage],"current")):t.nav&&(o.removeClass(t.nav.children,"current"),o.addClass(t.nav.children[t.currentPage],"current")),t.options.flag=setTimeout(function(){t._autoplay.apply(t)},t.options.interval)}},e.utils=o,"function"==typeof define?define(function(t,i,s){s.exports=e}):t.Slide=e}(window,document,Math);
!function(t,i,s){function e(t,s){this.wrapper="string"==typeof t?i.querySelector(t):t,this.options={startX:0,startY:0,scrollY:!0,directionLockThreshold:5,momentum:!0,bounce:!0,bounceTime:600,bounceEasing:"",preventDefault:!0,eventPassthrough:"",freeScroll:!1,preventDefaultException:{tagName:/^(INPUT|TEXTAREA|BUTTON|SELECT)$/},HWCompositing:!0,useTransition:!0,useTransform:!0};for(var e in s)this.options[e]=s[e];if("slider"===this.options.role)this.options.scrollX=!0,this.options.scrollY=!1,this.options.momentum=!1,this.scroller=i.querySelector(".ui-slider-content"),this.indicator=this.options.indicator?i.querySelector(".ui-slider-indicators"):null,this.currentPage=0,this.count=this.scroller.children.length,this.itemWidth=this.scroller.children[0].clientWidth,this.scrollWidth=this.itemWidth*this.count,this.indicator&&o.addClass(this.indicator.children[0],"current");else if("tab"===this.options.role){this.options.scrollX=!0,this.options.scrollY=!1,this.options.momentum=!1,this.scroller=i.querySelector(".ui-tab-content"),this.nav=i.querySelector(".ui-tab-nav"),this.currentPage=0,this.count=this.scroller.children.length,this.itemWidth=this.scroller.children[0].clientWidth,this.scrollWidth=this.itemWidth*this.count;for(var e=0;e<this.count;e++)this.nav.children[e].id=e;o.addClass(this.nav.children[0],"current")}else this.scroller=this.wrapper.children[0];if(this.scrollerStyle=this.scroller.style,this.translateZ=o.hasPerspective&&this.options.HWCompositing?" translateZ(0)":"",this.options.useTransition=o.hasTransition&&this.options.useTransition,this.options.useTransform=o.hasTransform&&this.options.useTransform,this.options.eventPassthrough=this.options.eventPassthrough===!0?"vertical":this.options.eventPassthrough,this.options.preventDefault=!this.options.eventPassthrough&&this.options.preventDefault,this.options.scrollX="horizontal"==this.options.eventPassthrough?!1:this.options.scrollX,this.options.scrollY="vertical"==this.options.eventPassthrough?!1:this.options.scrollY,this.options.freeScroll=this.options.freeScroll&&!this.options.eventPassthrough,this.options.directionLockThreshold=this.options.eventPassthrough?0:this.options.directionLockThreshold,this.options.bounceEasing="string"==typeof this.options.bounceEasing?o.ease[this.options.bounceEasing]||o.ease.circular:this.options.bounceEasing,this.options.resizePolling=void 0===this.options.resizePolling?60:this.options.resizePolling,this.options.tap===!0&&(this.options.tap="tap"),this.x=0,this.y=0,this.directionX=0,this.directionY=0,this._events={},this._init(),this.refresh(),this.scrollTo(this.options.startX,this.options.startY),this.enable(),this.options.autoplay){var n=this;this.options.interval=this.options.interval||2e3,this.options.flag=setTimeout(function(){n._autoplay.apply(n)},n.options.interval)}}var n=t.requestAnimationFrame||t.webkitRequestAnimationFrame||t.mozRequestAnimationFrame||t.oRequestAnimationFrame||t.msRequestAnimationFrame||function(i){t.setTimeout(i,1e3/60)},o=function(){function e(t){return r===!1?!1:""===r?t:r+t.charAt(0).toUpperCase()+t.substr(1)}var n={},o=i.createElement("div").style,r=function(){for(var t,i=["t","webkitT","MozT","msT","OT"],s=0,e=i.length;e>s;s++)if(t=i[s]+"ransform",t in o)return i[s].substr(0,i[s].length-1);return!1}();n.getTime=Date.now||function(){return(new Date).getTime()},n.extend=function(t,i){for(var s in i)t[s]=i[s]},n.addEvent=function(t,i,s,e){t.addEventListener(i,s,!!e)},n.removeEvent=function(t,i,s,e){t.removeEventListener(i,s,!!e)},n.prefixPointerEvent=function(i){return t.MSPointerEvent?"MSPointer"+i.charAt(9).toUpperCase()+i.substr(10):i},n.momentum=function(t,i,e,n,o,r){var h,a,l=t-i,c=s.abs(l)/e;return r=void 0===r?6e-4:r,h=t+c*c/(2*r)*(0>l?-1:1),a=c/r,n>h?(h=o?n-o/2.5*(c/8):n,l=s.abs(h-t),a=l/c):h>0&&(h=o?o/2.5*(c/8):0,l=s.abs(t)+h,a=l/c),{destination:s.round(h),duration:a}};var h=e("transform");return n.extend(n,{hasTransform:h!==!1,hasPerspective:e("perspective")in o,hasTouch:"ontouchstart"in t,hasPointer:t.PointerEvent||t.MSPointerEvent,hasTransition:e("transition")in o}),n.isBadAndroid=/Android /.test(t.navigator.appVersion)&&!/Chrome\/\d/.test(t.navigator.appVersion),n.extend(n.style={},{transform:h,transitionTimingFunction:e("transitionTimingFunction"),transitionDuration:e("transitionDuration"),transitionDelay:e("transitionDelay"),transformOrigin:e("transformOrigin")}),n.hasClass=function(t,i){var s=new RegExp("(^|\\s)"+i+"(\\s|$)");return s.test(t.className)},n.addClass=function(t,i){if(!n.hasClass(t,i)){var s=t.className.split(" ");s.push(i),t.className=s.join(" ")}},n.removeClass=function(t,i){var s,e=t.length;for(s=0;e>s;s++)if(n.hasClass(t[s],i)){var o=new RegExp("(^|\\s)"+i+"(\\s|$)","g");t[s].className=t[s].className.replace(o," ")}},n.offset=function(t){for(var i=-t.offsetLeft,s=-t.offsetTop;t=t.offsetParent;)i-=t.offsetLeft,s-=t.offsetTop;return{left:i,top:s}},n.preventDefaultException=function(t,i){for(var s in i)if(i[s].test(t[s]))return!0;return!1},n.extend(n.eventType={},{touchstart:1,touchmove:1,touchend:1,mousedown:2,mousemove:2,mouseup:2,pointerdown:3,pointermove:3,pointerup:3,MSPointerDown:3,MSPointerMove:3,MSPointerUp:3}),n.extend(n.ease={},{quadratic:{style:"cubic-bezier(0.25, 0.46, 0.45, 0.94)",fn:function(t){return t*(2-t)}},circular:{style:"cubic-bezier(0.1, 0.57, 0.1, 1)",fn:function(t){return s.sqrt(1- --t*t)}},back:{style:"cubic-bezier(0.175, 0.885, 0.32, 1.275)",fn:function(t){var i=4;return(t-=1)*t*((i+1)*t+i)+1}},bounce:{style:"",fn:function(t){return(t/=1)<1/2.75?7.5625*t*t:2/2.75>t?7.5625*(t-=1.5/2.75)*t+.75:2.5/2.75>t?7.5625*(t-=2.25/2.75)*t+.9375:7.5625*(t-=2.625/2.75)*t+.984375}},elastic:{style:"",fn:function(t){var i=.22,e=.4;return 0===t?0:1==t?1:e*s.pow(2,-10*t)*s.sin((t-i/4)*2*s.PI/i)+1}}}),n.tap=function(t,s){var e=i.createEvent("Event");e.initEvent(s,!0,!0),e.pageX=t.pageX,e.pageY=t.pageY,t.target.dispatchEvent(e)},n.click=function(t){var s,e=t.target;/(SELECT|INPUT|TEXTAREA)/i.test(e.tagName)||(s=i.createEvent("MouseEvents"),s.initMouseEvent("click",!0,!0,t.view,1,e.screenX,e.screenY,e.clientX,e.clientY,t.ctrlKey,t.altKey,t.shiftKey,t.metaKey,0,null),s._constructed=!0,e.dispatchEvent(s))},n}();e.prototype={_init:function(){this._initEvents()},_initEvents:function(i){var s=i?o.removeEvent:o.addEvent,e=this.options.bindToWrapper?this.wrapper:t;s(t,"orientationchange",this),s(t,"resize",this),this.options.click&&s(this.wrapper,"click",this,!0),this.options.disableMouse||(s(this.wrapper,"mousedown",this),s(e,"mousemove",this),s(e,"mousecancel",this),s(e,"mouseup",this)),o.hasPointer&&!this.options.disablePointer&&(s(this.wrapper,o.prefixPointerEvent("pointerdown"),this),s(e,o.prefixPointerEvent("pointermove"),this),s(e,o.prefixPointerEvent("pointercancel"),this),s(e,o.prefixPointerEvent("pointerup"),this)),o.hasTouch&&!this.options.disableTouch&&(s(this.wrapper,"touchstart",this),s(e,"touchmove",this),s(e,"touchcancel",this),s(e,"touchend",this)),s(this.scroller,"transitionend",this),s(this.scroller,"webkitTransitionEnd",this),s(this.scroller,"oTransitionEnd",this),s(this.scroller,"MSTransitionEnd",this),"tab"===this.options.role&&(s(this.nav,"touchend",this),s(this.nav,"mouseup",this),s(this.nav,"pointerup",this))},refresh:function(){this.wrapper.offsetHeight,this.wrapperWidth=this.wrapper.clientWidth,this.wrapperHeight=this.wrapper.clientHeight,this.scrollerWidth=this.scroller.offsetWidth,this.scrollerHeight=this.scroller.offsetHeight,("slider"===this.options.role||"tab"===this.options.role)&&(this.scrollerWidth=this.scrollWidth),this.maxScrollX=this.wrapperWidth-this.scrollerWidth,this.maxScrollY=this.wrapperHeight-this.scrollerHeight,this.hasHorizontalScroll=this.options.scrollX&&this.maxScrollX<0,this.hasVerticalScroll=this.options.scrollY&&this.maxScrollY<0,this.hasHorizontalScroll||(this.maxScrollX=0,this.scrollerWidth=this.wrapperWidth),this.hasVerticalScroll||(this.maxScrollY=0,this.scrollerHeight=this.wrapperHeight),this.endTime=0,this.directionX=0,this.directionY=0,this.wrapperOffset=o.offset(this.wrapper),this._execEvent("refresh"),this.resetPosition()},handleEvent:function(t){switch(t.type){case"touchstart":case"pointerdown":case"MSPointerDown":case"mousedown":this._start(t);break;case"touchmove":case"pointermove":case"MSPointerMove":case"mousemove":this._move(t);break;case"touchend":case"pointerup":case"MSPointerUp":case"mouseup":case"touchcancel":case"pointercancel":case"MSPointerCancel":case"mousecancel":this._end(t);break;case"orientationchange":case"resize":this._resize();break;case"transitionend":case"webkitTransitionEnd":case"oTransitionEnd":case"MSTransitionEnd":this._transitionEnd(t);break;case"wheel":case"DOMMouseScroll":case"mousewheel":this._wheel(t);break;case"keydown":this._key(t);break;case"click":t._constructed||(t.preventDefault(),t.stopPropagation())}},_start:function(t){if(!(1!=o.eventType[t.type]&&0!==t.button||!this.enabled||this.initiated&&o.eventType[t.type]!==this.initiated)){!this.options.preventDefault||o.isBadAndroid||o.preventDefaultException(t.target,this.options.preventDefaultException)||t.preventDefault();var i,e=t.touches?t.touches[0]:t;if(this.initiated=o.eventType[t.type],this.moved=!1,this.distX=0,this.distY=0,this.directionX=0,this.directionY=0,this.directionLocked=0,this._transitionTime(),this.startTime=o.getTime(),this.options.useTransition&&this.isInTransition?(this.isInTransition=!1,i=this.getComputedPosition(),this._translate(s.round(i.x),s.round(i.y)),this._execEvent("scrollEnd")):!this.options.useTransition&&this.isAnimating&&(this.isAnimating=!1,this._execEvent("scrollEnd")),this.startX=this.x,this.startY=this.y,this.absStartX=this.x,this.absStartY=this.y,this.pointX=e.pageX,this.pointY=e.pageY,this._execEvent("beforeScrollStart"),("slider"===this.options.role||"tab"===this.options.role)&&this._execEvent("slideStart"),this.options.autoplay){var n=this;clearTimeout(this.options.flag),this.options.flag=setTimeout(function(){n._autoplay.apply(n)},n.options.interval)}}},_move:function(t){if(this.enabled&&o.eventType[t.type]===this.initiated){this.options.preventDefault&&t.preventDefault();var i,e,n,r,h=t.touches?t.touches[0]:t,a=h.pageX-this.pointX,l=h.pageY-this.pointY,c=o.getTime();if(this.pointX=h.pageX,this.pointY=h.pageY,this.distX+=a,this.distY+=l,n=s.abs(this.distX),r=s.abs(this.distY),!(c-this.endTime>300&&10>n&&10>r)){if(this.directionLocked||this.options.freeScroll||(this.directionLocked=n>r+this.options.directionLockThreshold?"h":r>=n+this.options.directionLockThreshold?"v":"n"),"h"==this.directionLocked){if("vertical"==this.options.eventPassthrough)t.preventDefault();else if("horizontal"==this.options.eventPassthrough)return this.initiated=!1,void 0;l=0}else if("v"==this.directionLocked){if("horizontal"==this.options.eventPassthrough)t.preventDefault();else if("vertical"==this.options.eventPassthrough)return this.initiated=!1,void 0;a=0}a=this.hasHorizontalScroll?a:0,l=this.hasVerticalScroll?l:0,i=this.x+a,e=this.y+l,(i>0||i<this.maxScrollX)&&(i=this.options.bounce?this.x+a/3:i>0?0:this.maxScrollX),(e>0||e<this.maxScrollY)&&(e=this.options.bounce?this.y+l/3:e>0?0:this.maxScrollY),this.directionX=a>0?-1:0>a?1:0,this.directionY=l>0?-1:0>l?1:0,this.moved||this._execEvent("scrollStart"),this.moved=!0,this._translate(i,e),c-this.startTime>300&&(this.startTime=c,this.startX=this.x,this.startY=this.y)}}},_end:function(t){if(this.enabled&&o.eventType[t.type]===this.initiated){this.options.preventDefault&&!o.preventDefaultException(t.target,this.options.preventDefaultException)&&t.preventDefault();var i,e,n=(t.changedTouches?t.changedTouches[0]:t,o.getTime()-this.startTime),r=s.round(this.x),h=s.round(this.y),a=s.abs(r-this.startX),l=s.abs(h-this.startY),c=0,p="";if(this.isInTransition=0,this.initiated=0,this.endTime=o.getTime(),!this.resetPosition(this.options.bounceTime)){if(this.scrollTo(r,h),!this.moved&&"tab"===!this.options.role)return this.options.tap&&o.tap(t,this.options.tap),this.options.click&&o.click(t),this._execEvent("scrollCancel"),void 0;if(this._events.flick&&200>n&&100>a&&100>l)return this._execEvent("flick"),void 0;if(this.options.momentum&&300>n&&(i=this.hasHorizontalScroll?o.momentum(this.x,this.startX,n,this.maxScrollX,this.options.bounce?this.wrapperWidth:0,this.options.deceleration):{destination:r,duration:0},e=this.hasVerticalScroll?o.momentum(this.y,this.startY,n,this.maxScrollY,this.options.bounce?this.wrapperHeight:0,this.options.deceleration):{destination:h,duration:0},r=i.destination,h=e.destination,c=s.max(i.duration,e.duration),this.isInTransition=1),r!=this.x||h!=this.y)return(r>0||r<this.maxScrollX||h>0||h<this.maxScrollY)&&(p=o.ease.quadratic),this.scrollTo(r,h,c,p),void 0;"tab"===this.options.role&&"ui-tab-nav"===event.target.parentNode.className&&(o.removeClass(this.nav.children,"current"),o.addClass(event.target,"current"),this.currentPage=event.target.id),("slider"===this.options.role||"tab"===this.options.role)&&(50>a?this.scrollTo(-this.itemWidth*this.currentPage,0,this.options.bounceTime,this.options.bounceEasing):a>=50&&r-this.startX<0?(this.scrollTo(-this.itemWidth*++this.currentPage,0,this.options.bounceTime,this.options.bounceEasing),this.indicator?(o.removeClass(this.indicator.children,"current"),o.addClass(this.indicator.children[this.currentPage],"current")):this.nav&&(o.removeClass(this.nav.children,"current"),o.addClass(this.nav.children[this.currentPage],"current"))):a>=50&&r-this.startX>=0&&(this.scrollTo(-this.itemWidth*--this.currentPage,0,this.options.bounceTime,this.options.bounceEasing),this.indicator?(o.removeClass(this.indicator.children,"current"),o.addClass(this.indicator.children[this.currentPage],"current")):this.nav&&(o.removeClass(this.nav.children,"current"),o.addClass(this.nav.children[this.currentPage],"current"))),this._execEvent("slideEnd")),this._execEvent("scrollEnd")}}},_resize:function(){var t=this;clearTimeout(this.resizeTimeout),this.resizeTimeout=setTimeout(function(){t.refresh()},this.options.resizePolling)},_transitionEnd:function(t){t.target==this.scroller&&this.isInTransition&&(this._transitionTime(),this.resetPosition(this.options.bounceTime)||(this.isInTransition=!1,this._execEvent("scrollEnd")))},destroy:function(){this._initEvents(!0),this._execEvent("destroy")},resetPosition:function(t){var i=this.x,s=this.y;return t=t||0,!this.hasHorizontalScroll||this.x>0?i=0:this.x<this.maxScrollX&&(i=this.maxScrollX),!this.hasVerticalScroll||this.y>0?s=0:this.y<this.maxScrollY&&(s=this.maxScrollY),i==this.x&&s==this.y?!1:(this.scrollTo(i,s,t,this.options.bounceEasing),!0)},disable:function(){this.enabled=!1},enable:function(){this.enabled=!0},on:function(t,i){this._events[t]||(this._events[t]=[]),this._events[t].push(i)},off:function(t,i){if(this._events[t]){var s=this._events[t].indexOf(i);s>-1&&this._events[t].splice(s,1)}},_execEvent:function(t){if(this._events[t]){var i=0,s=this._events[t].length;if(s)for(;s>i;i++)this._events[t][i].apply(this,[].slice.call(arguments,1))}},scrollBy:function(t,i,s,e){t=this.x+t,i=this.y+i,s=s||0,this.scrollTo(t,i,s,e)},scrollTo:function(t,i,s,e){e=e||o.ease.circular,this.isInTransition=this.options.useTransition&&s>0,!s||this.options.useTransition&&e.style?(this._transitionTimingFunction(e.style),this._transitionTime(s),this._translate(t,i)):this._animate(t,i,s,e.fn)},scrollToElement:function(t,i,e,n,r){if(t=t.nodeType?t:this.scroller.querySelector(t)){var h=o.offset(t);h.left-=this.wrapperOffset.left,h.top-=this.wrapperOffset.top,e===!0&&(e=s.round(t.offsetWidth/2-this.wrapper.offsetWidth/2)),n===!0&&(n=s.round(t.offsetHeight/2-this.wrapper.offsetHeight/2)),h.left-=e||0,h.top-=n||0,h.left=h.left>0?0:h.left<this.maxScrollX?this.maxScrollX:h.left,h.top=h.top>0?0:h.top<this.maxScrollY?this.maxScrollY:h.top,i=void 0===i||null===i||"auto"===i?s.max(s.abs(this.x-h.left),s.abs(this.y-h.top)):i,this.scrollTo(h.left,h.top,i,r)}},_transitionTime:function(t){t=t||0,this.scrollerStyle[o.style.transitionDuration]=t+"ms",!t&&o.isBadAndroid&&(this.scrollerStyle[o.style.transitionDuration]="0.001s")},_transitionTimingFunction:function(t){this.scrollerStyle[o.style.transitionTimingFunction]=t},_translate:function(t,i){this.options.useTransform?this.scrollerStyle[o.style.transform]="translate("+t+"px,"+i+"px)"+this.translateZ:(t=s.round(t),i=s.round(i),this.scrollerStyle.left=t+"px",this.scrollerStyle.top=i+"px"),this.x=t,this.y=i},getComputedPosition:function(){var i,s,e=t.getComputedStyle(this.scroller,null);return this.options.useTransform?(e=e[o.style.transform].split(")")[0].split(", "),i=+(e[12]||e[4]),s=+(e[13]||e[5])):(i=+e.left.replace(/[^-\d.]/g,""),s=+e.top.replace(/[^-\d.]/g,"")),{x:i,y:s}},_animate:function(t,i,s,e){function r(){var u,d,f,v=o.getTime();return v>=p?(h.isAnimating=!1,h._translate(t,i),h.resetPosition(h.options.bounceTime)||h._execEvent("scrollEnd"),void 0):(v=(v-c)/s,f=e(v),u=(t-a)*f+a,d=(i-l)*f+l,h._translate(u,d),h.isAnimating&&n(r),void 0)}var h=this,a=this.x,l=this.y,c=o.getTime(),p=c+s;this.isAnimating=!0,r()},_autoplay:function(){var t=this;t.currentPage=t.currentPage>=t.count-1?0:++t.currentPage,t.scrollTo(-t.itemWidth*t.currentPage,0,t.options.bounceTime,t.options.bounceEasing),t.indicator?(o.removeClass(t.indicator.children,"current"),o.addClass(t.indicator.children[t.currentPage],"current")):t.nav&&(o.removeClass(t.nav.children,"current"),o.addClass(t.nav.children[t.currentPage],"current")),t.options.flag=setTimeout(function(){t._autoplay.apply(t)},t.options.interval)}},e.utils=o,"function"==typeof define?define(function(t,i,s){s.exports=e}):t.Slide=e}(window,document,Math);
!function(t,i,s){function e(t,s){this.wrapper="string"==typeof t?i.querySelector(t):t,this.options={startX:0,startY:0,scrollY:!0,directionLockThreshold:5,momentum:!0,bounce:!0,bounceTime:600,bounceEasing:"",preventDefault:!0,eventPassthrough:"",freeScroll:!1,preventDefaultException:{tagName:/^(INPUT|TEXTAREA|BUTTON|SELECT)$/},HWCompositing:!0,useTransition:!0,useTransform:!0};for(var e in s)this.options[e]=s[e];if("slider"===this.options.role)this.options.scrollX=!0,this.options.scrollY=!1,this.options.momentum=!1,this.scroller=i.querySelector(".ui-slider-content"),this.indicator=this.options.indicator?i.querySelector(".ui-slider-indicators"):null,this.currentPage=0,this.count=this.scroller.children.length,this.itemWidth=this.scroller.children[0].clientWidth,this.scrollWidth=this.itemWidth*this.count,this.indicator&&o.addClass(this.indicator.children[0],"current");else if("tab"===this.options.role){this.options.scrollX=!0,this.options.scrollY=!1,this.options.momentum=!1,this.scroller=i.querySelector(".ui-tab-content"),this.nav=i.querySelector(".ui-tab-nav"),this.currentPage=0,this.count=this.scroller.children.length,this.itemWidth=this.scroller.children[0].clientWidth,this.scrollWidth=this.itemWidth*this.count;for(var e=0;e<this.count;e++)this.nav.children[e].id=e;o.addClass(this.nav.children[0],"current")}else this.scroller=this.wrapper.children[0];if(this.scrollerStyle=this.scroller.style,this.translateZ=o.hasPerspective&&this.options.HWCompositing?" translateZ(0)":"",this.options.useTransition=o.hasTransition&&this.options.useTransition,this.options.useTransform=o.hasTransform&&this.options.useTransform,this.options.eventPassthrough=this.options.eventPassthrough===!0?"vertical":this.options.eventPassthrough,this.options.preventDefault=!this.options.eventPassthrough&&this.options.preventDefault,this.options.scrollX="horizontal"==this.options.eventPassthrough?!1:this.options.scrollX,this.options.scrollY="vertical"==this.options.eventPassthrough?!1:this.options.scrollY,this.options.freeScroll=this.options.freeScroll&&!this.options.eventPassthrough,this.options.directionLockThreshold=this.options.eventPassthrough?0:this.options.directionLockThreshold,this.options.bounceEasing="string"==typeof this.options.bounceEasing?o.ease[this.options.bounceEasing]||o.ease.circular:this.options.bounceEasing,this.options.resizePolling=void 0===this.options.resizePolling?60:this.options.resizePolling,this.options.tap===!0&&(this.options.tap="tap"),this.x=0,this.y=0,this.directionX=0,this.directionY=0,this._events={},this._init(),this.refresh(),this.scrollTo(this.options.startX,this.options.startY),this.enable(),this.options.autoplay){var n=this;this.options.interval=this.options.interval||2e3,this.options.flag=setTimeout(function(){n._autoplay.apply(n)},n.options.interval)}}var n=t.requestAnimationFrame||t.webkitRequestAnimationFrame||t.mozRequestAnimationFrame||t.oRequestAnimationFrame||t.msRequestAnimationFrame||function(i){t.setTimeout(i,1e3/60)},o=function(){function e(t){return r===!1?!1:""===r?t:r+t.charAt(0).toUpperCase()+t.substr(1)}var n={},o=i.createElement("div").style,r=function(){for(var t,i=["t","webkitT","MozT","msT","OT"],s=0,e=i.length;e>s;s++)if(t=i[s]+"ransform",t in o)return i[s].substr(0,i[s].length-1);return!1}();n.getTime=Date.now||function(){return(new Date).getTime()},n.extend=function(t,i){for(var s in i)t[s]=i[s]},n.addEvent=function(t,i,s,e){t.addEventListener(i,s,!!e)},n.removeEvent=function(t,i,s,e){t.removeEventListener(i,s,!!e)},n.prefixPointerEvent=function(i){return t.MSPointerEvent?"MSPointer"+i.charAt(9).toUpperCase()+i.substr(10):i},n.momentum=function(t,i,e,n,o,r){var h,a,l=t-i,c=s.abs(l)/e;return r=void 0===r?6e-4:r,h=t+c*c/(2*r)*(0>l?-1:1),a=c/r,n>h?(h=o?n-o/2.5*(c/8):n,l=s.abs(h-t),a=l/c):h>0&&(h=o?o/2.5*(c/8):0,l=s.abs(t)+h,a=l/c),{destination:s.round(h),duration:a}};var h=e("transform");return n.extend(n,{hasTransform:h!==!1,hasPerspective:e("perspective")in o,hasTouch:"ontouchstart"in t,hasPointer:t.PointerEvent||t.MSPointerEvent,hasTransition:e("transition")in o}),n.isBadAndroid=/Android /.test(t.navigator.appVersion)&&!/Chrome\/\d/.test(t.navigator.appVersion),n.extend(n.style={},{transform:h,transitionTimingFunction:e("transitionTimingFunction"),transitionDuration:e("transitionDuration"),transitionDelay:e("transitionDelay"),transformOrigin:e("transformOrigin")}),n.hasClass=function(t,i){var s=new RegExp("(^|\\s)"+i+"(\\s|$)");return s.test(t.className)},n.addClass=function(t,i){if(!n.hasClass(t,i)){var s=t.className.split(" ");s.push(i),t.className=s.join(" ")}},n.removeClass=function(t,i){var s,e=t.length;for(s=0;e>s;s++)if(n.hasClass(t[s],i)){var o=new RegExp("(^|\\s)"+i+"(\\s|$)","g");t[s].className=t[s].className.replace(o," ")}},n.offset=function(t){for(var i=-t.offsetLeft,s=-t.offsetTop;t=t.offsetParent;)i-=t.offsetLeft,s-=t.offsetTop;return{left:i,top:s}},n.preventDefaultException=function(t,i){for(var s in i)if(i[s].test(t[s]))return!0;return!1},n.extend(n.eventType={},{touchstart:1,touchmove:1,touchend:1,mousedown:2,mousemove:2,mouseup:2,pointerdown:3,pointermove:3,pointerup:3,MSPointerDown:3,MSPointerMove:3,MSPointerUp:3}),n.extend(n.ease={},{quadratic:{style:"cubic-bezier(0.25, 0.46, 0.45, 0.94)",fn:function(t){return t*(2-t)}},circular:{style:"cubic-bezier(0.1, 0.57, 0.1, 1)",fn:function(t){return s.sqrt(1- --t*t)}},back:{style:"cubic-bezier(0.175, 0.885, 0.32, 1.275)",fn:function(t){var i=4;return(t-=1)*t*((i+1)*t+i)+1}},bounce:{style:"",fn:function(t){return(t/=1)<1/2.75?7.5625*t*t:2/2.75>t?7.5625*(t-=1.5/2.75)*t+.75:2.5/2.75>t?7.5625*(t-=2.25/2.75)*t+.9375:7.5625*(t-=2.625/2.75)*t+.984375}},elastic:{style:"",fn:function(t){var i=.22,e=.4;return 0===t?0:1==t?1:e*s.pow(2,-10*t)*s.sin((t-i/4)*2*s.PI/i)+1}}}),n.tap=function(t,s){var e=i.createEvent("Event");e.initEvent(s,!0,!0),e.pageX=t.pageX,e.pageY=t.pageY,t.target.dispatchEvent(e)},n.click=function(t){var s,e=t.target;/(SELECT|INPUT|TEXTAREA)/i.test(e.tagName)||(s=i.createEvent("MouseEvents"),s.initMouseEvent("click",!0,!0,t.view,1,e.screenX,e.screenY,e.clientX,e.clientY,t.ctrlKey,t.altKey,t.shiftKey,t.metaKey,0,null),s._constructed=!0,e.dispatchEvent(s))},n}();e.prototype={_init:function(){this._initEvents()},_initEvents:function(i){var s=i?o.removeEvent:o.addEvent,e=this.options.bindToWrapper?this.wrapper:t;s(t,"orientationchange",this),s(t,"resize",this),this.options.click&&s(this.wrapper,"click",this,!0),this.options.disableMouse||(s(this.wrapper,"mousedown",this),s(e,"mousemove",this),s(e,"mousecancel",this),s(e,"mouseup",this)),o.hasPointer&&!this.options.disablePointer&&(s(this.wrapper,o.prefixPointerEvent("pointerdown"),this),s(e,o.prefixPointerEvent("pointermove"),this),s(e,o.prefixPointerEvent("pointercancel"),this),s(e,o.prefixPointerEvent("pointerup"),this)),o.hasTouch&&!this.options.disableTouch&&(s(this.wrapper,"touchstart",this),s(e,"touchmove",this),s(e,"touchcancel",this),s(e,"touchend",this)),s(this.scroller,"transitionend",this),s(this.scroller,"webkitTransitionEnd",this),s(this.scroller,"oTransitionEnd",this),s(this.scroller,"MSTransitionEnd",this),"tab"===this.options.role&&(s(this.nav,"touchend",this),s(this.nav,"mouseup",this),s(this.nav,"pointerup",this))},refresh:function(){this.wrapper.offsetHeight,this.wrapperWidth=this.wrapper.clientWidth,this.wrapperHeight=this.wrapper.clientHeight,this.scrollerWidth=this.scroller.offsetWidth,this.scrollerHeight=this.scroller.offsetHeight,("slider"===this.options.role||"tab"===this.options.role)&&(this.scrollerWidth=this.scrollWidth),this.maxScrollX=this.wrapperWidth-this.scrollerWidth,this.maxScrollY=this.wrapperHeight-this.scrollerHeight,this.hasHorizontalScroll=this.options.scrollX&&this.maxScrollX<0,this.hasVerticalScroll=this.options.scrollY&&this.maxScrollY<0,this.hasHorizontalScroll||(this.maxScrollX=0,this.scrollerWidth=this.wrapperWidth),this.hasVerticalScroll||(this.maxScrollY=0,this.scrollerHeight=this.wrapperHeight),this.endTime=0,this.directionX=0,this.directionY=0,this.wrapperOffset=o.offset(this.wrapper),this._execEvent("refresh"),this.resetPosition()},handleEvent:function(t){switch(t.type){case"touchstart":case"pointerdown":case"MSPointerDown":case"mousedown":this._start(t);break;case"touchmove":case"pointermove":case"MSPointerMove":case"mousemove":this._move(t);break;case"touchend":case"pointerup":case"MSPointerUp":case"mouseup":case"touchcancel":case"pointercancel":case"MSPointerCancel":case"mousecancel":this._end(t);break;case"orientationchange":case"resize":this._resize();break;case"transitionend":case"webkitTransitionEnd":case"oTransitionEnd":case"MSTransitionEnd":this._transitionEnd(t);break;case"wheel":case"DOMMouseScroll":case"mousewheel":this._wheel(t);break;case"keydown":this._key(t);break;case"click":t._constructed||(t.preventDefault(),t.stopPropagation())}},_start:function(t){if(!(1!=o.eventType[t.type]&&0!==t.button||!this.enabled||this.initiated&&o.eventType[t.type]!==this.initiated)){!this.options.preventDefault||o.isBadAndroid||o.preventDefaultException(t.target,this.options.preventDefaultException)||t.preventDefault();var i,e=t.touches?t.touches[0]:t;if(this.initiated=o.eventType[t.type],this.moved=!1,this.distX=0,this.distY=0,this.directionX=0,this.directionY=0,this.directionLocked=0,this._transitionTime(),this.startTime=o.getTime(),this.options.useTransition&&this.isInTransition?(this.isInTransition=!1,i=this.getComputedPosition(),this._translate(s.round(i.x),s.round(i.y)),this._execEvent("scrollEnd")):!this.options.useTransition&&this.isAnimating&&(this.isAnimating=!1,this._execEvent("scrollEnd")),this.startX=this.x,this.startY=this.y,this.absStartX=this.x,this.absStartY=this.y,this.pointX=e.pageX,this.pointY=e.pageY,this._execEvent("beforeScrollStart"),("slider"===this.options.role||"tab"===this.options.role)&&this._execEvent("slideStart"),this.options.autoplay){var n=this;clearTimeout(this.options.flag),this.options.flag=setTimeout(function(){n._autoplay.apply(n)},n.options.interval)}}},_move:function(t){if(this.enabled&&o.eventType[t.type]===this.initiated){this.options.preventDefault&&t.preventDefault();var i,e,n,r,h=t.touches?t.touches[0]:t,a=h.pageX-this.pointX,l=h.pageY-this.pointY,c=o.getTime();if(this.pointX=h.pageX,this.pointY=h.pageY,this.distX+=a,this.distY+=l,n=s.abs(this.distX),r=s.abs(this.distY),!(c-this.endTime>300&&10>n&&10>r)){if(this.directionLocked||this.options.freeScroll||(this.directionLocked=n>r+this.options.directionLockThreshold?"h":r>=n+this.options.directionLockThreshold?"v":"n"),"h"==this.directionLocked){if("vertical"==this.options.eventPassthrough)t.preventDefault();else if("horizontal"==this.options.eventPassthrough)return this.initiated=!1,void 0;l=0}else if("v"==this.directionLocked){if("horizontal"==this.options.eventPassthrough)t.preventDefault();else if("vertical"==this.options.eventPassthrough)return this.initiated=!1,void 0;a=0}a=this.hasHorizontalScroll?a:0,l=this.hasVerticalScroll?l:0,i=this.x+a,e=this.y+l,(i>0||i<this.maxScrollX)&&(i=this.options.bounce?this.x+a/3:i>0?0:this.maxScrollX),(e>0||e<this.maxScrollY)&&(e=this.options.bounce?this.y+l/3:e>0?0:this.maxScrollY),this.directionX=a>0?-1:0>a?1:0,this.directionY=l>0?-1:0>l?1:0,this.moved||this._execEvent("scrollStart"),this.moved=!0,this._translate(i,e),c-this.startTime>300&&(this.startTime=c,this.startX=this.x,this.startY=this.y)}}},_end:function(t){if(this.enabled&&o.eventType[t.type]===this.initiated){this.options.preventDefault&&!o.preventDefaultException(t.target,this.options.preventDefaultException)&&t.preventDefault();var i,e,n=(t.changedTouches?t.changedTouches[0]:t,o.getTime()-this.startTime),r=s.round(this.x),h=s.round(this.y),a=s.abs(r-this.startX),l=s.abs(h-this.startY),c=0,p="";if(this.isInTransition=0,this.initiated=0,this.endTime=o.getTime(),!this.resetPosition(this.options.bounceTime)){if(this.scrollTo(r,h),!this.moved&&"tab"===!this.options.role)return this.options.tap&&o.tap(t,this.options.tap),this.options.click&&o.click(t),this._execEvent("scrollCancel"),void 0;if(this._events.flick&&200>n&&100>a&&100>l)return this._execEvent("flick"),void 0;if(this.options.momentum&&300>n&&(i=this.hasHorizontalScroll?o.momentum(this.x,this.startX,n,this.maxScrollX,this.options.bounce?this.wrapperWidth:0,this.options.deceleration):{destination:r,duration:0},e=this.hasVerticalScroll?o.momentum(this.y,this.startY,n,this.maxScrollY,this.options.bounce?this.wrapperHeight:0,this.options.deceleration):{destination:h,duration:0},r=i.destination,h=e.destination,c=s.max(i.duration,e.duration),this.isInTransition=1),r!=this.x||h!=this.y)return(r>0||r<this.maxScrollX||h>0||h<this.maxScrollY)&&(p=o.ease.quadratic),this.scrollTo(r,h,c,p),void 0;"tab"===this.options.role&&"ui-tab-nav"===event.target.parentNode.className&&(o.removeClass(this.nav.children,"current"),o.addClass(event.target,"current"),this.currentPage=event.target.id),("slider"===this.options.role||"tab"===this.options.role)&&(50>a?this.scrollTo(-this.itemWidth*this.currentPage,0,this.options.bounceTime,this.options.bounceEasing):a>=50&&r-this.startX<0?(this.scrollTo(-this.itemWidth*++this.currentPage,0,this.options.bounceTime,this.options.bounceEasing),this.indicator?(o.removeClass(this.indicator.children,"current"),o.addClass(this.indicator.children[this.currentPage],"current")):this.nav&&(o.removeClass(this.nav.children,"current"),o.addClass(this.nav.children[this.currentPage],"current"))):a>=50&&r-this.startX>=0&&(this.scrollTo(-this.itemWidth*--this.currentPage,0,this.options.bounceTime,this.options.bounceEasing),this.indicator?(o.removeClass(this.indicator.children,"current"),o.addClass(this.indicator.children[this.currentPage],"current")):this.nav&&(o.removeClass(this.nav.children,"current"),o.addClass(this.nav.children[this.currentPage],"current"))),this._execEvent("slideEnd")),this._execEvent("scrollEnd")}}},_resize:function(){var t=this;clearTimeout(this.resizeTimeout),this.resizeTimeout=setTimeout(function(){t.refresh()},this.options.resizePolling)},_transitionEnd:function(t){t.target==this.scroller&&this.isInTransition&&(this._transitionTime(),this.resetPosition(this.options.bounceTime)||(this.isInTransition=!1,this._execEvent("scrollEnd")))},destroy:function(){this._initEvents(!0),this._execEvent("destroy")},resetPosition:function(t){var i=this.x,s=this.y;return t=t||0,!this.hasHorizontalScroll||this.x>0?i=0:this.x<this.maxScrollX&&(i=this.maxScrollX),!this.hasVerticalScroll||this.y>0?s=0:this.y<this.maxScrollY&&(s=this.maxScrollY),i==this.x&&s==this.y?!1:(this.scrollTo(i,s,t,this.options.bounceEasing),!0)},disable:function(){this.enabled=!1},enable:function(){this.enabled=!0},on:function(t,i){this._events[t]||(this._events[t]=[]),this._events[t].push(i)},off:function(t,i){if(this._events[t]){var s=this._events[t].indexOf(i);s>-1&&this._events[t].splice(s,1)}},_execEvent:function(t){if(this._events[t]){var i=0,s=this._events[t].length;if(s)for(;s>i;i++)this._events[t][i].apply(this,[].slice.call(arguments,1))}},scrollBy:function(t,i,s,e){t=this.x+t,i=this.y+i,s=s||0,this.scrollTo(t,i,s,e)},scrollTo:function(t,i,s,e){e=e||o.ease.circular,this.isInTransition=this.options.useTransition&&s>0,!s||this.options.useTransition&&e.style?(this._transitionTimingFunction(e.style),this._transitionTime(s),this._translate(t,i)):this._animate(t,i,s,e.fn)},scrollToElement:function(t,i,e,n,r){if(t=t.nodeType?t:this.scroller.querySelector(t)){var h=o.offset(t);h.left-=this.wrapperOffset.left,h.top-=this.wrapperOffset.top,e===!0&&(e=s.round(t.offsetWidth/2-this.wrapper.offsetWidth/2)),n===!0&&(n=s.round(t.offsetHeight/2-this.wrapper.offsetHeight/2)),h.left-=e||0,h.top-=n||0,h.left=h.left>0?0:h.left<this.maxScrollX?this.maxScrollX:h.left,h.top=h.top>0?0:h.top<this.maxScrollY?this.maxScrollY:h.top,i=void 0===i||null===i||"auto"===i?s.max(s.abs(this.x-h.left),s.abs(this.y-h.top)):i,this.scrollTo(h.left,h.top,i,r)}},_transitionTime:function(t){t=t||0,this.scrollerStyle[o.style.transitionDuration]=t+"ms",!t&&o.isBadAndroid&&(this.scrollerStyle[o.style.transitionDuration]="0.001s")},_transitionTimingFunction:function(t){this.scrollerStyle[o.style.transitionTimingFunction]=t},_translate:function(t,i){this.options.useTransform?this.scrollerStyle[o.style.transform]="translate("+t+"px,"+i+"px)"+this.translateZ:(t=s.round(t),i=s.round(i),this.scrollerStyle.left=t+"px",this.scrollerStyle.top=i+"px"),this.x=t,this.y=i},getComputedPosition:function(){var i,s,e=t.getComputedStyle(this.scroller,null);return this.options.useTransform?(e=e[o.style.transform].split(")")[0].split(", "),i=+(e[12]||e[4]),s=+(e[13]||e[5])):(i=+e.left.replace(/[^-\d.]/g,""),s=+e.top.replace(/[^-\d.]/g,"")),{x:i,y:s}},_animate:function(t,i,s,e){function r(){var u,d,f,v=o.getTime();return v>=p?(h.isAnimating=!1,h._translate(t,i),h.resetPosition(h.options.bounceTime)||h._execEvent("scrollEnd"),void 0):(v=(v-c)/s,f=e(v),u=(t-a)*f+a,d=(i-l)*f+l,h._translate(u,d),h.isAnimating&&n(r),void 0)}var h=this,a=this.x,l=this.y,c=o.getTime(),p=c+s;this.isAnimating=!0,r()},_autoplay:function(){var t=this;t.currentPage=t.currentPage>=t.count-1?0:++t.currentPage,t.scrollTo(-t.itemWidth*t.currentPage,0,t.options.bounceTime,t.options.bounceEasing),t.indicator?(o.removeClass(t.indicator.children,"current"),o.addClass(t.indicator.children[t.currentPage],"current")):t.nav&&(o.removeClass(t.nav.children,"current"),o.addClass(t.nav.children[t.currentPage],"current")),t.options.flag=setTimeout(function(){t._autoplay.apply(t)},t.options.interval)}},e.utils=o,"function"==typeof define?define(function(t,i,s){s.exports=e}):t.Slide=e}(window,document,Math);
/**
 * User: jeakeyliang
 * Date: 14-11-07
 * Time: 下午9:20
 */

!function($){

	// 默认模板
	var _tipsTpl='<div class="ui-poptips ui-poptips-<%=type%>">'+
					'<div class="ui-poptips-cnt">'+
    				'<i></i><%=content%>'+
					'</div>'+
				'</div>';
	
	// 默认参数
	var defaults={
		content:'',
		stayTime:1000,
		type:'info',
		callback:function(){}
	}
	// 构造函数
	var Tips   = function (el,option,isFromTpl) {
		var self=this;
		this.element=$(el);
		this._isFromTpl=isFromTpl;
		this.elementHeight=$(el).height();

		this.option=$.extend(defaults,option);
		$(el).css({
			"-webkit-transform":"translateY(-"+this.elementHeight+"px)"
		});
		setTimeout(function(){
			$(el).css({
				"-webkit-transition":"all .5s"
			});
			self.show();
		},20);
		
	}
	Tips.prototype={
		show:function(){
			var self=this;
			self.option.callback("show");
			this.element.css({
				"-webkit-transform":"translateY(0px)"
			});
			if(self.option.stayTime>0){
				setTimeout(function(){
					self.hide();
				},self.option.stayTime)
			}
		},
		hide :function () {
			var self=this;

			if(self.option.callback("hide")!=false){
				this.element.css({
					"-webkit-transform":"translateY(-"+this.elementHeight+"px)"
				});
				setTimeout(function(){
					self._isFromTpl&&self.element.remove();
				},500)
				
			}
		}
	}
	function Plugin(option) {

		return $.adaptObject(this, defaults, option,_tipsTpl,Tips,"tips");
	}
	$.fn.tips=$.tips= Plugin;
}(window.Zepto)
	

