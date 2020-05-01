module.exports = function testContent(src, file, isReplaced) {
    var findStrings = !isReplaced
        ? 'faaf74;#f67a1780;246, 122, 23;#222;#222223;#22222350;#fef2e8;#f67a17;#fde4d1'
        : '#d789f1;#bd3be780;189,59,231;#333;#333334;#33333450;#f8ebfd;#bd3be7;#f2d8fa'
    findStrings.split(';').forEach(str => {
        if (src.indexOf(str) === -1) {
            console.error(`Failed: ${str} not in ${file}.`)
        }
    })
}
