Vue.component('wycode-comments',
    {
        props: {
            path: String
        },
        data: function () {
            return {

            }
        },
        methods: {

        },
        template: `
<div>
    {{path}}
</div>
`
    }
);

new Vue({el: '#comments'});
