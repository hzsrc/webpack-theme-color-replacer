process.env.NODE_ENV = 'production'
var path = require('path')

var webpack = require('webpack')
var ThemeColorReplacer = require('../../src/index')

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

    plugins: [new ThemeColorReplacer(options)],
    optimization: {
        runtimeChunk: {
            name: 'manifest'
        },
        minimize: options.isJsUgly,
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
    })
}