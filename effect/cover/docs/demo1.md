# 高级用法

---

## 常用效果配置说明

常用配置主要有 `startPos` `expandAxis` `isFloat` `offset` 具体参数说明参照文档。

可以为每个trigger指定效果，调用`setConfig(config)`即可

## DEMO展示

````iframe
<!-- CSS -->
<style type="text/css">
.ui-frozen-cover{overflow: hidden}
.item,.item2{width:100%;height:100px;}
.close{position:fixed;top:10px;right:10px;display: block;width:50px;height:50px;color:#fff;border:#fff 1px solid; text-align: center;border-radius: 50px;line-height: 50px;display: none;z-index: 2000}
</style>

<!-- HTML -->
<div class="ui-frozen-cover" id="cover" data-start-pos="source">
	<div class="close">关闭</div>
	<div class="item2" style="background:#8e2;" data-background="#8e2"></div>
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
    	trigger:".item",
    	dismiss:'.close'
    });
    $('.item2').on('click',function(){
    	cover.setConfig({
    		trigger:this,
    		startPos:'top',
    		expandAxis:'x',
    		isFloat:true,
    		offset:[-160,0]
    	}).show();
    });
    cover.before('show',function(){
    	var index=$(".item").index(cover.currentTrigger);
    	if(index==0){
    		cover.setConfig({
	    		trigger:cover.currentTrigger,
	    		startPos:'center',
	    		expandAxis:'xy',
	    		isFloat:true,
	    		offset:[0,20]
	    	});
    	}
    	if(index==1){
    		cover.setConfig({
	    		trigger:cover.currentTrigger,
	    		startPos:'bottom',
	    		expandAxis:'y',
	    		isFloat:true,
	    		offset:[100,0]
	    	});
    	}
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

