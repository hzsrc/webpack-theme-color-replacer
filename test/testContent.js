var path = require('path');
var baseDir = path.resolve('.');
module.exports = function (srcRaw, src, outputFile, option, isNewColor) {
    if (src === '') {
        console.error('Failed: File is Empty.\t' + outputFile)
        return false
    }
    var colorRegs = getContainedColors(srcRaw, option, isNewColor);
    return colorRegs.length > 0 && test(src, outputFile, colorRegs)
}

//自动生成需要校验的颜色值
function getContainedColors(srcRaw, option, isNewColor) {
    //排除js中的颜色，只判断css
    ///srcRaw = srcRaw.split('\n').filter(line => /\.push\(\[\w+\.\w,/.test(line)).join('\n');
    srcRaw = srcRaw.replace(/my_var_12322.+\]\};/, '')
    srcRaw = srcRaw.replace(/matchColors"?:[\s\S]+?\]/g, '')
    srcRaw = srcRaw.replace(/newColors"?:[\s\S]+?\]/g, '')

    var ret = [];
    option.matchColors.map((color, i) => {
        var reg = getReg(color);
        if (reg.test(srcRaw)) {
            ret.push(isNewColor ? getReg(option.newColors[i]) : reg)
        }
    })
    if (ret.length === 0) {
        console.error('Failed: No colors matched! options.matchColors=', option.matchColors)
    }
    return ret
}

function getReg(color) {
    return new RegExp(color.replace(/\s/g, '').replace(/,/g, ',\\s*') + '([\\da-f]{2})?(\\b|\\)|,|\\s)', 'ig')
}

function test(src, file, colorRegs) {
    var ok = true;
    colorRegs.forEach(reg => {
        reg.lastIndex = 0;

        var fn = file.substr(baseDir.length + 1)
        if (!reg.test(src)) {
            ok = false
            console.error(`Failed: ${reg} not matched ${fn}.`)
        }// else {
        //    console.log('OK.', reg, fn);
        //}
    })
    return ok
}
