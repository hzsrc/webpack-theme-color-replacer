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
    color1 = color1.replace('#', '');
    color2 = color2.replace('#', '');
    if (weight1 === undefined) weight1 = 0.5;
    if (alpha1 === undefined) alpha1 = 1;
    if (alpha2 === undefined) alpha2 = 1;

    var w = 2 * weight1 - 1;
    var alphaDelta = alpha1 - alpha2;
    var w1 = (((w * alphaDelta === -1) ? w : (w + alphaDelta) / (1 + w * alphaDelta)) + 1) / 2;
    var w2 = 1 - w1;

    var nums1 = toNum3(color1);
    var nums2 = toNum3(color2);
    var r = Math.round(w1 * nums1[0] + w2 * nums2[0]);
    var g = Math.round(w1 * nums1[1] + w2 * nums2[1]);
    var b = Math.round(w1 * nums1[2] + w2 * nums2[2]);
    return '#' + pad2(r) + pad2(g) + pad2(b)
}

function rgbaToRgb(colorStr, alpha, bgColorStr) {
    var rgb = toNum3(colorStr);
    var bgRgb = toNum3(bgColorStr || 'fff')
    var r = rgb[0], g = rgb[1], b = rgb[2]
    r = Math.round((1 - alpha) * bgRgb[0] + alpha * r)
    g = Math.round((1 - alpha) * bgRgb[1] + alpha * g)
    b = Math.round((1 - alpha) * bgRgb[2] + alpha * b)
    return '#' + pad2(r) + pad2(g) + pad2(b)
}

function toNum3(colorStr) {
    if (colorStr.length === 3) {
        colorStr = colorStr[0] + colorStr[0] + colorStr[1] + colorStr[1] + colorStr[2] + colorStr[2]
    }
    var r = parseInt(colorStr.slice(0, 2), 16)
    var g = parseInt(colorStr.slice(2, 4), 16)
    var b = parseInt(colorStr.slice(4, 6), 16);
    return [r, g, b]
}

