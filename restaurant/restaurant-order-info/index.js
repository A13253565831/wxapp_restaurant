var _function = require('../../../utils/functionData');
var app = getApp()
Page({
    data:{
        this_order_id:0,
        oinfo:[],
        glo_is_load:true
    },
    go_dish_info_bind:function(e){
        var that = this;
        var dish_id = e.currentTarget.id;
        wx.navigateTo({
            url: '../restaurant-single/index?dish_id='+dish_id
        });
    },
    onLoad:function(options){
        var that = this;
        var order_id = options.oid;
        that.setData({
          this_order_id:order_id,
        })
      //请求订单详情
      _function.dishGetOrderInfo(wx.getStorageSync("utoken"),that.data.this_order_id,that.initgetOrderInfoData,that)
    },
    initgetOrderInfoData:function(data){
        var that = this;
        console.log(data.info);
        if(data.code == 1){
             that.setData({
                 oinfo:data.info,
                 glo_is_load:false
             });
        }else if(data.code == 2){
            wx.showToast({
              title: '登陆中',
              icon: 'loading',
              duration: 10000,
              success:function(){
                  app.getNewToken(function(token){
                      _function.dishGetOrderInfo(wx.getStorageSync("utoken"),that.data.this_order_id,that.initgetOrderInfoData,that);
                  });
              }
          });
        }else if(data.code == 5){
            wx.showModal({
                title: '提示',
                content: data.info,
                showCancel:false
            })
        }
        wx.hideToast();
    },
    //支付
    order_go_pay_bind:function(){
        var order_id = this.data.this_order_id
        wx.redirectTo({
            url: '../../../shop/orderpay/index?order_id=' + order_id
        })
    },
    //评论
    order_go_comment_bind:function(){
        var order_id = this.data.this_order_id
        wx.redirectTo({
            url: '../comment/index?order_id=' + order_id
        })
    },
    initshouhuoOrderInfoData:function(data){
        var that = this;
        if(data.code == 1){
             _function.dishGetOrderInfo(wx.getStorageSync("utoken"),that.data.this_order_id,that.initgetOrderInfoData,this)
        }else if(data.code == 2){
            wx.showModal({
                title: '提示',
                content: '登陆超时，将重新获取用户信息',
                showCancel:false,
                success:function(res){
                    app.getNewToken(function(token){
                        that.setData({
                            local_global_token:token
                        })
                        _function.dishGetOrderInfo(wx.getStorageSync("utoken"),that.data.this_order_id,that.initgetOrderInfoData,that)
                    });
                }
            });
        }else if(data.code == 5){
            wx.showModal({
                title: '提示',
                content: data.info,
                showCancel:false
            })
            return false;
        }
    },
    //下拉刷新
    onPullDownRefresh:function(){
      var that = this;
      that.setData({
        this_page:1
      });
      _function.dishGetOrderInfo(wx.getStorageSync("utoken"),that.data.this_order_id,that.initgetOrderInfoData,that)
      setTimeout(()=>{
        wx.stopPullDownRefresh()
      },1000)
    },
})