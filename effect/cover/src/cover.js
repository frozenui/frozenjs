define(function(require, exports, module) {

	var Widget=require('arale/widget/1.1.1/widget');
	var DAParser = require('arale/widget/1.1.1/daparser');
	var $=require('gallery/zepto/1.1.3/zepto');
	
	var Cover = Widget.extend({
	  attrs: {
	  	// 需要cover的元素，元素要求不为static定位，如果是static定位会自动转换为relative
	  	// 默认为body
	  	element:$('body'),

	  	// element内的触发元素
	  	trigger:{
	  		value:null,
	  		getter: function (val) {
	  			
		        return this.element.find(val);
		    }

	  	},
	  	// 关闭cover的触发元素
	  	dismiss:{
	  		value:null,
	  		getter: function (val) {
		        return this.element.find(val);
		     }

	  	},
	  	// cover的背景色，可以设置图片和色值，默认为随机色值
	  	background:{
	  		value:'random',
	  		getter:function(val){
	  			if(val=='random'){
	  				return '#'+('00000'+(Math.random()*0x1000000<<0).toString(16)).slice(-6);
	  			}
	  			return val;
	  		}
	  	},
	  		
	    // cover的形状，可选 random|round|square
	    shape: {
	  		value:'square',
	  		getter:function(val){
	  			if(val=='random'){
	  				if(parseInt(Math.random()*10)%2==1)
	  					return 'square';
	  				else return 'round';
	  			}
	  			return val;
	  		}
	  	},
	  	// 开始的斜切值，默认为random
		fromSkew: {
	  		value:'random',
	  		getter:function(val){
	  			if(val=='random'){
	  				return [Math.random()*20-10,Math.random()*20-10];
	  			}
	  			return val;
	  		}
	  	},

	  	// 动画时间
	  	duration:1000,
	    // cover开始的位置，可选 top|center|bottom|source
	    startPos:  {
	  		value:'source'
	  	},

	  	// cover开始位置的偏移量
	  	offset:[0,0],

	    // cover扩展方向，可选 x|y|xy
	    expandAxis: 'y',

	    // 触发元素是否保持在cover上方
	    isFloat:true,

	    // cover的z-index
	    zIndex:999
	  },
	  
	  setup: function () {
	  	// 调用父类setup
	    Cover.superclass.setup.call(this);
	    // 初始化mask
	    this.initMask();
	    // 渲染DOM
	    this.render();
	    // 默认未显示
	    this._isShown=false;
	   	// 默认没触发关闭 
	    this._isDismiss=false;    
	    // 事件绑定
	    this._bindTrigger();

	    if(!this.position) {
	  		this.position={};
		  	this.position.screenWidth   =document.documentElement.clientWidth,
		  	this.position.screenHeight  =document.documentElement.clientHeight;
	  	}
	    
	  },
	  initMask:function(){
	  	// 定义初始mask
	    this._mask=$('<div></div>');
	    // 基础样式
	    this._mask.css({
	  		position:'absolute',
	  		top:0,
	  		left:0,
	  		width:100,
	  		height:100,
	  		'z-index':-1,
	  		'-webkit-transform':'scale(0)'
	  	});
	  },
	  render: function () {
	  	// 初始化时先将mask插入页面
	  	this._mask.appendTo(this.element);

	  	// 设置根元素为相对定位，用于定位子级元素
	  	if(!isRelative(this.element)){
	  		this.element.css({
	  			'position':'relative',
	  			'overflow':'hidden'
	  		});
	  	}

	  	// 触发父类render
	    Cover.superclass.render.call(this);
	    return this;
	  },

	  setConfig:function(config){
	  	if(config.trigger){
  			this.currentTrigger=$(config.trigger);
  		}
  		if(!this.currentTrigger){
  			this.currentTrigger=this.get('trigger');
  		}

  		if(!this._isShown){
  			var dataAttrsConfig = DAParser.parseElement(this.currentTrigger);
  			config=$.extend(config,dataAttrsConfig);
  			this.currentConfig=config;
  		}
  		
  		// if(this.currentTrigger)
  		// 	this._show(config);
  		return this;
	  },

	  // 显示cover
	  show: function (el) {
	  	var config=this.currentConfig;
	  	
	  	if(!this._isShown&&(this.currentTrigger||el)){
	  		if(el){
	  			this.currentTrigger=el;
	  		}
	  		this._preventDefault();
	  		self._isDismiss=false;
	  		this._isShown=true;
	  		
	  		// data属性优先
		  	var shape     =config.shape||this.get('shape'),
		  		isFloat   =config.isFloat!=undefined?config.isFloat:this.get('isFloat'),
		  		background=config.background||this.get('background'),
		  		startPos  =config.startPos||this.get('startPos'),
		  		offset    =config.offset||this.get('offset'),
		  		expandAxis=config.expandAxis||this.get('expandAxis'),
		  		zIndex    =config.zIndex||this.get('zIndex'),
		  		fromSkew  =config.fromSkew||this.get('fromSkew'),
		  		duration  =config.duration||this.get('duration'),
		  		ratio     =2;//缩放系数，方形为2，圆形为3
		  	
		  	if(isFloat){
		  		// 浮动trigger元素
		  		this._floatTrigger();
		  		this.currentTrigger.css({
		  			'zIndex':zIndex+1
		  		})
		  	}
		  	// 设置圆形遮罩
		  	if(shape=='round'){
		  		this._mask.css({
		  			'border-radius':'50px'
		  		});
		  		ratio=3;
		  	}else{
		  		this._mask.css({
		  			'border-radius':'0px'
		  		});
		  	}

		  	// mask属性
		  	
		  	var maskPos=this._getMaskPos(startPos,expandAxis),
		  		maskScale=expandAxis=='x'?'scale(0,1)':
		  				  (expandAxis=='y'?'scale(1,0)':'scale(0,0)');

		  	// 设置mask属性
		  	this._mask.css({
		  		left:maskPos[0]+offset[0],
		  		top:maskPos[1]+offset[1],
		  		background:background,
		  		'z-index':zIndex,
		  		'-webkit-transform':maskScale+' '+'skew('+fromSkew[0]+'deg,'+fromSkew[1]+'deg)'
		  	});

		  	// mask动画
		  	this._aniMask(duration,offset,ratio);
		  	
	  	}
	    return this;
	  },

	  
	  // 隐藏cover
	  hide: function (config) {

	  	if(this._isShown){
		  	this._isDismiss=true;
		    this._mask.css({
		    	'-webkit-transform':this._originTransform
		    });
	    }
	    return this;
	  },

	  // show动画完成后调用，可以使用before/after在动画后进行操作
	  shown:function(){
	  	// alert(1);
	  },

	  // hide动画完成后调用，可以使用before/after在动画后进行操作，并进行了一些重置
	  hidden:function(){
	  	// 重置样式和参数
	  	this._isShown=false;
	  	this._isDismiss=false;
	  	this._mask.css({
	  		'-webkit-transition':'none'
	  	});
	  	this._relaseDefault();

	  	this.currentTrigger.css(this._triggerOriginCss);
	  	
	  },

	  // 绑定事件
	  _bindTrigger: function () {
	  	var self=this,
	  		triggerType='click';
	  	if($.os.phone) triggerType='tap';
	  	// 触发器事件
	    this.get('trigger').on(triggerType,function(){

	    	if(!self._isShown){

	    		self.currentTrigger=$(this);
	    	}
	    	var dataAttrsConfig = DAParser.parseElement($(this));

	    	self.setConfig(dataAttrsConfig).show($(this));
	    	return false;
	    });

	    // 关闭事件绑定
	    this.get('dismiss').on(triggerType,function(){
	    	self._dismiss=$(this);
	    	
	    	self.hide();
	    	return false;
	    });

	    // 动画结束后回调
	    this._mask[0].addEventListener("webkitTransitionEnd",function(){
	    	// _isShown代表cover已打开，_isDismiss代表触发关闭
	    	
	    	if(self._isShown&&!self._isDismiss){
	    		
	    			self.shown();
	    	}else{
	    		
	    		self.hidden();
	    	}
	    },false);
	    
	  },

	  // 打开时取消默认事件
	  _preventDefault: function () {

	  	document.addEventListener('mousewheel',preventEvent,false); 
	  	document.body.addEventListener('touchmove',preventEvent,false); 
	  	document.documentElement.addEventListener('touchmove',preventEvent,false); 
	    
	  },

	  // 关闭时恢复默认事件
	  _relaseDefault:function(){
	  	document.removeEventListener('mousewheel',preventEvent,false); 
	  	document.body.removeEventListener('touchmove',preventEvent,false); 
	  	document.documentElement.removeEventListener('touchmove',preventEvent,false); 
	   
	  },

	  // 设置非定位元素为相对路径，并保留初始样式
	  _floatTrigger:function(){
	  	// 保留初始样式，方便reset

	  	this._triggerOriginCss={
	  		'position':this.currentTrigger.css('position'),
	  		'z-index':this.currentTrigger.css('z-index')
	  	}
	  	
	  	// 如果不是定位元素，设置为相对定位
	  	if(!isRelative(this.currentTrigger)){
	  		this.currentTrigger.css({
	  			'position':'relative',
	  		});
	  	}
	  },

	  // 计算mask位置
	  _getMaskPos:function(pos,axis){
	  	
	  	if(!this.position) {
	  		this.position={};
		  	this.position.screenWidth   =document.documentElement.clientWidth,
		  	this.position.screenHeight  =document.documentElement.clientHeight;
	  	}
	  	// 根据axis设置宽高
	  	
	  	if(axis=='x'){
		  	this._mask.css({
		  		height:this.position.screenHeight
		  	});
	  	}else if(axis=='y'){
	  		this._mask.css({
		  		width:this.position.screenWidth
		  	});
	  	}

	  	// 暴露定位信息
	  	this.position.scrollTop      =document.body.scrollTop,
	  	this.position.scrollLeft     =document.body.scrollLeft,
	  	this.position.offsetTop      =this.element.offset().top,
	  	this.position.offsetLeft     =this.element.offset().left,
	  	this.position.triggerLeft    =this.currentTrigger.offset().left,
	  	this.position.triggerTop     =this.currentTrigger.offset().top,
	  	this.position.triggerHeight  =this.currentTrigger.height(),
	  	this.position.triggerWidth   =this.currentTrigger.width();
	  	var maskWidth=parseInt(this._mask.css("width")),
	  		maskHeight=parseInt(this._mask.css("height"));

	  	// x方向居中，需要偏移可设置offset参数
	  	var x=this.position.scrollLeft-this.position.offsetLeft+this.position.screenWidth/2-maskWidth/2,
	  		y=0;
	  	if(pos=='top'){

	  		y=this.position.scrollTop-this.position.offsetTop-maskHeight/2;
	  	}else if(pos=='bottom'){
	  		y=this.position.scrollTop-this.position.offsetTop+this.position.screenHeight-maskHeight/2;
	  	}else if(pos=='center'){

	  		y=this.position.scrollTop-this.position.offsetTop+this.position.screenHeight/2-maskHeight/2;
	  	}else{
	  		x=this.position.triggerLeft-this.position.offsetLeft+this.position.triggerWidth/2-maskWidth/2;
	  		y=this.position.triggerTop-this.position.offsetTop+this.position.triggerHeight/2-maskHeight/2;
	  	}
	  	return [x,y];
	  	
	  },

	  // mask动画
	  _aniMask:function(duration,offset,ratio){
	  	var self=this;
	  	this._originTransform=this._mask.css("-webkit-transform");

	  	// 计算缩放比例
	  	var scaleX=Math.ceil(this.position.screenWidth/parseInt(this._mask.css("width")))*ratio,
	  		scaleY=Math.ceil(this.position.screenHeight/parseInt(this._mask.css("height")))*ratio;
	  	
	  	setTimeout(function(){
	  		self._mask.css({
		  		'-webkit-transition':'all '+duration+"ms",
		  		'-webkit-transform':'scale('+scaleX+','+scaleY+') '+'skew(0deg,0deg)'
	  		})
	  	},200);
	  }
	});
	
	module.exports = Cover;
	
	// 是否为相对定位
	function isRelative(obj){
		var position=obj.css('position');
		
		if(position==='relative'||position==='fixed'||position==='absolute'){
			return true;
		}
		return false;
	}
	// 取消默认事件
	function preventEvent(evt){
		evt.preventDefault();
	  		
	}
});
