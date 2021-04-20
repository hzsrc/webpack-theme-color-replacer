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
    glob.sync(path.join(__dirname, './dist/*.css')).map(file => fs.unlinkSync(file))

    var files = glob.sync(path.join(__dirname, 'output-by-webpack/*.*'))
    var ok1 = files.map(file => extractOne(file, options.build)).every(ok => ok)

    files = glob.sync(path.join(__dirname, 'output-by-webpack-dev/*.*'))
    var ok2 = files.map(file => extractOne(file, options.dev)).every(ok => ok)

    console.log('Test end.')
    process.exit(ok1 && ok2 ? 0 : 1)
}

function extractOne(pathFn, option) {
    var fn = path.basename(pathFn)
    var fileName = path.join(__dirname, './dist/' + fn + '.css')
    var { code, outFile } = nodeRun({
        ...option,
        src: pathFn,
        fileName,
        isJsUgly: true,
    })

    //console.log('Output length:', code.length, '\t' + path.basename(outFile))

    var replacedCss = themeColorChanger.replaceCssText(code, option.matchColors, option.newColors)

    var replacedFn = path.join(__dirname, './dist/' + fn + '-replaced.css')
    fs.writeFileSync(replacedFn, replacedCss)

    //检查输出结果
    var rawSrc = fs.readFileSync(pathFn, 'utf-8');
    var ok1 = testContent(rawSrc, code, outFile, option, false)
    var ok2 = testContent(rawSrc, replacedCss, replacedFn, option, true)
    return ok1 && ok2
}

