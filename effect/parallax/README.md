# Parallax

---

Parallax 滚动视差动画组件，提供基础滑动、事件回调及内置动画支持。


### 一、使用

#### 1、HTML ####

```html

<!-- 这里的每个标签和每个类都是必须的 -->
<div class="wrapper">
	<div class="pages">
		
		<!-- 第一屏 -->
		<div class="page">
		   	<!-- anything you want.... -->
		</div>
	
		<!-- 第二屏 -->
		<div class="page">
		</div>
	
		<!-- 第三屏 -->
		<div class="page">
		</div>

		...

	</div>
</div>
```

CSS 引用：
```css
<style rel="stylesheet" href="{your path}/parallax.css"></style>

/* 如果需要使用内置动画，需要引用下面的内容 */
<style rel="stylesheet" href="{your path}/parallax-animation.css"></style>
```

JS 引用：
```js
<script src="{your path}/zepto.min.js"></script>
<script src="{your path}/parallax.js"></script>
<script>
  $('.pages').parallax();
</script>
```

### 二、定制
```js
<script>

// 下面的都是默认属性
$('.pages').parallax({
	direction: 'vertical', 	// horizontal (水平翻页)
	swipeAnim: 'default', 	// cover (切换效果)
	drag:      true,		// 是否允许拖拽 (若 false 则只有在 touchend 之后才会翻页)
	loading:   false,		// 有无加载页
	indicator: false,		// 有无指示点
	arrow:     false,		// 有无指示箭头
	/*
	 * 翻页后立即执行
	 * {int} 		index: 第几页
	 * {DOMElement} element: 当前页节点
	 * {String}		directation: forward(前翻)、backward(后翻)、stay(保持原页)
	 */
	onchange: function(index, element, direction) {
		// code here...
	},
	/*
	 * 横竖屏检测
	 * {String}		orientation: landscape / protrait
	 */
	orientationchange: function(orientation) {
		
	}

});

</script>
```

#### 具体参数演示
```js
// DEMO1(默认)
<script>
$('.pages').parallax({
	loading:   false,
	indicator: false,
	arrow:     false
});
</script>

// DEMO2
<script>
$('.pages').parallax({
	loading:   true,
	indicator: true,
	arrow:     true
});
</script>

// DEMO3
<script>
$('.pages').parallax({
	direction: 'horizontal',
	loading:   true,
	indicator: true,
	arrow:     true
});
</script>
```

__DEMO1__

![DEMO1](https://raw.githubusercontent.com/hahnzhu/parallax.js/master/assets/gif/demo1.gif)

__DEMO2__

![DEMO2](https://raw.githubusercontent.com/hahnzhu/parallax.js/master/assets/gif/demo2.gif)

__DEMO3__

![DEMO3](https://raw.githubusercontent.com/hahnzhu/parallax.js/master/assets/gif/demo3.gif)


```js
// DEMO4(默认)
<script>
$('.pages').parallax({
	swipeAnim: 'default'
});
</script>

// DEMO5
<script>
$('.pages').parallax({
	swipeAnim: 'cover'
});
</script>
```

__DEMO4__

![DEMO4](https://raw.githubusercontent.com/hahnzhu/parallax.js/master/assets/gif/demo4.gif)

__DEMO5__

![DEMO5](https://raw.githubusercontent.com/hahnzhu/parallax.js/master/assets/gif/demo5.gif)



### 三、DOM 接口

```html
<div class="wrapper">

	<!-- 初始化后自动添加 direction、swipeAnim、direction 类，其中 direction 在翻页的过程中才会添加。 -->
	<div class="pages vertical/horizontal  default/cover  forward/backward">
		
		<!-- 为 page 添加 data-id，当前 page 会自动添加 current 类(翻页后立即添加) -->
		<section data-id="1" class="current">
			...
		</section>

		<section data-id="2">
			...
		</section>
	</div>
</div>
		
```


### 四、内置动画
有四种内置动画，分别是 `slideToTop/Bottom/Left/Right`、 `fadeInToTop/Bottom/Left/Right`、 `followSlide` 和 `fadeIn/Out`，动画参数可通过 `data-animation`、 `data-duration`、 `data-delay` 和 `data-timing-function` 进行配置。

可看以下实例：

__EXAMPLE__

![EXAMPLE](https://raw.githubusercontent.com/hahnzhu/parallax.js/master/assets/gif/example.gif)

```html
<div class="wrapper">
	<div class="pages">

		<!-- 第一屏 -->
		<section class="page">
			<div class="box1" data-animation="slideToBottom" data-timing-function="ease-in"></div>
			<div class="box2" data-animation="slideToTop" data-delay="300" data-timing-function="ease-out"></div>
			<div class="box3" data-animation="slideToRight" data-delay="600" data-timing-function="linear"></div>
			<div class="box4" data-animation="slideToLeft" data-delay="900" data-timing-function="cubic-bezier(.12,.73,.62,1.38)"></div>
		</section>

        <!-- 第二屏 -->
		<section class="page">
			<div class="box1" data-animation="followSlide" data-duration="1000"></div>
			<div class="box2" data-animation="followSlide" data-delay="200" data-duration="1000"></div>
			<div class="box3" data-animation="followSlide" data-delay="400" data-duration="1000"></div>
			<div class="box4" data-animation="followSlide" data-delay="600" data-duration="1000"></div>
		</section>

        <!-- 第三屏 -->
		<section class="page">
			<div class="box1" data-animation="fadeInToBottom"></div>
			<div class="box2" data-animation="fadeInToTop" data-delay="200"></div>
			<div class="box3" data-animation="fadeInToLeft" data-delay="400"></div>
			<div class="box4" data-animation="fadeInToRight" data-delay="600"></div>
		</section>

		<!-- 第四屏 -->
		<section class="page">
			<div class="box1" data-animation="fadeIn"></div>
			<div class="box2" data-animation="fadeOut" data-delay="800"></div>
		</section>

	</div>
</div>
```

CSS：
```css
/* custom */
section[data-id="1"] {
	background-color: #3498db;
}
section[data-id="2"] {
	background-color: #40d47e;
}
section[data-id="3"] {
	background-color: #ff8c81;
}
section[data-id="4"] {
	background-color: #3498db;
}
.box1 {
	width: 100px;
	height: 200px;
	background-color: #ecf0f1;
	position: absolute;
	left: 160px; top: 126px;
}
.box2 {
	width: 200px;
	height: 100px;
	background-color: #8e44ad;
	position: absolute;
	left: 60px; top: 226px;
}
.box3 {
	width: 100px;
	height: 100px;
	background-color: #34495e;
	position: absolute;
	left: 160px; top: 226px;
}
.box4 {
	width: 50px;
	height: 50px;
	background-color: #e74c3c;
	position: absolute;
	left: 185px; top: 250px;
}
```

注：followSlide 效果会根据翻页方向的不同而改变，如下：

![followSlide1](https://raw.githubusercontent.com/hahnzhu/parallax.js/master/assets/gif/followSlide1.gif) &nbsp;&nbsp;&nbsp;&nbsp;
![followSlide2](https://raw.githubusercontent.com/hahnzhu/parallax.js/master/assets/gif/followSlide2.gif)

