var assetsExtract = require('../extractWebpackAssets')
var Extractor = require('../extractColors')
var path = require('path')
var fs = require('fs')
var pathFn = path.join(__dirname, 'output-by-webpack.js') // process.argv[process.argv.length - 1]
var fn = path.basename(pathFn)
var content = fs.readFileSync(pathFn, 'utf-8')
var options = require('./options')

var isDebug = true

var extractor = new Extractor(options)
var ret = assetsExtract.extractAsset(fn, {source: t => content}, extractor, isDebug)
var outFile = pathFn + '.css'
fs.writeFileSync(outFile, ret.join('\n'))
console.log('Output:', outFile)
console.log(ret)
