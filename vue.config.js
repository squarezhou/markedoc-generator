const webpack = require('webpack')
module.exports = {
  publicPath: './',
  configureWebpack: {
    plugins: [
      new webpack.ProvidePlugin({// 将 $ 变成全局变量
        $: 'jquery',
        jQuery: 'jquery',
        Popper: ['popper.js', 'default'] // bootstrap 中的一些组件依赖
      })
    ]
  }
}
