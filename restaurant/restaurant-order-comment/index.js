var _function = require('../../../utils/functionData');
var app = getApp()
Page({
    data:{
        score_arr:[
            {
                'val':1,
                'ischeck':true
            },
            {
                'val':2,
                'ischeck': true
            },
            {
                'val':3,
                'ischeck': true
            },
            {
                'val':4,
                'ischeck': true
            },
            {
                'val':5,
                'ischeck': true
            }
        ],
        this_order_id:0,
        oinfo:[],
        glo_is_load:true,
        img_count_limit:5,
        this_img_i:0,
        this_img_max:0,
        postimg:[],
        submitIsLoading:false,
        buttonIsDisabled:false,
        this_score_val:5
    },
    onLoad:function(options){
        var that = this;
        var order_id = options.oid;
        that.setData({
          this_order_id:order_id,
        })
      //请求订单详情
      _function.dishGetOrderInfo(wx.getStorageSync("utoken"),that.data.this_order_id,that.initgetOrderInfoData,that);
    },
    initgetOrderInfoData:function(data){
        var that = this;
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
    set_score_bind:function(e){
        var that = this;
        var max_val = e.currentTarget.id;
        var datas = that.data.score_arr;
        for(var i=0;i<datas.length;i++){
            if(i < max_val){
                datas[i].ischeck = true
            }else{
                datas[i].ischeck = false
            }
        }
        that.setData({
            score_arr:datas,
            this_score_val:max_val
        });
    },
    //删除
    del_pic_bind:function(e){
        var that = this
        var index = e.currentTarget.id;
        var datas = that.data.postimg;
        datas.splice(index,1)
        that.setData({
            postimg:datas
        })
    },
    //上传图片
    chooseimg_bind:function(){
        var that = this
        var img_lenth = that.data.postimg.length
        var sheng_count = that.data.img_count_limit - img_lenth
        if(sheng_count <= 0){
            wx.showModal({
                title: '提示',
                content: '对不起，最多可上传五张图片',
                showCancel:false
            })
            return false
        }
        wx.chooseImage({
            count: sheng_count,
            sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
            success: function (res) {
                // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
                that.setData({
                    postimg:that.data.postimg.concat(res.tempFilePaths)
                })
            }
        })
    },
    //发表评论
    formSubmit:function(e){
        var that = this;
        var t_data = e.detail.value;
        that.setData({
            buttonIsDisabled:true,
            submitIsLoading:true
        })
        _function.dishPostOrderComment(wx.getStorageSync("utoken"),that.data.this_order_id,that.data.this_score_val,e.detail.value.post_content,that.initdishPostOrderCommentData,that)
    },
    initdishPostOrderCommentData:function(data){
        var that = this
        that.setData({
            buttonIsDisabled:false,
            submitIsLoading:false
        })
        if(data.code == 1){
            var comment_id = data.info
            //如果发表成功，则进行上传图片接口
            var g_data = that.data.postimg
            if(g_data.length > 0){
                that.setData({
                    this_img_max:g_data.length,
                    this_comment_id:comment_id
                })
                wx.showToast({
                    title: '图片上传中',
                    icon: 'loading',
                    duration: 10000
                })
                that.imgUploadTime();
            }else{
                wx.hideToast();
                wx.showModal({
                    title: '提示',
                    content: '评价成功',
                    showCancel: false,
                    success: function (res) {
                        wx.redirectTo({
                            url: '../restaurant-order-list/index'
                        });
                    }
                });
            }
        }else if(data.code == 5){
            wx.showModal({
                title: '提示',
                content: data.info,
                showCancel:false
            })
            return false
        }else if(data.code == 2){
            wx.showModal({
                title: '提示',
                content: '登陆超时，将重新获取用户信息',
                showCancel:false,
                success:function(res){
                    app.getNewToken(function(token){
                        _function.dishGetOrderInfo(wx.getStorageSync("utoken"),that.data.this_order_id,that.initgetOrderInfoData,that);
                    })
                }
            });
        }
    },
    imgUploadTime:function(){
        var that = this
        var this_img_len = that.data.this_img_i
        var this_img_max_len = that.data.this_img_max
        if(this_img_len < this_img_max_len){
            _function.dishImgUpload(that.data.this_comment_id,wx.getStorageSync("utoken"),that.data.postimg[this_img_len],that.initImgUploadData);
        }else{
            wx.hideToast();
            wx.showModal({
                title: '提示',
                content: '评价成功',
                showCancel:false,
                success:function(res){
                    wx.redirectTo({
                        url: '../restaurant-order-list/index'
                    });
                }
            });
        }
    },
    initImgUploadData(data){
        var that = this;
        that.setData({
            this_img_i:that.data.this_img_i + 1
        });
        that.imgUploadTime();
    },
    //商品点赞
    goods_zan_bind:function(e){
        var goods_id = e.currentTarget.id;
    }
})