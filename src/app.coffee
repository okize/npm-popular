# modules
registry = require('npm-stats')()
when_ = require 'when'
request = require 'request'

clearTerminal = ->
  process.stdout.write '\u001B[2J\u001B[0;0f'

dateToday = ->
  now = new Date()
  day = ('0' + now.getDate()).slice(-2)
  month = ('0' + (now.getMonth() + 1)).slice(-2)
  "#{now.getFullYear()}-#{month}-#{day}"

printAuthorModules = (author, count) ->
  console.log "#{author} has published #{count} modules:\n"

printModuleStats = (module) ->
  console.log "* #{module.name} has been downloaded #{module.downloads} times"

printModuleTotals = (data) ->
  printModuleStats module for module in data

getDownloadsUrl = (module) ->
  "https://api.npmjs.org/downloads/range/2012-01-01:#{dateToday()}/#{module}"

getTotalDownloads = (data, key) ->
  total = Object.keys(data).reduce ((previous, i) ->
    previous + data[i][key]
  ), 0

sortModulesByDownloads = (arr, key) ->
  sorted = arr.sort (a, b) ->
    x = a[key]
    y = b[key]
    if (x > y) then -1 else (if (x < y) then 1 else 0)

getAuthorsModules = (author) ->
  deferred = when_.defer()
  registry.user(author).list( (err, data) ->
    if err
      deferred.reject new Error(err)
    if data.length == 0
      deferred.reject(new Error("No NPM modules found for user #{author}!"))
    else
      deferred.resolve(data)
  )
  deferred.promise

getModuleDownloads = (module) ->
  deferred = when_.defer()
  url = getDownloadsUrl(module)
  request(url, (err, response, body) ->
    if err
      deferred.reject new Error(err)
    else
      obj =
        name: module
        downloads: getTotalDownloads JSON.parse(body).downloads, 'downloads'
      deferred.resolve obj
  )
  deferred.promise

getAllModuleDownloads = (modules) ->
  deferreds = []
  i = 0
  len = modules.length
  while i < len
    deferreds.push getModuleDownloads(modules[i])
    i++
  when_.all(deferreds)

module.exports = (author) ->

  # clear the terminal window
  clearTerminal()

  getAuthorsModules(author).then( (modules) ->

    printAuthorModules(author, modules.length)

    getAllModuleDownloads(modules).then( (data) ->
      sortModulesByDownloads(data, 'downloads')
    , (err) ->
      console.error err
    )

  , (err) ->

    console.error err

  ).then( (data) ->

    # console.log getTotalDownloads data, 'downloads'

    printModuleTotals(data)

  )
