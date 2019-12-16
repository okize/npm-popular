const registry = require('npm-stats')();
const when = require('when');
const request = require('request');
const chalk = require('chalk');

// global setting to determine if colors are displayed or not
let showColors = true;

const color = (type, str) => {
  if (showColors) {
    switch (type) {
      case 'error':
        return chalk.bold.red(str);
      case 'author':
        return chalk.blue(str);
      case 'module':
        return chalk.magenta(str);
      case 'count':
      default:
        return chalk.bold.white(str);
    }
  } else {
    return str;
  }
};

const clearTerminal = () => process.stdout.write('\u001B[2J\u001B[0;0f');

const dateToday = () => {
  const now = new Date();
  const day = `0${now.getDate()}`.slice(-2);
  const month = `0${now.getMonth() + 1}`.slice(-2);
  return `${now.getFullYear()}-${month}-${day}`;
};

const printAuthorModules = (type, moduleAuthor, moduleCount) => {
  const author = color('author', moduleAuthor);
  const count = color('count', moduleCount);
  if (type === 'month') {
    return console.log(`${author}'s module downloads in the last month:\n`);
  }
  return console.log(`${author} has published ${count} modules:\n`);
};

const printModuleStats = (module) => {
  const name = color('module', module.name);
  const count = color('count', module.downloads);
  console.log(`☉ ${name} has been downloaded ${count} times`);
};

const printModuleTotals = (data) => Array.from(data).map((module) => printModuleStats(module));

const getDownloadsUrl = (type, module) => {
  const url = 'https://api.npmjs.org/downloads';
  switch (type) {
    case 'month':
      return `${url}/point/last-month/${module}`;
    default:
      return `${url}/range/2012-01-01:${dateToday()}/${module}`;
  }
};

const getTotalDownloads = (data, key) => {
  if (Number.isNaN(data)) {
    // apparently it's possible to have a package registered with NPM that
    // is invalid & is returned as undefined which necessitates this type check
    if (typeof data === 'object') {
      return Object.keys(data).reduce((previous, i) => previous + data[i][key], 0);
    }
    data = 0;
  }
  if (data === null) {
    data = 0;
  }
  return data;
};

const sortModulesByDownloads = (arr, key) =>
  // eslint-disable-next-line implicit-arrow-linebreak
  arr.sort((a, b) => {
    const x = a[key];
    const y = b[key];
    if (x > y) {
      return -1;
    }
    if (x < y) {
      return 1;
    }
    return 0;
  });

const getAuthorsModules = (author) => {
  const deferred = when.defer();
  registry.user(author).list((err, data) => {
    if (err) {
      deferred.reject(new Error(err));
    }
    if (data.length === 0) {
      return deferred.reject(new Error(`No modules found for user ${author}!`));
    }
    return deferred.resolve(data);
  });
  return deferred.promise;
};

const getModuleDownloads = (module, type) => {
  const deferred = when.defer();
  const url = getDownloadsUrl(type, module);
  request(url, (err, response, body) => {
    if (err) {
      return deferred.reject(new Error(err));
    }
    const obj = {
      name: module,
      downloads: getTotalDownloads(JSON.parse(body).downloads, 'downloads'),
    };
    return deferred.resolve(obj);
  });
  return deferred.promise;
};

const getAllModuleDownloads = (modules, type) => {
  const deferreds = [];
  let i = 0;
  const len = modules.length;
  while (i < len) {
    deferreds.push(getModuleDownloads(modules[i], type));
    i++; // eslint-disable-line no-plusplus
  }
  when.all(deferreds);
};

module.exports = (author, opts) => {
  clearTerminal();

  if (opts.noColor) {
    showColors = false;
  }

  getAuthorsModules(author)
    .then(
      (modules) => {
        const type = opts.month ? 'month' : 'total';

        printAuthorModules(type, author, modules.length);

        getAllModuleDownloads(modules, type).then(
          (data) => sortModulesByDownloads(data, 'downloads'),
          (err) => console.error(err),
        );
      },

      (err) => console.error(err),
    )
    .then((data) => printModuleTotals(data));
};
