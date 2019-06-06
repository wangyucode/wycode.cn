Vue.component('wycode-comments',
    {
        props: {
            path: String
        },
        data: function () {
            return {
                hasLogin: false,
                anonymous: false,
                show: false,
                comments: [],
                githubAuthorizeUrl: "https://github.com/login/oauth/authorize?scope=read:user&client_id=ac839e7de6bee6fa3776&redirect_uri=" + location.origin + location.pathname,
                avatarUrl: "",
                username: "",
                userId: -1,
                logging: false,
                errorMsg: '',
                successMsg: '',
                content: ''
            }
        },
        methods: {
            handleSend: function () {
                var vue = this;
                if (this.content) {
                    this.logging = true;
                    var fd = new FormData();
                    fd.append('accessKey', "114c03ec4d6f40a4a1490a5638d8141d");
                    fd.append("appName", "wycode");
                    fd.append('topicId', this.path);
                    fd.append('fromUserId', this.userId);
                    fd.append('content', this.content);
                    fd.append('fromUserIcon', this.avatarUrl);
                    fd.append('fromUserName', this.username);

                    $.ajax({
                        url: 'https://wycode.cn/web/api/public/comment/newComment',
                        type: 'POST',
                        data: fd,
                        contentType: false,
                        processData: false,
                        success: function (response) {
                            console.log('newComment->', response);
                            vue.logging = false;
                            if (response && response.success) {
                                vue.content = '';
                                vue.successMsg = '发布成功';
                            } else {
                                vue.errorMsg = '发布失败：' + response.error
                            }
                        }
                    });
                } else {
                    alert('内容不能为空');
                }
            },
            handleAnonymous: function () {
                this.anonymous = true;
                this.errorMsg = '';
                this.successMsg = '';
            }
        },
        mounted: function () {
            var queryData = {
                accessKey: "114c03ec4d6f40a4a1490a5638d8141d",
                appName: "wycode",
                topicId: this.path,
            };
            var vue = this;
            $.get('https://wycode.cn/web/api/public/comment/getComments', queryData, function (response) {
                console.log('getComments->', response);
                if (response && response.success) {
                    vue.show = true;
                    vue.comments = response.data;
                } else {
                    console.error(response.error)
                }
            });
            var userId = localStorage.getItem("userId");
            var username = localStorage.getItem("username");
            var avatarUrl = localStorage.getItem("avatarUrl");
            if (userId) {
                vue.avatarUrl = avatarUrl;
                vue.username = username;
                vue.userId = userId;
                vue.hasLogin = true;
                return;
            }

            var queryObj = {};
            var pairs = window.location.search.substring(1).split("&");
            for (i in pairs) {
                if (pairs[i] === "") continue;
                pair = pairs[i].split("=");
                queryObj[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
            }
            if (queryObj['code']) {
                this.logging = true;
                $.get('https://wycode.cn/web/api/public/comment/githubToken', {code: queryObj['code']}, function (response) {
                    console.log('githubToken->', response);
                    if (response && response.success && response.data.access_token) {
                        $.ajax({
                            url: "https://api.github.com/user",
                            headers: {
                                Accept: "application/json; charset=utf-8",
                                Authorization: "token " + response.data.access_token
                            },
                            type: "GET",
                            success: function (data) {
                                console.log("user-->", data);
                                vue.hasLogin = true;
                                vue.avatarUrl = data.avatar_url;
                                vue.username = data.name;
                                vue.userId = data.id;
                                vue.logging = false;

                                localStorage.setItem("userId", data.id);
                                localStorage.setItem("username", data.name);
                                localStorage.setItem("avatarUrl", data.avatar_url);
                            },
                            complete: function () {
                                history.replaceState({}, document.title, location.pathname);
                            }
                        });
                    } else {
                        vue.logging = false;
                        vue.errorMsg = '登录失败：' + response.data.error_description;
                    }

                });
            }

        },
        template: `
<div v-if="show" class="widget-wrap">
    <div v-if="comments.length > 0" class="comments-list">
        <div class="comment container" v-for="(comment,index) in comments">
            <div class="comment-head row">
                <img class="comment-avatar" v-bind:src="comment.fromUserIcon" width="36px" height="36px" alt="用户头像"/>
                <div class="comment-info col">
                    <div class="comment-username">{{comment.fromUserName}}</div>
                    <div class="comment-create-time">{{comment.createTime}}</div>
                </div>
                <button class="btn btn-outline-primary btn-sm comment-reply" type="button" v-bind:data-index="index">回复</button>
            </div>
            <div class="comment-content row">{{comment.content}}</div>
            <hr style="margin:0 0 8px 0"/>
        </div>
    </div>
    <div v-else class='no-comments'>暂无评论</div>
    <hr/>
    <div class="comments-add">
        <div v-if="!hasLogin && !anonymous" class="comments-login">
            <a class="btn btn-success" role="button" v-bind:href="githubAuthorizeUrl"><i class="fab fa-github" style="color: white"></i>  Github登录</a>
            <button class="btn btn-outline-secondary" type="button" v-on:click="handleAnonymous">匿名评论</button>
        </div>
        <div v-else="hasLogin||anonymous" class="comments-input margin-top">
            <img v-if="avatarUrl" v-bind:src="avatarUrl" width="24px" height="24px"  style="border-radius: 12px" alt="用户头像"/>
            <span style="font-size: 16px;vertical-align: center">{{username}}</span>
            <div class="input-group" style="margin-top: 8px">
                <input type="text" class="form-control" placeholder="评论一下吧？" aria-label="评论一下吧？" v-model="content">
                <div class="input-group-append">
                    <button v-on:click="handleSend" class="btn btn-outline-primary" type="button"><i class="fas fa-paper-plane"></i>  发送</button>
                </div>
            </div>
        </div>
        <div v-if="logging" class="comments-logging-cover"><i class="fas fa-sync fa-spin fa-lg"></i></div>
        <div v-if="errorMsg" class="alert alert-danger margin-top" role="alert">{{errorMsg}}</div>
        <div v-if="successMsg" class="alert alert-success margin-top" role="alert">{{successMsg}}</div>
    </div>
    <span class="about-vue">此模块由 <a href="https://cn.vuejs.org" target="_blank">Vue.js</a> 驱动渲染</span>
</div>
`
    }
);

new Vue({el: '#comments'});
