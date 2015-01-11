# Tab

选项卡组件。

## 调用方式

HTML 示意：
```html
<div class="ui-tab">
    <ul class="ui-tab-nav ui-border-b">
        <li class="current">热门推荐</li>
        <li>全部表情</li>
        <li>表情</li>
    </ul>
    <ul class="ui-tab-content" style="width:300%">
        <li class="current">选项1内容</li>
        <li>选项2内容</li>
        <li>选项3内容</li>
    </ul>
</div>

```

这里定义两个概念：wrapper 和 scroller。wrapper 即外层的包含 DOM，如 `div.ui-tab`；scroller 即内部滚动的元素，如 `ul.ui-tab-content`。组件初始化的时候需要传入 `wrapper ('.ui-tab')`。实际滚动的是内部的 `scroller ('.ui-tab-content')`。

组件会自动为 `ui-tab-nav` 和 `ui-tab-content` 内的 li 元素添加 `current` 类。


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
	tab.on('scrollEnd', function(curPage) {
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
<div class="ui-tab">
    <ul class="ui-tab-nav ui-border-b">
        <li class="current">热门推荐</li>
        <li>全部表情</li>
        <li>表情</li>
    </ul>
    <ul class="ui-tab-content" style="width:300%">
        <li class="current"><p>内容</p><p>内容</p><p>内容</p><p>内容</p></li>
        <li><p>内容</p><p>内容</p><p>内容</p><p>内容</p><p>内容</p><p>内容</p><p>内容</p><p>内容</p><p>内容</p><p>内容</p><p>内容</p><p>内容</p><p>内容</p><p>内容</p><p>内容</p><p>内容</p><p>内容</p><p>内容</p><p>内容</p><p>内容</p><p>内容</p><p>内容</p><p>内容</p><p>内容</p><p>内容</p><p>内容</p><p>内容</p><p>内容</p><p>内容</p><p>内容</p><p>内容</p><p>内容</p><p>内容</p><p>内容</p><p>内容</p><p>内容</p><p>内容</p><p>内容</p><p>内容</p></li>
        <li><p>内容</p><p>内容</p></li>
    </ul>
</div>


<!-- js -->
<script>
(function() {
	
	var tab = new fz.Scroll('.ui-tab', {
		role: 'tab',
		autoplay: true,
		interval: 3000
	});

	tab.on('beforeScrollStart', function(from, to) {
		console.log(from, to);
	});

	tab.on('scrollEnd', function(curPage) {
		console.log(curPage);
	});

})();
</script>
```