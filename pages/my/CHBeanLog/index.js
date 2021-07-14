const url = require('../../../utils/url')
const util = require('../../../utils/util')
const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        userId: '',
        // StatusBar: app.globalData.StatusBar,
        CustomBar: app.globalData.CustomBar,
        loadProgress: 0,
        logList: [],
        logTotals: 0,
        size: 20,
        page: 0
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
            userId: options.id
        })
        this.getData(options.id);
        let formatTime2 = util.formatTime2(new Date());
        console.log("formatTime2", formatTime2);
        // wx.request({
        //     url: url.video + '/getSignature',
        //     data: {
        //         data:'2000000002010&7200&'+formatTime2+'&19957982457&&1'
        //         // data: '10000000000000&1234&20160214162300&18910001234&'
        //     },
        //     success(res) {
        //         console.log(res.data)
        //         wx.request({
        //             header: {
        //                 'auth-deviceid': '2000000002010',
        //                 'auth-channelid': '7200',
        //                 'auth-timestamp': formatTime2,
        //                 'auth-signature-method': 'HmacSHA1',
        //                 'auth-signature': res.data
        //             },
        //             url: "http://api.118100.cn/openapi/services/v2/package/packageservice/querypackagelist.json",
        //             method: 'GET',
        //             data:{
        //                 mdn:'19957982457',
        //                 package_id:'',
        //                 is_count_down_num: 1
        //             },
        //             success(res) {
        //                 console.log(res);
        //             }
        //         })
        //     }
        // })

    },
    getData(userId) {
        let that = this;
        this.loadProgress()
        that.setData({
            isLoad: true
        })
        wx.getStorage({
            key: 'userInfo',
            success(res) {
                wx.request({
                    url: url.cHBeanLog,
                    method: 'get',
                    data: {
                        userId: userId,
                        page: that.data.page,
                        size: that.data.size,
                        sort: 'createTime,desc'
                    }, success(res) {
                        let logList = res.data.content;
                        logList.forEach(f => {
                            f.createTime = util.formatMonthDayHourMinute(new Date(f.createTime));
                        })
                        console.log(logList)
                        if (that.data.page === 0) {
                            that.setData({
                                logList: logList,
                                logTotals: res.data.totalElements,
                                page: that.data.page + 1,
                                loadProgress: 100
                            });
                        } else {
                            that.setData({
                                logList: that.data.logList.concat(logList),
                                logTotals: res.data.totalElements,
                                page: that.data.page + 1,
                                loadProgress: 100
                            });
                        }
                        that.setData({
                            isLoad: false
                        })
                    }
                });
            }, fail(res) {
                wx.navigateTo({
                    url: '/pages/my/login/login'
                })
            }
        })
    },
    loadProgress() {
        this.setData({
            loadProgress: this.data.loadProgress + 20
        })
        if (this.data.loadProgress < 100) {
            setTimeout(() => {
                this.loadProgress();
            }, 1000)
        } else {
            this.setData({
                loadProgress: 0
            })
        }
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
        let that = this
        let pages = parseInt(that.data.logTotals / that.data.size);
        if (pages > that.data.page - 1) {
            that.setData({
                isLikeLoad: true
            })
            that.getData(that.data.userId);
        }
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})
