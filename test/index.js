var assetsExtract = require('../extractWebpackAssets')
var Extractor = require('../extractColors')
var path = require('path')
var fs = require('fs')
var pathFn = path.join(__dirname, 'test-webpack-output.js') // process.argv[process.argv.length - 1]
var fn = path.basename(pathFn)
var content = fs.readFileSync(pathFn, 'utf-8')

var isDebug = true
var options = {
    fileName: 'css/theme-colors.css',
    matchColors: '#e6f7ff,#bae7ff,#91d5ff,#69c0ff,#40a9ff,#1890ff,#096dd9,#0050b3,#003a8c,#002766'.split(','), // 主色系列
    // 改变样式选择器，解决样式覆盖问题
    changeSelector(selector) {
        switch (selector) {
            case '.ant-calendar-today .ant-calendar-date':
                return ':not(.ant-calendar-selected-day)' + selector;
            default:
                return selector;
        }
    },
}
var extractor = new Extractor(options)
var ret = assetsExtract.extractAsset(fn, {source: t => content}, extractor, isDebug)
var outFile = pathFn + '.css'
fs.writeFileSync(outFile, ret.join('\n'))
console.log('Output:', outFile)
console.log(ret)
