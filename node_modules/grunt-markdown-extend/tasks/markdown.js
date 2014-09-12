/*
 * grunt-markdown
 * https://github.com/treasonx/grunt-markdown
 *
 * Copyright (c) 2012 James Morrin
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {
  'use strict';
  var noop = function(){};

  var path = require('path');

  // Internal lib.
  var markdown = require('./lib/markdown').init(grunt);

  grunt.registerMultiTask('markdown', 'Compiles markdown files into html.', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      htmlExtension: 'html',
      markdownExtension: 'md',
      markdownOptions: {},
      isMarkdownExtend:true,
      preCompile: noop,
      postCompile: noop,
      templateContext: {},
      template: path.join(__dirname, 'template.html'),
      iframeTemplate: path.join(__dirname, 'template.html')
    });
   
    var template = grunt.file.read(options.template);
    var iframeTemplate = grunt.file.read(options.iframeTemplate);

    // Iterate over all specified file groups.
    grunt.util.async.forEachLimit(this.files, 25, function (file, next) {
        convert(file.src, file.dest, next,file);
    }.bind(this), this.async());

    function convert(src, dest, next,file){
      var contents = markdown.markdown(
        grunt.file.read(src),
        options,
        
        template,
        iframeTemplate,
        file
      );
      for(var i=0;i<contents.length;i++){
        grunt.file.write(contents[i].output, contents[i].content);
        grunt.log.writeln('File "' + contents[i].output + '" created.');
      }
      process.nextTick(next);
    }
  });

};
