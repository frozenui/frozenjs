# Tap

Zepto 默认未包含 touch.js，而且 Zepto 中 touch 模块的 tap 实现并不完美，会出现`点透`的 bug。除了 Zepto 的 touch 模块，还可以用 [fastclick](https://github.com/ftlabs/fastclick) 来实现，但 fastclick 代码量较大。

FrozenJS 中 tap 使用精简的代码解决了 Zepto 中 touch 模块的`点透`的 bug。

使用示例：

```js
// 使用on/bind等 Zepto 的事件绑定方法来绑定。
$(".tap-element").on("tap",function(){
	
});

// 快捷使用方法，类似click
$(".tap-element").tap(function(){
	
});
```