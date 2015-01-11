# Slider

轮播组件，主要使用场景有网页中的运营广告 Banner。

## 调用方式

HTML 示意：
```html
<div class="ui-slider">
    <ul class="ui-slider-content" style="width: 300%">
        <li class="current"><span style="background-image:url(http://placehold.sinaapp.com/?640*200)"></span></li>
        <li><span style="background-image:url(http://placehold.sinaapp.com//?640*200)"></span></li>
        <li><span style="background-image:url(http://placehold.sinaapp.com//?640*200)"></span></li>
    </ul>
</div>
```

这里定义两个概念：wrapper 和 scroller。wrapper 即外层的包含 DOM，如 `div.ui-slider`；scroller 即内部滚动的元素，如 `ul.ui-slider-content`。组件初始化的时候需要传入 `wrapper ('.ui-slider')`。实际滚动的是内部的 `scroller ('.ui-slider-content')`。小圆点指示器会自动生成（`ul.ui-slider-indicators`）。目前对类名有要求，未来将支持自定义类名。

组件会自动为 `ui-slider-content`、`ui-slider-indicators` 内的 li 元素添加 `current` 类。


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
	slider.on('scrollEnd', function(cruPage) {
		// curPage 当前页
	});

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
		<td>2000ms</td>
		<td>自动播放间隔时间</td>
	</tr>
	<tr>
		<td>duration</td>
		<td>int</td>
		<td>300ms</td>
		<td>切换动画过渡时间</td>
	</tr>
	<tr>
		<td>bounce</td>
		<td>boolean</td>
		<td>true</td>
		<td>反弹动画</td>
	</tr>
	<tr>
		<td>beforeScrollStart</td>
		<td>function</td>
		<td>function(){}</td>
		<td>滑动开始前调用（参数：来源页from、切换页to）</td>
	</tr>
	<tr>
		<td>scrollEnd</td>
		<td>function</td>
		<td>function(){}</td>
		<td>滑动结束时调用（参数：当前页 curPage）</td>
	</tr>
	<tr>
		<td>enable()</td>
		<td>function</td>
		<td>-</td>
		<td>全局开关，开启滚动</td>
	</tr>
	<tr>
		<td>disable()</td>
		<td>function</td>
		<td>-</td>
		<td>全局开关，禁止滚动</td>
	</tr>
	<tr>
		<td>refresh()</td>
		<td>function</td>
		<td>-</td>
		<td>刷新当前位置</td>
	</tr>
	<tr>
		<td>destroy()</td>
		<td>function</td>
		<td>-</td>
		<td>销毁对象</td>
	</tr>
</table>



## DEMO演示

```iframe
<!-- html -->
<div class="ui-slider">
    <ul class="ui-slider-content" style="width: 300%">
        <li><span style="background-image:url(http://placehold.sinaapp.com/?640*200)"></span></li>
        <li><span style="background-image:url(http://placehold.sinaapp.com//?640*200)"></span></li>      
        <li><span style="background-image:url(http://placehold.sinaapp.com//?640*200)"></span></li>
    </ul>
</div>


<!-- js -->
<script>
(function(){
	
	var slider = new fz.Scroll('.ui-slider', {
		role: 'slider',
		indicator: true,
		autoplay: true,
		interval: 3000
	});

	slider.on('beforeScrollStart', function(from, to) {
		console.log(from, to);
	});

	slider.on('scrollEnd', function(cruPage) {
		console.log(curPage);
	});

})();
</script>
```
