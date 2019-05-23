Vue.component('wycode-clipboard',
    {
        props: {
            qrImage: String
        },
        data: function () {
            return {
                isShowResult: false,
                queryNumber: '',
                remarks: '',
                content: ''
            }
        },
        methods: {
            handleQuery: function () {
                if (this.queryNumber.length < 4) {
                    alert('查询码不正确！');
                    return
                }
                $.get('https://wycode.cn/web/api/public/clipboard/queryById', {id: this.queryNumber}, (response) => {
                    console.log(response);
                    if (response && response.data) {
                        this.isShowResult = true;
                        this.content = response.data.content;
                        this.remarks = response.data.tips;
                    } else {
                        alert('查询码不正确！');
                    }
                });
            },

            handleSave: function () {
                var fd = new FormData();
                fd.append('id', this.queryNumber);
                fd.append('content', this.content);
                fd.append('tips', this.remarks);

                $.ajax({
                    url: 'https://wycode.cn/web/api/public/clipboard/saveById',
                    type: 'POST',
                    data: fd,
                    contentType: false,
                    processData: false,
                    success: (response) => {
                        console.log(response);
                        this.isShowResult = false;
                    },
                    error: function (error) {
                        console.log(error);
                    }
                });
            },

            handleBack: function () {
                this.isShowResult = false;
            }
        },
        template: `
<div>
    <div v-if="!isShowResult" class="widget-wrap col-md-12" >
        <div class="alert alert-success" role="alert" style="text-align:center;">跨平台剪切板2.0已上线，获取新版查询码请扫描下方小程序码，查看属于自己的剪切板！</div>
        <img class="clipboard-qrcode" v-bind:src="qrImage" alt="小程序码"/>
    </div>
    <div class="widget-wrap col-md-12">
        <input placeholder="查询码"
               type="text"
               class="input-query-number form-control form-group"
               maxlength=6
               v-model="queryNumber"
               v-bind:disabled="isShowResult"/>
        <button v-if="!isShowResult"
                v-on:click="handleQuery"
                class="btn-new btn btn-primary form-control form-group">查询</button>
        <div v-else>
            <textarea v-model="content"
                    style="min-height: 280px;"
                    maxlength=2000
                    class="textarea-text form-control form-group"></textarea>
            <input placeholder="备注"
                    type="text"
                    maxlength=10
                    class="input-query-number form-control form-group"
                    v-model="remarks"/>
            <button v-on:click="handleSave"
                    class="btn-save btn btn-success form-control  form-group">保存</button>
            <button v-on:click="handleBack"
                    class="btn-save btn btn-primary form-control  form-group">返回</button>
        </div>
        <span class="clipboard-vue">此模块由 <a href="https://cn.vuejs.org" target="_blank">Vue.js</a> 驱动渲染</span>
    </div>
</div>
`
    }
);

var clipboard = new Vue({el: '#clipboard'});
