'use strict';
var Extractor = require('./extractColors.js')
var path = require('path'), fs = require('fs')

class ThemeColorReplacer {
    constructor(options) {
        // Default options
        this.options = Object.assign({
            fileName: 'css/theme-colors.css',
            matchColors: [],
        }, options);

        this.extractor = new Extractor(this.options)
    }

    getBinder(compiler, event) {
        return compiler.hooks
            ? compiler.hooks[event].tapAsync.bind(compiler.hooks[event], 'ThemeColorReplacer')
            : compiler.plugin.bind(compiler, event)
    }

    apply(compiler) {
        // var output = '';
        // this.getBinder(compiler, 'compilation')((compilation, cb) => {
        //   // var binded1 = this.getBinder(compilation, 'optimize-chunk-assets')
        //   // binded1((chunks, callback) => {
        //   //   debugger
        //   //   if (chunks)
        //   //     chunks.forEach(chunk => {
        //   //       chunk.files.forEach(file => {
        //   //         var assets = compilation.assets;
        //   //         console.log(assets[file])
        //   //       })
        //   //     })
        //   //   callback && callback()
        //   // })
        //
        //   var binded2 = this.getBinder(compilation, 'after-seal')
        //
        //   binded2((callback) => {
        //     var cssAsset = compilation.assets['*'] //miniCssPlugin
        //       || compilation.assets['extract-text-webpack-plugin-output-filename'] //extractTextPlugin
        //
        //     if (cssAsset) {
        //       var src = cssAsset.source()
        //       var prefix = 'exports.push([module.i, "'; // by css-loader
        //       var start = src.indexOf(prefix)
        //       var end = src.indexOf('// exports', start + 1) // by css-loader
        //       end = src.lastIndexOf('}', end)
        //       if (end > start && start > -1) {
        //         var srcCss = src.substring(start + prefix.length, end + 1).replace(/\\n/g, '')
        //         var extracted = this.extractor.extractColors(srcCss)
        //         if (extracted) {
        //           output += extracted + '\n'
        //         }
        //       }
        //     }
        //
        //     callback && callback()
        //   })
        //   // cb && cb()
        // })

        var binded = this.getBinder(compiler, 'emit')
        binded((compilation, callback) => {
            debugger
            // compilation.chunks.forEach((chunk,i) => {
            //   chunk.files.forEach((file,j) => {
            //
            //   })
            // })

            var assets = compilation.assets;
            var output = Object.keys(assets)
                .map(fn => {
                    if (fn.match(/\.css/i)) {
                        var src = assets[fn].source()
                        return this.extractor.extractColors(src)
                    } else if (fn.match(/\.js/i)) {
                        var src = assets[fn].source()
                        var prefix = '.push([n.i, \''; // by css-loader:  exports.push([module.i, "
                        var start = src.indexOf(prefix);
                        if (start > -1) {
                            var end = src.indexOf('}\\n\', \'\'])}', start + 1) // by css-loader
                            if (end + 1 > start + prefix.length) {
                                var srcCss = src.substring(start + prefix.length, end + 1).replace(/\\n/g, '')
                                return this.extractor.extractColors(srcCss)
                            }
                        }
                    }
                })
                .filter(srcCss => srcCss)
                .join('\n');

            //dev 环境，因为css都没提取，只能用先前npm run build生成的结果文件
            // if (!output && /dev/i.test(process.env.NODE_ENV)) {
            //   var builtName = path.resolve(compilation.options.output.path, this.options.fileName)
            //   if (fs.existsSync(builtName)) {
            //     output = fs.readFileSync(builtName, 'utf-8')
            //   }
            //   else {
            //     console.log('[Warning]: file not found:\n ' + builtName
            //       + '\n To replace theme color at develop-time, you need to build it first (npm run build).')
            //   }
            // }

            console.log('Extracted theme color css content length: ' + (output || '').length)

            //Add to assets for output
            assets[this.options.fileName] = {
                source: () => output,
                size: () => output.length
            };

            callback()
        })
    }
}

ThemeColorReplacer.getElementUISeries = require('./forElementUI/getElementUISeries.js');

module.exports = ThemeColorReplacer;
