Vue.component('wycode-comments',
    {
        props: {
            path: String
        },
        data: function () {
            return {
                hasLogin: false,
                show: false,
                comments: [],
                githubAuthorizeUrl: "https://github.com/login/oauth/authorize?scope=read:user&client_id=ac839e7de6bee6fa3776&redirect_uri="+location.href
            }
        },
        methods: {
            handleSend: function () {

            },

        },
        mounted: function () {
            var queryData = {
                accessKey: "114c03ec4d6f40a4a1490a5638d8141d",
                appName: "wycode",
                topicId: this.path,
            };
            $.get('https://wycode.cn/web/api/public/comment/getComments', queryData, (response) => {
                console.log(response);
                if (response && response.success) {
                    this.show = true;
                } else {
                    log.error(response.error)
                }
            });

            var userId = localStorage.getItem("userId")
        },
        template: `
<div v-if="show" class="widget-wrap">
    <div class="comments-list">
        <div class="comment" v-for="comment in comments"></div>
    </div>
    <div v-if="!hasLogin" class="comments-login">
        <a class="btn btn-success" role="button" v-bind:href="githubAuthorizeUrl"><i class="fab fa-github" style="color: white"></i>  Github登录</a>
        <button class="btn btn-outline-secondary" type="button">匿名评论</button>
    </div>
    <div class="comments-input input-group">
        <input type="text" class="form-control" placeholder="评论一下吧？" aria-label="评论一下吧？">
        <div class="input-group-append">
            <button v-on:click="handleSend" class="btn btn-outline-primary" type="button"><i class="fas fa-paper-plane"></i>  发送</button>
        </div>
    </div>
    <span class="about-vue">此模块由 <a href="https://cn.vuejs.org" target="_blank">Vue.js</a> 驱动渲染</span>
</div>
`
    }
);

new Vue({el: '#comments'});
