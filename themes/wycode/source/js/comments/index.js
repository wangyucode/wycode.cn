// var server = "https://wycode.cn";
var server = "http://localhost:8082";

Vue.component('wycode-comments',
    {
        props: {
            path: String
        },
        data: function () {
            return {
                showList: false,
                comments: [],
                username: '',
                loading: true,
                errorMsg: '',
                successMsg: '',
                content: '',
                toComment: null,
                likeCommentIndexes: [],
                key: "114c03ec4d6f40a4a1490a5638d8141d",
                app: "wycode"
            }
        },
        methods: {
            handleSend: function () {
                if (!this.content) {
                    this.errorMsg = '内容不能为空';
                    return;
                }
                if (!/^\S+@\w+(\.[\w]+)+$/.test(this.username)) {
                    this.errorMsg = '请输入正确的Email地址。您的Email不会被公开。';
                    return;
                }
                this.loading = true;
                var comment = {
                    key: this.key,
                    app: this.app,
                    topic: this.path,
                    content: this.content,
                    fromUserName: this.username,
                    to: this.toComment ? {
                        user: this.toComment.user,
                        content: this.toComment.content
                    } : undefined,
                    like: 0,
                    type: 0
                };
                localStorage.setItem('wycode.username', this.username);
                fetch(server + '/node/comments', { method: 'POST', body: JSON.stringify(comment), headers: { 'Content-Type': 'application/json' } })
                    .then(res => res.json())
                    .then(res => {
                        console.log('newComment->', res);
                        this.loading = false;
                        if (res && res.success) {
                            this.content = '';
                            this.toComment = null;
                            comment._id = res.payload;
                            var username = comment.fromUserName.charAt(0);
                            var atIndex = comment.fromUserName.lastIndexOf('@');
                            username += new Array(atIndex).fill('*').join('');
                            username += comment.fromUserName.substring(atIndex);
                            comment.user = username;
                            comment.createTime = "刚刚";
                            this.comments.push(comment);
                            this.successMsg = '发布成功';
                            this.errorMsg = '';
                        } else {
                            this.errorMsg = '发布失败：' + res.message
                        }
                    });
            },

            handleReply: function (e) {
                this.toComment = this.comments[e.currentTarget.dataset.index];
            },

            cancelReply: function () {
                this.toComment = null;
            },

            handleLike: function (e) {
                if (this.likeCommentIndexes[e.currentTarget.dataset.index]) {
                    return;
                }

                Vue.set(this.likeCommentIndexes, e.currentTarget.dataset.index, 'bi-hand-thumbs-up-fill');

                var toComment = this.comments[e.currentTarget.dataset.index];

                toComment.like++;
                Vue.set(this.comments, e.currentTarget.dataset.index, toComment);

                var comment = {
                    key: this.key,
                    app: this.app,
                    topic: this.path,
                    toId: toComment._id,
                    type: 1
                };
                fetch(server + '/node/comments', { method: 'POST', body: JSON.stringify(comment), headers: { 'Content-Type': 'application/json' } })
                    .then(res => res.json())
                    .then(res => {
                        console.log('like->', res);
                    });
            }
        },
        mounted: function () {
            this.username = localStorage.getItem('wycode.username');
            fetch(server + '/node/comments?a=' + this.app + '&k=' + this.key + '&t=' + this.path)
                .then(res => res.json())
                .then(res => {
                    this.loading = false;
                    console.log('getComments->', res);
                    if (res && res.success) {
                        this.showList = true;
                        this.comments = res.payload;
                    } else {
                        console.error(res)
                    }
                });
        },
        template: `
<div v-if="showList" class="widget-wrap">
    <div v-if="comments.length > 0" class="comments-list">
        <div class="comment" v-for="(comment,index) in comments">
            <div class="d-flex flex-row align-items-center">
                <img v-if="comment.fromUserIcon" class="comment-avatar" v-bind:src="comment.fromUserIcon" width="28px" height="28px" alt="用户头像"/>
                <i v-else class="bi bi-person-circle" style="font-size: 24px"></i>
                <div class="mx-2 flex-column d-inline-block flex-grow-1">
                    <div class="comment-username">{{comment.user}}</div>
                    <div class="comment-create-time">{{comment.createTime}}</div>
                </div>
                <button class="btn btn-link btn-sm comment-like" type="button" v-bind:data-index="index" v-on:click="handleLike"><i v-bind:class="likeCommentIndexes[index] || 'bi-hand-thumbs-up'" class="bi"></i>  {{comment.like}}</button>
                <button class="btn btn-link btn-sm comment-reply" type="button" v-bind:data-index="index" v-on:click="handleReply"><i class="bi bi-reply-fill"></i>  回复</button>
            </div>
            <div v-if="comment.to" class="alert alert-primary comment-quote" role="alert"><span class="comment-quote-user">@{{comment.to.user}}</span>  {{comment.to.content}}</div>
            <div class="comment-content">{{comment.content}}</div>
            <hr style="margin-bottom:12px"/>
        </div>
    </div>
    <div v-else class='no-comments'>暂无评论</div>
    <div class="comments-add">
        <div class="comments-input margin-top">
            <div v-if="toComment" class="alert alert-primary comment-quote" role="alert">
                <span class="comment-quote-user">@{{toComment.user}}</span>  {{toComment.content}}
                <button type="button" class="btn-close" v-on:click="cancelReply"></button>
            </div>
            <textarea class="form-control margin-top" placeholder="评论内容..." rows="3" v-model="content"></textarea>
            <div class="input-group margin-top">
                <span class="input-group-text"><i class="bi bi-envelope-fill"> Email:</span>
                <input type="text" class="form-control" placeholder="Email 不会被公开" v-model="username">
                <button v-on:click="handleSend" class="btn btn-outline-primary" type="button" v-bind:disabled="loading">
                    <i class="bi bi-chat-right-quote-fill"></i> 发送 <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                </button>
            </div>
        </div>
        <div v-if="errorMsg" class="alert alert-danger margin-top" role="alert"><i class="bi bi-exclamation-lg"></i> {{errorMsg}}</div>
        <div v-if="successMsg" class="alert alert-success margin-top" role="alert"><i class="bi bi-check-lg"></i> {{successMsg}}</div>
    </div>
</div>
`
    }
);

new Vue({ el: '#comments' });
