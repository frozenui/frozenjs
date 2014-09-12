# DATA属性

---

## 用法

data属性会自动转换为cover的配置，不过会做下转换，将`data-xxx-xxx`转换为`xxxXxx`

### 设置element元素data值

设置element元素的data值相当于对cover进行全局配置。

### 设置trigger元素的data值

可以方便为每个trigger元素配置不同的触发动画

### 自动渲染

可以通过配置`data-widget`自动通过`data-attr`来渲染cover，具体请查看示例

## 示例

````iframe
<!-- CSS -->
<style type="text/css">
.ui-frozen-cover{overflow: hidden}
.item{width:100%;height:100px;}
.close{position:fixed;top:10px;right:10px;display: block;width:50px;height:50px;color:#fff;border:#fff 1px solid; text-align: center;border-radius: 50px;line-height: 50px;display: none;z-index: 2000}

</style>

<!-- HTML -->
<div class="ui-frozen-cover" id="cover" data-widget="cover" 
	data-startPos="source" data-trigger=".item" data-dismiss=".close">
	<div class="close" >关闭</div>
	<div class="item" style="background:#8e2;" data-background="#8e2" 
		data-start-pos="center" data-expandAxis="xy" data-shape="round"></div>
	<div class="item" style="background:#8e2;" data-background="#8e2" 
		data-start-pos="center" data-expandAxis="xy" data-shape="round"></div>
	<div class="item" style="background:#8e2;" data-background="#8e2" 
		data-start-pos="center" data-expandAxis="xy" data-shape="round"></div>
	<div class="item" style="background:#8e2;" data-background="#8e2" 
		data-start-pos="center" data-expandAxis="xy" data-shape="round"></div>
	<div class="item" style="background:#8e2;" data-background="#8e2" 
		data-start-pos="center" data-expandAxis="xy" data-shape="round"></div>
	
</div>


<!-- JS -->
<script type="text/javascript">
	seajs.use(['widget', '$'], function(Widget, $) {
	    // 使用 autoRenderAll 自动渲染所有页面组件
	    Widget.autoRenderAll(function() {
	        // 使用 query 方法获取到与指定 DOM 节点相关联的 Widget 实例
	        var cover = Widget.query('#cover');
	        cover.before('shown',function(){
		    	$('.close').show();
		    });
		    cover.after('hide',function(){
		    	$('.close').hide();
		    })
	        
	    })

	});
</script>
````

