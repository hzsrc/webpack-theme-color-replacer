var Css_Code_Prefix = 'exports.push([module.i, "'; // from css-loader:  exports.push([module.i, "
var Css_Code_Surfix = '}\\n", ""])'; // from css-loader:  }\n', ''])}

module.exports = function extractAssets(assets, extractor) {
  var cssSrcs = Object.keys(assets).map(fn => {
    if (fn.match(/\.css/i)) {
      var src = assets[fn].source()
      return extractor.extractColors(src)
    }
    else if (fn.match(/\.js/i)
      || fn === '*' //miniCssPlugin
      || fn === 'extract-text-webpack-plugin-output-filename' //extractTextPlugin
    ) {
      var src = assets[fn].source()
      var start = src.indexOf(Css_Code_Prefix);
      if (start > -1) {
        var end = src.indexOf(Css_Code_Surfix, start + 1)
        if (end + 1 > start + Css_Code_Prefix.length) {
          var srcCss = src.substring(start + Css_Code_Prefix.length, end + 1).replace(/\\n/g, '')
          return extractor.extractColors(srcCss)
        }
      }
    }
  });
  return cssSrcs
}