var changer = require('../client/themeColorChanger.js')
var getElementUISeries = require('./getElementUISeries.js')

var elementUI = {
  version: '2.4.5',
  colorPrimary: '#409EFF' // element-ui default color
};

module.exports = {
  changeColor: function(options) {
    /*
    options = {
        primary: {
            oldColor: '#409EFF',
            newColor: '#ff00ff',
        },
        cssUrl: 'css/theme-colors.css',
        others:{
            oldColors: ['#0cdd3a', '#c655dd'],
            newColors: ['#ff0000', '#ffff00'],
        }
    }
     */
    var newColors = []
    var oldColors = []
    if (options.primary) {
      var primary = options.primary;
      var others = options.others;
      if (!options.cssUrl) {
        options.cssUrl = 'https://unpkg.com/element-ui@' + elementUI.version + '/lib/theme-chalk/index.css'
        primary.oldColor = elementUI.colorPrimary
      }
      //primary color series
      newColors = getElementUISeries(primary.newColor)
      oldColors = getElementUISeries(primary.oldColor)
    }
    //other custom colors
    if (others) {
      newColors.push.apply(newColors, others.newColors)
      oldColors.push.apply(oldColors, others.oldColors)
    }

    var opt = { oldColors: oldColors, newColors: newColors, cssUrl: options.cssUrl }
    changer.changeColor(opt)
  },
  getElementUISeries: getElementUISeries,
}