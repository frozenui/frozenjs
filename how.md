# 如何使用

## 直接引用

使用 FrozenJS 需引入 zepto.js、frozen.js、frozenUI。

如果要使用特效组件，需要引入相应的特效组件的 js。

直接引用可以使用手机 QQ 的离线包，可以大幅提升加载速度。

```html
<script type="text/javascript" src="http://i.gtimg.cn/vipstyle/frozenjs/lib/zepto.min.js"></script>
<script type="text/javascript" src="http://i.gtimg.cn/vipstyle/frozenjs/1.0.0/frozen.js"></script>
<!-- 特效组件 -->
<script type="text/javascript" src="http://i.gtimg.cn/vipstyle/frozenjs/1.0.0/effect.cover.js"></script>
<link rel="stylesheet" type="text/css" href="http://i.gtimg.cn/vipstyle/frozenui/1.0.0/css/basic.css?_bid=256">
```

## GitHub

你也可以去 GitHub 上查看和下载 FrozenJS 的代码。任何建议也可以在 GitHub 上给我们反馈：[FrozenJS](https://github.com/frozenui/frozenjs)。

## 调用方式

FrozenJS 的调用方式很简单，跟熟知的 jQuery 插件很相似，比如 dialog 的调用：

```js
<!-- 使用默认模版 -->
$.dialog({
    title:'温馨提示',
    content:'温馨提示内容',
    button:["确认","取消"]
})

<!-- 使用选择器 -->
$("#dialog").dialog();

<!-- 使用选择器 -->
$("<div><%=content%></div>").dialog({
    content:'温馨提示内容'
})

```