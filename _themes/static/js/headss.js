
function write_head(){
  var template_head='<div class="head-area">'+
    '<div class="title-area">'+
        '<img src="http://frozenui.github.io/static/frozen-top.png" alt="alice" />'+
        '<h1>'+
            '<a href="./">Frozen</a>'+
        '</h1>'+
        '<p class="description">为移动端web而生</p>  '+                  
    '</div>'+
  '</div>'+
  '<div class="nav-area">'+
      '<ol class="main-nav">'+
          '<li><a href="/"><i title="首页" class="iconfont"></i> 首页</a></li>'+
          '<li><a href="/baseui">css组件库</a></li>'+
          '<li><a href="/frozenjs">js组件库</a></li>'+
          '<li><a href="/docs/case.html">案例秀</a></li>'+
          '<li><a href="/docs/start.html">开始使用</a></li>'+
          '<li><a href="/docs/rule.html">关于Frozen</a></li>'+
      '</ol>'+
  '</div>';

  
  document.write(template_head);
}