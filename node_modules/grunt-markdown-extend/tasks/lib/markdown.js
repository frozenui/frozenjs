/*
 * grunt-markdown
 * https://github.com/treasonx/grunt-markdown
 *
 * Copyright (c) 2012 James Morrin
 * Licensed under the MIT license.
 */

'use strict';

// external libs
var markdown = require('markit');
var hljs = require('./highlight.js');
var _ = require('lodash');

var extend = require('./extend');

exports.init = function(grunt) {
  var exports = {};

  exports.markdown = function(src, options, template,iframeTemplate,file) {


    var html = null;
    var templateContext = null;
    var iframes=[];

    var codeLines = options.codeLines;
    var shouldWrap = codeLines && codeLines.before && codeLines.after;

    function wrapLines(code) {
      var out = [];
      var before = codeLines.before;
      var after = codeLines.after;
      code = code.split('\n');

      code.forEach(function(line) {
        out.push(before+line+after);
        });
      return out.join('\n');
    }
    // var renderer=new markdown.Renderer();
    if(options.markdownOptions && typeof options.markdownOptions === 'object'){
      if(typeof options.markdownOptions.highlight === 'string') {
        if(options.markdownOptions.highlight === 'auto') {
          options.markdownOptions.highlight = function(code) {
            var out = hljs.highlightAuto(code).value;
            if(shouldWrap) {
              out = wrapLines(out);
            }
            return out;
          };
        } else if (options.markdownOptions.highlight === 'manual') {
          options.markdownOptions.highlight = function(code, lang) {
            var out = code;
            try {
              out = hljs.highlight(lang, code).value;
            } catch(e) {
              out = hljs.highlightAuto(code).value;
            }
            if(shouldWrap) {
              out = wrapLines(out);
            }
            return out;
          };
        }

      }
    }
    options.markdownOptions.renderer={};
    
    var renderer=new markdown.Renderer();

    if(options.isMarkdownExtend){

      src=extend.adapt(src);

      var extendRender=extend.render(file,iframes);

      for(var key in extendRender)
      {
        renderer[key]=extendRender[key];
      }
    }
     
    for(var key in options.markdownOptions.renderer)
    {
      renderer[key]=options.markdownOptions.renderer[key];
    }

    options.markdownOptions.renderer=renderer;

    markdown.setOptions(options.markdownOptions);

    grunt.verbose.write('Marking down...');

    if(_.isFunction(options.templateContext)) {
      templateContext = options.templateContext();
    } else {
      templateContext = options.templateContext;
    }
    src = options.preCompile(src, templateContext,file) || src;
    html = markdown(src,options.markdownOptions);
    html = options.postCompile(html, templateContext,file) || html;
    templateContext.content = html;
    src = _.template(template, templateContext);
    
    var ret=[];
    ret.push({
      content:src,
      input:file.src[0],
      output:file.dest
    });
    for(var i=0;i<iframes.length;i++){
      templateContext.content = iframes[i].content;
      src=_.template(iframeTemplate, templateContext);
      ret.push({
        content:src,
        input:iframes[i].input,
        output:iframes[i].output
      })
    }
    return ret;

  };

  return exports;
};

