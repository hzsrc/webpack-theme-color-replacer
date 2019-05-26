/* optimize-chunk-assets 钩子的代码处理 */
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

/* emit钩子的代码处理 */

//                          Module\nexports.push([module.i, \"h1...   ;\\n}\\n\", \"\",{\"version\":3,\"
//css-loader 2:        \n// Module\nexports.push([module.i, \"a{   ...... }\\n\", \"\",{\"version\":3,
//css-loader 1:        \n// module\nexports.push([module.i, \"a{   ...... }\\n\", \"\"]);
//css-loader 2@srcmap:   // Module\nexports.push([module.i, "a{   .....   }\n", "",{"version":3

var Css_Loader_Reg_DEV = /\bn?exports\.push\(\[module\.i, \\?"(.+?\})(?:\\?\\n)?\\?", \\?"\\?"(?:\]\)|,\{)/g;

//css-loader:  n.exports=t("FZ+f")(!1)).push([n.i,"\n.payment-type[data-v-ffb10066] {......}\n",""])
var Css_Loader_Reg_PROD = /\.push\(\[\w+\.i,['"](.+?\})\\n['"],['"]['"]\]\)/g;

module.exports = {
    extractAssets: function (assets, extractor) {
        var isDebug = process.env.NODE_ENV === 'development' || process.argv.find(arg => arg.match(/\bdev/));

        var cssSrcs = [];
        Object.keys(assets).map(fn => {
            var items = this.extractAsset(fn, assets[fn], extractor, isDebug)
            cssSrcs = cssSrcs.concat(items)
        });
        return cssSrcs;
    },
    extractAsset: function (fn, asset, extractor, isDebug) {
        if (fn.match(/\.css$/i)) {
            var src = assetToStr(asset);
            // require('fs').writeFileSync('d:\\t\\'+ fn, src);
            return extractor.extractColors(src);
        }
        else if (fn.match(/\.js$/i)) {
            src = assetToStr(asset);
            // require('fs').writeFileSync('d:\\t\\'+ fn, src)
            var cssSrcs = []
            var CssCodeReg = isDebug ? Css_Loader_Reg_DEV : Css_Loader_Reg_PROD;
            src.replace(CssCodeReg, (match, $1) => {
                cssSrcs = cssSrcs.concat(extractor.extractColors($1));
            });
            return cssSrcs
        }
    }
};

function assetToStr(asset) {
    var src = asset.source() || '';
    return src.toString();
}
