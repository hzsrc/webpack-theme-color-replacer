module.exports = {
// 淡化
    lighten,
    toNum3,
    rgba,
    pad2
}

function pad2(num) {
    var t = num.toString(16)
    if (t.length === 1) t = '0' + t
    return t
}

function lighten(colorStr, rate) {
    var nums = toNum3(colorStr);
    var r = nums[0], g = nums[1], b = nums[2];
    return rate === 0
        ? '#' + [pad2(r), pad2(g), pad2(b)].join('')
        : (
            r += Math.round(rate * (255 - r)),
                g += Math.round(rate * (255 - g)),
                b += Math.round(rate * (255 - b)),
                r = pad2(r),
                g = pad2(g),
                b = pad2(b),
            '#' + r + g + b
        )
}

function rgba(colorStr, rate) {
    var nums = toNum3(colorStr);
    var r = nums[0], g = nums[1], b = nums[2];
    return r = Math.round((1 - rate) * r),
        g = Math.round((1 - rate) * g),
        b = Math.round((1 - rate) * b),
        r = pad2(r),
        g = pad2(g),
        b = pad2(b),
    '#' + r + g + b
}

function toNum3(colorStr) {
    if (colorStr.length == 3) {
        colorStr = colorStr[0] + colorStr[0] + colorStr[1] + colorStr[1] + colorStr[2] + colorStr[2]
    }
    var r = parseInt(colorStr.slice(0, 2), 16)
    var g = parseInt(colorStr.slice(2, 4), 16)
    var b = parseInt(colorStr.slice(4, 6), 16);
    return [r, g, b]
}

