# 关于FrozenJS


## 什么是FrozenJS

FrozenJS 是针对移动端开发的 js 组件库，其依赖 [zepto.js](http://zeptojs.com) 和 FronzenUI。

FrozenJS 的所有组件均以 zepto 的插件的形式存在。

FrozenJS 包括：

1. basic：FrozenJS 的一些基础功能，包括模板引擎、tap 支持等。
2. ui：主要是一些触屏常用的 UI 组件，包括 dialog 等。
3. effect：非常用的特效库，特殊场景使用到是可以单独调用。

更多文档请查看：http://frozenui.github.io/frozenjs/

## FrozenJS 能做什么

FrozenJS 针对移动端而生，可以处理大部分移动端的UI呈现。而且还可以满足某些特殊场景的特效展示。

## FrozenJS 的特点

1. 体积小，js 只依赖 zepto。
2. 调用简单。
3. 可移植性强（支持模块化与非模块化调用方式）

## FrozenJS 的理念

1. 为移动而生
2. 轻量，可复用可扩展

## FrozenJS 的基本调用方式

### 非模块化方式

引用js
```javascript
<script src="http://i.gtimg.cn/vipstyle/frozenjs/lib/zepto.min.js?_bid=304"></script>
<script src="http://i.gtimg.cn/vipstyle/frozenjs/1.0.0/frozen.js?_bid=304"></script>
```
js调用
```javascript
var myDialog=$.dialog({
	title:"温馨提示",
	content:'温馨提示内容',
	button:["确认","取消"]
})
myDialog.on("dialog:hide",function(e){
	// To do sth when dialog hide
})
```




### 模块化方式

引用js
```javascript
<script src="http://i.gtimg.cn/vipstyle/frozenjs/lib/sea.js?_bid=304"></script>
```
js调用
```javascript
seajs.config({
	alias:{
		"zepto":"http://i.gtimg.cn/vipstyle/frozenjs/lib/zepto.min.js?_bid=304",
		"frozen":"http://i.gtimg.cn/vipstyle/frozenjs/1.0.0/frozen.js?_bid=304"
	}
});
seajs.use(["zepto","frozen"],function(z,fz){
	var $=z;
	var myDialog=$.dialog({
		title:"温馨提示",
		content:'温馨提示内容',
		button:["确认","取消"]
	})
	myDialog.on("dialog:hide",function(e){
		// To do sth when dialog hide
	})
})
```
这里对 zepto 进行了模块化操作，建议引用 http://i.gtimg.cn/vipstyle/frozenjs/lib/zepto.min.js?_bid=304

若还是想要引用自己项目的zepto，请通过以下方式对zepto进行模块化：
```javascript
window.Zepto = Zepto
window.$ === undefined && (window.$ = Zepto)

// exports to module
if($.isFunction(window.define)) {
    define(function(require, exports, module) {
        module.exports = window.Zepto
    })
}
```

## FrozenJS 的维护与开发

FrozenJS 通过 grunt 来管理，首先应确保 grunt 的运行环境，可参照 https://github.com/QQVIPTeam/team/issues/5

`grunt`：合并压缩代码

`grunt docs`：文档生成与调试

使用 `grunt docs` 会将文档生成到 `_site` 目录，提交当前目录到 https://github.com/frozenui/baseui.git

`_site` 目录下的内容提交到 `gh-pages` 分支，参考 https://github.com/frozenui/baseui/issues/2

页面会显示在 frozen 的 js 组件菜单项中 http://frozenui.github.io/frozenjs/