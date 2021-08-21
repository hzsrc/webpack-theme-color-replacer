const postcss = require('postcss');
const postcssPlugin = require('../../src/postcss.js');


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

    var files = glob.sync(path.join(__dirname, 'output-by-webpack/*.css'))
    var ok1 = files.map(async file => await extractOne(file, options.build)).every(ok => ok)

    console.log('Test end.')
    process.exit(ok1 ? 0 : 1)
}

async function extractOne(pathFn, option) {
    var fn = path.basename(pathFn)
    var fileName = path.join(__dirname, './dist/' + fn + '.css')
    var { code, outFile } = await nodeRun({
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


async function nodeRun(opts) {
    var { src } = opts
    var code0 = fs.readFileSync(src, 'utf-8');
    try {
        var p = postcss([postcssPlugin(options.build)])
        p.process(code0, { from: 'a.css' }).then(res => {
            debugger
        })
    } catch (e) {
        debugger
        console.error(e)
    }
    debugger
    console.log(33, code)
    var outFile = replaceFileName(opts.fileName, code);
    return { code, outFile }
}
