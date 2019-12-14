process.env.NODE_ENV = 'production'
var path = require('path')
var fs = require('fs')

var webpack = require('webpack')
var ThemeColorReplacer = require('../../src')
var client = require('../../client')

var options = require('../options')
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

    plugins: [new ThemeColorReplacer(options.build)],
    optimization: {
        runtimeChunk: {
            name: 'manifest'
        },
        minimize: options.build.isJsUgly,
        noEmitOnErrors: true,
        splitChunks: false
    }
}


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

        testReplaced();
    })
}

function testReplaced() {
    var dir = 'test/webpack/dist/css'
    var cssFile = fs.readdirSync(dir)[0]
    var cssText = fs.readFileSync(dir + '/' + cssFile, 'utf-8')
    var replacedCss = client.changer.replaceCssText(cssText, options.build.matchColors, options.runtime.newColors)
    fs.writeFileSync(dir + '/test.css-replaced.css', replacedCss)
}
