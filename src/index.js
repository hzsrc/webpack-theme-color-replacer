'use strict';
var Handler = require('./Handler')

var webpack = require('webpack')

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
            WP_THEME_CONFIG: JSON.stringify(this.handler.options.configVar)
        }).apply(compiler)
        
        if (webpack.version[0] >= '5') {
              // Add Webpack5 Support
              compiler.hooks.thisCompilation.tap('ThemeColorReplacer', (compilation) => {
                  compilation.hooks.processAssets.tapAsync(
                      {
                        name: 'ThemeColorReplacer',
                        stage: webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONS
                      },
                      (compilationAssets, callback) => {        
                        this.handler.handle(compilation)
                        callback()
                      });
              });
        } else {
              this.getBinder(compiler, 'emit')((compilation, callback) => {
                  this.handler.handle(compilation)
                  callback()
              });
        }
    }
}

ThemeColorReplacer.varyColor = require('../client/varyColor');

module.exports = ThemeColorReplacer;
