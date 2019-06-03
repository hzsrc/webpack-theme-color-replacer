'use strict';
var path = require('path'), fs = require('fs')
var crypto = require('crypto')
var Extractor = require('./extractColors')
var assetsExtract = require('./extractWebpackAssets')

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

        // this.getBinder(compiler, 'compilation')((compilation) => {
        //   this.getBinder(compilation, 'optimize-chunk-assets')((chunks, callback) => {
        //     [].push.apply(srcArray, assetsExtract.extractAssets(compilation.assets, this.extractor))
        //     callback()
        //   })
        // });

        this.getBinder(compiler, 'emit')((compilation, callback) => {
            var srcArray = assetsExtract.extractAssets(compilation.assets, this.extractor);

            // 外部的css文件。如cdn加载的
            if (this.options.externalCssFiles) {
                [].concat(this.options.externalCssFiles).map(file => {
                    var src = fs.readFileSync(file, 'utf-8')
                    var css = this.extractor.extractColors(src)
                    srcArray = srcArray.concat(css)
                })
            }

            var output = dropDuplicate(srcArray).join('\n');

            // 自定义后续处理
            if (this.options.resolveCss) {
                output = this.options.resolveCss(output)
            }

            console.log('Extracted theme color css content length: ' + output.length);

            //Add to assets for output
            var outputName = getFileName(this.options.fileName, output)
            compilation.assets[outputName] = {
                source: () => output,
                size: () => output.length
            };
            if (this.options.resultFileNameTo) {
                fs.writeFile(this.options.resultFileNameTo, `export default '${outputName}'\n`, err => err && console.error(err))
            }

            callback();

            function getFileName(fileName, src) {
                var contentHash = crypto.createHash('md4')
                    .update(src)
                    .digest("hex")
                return compilation.getPath(fileName, {contentHash})
            }
        });
    }
}


function dropDuplicate(arr) {
    var map = {}
    var r = []
    for (var s of arr) {
        if (!map[s]) {
            r.push(s)
            map[s] = 1
        }
    }
    return r
}

ThemeColorReplacer.getElementUISeries = require('./forElementUI/getElementUISeries.js');
ThemeColorReplacer.varyColor = require('./client/varyColor');

module.exports = ThemeColorReplacer;
