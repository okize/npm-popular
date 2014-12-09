[![NPM version](http://img.shields.io/npm/v/npm-popular.svg?style=flat)](https://www.npmjs.org/package/npm-popular)
[![Dependency Status](http://img.shields.io/david/okize/npm-popular.svg?style=flat)](https://david-dm.org/okize/npm-popular)
[![Downloads](http://img.shields.io/npm/dm/npm-popular.svg?style=flat)](https://www.npmjs.org/package/npm-popular)

# npm-popular

## Description
CLI tool that returns a list of an author's NPM modules ordered by number of downloads.

## Usage

```
Usage:

  npm-popular [npm-author-name] -options

Description:

  CLI tool that returns a list of an author's NPM modules ordered by number of downloads.

Options:

  -t, --total          Display total module downloads (default)
  -m, --month          Display module downloads for the past month
  -n, --noColor        Suppress colorization of output
  -h, --help           Output usage information
  -V, --version        Output version number

Examples:

  $ npm-popular jdalton
  $ npm-popular substack
  $ npm-popular hughsk -m

```

## Installing

```
  $ [sudo] npm install -g npm-popular
```

## License

Released under the [MIT License](http://www.opensource.org/licenses/mit-license.php).
