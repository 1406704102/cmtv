// pages/quarterly//email/detail/index.js
var util = require('../../../../shopConfig/util.js');
var url = require('../../../../utils/url.js');
var util2 = require('../../../../utils/util.js');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        email: {},
        userInfo: {},
        replayLists: [],
        imgs: [],
        timers: [],
        isLike: false,
        defaultLike: false,
        type: 0
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
            id: options.id,
            type: options.type
        })
        const that = this;
        wx.getStorage({
            key: 'userInfo',
            success(res) {
                that.setData({
                    userInfo:res.data
                })
                wx.request({
                    url: url.openEmailInfo+'/'+options.id,
                    method: 'GET',
                    success(res) {
                        var email = res.data;
                        console.log(email)
                        var emailPic = email.emailPic;
                        let imgs = null;
                        if (emailPic !== null) {
                            emailPic = emailPic.substring(0, emailPic.length - 10);
                            imgs = emailPic.split(",")
                        }
                        email.createTime = util2.formatMonthDay(new Date(email.createTime))
                        that.setData({
                            email: email,
                            imgs: imgs
                        })
                        that.getLike();
                    }
                })
                wx.request({
                    url: url.openEmailUserSend+'/read',
                    method: "POST",
                    data:{
                        userId:res.data.id,
                        emailId:options.id
                    }, success(res) {
                        console.log(res)
                    }
                })
                wx.request({
                    url: url.openEmailComments,
                    method: 'GET',
                    data:{
                        emailId: options.id
                    }, success(res) {
                        that.setData({
                            replayLists: res.data.content
                        })
                    }
                })
            }})

    },
    getLike() {
        let that = this
        wx.getStorage({
            key: 'userInfo',
            success(res) {
                wx.request({
                    url: url.openEmailUserStar,
                    method: 'GET',
                    data: {
                        userId: res.data.id,
                        emailId: that.data.email.id,
                        enable: '1'
                    }, success(res) {
                        var like = res.data.content;
                        console.log(like)
                        if (like.length !== 0) {
                            that.setData({
                                isLike: true,
                                defaultLike: true
                            })
                        }
                    }
                })
            }, fail(res) {
                wx.navigateTo({
                    url: '/pages/my/login/login'
                })
            }
        })

    },
    doLike() {
        let that = this;
        var data = that.data;
        clearTimeout(data.timers);
        wx.getStorage({
            key: 'userInfo',
            success(res) {
                console.log('userInfo')
                let l = '0';
                if (data.isLike) {
                    that.setData({
                        'email.likeNum': data.email.likeNum - 1,
                        isLike: !data.isLike
                    });
                } else {
                    that.setData({
                        'email.likeNum': data.email.likeNum + 1,
                        isLike: !data.isLike
                    });
                    l = '1';
                }
                if (data.isLike !== data.defaultLike) {
                    that.setData({
                        'timers': setTimeout(() => {
                            wx.request({
                                url: url.openEmailUserStar,
                                method: 'POST',
                                data: {
                                    emailId: data.email.id,
                                    userId: res.data.id,
                                    enable: l
                                }, success(res) {
                                    console.log(res);
                                }
                            });

                        }, 1000)
                    });
                }
            }
        })


    },
    /**
     * 跳转回信
     */
    goclowreplay: function (e) {
        wx.navigateTo({
            url: '/pages/quarterly/email/replay/slowreplay?type=0'
        })
    },
    toReplay(e) {
        let that =this
        wx.navigateTo({
            url: "/pages/quarterly/email/replay/slowreplay?id=" + e.currentTarget.dataset.id + "&type=" + that.data.type
        })
    },
    goDetail(e) {
        wx.navigateTo({
            url: "/pages/quarterly/email/commentDetail/slowback?id=" + e.currentTarget.dataset.id
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
        wx.request({
            url: url.openEmailComments,
            method: 'GET',
            data: {
                emailId: that.data.email.id
            }, success(res) {
                that.setData({
                    replayLists: res.data.content
                })
            }
        })
    },
    previewImg: function (e) {
        wx.previewImage({
            current: e.currentTarget.dataset.url,     //当前图片地址
            urls: e.currentTarget.dataset.imgs,               //所有要预览的图片的地址集合 数组形式
            success: function (res) {
            },
            fail: function (res) {
            },
            complete: function (res) {
            },
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
    // onShareAppMessage: function () {
    //
    // }
})
