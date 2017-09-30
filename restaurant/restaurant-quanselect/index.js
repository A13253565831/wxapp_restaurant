const app = getApp();
const requestUtil = require('../../../utils/requestUtil');
const _DuoguanData = require('../../../utils/data');
Page({
    data:{
        quan_list:[],
        cart_all_price:0,
        glo_is_load:true,
        this_dish_id: 0,
        this_table_id: 0,
        this_order_type: 1,
    },
    set_quan_bind:function(e){
        var that = this;
        var qid = e.currentTarget.id;
        var qjiner = e.currentTarget.dataset.jiner || 0;
        wx.redirectTo({
            url: '../restaurant-order/index?quan_id=' + qid + '&quan_jiner=' + qjiner + '&dish_id=' + that.data.this_dish_id + '&table_id=' + that.data.this_table_id + '&order_type=' + that.data.this_order_type
        });
    },
    onLoad: function (options){
        var that = this;
        var dish_id = options.dish_id;
        var table_id = options.table_id;
        var order_type = options.order_type;
        that.setData({ this_dish_id: dish_id, this_table_id: table_id, this_order_type: order_type});
        requestUtil.get(_DuoguanData.duoguan_host_api_url + '/index.php?s=/addon/DuoguanDish/Api/getUserQuanList.html', { dish_id: dish_id }, (info) => {
            that.setData({ quan_list: info});
            //请求购物车信息
            that.getCartList();
        }, this, {});
    },
    getCartList:function(){
        var that = this;
        requestUtil.get(_DuoguanData.duoguan_host_api_url + '/index.php?s=/addon/DuoguanDish/Api/getCartList.html', { dish_id: that.data.this_dish_id }, (info) => {
            that.setData({ cart_all_price: info.all_g_price, glo_is_load: false });
        }, this, {});
    }
})