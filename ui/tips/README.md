# Tips

## 调用方式

tips支持三种不同的调用方式，一般使用`$.tips(options)`即可。



```js
//最简单的方式，组件会根据默认模板输出dom结构
$.tips(options);

//通过传入模板字符串的方式
$('<div><%=content%><</div>').tips(options);

//通过传入css选择器的方式
$("#id").tips(options);


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
		<td>''</td>
		<td>提示内容，用来填充模板</td>
	</tr>
	<tr>
		<td>stayTime</td>
		<td>int</td>
		<td>1000</td>
		<td>提示停留时间，过了这个时间自动隐藏，设置0则不自动隐藏</td>
	</tr>
	
	<tr>
		<td>type</td>
		<td>string</td>
		<td>'info'</td>
		<td>提示类型，可选info|warn|success</td>
	</tr>
	
	<tr>
		<td>callback</td>
		<td>funtion</td>
		<td>function(){}</td>
		<td>回调函数，第一个参数指示回调类型，目前有两种show|hide</td>
	</tr>
	


</table>





## DEMO演示
```iframe
 <div class="ui-center">

    <div class="ui-btn" id="btn1">弹出提示</div>
  
   
</div>

<script type="text/javascript">
var el;
$("#btn1").tap(function(){
	el=$.tips({
	    content:'温馨提示内容',
	    stayTime:2000,
	    type:"success"
	})
	el.on("tips:hide",function(){
		console.log("tips hide");
	})
	
});



</script>
```
