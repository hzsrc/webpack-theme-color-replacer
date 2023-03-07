'use strict';
var webpack = require('webpack')
var AssetsExtractor = require('./AssetsExtractor')
var replaceFileName = require('./replaceFileName')
var LineReg = /\n/g
var wpSources = webpack.sources
if (!wpSources) {
    wpSources = require('webpack-sources') // for webpack 4
}
module.exports = class Handler {
    constructor(options) {
        // Default options
        this.options = Object.assign({
            fileName: 'css/theme-colors-[contenthash:8].css',
            matchColors: [],
            isJsUgly: !(process.env.NODE_ENV === 'development' || process.argv.find(arg => arg.match(/\bdev/))),
            configVar: 'tc_cfg_' + Math.random().toString().slice(2),
        }, options);
        this.assetsExtractor = new AssetsExtractor(this.options)
    }

    // Add Webpack5 Support
    emitSource(compilation, name, source) {
        var exists = compilation.assets[name]
        if (compilation.updateAsset) { // webpack.version[0] >= '5'
            if (exists) compilation.updateAsset(name, source)
            else compilation.emitAsset(name, source);
        } else {
            if (exists) delete compilation.assets[name]
            compilation.assets[name] = source;
        }
    }

    handle(compilation) {
        var output = this.assetsExtractor.extractAssets(compilation.assets);
        console.log('Extracted theme color css content length: ' + output.length);

        //Add to assets for output
        var outputName = getFileName(this.options.fileName, output)

        this.emitSource(compilation, outputName, new wpSources.RawSource(output))

        var injectToHtmlReg = this.options.injectToHtml;
        if (injectToHtmlReg) {
            //injectToHtml配置一个正则表达式或true
            if (!injectToHtmlReg.test) injectToHtmlReg = /index\.html?$/i
            // 解决 webpack splitchunks导致chunk缓存不生效问题
            this.addToHtml(outputName, compilation, output, injectToHtmlReg);
        } else {
            // 记录动态的文件名，到每个入口js
            this.addToEntryJs(outputName, compilation, output)
        }

        function getFileName(fileName, src) {
            return compilation.getPath(replaceFileName(fileName, src), {})
        }
    }

    addToHtml(outputName, compilation, cssCode, injectToHtmlReg) {
        var assetsNames = Object.keys(compilation.assets).filter((assetName) => {
            return injectToHtmlReg.test(assetName);
        });

        assetsNames.map(name => {
            var source = compilation.assets[name];
            var configJs = this.getConfigJs(outputName, cssCode)
            var content = source.source().replace(/(\<|\\x3C)script/i, m => '<script>' + configJs + '</script>\n' + m);
            this.emitSource(compilation, name, new wpSources.RawSource(content))
        });
    }

// 自动注入js代码，设置css文件名
    addToEntryJs(outputName, compilation, cssCode) {
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
                var assetName = entryAssets[i].name || entryAssets[i];
                if (assetName.slice(-3) === '.js' && assetName.indexOf('manifest.') === -1) { //
                    var assetSource = compilation.assets[assetName]
                    if (assetSource && !assetSource._isThemeJsInjected) {
                        var cSrc = this.getEntryJs(outputName, assetSource, cssCode)
                        cSrc._isThemeJsInjected = true
                        this.emitSource(compilation, assetName, cSrc)
                        break;
                    }
                }
            }
        })
    }

    getConfigJs(outputName, cssCode) {
        var config = { url: outputName, colors: this.options.matchColors }
        if (this.options.injectCss) {
            config.cssCode = cssCode.replace(LineReg, '');
        }
        return '\n(typeof window==\'undefined\'?global:window).' + this.options.configVar + '=' + JSON.stringify(config) + ';\n'
    }

    getEntryJs(outputName, assetSource, cssCode) {
        var ConcatSource = wpSources.ConcatSource
        var CachedSource = wpSources.CachedSource
        var configJs = this.getConfigJs(outputName, cssCode)
        if (assetSource instanceof CachedSource) { // CachedSource没有node方法，会报错
            return new CachedSource(concatSrc(((typeof assetSource._source === 'function') ? assetSource._source() : assetSource._source) || assetSource.source(), configJs))
        }
        return concatSrc(assetSource, configJs)

        function concatSrc(assetSource, configJs) {
            if (assetSource instanceof ConcatSource) {
                assetSource.add(configJs)
                return assetSource
            } else {
                return new ConcatSource(assetSource, configJs)
            }
        }
    }
}
