var idMap = {};
var theme_COLOR_config;

module.exports = {
    changeColor: function (options, promiseForIE) {
        var win = window // || global
        if (!theme_COLOR_config) {
            theme_COLOR_config = win.__theme_COLOR_cfg || {}
            delete win.__theme_COLOR_cfg
        }
        var oldColors = options.oldColors || theme_COLOR_config.colors || []
        var newColors = options.newColors || []
        if (this._isSameArr(oldColors, newColors)) return

        var cssUrl = theme_COLOR_config.url || options.cssUrl;
        var _this = this;
        var PromiseCls = promiseForIE || win.Promise || ExecFunc
        return new PromiseCls(function (resolve, reject) {
            getCssText(cssUrl, setCssTo, resolve, reject)
        })

        function getCssText(url, setCssTo, resolve, reject) {
            var elStyle = idMap[url] && document.getElementById(idMap[url]);
            if (elStyle) {
                oldColors = elStyle.color.split('|')
                setCssTo(elStyle, elStyle.innerText)
                resolve()
            } else {
                elStyle = document.head.appendChild(document.createElement('style'))
                idMap[url] = 'css_' + (+new Date())
                elStyle.setAttribute('id', idMap[url])
                _this.getCSSString(url, function (cssText) {
                    setCssTo(elStyle, cssText)
                    resolve()
                }, reject)
            }
        }

        function setCssTo(elStyle, cssText) {
            cssText = _this.replaceCssText(cssText, oldColors, newColors)
            elStyle.color = newColors.join('|')
            elStyle.innerText = cssText
            theme_COLOR_config.colors = newColors
        }
    },
    _isSameArr: function (oldColors, newColors) {
        for (var i = 0, j = oldColors.length; i < j; i++) {
            if (oldColors[i] !== newColors[i]) {
                return false
            }
        }
        return true
    },
    replaceCssText: function (cssText, oldColors, newColors) {
        oldColors.forEach(function (color, t) {
            cssText = cssText.replace(new RegExp(color.replace(/,/g, ',\\s*'), 'ig'), newColors[t]) // 255, 255,3
        })
        return cssText
    },
    getCSSString: function (url, resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    resolve(xhr.responseText)
                } else {
                    reject(xhr.status)
                }
            }
        }
        xhr.onerror = function (e) {
            reject(e)
        }
        xhr.ontimeout = function (e) {
            reject(e)
        }
        xhr.open('GET', url)
        xhr.send()
    },
}

function ExecFunc(func) {
    var fn = function () {
    }
    func(fn, fn)
}