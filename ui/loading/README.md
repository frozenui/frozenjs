# Loading

## 调用方式

tips支持三种不同的调用方式，一般使用`$.tips(options)`即可。



```js
//最简单的方式，组件会根据默认模板输出dom结构
$.loading(options);

//通过传入模板字符串的方式
$('<div><%=content%><</div>').loading(options);

//通过传入css选择器的方式
$("#id").loading(options);


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
		<td>content</td>
		<td>string</td>
		<td>'加载中...'</td>
		<td>提示内容，用来填充模板</td>
	</tr>
</table>





## DEMO演示
```iframe
 <div class="ui-center">

    <div class="ui-btn" id="btn1">弹出loading</div>
  
   
</div>

<script type="text/javascript">
$("#btn1").tap(function(){
	var el=$.loading({
	    content:'加载中...',
	})
	setTimeout(function(){
		el.loading("hide");
	},2000);
	el.on("loading:hide",function(){
		console.log("loading hide");
	});

});



</script>
```
