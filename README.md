This plugin can extract theme color styles from all the outputed css files (such as element-ui theme colors), and make a 'theme-colors.css' file which only contains color styles. At runtime in your web page, the client part will help you to download this css file, and then replace the colors into new customized colors dynamicly.

This is a sample:
https://hzsrc-vue-webpack4-elementui.netlify.com/themeColor.html

Implementation (Chinese):
https://segmentfault.com/a/1190000016061608

# 1.Install
npm i -D webpack-theme-color-replacer

# 2.Cofig for webpack

````js

const ThemeColorReplacer = require('webpack-theme-color-replacer')

module.exports = {
    .....
    plugins: [
        new ThemeColorReplacer({
            matchColors: ['#ed4040', '#4b0'], // colors array for extracting css file
            fileName: 'css/theme-colors-[contenthash:8].css', //optional. output css file name, suport [contenthash] and [hash].
            resolveCss(resultCss) { // optional. Resolve result css code as you wish.
                return resultCss.replace(/#4b0/g, '#ed4040')
            },
            externalCssFiles: ['./node_modules/element-ui/lib/theme-chalk/index.css'], // optional, String or string array. Set external css files (such as cdn css) to extract colors.
            changeSelector(selector, util) { // optional, Funciton. Changing css selectors, in order to raise css priority, to resolve lazy-loading problems.
                return util.changeEach(selector, '.el-button--default')
            },
            injectCss: false, // optional. Inject css text in js file, not need to download `theme-colors-xxx.css` any more.
            isJsUgly: process.env.NODE_ENV !== 'development', // optional. Set to `true` if your js is uglified. Default is set by process.env.NODE_ENV.
        })
    ],
}
````

You can view this sample:
https://github.com/hzsrc/vue-element-ui-scaffold-webpack4/blob/master/build/webpack.base.conf.js

# 3.Usage in your web page
Like this:

````js
import replacer from 'webpack-theme-color-replacer/client'

// change theme colors at runtime.
export function changeColor(newColor) {
  var options = {
    newColors: [newColor, newColor], // new colors array, one-to-one corresponde with `matchColors`
    appendToEl: 'head', //optional. The element selector for appending child with `<style>`, default is 'body'. Using `appendToEl: 'body'` can make the css priority higher than any css in <head>
    // changeUrl(cssUrl) {
    //   return `/${cssUrl}`; // while router is not `hash` mode, it needs absolute path
    // },
  }

  replacer.changer.changeColor(options, Promise).then(() => {
      console.log('Theme colors changed!')
  })
}



````

You can view this sample:
https://github.com/hzsrc/vue-element-ui-scaffold-webpack4/blob/master/src/js/themeColorClient.js

# issues report
If you have issues with this plugin, please run your command with `--theme_debug` option, such as `npm run dev --theme_debug`, then upload the outputed `_tmp_xxx` files while reporting issues. Thanks!
