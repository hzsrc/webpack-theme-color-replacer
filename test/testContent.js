var path = require('path');
var baseDir = path.resolve('.');
module.exports = function (srcRaw, src, outputFile, option, isNewColor) {
    if (src === '') return console.error('File is Empty:\t' + outputFile)
    var colorRegs = getContainedColors(srcRaw, option, isNewColor);
    test(src, outputFile, colorRegs)
}

function getContainedColors(srcRaw, option, isNewColor) {
    //排除js中的颜色，只判断css
    ///srcRaw = srcRaw.split('\n').filter(line => /\.push\(\[\w+\.\w,/.test(line)).join('\n');
    srcRaw = srcRaw.replace(/__theme_COLOR_cfg.+\]\};/, '')
    srcRaw = srcRaw.replace(/matchColors:[\s\S]+?\]/g, '')
    srcRaw = srcRaw.replace(/newColors:[\s\S]+?\]/g, '')

    var ret = [];
    option.matchColors.map((color, i) => {
        var reg = getReg(color);
        if (reg.test(srcRaw)) {
            ret.push(isNewColor ? getReg(option.newColors[i]) : reg)
        }
    })
    return ret
}

function getReg(color) {
    return new RegExp(color.replace(/,/g, ',\\s*'), 'ig')
}

function test(src, file, colorRegs) {
    colorRegs.forEach(reg => {
        reg.lastIndex = 0;
        if (!reg.test(src)) {
            console.error(`Failed: ${reg} not in ${file.substr(baseDir.length)}.`)
        }
    })
}
