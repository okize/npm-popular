var clearTerminal, dateToday, getAllModuleDownloads, getAuthorsModules, getDownloadsUrl, getModuleDownloads, getTotalDownloads, printAuthorModules, printModuleStats, printModuleTotals, registry, request, sortModulesByDownloads, when_;

registry = require('npm-stats')();

when_ = require('when');

request = require('request');

clearTerminal = function() {
  return process.stdout.write('\u001B[2J\u001B[0;0f');
};

dateToday = function() {
  var day, month, now;
  now = new Date();
  day = ('0' + now.getDate()).slice(-2);
  month = ('0' + (now.getMonth() + 1)).slice(-2);
  return "" + (now.getFullYear()) + "-" + month + "-" + day;
};

printAuthorModules = function(type, author, count) {
  if (type === 'month') {
    return console.log("" + author + "'s module downloads in the last month:\n");
  } else {
    return console.log("" + author + " has published " + count + " modules:\n");
  }
};

printModuleStats = function(module) {
  return console.log("☉ " + module.name + " has been downloaded " + module.downloads + " times");
};

printModuleTotals = function(data) {
  var module, _i, _len, _results;
  _results = [];
  for (_i = 0, _len = data.length; _i < _len; _i++) {
    module = data[_i];
    _results.push(printModuleStats(module));
  }
  return _results;
};

getDownloadsUrl = function(type, module) {
  if (type === 'month') {
    return "https://api.npmjs.org/downloads/point/last-month/" + module;
  } else {
    return "https://api.npmjs.org/downloads/range/2012-01-01:" + (dateToday()) + "/" + module;
  }
};

getTotalDownloads = function(data, key) {
  var total;
  if (isNaN(data)) {
    return total = Object.keys(data).reduce((function(previous, i) {
      return previous + data[i][key];
    }), 0);
  } else {
    return data;
  }
};

sortModulesByDownloads = function(arr, key) {
  var sorted;
  return sorted = arr.sort(function(a, b) {
    var x, y;
    x = a[key];
    y = b[key];
    if (x > y) {
      return -1;
    } else {
      if (x < y) {
        return 1;
      } else {
        return 0;
      }
    }
  });
};

getAuthorsModules = function(author) {
  var deferred;
  deferred = when_.defer();
  registry.user(author).list(function(err, data) {
    if (err) {
      deferred.reject(new Error(err));
    }
    if (data.length === 0) {
      return deferred.reject(new Error("No NPM modules found for user " + author + "!"));
    } else {
      return deferred.resolve(data);
    }
  });
  return deferred.promise;
};

getModuleDownloads = function(module, type) {
  var deferred, url;
  deferred = when_.defer();
  url = getDownloadsUrl(type, module);
  request(url, function(err, response, body) {
    var obj;
    if (err) {
      return deferred.reject(new Error(err));
    } else {
      obj = {
        name: module,
        downloads: getTotalDownloads(JSON.parse(body).downloads, 'downloads')
      };
      return deferred.resolve(obj);
    }
  });
  return deferred.promise;
};

getAllModuleDownloads = function(modules, type) {
  var deferreds, i, len;
  deferreds = [];
  i = 0;
  len = modules.length;
  while (i < len) {
    deferreds.push(getModuleDownloads(modules[i], type));
    i++;
  }
  return when_.all(deferreds);
};

module.exports = function(author, opts) {
  clearTerminal();
  return getAuthorsModules(author).then(function(modules) {
    var type;
    type = opts.month ? 'month' : 'all-time';
    printAuthorModules(type, author, modules.length);
    return getAllModuleDownloads(modules, type).then(function(data) {
      return sortModulesByDownloads(data, 'downloads');
    }, function(err) {
      return console.error(err);
    });
  }, function(err) {
    return console.error(err);
  }).then(function(data) {
    return printModuleTotals(data);
  });
};
