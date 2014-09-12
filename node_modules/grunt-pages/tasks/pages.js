/*
 * grunt-pages
 * https://github.com/CabinJS/grunt-pages
 *
 * Copyright (c) 2014 Chris Wren & contributors
 * Licensed under the MIT license.
 */

'use strict';

var path = require('path');
var url  = require('url');

require('colors');
var _          = require('lodash');
var marked     = require('marked');
var fs         = require('node-fs');
var pygmentize = require('pygmentize-bundled');
var RSS        = require('rss');

var templateEngines = {
  ejs: {
    engine: require('ejs'),
    extensions: ['.ejs']
  },
  jade: {
    engine: require('jade'),
    extensions: ['.jade']
  },
  handlebars: {
    engine: require('handlebars'),
    extensions: ['.hbs', '.handlebars'],

    pregenerate: function (grunt, templateEngine, options) {
      if (options.partials) {
        var files = grunt.file.expand(options.partials);
        files.forEach(function (file) {
          var partialString = grunt.file.read(file);
          var name = path.basename(file, path.extname(file));

          templateEngine.registerPartial(name,partialString);
        }.bind(this));
      }
    }
  }
};

// Define lib object to attach library methods to
var lib = {};

/**
 * Export module as a grunt plugin
 * @param  {Object} grunt Grunt object to register tasks and use for utilities
 */
module.exports = function (grunt) {

  // Allow for test objects to be used during unit testing
  var _this   = grunt.testContext || {};
  var options = grunt.testOptions || {};

  // Create a reference to the template engine that is available to all library methods
  var templateEngine;
  var engineOptions;

  // Declare a global function to format URLs that is available to all library methods
  var formatPostUrl = function (urlSegment) {
    return urlSegment
      .toLowerCase() // change everything to lowercase
      .replace(/^\s+|\s+$/g, '') // trim leading and trailing spaces
      .replace(/[_|\s|\.]+/g, '-') // change all spaces, periods and underscores to a hyphen
      .replace(/[^a-z\u0400-\u04FF0-9-]+/g, '') // remove all non-cyrillic, non-numeric characters except the hyphen
      .replace(/[-]+/g, '-') // replace multiple instances of the hyphen with a single instance
      .replace(/^-+|-+$/g, ''); // trim leading and trailing hyphens
  };

  // Save start time to monitor task run time
  var start = new Date().getTime();

  grunt.registerMultiTask('pages', 'Creates pages from markdown and templates.', function () {

    // Task is asynchronous due to usage of pygments syntax highlighter written in python
    var done = this.async();

    var cacheFile;

    // Create a reference to the the context object and task options
    // so that they are available to all library methods
    _this = this;
    options = this.options();

    if (options.formatPostUrl) {
      formatPostUrl = options.formatPostUrl;
    }

    // Get the content and metadata of unmodified posts so that they don't have to be parsed
    // if they haven't been modified
    var unmodifiedPosts = [];
    if (!grunt.option('no-cache')) {
      cacheFile = path.normalize(process.cwd() + '/.grunt/grunt-pages/' + this.target + '-post-cache.json');
      if (fs.existsSync(cacheFile)) {
        unmodifiedPosts = lib.getUnmodifiedPosts(JSON.parse(fs.readFileSync(cacheFile)).posts);
        var unmodifiedPostPaths = unmodifiedPosts.map(function (post) {
          return post.sourcePath;
        });
      }
    }

    // Don't include draft posts or dotfiles when counting the number of posts
    var numPosts = grunt.file.expand({
      filter: 'isFile',
      cwd: this.data.src
    }, [
      '**'
    ]).length;

    // Start off the parsing with unmodified posts already included
    var parsedPosts    = unmodifiedPosts.length;
    var postCollection = unmodifiedPosts;

    // If none of the posts have been modified, immediately render the posts and pages
    if (parsedPosts === numPosts) {
      lib.renderPostsAndPages(postCollection, cacheFile, done);
      return;
    }

    grunt.file.recurse(this.data.src, function (postpath) {

      // Don't parse unmodified posts
      if (unmodifiedPostPaths && unmodifiedPostPaths.indexOf(postpath) !== -1) {
        return;
      }

      // Don't include draft posts
      if (path.basename(postpath).indexOf('_') === 0) {
        if (++parsedPosts === numPosts) {
          lib.renderPostsAndPages(postCollection, cacheFile, done);
        }
        return;
      }

      // Don't include dotfiles or files in dotfolders
      if (path.basename(postpath).indexOf('.') === 0 || path.basename(postpath).indexOf('/.') !== -1) {
        return;
      }

      var post = lib.parsePostData(postpath);

      // Save source path for caching as well as error logging in getPostDest
      post.sourcePath = postpath;

      // Save the modification time of the post to allow for future caching
      post.lastModified = fs.statSync(post.sourcePath).mtime;

      if (post.markdown.length <= 1) {
        grunt.fail.fatal('The following post is blank, please add some content to it or delete it: ' + postpath.red + '.');
      }

      var renderer = _.extend(new marked.Renderer(), {

        // Override heading rendering to embed anchor tag and icon span
        heading: function (text, level) {
          return '<h' + level + '><a name="' +
                         formatPostUrl(text) +
                         '" class="anchor" href="#' +
                         formatPostUrl(text) +
                         '"><span class="header-link"></span></a>' +
                         text + '</h' + level + '>';
        }
      });

      var customMarkedOptions;

      if (options.markedOptions) {
        if (typeof options.markedOptions === 'function') {
          customMarkedOptions = options.markedOptions(marked);
        } else {
          customMarkedOptions = options.markedOptions;
        }
      } else {
        customMarkedOptions = {};
      }

      var opts = _.extend(marked.defaults, {
        renderer: renderer,
        gfm: true,
        anchors: true,
        highlight: function (code, lang, callback) {

          // Use [pygments](http://pygments.org/) for syntax highlighting
          pygmentize({ lang: lang, format: 'html' }, code, function (err, result) {
            if (!result) {
              grunt.fail.fatal('Syntax highlighting failed, make sure you have python installed.');
            }

            callback(err, result.toString());
          });
        }
      }, customMarkedOptions);

      // Extend methods by adding current post as an additional argument
      _.each(opts.renderer, function(method, methodName) {
        opts.renderer[methodName] = function() {
          var newArgs = Array.prototype.slice.call(arguments);
          newArgs.push(post);
          return method.apply({ options: opts }, newArgs);
        };
      });

      // Parse post using [marked](https://github.com/chjj/marked)
      marked(post.markdown, opts, function (err, content) {
        if (err) throw err;

        // Replace markdown property with parsed content property
        post.content = content;
        delete post.markdown;

        postCollection.push(post);

        // Once all the source posts are parsed, we can generate the html posts
        if (++parsedPosts === numPosts) {
          lib.renderPostsAndPages(postCollection, cacheFile, done);
        }
      });
    });
  });

  /**
   * Gets the end of the metadata section to allow for the metadata to be JSON.parsed
   * and for the content to be extracted
   * @param  {String} fileString   Contents of entire post
   * @param  {Number} currentIndex Index delimiting the substring to be searched for {'s and }'s
   * @return {String}
   */
  lib.getMetadataEnd = function (fileString, currentIndex) {

    var curlyNest = 1;

    while (curlyNest !== 0 && fileString.substr(currentIndex).length > 0) {
      if (fileString.substr(currentIndex).indexOf('}') === -1 &&
          fileString.substr(currentIndex).indexOf('{') === -1) {
        return false;
      }
      if (fileString.substr(currentIndex).indexOf('}') !== -1) {
        if (fileString.substr(currentIndex).indexOf('{') !== -1) {
          if (fileString.substr(currentIndex).indexOf('}') < fileString.substr(currentIndex).indexOf('{')) {
            currentIndex += fileString.substr(currentIndex).indexOf('}') + 1;
            curlyNest--;
          } else {
            currentIndex += fileString.substr(currentIndex).indexOf('{') + 1;
            curlyNest++;
          }
        } else {
          currentIndex += fileString.substr(currentIndex).indexOf('}') + 1;
          curlyNest--;
        }
      } else {
        currentIndex += fileString.substr(currentIndex).indexOf('{') + 1;
        curlyNest++;
      }
    }
    return curlyNest === 0 ? currentIndex : false;
  };

  /**
   * Parses the metadata and markdown from a post
   * @param  {String} postPath Absolute path of the post to be parsed
   * @return {Object} Object
   */
  lib.parsePostData = function (postPath) {
    var fileString = fs.readFileSync(postPath, 'utf8');
    var postData   = {};
    var errMessage = 'The metadata for the following post is formatted incorrectly: ' + postPath.red + '\n' +
                     'Go to the following link to learn more about post formatting:\n\n' +
                     'https://github.com/CabinJS/grunt-pages#authoring-posts';
    try {

      var metaDataStart;

      if (fileString.indexOf('{') >= 0 &&
          fileString.indexOf('{') < fileString.indexOf('}')) {
        metaDataStart = fileString.indexOf('{');
      } else {
        return grunt.fail.fatal(errMessage);
      }

      // Parse JSON metadata
      var metaDataEnd = lib.getMetadataEnd(fileString, metaDataStart + 1);

      if (!metaDataEnd) {
        return grunt.fail.fatal(errMessage);
      }

      postData = eval('(' + fileString.substr(metaDataStart, metaDataEnd) + ')');
      if (postData.date) {
        postData.date = new Date(postData.date);
      } else {
        postData.date = new Date(fs.statSync(postPath).mtime);
      }

      postData.markdown = fileString.slice(metaDataEnd);
      return postData;
    } catch (e) {
      grunt.fail.fatal(errMessage);
    }
  };

  /**
   * Returns an array of unmodified posts by checking the last modified date of each post in the cache
   * @param  {Array} posts Collection of posts
   * @return {Array}       An array of posts which have not been modified and do not need to be parsed
   */
  lib.getUnmodifiedPosts = function (posts) {
    return posts.filter(function (post) {

      // If the post has been moved or deleted, we can't cache it
      if (!fs.existsSync(post.sourcePath)) {
        return false;
      }

      // Check if the post was last modified when the cached version was last modified
      if (('' + fs.statSync(post.sourcePath).mtime) === ('' + new Date(post.lastModified))) {

        // We have to restore the Date object since it is lost during JSON serialization
        post.date = new Date(post.date);
        return true;
      }
    });
  };

  /**
   * Updates the template data with the data from an Object or JSON file
   * @param {Object} templateData Data to be passed to templates for rendering
   */
  lib.setData = function (templateData) {
    if (typeof options.data === 'string') {
      try {
        templateData.data = JSON.parse(fs.readFileSync(options.data));
      } catch (e) {
        grunt.fail.fatal('Data could not be parsed from ' + options.data + '.');
      }
    } else if (typeof options.data === 'object') {
      templateData.data = options.data;
    } else {
      grunt.fail.fatal('`options.data` format not recognized. Must be an Object or String.');
    }
  };

  /**
   * Determines the template engine based on the `layout`'s file extension
   */
  lib.setTemplateEngine = function () {
    engineOptions = _.find(templateEngines, function (engine) {
      return _.contains(engine.extensions, path.extname(_this.data.layout).toLowerCase());
    });
    templateEngine = engineOptions.engine;
  };

  /**
   * Renders posts and pages once all posts have been parsed
   * @param  {Array}    postCollection Collection of parsed posts with the content and metadata properties
   * @param  {String}   cacheFile      Pathname of file to write post data to for future caching of unmodified posts
   * @param  {Function} done           Callback to call once grunt-pages is done
   */
  lib.renderPostsAndPages = function (postCollection, cacheFile, done) {
    var templateData = { posts: postCollection };

    lib.setTemplateEngine();

    if (options.metadataValidator) {
      options.metadataValidator(postCollection, templateData);
    }

    if (options.data) {
      lib.setData(templateData);
    }

    lib.setPostUrls(postCollection);

    postCollection.forEach(function (post) {
      post.dest = lib.getDestFromUrl(post.url);
    });

    lib.sortPosts(postCollection);

    var cachedPosts = _.cloneDeep(templateData);

    // Record how long it takes to generate posts
    var postStart = new Date().getTime();

    if (engineOptions.pregenerate) {
      engineOptions.pregenerate.call(this, grunt, templateEngine, options);
    }

    lib.generatePosts(templateData);

    if (grunt.option('bench')) {
      console.log('\nPosts'.blue + ' took ' + (new Date().getTime() - postStart) / 1000 + ' seconds.\n');
    }

    // Record how long it takes to generate pages
    var pageStart = new Date().getTime();

    if (options.pageSrc) {
      lib.generatePages(templateData);
    }

    if (options.pagination) {
      if (Array.isArray(options.pagination)) {
        options.pagination.forEach(function (pagination) {
          lib.paginate(templateData, pagination);
        });
      } else {
        lib.paginate(templateData, options.pagination);
      }
    }

    if (grunt.option('bench')) {
      console.log('\nPages'.magenta + ' took ' + (new Date().getTime() - pageStart) / 1000 + ' seconds.\n');
    }

    if (options.rss) {
      lib.generateRSS(postCollection);
    }

    if (!fs.existsSync(path.dirname(cacheFile))) {
      fs.mkdirSync(path.dirname(cacheFile), '0777', true);
    }

    if (!grunt.option('no-cache')) {
      fs.writeFileSync(cacheFile, JSON.stringify(cachedPosts));
    }

    if (grunt.option('bench')) {
      console.log('Task'.yellow + ' took ' + (new Date().getTime() - start) / 1000 + ' seconds.');
    }
    done();
  };

  /**
   * Updates the post collection with each post's url
   * @param {Array} postCollection Collection of parsed posts with the content and metadata properties
   */
  lib.setPostUrls = function (postCollection) {
    postCollection.forEach(function (post) {
      post.url = lib.getPostUrl(post);
    });
  };

  /**
   * Returns the post url based on the url property and post metadata
   * @param  {Object} post Post object containing all metadata properties of the post
   * @return {String}
   */
  lib.getPostUrl = function (post) {
    if (typeof _this.data.dest === 'undefined') {
      grunt.fail.fatal('Please specify the dest property in your config.');
    }

    if (typeof _this.data.url === 'function') {
      return _this.data.url(post, options);
    }

    var url = _this.data.url;

    // Extract dynamic URL segments and replace them with post metadata
    _this.data.url.split('/')

      // Get all variables
      .filter(function (urlSegment) {
        return urlSegment.indexOf(':') !== -1;
      })

      // Retrieve variable name
      .map(function (urlSegment) {
        return urlSegment.slice(urlSegment.indexOf(':') + 1);
      })

      // Replace variable segment with metadata value
      .forEach(function (urlSegment) {

        // Don't replace the .html part of the URL segment
        if (urlSegment.indexOf('.html') !== -1) {
          urlSegment = urlSegment.slice(0, - '.html'.length);
        }

        // Make sure the post has the dynamic segment as a metadata property
        if (urlSegment in post) {

          // Format dynamic sections of the URL
          url = url.replace(':' + urlSegment, formatPostUrl(post[urlSegment]));
        } else {
          grunt.fail.fatal('Required ' + urlSegment + ' attribute not found in the following post\'s metadata: ' + post.sourcePath + '.');
        }
      });

    return url;
  };

  /**
   * Gets a post's or page's destination based on its url
   * @param {String} url Url to determine the destination from
   */
  lib.getDestFromUrl = function (url) {
    var dest = _this.data.dest;

    if (url.indexOf('/') !== 0) {
      dest += '/';
    }
    dest += url;


    // Ensures that a .html is present at the end of the file's destination path
    if (dest.indexOf('.html') === -1) {

      // If the URL ends with a '/', simply add index.html
      if (dest.lastIndexOf('/') === dest.length - 1) {
        dest += 'index.html';

      // Otherwise add .html
      } else {
        dest += '.html';
      }
    }

    return dest;
  };

  /**
   * Sorts the posts
   * @param {Array} postCollection Collection of parsed posts with the content and metadata properties
   */
  lib.sortPosts = function (postCollection) {

    // Defaults to sorting posts by descending date
    var sortFunction = options.sortFunction ||
      function (a, b) {
        return b.date - a.date;
      };

    postCollection.sort(sortFunction);
  };

  /**
   * Generates posts based on the templateData
   * @param  {Object} templateData Data to be passed to templates for rendering
   */
  lib.generatePosts = function (templateData) {
    var layoutString = fs.readFileSync(_this.data.layout, 'utf8');
    var fn = templateEngine.compile(layoutString, { pretty: grunt.option('debug') ? true : false, filename: _this.data.layout });
    var postDests = [];

    _(templateData.posts)
      // Remove the dest property from the posts now that they are generated
      .each(function (post) {
        postDests.push(post.dest);
        delete post.dest;
      })
      .each(function (post, currentIndex) {

        // Pass the post data to the template via a post object
        // adding the current index to allow for navigation between consecutive posts
        templateData.post = _.extend(_.cloneDeep(post), { currentIndex: currentIndex });

        grunt.log.debug(JSON.stringify(lib.reducePostContent(templateData), null, '  '));
        try {
          grunt.file.write(postDests[currentIndex], fn(templateData));
        } catch (e) {
          console.log('\nData passed to ' + _this.data.layout.blue + ' post template:\n\n' + JSON.stringify(lib.reducePostContent(templateData), null, '  ').yellow + '\n');
          grunt.fail.fatal(e.message);
        }
        grunt.log.ok('Created '.green + 'post'.blue + ' at: ' + postDests[currentIndex]);
      });

    // Remove the post object from the templateData now that each post has been generated
    delete templateData.post;
  };

  /**
   * Generates pages using the posts' data
   * @param  {Object} templateData Data to be passed to templates for rendering
   */
  lib.generatePages = function (templateData) {

    grunt.file.recurse(options.pageSrc, function (abspath, rootdir) {
      if (lib.shouldRenderPage(abspath)) {
        var layoutString = fs.readFileSync(abspath, 'utf8');
        var fn           = templateEngine.compile(layoutString, { pretty: grunt.option('debug') ? true : false, filename: abspath });

        // Determine the page's destination by prepending the dest folder, then finding its relative location
        // to options.pageSrc and replacing its file extension with 'html'
        var dest         = path.normalize(_this.data.dest + '/' +
                           path.normalize(abspath).slice(path.normalize(rootdir).length + 1).replace(path.extname(abspath), '.html'));

        templateData.currentPage = path.basename(abspath, path.extname(abspath));
        templateData.currentPagePath = path.relative(options.pageSrc, abspath);
        grunt.log.debug(JSON.stringify(lib.reducePostContent(templateData), null, '  '));
        try {
          grunt.file.write(dest, fn(templateData));
        } catch (e) {
          console.log('\nData passed to ' + abspath.magenta + ' page template:\n\n' + JSON.stringify(lib.reducePostContent(templateData), null, '  ').yellow + '\n');
          grunt.fail.fatal(e.message);
        }
        grunt.log.ok('Created '.green + 'page'.magenta + ' at: ' + dest);
      }
    });
  };

  /**
   * Determines if a page inside of the options.pageSrc folder should be rendered
   * @param  {String} abspath Absolute path of the page in question
   * @return {Boolean}
   */
  lib.shouldRenderPage = function (abspath) {
    var listPages = [];

    // Ignore the pagination listPage(s) when generating pages if pagination is enabled
    if (options.pagination) {

      if (Array.isArray(options.pagination)) {
        listPages = options.pagination.map(function (pagination) {
          return pagination.listPage;
        });
      } else {
        listPages = [options.pagination.listPage];
      }
    }

    // Don't generate the paginated list page(s)
    if (listPages && listPages.indexOf(abspath) !== -1) {
      return false;
    }

    // Don't include dotfiles
    if (path.basename(abspath).indexOf('.') === 0) {
      return false;
    }

    // If options.templateEngine is specified, don't render templates with other file extensions
    if (options.templateEngine && path.extname(abspath).toLowerCase() !== '.' + options.templateEngine) {
      return false;
    }

    return true;
  };

  /**
   * Reduces the content of posts to make --debug logging more readable
   * @param  {Object} templateData Data to be passed to templates for rendering
   * @return {Object}              Data to be logged in --debug output
   */
  lib.reducePostContent = function (templateData) {

    var templateDataClone = _.cloneDeep(templateData);

    if (templateDataClone.posts) {
      templateDataClone.posts.map(function (post) {
        return _.extend(post, { content: post.content.substr(0, 10) + '...' });
      });
    }
    if (templateDataClone.post) {
      templateDataClone.post.content = templateDataClone.post.content.substr(0, 10) + '...';
    }

    return templateDataClone;

  };

  /**
   * Default function to get post groups for each paginated page by grouping a specified number of posts per page
   * @param  {Array} postCollection Collection of parsed posts with the content and metadata properties
   * @return {Array}                Array of post groups to each be displayed on a corresponding paginated page
   */
  lib.getPostGroups = function (postCollection, pagination) {
    var postsPerPage = pagination.postsPerPage;
    var postGroups   = [];
    var i            = 0;
    var postGroup;

    while ((postGroup = postCollection.slice(i * postsPerPage, (i + 1) * postsPerPage)).length) {
      postGroups.push({
        posts: postGroup,
        id: i
      });
      i++;
    }
    return postGroups;
  };

  /**
   * Returns the set of paginated pages to be generated
   * @param  {Array}  postCollection Collection of parsed posts with the content and metadata properties
   * @param  {Object} pagination     Configuration object for pagination
   * @return {Array}                 Array of pages with the collection of posts and destination path
   */
  lib.getPaginatedPages = function (postCollection, pagination) {
    var postGroupGetter = pagination.getPostGroups ||
                          lib.getPostGroups;

    // Get the post groups, then determine each list page's URL
    return postGroupGetter(postCollection, pagination).map(function (postGroup) {
      return {
        posts: postGroup.posts,
        id:    postGroup.id,
        url:   lib.getListPageUrl(postGroup.id, pagination)
      };
    });
  };

  /**
   * Creates paginated pages based on a scheme to group posts
   * @param  {Object} templateData Data to be passed to templates for rendering
   * @param  {Object} pagination   Configuration object for pagination
   */
  lib.paginate = function (templateData, pagination) {
    var listPage     = pagination.listPage;
    var pages        = lib.getPaginatedPages(templateData.posts, pagination);
    var layoutString = fs.readFileSync(listPage, 'utf8');
    var fn           = templateEngine.compile(layoutString, { pretty: grunt.option('debug') ? true : false, filename: listPage });

    pages.forEach(function (page, currentIndex) {

      // Prepare the template render data by composing the page's index, other page's ids and URLs,
      // the current page's posts, and an optional data object into a single object
      var templateRenderData = {
        currentIndex: currentIndex,

        // Omit each other list page's posts array as only the id and url are needed
        pages: _.map(pages, function (page) {
          return _.omit(page, 'posts');
        }),
        posts: page.posts,
        data:  templateData.data || {}
      };

      grunt.log.debug(JSON.stringify(lib.reducePostContent(templateRenderData), null, '  '));
      try {
        grunt.file.write(lib.getDestFromUrl(page.url), fn(templateRenderData));
      } catch (e) {
        console.log('\nData passed to ' + listPage.magenta + ' paginated list page template:\n\n' + JSON.stringify(lib.reducePostContent(templateData), null, '  ').yellow + '\n');
        grunt.fail.fatal(e.message);
      }
      grunt.log.ok('Created '.green + 'paginated'.rainbow + ' page'.magenta + ' at: ' + lib.getDestFromUrl(page.url));
    });
  };

  /**
   * Writes RSS feed XML based on the collection of posts
   * @param  {Array} postCollection Collection of parsed posts with the content and metadata properties
   */
  lib.generateRSS = function (postCollection) {
    if (!options.rss.url) {
      grunt.fail.fatal('options.rss.url is required');
    }

    if (!options.rss.title) {
      grunt.fail.fatal('options.rss.title is required');
    }

    if (!options.rss.description) {
      grunt.fail.fatal('options.rss.description is required');
    }

    var fileName = options.rss.path || 'feed.xml';
    var dest     = path.join(_this.data.dest, fileName);

    // Create a new feed
    var feed = new RSS({
      title:          options.rss.title,
      description:    options.rss.description,
      feed_url:       url.resolve(options.rss.url, fileName),
      site_url:       options.rss.url,
      image_url:      options.rss.image_url,
      docs:           options.rss.docs,
      author:         options.rss.author,
      managingEditor: options.rss.managingEditor || options.rss.author,
      webMaster:      options.rss.webMaster || options.rss.author,
      copyright:      options.rss.copyRight || new Date().getFullYear() + ' ' + options.rss.author,
      language:       options.rss.language || 'en',
      categories:     options.rss.categories,
      pubDate:        options.rss.pubDate || new Date().toString(),
      ttl:            options.rss.ttl || '60'
    });

    // Add the first 10 or specified number of posts to the RSS feed
    _.first(postCollection, (options.rss.numPosts || 10)).forEach(function (post) {
      feed.item({
        title:       post.title,
        description: post.content,
        url:         url.resolve(options.rss.url, post.url),
        categories:  post.tags,
        date:        post.date
      });
    });

    grunt.file.write(dest, feed.xml());

    grunt.log.ok('Created '.green + 'RSS feed'.yellow + ' at ' + dest);
  };

  /**
   * Gets a list page's url based on its id, pagination.url, and options.pageSrc
   * @param  {Number} pageId     Identifier of current page to be written
   * @param  {Object} pagination Configuration object for pagination
   * @return {String}
   */
  lib.getListPageUrl = function (pageId, pagination) {
    var listPage  = pagination.listPage;
    var url       = '';
    var urlFormat = pagination.url || 'page/:id/';

    if (!fs.existsSync(listPage)) {
      return grunt.fail.fatal('No `options.pagination.listPage` found at ' + listPage);
    }

    // If the pageSrc option is used, generate list pages relative to options.pageSrc
    // Otherwise, generate list pages relative to the root of the destination folder
    if (options.pageSrc) {
      if (listPage.indexOf(options.pageSrc + '/') !== -1) {
        url += listPage.slice(options.pageSrc.length + 1);
      } else {
        return grunt.fail.fatal('The `options.pagination.listPage` must be within the options.pageSrc directory.');
      }
    }

    // The root list page is either the template file's location relative to options.pageSrc
    // or a blank url for the site root
    if (pageId === 0) {
      if (options.pageSrc) {
        url = url.replace(path.extname(listPage), '.html');
      } else {
        url = '';
      }

    // Every other list page's url is generated using the pagination.url property and is either generated
    // relative to the folder that contains the listPage or relative to the root of the site
    } else {
      if (urlFormat.indexOf(':id') === -1) {
        return grunt.fail.fatal('The `options.pagination.url` must include an \':id\' variable which is replaced by the list page\'s identifier.');
      }
      if (options.pageSrc) {
        url = url.replace(path.basename(listPage), urlFormat.replace(':id', pageId));
      } else {
        url += urlFormat.replace(':id', pageId);
      }
    }

    // Remove unnecessary trailing index.html from urls
    if (url.indexOf('index.html') !== -1 &&
        url.lastIndexOf('index.html') === url.length - 'index.html'.length) {
      url = url.slice(0, - 'index.html'.length);
    }

    return url;
  };

  // Return the library methods so that they can be tested
  return lib;
};
