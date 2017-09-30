const app = getApp();
const requestUtil = require('../../../utils/requestUtil');
const _DuoguanData = require('../../../utils/data');
Page({
    data: {
        this_user_info:{},
        submitIsLoading: false,
        buttonIsDisabled: false,
        yzm_btn_disabled: true,
        yzm_btn_text: '获取验证码',
        yzm_all_time: 60,
        this_user_phone: '',
        phone_yzm_code: ''
    },
    onLoad: function (options) {
        var that = this;
        var dish_id = options.dish_id;
        that.setData({ this_dish_id: dish_id });
        requestUtil.get(_DuoguanData.duoguan_host_api_url + '/index.php?s=/addon/DuoguanUser/Api/getUserInfo.html', { dish_id: dish_id }, (info) => {
            that.setData({ this_user_info:info});
        }, this, {});
    },
    formSubmit: function (e) {
        var that = this;
        that.setData({ submitIsLoading: true, buttonIsDisabled: true });
        var rdata = e.detail.value;
        requestUtil.get(_DuoguanData.duoguan_host_api_url + '/index.php?s=/addon/DuoguanUser/Api/setUserPhoneStatus', rdata, (info) => {
            wx.showModal({
                title: '提示',
                content: "手机验证成功，请返回继续操作",
                showCancel: false,
                success: function (res) {
                    if (res.confirm == true) {
                        wx.navigateBack(1);
                    }
                }
            });
        }, this, { isShowLoading: false, completeAfter: function () { that.setData({ submitIsLoading: false, buttonIsDisabled: false }); } });
    },
    //验证手机号码
    check_phone_bind: function (e) {
        var that = this
        var phone_v = e.detail.value
        if (!(/^1\d{10}$/.test(phone_v))) {
            that.setData({
                yzm_btn_disabled: true
            })
        } else {
            that.setData({
                yzm_btn_disabled: false,
                this_user_phone: phone_v
            })
        }
    },
    //发送验证码
    send_phone_code_bind: function () {
        var that = this;
        var t_phone = that.data.this_user_phone;
        requestUtil.get(_DuoguanData.duoguan_host_api_url + '/index.php?s=/addon/DuoguanUser/Api/sendUserPhoneTrue.html', { phone: t_phone }, (info) => {
            //倒计时
            that.setData({
                yzm_btn_disabled: true
            })
            that.getShengTime();
        }, this, {});
    },
    getShengTime: function () {
        var that = this
        var yijing_time = that.data.yzm_all_time - 1;
        if (that.data.yzm_all_time > 0) {
            that.setData({
                yzm_all_time: yijing_time,
                yzm_btn_text: '等待' + yijing_time + '秒'
            })
            setTimeout(function () {
                that.getShengTime();
            }
                , 1000)
        } else {
            that.setData({
                yzm_btn_disabled: false,
                yzm_btn_text: '获取验证码',
                yzm_all_time: 60
            })
        }
    }
})