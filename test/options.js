module.exports = {
    fileName: 'css/theme-colors.[contenthash:8].css',
    resultFileNameTo: 'test/themeCssUrl.js',
    matchColors: '#e6f7ff,#bae7ff,#91d5ff,#69c0ff,#40a9ff,#1890ff,#096dd9,#0050b3,#003a8c,#002766'.split(','), // 主色系列
    // 改变样式选择器，解决样式覆盖问题
    changeSelector(selector) {
        switch (selector) {
            case '.ant-calendar-today .ant-calendar-date':
                return ':not(.ant-calendar-selected-day)' + selector;
            default:
                return selector;
        }
    },
}