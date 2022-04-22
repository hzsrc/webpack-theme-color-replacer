'use strict';
var Handler = require('./Handler')

var webpack = require('webpack')
var randomId = Date.now() + '_' + Math.floor(Math.random()*1000)

class ThemeColorReplacer {
    constructor(options) {
        this.handler = new Handler(options)
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

        new webpack.DefinePlugin({
            THEME_RANDOM_ID: JSON.stringify(randomId)
        }).apply(compiler)

        this.getBinder(compiler, 'emit')((compilation, callback) => {
            this.handler.handle(compilation)
            callback()
        });
    }
}

ThemeColorReplacer.varyColor = require('../client/varyColor');

module.exports = ThemeColorReplacer;
