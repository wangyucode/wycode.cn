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
    <div class="comments-list">
        <div class="comment"></div>
    </div>
    {{path}}
</div>
`
    }
);

new Vue({el: '#comments'});
