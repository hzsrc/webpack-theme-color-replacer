var AssetsExtractor = require('./AssetsExtractor')
var path = require('path')
var fs = require('fs')
var glob = require('glob')
var mkdirp = require('mkdirp')

/*
// use in Nodejs:
var extractColor = require('webpack-theme-color-replacer/src/nodeRun')
extractColor({
    src: 'css/*.*',
    fileName: 'css/theme-color-[contenthash:8].css',
    matchColors: ['#e2721d', '#ccc']
})
*/
module.exports = function run(options) {
    var mockAssets = getMockAssets(options);
    var code = new AssetsExtractor(options).extractAssets(mockAssets)

    var outFile = getFileName(options.fileName, code);
    mkdirp.sync(path.dirname(outFile))
    fs.writeFileSync(outFile, code)
    return { code, outFile }
}

function getMockAssets(options) {
    var mockAssets = {}
    var srcList = [].concat(options.src)
    srcList.map(src => {
        glob.sync(path.resolve(src)).map(pathFn => {
            var fn = path.relative('.', pathFn)
            mockAssets[fn] = { source: () => fs.readFileSync(pathFn, 'utf-8') }
        })
    })
    return mockAssets;
}

function getFileName(outFile, code) {
    var p1 = outFile.indexOf('contenthash:')
    if (p1 > -1) {
        p1 += 12
        var p2 = outFile.indexOf(']', p1)
        if (p2 > p1) {
            var len = outFile.substr(p1, p2 - p1)
            outFile = outFile.replace('[contenthash:' + len + ']', getHash(code).slice(0, len))
        }
    }
    return outFile;
}

function getHash(str) {
    var md = require('crypto').createHash('md4');
    return md.update(str).digest('hex');
}
