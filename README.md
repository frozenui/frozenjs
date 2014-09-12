# 关于FrozenJS

这里是描述，描述，描述

---



### 调用方式

dialog支持三种不同的调用方式，一般使用`$.dialog(options)`即可，不同的方式配置options后都会直接toggle弹窗。

```js
//最简单的方式，组件会根据默认模板输出dom结构
$.dialog(options);

//通过传入模板字符串的方式
$('<div><%=title%><</div>').dialog(options);

//通过传入css选择器的方式
$("#id").dialog(options);

//常用调用方式
$.dialog({
	title:'温馨提示',
	content:'温馨提示内容',
	callback:function(index){
		alert("你点击了第"+index+"按钮");
	},
	end:function(state){
		alert("弹窗已经："+state);
	}
})

```

### 配置说明



### 快捷使用

#### .dialog('show')

弹出浮层，常用于`$("#id").dialog('show')`

#### .dialog('hide')

弹出浮层，常用于`$("#id").dialog('hide')`


### 模板规则

1. 模板弹出时自动为顶级加上`show`类名，隐藏时自动去掉`show`，所以一般需要通过`show`类名来控制模板的显示隐藏。
1. 模板约定底部按钮的标签必须为`button`
1. 模板约定弹窗窗体需设置属性`data-role='wrapper'`
1. 模板约定需要触发关闭的按钮或元素必须设置属性`data-role='dismiss'`
1. 建议使用默认模板
