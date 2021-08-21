process.env.NODE_ENV = 'production'
var path = require('path')
var fs = require('fs')

var webpack = require('webpack')
var ThemeColorReplacer = require('../../src')
var client = require('../../client')

var option = require('../options').build
var testContent = require('../testContent')

var config = {
    mode: 'production',
    entry: {
        'index': path.resolve(__dirname, './main.js'),
    },
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: '[name].js',
    },
    module: {
        rules: [{
            test: /\.css$/,
            loader: 'css-loader',
        }]
    },

    plugins: [new ThemeColorReplacer(option)],
    optimization: {
        runtimeChunk: {
            name: 'manifest'
        },
        minimize: option.isJsUgly,
        noEmitOnErrors: true,
        splitChunks: false
    }
}


//require('rimraf')(config.output.path, e => !e && doWebpack())
//config.mode = 'development'
require('rimraf')(config.output.path, e => !e && doWebpack())

function doWebpack() {
    webpack(config, function (err, stats) {
        if (err) {
            throw err
        }
        process.stdout.write(stats.toString({
            colors: true,
            modules: false,
            children: false,
            chunks: false,
            chunkModules: false
        }) + '\n\n')

        console.log('  Build complete.\n')

        var ok = testReplaced();
        if (!ok) process.exit(1)
    })
}

function testReplaced() {
    var dir = 'test/webpack/dist/css'
    var cssFile = fs.readdirSync(dir)[0]
    cssFile = path.resolve(dir + '/' + cssFile)
    var cssText = fs.readFileSync(cssFile, 'utf-8')
    var replacedCss = client.changer.replaceCssText(cssText, option.matchColors, option.newColors)
    var replacedFn = path.resolve(dir + '/test-dev.css-replaced.css')
    fs.writeFileSync(replacedFn, replacedCss)

    var srcRaw = fs.readFileSync('test/webpack/dist/index.js', 'utf-8');
    var okRaw = testContent(srcRaw, cssText, cssFile, option, false)
    var okNew = testContent(srcRaw, replacedCss, replacedFn, option, true)
    return okRaw && okNew
}
