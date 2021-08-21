var postcss = require('postcss')
var rule = require('./extractRule.js')
var defaults = { t: 1 }

module.exports = postcss.plugin('theme-color-replacer', options => {
    const opts = Object.assign({}, defaults, options);
    var testCssCode = rule.makeTester(opts)
    return css => {
        console.log(3, css.source.input.file)
        var nodes = []
        css.walkDecls((decl, i) => {
            if (testCssCode(decl.value)) nodes.push(decl)
        })
        var vals = nodes.map(n => n.name + ':' + n.value).join(';')
        rule.cssFormPostCss = '{' + vals + '}'
    };
});


/*module.exports = (opts = {}) => {
    return {
        postcssPlugin: 'theme-color-replacer',
        Once (root, postcss) {
            debugger
            console.log(1)
            // Calls once per file, since every file has single Root
        },
        Declaration (node, { Rule }) {
            console.log(2)
            debugger
            // All declaration nodes
        },
        Rule (rule){
            console.log(3)
            debugger
        },
        //AtRule(r){},
        //RuleExit(){}
    }
}
module.exports.postcss = true

*/
