var nodeRun = require('../../src/nodeRun')
var path = require('path')
var fs = require('fs')
var glob = require('glob')
var mkdirp = require('mkdirp')
var options = require('../options')
var testContent = require('../testContent')
var themeColorChanger = require('../../client/themeColorChanger')
var getElementUISeries = require('../../forElementUI/getElementUISeries')

startRun()

function startRun() {
    var files = glob.sync(path.join(__dirname, 'output-by-webpack/*.*'))
    files.map(extractOne)
}

function extractOne(pathFn) {
    var fn = path.basename(pathFn)
    var fileName = path.join(__dirname, './dist/' + fn + '.css')
    var { code, outFile } = nodeRun({
        ...options.build,
        src: pathFn,
        fileName,
        isJsUgly: true,
    })

    console.log('Output length:', code.length, '\n' + path.basename(outFile))

    var replacedCss = themeColorChanger.replaceCssText(code, options.build.matchColors, options.runtime.newColors)

    var replacedFn = path.join(__dirname, './dist/' + fn + '-replaced.css')
    fs.writeFileSync(replacedFn, replacedCss)

    //检查输出结果
    testContent(code, outFile, false)
    testContent(replacedCss, replacedFn, true)
}

