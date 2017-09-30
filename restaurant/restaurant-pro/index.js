var _function = require('../../../utils/functionData');
const requestUtil = require('../../../utils/requestUtil');
const _DuoguanData = require('../../../utils/data');
var app = getApp();
Page({
  data:{
    this_dish_id:0,
    this_goods_id:0,
    glo_is_load:true,
    dish_yingye_status_text:'选好了',
    dish_yingye_status_val:1,
    goods_data:[],
    guigeIsShow: false,
    goods_attr_select: {},
    goods_specification: '',
    goods_a_info: {}
  },
  onLoad:function(options){
      var that = this;
      var post_id = options.dish_id;
      that.setData({
        this_dish_id:post_id,
        this_goods_id:options.goods_id
      });
  },
  onShow:function(){
      var that = this;
      that.setData({
        submitIsLoading:false,
      });
      //请求门店详情
      _function.dishGetDishInfo(wx.getStorageSync("utoken"),that.data.this_dish_id,that.initdishGetDishInfoData,that);
  },
  initdishGetDishInfoData:function(data){
    var that = this;
    if(data.code == 1){
        that.setData({
          dish_data:data.info,
          classifySeleted: data.info.dish_cate[0].id,
          dish_yingye_status_val:data.info.dish_info.is_yingye_status
        });
        if(data.info.dish_info.is_yingye_status == 1){
            that.setData({
              dish_yingye_status_text:'选好了',
              dish_button_status:false
            });
        }else{
            that.setData({
              dish_yingye_status_text:'未营业',
              dish_button_status:true
            });
        }
        //请求商品详情
      _function.dishGetGoodsInfo(wx.getStorageSync("utoken"),that.data.this_dish_id,that.data.this_goods_id,that.initgetGoodsInfoData,that);
    }else if(data.code == 2){
        wx.showToast({
            title: '登陆中',
            icon: 'loading',
            duration: 10000,
            success:function(){
                app.getNewToken(function(token){
                    _function.dishGetDishInfo(wx.getStorageSync("utoken"),that.data.this_dish_id,that.initdishGetDishInfoData,that);
                });
            }
        });
    }else if(data.code == 5){
        wx.showModal({
            title: '提示',
            content: data.info,
            showCancel:false
        });
        return;
    }
  },
  initgetGoodsInfoData:function(data){
    var that = this;
    console.log(data.info);
    if(data.code == 1){
        that.setData({
            goods_data:data.info
        });
        wx.setNavigationBarTitle({
          title: data.info.g_name
        })
        //请求购物车信息
      _function.dishGetCartList(wx.getStorageSync("utoken"),that.data.this_dish_id,that.initgetCartListData,that);
    }else{
      wx.showModal({
            title: '提示',
            content: data.info,
            showCancel:false,
            success:function(res){
                wx.navigateBack({
                  delta: 1
                })
            }
        })
    }
  },
  initgetCartListData:function(data){
      var that = this;
      if(data.code == 2){
            wx.showToast({
              title: '登陆中',
              icon: 'loading',
              duration: 10000,
              success:function(){
                  app.getNewToken(function(token){
                      _function.getCartList(wx.getStorageSync("utoken"),that.data.this_dish_id,that.initgetCartListData,that);
                  });
              }
          });
        return false;
      }
      that.setData({
          cart_list:data.info.glist,
          all_g_number:data.info.all_g_number,
          all_g_price:data.info.all_g_price,
          all_g_yunfei:data.info.all_g_yunfei,
          glo_is_load:false
      });
      if(data.info.all_g_number == 0){
        that.setData({
            cart_list_isshow:false
        });
      }
      wx.hideToast();
    },
    //显示隐藏购物车
    cart_list_show_bind:function(){
        var that = this;
        if(that.data.cart_list_isshow == true){
            that.setData({
                cart_list_isshow:false
            });
        }else{
            that.setData({
                cart_list_isshow:true
            });
        }
    },
    //减少数量
    bind_cart_number_jian: function (e) {
        wx.showToast({
            title: '选餐中',
            icon: 'loading',
            duration: 10000
        });
        var cart_id = e.currentTarget.dataset.cid;
        var that = this;
        var this_goods_id = e.currentTarget.id;
        var requestData = {};
        requestData.dish_id = that.data.this_dish_id;
        requestData.gid = this_goods_id;
        requestData.cart_id = cart_id;
        requestData.gnumber = -1;
        requestData.gattr = that.data.goods_attr_select;
        requestUtil.get(_DuoguanData.duoguan_host_api_url + '/index.php?s=/addon/DuoguanDish/Api/addGoodsCart.html', requestData, (info) => {
            that.onShow();
        }, this, {});
    },
    //增加数量
    bind_cart_number_jia: function (e) {
        wx.showToast({
            title: '选餐中',
            icon: 'loading',
            duration: 10000
        });
        var that = this;
        var this_goods_id = e.currentTarget.id;
        var cart_id = e.currentTarget.dataset.cid;
        var requestData = {};
        requestData.dish_id = that.data.this_dish_id;
        requestData.gid = this_goods_id;
        requestData.cart_id = cart_id;
        requestData.gnumber = 1;
        requestData.gattr = that.data.goods_attr_select;
        requestUtil.get(_DuoguanData.duoguan_host_api_url + '/index.php?s=/addon/DuoguanDish/Api/addGoodsCart.html', requestData, (info) => {
            that.onShow();
        }, this, {});
    },
    initeditCartListData:function(data){
        var that = this;
        _function.dishGetDishInfo(wx.getStorageSync("utoken"),that.data.this_dish_id,that.initdishGetDishInfoData,that);
    },
    //清空购物车
    cart_delete_bind:function(){
        var that = this;
        wx.showModal({
            title: '提示',
            content: "确认要清空购物车吗",
            confirmText:"确定",
            cancelText:"取消",
            success:function(res){
                if(res.confirm == true){
                    wx.showToast({
                        title: '加载中',
                        icon: 'loading',
                        duration: 10000
                    });
                    _function.dishDeleteCartList(wx.getStorageSync("utoken"),that.data.this_dish_id,that.initdishDeleteCartListoData,that);
                }else{
                    
                }
            }
        });
    },
    initdishDeleteCartListoData:function(data){
        var that = this;
        this.onShow();
    },
    //选择规格
    guige_select_bind: function (e) {
        var that = this;
        var this_g_goods_id = e.currentTarget.id;
        that.setData({ goods_attr_select: {} });
        //动态获取商品规格
        requestUtil.get(_DuoguanData.duoguan_host_api_url + '/index.php?s=/addon/DuoguanDish/Api/getOneGoodsAttr.html', { goods_id: this_g_goods_id }, (info) => {
            that.setData({
                goods_specification: info.good_attr,
                goods_a_info: info.good_a_info,
                guigeIsShow: true
            });
        }, this, {});
    },
    attr_select_clost_bind: function () {
        this.setData({ guigeIsShow: false, goods_attr_select: {} });
    },
    //属性选择
    select_attr_bind: function (e) {
        var that = this;
        var this_attr_id = e.currentTarget.id;
        var this_attr_name = e.currentTarget.dataset.type;
        var datas = that.data.goods_specification;
        var this_spec_price = 0;
        var a_datas = that.data.goods_attr_select;
        var g_datas = that.data.goods_a_info;
        for (var i = 0; i < datas.length; i++) {
            if (datas[i].name == this_attr_name) {
                a_datas[datas[i].name] = null;
                for (var j = 0; j < datas[i].values.length; j++) {
                    datas[i].values[j].ischeck = false;
                    if (datas[i].values[j].id == this_attr_id) {
                        datas[i].values[j].ischeck = true;
                        a_datas[datas[i].name] = this_attr_id;
                        if (datas[i].values[j].format_price > 0) {
                            g_datas.shop_price = datas[i].values[j].format_price
                        }
                    }
                }
            }
        }
        that.setData({
            goods_specification: datas,
            goods_attr_select: a_datas,
            goods_a_info: g_datas
        })
    },
    //下单
    goods_order_bind:function(){
      var that = this;
      that.setData({
        submitIsLoading:true,
      });
      wx.navigateTo({
        url: '../restaurant-order/index?dish_id='+that.data.this_dish_id
      })
    },
    //下拉刷新
    onPullDownRefresh:function(){
      var that = this;
      that.setData({
        submitIsLoading:false,
      })
      _function.dishGetDishInfo(wx.getStorageSync("utoken"),that.data.this_dish_id,that.initdishGetDishInfoData,that);
      setTimeout(()=>{
        wx.stopPullDownRefresh()
      },1000);
    }
})