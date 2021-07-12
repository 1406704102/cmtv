// pages/active/home/index.js
const url = require('../../../utils/url')
const util = require('../../../utils/util')
var app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        swiperList: [],
        page: 0,
        size: 5,
        totalElements: 0,
        activeList: [],

        activeNewList: [],
        hotAttList: [],
        stepInfo: {
            step: 0,
            cmb: 0
        }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

        let that = this;
        //获取banner
        wx.request({
            // url: url.banner + "active",
            url: url.banner,
            method: "GET",
            data: {
                bannerType: 'active',
                enable: 1
            },
            success(res) {
                that.setData({
                    swiperList: res.data.content,
                    bReady: false
                })
            }
        })
        that.getActiveNew();
        that.getActive();
        that.getAttList();
    },

    getActiveNew() {
        const that = this;
        wx.request({
            url: url.activeInfoTalkNew,
            method: "GET",
            data: {
                size: 1000,
                page: 0,
                indexShow: '1',
                enable: '1',
                sort: 'topNum,createTime,desc'
            }, success(res) {
                console.log("getActiveNew", res.data.content);
                that.setData({
                    activeNewList: res.data.content
                })
            }
        })
    },
    getSpecialActiveList() {
        const that = this;
        wx.request({
            url: url.specialActive,
            method: "GET",
            data: {
                size: 1000,
                page: 0,
                indexShow: '1',
                enable: '1',
                sort: 'topNum,createTime,desc'
            }, success(res) {
                console.log("getSpecialActiveList", res.data.content)
                that.setData({
                    specialActiveList: res.data.content
                })
            }
        })
    },
    getAttList() {
        const that = this;
        wx.getStorage({
            key: 'userInfo',
            success(res) {
                wx.request({
                    url: url.activeAttTalk,
                    method: 'get',
                    data: {
                        hotNum: 0,
                        enable: '1',
                        sort: 'hotNum,desc',
                        userId2: res.data.id
                    }, success(res) {
                        that.setData({
                            hotAttList: res.data.content
                        })
                    }
                })
            }, fail(res) {
                wx.request({
                    url: url.activeAttTalk,
                    method: 'get',
                    data: {
                        hotNum: 0,
                        sort: 'hotNum,desc'
                    }, success(res) {
                        that.setData({
                            hotAttList: res.data.content
                        })
                    }
                })
            }
        })
    },

    toNewDetail(e) {
        var id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: '/pages/active/detailTalk-new/index?id=' + id
        })
    },


    //获取活动(旧)
    getActive() {
        let that = this;
        that.setData({
            isLoad: true
        })
        //查询活动
        wx.request({
            url: url.activeInfo,
            method: 'GET',
            data: {
                page: 0,
                size: 1000,
                enable: 1,
                indexShow: '1',
                sort: 'top,desc'
            },
            success(res) {

                if (that.data.page === 0) {
                    that.setData({
                        totalElements: res.data.totalElements,
                        activeList: res.data.content,
                        page: that.data.page + 1
                    });
                } else {
                    that.setData({
                        totalElements: res.data.totalElements,
                        activeList: that.data.activeList.concat(res.data.content,),
                        page: that.data.page + 1
                    });
                }
                that.setData({
                    isLoad: false
                })
            }
        })
    },
    activeDetail(event) {
        wx.getStorage({
            key: 'userInfo',
            success(res) {
                let item = event.currentTarget.dataset.item;
                if (item.activeType === '0') {
                    wx.navigateTo({
                        url: "/pages/active/detailTalk/index?id=" + item.id
                    });
                } else if (item.activeType === '1') {
                    wx.navigateTo({
                        url: "/pages/active/detailStep/index?id=" + item.id
                    });
                } else {
                    console.log("/pages/active/specialActive/index?id=" + item.specialId + "&activeId=" + item.id + "&attTimes=" + item.attendanceTimes + "&activeName=" + item.activeName + "&logo=" + item.activeLogo)
                    wx.navigateTo({
                        url: "/pages/active/specialActive/index?id=" + item.specialId + "&activeId=" + item.id + "&attTimes=" + item.attendanceTimes + "&activeName=" + item.activeName + "&logo=" + item.activeLogo
                    });
                }
            }, fail(res) {
                wx.navigateTo({
                    url: '/pages/my/login/login'
                })
            }
        })
    },
    imageClick(event) {
        let url = event.currentTarget.dataset.url;
        if (url !== null) {
            wx.getStorage({
                key: 'userInfo',
                success(res) {
                    if (url.search('in#@') != -1) {
                        wx.navigateTo({
                            url: url.slice(4, url.length)
                        });
                    } else if (url.search('out#@') != -1) {
                        wx.navigateTo({
                            url: '/pages/webView/webView/index?src=' + url.slice(5, url.length)
                        });
                    } else if (url.search('wxApp') != -1) {
                        let split = [];
                        split = url.split('-');
                        wx.navigateToMiniProgram({
                            appId: split[1],
                            path: split[2],
                            extraData: {
                                roomId: split[0]
                            },
                            envVersion: 'trial',
                            success(res) {
                                // wx.showToast({
                                //   title: split[0]
                                // })
                            }, fail(res) {
                                // console.log(res)
                                // wx.showToast({
                                //   title: '系统错误!',
                                //   icon: 'none'
                                // })
                            }
                        })
                    }
                }, fail(res) {
                    wx.navigateTo({
                        url: '/pages/my/login/login'
                    })
                }
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
        wx.setTabBarStyle({
            color: '#AFAFAF',
            selectedColor: '#F86564',
            backgroundColor: '#ffffff',
            borderStyle: 'white'
        });
        this.getStepInfo();
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
        this.setData({
            page: 0
        })
        this.onLoad();
        setTimeout(() => {
            wx.stopPullDownRefresh()
        }, 1000)
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        let that = this
        let pages = parseInt(that.data.totalElements / that.data.size);
        if (pages > that.data.page - 1) {
            that.getActive();
        }
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        // return {
        //     path: '/pages/active/home/index',
        // }
    },

    onShareTimeline() {
    },
})
