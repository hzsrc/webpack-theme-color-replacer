var changer = require('../client/themeColorChanger.js')
var getElementUISeries = require('./getElementUISeries.js')

var client = {
    version: '2.4.5',
    colorPrimary: '#409EFF' // element-ui default color
};

module.exports = {
    changeColor: function (options) {
        if (!options.cssUrl) {
            // console.warn('cssUrl required')
            return
        }
        var newColors = []
        var oldColors = []
        var primary = options.primary;
        if (primary) {
            //primary color series
            newColors = getElementUISeries(primary.newColor)
            oldColors = getElementUISeries(primary.oldColor)
        }
        //other custom colors
        var others = options.others;
        if (others) {
            newColors.push.apply(newColors, others.newColors)
            oldColors.push.apply(oldColors, others.oldColors)
        }

        var opt = {oldColors: oldColors, newColors: newColors, cssUrl: options.cssUrl}
        changer.changeColor(opt)
    },
    getElementUISeries: getElementUISeries,
}
