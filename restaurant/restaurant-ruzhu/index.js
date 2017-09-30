const app = getApp();
const requestUtil = require('../../../utils/requestUtil');
const _DuoguanData = require('../../../utils/data');
Page({
    data: {
        submitIsLoading:false,
        buttonIsDisabled:false
    },
    onLoad: function () {
        
    },
    formSubmit: function (e) {
        var that = this;
        that.setData({ submitIsLoading: true, buttonIsDisabled: true });
        var rdata = e.detail.value;
        requestUtil.get(_DuoguanData.duoguan_host_api_url + '/index.php?s=/addon/DuoguanDish/Api/dishRuzhu', rdata, (info) => {
            wx.showModal({
                title: '提示',
                content: "申请提交成功，请等待审核",
                showCancel: false,
                success: function (res) {
                    if (res.confirm == true) {
                        wx.navigateBack(1);
                    }
                }
            });
        }, this, { isShowLoading: false, completeAfter: function () { that.setData({ submitIsLoading: false, buttonIsDisabled: false }); } });
    }
})