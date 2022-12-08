process.env.NODE_ENV = 'production'
var path = require('path')
var fs = require('fs')

var webpack = require('webpack')
var config = {
    mode: 'production',
    entry: {
        'index': path.resolve(__dirname, '../client/index.js'),
    },
    plugins: [
        new webpack.DefinePlugin({
            WP_THEME_CONFIG: JSON.stringify('_themeCfg')
        })
    ],
    output: {
        library: 'tcrClient',
        libraryTarget: 'var',
        path: path.resolve(__dirname, '../client'),
        filename: 'client.browser.js',
    },
    optimization: {
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

