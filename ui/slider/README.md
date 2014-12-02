# Slider

轮播组件，主要使用场景有网页中的运营广告。

## 调用方式

HTML 示意：
```html
<div class="ui-slider">
	<ul class="ui-slider-content">
		<li>热门推荐</li>
        <li>限时免费</li>
        <li>全部表情</li>
    </ul>
    <ul class="ui-slider-indicators">
    	<li class="current">1</li>
    	<li>2</li>
    	<li>3</li>
    </ul>
</div>
```

组件初始化的时候需要传入 `wrapper ('.ui-slider')`。实际滚动的是内部的 `scroller ('.ui-slider-content')`。因为样式结合了 Frozen UI，所以类名固定。如需其它样式可自行覆盖。

```js
window.addEventListener('load', function(){
	
	var slider = new Scroll('.ui-slider', {
		role: 'slider',
		indicator: true,
		autoplay: true,
		interval: 3000
	});

	/* 滑动开始前 */
	slider.on('slideStart', function() {
	})

	/* 滑动结束 */
	slider.on('slideEnd', function() {
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
		<td>role</td>
		<td>string</td>
		<td>''</td>
		<td>角色(slider、tab)</td>
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
		<td>slideStart</td>
		<td>function</td>
		<td>function(){}</td>
		<td>滑动开始前调用</td>
	</tr>
	<tr>
		<td>slideEnd</td>
		<td>function</td>
		<td>function(){}</td>
		<td>滑动结束时调用</td>
	</tr>
</table>



## DEMO演示

```iframe
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


<div class="ui-slider">
	<ul class="ui-slider-content">
		<li>热门推荐</li>
        <li>限时免费</li>
        <li>全部表情</li>
    </ul>
    <ul class="ui-slider-indicators">
    	<li class="current">1</li>
    	<li>2</li>
    	<li>3</li>
    </ul>
</div>


<script>
window.addEventListener('load', function(){
	
	var myScroll = new Scroll('.ui-slider', {
		role: 'slider',
		indicator: true,
		autoplay: true,
		interval: 3000
	});

	myScroll.on('slideStart', function() {
		console.log('start')
	});

	myScroll.on('slideEnd', function() {
		console.log('end')
	});
})
</script>
```
