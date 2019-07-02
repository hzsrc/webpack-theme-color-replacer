
var AssetsExtract = require('../../src/AssetsExtractor')
var Extractor = require('../../src/Extractor')
var path = require('path')
var fs = require('fs')
var glob = require('glob')
var options = require('../options')

var files = glob.sync(path.join(__dirname, 'output-by-webpack/*.*'))
files.map(extractOne)

function extractOne(pathFn) {
    var fn = path.basename(pathFn)
    var content = fs.readFileSync(pathFn, 'utf-8')

    var ret = new AssetsExtract(options).extractAsset(fn, {source: t => content})
    var code = ret.join('\n')
    var outFile = path.join(__dirname, '../dist/css/' + fn + '.css')
    fs.writeFileSync(outFile, code)
    console.log('Output length:', code.length, '\n' + outFile)
}

