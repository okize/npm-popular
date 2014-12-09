# modules
registry = require('npm-stats')()
when_ = require 'when'
request = require 'request'
chalk = require 'chalk'

# global setting to determine if colors are displayed or not
showColors = true

color = (type, str) ->
  if showColors
    switch type
      when 'error'
        chalk.bold.red str
      when 'author'
        chalk.blue str
      when 'module'
        chalk.magenta str
      when 'count'
        chalk.bold.white str
  else
    str

clearTerminal = ->
  process.stdout.write '\u001B[2J\u001B[0;0f'

dateToday = ->
  now = new Date()
  day = ('0' + now.getDate()).slice(-2)
  month = ('0' + (now.getMonth() + 1)).slice(-2)
  "#{now.getFullYear()}-#{month}-#{day}"

printAuthorModules = (type, moduleAuthor, moduleCount) ->
  author = color('author', moduleAuthor)
  count = color('count', moduleCount)
  if type is 'month'
    console.log "#{author}'s module downloads in the last month:\n"
  else
    console.log "#{author} has published #{count} modules:\n"

printModuleStats = (module) ->
  name = color('module', module.name)
  count = color('count', module.downloads)
  console.log "☉ #{name} has been downloaded #{count} times"

printModuleTotals = (data) ->
  printModuleStats module for module in data

getDownloadsUrl = (type, module) ->
  url = 'https://api.npmjs.org/downloads'
  switch type
    when 'month'
      "#{url}/point/last-month/#{module}"
    else
      "#{url}/range/2012-01-01:#{dateToday()}/#{module}"

getTotalDownloads = (data, key) ->
  if isNaN(data)
    # apparently it's possible to have a package registered with NPM that
    # is invalid & is returned as undefined which necessitates this type check
    if typeof data is 'object'
      total = Object.keys(data).reduce ((previous, i) ->
        previous + data[i][key]
      ), 0
    else
      data = 0
  else if (data == null)
    data = 0
  else
    data

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
      deferred.reject new Error(cError("No modules found for user #{author}!"))
    else
      deferred.resolve data
  )
  deferred.promise

getModuleDownloads = (module, type) ->
  deferred = when_.defer()
  url = getDownloadsUrl(type, module)
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

getAllModuleDownloads = (modules, type) ->
  deferreds = []
  i = 0
  len = modules.length
  while i < len
    deferreds.push getModuleDownloads(modules[i], type)
    i++
  when_.all(deferreds)

module.exports = (author, opts) ->

  clearTerminal()

  showColors = false if opts.noColor

  getAuthorsModules(author).then( (modules) ->

    type = if opts.month then 'month' else 'total'

    printAuthorModules(type, author, modules.length)

    getAllModuleDownloads(modules, type).then( (data) ->
      sortModulesByDownloads(data, 'downloads')
    , (err) ->
      console.error err
    )

  , (err) ->

    console.error err

  ).then( (data) ->

    printModuleTotals(data)

    # console.log getTotalDownloads data, 'downloads'

  )
