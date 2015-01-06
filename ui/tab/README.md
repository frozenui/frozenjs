# Tab

选项卡组件。

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
		<li>选项1内容</li>
        <li>选项2内容</li>
        <li>选项3内容</li>
    </ul>
</div>

```

这里定义两个概念：wrapper 和 scroller。wrapper 即外层的包含 DOM，如 `div.ui-tab`；scroller 即内部滚动的元素，如 `ul.ui-tab-content`。组件初始化的时候需要传入 `wrapper ('.ui-tab')`。实际滚动的是内部的 `scroller ('.ui-tab-content')`。


JS 代码示意：
```js
window.addEventListener('load', function(){
	
	var tab = new fz.Scroll('.ui-tab', {
		role: 'tab',
		autoplay: true,
		interval: 3000
	});

	/* 滑动开始前 */
	tab.on('beforeScrollStart', function(from, to) {
		// from 为当前页，to 为下一页
	})

	/* 滑动结束 */
	tab.on('scrollEnd', function() {
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
	.ui-tabs { width:100%;overflow:hidden;}
	.ui-tab-nav {height:44px;line-height:44px;display:-webkit-box;display:box;font-size:16px;}
	.ui-tab-nav li {min-width:70px;-webkit-box-flex:1;box-flex:1;text-align:center;color:#808080;}
	.ui-tab-nav li.current {color:#00a5e0;border-bottom:3px #00a5e0 solid;}
	
	.ui-tab-content {white-space:nowrap;font-size:0;}
	.ui-tab-content li:nth-child(1) {background-color: #ff8c81;}
	.ui-tab-content li:nth-child(2) {background-color: #00c7fc;}
	.ui-tab-content li:nth-child(3) {background-color: #77bb3f;}
	.ui-tab-content li {display:inline-block;width:100%;height:200px;color:#fff;font-size:14px;}
</style>

<!-- html -->
<div class="ui-tabs">
	<ul class="ui-tab-nav">
    	<li class="current">选项卡1</li>
    	<li>选项卡2</li>
    	<li>选项卡3</li>
    </ul>
	<ul class="ui-tab-content">
		<li class="current">热门推荐</li>
        <li>限时免费</li>
        <li>全部表情</li>
    </ul>
</div>

<!-- js -->
<script>
window.addEventListener('load', function(){
	
	var tab = new fz.Scroll('.ui-tabs', {
		role: 'tab',
		autoplay: true,
		interval: 3000
	});

	tab.on('beforeScrollStart', function(from, to) {
		console.log(from, to)
	});

	tab.on('scrollEnd', function() {
	});
})
</script>
```