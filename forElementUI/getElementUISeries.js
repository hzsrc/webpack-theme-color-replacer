var varyColor = require('../client/varyColor')
module.exports = function (colorStr, arrOtherColors) {
    if (colorStr[0] === '#') colorStr = colorStr.slice(1)
    var colors = ['#' + colorStr, varyColor.toNum3(colorStr).join(',')]
    for (var i = 1; i <= 9; i++) {
        colors.push(varyColor.lighten(colorStr, Number((i / 10).toFixed(2))));
        colors.push(varyColor.darken(colorStr, Number((i / 10).toFixed(2))));
    }
    colors.push(varyColor.lighten(colorStr, 0.925));
    colors.push(varyColor.lighten(colorStr, 0.95));
    colors.push(varyColor.lighten(colorStr, 0.975));
    colors.push(varyColor.rrggbbToHsl(colorStr));
    [].push.apply(colors, arrOtherColors)
    return colors
}
