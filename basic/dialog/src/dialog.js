/**
 * User: jeakeyliang
 * Date: 14-08-22
 * Time: 下午9:20
 */

!function($){

	// 默认模板
	var _dialogTpl='<div class="ui-dialog">'+
        '<div class="ui-dialog-cnt" data-role="wrapper">'+
            '<div class="ui-dialog-bd">'+
                '<div>'+
                '<h4><%=title%></h4>'+
                '<div><%=content%></div></div>'+
            '</div>'+
            '<div class="ui-dialog-ft ui-btn-group">'+
            	'<% for (var i = 0; i < button.length; i++) { %>' +
				'<% if (i == select) { %>' +
				'<button type="button" data-role="dismiss" class="select" id="dialogButton<%=i%>"><%=button[i]%></button>' +
				'<% } else { %>' +
				'<button type="button" data-role="dismiss" id="dialogButton<%=i%>"><%=button[i]%></div>' +
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
		callback:function(){},
		animation:'pop',
		end:function(){}
	}
	// 构造函数
	var Dialog   = function (el,option) {
		this.option=$.extend(defaults,option);
		this.element=$(el);

		this.dismiss=$(el).find('[data-role="dismiss"]');
		this.wrapper=$(el).find('[data-role="wrapper"]');

		
		this.button=$(el).find("button");
		this._isFromTpl=false;
		if($(el).closest($("body")).size()<=0){
			this._isFromTpl=true;
			this.element=$(el).appendTo($("body"));
		}
		this.bind();
		this.toggle();

	}
	Dialog.role='dialog';
	Dialog.prototype={
		version:"1.0.0",

		bind:function(){
			var self=this;
			self.dismiss.on("tap",function(){
				self.hide.apply(self);
			});
			self.button.on("tap",function(){
				var index=$(self.button).index($(this));
				self.option.callback(index)
			})

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
			self.element.addClass("show");

			setTimeout(function(){
				self.element.addClass(self.option.animation);
				if(parseFloat(self.wrapper.css("-webkit-transition-duration"))==0){
					self.option.end('show');
				}
				self.element.one('webkitTransitionEnd',function(){
					self.option.end('show');	
				});
			},10);
			this.option.allowScroll && self.element.on("touchmove" , _stopScroll);
			
		},
		hide :function () {
			var self=this;
			self.element.off("touchmove" , _stopScroll);
			self.element.removeClass(self.option.animation);
			if(parseFloat(self.wrapper.css("-webkit-transition-duration"))==0){
				self.option.end('hide');
				self.element.removeClass("show");
				self._isFromTpl&&self.element.remove();
			}
			self.element.one('webkitTransitionEnd',function(){
				self.option.end('hide');
				self.element.removeClass("show");
				self._isFromTpl&&self.element.remove();
				
			});
		}
	}
	// 禁止冒泡
	function _stopScroll(){
		return false;
	}
	function Plugin(option) {
		return $.attachObject(this,Dialog,_dialogTpl,$.extend(defaults,option));
	}
	$.fn.dialog=$.dialog= Plugin;
}(window.Zepto)
	

