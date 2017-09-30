var _function = require('../../../utils/functionData');
var _jsonsort = require('../../../utils/common');
var app = getApp();
Page({
    data: {
        this_options: {},
        this_dish_id: 0,
        this_dish_info: '',
        this_dish_type: '',
        glo_is_load: false
    },
    dish_diancan_bind: function (e) {
        var that = this;
        if (that.data.this_dish_info.dish_is_diannei == 1) {
            if (that.data.this_dish_info.dish_is_rcode_open == 1) {
                wx.scanCode({
                    success: (res) => {
                        if (res.path) {
                            wx.navigateTo({
                                url: '/' + res.path
                            });
                        }
                    }
                });
            }else{
                wx.navigateTo({
                    url: '../restaurant-single/index?dish_id=' + e.currentTarget.id + '&order_type=1'
                });
            }
        } else {
            wx.showModal({
                title: '提示',
                content: "对不起，暂不支持店内点餐",
                showCancel: false
            });
            return;
        }
    },
    go_dish_index_bind:function(){
        wx.switchTab({
            url: '/pages/restaurant/restaurant-home/index'
        })
    },
    //预订
    dish_yuding_bind: function (e) {
        var that = this;
        if (that.data.this_dish_info.dish_is_yuding == 1) {
            wx.navigateTo({
                url: '../restaurant-reserve/index?dish_id=' + e.currentTarget.id
            });
        } else {
            wx.showModal({
                title: '提示',
                content: "对不起，暂不支持预定",
                showCancel: false
            });
            return;
        }
    },
    //排队
    dish_paidui_bind: function (e) {
        var that = this;
        wx.showModal({
            title: '提示',
            content: "对不起，暂不支持排队",
            showCancel: false
        });
        return;

    },
    //外卖
    dish_waimai_bind: function (e) {
        var that = this;
        if (that.data.this_dish_info.dish_is_waimai == 1) {
            wx.navigateTo({
                url: '../restaurant-single/index?dish_id=' + e.currentTarget.id + '&order_type=2'
            });
        } else {
            wx.showModal({
                title: '提示',
                content: "对不起，暂不支持外卖",
                showCancel: false
            });
            return;
        }
    },
    //转账
    zhuanzhang_bind: function (e) {
        wx.navigateTo({
            url: '../pay/index?dish_id=' + e.currentTarget.id
        });
    },
    //导航
    get_location_bind: function () {
        wx.showToast({
            title: '地图加载中',
            icon: 'loading',
            duration: 10000,
            mask: true
        });
        var that = this;
        var loc_lat = that.data.this_dish_info.dish_gps_lat;
        var loc_lng = that.data.this_dish_info.dish_gps_lng;
        wx.openLocation({
            latitude: parseFloat(loc_lat),
            longitude: parseFloat(loc_lng),
            scale: 18,
            name: that.data.this_dish_info.dish_name,
            address: that.data.this_dish_info.dish_address
        });
    },
    //电话
    call_phone_bind:function(){
        var that = this;
        wx.makePhoneCall({
            phoneNumber: that.data.this_dish_info.dish_con_mobile
        });
    },
    onLoad: function (options) {
        var that = this;
        that.setData({
            this_options: options,
            this_dish_id: options.dish_id
        });
    },
    onShow: function () {
        wx.hideToast();
        this.loadSingleDishData();
    },
    loadSingleDishData: function () {
        var that = this;
        _function.dishGetDishOneInfo(that.data.this_dish_id, that.initdishGetDishOneInfoData, that);
    },
    initdishGetDishOneInfoData: function (data) {
        wx.setStorageSync("dish_ischeck_mobile", data.info.dish_is_sms_check||0);
        var that = this;
        console.log(data.info);
        if (data.code == 1) {
            that.setData({
                this_dish_info: data.info,
                glo_is_load: false
            });
            wx.setNavigationBarTitle({
                title: data.info.dish_name
            });
        } else {
            wx.showModal({
                title: '提示',
                content: data.info,
                showCancel: false
            });
            return;
        }
    },
    //图片放大
    img_max_bind: function (e) {
        var that = this;
        wx.previewImage({ current: e.target.dataset.url, urls: that.data.this_dish_info.dish_shijing_arr });
    },
    img_max_bind_zz: function (e) {
        var that = this;
        wx.previewImage({ current: e.target.dataset.url, urls: that.data.this_dish_info.dish_zizhi_arr });
    },
    //下拉刷新
    onPullDownRefresh: function () {
        var that = this;
        _function.dishGetDishConfig(that.initdishGetDishConfigData, that);
        setTimeout(() => {
            wx.stopPullDownRefresh()
        }, 1000);
    },
    onShareAppMessage: function () {
        var that = this;
        var shareTitle = that.data.this_dish_info.dish_name;
        var shareDesc = that.data.this_dish_info.dish_jieshao;
        var sharePath = 'pages/restaurant/restaurant-home-info/index?d_type=single&dish_id=' + that.data.this_dish_id;
        return {
            title: shareTitle,
            desc: shareDesc,
            path: sharePath
        }
    },
})