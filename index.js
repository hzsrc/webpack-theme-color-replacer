'use strict';
var Extractor = require('./extractColors.js')
var path = require('path'), fs = require('fs')

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
        var binded = compiler.hooks
            ? compiler.hooks.emit.tapAsync.bind(compiler.hooks.emit, 'ThemeColorReplacer')
            : compiler.plugin.bind(compiler, 'emit')

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

            //dev 环境，因为css都没提取，只能用先前npm run build生成的结果文件
            if (!output && /dev/i.test(process.env.NODE_ENV)) {
                var builtName = path.resolve(compilation.options.output.path, this.options.fileName)
                if (fs.existsSync(builtName)) {
                    output = fs.readFileSync(builtName, 'utf-8')
                }
                else {
                    console.log('[Warning]: file not found:\n ' + builtName
                        + '\n To replace theme color at develop-time, you need to build it first (npm run build).')
                }
            }

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
