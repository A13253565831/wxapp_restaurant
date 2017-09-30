const app = getApp();
import _data from '../../../utils/data';
import requestUtil from '../../../utils/requestUtil';
Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  var that=this;
  that.getCardList();
  },

  getCardList: function () {
    var that=this;
    requestUtil.get(_data.duoguan_host_api_url +'/index.php?s=/addon/DgCoupon/DgCouponApi/get_card_list.html',{},(data) => {
      if(data.length==0)
      {
        that.setData({
          isSource: true,
          list: data,
        })
      }
      else
      {
        that.setData({
          list: data,
          isSource:false
        })
      }
    }, {completeAfter:that.acoma()});
  },
  acoma:function(e){
  
      // wx.showModal({
      //   title: '提示',
      //   content:' JSON.stringify(e)',
      //   success: function (res) {
      //     if (res.confirm) {
      //       console.log('用户点击确定')
      //     } else if (res.cancel) {
      //       console.log('用户点击取消')
      //     }
      //   }
      // })
  },
  openCard: function (event) {
    var card_id = event.currentTarget.dataset.cardid
    var that = this;
          wx.login({
            success: function (loginR) {
              wx.getUserInfo({
                success:function(userR){
                  that.data.signature = userR.signature;
                  requestUtil.get(_data.duoguan_host_api_url+'/index.php?s=/addon/DgCoupon/DgCouponApi/getWxInfo.html', { code: loginR.code}, (data) => {
                that.data.openid = data.openid;
                that.data.timestamp = data.timestamp;
                wx.addCard({
                  cardList: [
                    {
                      cardId:card_id,
                      cardExt: '{"code": "", "openid":that.data.openid, "timestamp": that.data.timestamp, "signature":that.data.signature}'
                    }
                  ],
                  success: function (res) {
                  },
                  fail: function (res) {

                  },
                })
              }, { completeAfter: this.aa});
                }
              })
            }
          })
  },
  onShareAppMessage: function () {
  
  },
  getCardids:function(){
    var that=this;
    requestUtil.get(_data.duoguan_host_api_url+'/index.php?s=/addon/DgCoupon/DgCouponApi/get_card_list.html', {}, (data) => {
      var cardids = [];
      console.log(data.length);
      for (var i = 0; i < data.length; i++) {
        console.log(i);
        var value = data[i];
        var idDatas = {};
        idDatas['cardId'] = value.info.id
        var a={};
        a['code']='';
        a['openid'] = that.data.openid;
        a['timestamp'] = that.data.timestamp;
        a['signature'] = that.data.signature;
        data['cardExt'] =a;
        cardids = cardids.concat(idDatas);
      }
      console.log(cardids);
      that.addcards(cardids);


   

    }, { completeAfter: that.acoma() });
  },
  addcards:function(cardids){
    var that=this;
    wx.addCard({
      cardList: cardids,
      success: function (res) {
      },
      fail: function (res) {

      },
    })
  },

})