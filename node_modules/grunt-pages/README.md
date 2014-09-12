# grunt-pages
> Grunt task to create pages using markdown and templates

[![NPM version](https://badge.fury.io/js/grunt-pages.png)](http://badge.fury.io/js/grunt-pages)
[![Dependency Status](https://david-dm.org/CabinJS/grunt-pages.png)](https://david-dm.org/CabinJS/grunt-pages)
[![Travis Status](https://travis-ci.org/CabinJS/grunt-pages.png?branch=master)](https://travis-ci.org/CabinJS/grunt-pages)

## Prerequisites
This Grunt task uses [pygments](http://pygments.org/) which requires [Python](http://www.python.org/getit/) to be installed.

## Getting Started
If you haven't used Grunt before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a Gruntfile as well as install and use Grunt plugins. Once you're familiar with that process, install this plugin with this command:
```shell
npm install grunt-pages --save-dev
```

Then add this line to your project's `Gruntfile.js` Gruntfile:

```javascript
grunt.loadNpmTasks('grunt-pages');
```

## Documentation

### Sample config
Here is a sample config to create a blog using grunt-pages:
```js
pages: {
  options: {
    pageSrc: 'src/pages'
  },
  posts: {
    src: 'posts',
    dest: 'dev',
    layout: 'src/layouts/post.jade',
    url: 'posts/:title/'
  }
}
```

### Authoring posts

#### Post Format
Posts are written in markdown and include a metadata section at the top to provide information about the post. The metadata format is a JavaScript Object, and here is an example:

```js
{
  title: 'Blogging in my Cabin',
  date: '2014-1-1',
  author: 'Firstname Lastname'
}
```

The only property that is not interpreted literally is the `date`. If it is specified, it is used as a `dateString` when constructing a [Date object](https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date) in JavaScript, and must be in a [parseable format](https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/parse). If unspecified, the post's date will be the result of constructing a Date object using the post's last modified time.

#### Syntax Highlighting
For adding code to your posts, grunt-pages has [GitHub flavoured markdown](https://help.github.com/articles/github-flavored-markdown) and syntax highlighting using [pygments](http://pygments.org/).

#### Draft Posts
To make a post a draft when deploying your site, simply prefix its filename with a `_`. These posts will not be rendered or available in list pages.

### Styling Headers

By default, grunt-pages generates header tags that include nested anchor tags with span's to allow for header section linking. Here is an example of the HTML that the above header would generate:
```html
<h3>
  <a name="styling-headers" class="anchor" href="#styling-headers">
    <span class="header-link"></span>
  </a>
  "Styling Headers"
</h3>
```
The generated markup follows the same format as GitHub README's and it is recommended to reference [Cabin theme](http://www.cabinjs.com/#themes)'s styling when trying to create header linking. Note that you can override this by implementing [`options.markedOptions.renderer.heading`](#markedoptions).

### Required properties

#### src
Type: `string`

The directory where the source posts are located.

#### dest
Type: `string`

The directory where pages are generated.

#### layout
Type: `string`

The [jade](https://github.com/visionmedia/jade), [EJS](https://github.com/visionmedia/ejs), or [Handlebars](http://handlebarsjs.com/) layout template used for each post. The post metadata will be stored in a `post` object to be rendered in the layout template. Posts also have access to other posts via the `posts` array, and know about their `currentIndex` within the array so that they can optionally create navigation to nearby posts. [Here](https://github.com/CabinJS/grunt-pages/blob/master/test/fixtures/integration/input/target2/layouts/post.jade) is an example post layout template.

##### Handlebars partials

Handlebars partials can be specified using the `options.partials` property. This allows you to specify a file glob of partials to use in your layout and page templates. The partials are available as the basename of the partial file, so a file with the path `src/layouts/partials/nav.hbs` would be referenced as `{{> nav}}` Here is an example config which shows how to configure Handlebars partials:

```js
target4: {
  src: 'posts',
  dest: 'dest4',
  layout: 'src/layouts/post.hbs',
  url: 'blog/posts/:title/',
  options: {
    partials: 'src/layouts/partials/**/*.hbs'
  }
}
```

**Note: you can run grunt-pages with the `--debug` flag set to see all the data passed to templates for rendering**.

#### url
Type: `string || function`

The URL format of each post. When specified as a string, the `url` takes variables as parameters using the `:variable` syntax. Variables specified in the `url` are required in each post's metadata. URLs with a trailing `/` will generate posts as index.html files inside of the URL's folder.

You can also specify the `url` as a function which receives a post's metadata and grunt options object and returns the post's url. Note that the post metadata also includes the `sourcePath` of the post and `lastModified` time. This is used to maintain legacy post urls when migrating from another static site tool and to account for post titles that have all special characters(foreign languages).

Here is an example config which demonstrates how to implement the `url` as a function:

```js
pages: {
  customURL: {
    src: 'posts',
    dest: 'dist',
    url: function (post, options) {
      // use post source path and apply default post url formatting
      return options.formatPostUrl(post.sourcePath.replace('.md', '/'));
    }
  }
}
```

Parsed posts are cached in the `.grunt/grunt-pages` folder  based on the `lastModified` time to improve the task run time.

*Note: posts are not re-compiled when the grunt config changes, you can either run the task with the `--no-cache` flag or delete the `.grunt/grunt-pages` folder to force all posts to be re-built.*

### Options

#### pageSrc
Type: `string`

The folder where the jade, EJS, or Handlebars source pages of your website are located. These pages have access to each post's `content` and metadata properties via a `posts` array. Additionally, pages have access to their own filename(without extension) via the `currentPage` variable to optionally display it differently when linking to pages. All of the files in this folder are generated in the `dest` folder maintaining the same relative path from `options.pageSrc`.

#### data
Type: `object || string`

A JavaScript object or the location of a JSON file which is passed as data to templates. This option is primarily used to specify config that is shared across all pages. It is available in page and post templates via the `data` object.

#### markedOptions
Type: `function || object`

You can configure how [marked](https://github.com/chjj/marked) parses your markdown by overriding options here. Check out the [marked options](https://github.com/chjj/marked#options-1) to see what you can alter. When `options.markedOptions` is implemented as a function, it receives `marked` as an argument so you can instantiate `marked.Renderer` and override particular properties.

*Note: all marked renderer methods are extened to have access to the current `post` as an extra argument.*

#### rss
Type: `object`

An object containing config for RSS feed generation.

All [options accepted by dylang/node-rss](https://github.com/dylang/node-rss#feed-options) are supported, with notable options listed below.

Here is a sample config to create a blog with an RSS feed using grunt-pages:
```js
pages: {
  options: {
    pageSrc: 'src/pages',
    rss: {
      title: 'Chris Wren\'s Blog',
      description: 'A blog about code.',
      url: 'http://chrisawren.com'
    }
  },
  posts: {
    src: 'posts',
    dest: 'dev',
    layout: 'src/layouts/post.jade',
    url: 'posts/:title/'
  }
}
```

#### Required RSS properties

##### rss.url
Type: `string`

The URL of your site.

##### rss.title
Type: `string`

The title of the feed.

##### rss.description
Type: `string`

Short description of the feed.

#### Optional RSS properties

##### rss.numPosts
Type: `number` Default: `10`

Number of posts to output in the RSS feed. This is used to avoid hitting a max file size limit.

##### rss.author
Type: `string`

The feed owner. Also used as `managingEditor` and `webMaster` if those options are not specified.

##### rss.path
Type: `string`

The path of the file to store the RSS XML in. This is specific to grunt-pages and is not part of dylang/node-rss.

#### pagination
Type: `object || array`

Object or an array of objects containing config for pagination. This option generates paginated list pages which each contain a specified group of posts.

### Config using the default pagination scheme

```js
pages: {
  options: {
    pagination: {
      postsPerPage: 3,
      listPage: 'src/layouts/listPage.jade'
    }
  },
  posts: {
    src: 'posts',
    dest: 'dev',
    layout: 'src/layouts/post.jade',
    url: 'posts/:title/'
  }
}
```

This config will generate paginated list pages by grouping the specified number of posts per page and using the default url scheme specified in the [pagination.url](#paginationurl) parameter.

##### pagination.postsPerPage
Type: `number`

The number of posts each list page will contain.

##### pagination.listPage
Type: `string`

The location of the layout template which is used for each list page. This page will not be rendered as a regular page if `options.pageSrc` is specified. Instead it will be rendered as the root paginated list page with the first post group instead of all the posts. [Here](https://github.com/CabinJS/grunt-pages/blob/master/test/fixtures/integration/input/target2/pages/blog/index.jade) is a sample `options.pagination.listPage` template. This template has access to the following variables:

###### posts
Type: `array` of `object`s

An array of post objects assigned to this page which each contain the post `content` and other metadata properties of the post.

###### pages
Type: `array` of `object`s

An array of page objects which each contain a `url` and `id` property.

###### currentIndex
Type: `number`

A reference to the index of the list page currently being rendered. This can be used to display the current page differently than the rest of the pages in a list, or to display links to the surrounding pages based on their position relative to the `currentIndex`.

##### pagination.url
Type: `string` Default: `pages/:id/`

The location of the generated list pages relative to the `options.pagination.listPage`. You can override this property to have a custom url scheme for list pages. You **must** have a `:id` variable in your url scheme which will be replaced by the page's id.

### Config using a custom pagination scheme

To paginate in a custom manor, you can use the following parameter:

##### pagination.getPostGroups
Type: `function`

Default: `Group by options.pagination.postsPerPage`

```js
function (postCollection, pagination) {
var postsPerPage = pagination.postsPerPage;
    var postGroups = [];
    var postGroup;
    var i = 0;

    while ((postGroup = postCollection.slice(i * postsPerPage, (i + 1) * postsPerPage)).length) {
      postGroups.push({
        posts: postGroup,
        id: i
      });
      i++;
    }
    return postGroups;
}
```

This function returns an array of post groups to be rendered as list pages. It takes the `posts` array and `options.pagination` config object as parameters and is expected to return an array of postGroup objects which each contain the `id` of the group(to be used in the url) and the array of `posts` in the following format:

```js
[{
  id: 'javascript',
  posts: [{
    title: 'Front end web development',
    tags: ['javascript', 'css'],
    content: '...'
  }, {
    title: 'Backbone.js',
    tags: ['javascript'],
    content: '...'
  }]
}, {
  id: 'css',
  posts: [{
    title: 'Style and Sass',
    tags: ['css'],
    content: '...'
  },{
    title: 'Front end web development',
    tags: ['javascript', 'css'],
    content: '...'
  }]
}];
```

Here is a sample pagination config which paginates using the `tags` property of each post:

```js
pages: {
  options: {
    pagination: {
      listPage: 'src/layouts/tagListPage.jade',
      getPostGroups: function (posts) {
        var postGroups = {};

        posts.forEach(function (post) {
          post.tags.forEach(function (tag) {
            tag = tag.toLowerCase();
            if (postGroups[tag]) {
              postGroups[tag].posts.push(post);
            } else {
              postGroups[tag] = {
                posts: [post]
              };
            }
          });
        });

        return grunt.util._.map(postGroups, function (postGroup, id) {
          return {
            id: id,
            posts: postGroup.posts
          };
        });
      }
    }
  },
  posts: {
    src: 'src/posts',
    dest: 'dev',
    layout: 'src/layouts/post.jade',
    url: 'posts/:title'
  }
}
```

#### sortFunction
Type: `function`

Default: Sort by `date` descending

```js
function (a, b) {
  return b.date - a.date;
}
```

A compare function used by [Array.sort](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort) to sort posts.

#### formatPostUrl
Type: `function`

Default:
```js
function (url) {
  return url
    .toLowerCase() // change everything to lowercase
    .replace(/^\s+|\s+$/g, '') // trim leading and trailing spaces
    .replace(/[_|\s|\.]+/g, '-') // change all spaces, periods and underscores to a hyphen
    .replace(/[^a-z\u0400-\u04FF0-9-]+/g, '') // remove all non-cyrillic, non-numeric characters except the hyphen
    .replace(/[-]+/g, '-') // replace multiple instances of the hyphen with a single instance
    .replace(/^-+|-+$/g, ''); // trim leading and trailing hyphens
}
```

A function that takes a `url` as a parameter and returns a formatted URL string. This is primarily used to remove special characters and replace whitespace.

#### metadataValidator
Type: `function`

A function that takes an array of `posts` as the first argument and the `templateData` to be passed to posts as a second argument in order to determine if the supplied metadata is valid for the posts. This is helpful in catching issues when metadata is forgotten or invalid like having two posts with the same `index` property when displaying posts in a list. It can also be used to record information about posts and add new information to `templateData` for rendering in templates after posts have been processed.

#### templateEngine
Type: `string`

The file extension of the template engine to be used. This option filters template files in the `options.pageSrc` folder when developing a grunt-pages configuration for multiple template engines.

# Changelog

**0.11.2** - Add `templateData` argument to `metadataValidator` option.

**0.11.1** - Fixed leading `/` issue for post URLs. Added `post.sourcePath` and `post.lastModified` to template data. Added current `post` as an extra argument to all marked renderer methods. Added `metadataValidator` option to ensure metadata is proper for all posts. Added `--no-cache` flag to invalidate caching when altering how posts are parsed.

**0.11.0** - Fixed required RSS properties, now correctly matching the [RSS spec](http://cyber.law.harvard.edu/rss/rss.html), thanks to [@rogeriopvl](https://github.com/rogeriopvl). Added [Handlebars support with partials](https://github.com/CabinJS/grunt-pages#handlebars-partials) thanks to [@thomasboyt](https://github.com/thomasboyt). Updated to marked ~0.3.0 now supporting [`options.markedOptions`](#markedoptions) to configure any [marked options](https://github.com/chjj/marked#options-1) that you desire.

**Breaking changes:**
- `options.rss.description` is now required, and `options.rss.author` is not.
- Updated to jade 1.0, check [here](https://github.com/visionmedia/jade/blob/master/History.md#100--2013-12-22) for the changelog.

**0.10.1** - [`url`](#url) can now be specified as a function to allow for foreign language post titles and to support legacy URLs for those migrating to grunt-pages from another static site tool.

**0.10.0** - Added [`options.rss.numPosts`](#rssnumposts) option to determine the number of posts included in the RSS feed, defaulting to 10. Header links now use the same URL formatting function as post URLs.

**Breaking changes:**

- The generated RSS feed now uses the first 10 posts(after sorting) instead of all of them to prevent a max file size error in RSS readers.
- Header links now use the same URL formatting function as post URLs.

**0.9.1** - Fixed bug where the `options.pagination.listPage` wasn't properly ignored for certain filenames.

**0.9.0** - Posts now have access to their `currentIndex` within the `posts` array for navigating between nearby posts. Parsed posts are now cached in the `.grunt/grunt-pages` folder instead of `node_modules/grunt-pages` to provide more visibility and follow Grunt conventions. Header anchor tags now have correct attribute spacing thanks to [@gmarty](https://github.com/gmarty). Improved template debugging by printing data passed to template when an error is encountered. Reduced `--debug` output for post content to allow for easier debugging. 

**Breaking changes:**

- Parsed posts are now cached in the `.grunt/grunt-pages` folder instead of `node_modules/grunt-pages`.
- Jade template output is no longer pretty printed unless `--debug` is specified.
- Posts no longer have access to the post `dest` property which was mistakenly leaked to the template.

**0.8.3** - Posts without the `date` specified now default to using the post's last modified time as the date thanks to [@danburzo](https://github.com/danburzo). Fixed bug where draft posts in nested folders weren't ignored properly.

**0.8.2** - Temporarily reverted bug fix as caching issues resulted from code change.

**0.8.1** - Fixed bug where draft posts in nested folders weren't ignored properly. 

**0.8.0** - Header tags are now rendered with a child span and anchor tag for linking into post sections. Removed support for YAML metadata. Added more robust metadata extraction for JavaScript object metadata. Added `--debug` flag to debug template data rendering. Standardized error logging to use the same format. 

**Breaking changes:**

- Header tags are now rendered with a nested span and anchor tag for linking into post sections instead of being wrapped with anchor tags.
- No more YAML metadata in posts.

**0.7.2** - Added support for Python 3 due to updating of [node-pygmentize-bundled](https://github.com/rvagg/node-pygmentize-bundled/) dependency. 

**0.7.1** - Wrong node_modules were pushed to npm. Pushed correct dependencies listed in package.json to fix bug. 

**0.7.0** - See breaking changes below. 

**Breaking changes:**

- Pagination urls now have trailing `index.html` sections removed by default. The pagination url for a root list page is now `''` instead of `/` to allow for [base](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/base) tags. Updated default [pagination.url](#paginationurl) to `pages/:id/` following new scheme that doesn't use `index.html`'s.

**0.6.1** - Removed accidental logging pushed to npm.

**0.6.0** - Updated pagination urls to not have a leading `/`.

**Breaking changes:**

- Pagination urls will no longer have a leading `/` by default. This is a bug fix and the implementation now matches what is documented in the [pagination.url](#paginationurl) API.

**0.5.0** - Updated default post url regex to capture more cases thanks to [@justinhelmer](https://github.com/justinhelmer). Fixed bugs regarding normalizing the post dest and ignoring draft posts thanks to [@justinhelmer](https://github.com/justinhelmer).

**Breaking changes:**

- Post urls will potentially be altered because of the new regex. To update, you will have to provide redirects to altered post urls if you need to maintain them i.e. social media share buttons.

**0.4.1** - `.html` excluded from post url :variable replacement.

**0.4.0** - Altered post url to *not* automatically add `.html` to urls.

**Breaking changes:**

- Post urls will now require .html to be listed explicitly to be in the url. The recommended convention is to put each post in its own folder, like `posts/:title/` so that a post with the title `hello` would be generated at posts/hello/index.html.

**0.3.3** - Added lodash as a hard dependency.

**0.3.2** - Added post caching for unmodified posts to speed up task.

**0.3.1** - Added [rss option](#rss) to generates feeds thanks to [@lazd](https://github.com/lazd).

**0.3.0** - Altered pagination API to allow for custom pagination schemes.

**Breaking changes:**

- Paginated pages no longer have a `currentPage` as a property of the current page in the `pages` array, rather it is exposed as a global variable called  `currentIndex` for easier accessibility.

**0.2.5** - Fixed metadata parsing bug, added `formatPostUrl` option & added `pagination.url` option.

**0.2.4** - Added `sortFunction` option & allowed for `data` option to take an object as a parameter.

**0.2.3** - Ignored dotfiles, added error reporting for incorrect data JSON files, and added new header anchor link format.

**0.2.2** - Used forked version of marked to enable header anchor links.

**0.2.1** - Added support for `_` prefixed draft posts and pages now receive their filename as a `currentPage` variable.

**0.2.0** - Fixed `templateEngine` bug, changed `pagination` and `data` api.

**0.1.0** - Added `data` option, added `templateEngine` option, added `pagination` option, and changed post data format to be a `post` object rather than global variables for each post property.

**0.0.0** - Initial release.
