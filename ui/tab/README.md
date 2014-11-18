# Tab

## 介绍

选项卡组件，主要使用场景有单页承载多内容。scroller、tab、slider 组件皆使用 Slide.js，源码修改自 IScroll。下载地址：https://github.com/hahnzhu/slide.js

## 调用方式

HTML 示意：
```html
<div class="ui-tab">
	<ul class="ui-tab-nav">
    	<li class="current">选项1</li>
    	<li>选项2</li>
    	<li>选项3</li>
    </ul>
	<ul class="ui-tab-content">
		<li>热门推荐</li>
        <li>限时免费</li>
        <li>全部表情</li>
    </ul>
</div>

```

组件初始化的时候需要传入 wrapper ('.ui-tab')。实际滚动的是内部的 scroller ('.ui-tab-content')。因为样式结合了 Frozen UI，所以类名固定。如需其它样式可自行覆盖。

```js
window.addEventListener('load', function(){
	
	var slider = new Slide('.ui-slider', {
		role: 'tab',
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

<table>
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
	.ui-tabs { width: 100%; overflow: hidden;}
	.ui-tab-nav {height: 44px;line-height: 44px;display: -webkit-box;display: box;font-size: 16px;}
	.ui-tab-nav li {min-width: 70px;-webkit-box-flex: 1;box-flex: 1;text-align: center;color: #808080;}
	.ui-tab-nav li.current {color: #00a5e0;border-bottom: 3px #00a5e0 solid;}
	
	.ui-tab-content {white-space:nowrap;font-size:0;}
	.ui-tab-content li:nth-child(1) {background-color: #ff8c81;}
	.ui-tab-content li:nth-child(2) {background-color: #00c7fc;}
	.ui-tab-content li:nth-child(3) {background-color: #77bb3f;}
	.ui-tab-content li {display:inline-block;width:100%;height:200px;color:#fff;font-size:14px;}
</style>

<div class="ui-tabs">
	<ul class="ui-tab-nav">
    	<li class="current">选项卡1</li>
    	<li>选项卡2</li>
    	<li>选项卡3</li>
    </ul>
	<ul class="ui-tab-content">
		<li>热门推荐</li>
        <li>限时免费</li>
        <li>全部表情</li>
    </ul>
</div>

<script>
window.addEventListener('load', function(){
	
	var myScroll = new Slide('.ui-tabs', {
		role: 'tab',
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