# Scroller

## 介绍

自然滚动组件，主要的应用场景有 弹窗内长规则、视察滚动动画的内部滚动（竖向滚动），还有应用下载页的介绍缩略图的浏览（水平滚动）。scroller、tab、slider 组件皆使用 Slide.js，源码修改自 IScroll。下载地址：https://github.com/hahnzhu/slide.js

## 调用方式

HTML 示意：
```html
<div class="ui-scroller">
	<ul>
		<li></li>
		<li></li>
		<li></li>
	</ul>
</div>
```

组件初始化的时候需要传入 wrapper ('.ui-scroller')，类名无限制。实际滚动的是内部的 scroller (&lt;ul&gt;)。

调用方式相对简单。需要注意的是：

1、scroller 的宽/高必须大于 wrapper 的宽/高才能发生滚动

2、若要水平滚动，则 scrollY: false



```js
var scroller = new Slide('.ui-scroller', {
/* 竖直滚动 */
	scrollY: true
});

/* 水平滚动 */
var scroller = new Slide('.ui-scroller', {
	scrollY: false,
	scrollX: true
});
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
		<td>scrollX</td>
		<td>boolean</td>
		<td>false</td>
		<td>水平滚动</td>
	</tr>
	<tr>
		<td>scrollY</td>
		<td>boolean</td>
		<td>true</td>
		<td>竖直滚动</td>
	</tr>
</table>



## DEMO演示
```iframe
<div class="ui-scroller" style="width:auto;height: 300px;margin:20px;padding:10px;overflow:hidden;-box-sizing:border-box;box-sizing:border-box;border:1px solid #ccc;">
	<ul>
		<li>1、活动时间：2014.09.25 - 2014.10.31</li>
		<li>2、活动面向“预付费（Q点Q币、QQ卡、财付通/银行卡）开通超级QQ”的用户。以下支付方式的用户不 在本次活动范围内，“同时开通预付费超级QQ和短信版超级QQ”、“同时开通预付费超级QQ与短信版 会员”、“同时开通预付费超级QQ与iOS会员”、“开通短信版超级QQ”及“宽带/固定电话/超级/”（相关活动可留意超级QQ官网消息）。</li>
		<li>3、活动中，成长值的转移规则：① QQ会员成长值 = 超级QQ成长值 -（超级QQ成长值/超级QQ成长速度）*（超级QQ成长速度 - 同条件下会员成长速度）② 若您在转移前同时开通了超级QQ和QQ会员，转移后会员成长值在上述成长值（超Q转换而来）与原会员成长值间取较高者。较低部分，转换成等值的QQ会员加倍成长卡赠送给您。</li>
		<li>4、活动时间：2014.09.25 - 2014.10.311、活动间2014.09.25 - 2014.10.31、活动时间：  2014.09.25 -  活动时间活动时间活动时间  </li>
	</ul>
</div>

<script>
window.addEventListener('load', function(){
	
	var myScroll = new Slide('.ui-scroller', {
		scrollY: true
	});
	
})
</script>
```


