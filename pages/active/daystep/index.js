// pages/active//daystep/index.js
const url = require('../../../utils/url')
const util = require('../../../utils/util')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        stepNum: 0,
        stepNumDay: 0,
        times: 0,
        stepInfo: {
            stepNum: 0,
            cmb: 0,
            times: 0
        },
        nowCmb: 0,
        userInfo: {},
        chbeanNum: 0,
        setting: {},
        share: 0,
        options: {},
        commit: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let that = this
        if (options.share === '1') {
            that.setData({
                share: 1,
                options: options
            })
        }
        wx.request({
            url: url.setting,
            method: 'GET',
            success(res) {
                that.setData({
                    stepNumDay: res.data.content[0].stepNumDay,
                    setting: res.data.content[0]
                });
            }
        });
        wx.getStorage({
            key: 'userInfo',
            success(r) {
                wx.request({
                    url: url.userInfo + r.data.id,
                    method: "GET",
                    success(res) {
                        let user = res.data;
                        that.setData({
                            userInfo: user,
                            chbeanNum: user.chbeanNum / 100
                        });
                    }
                })

                wx.request({
                    url: url.dayStep,
                    method: 'GET',
                    data: {
                        userId: r.data.id,
                    }, success(res) {
                        console.log("stepInfo", res.data);
                        if (res.data !== '') {
                            that.setData({
                                times: res.data.totalElements,
                            });
                        }
                    }
                })

                wx.request({
                    url: url.dayStep + '/getToDay',
                    method: 'GET',
                    data: {
                        userId: r.data.id,
                    }, success(res) {
                        console.log("stepInfo", res.data);
                        if (res.data !== '') {
                            that.setData({
                                stepInfo: res.data,
                            });
                        }
                    }
                })
                wx.login({
                    success: res => {
                        let l = res;
                        wx.getWeRunData({
                            success(e) {
                                // 拿 encryptedData 到开发者后台解密开放数据
                                wx.request({
                                    url: url.runData,
                                    method: 'GET',
                                    data: {
                                        code: l.code,
                                        openid: r.data.openid,
                                        encryptedData: e.encryptedData,
                                        iv: e.iv
                                    },
                                    success(res) {
                                        that.setData({
                                            stepNum: res.data.stepInfoList[30].step,
                                            // stepNum: 100000,
                                        })
                                    }
                                })
                            }, fail(res) {
                                console.log("失败")
                            }
                        })
                    }, fail(res) {
                        console.log("失败")
                    }
                })

            }
        })
    },
    doStep() {
        console.log(1111111)
        let that = this;
        var number = that.data.stepNum - that.data.stepNumDay;
        if (that.data.stepInfo.stepNum >= that.data.stepNumDay) {
            wx.showToast({
                title: '今日兑换已到上限',
                icon: 'none'
            })
        } else {
            if (that.data.stepNum > 0) {

                if (that.data.stepNum - that.data.stepInfo.stepNum <= 0) {
                    wx.showToast({
                        title: '请走动走动吧...',
                        icon: 'none'
                    });
                } else {
                    if (that.data.commit === false) {

                        that.setData({
                            commit: true
                        });
                        // console.log(number);
                        wx.getStorage({
                            key: 'userInfo',
                            success(res) {
                                wx.request({
                                    url: url.dayStep + '/doStep',
                                    method: 'POST',
                                    data: {
                                        userId: res.data.id,
                                        userName: res.data.nickname,
                                        userAvatar: res.data.avatar,
                                        stepNum: that.data.stepNum
                                    }, success(res) {
                                        console.log("res", res);
                                        that.setData({
                                            isShow: true,
                                            nowCmb: res.data.cmb - that.data.stepInfo.cmb,
                                            stepInfo: res.data,
                                            // 'userInfo.chbeanNum': that.data.userInfo.chbeanNum + (res.data.cmb * 100)
                                        });

                                        wx.request({
                                            url: url.userInfo + res.data.userId,
                                            method: "GET",
                                            success(res) {
                                                let user = res.data;
                                                that.setData({
                                                    userInfo: user
                                                });
                                            }
                                        })
                                    }
                                })
                            }
                        });
                    }
                }
            } else {
                wx.showToast({
                    title: "数据加载中...",
                    icon: 'none'
                })
            }

        }
    },
    closeBox() {
        this.setData({
            isShow: false
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
        this.onLoad(that.data.options);
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
        return {
            title: "今日步数兑换草莓币",
            path: '/pages/active/daystep/index?share=' + 1
        }
    },
    onShareTimeline: function () {
        return {
            title: '今日步数换币',
            // imageUrl: 'http://demo.png',
            query: 'share=1',
        }
    }
})
