const app = getApp();
const requestUtil = require('../../../utils/requestUtil');
const _DuoguanData = require('../../../utils/data');
Page({
  data: {
    submitIsLoading: false,
    buttonIsDisabled: false
  },
  onLoad: function () {

  },
  formSubmit: function (e) {
    var that = this;
    var rdata = e.detail.value;
    requestUtil.get(_DuoguanData.duoguan_host_api_url + '/index.php?s=/addon/DgCoupon/DgCouponApi/make_recharge_order', rdata, (info) => {
      that.orderPay(info.order_id);
    });
  },
   //开始支付
  order_go_pay_bind: function (e) {
    var that = this;
    var this_order_id = e.currentTarget.id;
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 10000
    })
    that.setData({
      buttonIsDisabled: true,
      submitIsLoading: true
    })
    that.orderPay(this_order_id);
  },
  //订单支付
  orderPay: function (oid) {
    var that = this;
    requestUtil.get(_DuoguanData.duoguan_host_api_url + '/index.php?s=/addon/DgCoupon/DgCouponApi/orderPay.html', { oid: oid }, (data) => {
      console.log(data);
      that.setData({
        buttonIsDisabled: false,
        submitIsLoading: false
      })
      wx.requestPayment({
        'timeStamp': data.timeStamp,
        'nonceStr': data.nonceStr,
        'package': data.package,
        'signType': 'MD5',
        'paySign': data.paySign,
        'complete': function () {
          //支付完成 刷新
          // that.getUserOrderList();
        }
      });
    }, { complete: that.orderPayComplete() });
  },
  //支付完成
  orderPayComplete: function () {
    var that = this;
    that.setData({
      btn_submit_disabled: false,
      submitIsLoading: false
    });
  },
})