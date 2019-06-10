'use strict';
var path = require('path'), fs = require('fs')
var crypto = require('crypto')
var Extractor = require('./extractColors')
var assetsExtract = require('./extractWebpackAssets')
var {ConcatSource} = require("webpack-sources");

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
        //   this.getBinder(compilation, 'html-webpack-plugin-before-html-processing')((htmlPluginData, callback) => {
        //     debugger
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
                output = this.options.resolveCss(output, srcArray)
            }

            console.log('Extracted theme color css content length: ' + output.length);

            //Add to assets for output
            var outputName = getFileName(this.options.fileName, output)
            compilation.assets[outputName] = {
                source: () => output,
                size: () => output.length
            };

            // 记录动态的文件名，到每个入口
            this.addToEntryJs(outputName, compilation)

            callback();

            function getFileName(fileName, src) {
                var contentHash = crypto.createHash('md4')
                    .update(src)
                    .digest("hex")
                return compilation.getPath(fileName, {contentHash})
            }


        });
    }

    // 自动注入js代码，设置css文件名
    addToEntryJs(outputName, compilation) {
        var onlyEntrypoints = {
            entrypoints: true,
            errorDetails: false,
            modules: false,
            assets: false,
            children: false,
            chunks: false,
            chunkGroups: false
        }
        var entrypoints = compilation.getStats().toJson(onlyEntrypoints).entrypoints;
        Object.keys(entrypoints).forEach(entryName => {
            var entryAssets = entrypoints[entryName].assets
            for (var i = 0, l = entryAssets.length; i < l; i++) {
                var assetName = entryAssets[i]
                if (assetName.slice(-3) === '.js' && assetName.indexOf('manifest.') === -1) {
                    var assetCode = compilation.assets[assetName]
                    if (assetCode) {
                        var config = {url: outputName, colors: this.options.matchColors}
                        compilation.assets[assetName] = new ConcatSource(
                            `window.__theme_COLOR_cfg=${JSON.stringify(config)};`,
                            '\n',
                            assetCode,
                        );
                        break;
                    }
                }
            }
        })
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

ThemeColorReplacer.varyColor = require('./client/varyColor');

module.exports = ThemeColorReplacer;
