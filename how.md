# 如何使用

---

## 直接引用

使用FrozenJS需引入zepto.js、frozen.js、frozenUI。

如果要使用特效组件，需要引入相应的特效组件的js。

直接引用可以使用手机QQ的离线包，可以大幅提升加载速度。

```html
<script type="text/javascript" src="zepto.js"></script>
<script type="text/javascript" src="frozen.js"></script>
<!-- 特效组件 -->
<script type="text/javascript" src="effect.cover.js"></script>
<link rel="stylesheet" type="text/css" href="basic.css">
```

## github

你也可以去github上查看和下载FrozenJS的代码。任何建议也可以再github上给我们反馈。

[github地址](https://github.com/frozenui/frozenjs)

## 调用方式

FrozenJS的调用方式很简单，跟熟知的jQuery插件很相似，比如dialog的调用：

```iframe
<div class="ui-center">
    <div class="ui-btn" id="btn1">点击打开弹窗</div>
</div>
<script type="text/javascript">
$("#btn1").tap(function(){
	$.dialog({
	    title:'温馨提示',
	    content:'温馨提示内容',
	    button:["确认","取消"],
	    callback:function(type,index){
	        console.log("type:"+type+";index:"+index);
	    }
	})
})
</script>
```