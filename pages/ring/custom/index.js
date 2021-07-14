// pages/ring/custom/index.js
const url = require('../../../utils/url')

Page({

    /**
     * 页面的初始数据
     */
    data: {
        tips: [],
        companyDemand: '',
        companyTelephone: '',
        companyName: '',

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let that = this;
        wx.getStorage({
            key: 'userInfo',
            fail(res) {
                wx.navigateTo({
                    url: '/pages/my/login/login'
                })
            }
        })
        wx.request({
            url: url.setting,
            method: 'GET',
            success(res) {
                console.log(res.data)
                that.setData({
                    tips: res.data.content[0].tips.split('；')
                });
            }
        })
    },
    sub() {
        let that = this;
        let data = that.data;
        wx.showLoading({
            title: '加载中...'
        });
        console.log(data.companyDemand.length)
        if (data.companyDemand.length < 20) {
            wx.showToast({
                icon: 'none',
                title: '请详细需求简介'
            })
            return false;
        }

        wx.getStorage({
            key: 'userInfo',
            success(res) {
                var user = res.data;
                console.log("user", user
                );
                wx.request({
                    url: url.ringCustomize,
                    method: "POST",
                    data: {
                        userId: user.id,
                        userName: user.nickname,
                        userAvatar: user.avatar,
                        openId: user.openid,
                        companyName: data.companyName,
                        companyTelephone: data.companyTelephone,
                        companyDemand: data.companyDemand,
                    }, success(res) {
                        wx.hideLoading()
                        if (res.statusCode === 201) {
                            wx.showToast({
                                title: '提交成功!'
                            });
                            setTimeout(() => {
                                wx.navigateBack();
                            }, 1000)
                        } else {
                            wx.showToast({
                                title: '请稍后再试!',
                                icon: 'none'
                            });
                        }
                        console.log(res.statusCode);
                    },fail(res) {
                        wx.hideLoading()
                        wx.showToast({
                            title: '请稍后再试!',
                            icon: 'none'
                        });
                    }
                });
            },
            fail(res) {
                wx.navigateTo({
                    url: '/pages/my/login/login'
                })
            }
        });
        console.log(11111111111)
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
        wx.getStorage({
            key: 'userInfo',
            fail(res) {
                wx.navigateTo({
                    url: '/pages/my/login/login'
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

    }
})
