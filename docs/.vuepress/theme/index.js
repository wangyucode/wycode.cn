const { path } = require('@vuepress/utils')

const theme = (options, app) => {
  return {
    name: 'vuepress-theme-wycode',
    extends: '@vuepress/theme-default',
    layouts: path.resolve(__dirname, 'layouts')
  }
}

module.exports = theme;