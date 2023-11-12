var getElementUISeries = require('../forElementUI/getElementUISeries')

module.exports = {
    dev: {
        isJsUgly: false,
        fileName: 'css/theme-colors-[contenthash:8].css',
        matchColors: [...getElementUISeries('#f67a17'), '#222', '#222223', '#ADF'],
        newColors: [...getElementUISeries('#bd3be7'), '#333', '#333334', '#6ED'],
    },
    build: {
        isJsUgly: true,
        fileName: 'css/theme-colors.[contenthash:8].css',
        matchColors: [...getElementUISeries('#f67a17'), '#222', '#222223', '#ADF'], // 主色系列
        // 改变样式选择器，解决样式覆盖问题
        changeSelector(selector, util) {
            switch (selector) {
                case '.ant-calendar-today .ant-calendar-date':
                    return ':not(.ant-calendar-selected-day)' + selector;
                default:
                    return selector;
            }
        },
        externalCssFiles: __dirname + '/external.css',
        newColors: [...getElementUISeries('#bd3be7'), '#333', '#333334', '#6ED'],
        configVar: 'my_var_12322'
    },
}

