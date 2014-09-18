# Dialog

---

## 调用方式

dialog支持三种不同的调用方式，一般使用`$.dialog(options)`即可，不同的方式配置options后都会直接toggle弹窗。



```js
//最简单的方式，组件会根据默认模板输出dom结构
$.dialog(options);

//通过传入模板字符串的方式
$('<div><%=title%><</div>').dialog(options);

//通过传入css选择器的方式
$("#id").dialog(options);


```


## 配置说明

<table>
	<tr>
		<th>name</th>
		<th>type</th>
		<th>default</th>
		<th>description</th>
	</tr>
	<tr>
		<td>title</td>
		<td>string</td>
		<td>''</td>
		<td>浮层标题，用来填充模板</td>
	</tr>
	<tr>
		<td>content</td>
		<td>string</td>
		<td>''</td>
		<td>浮层内容，用来填充模板</td>
	</tr>
	<tr>
		<td>button</td>
		<td>array</td>
		<td>['确认']</td>
		<td>浮层底部按钮的文字数组，建议不超过两个，与callback的index相互对应</td>
	</tr>
	<tr>
		<td>select</td>
		<td>int</td>
		<td>0</td>
		<td>需要高亮的按钮索引（与button相互对应），高亮的按钮会添加类名`select`</td>
	</tr>
	<tr>
		<td>allowScroll</td>
		<td>bool</td>
		<td>false</td>
		<td>弹窗弹出后是否允许页面滚动</td>
	</tr>
	<tr>
		<td>callback</td>
		<td>funtion</td>
		<td>function(){}</td>
		<td>点击底部按钮后的回调函数，可以通过函数的第一个参数来获取点击的按钮索引（与button对应）</td>
	</tr>
	<tr>
		<td>animation</td>
		<td>string</td>
		<td>'pop'</td>
		<td>弹窗弹出的动画类名，会自动为弹窗外层加上该类名</td>
	</tr>
	<tr>
		<td>end</td>
		<td>function</td>
		<td>function(){}</td>
		<td>弹窗弹出后或者消失后的回调，可以通过函数第一个参数来获取状态（'show'为弹出后，'hide'为消失后）</td>
	</tr>


</table>



## 模板规则

1. 模板弹出时自动为顶级加上`show`类名，隐藏时自动去掉`show`，所以一般需要通过`show`类名来控制模板的显示隐藏。
1. 模板约定底部按钮的标签必须设置属性`data-role='button'`
1. 模板约定需要触发关闭的按钮或元素必须设置属性`data-role='dismiss'`
1. 建议使用默认模板

## DEMO演示
```iframe
 <div class="ui-center">

    <div class="ui-btn" id="btn1">模板创建弹窗</div>
    <div class="ui-btn" id="btn2">DOM创建弹窗</div>
</div>
<div class="ui-dialog">
    <div class="ui-dialog-cnt">
        <div class="ui-dialog-bd">
            <div>
            <h4>标题</h4>
            <div>内容</div></div>
        </div>
        <div class="ui-dialog-ft ui-btn-group">
            <button type="button" data-role="button"  class="select" id="dialogButton<%=i%>">关闭</button> 
		</div>
    </div>        
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
$("#btn2").tap(function(){
	$(".ui-dialog").dialog();

})

</script>
```
