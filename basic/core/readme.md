# Core

core包含了frozenJS的一些常用方法，包括zepto的`data`的扩展和模板引擎。

## data

zepto默认代码中并为包含data的扩展，frozenJS中的data扩展主要参照了zepto的[data扩展](https://github.com/madrobby/zepto/blob/master/src/touch.js)。

使用方式参照[zepto的文档](http://zeptojs.com/#data)

## 模板引擎



frozenJS的模板引擎与backbone.js的模板引擎类似，使用`$.tpl(tplString, [data], [settings])`来调用。


模板变量放入`<%= value %>`中，如`<%= value %>`，模板可以直接把js逻辑放入`<% ... %>`中，如`<% if(a){>% 条件为ture，这部分会输出 <%}%>`。

具体调用方式示例：

```js

var data={
	name:"jeakey",
	word:"hi~",
	friend:[
		"hahn",
		"fay"
	]
}
var tplHTML='<div><%=name%> say <%=word%>。</div>'+
			'<div>his friends:<ul>'+
			'<% for(var i=0;i<friend.length;i++){ %>'+
			'<li><%=friend[i]%></li>'+
			'<% } %></ul></div>';
var dest=$.tpl(tplHTML,data);
console.log(dest)
// output：<div>jeakey say hi~。</div><div>his friends:<ul><li>hahn</li><li>fay</li></ul></div>
```
