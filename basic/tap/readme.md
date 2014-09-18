# Tap

---

> zepto默认未包含touch，而且zepto中touch模块的tap实现并不完美，会出现`点透`的bug。

> 除了zepto的touch模块，还可以用[fastclick](https://github.com/ftlabs/fastclick)来实现，但fastclick代码量较大。

> frozenJS中tap使用精简的代码解决了zepto中touch模块的`点透`的bug。

使用示例：

```js
// 使用on/bind等zepto的事件绑定方法来绑定。
$(".tap-element").on("tap",function(){
	
});

// 快捷使用方法，类似click
$(".tap-element").tap(function(){
	
});
```