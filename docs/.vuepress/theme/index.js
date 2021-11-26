const { path } = require('@vuepress/utils')

const theme = (options, app) => {
    return {
        name: 'vuepress-theme-wycode',
        layouts: {
          Layout: path.resolve(__dirname, 'layouts/layout.vue'),
          404: path.resolve(__dirname, 'layouts/404.vue'),
        },
        // ...
    }
}

module.exports = theme;