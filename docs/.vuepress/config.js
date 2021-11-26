const { path } = require('@vuepress/utils')

module.exports = {
    theme: path.resolve(__dirname, './theme'),
    lang: 'zh-CN',
    title: '王郁的小站',
    description: 'description',
    head: [
        ['link', { rel: 'icon shortcut', href: '/favicon.svg' }],
        ['link', {
            rel: 'stylesheet',
            href: 'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css',
            integrity: 'sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3',
            crossorigin: 'anonymous'
        }],
    ],
}