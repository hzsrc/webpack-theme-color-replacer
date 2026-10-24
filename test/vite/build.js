process.env.NODE_ENV = 'production'

var path = require('path')
var fs = require('fs')
var glob = require('glob')
var { build, createServer } = require('vite')
var plugin = require('../../vite')
var themeColorChanger = require('../../client/themeColorChanger')

var root = __dirname

var options = {
    fileName: 'h5/css/theme-colors.[contenthash:8].css',
    matchColors: ['#f67a17', '#222', '#409eff'],
    newColors: ['#bd3be7', '#333', '#123456'],
    configVar: 'test_cfg_vite',
}

run().then(function (ok) {
    console.log('Vite test end.')
    process.exit(ok ? 0 : 1)
}).catch(function (e) {
    console.error(e)
    process.exit(1)
})

async function run() {
    var ok1 = await buildTest()
    var ok2 = await devTest()
    var ok3 = await devLoopTest()
    return ok1 && ok2 && ok3
}

async function buildTest() {
    var outDir = path.join(root, 'dist')
    fs.rmSync(outDir, { recursive: true, force: true })

    await build({
        root: root,
        configFile: false,
        logLevel: 'error',
        plugins: [plugin(options)],
        build: {
            outDir: 'dist',
            cssCodeSplit: false,
        },
    })

    // 1. 实体 css 文件
    var cssFiles = glob.sync(path.join(outDir, 'h5/css/theme-colors.*.css'))
    if (cssFiles.length !== 1) return fail('expected 1 theme-colors css, got ' + cssFiles.length)
    var cssText = fs.readFileSync(cssFiles[0], 'utf-8')

    // 2. 内容断言
    if (cssText.indexOf('#f67a17') === -1) return fail('css should contain #f67a17')
    if (cssText.indexOf('#409eff') === -1) return fail('css should contain compiled #409eff (scss)')
    if (cssText.indexOf('#123456') !== -1) return fail('css should NOT contain non-match #123456')
    if (cssText.indexOf('#abcdef') !== -1) return fail('css should NOT contain non-match #abcdef')

    // 3. 入口 js 注入配置
    var jsFiles = glob.sync(path.join(outDir, 'assets/*.js'))
    if (jsFiles.length === 0) return fail('no entry js found')
    var jsText = fs.readFileSync(jsFiles[0], 'utf-8')
    if (jsText.indexOf(options.configVar) === -1) return fail('entry js should contain ' + options.configVar)
    if (jsText.indexOf('h5/css/theme-colors.') === -1) return fail('entry js should contain theme-colors url')
    // build 下 define 会把 WP_THEME_CONFIG 替换成字符串字面量
    if (jsText.indexOf(JSON.stringify(options.configVar)) === -1) return fail('define should replace WP_THEME_CONFIG in build js')
    // 入口 chunk 注入的是 window[configVar] = { url, colors }，而不是 window.WP_THEME_CONFIG
    if (jsText.indexOf('.WP_THEME_CONFIG') !== -1) return fail('xx.WP_THEME_CONFIG should be xx[WP_THEME_CONFIG]')
    if (jsText.indexOf('[' + JSON.stringify(options.configVar) + ']=') === -1) return fail('entry js should inject window[' + JSON.stringify(options.configVar) + '] config')

    // 4. 换色测试
    var replaced = themeColorChanger.replaceCssText(cssText, options.matchColors, options.newColors)
    if (replaced.indexOf('#bd3be7') === -1) return fail('replaced css should contain #bd3be7')

    console.log('build test OK: ' + path.relative(root, cssFiles[0]) + ' (' + cssText.length + ' bytes)')
    return true
}

async function devTest() {
    var server = await createServer({
        root: root,
        configFile: false,
        logLevel: 'error',
        plugins: [plugin(options)],
        server: { middlewareMode: true },
    })

    try {
        // 触发 CSS transform（发现模块）
        await server.transformRequest('/a.css')
        await server.transformRequest('/b.scss')
        // SFC <style> 子模块（形如 .vue?vue&type=style&index=0&lang.css）也应被识别并累积提取
        await server.transformRequest('/d.css?vue&type=style&index=0&lang.css')

        // dev：WP_THEME_CONFIG 只是 define 的编译期令牌，html 里注入的是运行时配置 window[configVar]
        var html = '<!DOCTYPE html><html><head></head><body></body></html>'
        var out = await server.transformIndexHtml('/index.html', html)
        if (out.indexOf('window.WP_THEME_CONFIG') !== -1) {
            return fail('dev html should NOT assign window.WP_THEME_CONFIG (it is only a define token), got:\n' + out)
        }
        if (out.indexOf('[' + JSON.stringify(options.configVar) + ']=') === -1) {
            return fail('dev html should inject window[' + JSON.stringify(options.configVar) + '], got:\n' + out)
        }
        if (out.indexOf('/h5/css/theme-colors.css') === -1) {
            return fail('dev html should inject dev css url, got:\n' + out)
        }

        // 等待防抖后的 regenerate 写文件
        await sleep(400)

        var devFile = path.join(root, 'public', 'h5/css/theme-colors.css')
        if (!fs.existsSync(devFile)) return fail('dev file not written: ' + devFile)
        var devCss = fs.readFileSync(devFile, 'utf-8')
        if (devCss.indexOf('#f67a17') === -1) return fail('dev css should contain #f67a17')
        if (devCss.indexOf('#409eff') === -1) return fail('dev css should contain compiled #409eff (scss)')
        if (devCss.indexOf('.sfc-style-rule') === -1) return fail('dev css should contain SFC <style> sub-module (via type=style query)')

        console.log('dev test OK: ' + path.relative(root, devFile) + ' (' + devCss.length + ' bytes)')
        return true
    } finally {
        await server.close()
    }
}

// 回归测试：插件生成的 dev 输出文件位于被 Vite watch 的 public 目录内。
// 若 handleHotUpdate 不忽略该文件，会形成 写文件→watch→重新生成 的死循环。
async function devLoopTest() {
    var p = plugin(options)
    var server = await createServer({
        root: root,
        configFile: false,
        logLevel: 'error',
        plugins: [p],
        server: { middlewareMode: true },
    })

    try {
        // 触发 CSS transform（发现模块），并等待首次 regenerate 写文件
        await server.transformRequest('/a.css')
        await sleep(400)

        var devFile = path.join(root, 'public', 'h5/css/theme-colors.css')
        if (!fs.existsSync(devFile)) return fail('dev loop test: dev file not written: ' + devFile)

        // 统计 transformRequest 调用次数：若 handleHotUpdate 误触发 regenerate，
        // 它会再次调用 transformRequest 重新提取。
        var calls = 0
        var orig = server.transformRequest.bind(server)
        server.transformRequest = async function (url) {
            calls++
            return orig(url)
        }

        // 模拟 Vite watcher 检测到输出文件自身变化后回调 handleHotUpdate
        p.handleHotUpdate({ file: devFile, modules: [] })

        // 超过防抖窗口后，若修复生效则不应有任何重新提取
        await sleep(400)
        if (calls !== 0) return fail('dev loop test: output file change triggered re-extraction (' + calls + ' calls)')

        console.log('dev loop test OK: output file ignored on hot update')
        return true
    } finally {
        await server.close()
    }
}

function sleep(ms) {
    return new Promise(function (r) { setTimeout(r, ms) })
}

function fail(msg) {
    console.error('FAIL: ' + msg)
    return false
}
