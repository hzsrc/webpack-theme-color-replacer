module.exports = {
  lighten: function (colorStr, rate) {
    var nums = this.toNum3(colorStr);
    var r = nums[0], g = nums[1], b = nums[2];
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
  rgba: function (colorStr, rate) {
    var nums = this.toNum3(colorStr);
    var r = nums[0], g = nums[1], b = nums[2];
    return r = Math.round((1 - rate) * r),
      g = Math.round((1 - rate) * g),
      b = Math.round((1 - rate) * b),
      r = r.toString(16),
      g = g.toString(16),
      b = b.toString(16),
    '#' + r + g + b
  },
  toNum3(colorStr) {
    if (colorStr.length == 3) {
      colorStr = colorStr[0] + colorStr[0] + colorStr[1] + colorStr[1] + colorStr[2] + colorStr[2]
    }
    var r = parseInt(colorStr.slice(0, 2), 16)
    var g = parseInt(colorStr.slice(2, 4), 16)
    var b = parseInt(colorStr.slice(4, 6), 16);
    return [r, g, b]
  }
}