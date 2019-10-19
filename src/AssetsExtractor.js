var path = require('path')
var fs = require('fs')
var Extractor = require('./Extractor')

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
var Css_Loader_Reg_UGLY = /\.push\(\[\w+\.i,['"](.+?\})[\\rn]*['"],['"]['"](?:\]\)|,\{)/g;

module.exports = function AssetsExtractor(options) {
    this.extractor = new Extractor(options)
    this.extractAssets = function (assets) {
        var srcArray = extractAll(this)
        if (srcArray.length === 0) {
            // 容错一次
            options.isJsUgly = !options.isJsUgly
            srcArray = extractAll(this)
        }
        return srcArray;

        function extractAll(that) {
            var cssSrcs = [];
            Object.keys(assets).map(fn => {
                var items = that.extractAsset(fn, assets[fn])
                cssSrcs = cssSrcs.concat(items)
            });
            return cssSrcs
        }
    }
    this.extractAsset = function (fn, asset) {
        if (fn.match(/\.css$/i)) {
            var src = assetToStr(asset);
            writeFileForDebugIf(fn, src, this.extractor)
            return this.extractor.extractColors(src);
        } else if (fn.match(/\.js$/i)) {
            src = assetToStr(asset);
            writeFileForDebugIf(fn, src, this.extractor)
            var cssSrcs = []
            var CssCodeReg = options.isJsUgly ? Css_Loader_Reg_UGLY : Css_Loader_Reg_DEV;
            src.replace(CssCodeReg, (match, $1) => {
                cssSrcs = cssSrcs.concat(this.extractor.extractColors($1));
            });
            return cssSrcs
        }
        return []

        function writeFileForDebugIf(fn, src, extractor) {
            // `npm run dev --theme_debug` to write asset files for debug
            try {
                if (process.env.npm_config_theme_debug) {
                    if (extractor.testCssCode(src)) {
                        var info = JSON.stringify(options) + '\n' + src
                        fs.writeFileSync(path.join(process.cwd(), '_tmp_' + path.basename(fn)), info)
                    }
                }
            } catch (e) {
            }
        }
    }
};

function assetToStr(asset) {
    var src = asset.source() || '';
    return src.toString();
}

