module.exports = function Extractor(options) {
    var matchColors = options.matchColors // ['#409EFF', '#409eff', '#53a8ff', '#66b1ff', '#79bbff', '#8cc5ff', '#a0cfff', '#b3d8ff', '#c6e2ff', '#d9ecff', '#ecf5ff', '#3a8ee6', '#337ecc']
        .map(c => new RegExp(c.replace(/,/g, ',\\s*'), 'i')); // 255, 255,3

    var lineReg = /\s+/g;
    var rightReg = /\}/g;
    var multiReg = /(^|,\s*)/g
    this.extractColors = function (src) {
        var ret = []
        var nameStart, nameEnd, cssEnd = -1;
        while (true) {
            nameStart = cssEnd + 1
            nameEnd = src.indexOf('{', nameStart)
            cssEnd = src.indexOf('}', nameEnd)
            if (cssEnd > -1 && cssEnd > nameEnd && nameEnd > nameStart) {
                var cssCode = src.slice(nameEnd + 1, cssEnd)
                var rules = this.getRules(cssCode)
                if (rules.length) {
                    var name = src.slice(nameStart, nameEnd)
                    name = name.replace(rightReg, '') // keyframes may left a '}' prefix here
                    name = name.replace(lineReg, ' ') // lines
                    var p = name.indexOf(';') //@charset utf-8;
                    if (p > -1) {
                        name = name.slice(p + 1)
                    }

                    if (options.cssPrefix) { // 加css名前缀，提升优先级
                        name = name.replace(multiReg, '$1body ')
                    }
                    ret.push(name + '{' + rules.join(';') + '}')
                }
            }
            else {
                break;
            }
        }
        return ret
    }
    this.getRules = function (cssCode) {
        var rules = cssCode.split(';')
        var ret = []
        rules.forEach(rule => {
            var index = matchColors.findIndex(colorReg => {
                return colorReg.test(rule)
            })
            if (index > -1) {
                ret.push(rule.replace(lineReg, ' '))
            }
        })
        return ret
    }
}