module.exports = function(grunt){

    require('load-grunt-tasks')(grunt); //加载所有的任务
   
    var modulesFile=[
      "readme.md",
      "how.md",
      'basic/**/readme.md',
      'ui/**/readme.md',
      'effect/**/readme.md'
    ];

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
          mds[i]=mds[i].toLowerCase();
          
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


    var pkg=grunt.file.readJSON("package.json");

    grunt.initConfig({

      pkg:pkg,

      uglify:{

        options: {
            
        },

        basic: {
          files: {
            "<%= pkg.version %>/basic.js": ['basic/*/src/*.js']
          }
        },
        
        ui: {
          src: ['basic/*/src/*.js','ui/*/src/*.js'],
          dest: "<%= pkg.version %>/frozen.js"
        },
        lib:{
          files: {
          "lib/zepto.min.js": ['lib/zepto.js']
        }
        },
        single:{
          // files: [{
          //   expand: true,
          //   cwd:"ui/",
          //   src:"**/*.js",
          //   dest: "<%= pkg.version %>/"
          // }]
        }

      },


      concat: {

        basic: {
          src: ['basic/*/src/*.js'],
          dest: "<%= pkg.version %>/basic-debug.js",
        },

        ui: {
          src: ['basic/*/src/*.js','ui/*/src/*.js'],
          dest: "<%= pkg.version %>/frozen-debug.js"
        },

        single:{

        }

      },


      markdown: {

        options: {
          template: '_themes/templates/page.html',
          iframeTemplate:'_themes/templates/iframe.html',
          preCompile: function(src, context,file) {
            context.root=getPath(file.src[0]);
            context.navs=navs;
            file.dest=file.dest.replace("readme","index");
            context.current=file.src[0].replace("readme","index").replace(".md",".html");

            var input=file.src[0].split("/");
            context.category=input[0];
            input.pop();
            input=input.length==0?"":input.join("/")+"/";
            
            if(grunt.file.exists(input+"package.json")){
              var options=grunt.file.readJSON(input+"package.json");
              context.options=options;
            }
            var srcs=grunt.file.expand(input+"src/*.js");
            var css=grunt.file.expand(input+"src/*.css");

            context.srcs=srcs;
            context.css = css;
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
            {expand: true, src: ['*/*/src/*.js'], dest: '_site/'},
            {expand: true, src: ['*/*/src/*.css'], dest: '_site/'},
            {expand: true, src: ['lib/*.js'], dest: '_site/'}
          ]
        },

        single:{
          files: [{
            expand: true,
            src:"<%= currentPath %>",
            dest: '_site/'
          }]
        }

      },


      connect: {

        options: {
          port: 8000,
          // hostname: 'localhost', //默认就是这个值，可配置为本机某个 IP，localhost 或域名
          livereload: 35721  //声明给 watch 监听的端口
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
            '_themes/static/**/*',
            '**/src/*.js'
          ]
        }

      }

    });


    grunt.registerTask('docs',function(type){

      navs=getData();
      grunt.task.run("copy:static");
      grunt.task.run('markdown:all');
      grunt.task.run('connect:server');
      grunt.task.run('watch');
      
    });


    grunt.registerTask('build',function(file){

      grunt.task.run("uglify");
      grunt.task.run("concat");
      var arr=file.split("/");
      var cat=arr[0];
      arr.pop();
      grunt.config('uglify.single.src',arr.join("/")+"/*.js");
      grunt.config('uglify.single.dest',pkg.version+"/"+cat+"."+arr[1]+".js");
      grunt.task.run('uglify:single');
      grunt.config('concat.single.src',arr.join("/")+"/*.js");
      grunt.config('concat.single.dest',pkg.version+"/"+cat+"."+arr[1]+"-debug.js");
      grunt.task.run('concat:single');

      

    });


    grunt.registerTask('default',function(){

      var files=grunt.file.expand(['ui/*/src/*.js','effect/*/src/*js']);
      for(var i=0;i<files.length;i++){
        grunt.task.run('build:'+files[i]);
      }
      grunt.task.run('uglify:lib');
    });


    grunt.registerTask('build-single',function(file){
      // grunt.task.run("uglify");
      // grunt.task.run("concat");
      // var files=grunt.file.expand(['ui/*/src/*.js','effect/*/src/*js']);
      
      // for(var i=0;i<files.length;i++){

      //   var arr=files[i].split("/");
      //   var file=arr[arr.length-1];
      //   var cat=arr[0];
      //   arr.pop();
      //   grunt.config('uglify.single.src',arr.join("/")+"/*.js");
      //   grunt.config('uglify.single.dest',pkg.version+"/"+cat+"."+arr[1]+".js");
      //   grunt.task.run('uglify:single');
      //   grunt.config('concat.single.src',arr.join("/")+"/*.js");
      //   grunt.config('concat.single.dest',pkg.version+"/"+cat+"."+arr[1]+"-debug.js");
      //   grunt.task.run('concat:single');
      // }

    });


    grunt.event.on('watch', function(action, filepath, target) {

      if(action!="deleted"){
        if(filepath.indexOf(".md")>0){
          grunt.config('currentPath',filepath);
          grunt.task.run('markdown:single');
        }else{
          grunt.config('currentPath',filepath);
          grunt.task.run("copy:single");
        }
      }
      
    });
    

    
    
}