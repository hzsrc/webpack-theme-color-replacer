var extractorCss = require('./CssExtractor')

module.exports = function Extractor(options) {
    var matchColorRegs = options.matchColors // ['#409EFF', '#409eff', '#53a8ff', '#66b1ff', '#79bbff', '#8cc5ff', '#a0cfff', '#b3d8ff', '#c6e2ff', '#d9ecff', '#ecf5ff', '#3a8ee6', '#337ecc']
        .map(c => new RegExp(c.replace(/\s/g, '').replace(/,/g, ',\\s*') + '([\\da-f]{2})?(\\b|\\)|,|\\s)', 'i')); // 255, 255,3

    this.extractColors = function (src) {
        var it = this
        return extractorCss(src, options).map(function (css) {
            var rules = css.rules.filter(it.testCssCode);
            if(!rules.length) return ''
            return css.selector + '{' + rules.join(';') + '}'
        })
    }

    this.testCssCode = function (cssCode) {
        for (var colorReg of matchColorRegs) {
            if (colorReg.test(cssCode)) return true // && !ExclueCssReg.test(cssCode)
        }
        return false
    }
}
