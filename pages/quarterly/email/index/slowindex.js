// pages/slowindex/slowindex.js

var util = require('../../../../shopConfig/util.js');
var url = require('../../../../utils/url.js');
var dateUtil = require('../../../../utils/util.js');
const app = getApp()

Page({
    /**
     * 页面的初始数据
     */
    data: {
        CustomBar: app.globalData.CustomBar,
        img: '',
        share: 0,
        text:'返回',
        login: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let that = this;
        if (options.share === "1") {
            console.log(options)
            that.setData({
                share: 1,
                text: '主页'
            })
        }
        wx.request({
            url: url.openEmailSetting,
            method: 'GET',
            success(res) {
                that.setData({
                    img: res.data.content[0].indexImg
                })
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
        let that = this;
        wx.getStorage({
            key: 'userInfo',
            success(res) {
                that.setData({
                    login: true
                })

            }, fail(res) {
                wx.navigateTo({
                    url: '/pages/my/login/login?type=0&share=' + that.data.share,
                })
            }
        })
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
        return {
            title: "慢邮件",
            path: '/pages/quarterly/email/index/slowindex?share=' + 1
    }
    },

    /**
     * 跳转列表
     */
    goClowlists: function () {
        wx.navigateTo({
            url: '/pages/quarterly/email/home/index'
        })
    },

    /**
     * 返回
     */
    goBack: function () {
        if (this.data.share === 1) {
            wx.switchTab({
                url: "/tabbar/live/newhome/index"
            });
        } else {
            wx.navigateBack({
                delta: 1
            });
        }
    }
})
