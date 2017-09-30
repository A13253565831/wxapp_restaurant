const app = getApp();
const requestUtil = require('../../../utils/requestUtil');
const _DuoguanData = require('../../../utils/data');
Page({
    data: {
        this_dish_info: {},
    },
    onLoad: function (options) {
        var that = this;
        var dish_id = options.dish_id;
        that.setData({ this_dish_id: dish_id });
        requestUtil.get(_DuoguanData.duoguan_host_api_url + '/index.php?s=/addon/DuoguanDish/Api/getDishOneInfo.html', { dish_id: dish_id }, (info) => {
            that.setData({ this_dish_info:info});
        }, this, {});
    },
    go_back_bind:function(){
        wx.navigateBack(1);
    }
})