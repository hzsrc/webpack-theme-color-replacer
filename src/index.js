'use strict';
var path = require('path'), fs = require('fs')
var crypto = require('crypto')
var Extractor = require('./Extractor')
var Handler = require('./Handler')
var {ConcatSource} = require("webpack-sources");

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
        this.getBinder(compiler, 'emit')((compilation, callback) => {
            this.handler.handle(compilation)
            callback()
        });
    }
}

ThemeColorReplacer.varyColor = require('../client/varyColor');

module.exports = ThemeColorReplacer;
