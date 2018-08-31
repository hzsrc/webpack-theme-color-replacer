This plugin can extract theme color styles from all the outputed css files (sucn as element-ui theme colors), and make a 'theme-colors.css' file which only contains color styles. At runtime in your web page, the client part will help you to download this css file, and then replace the colors into new customized colors dynamicly.  

This is a sample: 
http://test.hz300.com/webpack4/themeColor.html

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
            fileName: 'css/theme-colors.css', // output css file name
            matchColors: [
                ...ThemeColorReplacer.getElementUISeries('#f67a17'), // primary color of element-ui
                '#0cdd3a',  //other custom color
            ],
        })
    ],
}
````

You can view this sample:  
https://github.com/hzsrc/vue-element-ui-scaffold-webpack4/blob/master/build/webpack.base.conf.js

# 3.Usage in your web page
````js

    import replacer from 'webpack-theme-color-replacer/client';

    export default {
        data() {
            return {
                mainColor: '#f67a17',
                oldColor: '#f67a17',
            };
        },
        methods: {
            changeColor(newVal) {
                var options = {
                    primary: { // primary color
                        oldColor: this.oldColor,
                        newColor: newVal,
                    },
                    cssUrl: 'css/theme-colors.css',
                    others: { //custom colors
                        oldColors: ['#0cdd3a', '#c655dd'],
                        newColors: ['#ff0000', '#ffff00'],
                    }
                };
                replacer.elementUI.changeColor(options);

                this.oldColor = newVal
            }
        },
    }


````

You can view this sample:  
https://github.com/hzsrc/vue-element-ui-scaffold-webpack4/blob/master/src/modules/themeColor/changeColor.vue
