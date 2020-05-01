var idMap = {}; // {[url]: {id,colors}}
var theme_COLOR_config;

module.exports = {
    _tryNum: 0,
    changeColor: function (options, promiseForIE) {
        var win = window
        var Promise = promiseForIE || win.Promise
        var _this = this;
        if (!theme_COLOR_config) {
            theme_COLOR_config = win.__theme_COLOR_cfg
            var later = retry()
            //重试直到theme_COLOR_config加载
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
                setCssText(cssUrl, resolve, reject)
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

        function setCssText(url, resolve, reject) {
            var last = idMap[url] //url可能被changeUrl改变
            var elStyle = last && document.getElementById(last.id);
            if (elStyle && last.colors) {
                //之前已替换过
                oldColors = last.colors
                setCssTo(elStyle.innerText)
                resolve()
            } else {
                //第一次替换
                last = { id: 'css_' + (+new Date()) }
                idMap[url] = last
                elStyle = document.querySelector(options.appendToEl || 'body')
                    .appendChild(document.createElement('style'))

                elStyle.setAttribute('id', last.id)

                _this.getCSSString(url, function (cssText) {
                    setCssTo(cssText)
                    resolve()
                }, reject)
            }

            function setCssTo(cssText) {
                cssText = _this.replaceCssText(cssText, oldColors, newColors)
                elStyle.innerText = cssText
                last.colors = newColors
            }
        }

    },
    replaceCssText: function (cssText, oldColors, newColors) {
        oldColors.forEach(function (color, t) {
            //#222、#222223、#22222350、222, 255,3 => #333、#333334、#33333450、211,133,53
            cssText = cssText.replace(new RegExp(color.replace(/,/g, ',\\s*') + '([\\da-f]{2})?\\b', 'ig'), newColors[t] + '$1') // 255, 255,3
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
