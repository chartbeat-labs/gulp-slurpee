# gulp-slurpee [![NPM version][npm-badge-img]][npm-url] [![Dependency Status](https://david-dm.org/chartbeat-labs/gulp-slurpee.png)](https://david-dm.org/chartbeat-labs/gulp-slurpee)

> Run the same [gulp][gulp-url] task from multiple gulpfile's concurrently.

gulp-slurpee is useful if you have a large project with multiple applications that all have their own gulpfile, and you want to run the same task for all of them at the same time.  For instance if you wanted to lint every project concurrently without creating a meta gulp-task you would use gulp-slurpee.


## Install

Install with [npm](https://npmjs.org/package/gulp-slurpee):

```sh
npm install --global gulp-slurpee
```


## Usage

```javascript
gulp-slurpee <directory[/subdirectory]> [<task>]
```

If no task is supplied it uses the `default` task.


Proxy a task to a directory:

```javascript
gulp-slurpee app
```

Proxy a task to a sub-directory:

```javascript
gulp-slurpee app/generator watch
```

Proxy a task to multiple directories:
```javascript
gulp-slurpee app/sites app/home build
```

If you give gulp-slurpee a directory that doesn't have a `gulpfile.js` it'll recursively look inside every child directory for a gulpfile.js and run the task for every `gulpfile.js` it finds.

With a directory structure like:

```sh
- app/
-   home/
-     gulpfile.js
-   about/
-     gulpfile.js
-   components/
-     components.js
```

And running:

```javascript
gulp-slurpee app build
```

`gulp-slurpee` will run the `build` task in the `app/home` and `app/about` directories. It won't run the task in `app/components` as it does not have a `gulpfile.js`.


## Changelog

### 1.1

- Allow usage via arguments to API.

### 1.0

- Initial release

## License

The MIT License (MIT)

Copyright (c) 2015 Chartbeat

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

[npm-badge-img]: https://badge.fury.io/js/gulp-slurpee.png
[npm-url]: https://npmjs.org/package/gulp-slurpee
[gulp-url]: https://github.com/wearefractal/gulp
