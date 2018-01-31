
var express = require('express')
var app = express()

var chunkRoutes = require('./chunk.js')
chunkRoutes.addRoutes(app)

var images = require('./images.js')

images.updateRegionImages().catch(err => console.log(err));

app.use(express.static('web'))

function logErrors (err, req, res, next) {
  console.log("LOGGING ERRORS")
  console.error(err.stack)
  next(err)
}

function errorHandler (err, req, res, next) {
  res.status(500)
  res.json({ error: err })
}

app.use(logErrors)
app.use(errorHandler)
app.listen(3000, () => console.log('Example app listening on port 3000!'))
