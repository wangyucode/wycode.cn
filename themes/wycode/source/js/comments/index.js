Vue.component('wycode-comments',
    {
        props: {
            path: String
        },
        data: function () {
            return {
                hasLogin: false,
                anonymous:false,
                show: false,
                comments: [],
                githubAuthorizeUrl: "https://github.com/login/oauth/authorize?scope=read:user&client_id=ac839e7de6bee6fa3776&redirect_uri=" + location.origin + location.pathname,
                avatarUrl: "",
                username:"",
                //loading:false
            }
        },
        methods: {
            handleSend: function () {

            },
            handleAnonymous:function () {
                this.anonymous = true;
            }
        },
        mounted: function () {
            var queryData = {
                accessKey: "114c03ec4d6f40a4a1490a5638d8141d",
                appName: "wycode",
                topicId: this.path,
            };
            var vue = this;
            $.get('https://wycode.cn/web/api/public/comment/getComments', queryData, function(response){
                console.log('getComments->', response);
                if (response && response.success) {
                    vue.show = true;
                } else {
                    console.error(response.error)
                }
            });

            var queryObj = {};
            var pairs = window.location.search.substring(1).split("&");
            for (i in pairs) {
                if (pairs[i] === "") continue;
                pair = pairs[i].split("=");
                queryObj[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
            }
            if (queryObj['code']) {
                $.get('https://wycode.cn/web/api/public/comment/githubToken', {code: queryObj['code']}, function(response) {
                    console.log('githubToken->', response);
                    if (response && response.success && response.data.access_token) {
                        $.ajax({
                            url: "https://api.github.com/user",
                            headers: {
                                Accept: "application/json; charset=utf-8",
                                Authorization: "token " + response.data.access_token
                            },
                            type: "GET",
                            success: function(data) {
                                console.log("user-->",data);
                                vue.hasLogin = true;
                                vue.avatarUrl = data.avatar_url;
                                vue.username = data.name
                            }
                        });
                    } else {
                        console.error(response.error + ',' + response.data.error_description);
                    }
                });
            }
            //var userId = localStorage.getItem("userId")
        },
        template: `
<div v-if="show" class="widget-wrap">
    <div class="comments-list">
        <div class="comment" v-for="comment in comments"></div>
    </div>
    <div v-if="!hasLogin && !anonymous" class="comments-login">
        <a class="btn btn-success" role="button" v-bind:href="githubAuthorizeUrl"><i class="fab fa-github" style="color: white"></i>  Github登录</a>
        <button class="btn btn-outline-secondary" type="button" v-on:click="handleAnonymous">匿名评论</button>
    </div>
    <div v-else="hasLogin||anonymous" class="comments-input input-group">
        <img v-if="avatarUrl" v-bind:src="avatarUrl" width="48px" height="48px" style=""/>
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
