var getElementUISeries = require('../forElementUI/getElementUISeries')

module.exports = {
    build: {
        isJsUgly: true,
        fileName: 'css/theme-colors.[contenthash:8].css',
        matchColors: [...getElementUISeries('#f67a17'), '#222', '#222223'], // 主色系列 #f67a17|246,122,23|#f67a17|#f7872e|#f89545|#f9a25d|#faaf74|#fbbd8b|#fbcaa2|#fcd7b9|#fde4d1|#fef2e8|#dd6e15|#c56212'.split('|')
        // 改变样式选择器，解决样式覆盖问题
        changeSelector(selector, util) {
            switch (selector) {
                case '.ant-calendar-today .ant-calendar-date':
                    return ':not(.ant-calendar-selected-day)' + selector;
                default:
                    return selector;
            }
        },
        externalCssFiles: require('path').join(__dirname, './external.css')
    },
    runtime: {
        newColors: [...getElementUISeries('#bd3be7'), '#333', '#333334']
    }
}

