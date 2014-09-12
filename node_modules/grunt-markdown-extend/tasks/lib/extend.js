var format = require('util').format;
// var option = require('../option');
var encode = require('./encode');
var hl = require('./highlight');

exports.render=function(file,iframes){
  // iframes.splice(0,iframes.length)
  
  var ret=new Object();
  
  var iframeCount=0;
  ret.header = function(text, level) {
    var id = encode.uri(text);
    return format('<h%d id="%s">%s</h%d>', level, id, text, level);
  };

  ret.blockcode = function(code, language) {
    // var iframeCount=iframes.length;

    if (!language || language === '+' || language === '-') {
      return hl.render(code);
    }
    var lastChar = language.slice(-1);
    var hide = lastChar === '-';
    var inject = (lastChar === '-' || lastChar === '+');

    if (inject) {
      language = language.slice(0, -1);
    }

    if (language.slice(0, 6) !== 'iframe') {
      language = hl.language(language);
    }
    if (['javascript', 'css', 'html'].indexOf(language) !== -1) {
      inject = inject && true;
    }

    var html = '';
    // iframe hack
    if (language.slice(0, 6) === 'iframe') {
      iframeCount++;
      var height = language.split(':')[1];
      if (height) {
        height = format('height="%s"', height);
      } else {
        height = '';
      }
      html = [
        '<div class="md-iframe">',
        '<iframe src="%s.html" allowtransparency="true" ',
        'frameborder="0" scrolling="0" %s></iframe></div>'
      ].join('\n');
     

      var srcArr=file.src[0].split("/"),
          destArr=file.dest.split("/"),
          srcNameArr=srcArr[srcArr.length-1].split("."),
          destNameArr=destArr[destArr.length-1].split(".");
      var iframeName="iframe-"+srcNameArr[0]+"-"+iframeCount;
      var srcExt=srcNameArr[srcNameArr.length-1];
      var destExt=destNameArr[destNameArr.length-1];
      
      html = format(html, iframeName, height);
      language = 'html';

      srcArr.pop();
      destArr.pop();
      var tmpIframe={
        index:iframeCount,
        content:code,
        name:iframeName,
        input:srcArr.join("/")+"/"+iframeName+"."+srcExt,
        output:destArr.join("/")+"/"+iframeName+"."+destExt
      }
      iframes.push(tmpIframe);
    } else if (inject) {
      html = {
        'javascript': format('<script>%s</script>', code),
        'css': format('<style type="text/css">%s</style>', code),
        'html': format('<div class="nico-insert-code">%s</div>', code)
      }[language];
    }

    if (hide && inject) {
      return html;
    }

    return html + hl.render(code, language);
  };

  
  return ret;
}
exports.adapt = function(text) {
  text = text.replace(/^````([\w\:]+)$/gm, '````$1+');
  text = text.replace(/^`````([\w\:]+)$/gm, '`````$1-');
  return text;
};


