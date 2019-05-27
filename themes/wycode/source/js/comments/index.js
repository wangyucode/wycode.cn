Vue.component('wycode-comments',
    {
        props: {
            path: String
        },
        data: function () {
            return {
                show: false
            }
        },
        methods: {},
        mounted: function () {
            var queryData = {
                accessKey: "114c03ec4d6f40a4a1490a5638d8141d",
                appName: "wycode",
                topicId: this.path,
            };
            $.get('https://wycode.cn/web/api/public/comment/getComments', queryData, (response) => {
                console.log(response);
                if (response && response.data) {
                    this.show = true;
                } else {
                    alert('查询码不正确！');
                }
            });
        },
        template: `
<div v-if="show">
    <div class="comments-list">
        <div class="comment"></div>
    </div>
    {{path}}
    <span class="about-vue">此模块由 <a href="https://cn.vuejs.org" target="_blank">Vue.js</a> 驱动渲染</span>
</div>
`
    }
);

new Vue({el: '#comments'});
