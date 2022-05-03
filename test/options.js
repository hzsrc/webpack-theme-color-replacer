var getElementUISeries = require('../forElementUI/getElementUISeries')

module.exports = {
    dev: {
        isJsUgly: false,
        fileName: 'css/theme-colors-[contenthash:8].css',
        // matchColors: [
        //     '#1890ff', '#2f9bff', '#46a6ff', '#5db1ff',
        //     '#74bcff', '#8cc8ff', '#a3d3ff', '#badeff',
        //     '#d1e9ff', '#e6f7ff', '#bae7ff', '#91d5ff',
        //     '#69c0ff', '#40a9ff', '#1890ff', '#096dd9',
        //     '#0050b3', '#003a8c', '#002766',
        //     '24,144,255'
        // ],
        matchColors: [
            '#f67a17', '#f7872e', '#f89545', '#f9a25d',
            '#faaf74', '#fbbd8b', '#fbcaa2', '#fcd7b9',
            '#fde4d1', '#fff5e6', '#ffe2ba', '#ffce91',
            '#ffb669', '#ff9c40', '#f67a17', '#cf5b08',
            '#a84100', '#822e00', '#5c1d00',
            '246, 122, 23', '27, 92.531%, 52.745%',
            '#222', '#222223', '#ADF'
        ],
        newColors: [
            '#bd3be7', '#c44fe9', '#ca62ec', '#d176ee',
            '#d789f1', '#de9df3', '#e5b1f5', '#ebc4f8',
            '#f2d8fa', '#fef0ff', '#fce6ff', '#f5bdff',
            '#eb94ff', '#d667f5', '#bd3be7', '#9629c2',
            '#72199c', '#510d75', '#34084f',
            '189, 59, 231', '285,78.182%,56.863%',
            '#333', '#333334', '#6ED'
        ],
    },
    build: {
        isJsUgly: true,
        fileName: 'css/theme-colors.[contenthash:8].css',
        matchColors: [...getElementUISeries('#f67a17'), '#222', '#222223', '#ADF'], // 主色系列 #f67a17|246,122,23|#f67a17|#f7872e|#f89545|#f9a25d|#faaf74|#fbbd8b|#fbcaa2|#fcd7b9|#fde4d1|#fef2e8|#dd6e15|#c56212'.split('|')
        // 改变样式选择器，解决样式覆盖问题
        changeSelector(selector, util) {
            switch (selector) {
                case '.ant-calendar-today .ant-calendar-date':
                    return ':not(.ant-calendar-selected-day)' + selector;
                default:
                    return selector;
            }
        },
        externalCssFiles: require('path').join(__dirname, './external.css'),
        newColors: [...getElementUISeries('#bd3be7'), '#333', '#333334', '#6ED'],
        configVar: 'my_var_12322'
    },
}

