'use strict';
var path = require('path'), fs = require('fs')
var Extractor = require('./extractColors')
var extractAssets = require('./extractWebpackAssets')

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
        //     [].push.apply(srcArray, extractAssets(compilation.assets, this.extractor))
        //     callback()
        //   })
        // });

        this.getBinder(compiler, 'emit')((compilation, callback) => {
            var srcArray = extractAssets(compilation.assets, this.extractor);

            // 外部的css文件。如cdn加载的
            if (this.options.externalCssFiles) {
                [].concat(this.options.externalCssFiles).map(file => {
                    var src = fs.readFileSync(file, 'utf-8')
                    var css = this.extractor.extractColors(src)
                    console.log(css)
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
            compilation.assets[this.options.fileName] = {
                source: () => output,
                size: () => output.length
            };

            callback();
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
