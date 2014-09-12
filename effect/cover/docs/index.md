# 基本用法

---

## 使用默认配置

组件配置方法比较简单，默认配置可以达到基本效果

一般情况下，需要为每个trigger配置cover的background，只需要在trigger元素上加上类似 `data-background='#666'` 的data配置即可

然后，需要初始化cover
```javascript
seajs.use(['cover'], function(Cover) {
	
    var cover = new Cover({
    	element:"#cover", 
    	trigger: '.item',
    	dismiss:'.close'
    });
    
});
```

## DEMO演示

````iframe
<!-- CSS -->
<style type="text/css">
.ui-frozen-cover{overflow: hidden}
.item{width:100%;height:100px;}
.close{position:fixed;top:10px;right:10px;display: block;width:50px;height:50px;color:#fff;border:#fff 1px solid; text-align: center;border-radius: 50px;line-height: 50px;display: none;z-index: 2000}
</style>

<!-- HTML -->
<div class="ui-frozen-cover" id="cover">
	<div class="close">关闭</div>
	<div class="item" style="background:#8e2;" data-background="#8e2"></div>
	<div class="item" style="background:#880;" data-background="#880"></div>
	<div class="item" style="background:#4a3;" data-background="#4a3"></div>
	<div class="item" style="background:#099;" data-background="#099"></div>
	<div class="item" style="background:#308;" data-background="#308"></div>
	<div class="item" style="background:#135;" data-background="#135"></div>
	<div class="item" style="background:#509;" data-background="#509"></div>
</div>


<!-- JS -->
<script type="text/javascript">

seajs.use(['cover','$'], function(Cover,$) {
	
    var cover = new Cover({
    	element:"#cover", 
    	trigger: '.item',
    	dismiss:'.close'
    });
    cover.before('shown',function(){
        $('.close').show();
      
    });
    
    cover.after('hide',function(){
    	$('.close').hide();
    })

    
});
</script>
````



