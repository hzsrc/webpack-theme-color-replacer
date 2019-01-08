//optimize-chunk-assets 钩子的代码处理
// var Css_Code_Prefix = 'exports.push([module.i, "'; // from css-loader:  exports.push([module.i, "
// var Css_Code_Surfix = '}\\n", ""])'; // from css-loader:  }\n', ''])}
// module.exports = function extractAssets(assets, extractor) {
//   var cssSrcs = Object.keys(assets).map(fn => {
//     if (fn.match(/\.css/i)) {
//       var src = assets[fn].source()
//       return extractor.extractColors(src).join('\n')
//     }
//     else if (fn.match(/\.js/i)
//       || fn === '*' //miniCssPlugin
//       || fn === 'extract-text-webpack-plugin-output-filename' //extractTextPlugin
//     ) {
//       var src = assets[fn].source()
//       var start = src.indexOf(Css_Code_Prefix);
//       if (start > -1) {
//         var end = src.indexOf(Css_Code_Surfix, start + 1)
//         if (end + 1 > start + Css_Code_Prefix.length) {
//           var srcCss = src.substring(start + Css_Code_Prefix.length, end + 1).replace(/\\n/g, '')
//           return extractor.extractColors(srcCss).join('\n')
//         }
//       }
//     }
//   });
//   return cssSrcs
// }
// emit钩子的代码处理

var Reg_Lf_Rem = /\\\\?n|\/\*[\s\S]+?\*\//g; // \n和备注
module.exports = function extractAssets(assets, extractor) {
  var isDebug = process.env.NODE_ENV == 'development' || process.argv.find(arg => arg.match(/\bdev/));
  var CssCodeReg = isDebug
    //css-loader 2: \n// Module\nexports.push([module.i, \"a{   ...... }\\n\", \"\",{\"version\":3,
    //css-loader 1: \n// module\nexports.push([module.i, \"a{   ...... }\\n\", \"\"]);
    ? /\\nexports\.push\(\[module\.i, \\"(.+?\})(?:\\\\n)?\\", \\"\\"(\]\)|,\s*\{)/g
    : /\.push\(\[\w+\.i,['"](.+?\})\\n['"],['"]['"]\]\)/g; // from css-loader:  n.exports=t("FZ+f")(!1)).push([n.i,"\n.payment-type[data-v-ffb10066] {......}\n",""])

  var cssSrcs = [];
  Object.keys(assets).map(fn => {
    if (fn.match(/\.css/i)) {
      var src = assets[fn].source();
      [].push.apply(cssSrcs, extractor.extractColors(src))
    }
    else if (fn.match(/\.js/i)) {
      var src = assets[fn].source()
      src.replace(CssCodeReg, (match, $1) => {
        var modSrc = $1.replace(Reg_Lf_Rem, '');
        cssSrcs.push.apply(cssSrcs, extractor.extractColors(modSrc))
      })
    }
  });
  return cssSrcs
}

