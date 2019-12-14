var nodeRun = require('../../src/nodeRun')
var path = require('path')
var fs = require('fs')
var glob = require('glob')
var mkdirp = require('mkdirp')
var options = require('../options')
var themeColorChanger = require('../../client/themeColorChanger')
var getElementUISeries = require('../../forElementUI/getElementUISeries')

startRun()

function startRun() {
    var files = glob.sync(path.join(__dirname, 'output-by-webpack/*.*'))
    files.map(extractOne)
}

function extractOne(pathFn) {
    var fn = path.basename(pathFn)
    var content = fs.readFileSync(pathFn, 'utf-8')
    var outFile = path.join(__dirname, './dist/' + fn + '.css')
    var code = nodeRun({
        ...options.build,
        src: pathFn,
        fileName: outFile,
    })

    console.log('Output length:', code.length, '\n' + outFile)


    var replacedCss = themeColorChanger.replaceCssText(code, options.build.matchColors, options.runtime.newColors)

    var replacedFn = path.join(__dirname, './dist/' + fn + '-replaced.css')
    fs.writeFileSync(replacedFn, replacedCss)
}
