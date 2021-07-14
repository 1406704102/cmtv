// pages/quarterly//email/home/index.js
var util = require('../../../../shopConfig/util.js');
var url = require('../../../../utils/url.js');
var dateUtil = require('../../../../utils/util.js');
const app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        emailList: [],
        userInfo: {
            id: ''
        },
        typeArr: [{
            name: '树洞',
            english: '· secret ·'
        }, {
            name: '慢邮件',
            english: '· Snail Mail ·'
        }],
        isTypeNew: false,
        isPopup: false,
        typeIndex: 0,

        tagArr: ['时间', '点赞'],
        tagIndex: 0,

        isHideLoadMore: true,
        isLoad: false,
        isLoadShow: true,
        StatusBar: app.globalData.StatusBar,
        CustomBar: app.globalData.CustomBar,
        isFixed: false,
        idTop: 0,
        loadProgress: 0,
        page: 0,
        size: 8,
        total: 0,
        date: '',
        sort: 'createTime,desc',
        emailType: '1',
        send: null,
        share: 0,
        text: '返回',
        emailId: '',
        img: '',
        sendTime: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let that = this;
        this.getIdTop()
        wx.request({
            url: url.openEmailSetting,
            method: 'GET',
            success(res) {
                that.setData({
                    img: res.data.content[0].homeImg
                })
            }
        })
        if (options.share === "1") {
            console.log(options)
            that.setData({
                share: 1,
                text: '主页'
            })
        }
        wx.getStorage({
            key: 'userInfo',
            success(res) {
                that.setData({
                    userInfo: res.data
                })
                //查询 是否有未读
                wx.request({
                    url: url.openEmailUserSend,
                    method: 'GET',
                    data: {
                        userId: res.data.id,
                        isRead: '0'
                    }, success(res) {
                        console.log(res.data.totalElements)
                        if (res.data.totalElements > 0) {
                            that.setData({
                                isTypeNew: true,
                                // typeIndex: 1
                            })
                        }
                    }
                })
                if (options.send !== undefined) {
                    that.setData({
                        send: options.send,
                        // emailType: options.emailType + '',
                        // typeIndex: parseInt(options.typeIndex),
                        share: 1,
                        text: '主页',
                        emailId: options.emailId
                    })
                    //添加收信信息
                    wx.request({
                        url: url.openEmailUserSend,
                        method: 'POST',
                        data: {
                            emailId: options.emailId,
                            userId: res.data.id,
                            isRead: '0'
                        }
                    })
                    setTimeout(function () {
                        that.getData();
                    });

                }
            }, fail(res) {
                //id=" + item.specialId + "&activeId=" + item.id + "&attTimes=" + item.attendanceTimes + "&activeName=" + item.activeName + "&logo=" + item.activeLogo
                // send=send&emailType=0&typeIndex=1&emailId=' + that.data.email.id
                wx.navigateTo({
                    url: "/pages/my/login/login?type=email&emailId=" + options.emailId + "&send=" + options.send + "&emailType=1&typeIndex=0"
                })
            }
        })
        this.getData();

        this.setData({
            date: dateUtil.formatYearMonthDay(new Date())
        });



    },
    getData() {
        const that = this;
        that.loadProgress();
        let data = {};
        console.log(that.data.emailType, "===that.data.emailType ");
        console.log(that.data.typeIndex, "===that.data.typeIndex ");
        if (that.data.emailType === '1') {
            data = {
                page: that.data.page,
                size: that.data.size,
                emailType: that.data.emailType,
                sort: that.data.sort,
                userId: that.data.userInfo.id
            };
        } else {
            data = {
                page: that.data.page,
                size: that.data.size,
                sort: that.data.sort,
                authorId: that.data.userInfo.id,
                emailType: that.data.emailType,
                userId: that.data.userInfo.id
            };
        }
        wx.request({
            url: url.openEmailInfo,
            method: 'GET',
            data: data,
            success(res) {
                that.setData({
                    isLoad: false,
                    isLoadShow: true,
                    loadProgress: 100
                });
                wx.hideNavigationBarLoading();
                wx.stopPullDownRefresh();
                var emailList = res.data.content;

                if (that.data.emailType === '0') {
                    // for (let i = 0; i < emailList.length; i++) {
                    //
                    // }
                    that.setData({
                        total: res.data.totalElements
                    });
                    that.getRead(emailList, 0);
                } else {
                    if (that.data.page === 0) {
                        that.setData({
                            emailList: emailList,
                            total: res.data.totalElements
                        });
                    } else {
                        that.setData({
                            emailList: that.data.emailList.concat(emailList),
                            total: res.data.totalElements
                        });
                    }
                }

            }
        });
    },
    getRead(emailList, i) {
        let that = this;
        wx.request({
            url: url.openEmailUserSend,
            method: 'GET',
            data: {
                emailId: emailList[i].id,
                userId: that.data.userInfo.id
            }, success(res) {
                if (res.data.content[0] !== undefined) {

                    emailList[i].isRead = res.data.content[0].isRead;

                }
                console.log(i === emailList.length - 1)
                if (i === emailList.length - 1) {
                    if (that.data.page === 0) {
                        that.setData({
                            emailList: emailList,
                            // total: res.data.totalElements
                        });
                    } else {
                        that.setData({
                            emailList: that.data.emailList.concat(emailList),
                            // total: res.data.totalElements
                        });
                    }
                } else {
                    i++;
                    that.getRead(emailList, i);
                }
            }
        })
    },
    getData1() {
        let that = this;
        wx.request({
            url: url.openEmailUserSend,
            method: 'GET',
            data: {
                userId: that.data.userInfo.id
            }, success(res) {
                that.setData({
                    emailList: res.data.content
                })
            }
        })
    },
    sortType(e) {
        let that = this;
        if (e.detail.value) {
            that.setData({
                sort: 'createTime,desc'
            });
        } else {
            that.setData({
                sort: 'likeNum,desc'
            });
        }
        that.setData({
            page: 0
        })
        that.getData();
    },
    emailType(e) {
        let that = this;
        that.setData({
            page: 0
        })
        if (e.detail.value) {
            that.setData({
                emailType: '1'
            });
            that.getData();

        } else {
            that.setData({
                emailType: '0'
            });
            that.getData();

        }

    },
    haveNew() {
        let that = this;
        //查询 是否有未读
        wx.getStorage({
            key: 'userInfo',
            success(res) {
                wx.request({
                    url: url.openEmailUserSend,
                    method: 'GET',
                    data: {
                        userId: res.data.id,
                        isRead: '0'
                    }, success(res) {
                        if (res.data.totalElements > 0) {
                            that.setData({
                                isTypeNew: true
                            });
                        } else {
                            that.setData({
                                isTypeNew: false
                            });
                        }
                    }
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

        this.getData();
        this.haveNew()
        //查询 是否有未读
        // wx.request({
        //     url: url.openEmailUserSend,
        //     method: 'GET',
        //     data:{
        //         userId: that.data.userInfo.id,
        //         isRead: '0'
        //     }, success(res) {
        //         if (res.data.totalElements > 0) {
        //             that.setData({
        //                 isTypeNew: true
        //             })
        //         }
        //     }
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
        wx.showNavigationBarLoading();
        this.setData({
            page: 0
        })
        this.getData()
        this.haveNew()
        wx.request({
            url:url.searchInfo,
            method: 'GET',
            data:{
                searchContent: '1',
                page:0,
                size: 100
            }, success(res) {
                console.log(res)
            }
        })
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        let that = this;
        var page = parseInt(that.data.total / that.data.size);
        console.log(page + ">>" + that.data.total + "==" + this.data.page);

        if (page > that.data.page) {
            that.setData({
                isLoad: true,
                isLoadShow: true,
                page: that.data.page + 1
            });
            this.getData();
        } else {
            that.setData({
                isLoad: false,
                isLoadShow: true,
            });
        }
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        return {
            title: "慢邮件",
            path: '/pages/quarterly/email/home/index?share=' + 1
        }
    },
    onShareTimeline() {
        const that = this;
        return {
            query: 'share=1&timeline=1'
        }
    },
    loadProgress() {
        this.setData({
            loadProgress: this.data.loadProgress + 3
        })
        if (this.data.loadProgress < 100) {
            setTimeout(() => {
                this.loadProgress();
            }, 100)
        } else {
            this.setData({
                loadProgress: 0
            })
        }
    },

    // 监听屏幕滚动 判断上下滚动 bindscroll
    onPageScroll: function (ev) {
        console.log(ev.scrollTop)
        if (ev.scrollTop >= this.data.idTop - this.data.CustomBar) {
            if (!this.data.isFixed) {
                this.setData({
                    isFixed: true
                })
                wx.setNavigationBarColor({
                    frontColor: '#000000',
                    backgroundColor: ''
                })
            }
        } else {
            if (this.data.isFixed) {
                this.setData({
                    isFixed: false
                })
                wx.setNavigationBarColor({
                    frontColor: '#ffffff',
                    backgroundColor: ''
                })
            }
        }

    },
    /**
     * 设置
     * @param {*} e
     */
    changType: function (e) {
        var index = e.currentTarget.dataset.index;
        let that = this;
        that.setData({
            page: 0,
            total: 0
        })
        if (index === 0) {
            that.setData({
                emailType: '1',
                sort: 'createTime,desc',
            });
            that.getData();

        } else {
            that.setData({
                emailType: '0',
                sort: 'createTime,desc',
            });
            that.getData();

        }
        this.setData({
            typeIndex: index,
        })
    },

    /**
     * 设置
     * @param {*} e
     */
    changTag: function (e) {
        var tagIndex = e.currentTarget.dataset.index;

        let that = this;
        if (tagIndex === 0) {
            that.setData({
                sort: 'createTime,desc'
            });
        } else {
            that.setData({
                sort: 'likeNum,desc'
            });
        }
        that.setData({
            page: 0
        })
        that.getData();
        this.setData({
            tagIndex: tagIndex
        })
    },

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
    },

    /**
     * 获取滚动高度
     */
    getIdTop: function () {
        const query = wx.createSelectorQuery()
        query.select('#zmui-id').boundingClientRect()
        query.selectViewport().scrollOffset()
        query.exec(res => {
            let miss = res[1].scrollTop + res[0].top
            this.setData({
                idTop: miss
            })
        })
    },
    /**
     * 跳转写邮件
     */
    goclowwrite: function () {
        wx.navigateTo({
            url: '/pages/quarterly/email/add/index'
        })
    },
    goreadmail(e) {
        let that = this;
        var email = e.currentTarget.dataset.item;

        if (that.data.typeIndex === 1 && email.authorId !== that.data.userInfo.id && email.stime > 0 && email.emailType === '0') {

            that.setData({
                isPopup: true,
                sendTime: email.stime
            })
        } else {
            if (email.emailType === '1') {
                wx.navigateTo({
                    url: '/pages/quarterly/email/detail/index?type=' + that.data.typeIndex + '&id=' + e.currentTarget.dataset.id
                });
            } else {
                wx.navigateTo({
                    url: '/pages/quarterly/email/myDetail/index?type=' + that.data.typeIndex + '&id=' + e.currentTarget.dataset.id
                });
            }
        }
        console.log(email);
    },
    closePopup: function () {
        this.setData({
            isPopup: false
        })
    },
})
