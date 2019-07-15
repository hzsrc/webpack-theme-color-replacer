var getElementUISeries = require('./getElementUISeries')
var varyColor = require('../client/varyColor')


function changeSelector(selector) {
    // element-ui这几个样式太宽泛，需减小范围
    switch (selector) {
        case '.el-button:active':
        case '.el-button:focus,.el-button:hover':
            return multiChange(selector, '.el-button--default:not(.is-plain):not(.el-button--primary)')
        case '.el-button.is-active,.el-button.is-plain:active':
            return multiChange(selector, ':not(.el-button--primary)')
        case '.el-button.is-plain:active':
        case '.el-button.is-plain:focus,.el-button.is-plain:hover':
            return multiChange(selector, '.el-button--default')
        case '.el-pagination button:hover':
            return selector + ':not(:disabled)'
        default:
            // 因懒加载模块的css在主题色样式theme-colors.css之后加载，会覆盖theme-colors.css的样式，导致主题色替换失败。为了避免这情况，需要添加前缀提升优先级。
            return multiChange(selector, '', 'body ')
    }
}

function multiChange(selector, surfix, prefix) {
    return selector.split(',').map(function (s) {
        return (prefix || '') + s + surfix
    }).join(',')
}

module.exports = {
    getElementUISeries: getElementUISeries,
    varyColor: varyColor,
    changeSelector: changeSelector
}
