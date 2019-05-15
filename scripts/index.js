'use strict';

hexo.extend.helper.register('is_about', (page) => {
    return Boolean(page.__about);
});

hexo.extend.helper.register('is_lab', (page) => {
    return Boolean(page.__lab);
});

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



