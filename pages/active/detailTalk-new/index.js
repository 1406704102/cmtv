// pages/active/detailTalk-new/index.js
const url = require('../../../utils/url')
const app = getApp();
const util = require('../../../utils/util')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        activeInfo: {},
        activeId: 'ad1479772e844e68a91be95dc80a1ce2',
        userInfo: {},
        TabCur: 1,
        scrollLeft: 0,
        tabList: ['最新', '最热'],
        dataList: [],
        leftList: [], //左列
        rightList: [], //右列
        labels: [],
        join: '0',
        op: {
            defaultExpandStatus: true,
            columns: 2,
            imageFillMode: 'widthFix',
        },

        markNum: 0,
        viewNum: 0,

        sign: 0,//0显示;1不显示
        share: 0,

        page: 0,
        size: 10,
        totals: 0,
        isLoad: true,
        sort: 'isTop,likeNum,desc',
        modalName: '',

        timeline: 0,

        CustomBar: app.globalData.CustomBar,
        isFixed: false,
        idTop: 0,
        bgImage: '',
        color: 'white',
        p: false

        // sort: 'likeNum,desc'
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log(options)
        const that = this;
        this.getIdTop()

        if (options.share) {
            that.setData({
                share: 1
            })
        }
        if (options.timeline) {

            wx.request({
                url: url.activeAttTalk,
                method: 'get',
                data: {
                    activeId: options.id,
                    page: that.data.page,
                    size: that.data.size,
                    enable: 1,
                    sort: that.data.sort
                },
                success(res) {
                    console.log(123)
                    let page = that.data.page;
                    var dataList = res.data.content;
                    dataList.forEach(f => {
                        f.content = f.attDetail;
                        f.likedCount = f.likeNum;
                        f.time = f.createTime;
                        var user = {}
                        user.userId = f.userId;
                        user.username = f.userName;
                        user.avatar = f.userAvatar;
                        f.user = user;
                        if (f.attPic !== null) {

                            var images = [];
                            images.push(f.attPic)

                            f.images = images;
                        }
                    })
                    if (page === 0) {
                        that.setData({
                            dataList: dataList,
                            page: page + 1,
                            totals: res.data.totalElements,
                            isLoad: false
                        });
                    } else {
                        that.setData({
                            dataList: that.data.dataList.concat(dataList),
                            page: page + 1,
                            isLoad: false
                        });
                    }
                }
            })
        }


        that.setData({
            activeId: options.id
        });

        //查询 活动数据
        wx.request({
            url: url.activeInfoTalkNew + '/byId',
            method: 'get',
            data: {
                id: options.id,
                // id:'ad1479772e844e68a91be95dc80a1ce2'
            },
            success(res) {
                var data1 = res.data;
                //需要报名的活动
                if (data1.signUp === '1') {
                    wx.getStorage({
                        key: 'userInfo',
                        success(res) {
                            wx.request({
                                url: url.userInfo + res.data.id,
                                method: 'get',
                                success(res) {
                                    console.log('userInfo', res.data);
                                    //没有报名信息 不显示按钮
                                    if (res.data.signInformation === null) {
                                        that.setData({
                                            sign: 1
                                        })
                                    }
                                }
                            })
                        }
                    });
                }
                //活动为开始
                if (data1.starting === '0') {

                }


                //需要报名的活动
                // if (data1.activeName.indexOf("#") < 0) {
                //   if (data1.activeName.indexOf("*") > 0) {
                //     wx.getStorage({
                //       key: 'userInfo',
                //       success(res) {
                //         wx.request({
                //           url: url.userInfo + res.data.id,
                //           method: 'get',
                //           success(res) {
                //             console.log('userInfo', res.data);
                //             if (res.data.signInformation !== null) {
                //               that.setData({
                //                 sign: 1
                //               })
                //             }
                //           }
                //         })
                //       }
                //     });
                //
                //     data1.activeName = data1.activeName.replace("*", '');
                //   }
                // } else {
                //   if (data1.activeName.indexOf("*") > 0) {
                //     data1.activeName = data1.activeName.replace("*", '');
                //   }
                //   that.setData({
                //     sign: 1
                //   });
                // }

                let label = data1.label;
                var labels = label.split(",");

                that.setData({
                    labels: labels,
                    activeInfo: data1
                })
            }
        })

        // that.getAttData();

    },
    tabSelect(e) {
        var optionalParams = e.currentTarget.dataset.id;

        console.log("e.currentTarget.dataset.id", optionalParams);
        this.setData({
            TabCur: optionalParams,
            scrollLeft: (optionalParams - 1) * 60,
            dataList: [],
            isLoad: true,
            page: 0
        })
        if (optionalParams === 0) {
            this.setData({
                sort: 'isTop,createTime,desc',
                page: 0
            })
        } else {
            this.setData({
                sort: 'isTop,likeNum,desc',
                page: 0
            })
        }
        this.getAttData()
    },
    getAttData() {
        const that = this;
        wx.getStorage({
            key: 'userInfo',
            success(res) {
                wx.request({
                    url: url.activeAttTalk,
                    method: 'get',
                    data: {
                        activeId: that.data.activeId,
                        page: that.data.page,
                        size: that.data.size,
                        userId2: res.data.id,
                        enable: 1,
                        sort: that.data.sort
                    },
                    success(res) {
                        let page = that.data.page;
                        var dataList = res.data.content;
                        dataList.forEach(f => {
                            f.content = f.attDetail;
                            f.likedCount = f.likeNum;
                            f.time = f.createTime;
                            var user = {}
                            user.userId = f.userId;
                            user.username = f.userName;
                            user.avatar = f.userAvatar;
                            f.user = user;
                            if (f.attPic !== null) {

                                var images = [];
                                images.push(f.attPic)

                                f.images = images;
                            }
                        })
                        if (page === 0) {
                            that.setData({
                                dataList: dataList,
                                page: page + 1,
                                totals: res.data.totalElements,
                                isLoad: false
                            });
                        } else {
                            that.setData({
                                dataList: that.data.dataList.concat(dataList),
                                page: page + 1,
                                isLoad: false
                            });
                        }
                    }
                })
            }
        })
    },
    doMark() {
        let that = this;
        let activeInfo = that.data.activeInfo;
        console.log("activeInfo,", activeInfo);
        if (that.data.activeInfo.starting === '1') {

            if (that.data.join === '0') {
                that.join();
                console.log("还没有报名");
            } else {
                wx.navigateTo({
                    url: "/pages/active/attTalk/index?id=" + activeInfo.id + "&name=" + activeInfo.activeName + "&new=1&activeStatement=" + activeInfo.activeStatement
                });
            }
        } else {
            wx.showToast({
                title: '暂时无法发表话题',
                icon: 'none'
            })
        }
    },
    join(event) {
        let that = this;
        let activeInfo = that.data.activeInfo;

        wx.showLoading({
            title: '请稍后...'
        });
        wx.request({
            url: url.activeJoin + '/join',
            method: 'POST',
            data: {
                activeId: that.data.activeId,
                // activeId: 'ad1479772e844e68a91be95dc80a1ce2',
                activeName: that.data.activeInfo.activeName,
                userId: that.data.userInfo.id,
                userName: that.data.userInfo.nickname,
                userAvatar: that.data.userInfo.avatar,
                openId: that.data.userInfo.openid
            }, success(res) {
                that.setData({
                    join: '1'
                })
                wx.navigateTo({
                    url: "/pages/active/attTalk/index?id=" + activeInfo.id + "&name=" + activeInfo.activeName + "&new=1"
                })
            }, complete(res) {
                wx.hideLoading();
            }
        })
    },
    hideModal() {
        this.setData({
            modalName: ''
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
        const that = this;
        console.log("onShow")
        that.setData({
            page: 0
        })
        let userId = "";
        wx.getStorage({
            key: 'userInfo',
            success(res) {
                userId = res.data.id;
                that.setData({
                    userInfo: res.data
                })
                //查询是否参加
                wx.request({
                    url: url.activeJoin + '/findByAIdAndUId',
                    method: "GET",
                    data: {
                        activeId: that.data.activeId,
                        // activeId: 'ad1479772e844e68a91be95dc80a1ce2',
                        userId: res.data.id,
                    }, success(res) {

                        if (res.data !== '') {
                            that.setData({
                                join: '1',
                                activeJoin: res.data
                            });
                        } else {
                            that.setData({
                                modalName: 'Image'
                            });
                        }
                    }
                })
                that.getAttData();

            }, fail(res) {
                wx.navigateTo({
                    url: '/pages/my/login/login?type=1&id=' + that.data.activeId
                });
            }

        })

        //和打卡数
        //获取浏览数
        wx.request({
            url: url.activeAttTalk + '/getViewPlusOne',
            method: 'get',
            data: {
                activeId: that.data.activeId
            }, success(res) {
                that.setData({
                    viewNum: res.data
                })
            }
        })
        wx.request({
            url: url.activeAttTalk + '/getMarkPlusOne',
            method: 'get',
            data: {
                activeId: that.data.activeId
            }, success(res) {
                that.setData({
                    markNum: res.data
                })
            }
        })

    },
    toWinner() {
        var winnerPic = this.data.activeInfo.winnerPic;
        if (winnerPic !== null && winnerPic !== '') {
            wx.navigateTo({
                url: '/pages/active/activeDetailNew/index?pic=' + winnerPic + '&type=winner'
            });
        } else {
            wx.showToast({
                title: '获奖名单未公布',
                icon: 'none'
            })
        }
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
        let pages = parseInt(that.data.totals / that.data.size);
        if (pages > that.data.page - 1) {
            that.setData({
                isLoad: true
            })
            that.getAttData();

        }
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        let active = this.data.activeInfo;
        return {
            title: active.activeName,
            path: '//pages/active/detailTalk-new/index?id=' + active.id + '&share=' + 1,
            imageUrl: active.activeLogo
        }
    },
    onShareTimeline() {
        let active = this.data.activeInfo;
        return {
            query: 'id=' + active.id + '&timeline=1&share=' + 1
        }
    },
    // 监听屏幕滚动 判断上下滚动 bindscroll
    onPageScroll: function (ev) {
        if (ev.scrollTop >= this.data.idTop - this.data.CustomBar) {
            if (!this.data.p) {

                this.setData({
                    bgImage: 'http://cmtv.xmay.cc/image/live/bg_01.png',
                    p: true
                });
                // wx.setNavigationBarColor({
                //     frontColor: '#000000',
                //     backgroundColor: ''
                // });

            }


        } else {
            if (this.data.p) {
                this.setData({
                    bgImage: '',
                    p: false
                })
                // wx.setNavigationBarColor({
                //     frontColor: '#ffffff',
                //     backgroundColor: ''
                // })
            }

        }

    },
    getIdTop: function () {
        const query = wx.createSelectorQuery()
        query.select('#pj').boundingClientRect()
        query.selectViewport().scrollOffset()
        query.exec(res => {
            let miss = res[1].scrollTop + res[0].top
            this.setData({
                idTop: miss
            })
        })
    },
})
