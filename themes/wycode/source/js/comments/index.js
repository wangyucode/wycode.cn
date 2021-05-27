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
                avatarUrl: "https://wycode.cn/upload/image/account.png",
                username: "匿名用户",
                userId: -1,
                logging: false,
                errorMsg: '',
                successMsg: '',
                content: '',
                replyingIndex: -1,
                replyContent: '',
                likeCommentIndexes: [],
                key: "114c03ec4d6f40a4a1490a5638d8141d",
                app: "wycode"
            }
        },
        methods: {
            handleSend: function () {
                if (this.content) {
                    this.logging = true;
                    var fd = new FormData();
                    fd.append('accessKey', this.key);
                    fd.append("appName", this.app);
                    fd.append('topicId', this.path);
                    fd.append('fromUserId', this.userId);
                    fd.append('content', this.content);
                    fd.append('fromUserIcon', this.avatarUrl);
                    fd.append('fromUserName', this.username);

                    fetch('https://wycode.cn/web/api/public/comment/newComment', { method: 'POST', body: fd })
                        .then(res => res.json())
                        .then(res => {
                            console.log('newComment->', res);
                            this.logging = false;
                            if (res && res.success) {
                                this.content = '';
                                this.anonymous = false;
                                this.comments.push(res.data);
                                this.successMsg = '发布成功';
                            } else {
                                this.errorMsg = '发布失败：' + res.error
                            }
                        });
                } else {
                    this.errorMsg ='内容不能为空';
                }
            },
            handleAnonymous: function () {
                this.anonymous = true;
                this.errorMsg = '';
                this.successMsg = '';
            },
            handleReply: function (e) {
                if (this.hasLogin) {
                    this.replyContent = '';
                    this.replyingIndex = Number(e.currentTarget.dataset.index);
                } else {
                    this.errorMsg ="请先登录";
                }
            },
            handleReplySend: function () {
                var vue = this;
                if (this.replyContent) {
                    var fd = new FormData();
                    var toComment = this.comments[this.replyingIndex];
                    fd.append('accessKey', this.key);
                    fd.append("appName", this.app);
                    fd.append('topicId', this.path);
                    fd.append('fromUserId', this.userId);
                    fd.append('content', this.replyContent);
                    fd.append('fromUserIcon', this.avatarUrl);
                    fd.append('fromUserName', this.username);
                    fd.append('toCommentId', toComment.id);
                    this.replyContent = '';
                    this.replyingIndex = -1;
                    fetch('https://wycode.cn/web/api/public/comment/newComment', { method: 'POST', body: fd })
                        .then(res => res.json())
                        .then(res => {
                            console.log('newReply->', res);
                            if (res && res.success) {
                                this.comments.push(res.data);
                            }
                        });
                } else {
                    this.errorMsg ='内容不能为空';
                }
            },

            handleLike: function (e) {
                if (this.likeCommentIndexes[e.currentTarget.dataset.index]) {
                    return;
                }

                Vue.set(this.likeCommentIndexes, e.currentTarget.dataset.index, 'bi-hand-thumbs-up-fill');

                var toComment = this.comments[e.currentTarget.dataset.index];
                if (localStorage.getItem(toComment.id)) {
                    return;
                }

                toComment.likeCount++;
                Vue.set(this.comments, e.currentTarget.dataset.index, toComment);
                var fd = new FormData();
                fd.append('accessKey', this.key);
                fd.append("appName", this.app);
                fd.append('topicId', this.path);
                fd.append('fromUserId', this.userId);
                fd.append('toCommentId', toComment.id);
                fd.append('type', 1);
                fetch('https://wycode.cn/web/api/public/comment/newComment', { method: 'POST', body: fd })
                    .then(res => res.json())
                    .then(res => {
                        console.log('like->', res);
                        if (res && res.success) {
                            localStorage.setItem(toComment.id, true);
                        }
                    });
            }
        },
        mounted: function () {
            var queryData = new URLSearchParams();
            queryData.append('accessKey', this.key);
            queryData.append('appName', this.app);
            queryData.append('topicId', this.path);

            fetch('https://wycode.cn/web/api/public/comment/getComments?appName=' + this.app + '&accessKey=' + this.key + '&topicId=' + this.path)
                .then(res => res.json())
                .then(res => {
                    console.log('getComments->', res);
                    if (res && res.success) {
                        this.show = true;
                        this.comments = res.data;
                    } else {
                        console.error(res.error)
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
                $.get('https://wycode.cn/web/api/public/comment/githubToken', { code: queryObj['code'] }, function (response) {
                    //console.log('githubToken->', response);
                    if (response && response.success && response.data.access_token) {
                        $.ajax({
                            url: "https://api.github.com/user",
                            headers: {
                                Accept: "application/json; charset=utf-8",
                                Authorization: "token " + response.data.access_token
                            },
                            type: "GET",
                            success: function (data) {
                                //console.log("user-->", data);
                                vue.hasLogin = true;
                                vue.avatarUrl = data.avatar_url;
                                vue.username = data.name;
                                vue.userId = data.id;
                                vue.logging = false;

                                localStorage.setItem("userId", data.id);
                                localStorage.setItem("username", data.name);
                                localStorage.setItem("avatarUrl", data.avatar_url);

                                var fd = new FormData();
                                fd.append('accessKey', this.key);
                                fd.append("appName", this.app);
                                fd.append("company", "github");
                                fd.append("id", "github_" + data.id);
                                fd.append("userJson", JSON.stringify(data));
                                $.ajax({
                                    url: 'https://wycode.cn/web/api/public/comment/postUserInfo',
                                    type: 'POST',
                                    data: fd,
                                    contentType: false,
                                    processData: false,
                                    success: function (response) {
                                        //console.log('postUserInfo->', response);
                                    }
                                });
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
        <div class="comment" v-for="(comment,index) in comments">
            <div class="d-flex flex-row align-items-center">
                <img class="comment-avatar" v-bind:src="comment.fromUserIcon" width="28px" height="28px" alt="用户头像"/>
                <div class="mx-2 flex-column d-inline-block flex-grow-1">
                    <div class="comment-username">{{comment.fromUserName}}</div>
                    <div class="comment-create-time">{{comment.createTime}}</div>
                </div>
                <button class="btn btn-link btn-sm comment-like" type="button" v-bind:data-index="index" v-on:click="handleLike"><i v-bind:class="likeCommentIndexes[index] || 'bi-hand-thumbs-up'" class="bi"></i>  {{comment.likeCount}}</button>
                <button v-if="replyingIndex !== index" class="btn btn-link btn-sm comment-reply" type="button" v-bind:data-index="index" v-on:click="handleReply"><i class="bi bi-reply-fill"></i>  回复</button>
            </div>
            <div v-if="comment.toUserName" class="alert alert-secondary comment-quote" role="alert"><span class="comment-quote-user">@{{comment.toUserName}}</span>  {{comment.toContent}}</div>
            <div class="comment-content">{{comment.content}}</div>
            <div v-if="replyingIndex === index" class="row input-group col comment-reply-input-group">
                <div class="input-group-prepend">
                    <span class="input-group-text comment-reply-to">@{{comment.fromUserName}}</span>
                </div>
                <input type="text" class="form-control comment-reply-input" placeholder="说的不对？" aria-label="评论一下吧？" v-model="replyContent">
                <div class="input-group-append">
                    <button v-on:click="handleReplySend" class="btn btn-outline-primary comment-reply-send" type="button"><i class="fas fa-paper-plane"></i>  发送</button>
                </div>
            </div>
            <hr style="margin-bottom:12px"/>
        </div>
    </div>
    <div v-else class='no-comments'>暂无评论</div>
    <hr/>
    <div class="comments-add">
        <div v-if="!hasLogin && !anonymous" class="comments-login">
            <a class="btn btn-success" role="button" v-bind:href="githubAuthorizeUrl"><i class="bi bi-github"></i>  Github登录</a>
            <button class="btn btn-outline-secondary" type="button" v-on:click="handleAnonymous">匿名评论</button>
        </div>
        <div v-else class="comments-input margin-top">
            <img v-bind:src="avatarUrl" width="24px" height="24px"  style="border-radius: 12px" alt="用户头像"/>
            <span style="font-size: 16px;vertical-align: center">{{username}}</span>
            <div class="input-group" style="margin-top: 8px">
                <input type="text" class="form-control" placeholder="评论一下吧？" aria-label="评论一下吧？" v-model="content">
                <button v-on:click="handleSend" class="btn btn-outline-primary" type="button"><i class="bi bi-pin-angle-fill"></i>  发送</button>
            </div>
        </div>
        <div v-if="logging" class="comments-logging-cover"><i class="fas fa-sync fa-spin fa-lg"></i></div>
        <div v-if="errorMsg" class="alert alert-danger margin-top" role="alert"><i class="bi bi-exclamation-lg"></i>    {{errorMsg}}</div>
        <div v-if="successMsg" class="alert alert-success margin-top" role="alert"><i class="bi bi-check-lg"></i>   {{successMsg}}</div>
    </div>
</div>
`
    }
);

new Vue({ el: '#comments' });
