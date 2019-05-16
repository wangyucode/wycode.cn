var clipboard = new Vue({
    el: '#clipboard',
    data: {
        isShowResult: false,
        queryNumber: '',
        remarks:'',
        content:''
    },
    methods: {
        handleQuery: function () {
            if (this.queryNumber.length < 4) {
                alert('查询码不正确！');
                return
            }
            $.get('https://wycode.cn/web/api/public/clipboard/queryById', { id: this.queryNumber }, (response) => {
                console.log(response);
                if(response && response.data){
                    this.isShowResult = true;
                    this.content = response.data.content,
                    this.remarks = response.data.tips
                }else{
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
                success: (response)=> {  
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
    }
});