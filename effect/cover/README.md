# Cover

---


Cover动画组件，提供cover显示隐藏、定位、自定义形状和背景等功能特性。


Cover 组件不依赖样式


Dialog 继承自 `widget`

---

## 最佳实践

```js
seajs.use('cover', function(Dialog) {
    var cover = new Cover({
    	element:"#cover", 
    	trigger: '.trigger',
    	dismiss:'.dismiss'
    });
});
```


## 配置说明

### element *element*

需要被cover的元素，可传入选择器，默认为`body`。

### trigger *element*

cover触发显示的元素。

### dismiss *element*

cover触发隐藏的元素。

### background *string*

cover的背景色，默认为`random`（随机背景色）。

### shape *string*

cover的形状，默认为`random`（随机形状）
可选参数：random|round|square

### fromSkew *array*

cover动画开始时的斜切角度，默认为`random`（随机角度）

### duration *int*

动画时间，默认为`1000`

### startPos *string*

cover动画开始时的位置，默认为`source`（trigger的中心位置）
可选参数：source|top|center|bottom

### offset *array*

cover在startPos的基础上的偏移量，默认为`[0,0]`

### expandAxis *string*

cover需要展开的轴，默认为`y`
可选参数：x|y|xy

### isFloat *bool*

cover动画时，trigger是否处于遮罩的上方，默认为`true`

### zIndex *int*

cover遮罩的z-index，默认为`999`

## 实例方法

主要有 show、hide方法。


## 事件说明

### show（before|after）

可以使用 `.after('show', function() {})`或`.before('show', function() {})` 来触发cover显示动画开始前和开始后的动画

### hide（before|after）

可以使用 `.after('hide', function() {})`或`.before('hide', function() {})` 来触发cover隐藏动画开始前和开始后的动画

### shown（before|after）

可以使用 `.after('shown', function() {})`或`.before('shown', function() {})` 来触发cover显示动画结束前和开始后的动画

### hidden（before|after）

可以使用 `.after('hidden', function() {})`或`.before('hidden', function() {})` 来触发cover隐藏动画结束前和开始后的动画



