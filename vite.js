'use strict';

var path = require('path');
var fs = require('fs');
var Extractor = require('./src/Extractor');
var replaceFileName = require('./src/replaceFileName');
var varyColor = require('./client/varyColor');

var CSS_EXT_RE = /\.(css|scss|sass|less|styl|stylus)$/i;
var HASH_PLACEHOLDER_RE = /[-.]?\[(?:contenthash|hash)(?::\d+)?\]/gi;
var LINE_RE = /\n/g;

function normalizePath(p) {
    return String(p).replace(/\\/g, '/');
}

function splitId(id) {
    var q = id.indexOf('?');
    return q > -1 ? [id.slice(0, q), id.slice(q)] : [id, ''];
}

function dropDuplicate(arr) {
    var map = {};
    var r = [];
    for (var i = 0; i < arr.length; i++) {
        var s = arr[i];
        if (!map[s]) {
            r.push(s);
            map[s] = 1;
        }
    }
    return r;
}

// Vite `?inline` 的 transform 结果通常是 `export default "<css>"`，也可能直接是 css 文本。
function cssFromTransformResult(code) {
    if (typeof code !== 'string') return '';
    var m = /^\s*export\s+default\s+("[\s\S]*")\s*;?\s*$/.exec(code);
    if (m) {
        try { return JSON.parse(m[1]); } catch (e) { /* fallthrough */ }
    }
    if (!/^\s*(import|export|const|let|var|function|class)\b/.test(code)) {
        return code;
    }
    return '';
}

module.exports = function viteThemeColorReplacer(options) {
    options = options || {};
    var opts = Object.assign({
        fileName: 'h5/css/theme-colors.[contenthash:8].css',
        matchColors: [],
        configVar: null,
        injectCss: false,
        injectToHtml: false,
        externalCssFiles: null,
        resolveCss: null,
        changeSelector: null,
        include: null,
        exclude: null,
    }, options);

    var include = toRegExp(opts.include) || CSS_EXT_RE;
    var exclude = toRegExp(opts.exclude);
    var extractor = new Extractor(opts);

    var configVar = opts.configVar;
    var isDev = false;
    var server = null;
    var root = null;

    // dev 状态
    var cssModules = new Set();
    var timer = null;
    var devFileName = null;
    var devFile = null;

    // build 状态（供 injectToHtml 的 transformIndexHtml 读取）
    var buildOutFile = null;
    var buildOutput = null;

    function toRegExp(v) {
        if (!v) return null;
        return v instanceof RegExp ? v : new RegExp(v);
    }

    // Vue/Svelte/Astro 等 SFC 的 <style> 子模块 id 形如 /abs/Comp.vue?vue&type=style&index=0&lang.css，
    // base 是 .vue 等文件、不匹配 include 的 css 扩展名，但也要纳入颜色提取。
    function isSfcStyleId(id) {
        return /[?&]type=style(?:&|$)/.test(id);
    }

    function isSfcFile(file) {
        return /\.(vue|svelte|astro)$/i.test(file);
    }

    function isCssModule(id) {
        var base = splitId(id)[0];
        if (isDevOutputFile(base)) return false;
        if (exclude && exclude.test(base)) return false;
        if (isSfcStyleId(id)) return true;
        return include.test(base);
    }

    // cssModules 里存的 key：普通 css 存裸路径，SFC style 子模块存完整 id（含 query，用于保留 index/lang/scoped）
    function moduleKey(id) {
        return isSfcStyleId(id) ? id : splitId(id)[0];
    }

    // 由 key 得到带 inline 的 Vite 变换 URL。
    // 注意：不能简单在末尾追加 &inline。对 SFC style 子模块（...?vue&type=style&...&lang.scss），
    // lang.scss 必须保持在查询串末尾，否则 Vite 的 CSS_LANGS_RE（/\.(css|scss|...)(?:$|\?)/）
    // 匹配不到 lang，vite:css 就不会编译预处理，vue 插件会拿到未编译的 scss 而报错。
    // 因此把 inline 插到 &lang.xxx 之前。
    function inlineTransformUrl(key) {
        var q = key.indexOf('?');
        var file = q > -1 ? key.slice(0, q) : key;
        var query = q > -1 ? key.slice(q) : '';
        if (!query) {
            query = '?inline';
        } else {
            var langIdx = query.search(/&lang\.[a-z0-9]+$/i);
            if (langIdx > -1) {
                query = query.slice(0, langIdx) + '&inline' + query.slice(langIdx);
            } else {
                query = query + '&inline';
            }
        }
        return toViteUrl(file) + query;
    }

    // 插件自身生成的 dev 输出文件（如 public/h5/css/theme-colors.css）。
    // 该文件位于被 Vite watch 的目录内，必须排除，否则会形成 写文件→watch→重新生成 的死循环。
    function isDevOutputFile(file) {
        if (!devFile || !file) return false;
        return normalizePath(file) === normalizePath(devFile);
    }

    function devFileNameFor() {
        return String(opts.fileName).replace(HASH_PLACEHOLDER_RE, '');
    }

    function devFileFor() {
        var name = devFileNameFor();
        var publicDir = server && server.config.publicDir;
        if (publicDir) {
            return path.join(publicDir, name);
        }
        return path.join(root || process.cwd(), name);
    }

    function toViteUrl(id) {
        var base = splitId(id)[0];
        var rel = normalizePath(path.relative(root || process.cwd(), base));
        if (!rel || rel.startsWith('..') || path.isAbsolute(rel) || /^[a-zA-Z]:/.test(rel)) {
            // 根目录之外的模块（如 link 的包），走 /@fs/
            return '/@fs/' + normalizePath(base).replace(/^([a-zA-Z]):/, '/$1');
        }
        return '/' + rel.replace(/^\/+/, '');
    }

    function scheduleRegenerate() {
        if (!server) return;
        if (timer) clearTimeout(timer);
        timer = setTimeout(regenerate, 100);
    }

    async function extractPreproc(key) {
        try {
            var res = await server.transformRequest(inlineTransformUrl(key));
            if (!res || res.code == null) return [];
            return extractor.extractColors(cssFromTransformResult(res.code));
        } catch (e) {
            return [];
        }
    }

    async function regenerate() {
        timer = null;
        if (!server) return;
        var arr = [];
        for (var key of cssModules) {
            var extracted = await extractPreproc(key);
            if (extracted && extracted.length) arr = arr.concat(extracted);
        }
        // 外部 css 文件（如 cdn 引用的库 css）
        if (opts.externalCssFiles) {
            [].concat(opts.externalCssFiles).forEach(function (file) {
                try { arr = arr.concat(extractor.extractColors(fs.readFileSync(file, 'utf-8'))); } catch (e) { /* ignore */ }
            });
        }
        var output = dropDuplicate(arr).join('\n');
        if (opts.resolveCss) output = opts.resolveCss(output, arr);
        writeDevFile(output);
    }

    function writeDevFile(output) {
        devFileName = devFileNameFor();
        devFile = devFileFor();
        fs.mkdirSync(path.dirname(devFile), { recursive: true });
        fs.writeFileSync(devFile, output);
        console.log('Extracted theme color css content length: ' + output.length);
    }

    function winExpr() {
        return '(typeof window===\'undefined\'?global:window)';
    }

    // 运行时配置必须挂到 window[configVar] 上。
    // client 里读取的是 win()[WP_THEME_CONFIG]：WP_THEME_CONFIG 只是 define（等价 webpack DefinePlugin）
    // 在编译期替换成 configVar 字符串字面量的令牌，运行时并不存在名为 WP_THEME_CONFIG 的配置对象。
    // 因此这里用 [<configVar 字面量>] 取值，而不是拼接 window.<name>（configVar 含 . / - 等字符时也不会出错）。
    function buildConfigJs(cfg) {
        return winExpr() + '[' + JSON.stringify(configVar) + ']=' + JSON.stringify(cfg) + ';';
    }

    function injectScriptTag(html, js) {
        var tag = '<script>' + js + '</script>';
        if (/<\/head>/i.test(html)) {
            return html.replace(/<\/head>/i, tag + '</head>');
        }
        return tag + html;
    }

    return {
        name: 'vite-theme-color-replacer',

        config(config, env) {
            isDev = env && env.command === 'serve';
            if (!configVar) {
                configVar = isDev ? 'tc_cfg_dev' : ('tc_cfg_' + Math.random().toString().slice(2));
            }
            // WP_THEME_CONFIG 等价于 webpack DefinePlugin 的令牌，编译期被替换成 configVar 字面量：
            // build 下为静态替换；dev 下由 Vite 提供（Vite 4/5 静态替换，Vite 6 起 client 端改由
            // /@vite/env 把 define 写入 globalThis），两种方式都能让 client 的 win()[WP_THEME_CONFIG] 解析成功。
            return {
                define: {
                    WP_THEME_CONFIG: JSON.stringify(configVar),
                },
            };
        },

        configureServer(s) {
            server = s;
            root = s.config.root;
            devFileName = devFileNameFor();
            devFile = devFileFor();

            // publicDir 被禁用时，自建中间件兜底提供 dev 实体文件
            if (!s.config.publicDir) {
                s.middlewares.use(function (req, res, next) {
                    if (req.url === '/' + devFileName) {
                        try {
                            var data = fs.readFileSync(devFile, 'utf-8');
                            res.setHeader('Content-Type', 'text/css');
                            res.end(data);
                            return;
                        } catch (e) { /* 尚未生成 */ }
                    }
                    next();
                });
            }
        },

        transform(code, id) {
            if (!isDev || !server) return null;
            var parts = splitId(id);
            if (parts[1].indexOf('inline') > -1 || parts[1].indexOf('direct') > -1 || parts[1].indexOf('used') > -1) {
                return null;
            }
            if (!isCssModule(id)) return null;
            cssModules.add(moduleKey(id));
            scheduleRegenerate();
            return null;
        },

        handleHotUpdate(ctx) {
            if (!isDev || !server) return;
            if (isCssModule(ctx.file)) {
                cssModules.add(moduleKey(ctx.file));
                scheduleRegenerate();
            } else if (isSfcFile(ctx.file)) {
                // SFC 样式变化：已加载的 style 子模块会重新 transform（并重新加入 cssModules），
                // 这里只需触发重新提取；transformRequest 每次都会重新读盘，拿到最新内容。
                scheduleRegenerate();
            }
            return ctx.modules;
        },

        transformIndexHtml(html) {
            if (isDev) {
                // dev：WP_THEME_CONFIG 由 define 提供，这里只注入运行时配置对象 window[configVar]，
                // 供 client 的 win()[WP_THEME_CONFIG] 解析；不再写 window.WP_THEME_CONFIG（它只是编译期令牌）。
                var cfg = { url: '/' + (devFileName || devFileNameFor()), colors: opts.matchColors };
                return injectScriptTag(html, buildConfigJs(cfg));
            }
            if (!opts.injectToHtml || !buildOutFile) return html;
            var bcfg = { url: '/' + buildOutFile, colors: opts.matchColors };
            if (opts.injectCss && buildOutput) bcfg.cssCode = buildOutput.replace(LINE_RE, '');
            return injectScriptTag(html, buildConfigJs(bcfg));
        },

        generateBundle: {
            order: 'post',
            handler: function (options, bundle) {
                var arr = [];
                for (var name in bundle) {
                    var item = bundle[name];
                    if (item.type === 'asset' && /\.css$/i.test(name)) {
                        arr = arr.concat(extractor.extractColors(String(item.source)));
                    }
                }
                if (opts.externalCssFiles) {
                    [].concat(opts.externalCssFiles).forEach(function (file) {
                        try { arr = arr.concat(extractor.extractColors(fs.readFileSync(file, 'utf-8'))); } catch (e) { /* ignore */ }
                    });
                }
                var output = dropDuplicate(arr).join('\n');
                if (opts.resolveCss) output = opts.resolveCss(output, arr);
                var outFile = replaceFileName(opts.fileName, output);

                this.emitFile({ type: 'asset', fileName: outFile, source: output });
                console.log('Extracted theme color css content length: ' + output.length);

                var cfg = { url: '/' + outFile, colors: opts.matchColors };
                if (opts.injectCss) cfg.cssCode = output.replace(LINE_RE, '');
                var configJs = buildConfigJs(cfg);

                buildOutFile = outFile;
                buildOutput = output;

                if (!opts.injectToHtml) {
                    for (var n in bundle) {
                        var chunk = bundle[n];
                        if (chunk.type === 'chunk' && chunk.isEntry) {
                            chunk.code = configJs + chunk.code;
                        }
                    }
                }
            },
        },
    };
};

module.exports.varyColor = varyColor;
