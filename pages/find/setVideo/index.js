const util = require('../../../utils/util')
const url = require('../../../utils/url')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        id: '',
        videoInfo: {},
        phone: '',
        checkText: '',
        autoPlay: true,
        share: 0,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let that = this;
        if (options.share) {
            that.setData({
                share: 1
            })
        }
        that.setData({
            id: options.id,
            name: options.name
        })

        wx.request({
            url: url.video,
            method: 'GET',
            data: {
                id: options.id
            }, success(res) {
                let contentElement = res.data.content[0];
                console.log(contentElement)
                that.setData({
                    videoInfo: contentElement
                })
            }
        })


    },
    //弹窗
    showModal2(e) {
        let that = this;
        wx.getStorage({
            key: 'userInfo',
            success(res) {
                // that.setData({
                //   autoPlay: true
                // })
                that.setData({
                    modalName: e.currentTarget.dataset.target,
                })
            }, fail(res) {
                wx.navigateTo({
                    url: '/pages/my/login/login?type=0&id=' + that.data.id
                })
            }
        })

    },
    hideModal(e) {
        this.setData({
            modalName: null
        })
    },
    checkPhone(e) {
        let that = this;
        wx.showLoading({
            title: '加载中...'
        });
        that.hideModal();
        wx.request({
            url: url.ayy + '/queryPackageList',
            method: "GET",
            data: {
                phoneNumber: that.data.phone,
                packageId: util.getPackageId("dx")
            }, success(res) {
                wx.hideLoading();
                console.log("res.data.UserPackageListResp.res_code", res.data.UserPackageListResp.res_code);
                if (res.data.UserPackageListResp.res_code === "0004") {
                    wx.request({
                        url: url.ayy + '/orderSendRandom',
                        method: 'GET',
                        data: {
                            phone: that.data.phone,
                            packageId: util.getPackageId("dx")
                        }, success(res) {
                            console.log("orderSendRandom", res);
                        }
                    });
                    that.setData({
                        modalName: 'DialogModal4'
                    });
                } else {
                    console.log("0000", res.data.UserPackageListResp.res_code === "0000");
                    that.setVideo();
                }
            }, complete(res) {
                wx.hideLoading();
            }
        })
    },
    sub() {
        let that = this;
        wx.showLoading({
            title: '加载中...'
        })
        wx.request({
            url: url.ayy + '/asyncOpenOrderSendRandom',
            method: 'POST',
            header: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            data: {
                phoneNumber: that.data.phone,
                packageId: util.getPackageId("dx"),
                randomKey: that.data.checkText
            }, success(res) {

                setTimeout(function () {
                    console.log("asyncOpenOrderSendRandom", res);
                    if (res.data.res_code === '0000') {
                        that.setData({
                            modalName: 'DialogModal3'
                        });
                        // wx.request({
                        //     url: url.ayy + '/queryPackageList',
                        //     method: "GET",
                        //     data: {
                        //         phoneNumber: that.data.phone,
                        //         packageId:util.getPackageId("dx")
                        //     }, success(res) {
                        //         // that.setVideo();
                        //     }
                        // })
                    } else if (res.data.res_code === '0013') {
                        wx.showToast({
                            title: '验证码错误...',
                            icon: 'none'
                        })
                    } else {
                        wx.showToast({
                            title: '请稍后再试...',
                            icon: 'none'
                        })
                    }
                    wx.hideLoading();

                }, 2000)
            }, complete(res) {
                wx.hideLoading();
            }
        })
    },
    setVideo() {
        let that = this
        wx.request({
            url: url.ayy + '/setVideo',
            method: 'POST',
            header: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            data: {
                phoneNumber: that.data.phone,
                toneCode: that.data.videoInfo.ringId
                // toneCode: '1321'
            }, success(res) {
                if (res.data.res_code === '0') {
                    wx.showToast({
                        title: '您已订购该彩铃!!',
                        icon: 'none'
                    });
                } else if (res.data.res_code === '302001') {
                    that.setData({
                        modalName: 'DialogModal5'
                    });
                } else if (res.data.res_code === '1119') {
                    wx.showToast({
                        title: '请填写电信号码!',
                        icon: 'none'
                    });
                } else {
                    wx.showToast({
                        title: '请稍后再试!',
                        icon: 'none'
                    });
                }
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
        let that = this

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
    //     // /pages/find/videoDetail/index?id={{object2.id}}&url={{object2.videoUrl}}&name={{object2.videoName}}

    // }
})
