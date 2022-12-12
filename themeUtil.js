var getElementUISeries = require('./forElementUI/getElementUISeries')
var varyColor = require('./client/varyColor')
var changeSelector = require('./forElementUI/changeSelector')

module.exports = {
    getElementUISeries: getElementUISeries,
    varyColor: varyColor,
    changeSelector: changeSelector,
    getMyColors: function (primaryColor, arrOtherColors) {
        return  getElementUISeries(primaryColor, arrOtherColors);
    }
}
