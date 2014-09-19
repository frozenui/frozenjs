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
		console.log(option)
		this.option=$.extend(defaults,option);
		this.element=$(el);
		this._isFromTpl=isFromTpl;
		this.button=$(el).find('[data-role="button"]');
		this._bindEvent();
		// this.toggle();
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
			console.log(self._isFromTpl)
			self._isFromTpl&&self.element.remove();
		}
	}
	// 禁止冒泡
	function _stopScroll(){
		return false;
	}
	function Plugin(option) {

		var $this= this;
		// 获得配置信息
		var context=$.extend({}, defaults,  typeof option == 'object' && option);

		var isFromTpl=false;
		// 如果传入script标签的选择器
		if($.isArray(this) && this.length && $(this)[0].nodeName.toLowerCase()=="script"){
			// 根据模板获得对象并插入到body中
			$this=$($.tpl(this[0].innerHTML,context)).appendTo("body");
			isFromTpl=true;
		}
		// 如果传入模板字符串
		else if($.isArray(this) && this.length && $this.selector== ""){
			// 根据模板获得对象并插入到body中
			$this=$($.tpl(this[0].outerHTML,context)).appendTo("body");
			isFromTpl=true;
		}
		// 如果通过$.dialog()的方式调用
		else if(!$.isArray(this)){
			// 根据模板获得对象并插入到body中
			$this=$($.tpl(_dialogTpl,context)).appendTo("body");
			isFromTpl=true;
		}


		return $this.each(function () {
			var el = $(this);
			// 读取对象缓存
			var data  = el.data('fz.dialog');
			if (!data) el.data('fz.dialog', 
				(data = new Dialog(this,$.extend({}, defaults,  typeof option == 'object' && option),isFromTpl)
			));
			data.toggle();
			// if (typeof option == 'string') data[option].call($this);
		})
	}
	$.fn.dialog=$.dialog= Plugin;
}(window.Zepto)
	

