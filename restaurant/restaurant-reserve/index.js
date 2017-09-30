const app = getApp();
const requestUtil = require('../../../utils/requestUtil');
const _DuoguanData = require('../../../utils/data');
Page({
    data: {
        this_dish_id:0,
        this_dish_info:{},
        date_time:'',
        time_time:'',
        submitIsLoading: false,
        buttonIsDisabled: false,
    },
    bindDateChange:function(e){
        this.setData({ date_time: e.detail.value});
    },
    bindTimeChange: function (e) {
        this.setData({ time_time: e.detail.value });
    },
    onLoad: function (options) {
        var that = this;
        var dish_id = options.dish_id;
        that.setData({ this_dish_id: dish_id});
    },
    onShow:function(){
        var that = this;
        var myDate = new Date();
        var year = myDate.getFullYear();
        var month = myDate.getMonth() + 1;
        var day = myDate.getDate();
        var hour = myDate.getHours() + 2;
        var minute = 30;
        that.setData({ date_time: year + "-" + month + "-" + day, time_time: hour + ":" + minute });
        requestUtil.get(_DuoguanData.duoguan_host_api_url + '/index.php?s=/addon/DuoguanDish/Api/getDishOneInfo', { dish_id: that.data.this_dish_id }, (info) => {
            that.setData({ this_dish_info: info });
        }, that, {});

    },
    formSubmit:function(e){
        var that = this;
        //是否需要手机验证
        if (that.data.this_dish_info.dish_is_sms_check == 1) {
            //读取用户手机号是否已验证
            requestUtil.get(_DuoguanData.duoguan_host_api_url + '/index.php?s=/addon/DuoguanUser/Api/getUserInfo.html', {}, (userinfodata) => {
                if (userinfodata.u_phone_status == 0) {
                    //跳转到手机认证
                    wx.navigateTo({
                        url: '../phone-binding/index'
                    });
                }else{
                    that.sendDingAction(e);
                }
            }, that, {});
        }else{
            that.sendDingAction(e);
        }
        
    },
    sendDingAction:function(e){
        var that = this;
        that.setData({ submitIsLoading: true, buttonIsDisabled: true });
        var rdata = e.detail.value;
        rdata.dish_id = that.data.this_dish_id;
        requestUtil.get(_DuoguanData.duoguan_host_api_url + '/index.php?s=/addon/DuoguanDish/Api/dingAdd', rdata, (info) => {
            wx.showModal({
                title: '提示',
                content: "预订成功，请等待客服与您联系",
                showCancel: false,
                success: function (res) {
                    if (res.confirm == true) {
                        wx.navigateBack(1);
                    }
                }
            });
        }, this, { isShowLoading: false, completeAfter: function () { that.setData({ submitIsLoading: false, buttonIsDisabled: false }); } });
    }
})