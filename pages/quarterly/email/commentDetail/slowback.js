// pages/slowback/slowback.js
var util = require('../../../../shopConfig/util.js');
var url = require('../../../../utils/url.js');
var util2 = require('../../../../utils/util.js');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        infos: {
            fromName: '德玛西亚的囚徒 收',
            toName: '德玛西亚的囚徒',
            toTime: '12月15日',
            content: '<p>记忆就像是切开的柠檬，提醒着大脑，刺激着神经。味道从来那么独特，如同一开始都那么独特。</p><p>每个孩子都是大人的一种旧回忆。人们能透过孩子看到曾经的自己，或者回忆起过去的那个人，或者是在轨道内感受到曾经的气息。</p><p>是时间把孩子变成大人的，也是时间把现在变成以后的回忆的。时间的唯一硬伤是它只能向前，如同中国象棋里面的兵与卒。</p>'
        },
        comment: {}
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let that = this;
        wx.request({
            url: url.openEmailComments,
            method: 'GET',
            data: {
                id: options.id
            }, success(res) {
                var contentElement = res.data.content[0];
                contentElement.createTime = util2.formatMonthDay(new Date(contentElement.createTime))
                that.setData({
                    comment: contentElement
                })
                console.log(contentElement)
            }
        })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },

    /**
     * 返回
     */
    goback: function () {
        wx.navigateBack({
            delta: 1,
        })
    }
})
