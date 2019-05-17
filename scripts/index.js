'use strict';

function is_about(page) {
    return Boolean(page.__about);
}

function is_lab(page) {
    return Boolean(page.__lab);
}

function is_clipboard(page) {
    return Boolean(page.__clipboard);
}

function is_404(page) {
    return Boolean(page.__404);
}

function is_api(page) {
    return Boolean(page.__api);
}

function not_static_page(page) {
    return !is_about(page) &&
        !is_lab(page) &&
        !is_clipboard(page) &&
        !is_api(page) &&
        !is_404(page);
}

hexo.extend.helper.register('is_about', is_about);
hexo.extend.helper.register('is_lab', is_lab);
hexo.extend.helper.register('is_clipboard', is_clipboard);
hexo.extend.helper.register('is_404', is_404);
hexo.extend.helper.register('is_api', is_api);
hexo.extend.helper.register('not_static_page', not_static_page);

hexo.extend.generator.register('about', (locals) => {
    return {
        path: 'about.html',
        layout: 'about',
        data: {
            __about: true
        }
    };
});

hexo.extend.generator.register('lab', (locals) => {
    return {
        path: 'lab.html',
        layout: 'lab',
        data: {
            __lab: true
        }
    };
});

hexo.extend.generator.register('clipboard', (locals) => {
    return {
        path: 'clipboard.html',
        layout: 'clipboard',
        data: {
            __clipboard: true
        }
    };
});

hexo.extend.generator.register('404', (locals) => {
    return {
        path: '404.html',
        layout: '404',
        data: {
            __404: true
        }
    };
});

hexo.extend.generator.register('api', (locals) => {
    return {
        path: 'api.html',
        layout: 'api',
        data: {
            __api: true
        }
    };
});

