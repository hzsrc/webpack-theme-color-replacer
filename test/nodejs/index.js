var AssetsExtract = require('../../src/AssetsExtractor')
var Extractor = require('../../src/Extractor')
var path = require('path')
var fs = require('fs')
var glob = require('glob')
var mkdirp = require('mkdirp')
var options = require('../options')
var themeColorChanger = require('../../client/themeColorChanger')
var getElementUISeries = require('../../forElementUI/getElementUISeries')


function startRun() {
    // js是否压缩过
    options.isJsUgly = false

    var files = glob.sync(path.join(__dirname, 'output-by-webpack/*.*'))
    files.map(extractOne)
}

function extractOne(pathFn) {
    var fn = path.basename(pathFn)
    var content = fs.readFileSync(pathFn, 'utf-8')

    var ret = new AssetsExtract(options).extractAsset(fn, {source: t => content})
    var code = ret.join('\n')
    var outFile = path.join(__dirname, './css/' + fn + '.css')

    mkdirp.sync(path.dirname(outFile))

    fs.writeFileSync(outFile, code)
    console.log('Output length:', code.length, '\n' + outFile)


    var newColors = getElementUISeries('#bd3be7')
    var replacedCss = themeColorChanger.replaceCssText(code, options.matchColors, newColors)

    var replacedFn = path.join(__dirname, './css/' + fn + '-new.css')
    fs.writeFileSync(replacedFn, replacedCss)
}
