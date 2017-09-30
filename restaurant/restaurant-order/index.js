var _function = require('../../../utils/functionData');
const requestUtil = require('../../../utils/requestUtil');
const _DuoguanData = require('../../../utils/data');
var app = getApp();
Page({
    data:{
        dish_data:[],
        data_list:[],
        this_dish_id:0,
        this_table_id:0,
        this_table_name:'',
        this_table_list:null,
        is_show_table_select:false,
        is_show_table_layer:false,
        is_show_quan_layer:false,
        this_order_type:1,
        all_g_number:0,
        all_g_price:0,
        all_g_yunfei:0,
        all_g_dabao_price:0,
        is_show_address:false,
        address_list:null,
        this_address_id:0,
        this_address_info:'请选择',
        btn_submit_disabled:false,
        submitIsLoading:false,
        glo_is_load:true,
        select_pay_type:false,
        this_quan_id:0,
        this_quan_info:'请选择',
        this_quan_jiner:0,
        wx_address_info:'',
        quan_list:null,
        this_beizhu_info:''
    },
    go_select_dai_bind: function () {
        var that = this;
        //加载用户优惠券
        requestUtil.get(_DuoguanData.duoguan_host_api_url + '/index.php?s=/addon/DuoguanDish/Api/getUserQuanList.html', { dish_id: that.data.this_dish_id }, (info) => {
            that.setData({ quan_list: info });
        }, that, { completeAfter:function(){
                that.setData({ is_show_quan_layer: that.data.is_show_quan_layer ? false : true });
        }});
        
    },
    go_select_dai__hide_bind:function(){
        var that = this;
        that.setData({ is_show_quan_layer: that.data.is_show_quan_layer ? false : true });
    },
    //选择桌号
    selectTable_bind:function(e){
        this.setData({ this_table_id: e.detail.value});
        this.getTableInfo();
        this.show_table_layout_bind();
    },
    show_table_layout_bind:function(){
        this.setData({ is_show_table_layer: this.data.is_show_table_layer?false:true});
    },
    //选择代金券
    quan_select_one_bind:function(e){
        var that = this;
        that.setData({
            this_quan_id: e.currentTarget.dataset.id,
            this_quan_info: '代金券 -' + e.currentTarget.dataset.jiner + '元',
            this_quan_jiner: e.currentTarget.dataset.jiner
        });
        that.setData({ is_show_quan_layer: that.data.is_show_quan_layer ? false : true });
    },
    //选择备注
    select_beizhu_bind:function(e){
        var beizhu_info = this.data.this_beizhu_info;
        beizhu_info = beizhu_info + e.currentTarget.dataset.info+ ' ';
        this.setData({ this_beizhu_info: beizhu_info});
    },
    onLoad:function(options){
      var that = this;
      var post_id = options.dish_id;
      var table_id = options.table_id;
      var order_type = options.order_type;
      var quan_id = options.quan_id || 0;
      var quan_jiner = options.quan_jiner || 0;
      var quan_info = '';
      if (quan_jiner == 0){
          quan_info = '请选择';
      }else{
          quan_info = '-'+quan_jiner + '元优惠券';
      }
      that.setData({
        this_dish_id:post_id,
        this_table_id:table_id,
        this_order_type: order_type,
        this_quan_id: quan_id,
        this_quan_jiner: quan_jiner,
        this_quan_info: quan_info
      });
    },
    onShow:function(){
        var that = this;
      //请求门店详情
      _function.dishGetDishInfo(wx.getStorageSync("utoken"),that.data.this_dish_id,that.initdishGetDishInfoData,that);
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
          data_list:data.info,
          all_g_number:data.info.all_g_number,
          all_g_price:data.info.all_g_price,
          all_g_yunfei:data.info.all_g_yunfei,
          all_g_dabao_price: data.info.all_g_dabao_price,
          glo_is_load:false
      });
      if (that.data.this_order_type == 1) {
          that.setData({ all_g_dabao_price:0});
      }
      that.getTableInfo();
      wx.hideToast();
    },

    getTableInfo:function(){
        //获取桌号名称
        var that = this;
        var rq_data = {};
        rq_data.dish_id = that.data.this_dish_id;
        rq_data.table_id = that.data.this_table_id;
        requestUtil.get(_DuoguanData.duoguan_host_api_url + '/index.php?s=/addon/DuoguanDish/Api/getDishTableInfo.html', rq_data, (info) => {
            that.setData({ this_table_id: info.table_id, this_table_name: info.table_name });
            wx.hideToast();
        }, this, { isShowLoading: false});
    },

    initdishGetDishInfoData:function(data){
    var that = this;
    if(data.code == 1){
        if (that.data.this_order_type == 2){
            data.info.dish_info.waimai_peisong_jiner = parseInt(data.info.dish_info.waimai_peisong_jiner);
        }else{
            data.info.dish_info.waimai_peisong_jiner = parseInt(0);
        }
        that.setData({
          dish_data:data.info,
          dish_yingye_status_val:data.info.dish_info.is_yingye_status,
          this_table_list: data.info.dish_table_list
        });
        //请求购物车信息
      _function.dishGetCartList(wx.getStorageSync("utoken"),that.data.this_dish_id,that.initgetCartListData,that);
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
  go_select_paytype_bind:function(){
    var that = this;
    if(that.data.select_pay_type  == true){
        that.setData({select_pay_type:false});
    }else{
        that.setData({select_pay_type:true});
    }
  },
  //选择收货地址
  select_address_bind: function () {
      var that = this;
      if (!wx.chooseAddress) {
          wx.showModal({
              title: '提示',
              content: "您当前微信版本不支持该功能，请先进行升级",
          })
      }
      wx.chooseAddress({
          success: function (res) {
              that.setData({wx_address_info: res});
          },fail:function(){
              //弹出系统设置
              wx.openSetting({
                  success: (res) => {
                      if (res.authSetting['scope.address'] == false){
                          wx.showModal({
                              title: '提示',
                              content: "请允许通讯地址授权",
                              showCancel:false,
                              success:function(){
                                  that.select_address_bind();
                              }
                          });
                      }else{
                          that.select_address_bind();
                      }
                  }
              });
              return false;
          }
      })
  },
    //提交订单并支付
    order_formSubmit:function(e){
        var that = this;
        wx.showToast({
            title: '加载中',
            icon: 'loading',
            duration: 10000
        });
        that.setData({
            btn_submit_disabled: true,
            submitIsLoading: true
        });
        var order_info = e.detail.value;
        order_info.dish_id = that.data.this_dish_id;
        order_info.order_type = that.data.this_order_type;
        order_info.quan_id = that.data.this_quan_id;
        order_info.manjian_id = that.data.data_list.is_huodong_mianjian_id;
        order_info.shou_id = that.data.data_list.is_huodong_shou_id;
        order_info.wx_address = that.data.wx_address_info;
        if (that.data.this_table_list != null && that.data.this_table_id == 0 && that.data.this_order_type==1){
            wx.showModal({
                title: '提示',
                content: "请选择桌号",
                showCancel: false,
                success: function () {
                    that.show_table_layout_bind();
                }
            });
            that.go_select_paytype_bind();
            wx.hideToast();
            that.setData({btn_submit_disabled: false,submitIsLoading: false});
            return false;
        }
        _function.dishOrderPost(wx.getStorageSync("utoken"), order_info, that.initorderPostData, that);
    },
    initorderPostData:function(data){
        var that = this;
        wx.hideToast();
        that.setData({
            btn_submit_disabled:false,
            submitIsLoading:false     
        });
        if(data.code == 1){
             wx.requestPayment({
                'timeStamp': data.info.timeStamp,
                'nonceStr': data.info.nonceStr,
                'package': data.info.package,
                'signType': 'MD5',
                'paySign': data.info.paySign,
                'success':function(res){
                    wx.showModal({
                        title: '提示',
                        content: "订单支付成功",
                        confirmText:"查看订单",
                        showCancel:false,
                        success:function(res){
                            wx.redirectTo({
                                url: '../restaurant-order-info/index?oid='+data.info.order_id
                            });
                        }
                    });
                },
                'fail':function(res){
                    wx.showModal({
                        title: '提示',
                        content: "支付失败,请稍后到我的订单中可继续支付",
                        showCancel:false,
                        success:function(res){
                            wx.redirectTo({
                                url: '../restaurant-order-info/index?oid='+data.info.order_id
                            });
                        }
                    });
                }
            })
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
            that.go_select_paytype_bind();
            return false;
        }else if(data.code == 9){
            wx.showModal({
                title: '提示',
                content: "订单提交成功",
                showCancel:false,
                success:function(res){
                    wx.redirectTo({
                        url: '../restaurant-order-info/index?oid='+data.info.order_id
                    });
                }
            });
        }
    }
})