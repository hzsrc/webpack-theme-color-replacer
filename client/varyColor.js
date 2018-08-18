module.exports = {
    lighten: function (colorStr1, rate) {
        var r = parseInt(colorStr1.slice(0, 2), 16)
        var g = parseInt(colorStr1.slice(2, 4), 16)
        var b = parseInt(colorStr1.slice(4, 6), 16);
        return rate === 0
            ? '#' + [r.toString(16), g.toString(16), b.toString(16)].join('')
            : (
                r += Math.round(rate * (255 - r)),
                    g += Math.round(rate * (255 - g)),
                    b += Math.round(rate * (255 - b)),
                    r = r.toString(16),
                    g = g.toString(16),
                    b = b.toString(16),
                '#' + r + g + b
            )
    },
    rgba: function (colorStr1, rate) {
        var r = parseInt(colorStr1.slice(0, 2), 16)
        var g = parseInt(colorStr1.slice(2, 4), 16)
        var b = parseInt(colorStr1.slice(4, 6), 16);
        return r = Math.round((1 - rate) * r),
            g = Math.round((1 - rate) * g),
            b = Math.round((1 - rate) * b),
            r = r.toString(16),
            g = g.toString(16),
            b = b.toString(16),
        '#' + r + g + b
    }
}