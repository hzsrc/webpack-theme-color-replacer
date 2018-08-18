'use strict';
var Extractor = require('./extractColors.js')

class ThemeColorReplacer {
    constructor(options) {
        // Default options
        this.options = Object.assign({
            fileName: 'css/theme-colors.css',
            matchColors: [],
            cssFilter: null, // 判断要不要从这个css提取带颜色的样式
        }, options);

        this.extractor = new Extractor(this.options)
    }

    apply(compiler) {
        var binded = compiler.hooks ? compiler.hooks.emit.tapAsync.bind(compiler.hooks.emit, 'HtmlWebpackPlugin') : compiler.plugin.bind(compiler, 'emit')

        binded((compilation, callback) => {
            var assets = compilation.assets;
            var output = Object.keys(assets)
                .filter(fn => {
                    return fn.match(/\.css/i) && (!this.options.cssFilter || this.options.cssFilter(fn))
                })
                .map(fn => {
                    var src = assets[fn].source()
                    return this.extractor.extractColors(src)
                })
                .join('\n');

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
