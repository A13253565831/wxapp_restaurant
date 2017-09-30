const app = getApp();
const requestUtil = require('../../../utils/requestUtil');
const _DuoguanData = require('../../../utils/data');
Page({
    data: {
        order_sn:'',
        order_info:[]
    },
    go_dish_home: function () {
        wx.reLaunch({
            url: '../restaurant-home-info/index?dish_id='+this.data.order_info.dish_id
        });
    },
    onLoad: function (options) {
        var that = this;
        var order_sn = options.oid;
        that.setData({ order_sn: order_sn });
    },
    onShow: function () {
        var that = this;
        requestUtil.get(_DuoguanData.duoguan_host_api_url + '/index.php?s=/addon/DuoguanDish/ApiPay/getPayInfo.html', { order_sn: that.data.order_sn }, (info) => {
            console.log(info);
            that.setData({ order_info:info});
        }, that, {});
    }
})