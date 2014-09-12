# 最佳实践

---

## 案例

````iframe
<!-- CSS -->
<style type="text/css">
body{position: absolute;top:0px;left:0px;width: 100%;height:100%;}
.ui-frozen-cover{overflow: hidden;position: absolute;top:0px;left:0px;width: 100%;height:100%;}
.item{width:100%;height:25%;display: -webkit-box;-webkit-box-pack:center; -webkit-box-align:center}
.close{position:fixed;top:10px;right:10px;display: block;width:50px;height:50px;color:#fff;border:#fff 1px solid; text-align: center;border-radius: 50px;line-height: 50px;display: none;z-index: 2000}
.title{color:#fff;display: block;text-align: center;font-size: 24px;-webkit-transition:all .5s .3s;}
.info{color:#fff;display: block;text-align: center;font-size: 12px;-webkit-transition:all .5s;top:50%;width:100%;top:50%;position: absolute;z-index: 2000;opacity: 0;-webkit-transform:translateY(50px);}
.info.show{opacity: 1;-webkit-transform:translateY(0);}
</style>

<!-- HTML -->
<div class="ui-frozen-cover" id="cover" data-widget="cover" data-start-pos="source" data-trigger=".item" data-dismiss=".close">
	<div class="close" >关闭</div>
	<div class="item" style="background:#35a;" data-background="#35a">
		<div class="title">网页重构</div>
	</div>
	<div class="item" style="background:#880;" data-background="#880">
		<div class="title">前端开发</div>
	</div>
	<div class="item" style="background:#4a3;" data-background="#4a3">
		<div class="title">交互设计</div>
	</div>
	<div class="item" style="background:#099;" data-background="#099">
		<div class="title">视觉设计</div>
	</div>
</div>
<div class="text">
	<div class="info">
		<p>全球最牛网页重构</p>
	</div>
	<div class="info">
		<p>全球最牛前端开发</p>
	</div>
	<div class="info">
		<p>全球最牛交互设计</p>
	</div>
	<div class="info">
		<p>全球最牛视觉设计</p>
	</div>

</div>


<!-- JS -->
<script type="text/javascript">
	seajs.use(['widget', '$'], function(Widget, $) {
	    // 使用 autoRenderAll 自动渲染所有页面组件
	    Widget.autoRenderAll(function() {
	        // 使用 query 方法获取到与指定 DOM 节点相关联的 Widget 实例
	        var cover = Widget.query('#cover');

	  		cover.before('show',function(){
	  			if(!cover._isShown){
		  			var title=cover.currentTrigger.find('.title'),
		  				index=$(".item").index(cover.currentTrigger);

		  			title.css({
		  				'-webkit-transform':'translateY('+(cover.position.screenHeight/2-title.offset().top-30)+'px)'
		  			});
		  			$('.info').eq(index).css({
		  				"-webkit-transition-delay":".5s"
		  			})
		  			$('.info').eq(index).addClass('show');
	  			}
	  		});
	  		cover.after('hide',function(){
	  			var title=cover.currentTrigger.find('.title'),
	  				index=$(".item").index(cover.currentTrigger);

	  			title.css({
	  				'-webkit-transform':'translateY(0px)'
	  			})
	  			$('.info').eq(index).css({
		  				"-webkit-transition-delay":"0s"
		  			})
	  			$('.info').eq(index).removeClass('show');
	  		});


	        cover.before('shown',function(){
		    	$('.close').show();
		    });
		    cover.after('hide',function(){
		    	$('.close').hide();
		    });
	        
	    })

	});
</script>
````

