var _function = require('../../../utils/functionData');
const app = getApp();
const requestUtil = require('../../../utils/requestUtil');
const _DuoguanData = require('../../../utils/data');
var con = require("../../../utils/api.js");
Page({
  data:{
    tabTit:1,
    this_dish_id:0,
    this_table_id:0,
    this_type_text:'点餐',
    this_order_type:1,
    glo_is_load:false,
    scrollDown:false,
    cart_list_isshow:false,
    dish_data:[],
    cart_list:[],
    dish_yingye_status_text:'未营业',
    dish_yingye_status_val:2,
    dish_button_status:true,
    submitIsLoading:false,
    guigeIsShow:false,
    goods_attr_select:{},
    goods_specification:'',
    goods_a_info:{}
  },
  chage_order_type_bind:function(){
    var that = this;
    if (that.data.this_order_type == 2){
        _function.dishDeleteCartList(wx.getStorageSync("utoken"), that.data.this_dish_id, that.initdishDeleteCartListoData, that);
        that.setData({ this_order_type: 1 });
    }else{
        if (that.data.dish_data.dish_info.dish_is_waimai == 0) {
            wx.showModal({
                title: '提示',
                content: "该门店不支持外卖",
                showCancel: false
            });
            return false;
        }
        _function.dishDeleteCartList(wx.getStorageSync("utoken"), that.data.this_dish_id, that.initdishDeleteCartListoData, that);
        that.setData({ this_order_type: 2 });
    }
  },
  goods_info_bind:function(e){
    var that = this;
    wx.navigateTo({
        url: '../restaurant-pro/index?goods_id='+e.currentTarget.id+'&dish_id='+that.data.this_dish_id
    });
  },
  huodong_info_bind:function(){
      var that = this;
      wx.navigateTo({
          url: '../restaurant-active/index?&dish_id=' + that.data.this_dish_id
      });
  },
  //领券页面
  huodong_quan_info_bind:function(){
      var that = this;
      wx.navigateTo({
          url: '../restaurant-juan/index?&dish_id=' + that.data.this_dish_id
      });
  },
  //订单
  go_user_order_bind:function(e){
      wx.navigateTo({
          url: '/pages/restaurant/restaurant-order-list/index'
      });
  },
  tabSubBind:function(e){
      var that = this;
      var this_target = e.target.id;
      that.setData({
          tabTit:this_target
      });
  },
  //导航
  get_location_bind:function(){
    var that = this;
    var loc_lat = that.data.dish_data.dish_info.dish_gps_lat;
    var loc_lng = that.data.dish_data.dish_info.dish_gps_lng;
    wx.openLocation({
        latitude: parseFloat(loc_lat),
        longitude: parseFloat(loc_lng),
        scale: 18,
        name:that.data.dish_data.dish_info.dish_name,
        address:that.data.dish_data.dish_info.dish_address
    });
  },
  //电话
  call_phone_bind: function () {
      var that = this;
      wx.makePhoneCall({
          phoneNumber: that.data.dish_data.dish_info.dish_con_mobile
      });
  },
  //选择规格
  guige_select_bind:function(e){
    var that = this;
    var this_g_goods_id = e.currentTarget.id;
    that.setData({ goods_attr_select:{}});
    //动态获取商品规格
    requestUtil.get(con.getdish, { wxappid: con.wxappid }, (info) => {
      console.log(11111);
      console.log(info);
        that.setData({
            goods_specification: info.good_attr,
            goods_a_info: info.good_a_info,
            guigeIsShow: true
        });
    }, this, {});
  },
  attr_select_clost_bind:function(){
      this.setData({ guigeIsShow: false, goods_attr_select: {}});
  },
  //属性选择
    select_attr_bind:function(e){
        var that = this;
        var this_attr_id = e.currentTarget.id;
        var this_attr_name = e.currentTarget.dataset.type;
        var datas = that.data.goods_specification;
        var this_spec_price = 0;
        var a_datas = that.data.goods_attr_select;
        var g_datas = that.data.goods_a_info;
        for(var i=0;i<datas.length;i++){
            if(datas[i].name == this_attr_name){
                    a_datas[datas[i].name] = null;
                for(var j=0;j<datas[i].values.length;j++){
                    datas[i].values[j].ischeck = false;
                    if(datas[i].values[j].id == this_attr_id){
                        datas[i].values[j].ischeck = true;
                        a_datas[datas[i].name] = this_attr_id;
                        if(datas[i].values[j].format_price > 0){
                            g_datas.shop_price = datas[i].values[j].format_price
                        }
                    }
                }
            }
        }
        that.setData({
            goods_specification:datas,
            goods_attr_select:a_datas,
            goods_a_info:g_datas
        })
    },
  onLoad:function(options){
      var that = this;
      var post_id = options.dish_id||0;
      var table_id = options.table_id||0;
      //order_type 1店内 2外卖
      var order_type = options.order_type||1;
      if(table_id != undefined){
        that.setData({
            this_table_id:table_id,
        });
      }
      that.setData({
        this_dish_id:post_id,
        this_order_type: order_type
      });
  },
  onShow:function(){
      var that = this;
      that.setData({
        submitIsLoading:false
      });
      requestUtil.get(_DuoguanData.duoguan_host_api_url + '/index.php?s=/addon/DuoguanDish/Api/getDishInfo.html', { dish_id: that.data.this_dish_id, order_type: that.data.this_order_type }, (info) => {
          that.setData({
              dish_data: info,
              classifySeleted: info.dish_cate[0].id,
              dish_yingye_status_val: info.dish_info.is_yingye_status
          });
          if(that.data.this_order_type == 2){
              that.setData({ this_type_text: info.dish_info.dish_waimai_text});
          }else{
              that.setData({ this_type_text: info.dish_info.dish_diannei_text });
          }
          wx.setNavigationBarTitle({
              title: info.dish_info.dish_name
          });
          if (info.dish_info.is_yingye_status == 1) {
              that.setData({
                  dish_yingye_status_text: '选好了',
                  dish_button_status: false
              });
          } else {
              that.setData({
                  dish_yingye_status_text: '未营业',
                  dish_button_status: true
              });
          }
          //请求购物车信息
          _function.dishGetCartList(wx.getStorageSync("utoken"), that.data.this_dish_id, that.initgetCartListData, that);
      }, this, {});
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
                      _function.dishGetCartList(wx.getStorageSync("utoken"),that.data.this_dish_id,that.initgetCartListData,that);
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
  tapClassify: function (e) {
		var id = e.target.dataset.id;
        var seid = e.target.dataset.seid;
		this.setData({
			classifyViewed: id
		});
		var self = this;
		setTimeout(function () {
			self.setData({
				classifySeleted: seid
			});
		}, 100);
	},
  onGoodsScroll: function (e) {
        var that = this
		var scale = e.detail.scrollWidth / 570,
			scrollTop = e.detail.scrollTop / scale,
			h = 0,
			classifySeleted,
			len = that.data.dish_data.dish_cate.length;
		that.data.dish_data.dish_cate.forEach(function (classify, i) {
			var _h = 70 + classify.goods_list.length * (46 * 3 + 20 * 2);
			if (scrollTop >= h - 100 / scale) {
				classifySeleted = classify.id;
			}
			h += _h;
		});
		this.setData({
			classifySeleted: classifySeleted
		});
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
    bind_cart_number_jian:function(e){
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
        requestData.cart_id=cart_id;
        requestData.gnumber = -1;
        requestData.gattr = that.data.goods_attr_select;
        requestUtil.get(_DuoguanData.duoguan_host_api_url + '/index.php?s=/addon/DuoguanDish/Api/addGoodsCart.html', requestData, (info) => {
            that.onShow();
        }, this, {});
    },
    //增加数量
    bind_cart_number_jia:function(e){
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
        if(data.code == 1){
            that.onShow();
        }
    },
    //下单
    goods_order_bind:function(){
      var that = this;
      var this_order_type = that.data.this_order_type;
      //如果是外卖 则限制配送区域
      if (this_order_type == 2 && that.data.dish_data.dish_info.waimai_limit_juli > 0){
          //获取位置信息
          wx.showToast({
              title: '配送区域验证中',
              icon: 'loading',
              duration: 10000
          });

          wx.getLocation({
              type: 'gcj02',
              success: function (res) {
                  wx.hideToast();
                  var requestData = {};
                  requestData.dish_id = that.data.this_dish_id;
                  requestData.ws_lat = res.latitude;
                  requestData.ws_lng = res.longitude;
                  requestUtil.get(_DuoguanData.duoguan_host_api_url + '/index.php?s=/addon/DuoguanDish/Api/checkPeisongLimit.html', requestData , (juliInfo) => {
                      that.comfirm_goods_order();
                  }, that, {});
              },
              fail:function(){
                  //弹出系统设置
                  wx.openSetting({
                      success: (res) => {
                          if (res.authSetting['scope.userLocation'] == false) {
                              wx.showModal({
                                  title: '提示',
                                  content: "请允许地理位置授权",
                                  showCancel: false,
                                  success: function () {
                                      that.goods_order_bind();
                                  }
                              });
                          } else {
                              that.goods_order_bind();
                          }
                      }
                  });
                  return false;
              }
          });
      }else{
          that.comfirm_goods_order();
      }
    },
    comfirm_goods_order:function(){
        var that  = this;
        //是否需要手机验证
        if (that.data.dish_data.dish_info.dish_is_sms_check == 1) {
            //读取用户手机号是否已验证
            requestUtil.get(_DuoguanData.duoguan_host_api_url + '/index.php?s=/addon/DuoguanUser/Api/getUserInfo.html', {}, (userinfodata) => {
                if (userinfodata.u_phone_status == 0) {
                    //跳转到手机认证
                    wx.navigateTo({
                        url: '../phone-binding/index'
                    });
                    return false;
                } else {
                    that.setData({
                        submitIsLoading: true,
                    });
                    wx.navigateTo({
                        url: '../restaurant-order/index?dish_id=' + that.data.this_dish_id + '&table_id=' + that.data.this_table_id + '&order_type=' + that.data.this_order_type
                    });
                }
            }, that, {});
        } else {
            that.setData({
                submitIsLoading: true,
            });
            wx.navigateTo({
                url: '../restaurant-order/index?dish_id=' + that.data.this_dish_id + '&table_id=' + that.data.this_table_id + '&order_type=' + that.data.this_order_type
            });
        }
    },
    //图片放大
    img_max_bind:function(e){
        var that = this;
        var img_max_url =e.currentTarget.dataset.url;
        var this_img_key =e.currentTarget.dataset.key;
        var all_img_num = that.data.dish_data.comment_list[this_img_key].imglist.length;
        var durls = [];
        for(var i=0;i<all_img_num;i++){
            durls[i] = that.data.dish_data.comment_list[this_img_key].imglist[i].imgurl;
        }
        wx.previewImage({
            current: img_max_url,
            urls: durls
        })   
    },
    //下拉刷新
    onPullDownRefresh:function(){
      var that = this;
      that.setData({
        submitIsLoading:false,
      })
      that.onShow();
      setTimeout(()=>{
        wx.stopPullDownRefresh()
      },1000);
    },
    onShareAppMessage: function () {
        var that = this
        return {
        title: that.data.dish_data.dish_info.dish_name,
        desc: that.data.dish_data.dish_info.dish_jieshao,
        path: 'pages/restaurant/restaurant-single/index?dish_id=' + that.data.this_dish_id
        }
    }
})