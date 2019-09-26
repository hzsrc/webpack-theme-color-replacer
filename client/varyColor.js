module.exports = {
    lighten: lighten, // 淡化
    darken: darken, // 加深
    mix: mix, // 混合
    toNum3: toNum3,
    rgb: rgbaToRgb,
    rgbaToRgb: rgbaToRgb,
    pad2: pad2
};

function pad2(num) {
    var t = num.toString(16);
    if (t.length === 1) t = '0' + t;
    return t
}

function lighten(colorStr, weight) {
    return mix('fff', colorStr, weight)
}

function darken(colorStr, weight) {
    return mix('000', colorStr, weight)
}

function mix(color1, color2, weight1, alpha1, alpha2) {
    color1 = dropPrefix(color1);
    color2 = dropPrefix(color2);
    if (weight1 === undefined) weight1 = 0.5;
    if (alpha1 === undefined) alpha1 = 1;
    if (alpha2 === undefined) alpha2 = 1;

    var w = 2 * weight1 - 1;
    var alphaDelta = alpha1 - alpha2;
    var w1 = (((w * alphaDelta === -1) ? w : (w + alphaDelta) / (1 + w * alphaDelta)) + 1) / 2;
    var w2 = 1 - w1;

    var rgb1 = toNum3(color1);
    var rgb2 = toNum3(color2);
    var r = Math.round(w1 * rgb1[0] + w2 * rgb2[0]);
    var g = Math.round(w1 * rgb1[1] + w2 * rgb2[1]);
    var b = Math.round(w1 * rgb1[2] + w2 * rgb2[2]);
    return '#' + pad2(r) + pad2(g) + pad2(b)
}

function rgbaToRgb(colorStr, alpha, bgColorStr) {
    return mix(colorStr, bgColorStr || 'fff', 0.5, alpha, 1 - alpha)
}

function toNum3(colorStr) {
    colorStr = dropPrefix(colorStr)
    if (colorStr.length === 3) {
        colorStr = colorStr[0] + colorStr[0] + colorStr[1] + colorStr[1] + colorStr[2] + colorStr[2]
    }
    var r = parseInt(colorStr.slice(0, 2), 16)
    var g = parseInt(colorStr.slice(2, 4), 16)
    var b = parseInt(colorStr.slice(4, 6), 16)
    return [r, g, b]
}

function dropPrefix(colorStr) {
    return colorStr.replace('#', '')
}
