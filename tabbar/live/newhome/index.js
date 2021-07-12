// tabbar/live/newhome/index.js
const app = getApp();

const url = require('../../../utils/url')
const util = require('../../../utils/util')

Page({

    /**
     * 页面的初始数据
     */
    data: {
        CustomBar: app.globalData.CustomBar,
        isLoad: true,
        total: 0,
        size: 10,
        page: 0,
        swiperList: [],
        ringList: [],
        videoList: [],
        barList: [
            '视频推荐',
            '草莓原创',
            '机构作品',
            '达人优选'
        ],
        barIndex: 0,
        activeNewList: [],
        activeList: [],
        HFShow: false,
        HFPic: '',
        HFAims: '',
        modalName: '',
        notLogin: false,
        indexTag: "",
        stepInfo: {
            step: 0,
            cmb: 0
        },
        columnInfos: [],


        winHeight: "", // 窗口高度
        currentTab: 0, // 预设当前项的值
        scrollLeft: 0, // tab标题的滚动条位置
        tabName: [], // tab标题的名字
        liveNum: 0,
        tagList: [],
        clickTag: {},
        scroll: true
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.getBanner()
        // this.getRing()
        // this.getData();
        this.getActiveNew()
        this.getActive()
        this.getColumnInfo();
        this.getIndexShow();
        let that = this;
        this.getWindowHeight(); // 高度自适应（rpx）
        this.getTabName(); // 获取头部导航栏tab标题的名字
        // this.getInformation(tabNum); //  获取当前选中tab标题的信息
        this.getStepInfo();
        this.getActiveShow();

        wx.getSystemInfo({
            success: function (res) {
                that.setData({
                    clientHeight: res.windowHeight
                });
            }
        })
        wx.request({
            url: url.setting,
            method: 'GET',
            success(res) {
                var contentElement = res.data.content[0];
                var show = contentElement.columnShow.split(',');
                console.log(show)
                that.setData({
                    indexTag: contentElement.indexTag,
                    show: show
                });
            }
        });
    },

    swiperchange: function (e) {
        var that = this
        console.log(e.detail.current)
        that.setData({
            'currentTab': e.detail.current
        })
    },
    getActiveShow() {
        let that = this;
        wx.request({
            url: url.activeIndexShow,
            method: "GET",
            data: {
                enable: '1',
                sort: 'top,desc'
            }, success(res) {
                var activeShow = res.data.content;
                activeShow.forEach(f => {
                    f.tag = f.tag.split(',');
                })
                that.setData({
                    activeShow: activeShow
                })
            }
        })
    },
    toActive(e) {
        var item = e.currentTarget.dataset.item;
        if (item.type === '0') {
            wx.navigateTo({
                url: '/pages/active/detailTalk-new/index?id=' + item.activeId
            })
        }
        if (item.type === '1') {
            wx.request({
                url: url.activeInfo + '/' + item.activeId,
                method: "GET",
                success(res) {
                    const active = res.data;

                    if (active !== undefined && res.statusCode === 200) {
                        wx.navigateTo({
                            url: "/pages/active/specialActive/index?id=" + active.specialId + "&activeId=" + active.id + "&attTimes=" + active.attendanceTimes + "&activeName=" + active.activeName + "&logo=" + active.activeLogo
                        });
                    } else {
                        wx.showToast({
                            title: '请稍后再试...',
                            icon: 'none'
                        })
                    }
                },
                fail(res) {
                    wx.showToast({
                        title: '请稍后再试...',
                        icon: 'none'
                    })
                }
            })

        }
        if (item.type === '2') {
            wx.navigateTo({
                url: '/pages/active/detailStep/index?id=' + item.activeId
            })
        }
    },
    getIndexShow() {
        let that = this;
        wx.request({
            url: url.userInfo + 'getIndexShow',
            method: "GET",
            success(res) {
                let data = []
                data = res.data;
                let tabName = [];
                data.forEach(f => {
                    let d = {};
                    d.name = f.nickname;
                    tabName.push(d);
                    // f.likeNum = util.makeFriendly(f.likeNum)
                    f.fansNum = util.makeFriendly(f.fansNum)
                })
                that.setData({
                    tabName: tabName,
                    indexShow: data
                })
                that.getVideoData(0);
            }
        })
    },
    getColumnInfo() {
        let that = this;
        wx.request({
            url: url.columnInfo,
            method: "GET",
            data: {
                enable: 1,
                sort: 'sortNum,desc'
            }, success(res) {
                res.data.content.forEach(f => {
                    f.viewNum = util.makeFriendly(parseInt(f.viewNum));
                })
                that.setData({
                    columnInfos: res.data.content
                })
            }
        })
    },
    //获取 步数
    getStepInfo() {

        let that = this;
        wx.getStorage({
            key: 'userInfo',
            success(r) {
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
                                            "stepInfo.step": res.data.stepInfoList[30].step,
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

                wx.request({
                    url: url.dayStep + '/getToDay',
                    method: 'GET',
                    data: {
                        userId: r.data.id,
                    }, success(res) {
                        that.setData({
                            "stepInfo.cmb": res.data.cmb,
                        })
                    }
                })

            }
        })

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
                that.setData({
                    activeNewList: res.data.content
                })
            }
        })
    },
    //获取活动(旧)
    getActive() {
        let that = this;
        //查询活动
        wx.request({
            url: url.activeInfo,
            method: 'GET',
            data: {
                enable: 1,
                indexShow: '1',
                sort: 'top,desc'
            },
            success(res) {
                that.setData({
                    activeList: res.data.content,
                });
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
    toNewDetail(e) {
        var id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: '/pages/active/detailTalk-new/index?id=' + id
        })
    },
    getData() {
        let that = this;
        var page = that.data.page;

        var type = '今日热门';
        if (that.data.barIndex !== 0) {
            type = that.data.barList[that.data.barIndex]
        }
        wx.request({
            url: url.live + '/getLiveByUserType',
            method: 'GET',
            data: {
                type: type,
                page: 0,
                size: 100
            }, success(r) {
                wx.request({
                    url: url.video + '/getVideoByUserType',
                    method: 'GET',
                    data: {
                        type: type,
                        page: that.data.page,
                        size: that.data.size
                    }, success(res) {
                        if (r.data.content.length !== 0) {
                            that.setData({
                                total: res.data.totalElements,
                                videoList: r.data.content.concat(res.data.content),
                                page: page + 1,
                                isLoad: false
                            });
                        } else {
                            that.setData({
                                total: res.data.totalElements,
                                videoList: res.data.content,
                                page: page + 1,
                                isLoad: false
                            });
                        }
                    }
                })
            }
        })
    },
    getVideo() {
        let that = this;
        var type = '今日热门';
        if (that.data.barIndex !== 0) {
            type = that.data.barList[that.data.barIndex]
        }
        wx.request({
            url: url.video + '/getVideoByUserType',
            method: 'GET',
            data: {
                type: type,
                page: that.data.page,
                size: that.data.size
            }, success(res) {
                var page = that.data.page;
                that.setData({
                    videoList: that.data.videoList.concat(res.data.content),
                    page: page + 1,
                    isLoad: false
                });
            }
        });
    },
    //获取banner
    getBanner() {
        let that = this;

        //获取banner
        wx.request({
            url: url.banner,
            method: "GET",
            data: {
                bannerType: 'live',
                enable: 1
            },
            success(res) {
                that.setData({
                    swiperList: res.data.content,
                    // bReady: false
                })
            }
        })

        //获取AD
        wx.request({
            url: url.banner,
            method: "GET",
            data: {
                bannerType: 'homeAD',
                enable: 1
            },
            success(res) {
                if (res.data.totalElements !== 0) {
                    that.setData({
                        HFPic: res.data.content[0].bannerUrl,
                        HFShow: true,
                        HFAims: res.data.content[0].bannerJumpUrl,
                        modalName: 'Image'
                    })
                }
            }
        })


    },
    tagClick(e) {
        let item = e.currentTarget.dataset.item;
        if (item.url.search('@_@!') !== -1) {
            // if (item.url.search('TikTok') !== -1) {
            //     item.liveType = '抖音';
            // } else {
            //     item.liveType = '快手';
            // }
            item.liveType = item.url.split('@_@!')[0];

            this.setData({
                modalName: 'DialogModal',
                clickTag: item
            });
        } else if (item.url.search('@_@#->') !== -1) {
            this.setData({
                QRCode: item.url.split('@_@#->')[1],
                modalName: 'QRCode'
            })
        } else if (item.url.search('wxApp') !== -1) {
            var split = item.url.split('-^');

            wx.navigateToMiniProgram({
                appId: split[1],
                path: split[2],
                extraData: {
                    name: 'args[1]'
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
            });

            // if (split.length > 3) {
            //     var args = split[3].split(',');
            //     // let extraData = {};
            //     // args.forEach(f=>{
            //     //     var arg = f.split(',');
            //     //     extraData.
            //     // })
            //     let temp = args[0];
            //     console.log("args", args);
            //
            // }

        } else {
            wx.navigateTo({
                url: item.url
            });
        }
    },
    copyUrl(e) {
        let that = this;
        let url = '';
        let toast = ''
        url = e.currentTarget.dataset.item.url.split('@_@!')[1];
        if (e.currentTarget.dataset.item.liveType === '快手') {
            toast = '打开快手观看';
        } else {
            toast = '打开抖音观看';
        }
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
//点击banner
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
                    } else if (url.search('out!#@') != -1) {
                        var user = res.data;
                        wx.navigateTo({
                            url: '/pages/webView/webView/index?openid=' + user.id + '&nickname=' + user.nickname + '&avatar=' + user.avatar + '&src=' + url.slice(6, url.length)
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
                },
                fail(res) {
                    wx.navigateTo({
                        url: '/pages/my/login/login'
                    })
                }
            })

        }
    },
    //关闭弹出框
    hideModal(e) {
        this.setData({
            modalName: null
        })
    },
    //跳转tabbar
    switchTabbar(e) {
        if (e.currentTarget.dataset.type === 'active') {
            wx.navigateTo({
                url: "/pages/active/allActive/index"
            });
        } else if (e.currentTarget.dataset.type === 'ring') {
            wx.switchTab({
                url: '/pages/ring/home/index'
            });
        }
    },
    //跳转video
    toVideo(e) {
        let item = e.currentTarget.dataset.video;
        wx.getStorage({
            key: 'userInfo',
            success(res) {
                wx.navigateTo({
                        url: "/pages/my/videoSwiper/index?id=" + item.id + "&url=" + item.videoUrl + "&name=" + item.videoName + "&userId=" + item.userId + "&type=user",
                    }
                );
            }, fail(res) {
                wx.navigateTo({
                    url: '/pages/my/login/login'
                })
            }
        })

    },
    //获取精选彩铃
    getRing() {
        let that = this;
        wx.request({
            url: url.video,
            data: {
                show: "1",
                enable: "1",
                videoTypeName: '视频彩铃',
                ringType: '热门推荐',
                sort: 'top,desc'
            }, success(res) {
                that.setData({
                    ringList: res.data.content
                })
            }
        })
    },
    // selectBar: function (e) {
    //     this.setData({
    //         barIndex: e.currentTarget.dataset.index,
    //         page: 0
    //     })
    //     this.getData()
    // },

    selectBar: function (e) {

        this.setData({
            barIndex: e.currentTarget.dataset.index,
            page: 0,
            scrollLeft: (e.currentTarget.dataset.id - 1) * 60,
        })

        // this.getData()
    },
    toUserDetail(event) {
        wx.navigateTo({url: '/pages/my/userDetail/index?id=' + event.currentTarget.dataset.item.id + event.currentTarget.dataset.tabshow})
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
        wx.getStorage({
            key: 'userInfo',
            success(res) {
                that.setData({
                    notLogin: false
                })
            },
            fail(res) {
                that.setData({
                    notLogin: true
                })
            }
        })
        wx.setTabBarStyle({
            color: '#AFAFAF',
            selectedColor: '#F86564',
            backgroundColor: '#ffffff',
            borderStyle: 'white'
        });
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
        this.setData({
            page: 0
        })
    },

    onPageScroll(e) {
        this.setData({
            scroll: false
        })
        // console.log(this.data.scroll)
    },
    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        this.setData({
            scroll: true
        })

        // let that = this
        // let pages = parseInt(that.data.total / that.data.size);
        // if (pages > that.data.page - 1) {
        //     that.setData({
        //         isLoad: true
        //     })
        //     // that.getVideo()
        //
        // }

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },
    onShareTimeline() {
    },

    getVideoData(index) {

        let that = this;
        // that.setData({
        //     videoList: [],
        //     isVideoLoad: false
        // });
        wx.request({
            url: url.userJump,
            method: 'GET',
            data: {
                userId: that.data.indexShow[index].id,
                enable: '1',
                sort: 'top,desc'
            },
            success(res) {
                let temp = 'tagList[' + index + ']';

                that.setData({
                    [temp]: res.data.content
                })
            }
        })
        let data1 = {
            userId: that.data.indexShow[index].id,
            enable: '1',

            // page: that.data.videoPage,
            // size: that.data.videoSize,
            sort: 'createTime,desc'
        };
        if (that.data.videoList[index] === undefined) {

            // wx.request({
            //     url: url.live,
            //     method: "GET",
            //     data: data1,
            //     success(res) {
            //         that.setData({
            //             liveNum: res.data.content.length
            //         })
            //     }
            // });
            wx.request({
                url: url.video,
                method: 'GET',
                data: data1,
                success(res) {
                    let l = res.data.content;
                    l.forEach(f => {
                        f.createTime = util.formatMonthDay(new Date(f.createTime))
                    })
                    // let q = tabName[cur].name;
                    let temp = 'videoList[' + index + ']';
                    that.setData({
                        [temp]: l,
                        isVideoLoad: false
                    });
                    setTimeout(() => {
                    }, 3000);
                    // if (page !== 0) {
                    //     that.setData({
                    //         'tabName[0].name': that.data.videoList.concat(l),
                    //         isVideoLoad: false
                    //     });
                    // } else {
                    //     that.setData({
                    //         videoList: l,
                    //         isVideoLoad: false,
                    //         videoTotal: res.data.totalElements
                    //     });
                    // }

                }
            });
        }
    },
    toColumnDetail(e) {
        let that = this
        let item = e.currentTarget.dataset.item;
        //获取浏览数
        wx.request({
            url: url.activeAttTalk + '/getViewPlusOne',
            method: 'get',
            data: {
                activeId: item.id
            }, success(res) {
                that.setData({
                    viewNum: res.data
                })
            }
        })
        if (item.liveInfo.liveType === '0') {
            wx.navigateTo({
                url: '/pages/find/columnInfo/index?id=' + item.id
            });
        } else if (item.liveInfo.liveType === '1') {
            wx.navigateTo({
                url: '/pages/find/columnInfo1/index?id=' + item.id
            });
        }
    },


    // 左右滚动tab标题，切换标签
    switchTab: function (e) {
        let current = e.detail.current;
        if (this.data.currentTab < current) {
            this.setData({
                scrollLeft: this.data.scrollLeft + 90,
            });
        } else {
            this.setData({
                scrollLeft: this.data.scrollLeft - 90,
            });
        }
        this.setData({
            currentTab: current,
        });

        this.getVideoData(current);

        this.getInformation(current); //  获取当前选中tab标题的信息
    },

    // 点击tab标题，切换当前页
    swichNav: function (e) {
        let cur = e.target.dataset.current;
        let that = this;
        if (this.data.currentTab == cur) {
            return false;
        } else {
            this.setData({
                currentTab: cur,
                scrollLeft: (e.target.dataset.current - 1) * 90,
            })

            that.getVideoData(cur);


        }
        this.getInformation(cur); //  获取当前选中tab标题的信息
    },

    /****************    高度自适应（rpx）    ****************/
    getWindowHeight: function () {
        let that = this;
        wx.getSystemInfo({
            success: function (res) {
                let clientHeight = res.windowHeight,
                    clientWidth = res.windowWidth,
                    rpxR = 750 / clientWidth; //比例
                // console.log(clientHeight);
                // console.log(clientWidth);
                // let calc = clientHeight * rpxR - 245; // 如有最底部导航栏空间，则 calc - 底部导航栏高度
                let calc = clientHeight * rpxR - 345; // 如有最底部导航栏空间，则 calc - 底部导航栏高度
                that.setData({
                    winHeight: calc
                });
            }
        });
    },
    /****************    获取头部导航栏tab标题的名字    ****************/
    getTabName: function () {
        // 假数据
        // this.setData({
        //     // tabName: [{ name: "星巴克" }, {name:"肯德基"},{name:"必胜客"},{name:"优酷会员"},{name:"哈根达斯"},{name:"太平洋咖啡"},{name:"呷哺呷哺"},{name:"喜马拉雅"},{name:"百果园"},{name:"汉堡王"},{name:"COSTA咖啡"},{name:"coco都可"}],
        //     tabName: [{name: "本期好物"}, {name: "往期推荐"}],
        // })
    },


    /****************    获取对应tab标题的信息    ****************/
    getInformation: function (tabNum) {
        // 假数据
        if (tabNum == 0) {
            console.log("当前选中第1个tab标题");
            this.setData({
                choosedTabInformation: "1",
            })
        } else if (tabNum == 1) {
            console.log("当前选中第2个tab标题");
            this.setData({
                choosedTabInformation: "2",
            })
        } else if (tabNum == 2) {
            console.log("当前选中第3个tab标题");
            this.setData({
                choosedTabInformation: "3",
            })
        } else if (tabNum == 3) {
            console.log("当前选中第4个tab标题");
            this.setData({
                choosedTabInformation: "4",
            })
        } else if (tabNum == 4) {
            console.log("当前选中第5个tab标题");
            this.setData({
                choosedTabInformation: "5",
            })
        } else if (tabNum == 5) {
            console.log("当前选中第6个tab标题");
            this.setData({
                choosedTabInformation: "6",
            })
        } else if (tabNum == 6) {
            console.log("当前选中第7个tab标题");
            this.setData({
                choosedTabInformation: "7",
            })
        } else if (tabNum == 7) {
            console.log("当前选中第8个tab标题");
            this.setData({
                choosedTabInformation: "8",
            })
        } else if (tabNum == 8) {
            console.log("当前选中第9个tab标题");
            this.setData({
                choosedTabInformation: "9",
            })
        } else if (tabNum == 9) {
            console.log("当前选中第10个tab标题");
            this.setData({
                choosedTabInformation: "10",
            })
        } else if (tabNum == 10) {
            console.log("当前选中第11个tab标题");
            this.setData({
                choosedTabInformation: "11",
            })
        } else if (tabNum == 11) {
            console.log("当前选中第12个tab标题");
            this.setData({
                choosedTabInformation: "12",
            })
        }
    },
});
