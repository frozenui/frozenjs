# Slider

轮播组件，主要使用场景有网页中的运营广告 Banner。

## 调用方式

HTML 示意：
```html
<div class="ui-slider">
	<ul class="ui-slider-content">
		<li class="current">热门推荐</li>
        <li>限时免费</li>
        <li>全部表情</li>
    </ul>
</div>
```

这里定义两个概念：wrapper 和 scroller。wrapper 即外层的包含 DOM，如 `div.ui-slider`；scroller 即内部滚动的元素，如 `ul.ui-slider-content`。组件初始化的时候需要传入 `wrapper ('.ui-slider')`。实际滚动的是内部的 `scroller ('.ui-slider-content')`。小圆点指示器会自动生成。目前对类名有要求，未来将支持自定义类名。

JS 示意：

```js
window.addEventListener('load', function(){
	
	/* fz 即 FrozenJS 的意思 */
	var slider = new fz.Scroll('.ui-slider', {
		role: 'slider',
		indicator: true,
		autoplay: true,
		interval: 3000
	});

	/* 滑动开始前 */
	slider.on('beforeScrollStart', function(from, to) {
		// from 为当前页，to 为下一页
	})

	/* 滑动结束 */
	slider.on('scrollEnd', function() {
	})

})
</script>
```


## 配置说明

<table width="100%">
	<tr>
		<th>name</th>
		<th>type</th>
		<th>default</th>
		<th>description</th>
	</tr>
	<tr>
		<td>indicator</td>
		<td>boolean</td>
		<td>true</td>
		<td>指示点</td>
	</tr>
	<tr>
		<td>autopaly</td>
		<td>boolean</td>
		<td>false</td>
		<td>自动播放</td>
	</tr>
	<tr>
		<td>interval</td>
		<td>int</td>
		<td>2000</td>
		<td>自动播放间隔时间</td>
	</tr>
	<tr>
		<td>beforeScrollStart</td>
		<td>function</td>
		<td>function(){}</td>
		<td>滑动开始前调用</td>
	</tr>
	<tr>
		<td>scrollEnd</td>
		<td>function</td>
		<td>function(){}</td>
		<td>滑动结束时调用</td>
	</tr>
</table>



## DEMO演示

```iframe
<!-- css -->
<style>
	.ui-slider {overflow:hidden;position:relative;}
	.ui-slider-content {height:200px;white-space:nowrap;font-size:0;}
	.ui-slider-content li:nth-child(1) {background-color: #ff8c81;}
	.ui-slider-content li:nth-child(2) {background-color: #00c7fc;}
	.ui-slider-content li:nth-child(3) {background-color: #77bb3f;}
	.ui-slider-content li {display:inline-block;width:100%;height:200px;color:#fff;font-size:14px;}
	
	.ui-slider-indicators {position:absolute;bottom:0;right:10px;}
	.ui-slider-indicators li {display:inline-block;text-indent:100%;white-space:nowrap;overflow:hidden;width:6px;height:6px;background-color:rgba(255,255,255,0.3);border-radius:10px;}
	.ui-slider-indicators li.current {background-color:rgba(255,255,255,1);}
</style>


<!-- html -->
<div class="ui-slider">
	<ul class="ui-slider-content">
		<li>热门推荐</li>
        <li>限时免费</li>
        <li>全部表情</li>
    </ul>
</div>


<!-- js -->
<script>
window.addEventListener('load', function(){
	
	var slider = new fz.Scroll('.ui-slider', {
		role: 'slider',
		indicator: true,
		autoplay: true,
		interval: 3000
	});

	slider.on('beforeScrollStart', function(from, to) {
		console.log(from, to);
	});

	slider.on('scrollEnd', function() {
	});
})
</script>
```
