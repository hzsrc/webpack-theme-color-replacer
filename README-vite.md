# 在 Vite 下使用 webpack-theme-color-replacer

该插件可以从**所有输出的 CSS 文件**（含 `.less` / `.scss` / `.sass` / `.styl` 等预处理产物，例如 element-ui 的主题色）中提取匹配的颜色样式，生成一个只包含颜色样式的 `theme-colors.css`。页面运行时，前端 `client` 会下载这个 CSS 文件，并把旧颜色动态替换为新颜色。

本文档描述 **Vite 构建环境**下的用法（webpack 用法见 [README.md](./README.md)）。

## 安装

```bash
npm i -D webpack-theme-color-replacer
```

> 插件本体不依赖 Vite，`vite` 作为可选 peerDependency 由你的项目自行提供（>=4）。

## 配置 `vite.config.js`

```js
const ThemeColorReplacer = require('webpack-theme-color-replacer/vite')
// 或 ESM：import ThemeColorReplacer from 'webpack-theme-color-replacer/vite'

module.exports = {
  plugins: [
    ThemeColorReplacer({
      fileName: 'h5/css/theme-colors.[contenthash:8].css', // 可选，输出 css 文件名，支持 [contenthash] / [hash]
      matchColors: ['#ed4040', '#4b0', '255,80,80', '27, 92.531%, 52.745%'], // 需要提取的颜色数组，支持 rgb / hsl
      // resolveCss(resultCss) { // 可选，自定义处理提取结果
      //   return resultCss.replace(/#ccc/g, '#eee')
      // },
      externalCssFiles: ['./node_modules/element-ui/lib/theme-chalk/index.css'], // 可选，字符串或数组，额外从这些外部 css 文件提取颜色
      // changeSelector(selector, util) { // 可选，改写选择器以提升优先级、解决懒加载问题
      //   return util.changeEach(selector, '.el-button--default')
      // },
      injectCss: false, // 可选，build 时把 css 文本内联进 js，无需再下载 theme-colors-xxx.css
      // injectToHtml: true, // 可选，build 时把配置注入 html 而非入口 js
      // configVar: 'myThemeCfg', // 可选，自定义配置变量名
      // include: /\.(css|scss|sass|less|styl|stylus)$/i, // 可选，匹配要提取的 CSS 文件
      // exclude: /node_modules/, // 可选，排除不提取的文件
    }),
  ],
}
```

## dev 与 build 行为

| 模式 | 产物 | 说明 |
|------|------|------|
| dev（`vite` / `vite dev`） | `public/h5/css/theme-colors.css` | 文件名中的 `[contenthash]` 会被去掉；插件监测 CSS（含预处理）变化，**实时更新该实体文件** |
| build（`vite build`） | `h5/css/theme-colors.[contenthash:8].css` | 遍历构建产物中的所有 CSS 资产提取，输出带 contenthash 的实体文件 |

两种模式下前端运行时用法完全一致，配置变量 `window[configVar] = { url, colors, cssCode? }` 会被自动注入：

- **dev**：通过 `transformIndexHtml` 注入到 html；`url` 为 `/h5/css/theme-colors.css`。
- **build**：默认把配置前置注入到入口 chunk；设置 `injectToHtml: true` 时改为注入 html，`url` 为 `/h5/css/theme-colors.<hash>.css`。

> 说明：`WP_THEME_CONFIG` 只是 `define`（等价 webpack 的 `DefinePlugin`）的**编译期令牌**：编译时它会被替换成 `configVar` 的字符串字面量，`client` 里的 `win()[WP_THEME_CONFIG]` 因此变成 `window[configVar]`。所以插件注入的始终是运行时配置对象 `window[configVar] = { url, colors, cssCode? }`，**不会**写 `window.WP_THEME_CONFIG`。dev 下由 Vite 的 `define` 让 `win()[WP_THEME_CONFIG]` 能解析（Vite 6 起 client 端不再静态替换，改由 `/@vite/env` 把 `define` 写成全局变量）；build 下 `define` 为静态替换。

## 运行时换色

前端运行时用法与 webpack 完全一致：

```js
import client from 'webpack-theme-color-replacer/client'

export function changeColor() {
  const options = {
    newColors: ['#f67a17', '#f67a17', '160,20,255', '285,78.182%,56.863%'], // 新颜色数组，与 matchColors 一一对应
    // appendToEl: 'head', // 可选，`<style>` 挂载的元素选择器，默认 'body'
    // changeUrl(cssUrl) { // 可选，改写下载 url；非 hash 路由时需改成绝对路径
    //   return `/${cssUrl}`
    // },
  }

  client.changer.changeColor(options, Promise).then(() => {
    console.log('Theme colors changed!')
  })
}
```

## 构建选项

这些选项用于 `ThemeColorReplacer(options)`。

#### matchColors: Array&lt;string>
需要提取的颜色数组，包含任意一个颜色的 CSS 规则都会被提取出来。

#### fileName: string
可选。输出 css 文件名，支持 `[contenthash]` / `[hash]`。默认 `h5/css/theme-colors.[contenthash:8].css`。

#### resolveCss: Function(resultCss: string): string
可选。自定义处理提取结果。

#### externalCssFiles: string | Array&lt;string>
可选。额外从这些外部 css 文件（如 cdn 的库样式）提取颜色。

#### changeSelector: Function(selector: string, util: { rules: Array&lt;string>, changeEach: Function }): string
可选。改写 css 选择器，以提升优先级、解决懒加载问题。

#### injectCss: boolean
可选（默认 `false`）。build 时把 css 文本内联进 js，运行时无需再下载 `theme-colors-xxx.css`。

#### injectToHtml: boolean
可选（默认 `false`）。build 时把配置注入 html 而非入口 chunk（dev 下总是注入 html）。

#### configVar: string
可选。自定义配置变量名。dev 默认 `tc_cfg_dev`，build 默认 `tc_cfg_` + 随机后缀。

#### include: RegExp
可选（Vite 专属）。匹配需要提取的 CSS 文件。默认 `/\.(css|scss|sass|less|styl|stylus)$/i`，覆盖所有 CSS 与预处理。

#### exclude: RegExp
可选（Vite 专属）。排除不参与提取的文件。

## 运行时选项

这些选项用于 `client.changer.changeColor(options)`，与 webpack 相同。

#### newColors: Array&lt;string>
新颜色数组，与 `matchColors` 一一对应。

#### appendToEl: string
可选。`<style>` 挂载的元素选择器，默认 `body`。

#### changeUrl: Function(cssUrl: string): string
可选。改写下载 url；非 hash 路由时需改成绝对路径。

## 注意事项

1. dev 下实体文件默认生成在 `public/` 目录（Vite 静态目录，自动以 `/h5/css/theme-colors.css` 提供服务），建议把生成的 `public/h5/css/` 加入 `.gitignore`。
2. 预处理 CSS（`.scss`/`.less`/`.styl` 等）在 dev 下通过 Vite 的 `?inline` 编译后提取，首次访问会略重；文件数量不多时可忽略。
3. 若把 Vite 的 `publicDir` 设为 `false`，插件会用中间件兜底提供 dev 实体文件，但建议保持默认 `public` 目录。
