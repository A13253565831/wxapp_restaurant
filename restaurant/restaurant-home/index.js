const app = getApp();
const requestUtil = require('../../../utils/requestUtil');
const _DuoguanData = require('../../../utils/data');
var con = require("../../../utils/api.js");
const QQMapWX = require('../../../utils/qqmap-wx-jssdk.min.js');// 引入SDK核心类
const qqmapsdk = new QQMapWX({ key: '7DWBZ-XEW6R-HGGWQ-WZYXJ-FZUAV-MBBDY' });// 实例化API核心类
var oldUrl = require("../../../utils/data02.js");


Page({
    data: {
        this_options: {},
        this_dish_id: 0,
        this_dish_info: '',
        this_dish_type: '',
        this_latitude_data: 0,
        this_longitude_data: 0,
        this_search_key: '',
        glo_is_load: false,
        this_page_size: 1,
        this_page_num: 10,
        dish_sort_type: 1,
        dish_list_data: [],
        is_loadmore: true,
    },
    //扫码
    shop_saoma_bind: function () {
        wx.scanCode({
            success: (res) => {
                if (res.path) {
                    wx.navigateTo({
                        url: '/' + res.path
                    });
                }
            }
        })
    },
    dish_info_bind: function (e) {
        var that = this;
        wx.navigateTo({
            url: '../restaurant-home-info/index?dish_id=' + e.currentTarget.id
        });
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
            } else {
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
    //入驻
    shop_ruzhu_bind: function () {
        wx.navigateTo({
            url: '../restaurant-ruzhu/index'
        });
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
    call_phone_bind: function () {
        var that = this;
        wx.makePhoneCall({
            phoneNumber: that.data.this_dish_info.dish_con_mobile
        });
    },
    onLoad: function (options) {
        var that = this;
        that.setData({
            this_options: options
        });
        //判断门店类型　单门店直接跳转　多门店显示首页
         requestUtil.get(_DuoguanData.duoguan_host_api_url + '/index.php?s=/addon/DuoguanDish/Api/getDishConfig.html', {}, (info) => {
           console.log(info);
            var data_options = that.data.this_options;
            if (data_options.hasOwnProperty("d_type") ==false){
                if (info.dish_type == 1) {
                    that.setData({
                        this_dish_type: 'single',
                        this_dish_id: info.dish_id
                    });
                    that.loadSingleDishData();
                } else if (info.dish_type == 2) {
                    that.setData({
                        this_dish_type: 'much'
                    });
                    that.loadMuchDishData();
                }
            }else{
                var d_type = data_options.type;
                if (d_type == 'single') {
                    if (data_options.dish_id != undefined && data_options.dish_id > 0) {
                        that.setData({
                            this_dish_type: 'single',
                            this_dish_id: data_options.dish_id
                        });
                        that.loadSingleDishData();
                    } else {
                        that.setData({
                            this_dish_type: 'much'
                        });
                        that.loadMuchDishData();
                    }
                } else if (d_type == 'much') {
                    that.setData({
                        this_dish_type: 'much'
                    });
                    that.loadMuchDishData();
                } else {
                    that.setData({
                        this_dish_type: 'much'
                    });
                    that.loadMuchDishData();
                } 
            }
         }, this, { isShowLoading: false });
    },
    onShow: function () {
        wx.hideToast();
        

    },
    loadSingleDishData: function () {
        var that = this;
        requestUtil.get(_DuoguanData.duoguan_host_api_url + '/index.php?s=/addon/DuoguanDish/Api/getDishOneInfo.html', { dish_id: that.data.this_dish_id }, (info) => {
            that.setData({ this_dish_info: info, glo_is_load: false });
            wx.setNavigationBarTitle({
                title: info.dish_name
            });
            requestUtil.get(con.getshareconfig, { wxappid: con.wxappid }, (info) => {
              console.log(info);
                this.setData({ shareInfo: info });
            });
        }, that, { isShowLoading: false });
    },
    loadMuchDishData: function () {
        var that = this;
        if (that.data.this_dish_type != 'much') {
            return false;
        }
        var latitude = 0;
        var longitude = 0;
        //获取位置信息
        wx.getLocation({
            type: 'gcj02',
            success: function (res) {
                latitude = res.latitude;
                longitude = res.longitude;
                that.setData({ this_latitude_data: latitude, this_longitude_data: longitude });
           
                qqmapsdk.reverseGeocoder({
                    location: {
                        latitude: res.latitude,
                        longitude: res.longitude
                    },
                    success: (res) => {
                        console.log(res.result.address_component.street_number);
                    }
                });
                
            },
            complete: function () {
                that.loadIndexMuchData(latitude, longitude);
            }
        });
    },
    loadIndexMuchData: function () {
        var that = this;
        var requestData = {};
        requestData.pagesize = 1;
        requestData.pagenum = that.data.this_page_num;
        requestData.ws_lat = that.data.this_latitude_data;
        requestData.ws_lng = that.data.this_longitude_data;;
        requestData.sort_type = that.data.dish_sort_type;
        requestData.keywords = that.data.this_search_key;
        requestUtil.get(_DuoguanData.duoguan_host_api_url + '/index.php?s=/addon/DuoguanDish/Api/getDishList.html', requestData,  (info) => {
          // console.log(111111);
          console.log(info);
            if (info.index_dish_list == null) {
                that.setData({ is_loadmore: false });
            } else {
                if (info.index_dish_list.length < that.data.this_page_num) {
                    that.setData({ is_loadmore: false });
                }
            }
            that.setData({ dish_list_data: info, glo_is_load: false });
            
            requestUtil.get(oldUrl.hospital_getslide, { wxappid: oldUrl.wyy_user_wxappid}, (info)=>{
              console.log(info);
              that.setData({  
                info: info
              })
            })
            wx.hideToast();
            requestUtil.get(_DuoguanData.duoguan_get_share_data_url, { mmodule: 'duoguan_dish' }, (info) => {
                this.setData({ shareInfo: info });
            });
        }, that, { isShowLoading: false });
    },
    swiper_top_bind: function (e) {
        var that = this;
        wx.navigateTo({
            url: e.currentTarget.dataset.url
        });
    },
    dish_search_bind: function (e) {
        var s_key = e.detail.value;
        this.setData({ this_search_key: s_key });
        wx.showToast({
            title: '加载中',
            icon: 'loading',
            duration: 10000
        });
        this.loadMuchDishData();
    },
    //排序
    datasort_bind: function (e) {
        var that = this;
        var this_target = e.currentTarget.id;
        wx.showToast({
            title: '加载中',
            icon: 'loading',
            duration: 10000
        });
        that.setData({
            dish_sort_type: this_target,
            is_loadmore: true,
            this_page_size: 1
        });
        that.loadIndexMuchData();
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
        that.onLoad();
        setTimeout(() => {
            wx.stopPullDownRefresh()
        }, 1000);
    },
    onReachBottom: function (e) {
        var that = this;
        wx.showNavigationBarLoading();
        if (that.data.is_loadmore == false) {
            wx.hideNavigationBarLoading();
            return false;
        }
        var requestData = {};
        requestData.pagesize = that.data.this_page_size + 1;
        requestData.pagenum = that.data.this_page_num;
        requestData.ws_lat = that.data.this_latitude_data;
        requestData.ws_lng = that.data.this_longitude_data;
        requestData.sort_type = that.data.dish_sort_type;
        requestData.keywords = that.data.this_search_key;
        requestUtil.get(_DuoguanData.duoguan_host_api_url + '/index.php?s=/addon/DuoguanDish/Api/getDishList.html', requestData, (info) => {
          console.log(info);
            wx.hideNavigationBarLoading();
            if (info.index_dish_list == null) {
                that.setData({ is_loadmore: false });
            } else {
                if (info.index_dish_list.length < that.data.this_page_num) {
                    that.setData({ is_loadmore: false });
                }
                var this_new_dish_data = that.data.dish_list_data;
                this_new_dish_data.index_dish_list = this_new_dish_data.index_dish_list.concat(info.index_dish_list);
                that.setData({ dish_list_data: this_new_dish_data, this_page_size: requestData.pagesize, glo_is_load: false });
            }

        }, this, { isShowLoading: false });
    },
    onShareAppMessage: function () {
        var that = this;
        var shareTitle = '智慧餐厅';
        var shareDesc = '小程序智慧餐厅,扫一扫即可点餐,无需服务员的参与，自动出单';
        var sharePath = 'pages/restaurant/restaurant-home/index';
        if (that.data.this_dish_type == 'single') {
            shareTitle = that.data.this_dish_info.dish_name;
            shareDesc = that.data.this_dish_info.dish_jieshao;
            sharePath = 'pages/restaurant/restaurant-home/index?d_type=single&dish_id=' + that.data.this_dish_id;
        }else{
            shareTitle = that.data.shareInfo.title;
            shareDesc = that.data.shareInfo.desc;
            sharePath = 'pages/restaurant/restaurant-home/index';
        }
        return {
            title: shareTitle,
            desc: shareDesc,
            path: sharePath
        }
    },
})