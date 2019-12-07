var AssetsExtractor = require('./AssetsExtractor')
var path = require('path')
var fs = require('fs')
var glob = require('glob')
var mkdirp = require('mkdirp')

/*
nodeRun({
    src: ['/a/b/c.css', 'src/css/*.*'],
    fileName: 'dist/css/theme-colors.[contenthash:8].css',
    matchColors: ......
})
*/
module.exports = function run(options) {
    var mockAssets = getMockAssets(options);
    var code = new AssetsExtractor(options).extractAssets(mockAssets)

    var outFile = getFileName(options.fileName, code);
    mkdirp.sync(path.dirname(outFile))
    fs.writeFileSync(outFile, code)
    return code
}

function getMockAssets(options) {
    var mockAssets = {}
    var srcList = [].concat(options.src)
    srcList.map(src => {
        glob.sync(path.resolve(src)).map(pathFn => {
            var fn = path.relative('.', pathFn)
            var content = fs.readFileSync(pathFn, 'utf-8')
            mockAssets[fn] = { source: t => content }
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
            outFile = outFile.replace('[contenthash:' + len + ']', md5(code).slice(0, len))
        }
    }
    return outFile;
}

function md5(str) {
    var md5 = require('crypto').createHash('md5');
    return md5.update(str).digest('hex');
}
