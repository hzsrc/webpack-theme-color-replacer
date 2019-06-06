var path = require('path')

var webpack = require('webpack')
var ThemeColorReplacer = require('../')

var options = require('./options')
var config = {
    mode: 'production',
    entry: {
        'tmp-output': path.resolve('./test/output-by-webpack.js'),
        'tmp-output2': path.resolve('./test/output-by-webpack2.js'),
    },
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: '[name].js',
    },

    plugins: [new ThemeColorReplacer(options)],
    optimization: {
        runtimeChunk: {
            name: 'manifest'
        },
        minimize: false,
        noEmitOnErrors: true,
        splitChunks: false
    }
}
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
