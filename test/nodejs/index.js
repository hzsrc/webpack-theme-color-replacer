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
    files.map(file => extractOne(file, options.build, testContent.build))

    files = glob.sync(path.join(__dirname, 'output-by-webpack-dev/*.*'))
    files.map(file => extractOne(file, options.dev, testContent.dev))
}

function extractOne(pathFn, option, testFn) {
    var fn = path.basename(pathFn)
    var fileName = path.join(__dirname, './dist/' + fn + '.css')
    var { code, outFile } = nodeRun({
        ...option,
        src: pathFn,
        fileName,
        isJsUgly: true,
    })

    console.log('Output length:', code.length, '\t' + path.basename(outFile))

    var replacedCss = themeColorChanger.replaceCssText(code, option.matchColors, option.newColors)

    var replacedFn = path.join(__dirname, './dist/' + fn + '-replaced.css')
    fs.writeFileSync(replacedFn, replacedCss)

    //检查输出结果
    testFn(code, outFile, false)
    testFn(replacedCss, replacedFn, true)
}

