(function($) {

 
  $('.nico-iframe iframe').on('mouseover',function(){
   
    document.addEventListener('mousewheel',preventEvent,false); 
  });
  $('.nico-iframe iframe').on('mouseout',function(){
    document.removeEventListener('mousewheel',preventEvent,false); 
  });

  // 取消默认事件
  function preventEvent(evt){

    evt.preventDefault();
        
  }
})($);


