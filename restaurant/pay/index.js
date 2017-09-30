const app = getApp();
const requestUtil = require('../../../utils/requestUtil');
const _DuoguanData = require('../../../utils/data');
Page({
    data: {
        this_user_info: {},
        submitIsLoading: false,
        buttonIsDisabled: false,
        this_dish_id:0,
        this_dish_info:[],
        is_beizhu_show:false
    },
    change_beizhu_show:function(){
        this.setData({ is_beizhu_show: this.data.is_beizhu_show?false:true});
    },
    onLoad: function (options) {
        var that = this;
        var dish_id = options.dish_id;
        that.setData({ this_dish_id: dish_id });
    },
    onShow:function(){
        var that = this;
        requestUtil.get(_DuoguanData.duoguan_host_api_url + '/index.php?s=/addon/DuoguanDish/Api/getDishOneInfo.html', { dish_id: that.data.this_dish_id }, (info) => {
            that.setData({ this_dish_info: info, glo_is_load: false });
        }, that, {});
    },
    formSubmit: function (e) {
        var that = this;
        that.setData({ submitIsLoading: true, buttonIsDisabled: true });
        var rdata = e.detail.value;
        rdata.dish_id = that.data.this_dish_id;
        requestUtil.get(_DuoguanData.duoguan_host_api_url + '/index.php?s=/addon/DuoguanDish/ApiPay/payOrder', rdata, (info) => {
            wx.requestPayment({
                'timeStamp': info.timeStamp,
                'nonceStr': info.nonceStr,
                'package': info.package,
                'signType': 'MD5',
                'paySign': info.paySign,
                'success': function (res) {
                    wx.redirectTo({
                        url: '../pay-success/index?oid=' + info.order_sn
                    });
                },
                'fail': function (res) {
                    
                }
            })
        }, this, { isShowLoading: true, completeAfter: function () { that.setData({ submitIsLoading: false, buttonIsDisabled: false }); } });
    }
})