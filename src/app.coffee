# modules
registry = require('npm-stats')()

module.exports = (args) ->

  print = (name, total) ->

    console.log "#{name} has #{total} downloads"

  getDownloads = (name, i) ->
    registry.module(name).downloads( (err, data) ->

      throw err if err

      arr = [0]
      for downloads in data
        arr.push downloads.value

      total = arr.reduce (a,b) ->
        return a + b

      print name, total

    )

  registry.user(args[0]).list( (err, data) ->

    throw err if err

    for name, i in data

      getDownloads(name, i)

  )