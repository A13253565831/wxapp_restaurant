const app = getApp();
const requestUtil = require('../../../utils/requestUtil');
const _DuoguanData = require('../../../utils/data');
Page({
    data: {
        quan_list: {},
        share_is_show:false,
        this_dish_id:0
    },
    onLoad: function (options) {
        var that = this;
        var dish_id = options.dish_id;
        that.setData({ this_dish_id: dish_id });
        requestUtil.get(_DuoguanData.duoguan_host_api_url + '/index.php?s=/addon/DuoguanDish/Api/quanLingQu.html', { dish_id: dish_id }, (info) => {
            that.setData({ quan_list:info});
        }, this, {});
    },
    go_dish_order_bind: function () {
        var that = this;
        wx.reLaunch({
            url: '/pages/restaurant/restaurant-home-info/index?dish_id='+that.data.this_dish_id
        });
    },
    go_share_bind:function(){
        var that = this;
        that.setData({
            share_is_show: true
        });
        setTimeout(function () {
            that.hide_share_bind();
        }
        , 1000)
    },
    hide_share_bind: function () {
        var that = this;
        that.setData({
            share_is_show: false
        })
    },
    onShareAppMessage: function () {
        var that = this;
        return {
            title: '领取代金券',
            desc: '送你' + that.data.quan_list.all_quan_count + '元代金券礼包，快去看看吧',
            path: 'pages/restaurant/restaurant-juan/index?dish_id=' + that.data.this_dish_id
        }
    },
})