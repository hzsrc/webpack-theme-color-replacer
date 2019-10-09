var idMap = {};
var theme_COLOR_config;

module.exports = {
    _tryNum: 0,
    changeColor: function (options, promiseForIE) {
        var win = window // || global
        var Promise = promiseForIE || win.Promise
        var _this = this;
        if (!theme_COLOR_config) {
            theme_COLOR_config = win.__theme_COLOR_cfg
            var later = retry()
            if (later) return later
        }
        var oldColors = options.oldColors || theme_COLOR_config.colors || []
        var newColors = options.newColors || []

        var cssUrl = theme_COLOR_config.url || options.cssUrl;
        if (options.changeUrl) {
            cssUrl = options.changeUrl(cssUrl)
        }

        return new Promise(function (resolve, reject) {
            if (isSameArr(oldColors, newColors)) {
                resolve()
            } else {
                getCssText(cssUrl, setCssTo, resolve, reject)
            }
        })

        function retry() {
            if (!theme_COLOR_config) {
                if (_this._tryNum < 9) {
                    _this._tryNum = _this._tryNum + 1
                    return new Promise(function (resolve, reject) {
                        setTimeout(function () {
                            resolve(_this.changeColor(options, promiseForIE))
                        }, 100)
                    })
                } else {
                    theme_COLOR_config = {}
                }
            }
        }

        function getCssText(url, setCssTo, resolve, reject) {
            var elStyle = idMap[url] && document.getElementById(idMap[url]);
            if (elStyle) {
                oldColors = elStyle.color.split('|')
                setCssTo(elStyle, elStyle.innerText)
                resolve()
            } else {
                elStyle = document.querySelector(options.appendToEl || 'body')
                    .appendChild(document.createElement('style'))
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
    replaceCssText: function (cssText, oldColors, newColors) {
        oldColors.forEach(function (color, t) {
            cssText = cssText.replace(new RegExp(color.replace(/,/g, ',\\s*'), 'ig'), newColors[t]) // 255, 255,3
        })
        return cssText
    },
    getCSSString: function (url, resolve, reject) {
        var css = window.__theme_COLOR_css
        if (css) {
            // css已内嵌在js中
            window.__theme_COLOR_css = ''
            resolve(css)
            return
        }

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

function isSameArr(oldColors, newColors) {
    if (oldColors.length !== newColors.length) {
        return false
    }
    for (var i = 0, j = oldColors.length; i < j; i++) {
        if (oldColors[i] !== newColors[i]) {
            return false
        }
    }
    return true
}
