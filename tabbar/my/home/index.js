//获取应用实例
const app = getApp()
const url = require('../../../utils/url')
const util = require('../../../utils/util')

// pages/find/home/index.js
Page({

    /**
     * 页面的初始数据
     */
    data: {

        TabCur: 0,
        scrollLeft: 0,
        StatusBar: app.globalData.StatusBar,
        CustomBar: app.globalData.CustomBar,
        loadProgress: 0,
        motto: 'Hi 开发者！',
        userInfo: {
            id: "id"
        },
        hasUserInfo: false,
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
        PageCur: 'live',
        tabList: ['已订阅直播', '喜欢的视频'],
        tabShow: 0,
        modalName: '',

        myLive: [],
        videoLikeList: [],
        remindLive: [],
        videoList: [],
        mySubscriptionNum: 0,
        fansNum: 0,
        likeNum: 0,
        CHBeanNum: 0,

        size: 10,

        remindPage: 0,
        remindTotal: 0,

        likePage: 0,
        likeTotal: 0,

        myVideoPage: 0,
        myVideoTotal: 0,

        myLivePage: 0,
        myLiveTotal: 0,

        isSLiveLoad: true,
        isLikeLoad: true,
        isVideoLoad: true,
        isLiveLoad: true,

        isSLiveLoadShow: true,
        isLikeLoadShow: false,
        isVideoLoadShow: false,
        isLiveLoadShow: false,


        typeList: [],
        typeName: null,
        typeLikeList: [],
        typeLikeName: null
    },
    loadProgress() {
        this.setData({
            loadProgress: this.data.loadProgress + 10
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

    //弹窗
    showModal(e) {
        let message = e.currentTarget.dataset.item;
        console.log(message)
        let livingW = message.liveWxId;
        let split = [];
        if (livingW !== null) {
            split = livingW.split('-');
        }
        if (split[3] === 'wxApp') {
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
        } else if (message.liveImgUrl !== null && message.liveImgUrl !== "") {
            this.setData({
                modalName: 'QRCode',
                QRCode: message.liveImgUrl
            })
        } else {
            if (message.liveKUrl !== null || message.liveDUrl !== null) {
                this.setData({
                    modalName: e.currentTarget.dataset.target,
                    clickItem: e.currentTarget.dataset.item,
                    live: e.currentTarget.dataset.live,
                })
            } else {
                wx.navigateTo({
                    url: 'plugin-private://wx2b03c6e691cd7370/pages/live-player-plugin?room_id=' + message.liveWxId
                })
            }
        }
    },
    //弹窗
    showModal2(e) {
        this.setData({
            modalName: e.currentTarget.dataset.target,
            clickItem: e.currentTarget.dataset.item,
            live: e.currentTarget.dataset.live,
        })

    },
    hideModal(e) {
        this.setData({
            modalName: null
        })
    },
    copyUrl(e) {
        let that = this;
        let url = '';
        let toast = ''
        console.log(e.currentTarget.dataset.type)
        if (e.currentTarget.dataset.type === 'k') {
            url = that.data.clickItem.liveKUrl;
            toast = '打开快手观看'
        } else {
            url = that.data.clickItem.liveDUrl;
            toast = '打开抖音观看'
        }
        console.log(url)
        //获取剪切板内容
        wx.getClipboardData({
            success(res) {
                wx.setClipboardData({
                    data: url,
                    success(res) {
                        wx.showToast({
                            title: toast
                        })
                    }
                })
            }
        });
        this.hideModal();
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let that = this

        // 在组件实例进入页面节点树时执行
        // if (app.globalData.userInfo) {
        wx.getStorage({
            key: "userInfo",
            success(res) {
                that.setData({
                    // userInfo: res.data,
                    hasUserInfo: true
                })
                wx.request({
                    url: url.userInfo + res.data.id,
                    method: "GET",
                    success(res) {
                        let user = res.data;
                        console.log("user", user)
                        that.setData({
                            mySubscriptionNum: util.makeFriendly(user.mySubscriptionNum),
                            fansNum: util.makeFriendly(user.fansNum),
                            likeNum: util.makeFriendly(user.likeNum),
                            CHBeanNum: util.makeFriendly(user.chbeanNum / 100),
                            userInfo: user
                        });
                    }
                })
                // //查询我的直播
                // wx.request({
                //   url: url.live,
                //   method: 'GET',
                //   data: {
                //     userId: res.data.id,
                //     enable: "1"
                //   }, success(res) {
                //     console.log(res)
                //     that.setData({
                //       myLive: res.data.content
                //     })
                //   }
                // })
                // 查询我订阅的直播
                that.remindLive(res)
            },
            fail(res) {
                that.setData({
                    hasUserInfo: false,
                    isSLiveLoad: false
                })
            }
        });
        // }
        // else {
        //   that.setData({
        //     hasUserInfo: false,
        //     isSLiveLoad: false
        //   })
        // }
        // else {
        //   // 在没有 open-type=getUserInfo 版本的兼容处理
        //   wx.getUserInfo({
        //     success: res => {
        //       app.globalData.userInfo = res.userInfo
        //       this.setData({
        //         userInfo: res.userInfo,
        //         hasUserInfo: true
        //       })
        //     }
        //   })
        // }
    },
    remindLive(res) {
        let that = this;
        // 查询我订阅的直播
        wx.request({
            url: url.remindInfo,
            method: 'GET',
            data: {
                userId: res.data.id,
                page: that.data.remindPage,
                size: that.data.size,
                sort: 'createTime,desc'
            }, success(res) {
                let content = res.data.content;
                content.forEach(f => {
                    f.liveInfo.sTime = util.formatMonthDayHourMinute(new Date(f.liveInfo.startTime));
                })
                console.log(content)
                that.setData({
                    remindLive: content,
                    remindTotal: res.data.totalElements,
                    isSLiveLoad: false
                })
            }
        })
        that.setData({
            isSLiveLoad: false
        })
    },
    getRemindLive(res) {
        let that = this;
        that.setData({
            remindPage: that.data.remindPage + 1
        })
        // 查询我订阅的直播
        wx.request({
            url: url.remindInfo,
            method: 'GET',
            data: {
                userId: that.data.userInfo.id,
                page: that.data.remindPage,
                size: that.data.size,
                sort: 'createTime,desc'
            }, success(res) {
                let content = res.data.content;
                content.forEach(f => {
                    f.liveInfo.sTime = util.formatMonthDayHourMinute(new Date(f.liveInfo.startTime))
                    console.log(f)
                })
                that.setData({
                    remindLive: that.data.remindLive.concat(content),
                    isSLiveLoad: false,
                })
            }
        })
    },
    liveList() {
        let time = new Date().getTime()
        let that = this;
        //查询我的直播
        that.setData({
            myLivePage: 0,
        })
        wx.request({
            url: url.live,
            method: 'GET',
            data: {
                userId: that.data.userInfo.id,
                enable: "1",
                page: that.data.myLivePage,
                size: that.data.size
            }, success(res) {
                let content = res.data.content;
                content.forEach(f => {
                    f.sTime = util.formatMonthDayHourMinute(new Date(f.startTime))
                })
                console.log(content)

                that.setData({
                    myLive: content,
                    myLiveTotal: res.data.totalElements,
                    isLiveLoad: false
                })
                that.hideModal()
            }
        });
    },
    getLiveList() {
        let that = this;
        console.log(1)
        //查询我的直播
        that.setData({
            myLivePage: that.data.myLivePage + 1
        })
        wx.request({
            url: url.live,
            method: 'GET',
            data: {
                userId: that.data.userInfo.id,
                enable: "1",
                page: that.data.myLivePage,
                size: that.data.size
            }, success(res) {
                that.setData({
                    myLive: that.data.myLive.concat(res.data.content),
                    isLiveLoad: false
                })
            }
        });
    },
    start(e) {
        wx.getStorage({
            key: 'userInfo',
            success(res) {
                wx.request({
                    url: url.userInfo + res.data.id,
                    method: 'GET',
                    success(r) {
                        if (r.data.living !== 2) {
                            wx.navigateTo({
                                url: "/pages/my/startLive/index?id=" + e.currentTarget.dataset.item.id
                            });
                        } else {
                            wx.showToast({
                                title: '请先结束直播',
                                icon: 'none'
                            })
                        }
                    }
                })
            }
        })
    },
    end(e) {
        let that = this;
        wx.showLoading({
            title: '加载中',
        })
        wx.hideLoading()

        wx.request({
            url: url.live + "/endLive",
            method: "GET",
            data: {
                userId: that.data.userInfo.id,
                liveId: that.data.live.id
            },
            success(r) {
                that.liveList()
                // that.onShow()
                wx.showToast({
                    title: "结束直播",
                    icon: "none"
                })
                that.hideModal()
            }
        })
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        let that = this;
        wx.getStorage({
            key: "userInfo",
            success(res) {
                wx.getStorage({
                    key: 'userPhone',
                    success(res) {
                        console.log(res);
                    }, fail(res) {
                        that.setData({
                            modalName: 'phone'
                        })
                    }
                })
            }
        })

    },
    tabSelect(e) {
        let that = this;
        this.loadProgress()
        wx.getStorage({
            key: "userInfo",
            success(res) {
                let id = e.currentTarget.dataset.id;

                that.setData({
                    remindPage: 0,
                    remindTotal: 0,

                    likePage: 0,
                    likeTotal: 0,

                    myVideoPage: 0,
                    myVideoTotal: 0,

                    myLivePage: 0,
                    myLiveTotal: 0,
                })
                //已订阅直播
                if (id === 0) {
                    that.setData({
                        isSLiveLoadShow: true,
                        isLikeLoadShow: false,
                        isVideoLoadShow: false,
                        isLiveLoadShow: false
                    })
                    // 查询我订阅的直播
                    wx.request({
                        url: url.remindInfo,
                        method: 'GET',
                        data: {
                            userId: res.data.id,
                            page: that.data.remindPage,
                            size: that.data.size,
                            sort: 'createTime,desc'
                        }, success(res) {
                            let content = res.data.content;
                            content.forEach(f => {
                                f.liveInfo.sTime = util.formatMonthDayHourMinute(new Date(f.liveInfo.startTime))
                                console.log(f)
                            })
                            that.setData({
                                remindLive: content,
                            })
                        }
                    })
                }
                if (id === 3) {
                    that.setData({
                        isSLiveLoadShow: false,
                        isLikeLoadShow: false,
                        isVideoLoadShow: false,
                        isLiveLoadShow: true
                    })
                    that.liveList(res);
                }
                if (id === 1) {
                    that.setData({
                        isSLiveLoadShow: false,
                        isLikeLoadShow: true,
                        isVideoLoadShow: false,
                        isLiveLoadShow: false
                    })
                    // 查询 视频类型
                    wx.request({
                        url: url.video + '/getTypeByLikeId',
                        method: 'GET',
                        data: {
                            userId: that.data.userInfo.id
                        }, success(res) {
                            let typeData = [];
                            let types = [];
                            types = res.data;
                            typeData = typeData.concat({
                                name: '全部',
                                color: 'F86564'
                            })
                            for (let name in types) {
                                console.log("name", types[name])
                                typeData = typeData.concat({
                                    name: types[name],
                                    color: 'gray'
                                })

                            }
                            console.log("getTypeByLikeId", typeData);
                            that.setData({
                                typeLikeList: typeData
                            })
                        }
                    })

                    //查询我喜欢的视频
                    wx.request({
                        url: url.videoLikeInfo,
                        method: 'GET',
                        data: {
                            userId: res.data.id,
                            enable: '1',
                            page: that.data.likePage,
                            size: that.data.size
                        }, success(res) {
                            let l = res.data.content;
                            l.forEach(f => {
                                f.videoInfo.createTime = util.formatMonthDay(new Date(f.videoInfo.createTime))
                            })
                            that.setData({
                                videoLikeList: l,
                                likeTotal: res.data.totalElements,
                                isLikeLoad: false
                            })

                        }
                    })
                }
                if (id === 2) {
                    that.setData({
                        isSLiveLoadShow: false,
                        isLikeLoadShow: false,
                        isVideoLoadShow: true,
                        isLiveLoadShow: false
                    })
                    //查询 视频类型
                    wx.request({
                        url: url.video + '/getTypeByUserId',
                        method: 'GET',
                        data: {
                            userId: res.data.id
                        }, success(res) {
                            let typeData = [];
                            let types = [];
                            types = res.data;
                            typeData = typeData.concat({
                                name: '全部',
                                color: 'F86564'
                            })
                            for (let name in types) {
                                console.log("name", types[name])
                                typeData = typeData.concat({
                                    name: types[name],
                                    color: 'gray'
                                })

                            }
                            that.setData({
                                typeList: typeData
                            })
                        }
                    })


                    wx.request({
                        url: url.video,
                        method: 'GET',
                        data: {
                            userId: res.data.id,
                            enable: '1',
                            page: that.data.myVideoPage,
                            size: that.data.size,
                            sort: 'createTime,desc'

                        }, success(res) {
                            let l = res.data.content;
                            l.forEach(f => {
                                f.createTime = util.formatMonthDay(new Date(f.createTime))
                            })
                            that.setData({
                                videoList: l,
                                myVideoTotal: res.data.totalElements,
                                isVideoLoad: false
                            })
                        }
                    })
                }
            }
        })

        this.setData({
            TabCur: e.currentTarget.dataset.id,
            scrollLeft: (e.currentTarget.dataset.id - 1) * 60,
            tabShow: e.currentTarget.dataset.id,
        })
    },


    // selectBar: function (e) {
    //   let that = this;
    //
    //   console.log(e)
    //   this.setData({
    //     // barIndex: e.currentTarget.dataset.id,
    //     page: 0,
    //     TabCur: e.currentTarget.dataset.id,
    //     scrollLeft: (e.currentTarget.dataset.id - 1) * 60,
    //     tabShow: e.currentTarget.dataset.id,
    //     ringType: that.data.tabList[e.currentTarget.dataset.id]
    //
    //     // barScrollLeft: (e.currentTarget.dataset.index - 1) * (res[0].width / this.data.barList.length)
    //   })
    //   // const query = wx.createSelectorQuery()
    //   // query.select('#tabId2').boundingClientRect()
    //   // query.exec((res) => {
    //   //
    //   // })
    //   this.getData()
    // },


    getLikeList() {
        let that = this;
        //查询我喜欢的视频
        that.setData({
            likePage: that.data.likePage + 1
        })
        wx.request({
            url: url.videoLikeInfo,
            method: 'GET',
            data: {
                userId: that.data.userInfo.id,
                enable: '1',
                page: that.data.likePage,
                size: that.data.size
            }, success(res) {
                let l = res.data.content;
                l.forEach(f => {
                    f.videoInfo.createTime = util.formatMonthDay(new Date(f.videoInfo.createTime))
                })
                that.setData({
                    videoLikeList: that.data.videoLikeList.concat(l),
                    isLikeLoad: false
                })
            }
        })
    },
    getMyVideo() {
        let that = this;
        that.setData({
            myVideoPage: that.data.myVideoPage + 1
        })
        let typeName = that.data.typeName;
        console.log("that.data.typeName", typeName);
        let data1 = {};
        if (typeName === null || typeName === '全部') {
            data1 = {
                userId: that.data.userInfo.id,
                enable: '1',
                page: that.data.myVideoPage,
                size: that.data.size,
                sort: 'createTime,desc'
            };
        } else {
            data1 = {
                userId: that.data.userInfo.id,
                enable: '1',
                page: that.data.myVideoPage,
                size: that.data.size,
                videoTypeName: typeName,
                sort: 'createTime,desc'
            }
        }
        wx.request({
            url: url.video,
            method: 'GET',
            data: data1,
            success(res) {
                let l = res.data.content;
                l.forEach(f => {
                    f.createTime = util.formatMonthDay(new Date(f.createTime))
                })
                that.setData({
                    videoList: that.data.videoList.concat(l),
                    isVideoLoad: false
                })
            }
        });
    },
    type: function (e) {
        let that = this
        let typeName = e.currentTarget.dataset.name;
        console.log("typeName", typeName);
        console.log("index", e.currentTarget.dataset.index);
        let typeL = this.data.typeList;

        typeL.forEach((item, index) => {
            if (index === e.currentTarget.dataset.index) {
                item.color = 'F86564';
            } else {
                item.color = 'gray';
            }
        })
        let data1 = {}

        if (typeName === '全部') {
            this.setData({
                typeName: null,
                myVideoPage: 0,
                typeList: typeL
            });
            data1 = {
                userId: that.data.userInfo.id,
                enable: '1',
                page: that.data.myVideoPage,
                size: that.data.size,
                sort: 'createTime,desc'
            };
        } else {
            this.setData({
                typeName: typeName,
                myVideoPage: 0,
                typeList: typeL
            });
            data1 = {
                userId: that.data.userInfo.id,
                enable: '1',
                videoTypeName: typeName,
                page: that.data.myVideoPage,
                size: that.data.size,
                sort: 'createTime,desc'
            }
        }
        console.log("data1", data1);
        wx.request({
            url: url.video,
            method: 'GET',
            data: data1,
            success(res) {
                let l = res.data.content;
                console.log(l)
                l.forEach(f => {
                    f.createTime = util.formatMonthDay(new Date(f.createTime))
                })
                that.setData({
                    videoList: l,
                    myVideoTotal: res.data.totalElements,
                    isVideoLoad: false
                })
            }
        })
    },
    typeLike: function (e) {
        let that = this
        let typeName = e.currentTarget.dataset.name;
        console.log("index", e.currentTarget.dataset.index);
        let typeL = this.data.typeLikeList;

        typeL.forEach((item, index) => {
            if (index === e.currentTarget.dataset.index) {
                item.color = 'F86564';
            } else {
                item.color = 'gray';
            }
        })
        let data1 = {}

        if (typeName === '全部') {
            this.setData({
                typeLikeName: typeName,
                likePage: 0,
                typeLikeList: typeL
            });
            data1 = {
                userId: that.data.userInfo.id,
                enable: '1',
                page: that.data.likePage,
                size: that.data.size,
                sort: 'createTime,desc'
            };
        } else {
            this.setData({
                typeLikeName: null,
                likePage: 0,
                typeLikeList: typeL
            });
            data1 = {
                userId: that.data.userInfo.id,
                enable: '1',
                videoTypeName: typeName,
                page: that.data.likePage,
                size: that.data.size,
                sort: 'createTime,desc'
            }
        }
        // console.log("data1", data1);
        //查询我喜欢的视频
        wx.request({
            url: url.videoLikeInfo,
            method: 'GET',
            data: data1,
            success(res) {
                let l = res.data.content;
                l.forEach(f => {
                    f.videoInfo.createTime = util.formatMonthDay(new Date(f.videoInfo.createTime))
                })
                that.setData({
                    videoLikeList: l,
                    likeTotal: res.data.totalElements,
                    isLikeLoad: false
                })

            }
        })
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
        this.loadProgress()
        let that = this;

        // wx.getUserInfo({
        //     success(res) {
        wx.getStorage({
            key: "userInfo",
            success(res) {
                wx.request({
                    url: url.userInfo + res.data.id,
                    method: "GET",
                    success(res) {
                        let data1 = res.data;
                        console.log("data1", data1)
                        if (data1.official === 1 || data1.certification === 1) {
                            that.setData({
                                tabList: ['已订阅直播', '喜欢的视频', '我的作品', '我的直播']
                            });
                        }
                        that.setData({
                            userInfo: res.data,
                            hasUserInfo: true,
                            loadProgress: 100
                        })
                    }
                })
            },
            fail(res) {
                console.log(res)
                that.setData({
                    hasUserInfo: false
                })
            }
        })
        // },
        // fail(res) {
        //   that.setData({
        //     hasUserInfo: false
        //   })
        // }
        // })
        // console.log(123)
        // wx.getStorage({
        //   key:"userInfo",
        //   success(res) {
        //     console.log(res.data)
        //     that.setData({
        //       userInfo: res.data,
        //       hasUserInfo: true
        //     })
        //   },
        //   fail(res) {
        //     console.log("未授权")
        //   }
        // })
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
        this.onLoad();
        setTimeout(() => {
            wx.stopPullDownRefresh()
        }, 1000)
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        let that = this;
        // console.log(that.data.userInfo)
        let tabShow = that.data.tabShow
        if (tabShow === 0) {
            let pages = parseInt(that.data.remindTotal / that.data.size);
            if (pages > that.data.remindPage) {
                that.setData({
                    isSLiveLoad: true
                })
                that.getRemindLive();
            }
        } else if (tabShow === 1) {
            let pages = parseInt(that.data.likeTotal / that.data.size);
            if (pages > that.data.likePage) {
                that.setData({
                    isLikeLoad: true
                })
                that.getLikeList();
            }
        } else if (tabShow === 2) {
            let pages = parseInt(that.data.myVideoTotal / that.data.size);
            console.log(pages)
            console.log(that.data.myVideoPage)
            if (pages > that.data.myVideoPage) {
                that.setData({
                    isVideoLoad: true
                })
                that.getMyVideo();
            }
        } else if (tabShow === 3) {
            let pages = parseInt(that.data.myLiveTotal / that.data.size);
            console.log(pages)
            if (pages > that.data.myLivePage) {
                that.setData({
                    isLiveLoad: true
                })
                that.getLiveList();
            }
        }
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        return {
            title: '新鲜有滋味',
            path: '/pages/my/home/index',
        }
    },
    getPhoneNumber(e) {
        let that = this;
        wx.getStorage({
            key: 'userInfo',
            success(r) {
                wx.login({
                    success: res => {
                        let l = res;
                        wx.request({
                            url: url.setPhone,
                            method: 'GET',
                            data: {
                                code: l.code,
                                openid: r.data.openid,
                                encryptedData: e.detail.encryptedData,
                                iv: e.detail.iv
                            },
                            success(res) {
                                wx.setStorage({
                                    key: 'userPhone',
                                    data: res.data.phone
                                })
                                that.hideModal();
                            }
                        })
                    }
                })
            }
        })

    },
    goOrder() {
        // if (this.data.hasLogin) {
        try {
            wx.setStorageSync('tab', 0);
        } catch (e) {

        }
        wx.navigateTo({
            url: "/pages/goods/ucenter/order/order"
        });
        // } else {
        //   wx.navigateTo({
        //     url: "/pages/auth/login/login"
        //   });
        // }
    },
    goAddress() {
        wx.navigateTo({
            url: "/pages/goods/ucenter/address/address"
        });
    }
})



