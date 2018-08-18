var varyColor = require('./varyColor')
var idMap = {}

module.exports = {
    changeColor(newColor, oldColor, varyColorFunc, cssUrl) { //varyColorFunc: color => colorArray
        var _this = this;
        if (typeof newColor === 'string') {
            getCssText(cssUrl, setCssTo) //#409EFF - 网上下载的element-ui主色

            // var links = [].filter.call(document.querySelectorAll('link'), function (e) {
            //     //根据pages下的所有页面列举css
            //     return /(main|index)\..+\.css/.test(e.href || '')
            // });
            // if (links[0]) {
            //     getCssText(links[0].href, _this.themeColor, setCssTo)
            // }
            // _this.themeColor = newColor
        }

        function getCssText(url, setCssTo) {
            var elStyle = idMap[url] && document.getElementById(idMap[url]);
            if (elStyle) {
                oldColor = elStyle.color
                setCssTo(elStyle, elStyle.innerText)
            }
            else {
                elStyle = document.head.appendChild(document.createElement('style'))
                idMap[url] = 'css_' + (+new Date())
                elStyle.setAttribute('id', idMap[url])
                _this.getCSSString(url, cssText => {
                    setCssTo(elStyle, cssText)
                })
            }
        }

        function setCssTo(elStyle, cssText) {
            var newColors = varyColorFunc(newColor.replace('#', ''))
            var oldColors = varyColorFunc(oldColor.replace('#', ''))
            cssText = _this.replaceCssText(cssText, oldColors, newColors)
            elStyle.color = newColor
            elStyle.innerText = cssText
        }
    },
    replaceCssText: function (cssText, oldColors, newColors) {
        oldColors.forEach(function (e, t) {
            cssText = cssText.replace(new RegExp(e, 'ig'), newColors[t])
        })
        return cssText
    },
    getCSSString: function (url, callback) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                var cssTx = xhr.responseText.replace(/@font-face{[^}]+}/, '')
                callback(cssTx)
            }
        }
        xhr.open('GET', url)
        xhr.send()
    },
}