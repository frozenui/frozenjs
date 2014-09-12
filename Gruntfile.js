module.exports = function(grunt){

    require('load-grunt-tasks')(grunt); //加载所有的任务
   
    var modulesFile=[
      "*.md",
      'basic/**/readme.md',
      'effect/**/readme.md',
      'lib/**/readme.md'];

    var navs=[];
    function getPath(origin){
      var oriArr=origin.split("/");
      var split="";
      for(var i=0;i<oriArr.length-1;i++){
        split+="../";
      }
      return split;
    }
    function getData(){
      var mds=grunt.file.expand(modulesFile);
      var navs=[];
      for(var i=0;i<mds.length;i++){
        
        if(grunt.file.exists(mds[i])){
          var content=grunt.file.read(mds[i]);
          var cur=mds[i].replace("readme","index");
          var title=/^ *# *([^\n]+?) *#* *(?:\n+|$)/.exec(content);
          title=title[1];
          navs.push({
            title:title,
            url:cur.replace(".md",".html")
          })
        }
      }
      return navs;
    };
    
    grunt.initConfig({
      markdown: {
        options: {
          template: '_themes/templates/page.html',
          iframetemplate:'_themes/templates/iframe.html',
          preCompile: function(src, context,file) {
            context.root=getPath(file.src[0]);
            context.navs=navs;
            file.dest=file.dest.replace("readme","index");
            context.current=file.src[0].replace("readme","index").replace(".md",".html");
            var input=file.src[0].split("/");
            input.pop();
            input=input.length==0?"":input.join("/")+"/";
            
            if(grunt.file.exists(input+"package.json")){
              var options=grunt.file.readJSON(input+"package.json");
              context.options=options;
            }
          }
        },
        all: {
          files: [{
            expand: true,
            src:modulesFile,
            dest: '_site/',
            ext:".html"
          }]
        },
        
        single:{
          files: [{
            expand: true,
            src:"<%= currentPath %>",
            dest: '_site/',
            ext:".html"
          }]
        }
        
      },
      copy:{
        static:{
          files: [
            {expand: true, cwd: '_themes/static/', src: ['**'], dest: '_site/static'},
          ]
        }
      },
      connect: {
        options: {
          port: 8000,
          // hostname: 'localhost', //默认就是这个值，可配置为本机某个 IP，localhost 或域名
          livereload: 35729  //声明给 watch 监听的端口
        },
        server: {
          options: {
            base: [
              '_site/'  //主目录
            ]
          }
        }
      },
      watch: {
        livereload: {
          options: {
              spawn: false,
              livereload: '<%=connect.options.livereload%>'  //监听前面声明的端口  35729
          },
          files: [
            "how.md",
            "readme.md",
            '**/readme.md',
            '_themes/static/**/*'
          ]
        }
      }
    });
    grunt.registerTask('md',function(type){
      navs=getData();
      grunt.task.run("copy:static");
      grunt.task.run('markdown:all');
      grunt.task.run('connect:server');
      grunt.task.run('watch');
    });
    grunt.event.on('watch', function(action, filepath, target) {
      if(action!="deleted"){
        if(filepath.indexOf(".md")>0){
          grunt.config('currentPath',filepath);
          grunt.task.run('markdown:single');
        }else{
          grunt.task.run("copy:static");
        }
      }
      
    });
    

    
    
}