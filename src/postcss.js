var postcss = require('postcss')
var rule = require('./extractRule.js')
var defaults = {}

module.exports = postcss.plugin('theme-color-replacer', options => {
    const opts = Object.assign({}, defaults, options);
    var testCssCode = rule.makeTester(opts)
    return css => {
        var rules = []
        // css.walkDecls((decl, i) => {
        //     if (testCssCode(decl.value)) nodes.push(decl)
        // })
        css.walk(rule => {
            if (rule.type === 'rule') {
                var filtered = rule.nodes.filter(node => {
                    return testCssCode(node.value)
                })
                if (filtered.length) {
                    rules.push({ selector: rule.selector, nodes: filtered })
                }
            }
        })
        if (!rule.cssFormPostCss) rule.cssFormPostCss = [];
        [].push.apply(rule.cssFormPostCss, rules)
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
