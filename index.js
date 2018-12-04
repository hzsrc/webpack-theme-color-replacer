'use strict';
var Extractor = require('./extractColors.js')
var path = require('path'), fs = require('fs')
var extractAssets = require('./extractWebpackAssets.js')

class ThemeColorReplacer {
  constructor(options) {
    // Default options
    this.options = Object.assign({
      fileName: 'css/theme-colors.css',
      matchColors: [],
    }, options);

    this.extractor = new Extractor(this.options)
  }

  getBinder(compiler, event) {
    return compiler.hooks
      ? compiler.hooks[event].tapAsync.bind(compiler.hooks[event], 'ThemeColorReplacer')
      : compiler.plugin.bind(compiler, event)
  }

  apply(compiler) {
    var output = [];
    this.getBinder(compiler, 'compilation')((compilation, cb) => {
      // var binded1 = this.getBinder(compilation, 'optimize-assets')
      // binded1((chunks, callback) => {
      //   debugger
      //   if (chunks)
      //     chunks.forEach(chunk => {
      //       chunk.files.forEach(file => {
      //         var assets = compilation.assets;
      //         console.log(assets[file])
      //       })
      //     })
      //   callback && callback()
      // })
      this.getBinder(compilation, 'optimize-chunk-assets')((chunks, callback) => {
        [].push.apply(output, extractAssets(compilation.assets, this.extractor))
        callback && callback()
      })
      // this.getBinder(compilation, 'after-seal')((callback) => {
      //   output += extractAssets(compilation.assets, this.extractor) + '\n'
      //   callback && callback()
      // })
      // cb && cb()
    })

    var binded = this.getBinder(compiler, 'emit')
    binded((compilation, callback) => {
      // debugger
      // compilation.chunks.forEach((chunk, i) => {
      //   chunk.files.forEach((file, j) => {
      //
      //   })
      // })

      var assets = compilation.assets;
      // output += extractAssets(assets, this.extractor)

      output = output.join('\n')
      //dev 环境，因为css都没提取，只能用先前npm run build生成的结果文件
      // if (!output && /dev/i.test(process.env.NODE_ENV)) {
      //   var builtName = path.resolve(compilation.options.output.path, this.options.fileName)
      //   if (fs.existsSync(builtName)) {
      //     output = fs.readFileSync(builtName, 'utf-8')
      //   }
      //   else {
      //     console.log('[Warning]: file not found:\n ' + builtName
      //       + '\n To replace theme color at develop-time, you need to build it first (npm run build).')
      //   }
      // }

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
