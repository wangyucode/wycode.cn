const { path } = require('@vuepress/utils')

module.exports = {
    theme: path.resolve(__dirname, './theme'),
    lang: 'zh-CN',
    title: '王郁的小站',
    head: [
        ['link', { rel: 'icon shortcut', href: '/favicon.svg' }]
    ],
    themeConfig: {
        logo: '/favicon.svg',
        repo: 'wangyucode/wycode.cn',
        navbar: [
            {
                text: '博客',
                link: 'index.md'
            },

            // 字符串 - 页面文件路径
            'angular.md',
        ],

        themePlugins: {
            git: false
        }
    },
}