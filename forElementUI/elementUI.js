var changer = require('../client/themeColorChanger.js')
var getElementUISeries = require('./getElementUISeries.js')

var elementUI = {
    version: '2.4.5',
    colorPrimary: '#409EFF'
};

module.exports = {
    changeColor(newColor, oldColor, cssUrl) {
        if (!cssUrl) {
            cssUrl = 'https://unpkg.com/element-ui@' + elementUI.version + '/lib/theme-chalk/index.css'
            oldColor = elementUI.colorPrimary
        }
        changer.changeColor(newColor, oldColor, getElementUISeries, cssUrl)
    }
}