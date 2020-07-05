var options = require('./options')

module.exports = {
    dev(src, file, isReplaced) {
        var findStrings = !isReplaced
            ? '1890ff;40a9ff;096dd9;24, 144, 255;91d5ff;e6f7ff;bae7ff'//options.dev.matchColors
            : 'bd3be7;d667f5;9629c2;189,59,231;f5bdff;fef0ff;fce6ff'//options.dev.newColors
        test(src, file, findStrings)
    },
    build(src, file, isReplaced) {
        var findStrings = !isReplaced
            ? 'faaf74;#f67a1780;246, 122, 23;#222;#222223;#22222350;#fef2e8;#f67a17;#fde4d1'
            : '#d789f1;#bd3be780;189,59,231;#333;#333334;#33333450;#f8ebfd;#bd3be7;#f2d8fa'
        test(src, file, findStrings)
    }
}

function test(src, file, findStrings) {
    findStrings.split(';').forEach(str => {
        if (src.indexOf(str) === -1) {
            console.error(`Failed: ${str} not in ${file}.`)
        }
    })
}
