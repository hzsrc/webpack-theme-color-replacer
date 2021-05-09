var getElementUISeries = require('./forElementUI/getElementUISeries')
var varyColor = require('./client/varyColor')

module.exports = {
    getElementUISeries: getElementUISeries,
    varyColor: varyColor,
    getMyColors: function (primaryColor, arrOtherColors) {
        var colors = getElementUISeries(primaryColor);
        [].push.apply(colors, arrOtherColors)
        return colors
    }
}
