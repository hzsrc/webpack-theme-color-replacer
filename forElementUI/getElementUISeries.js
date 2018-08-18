var varyColor = require('../client/varyColor')
module.exports = function (colorStr) {
    if (colorStr[0] = '#') colorStr = colorStr.slice(1)
    var colors = ['#' + colorStr, varyColor.toNum3(colorStr).join(',')]
    for (var i = 0; i <= 9; i++)
        colors.push(varyColor.lighten(colorStr, Number((i / 10).toFixed(2))));
    colors.push(varyColor.rgba(colorStr, 0.1))
    colors.push(varyColor.rgba(colorStr, 0.2))
    return colors
}