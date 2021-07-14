// pages/find/home/index.js
const url = require('../../../utils/url')
const util = require('../../../utils/util')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        cardCur: 0,
        top: true,
        original: [],
        certification: [],
        recommendToday: [],
        mechanism: [],
        swiperList: [],
        HFShow: false,
        HFPic: '',
        HFAims: '',
        modalName: '',
        //骨架
        cReady: true,
        gReady: true,
        bReady: true,

        //登录用户
        user: {},

        //链接状态
        content: false,

        share: 0
    },
    hideHF() {
        this.setData({
            HFShow: false
        })
    },
    wVideo(e) {
        wx.navigateTo({
            url: '/pages/my/userDetail/index?id=' + e.target.dataset.item.id + '&tabShow=1'
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let that = this
        this.towerSwiper('swiperList')
        //获取AD
        // wx.request({
        //     url: url.banner,
        //     method: "GET",
        //     data: {
        //         bannerType: 'homeAD',
        //         enable: 1
        //     },
        //     success(res) {
        //         if (res.data.totalElements !== 0) {
        //             that.setData({
        //                 HFPic: res.data.content[0].bannerUrl,
        //                 HFShow: true,
        //                 HFAims: res.data.content[0].bannerJumpUrl,
        //                 modalName: 'Image'
        //             })
        //         }
        //         that.setData({
        //             swiperList: res.data.content,
        //             bReady: false
        //         })
        //     }, fail(res) {
        //         console.log(res)
        //     }
        // })
        that.loadData()
        // wx.request({
        //   url: url.userInfo + "certification",
        //   method: "GET",
        //   success(res) {
        //     that.setData({
        //       certification: res.data,
        //       cReady: false
        //     })
        //   }
        // })

    },
    loadData() {
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
                setTimeout(() => {

                    that.setData({
                        swiperList: res.data.content,
                        bReady: false
                    })
                }, 500)
            }
        })
        wx.getStorage({
            key: 'userInfo',
            success(res) {
                that.setData({
                    user: res.data
                })
            }
        });
        //获取今日推荐
        wx.request({
            url: url.userInfo + "recommendToday",
            method: "GET",

            success(res) {
                that.setData({
                    recommendToday: res.data,
                    gReady: false
                })

                let l = res.data;
                let user = null;
                //查询订阅关系
                wx.getStorage({
                    key: 'userInfo',
                    success(res) {
                        l.forEach(f => {
                            wx.request({
                                url: url.subscription + '/getSub',
                                method: 'GET',
                                data: {
                                    subId: f.id,
                                    fansId: res.data.id
                                },
                                success(res) {
                                    if (res.data !== '') {
                                        f.subing = true;
                                    }
                                }
                            });
                        })
                    }
                })
                l.forEach(f => {
                    f.fansNum = util.toThousands(f.fansNum);
                    if (f.living !== 2) {

                        //查询最近直播
                        wx.request({
                            url: url.live + '/nearLive',
                            data: {
                                userId: f.id,
                                type: 'after',
                                userId2: that.data.user.id//登录用户的id
                            }, success(res) {
                                if (res.data.startTime) {
                                    f.sTime = util.formatMonthDayHourMinute(new Date(res.data.startTime));
                                }
                                // f.eTime=res.data.endTime
                                console.log(res.data)
                                f.liveName = res.data.liveName;
                                f.liveId = res.data.id;
                                f.remind = res.data.remind
                                //没有将要直播 查询最近一个直播
                                if (res.data === '') {
                                    wx.request({
                                        url: url.live + '/nearLive',
                                        data: {
                                            userId: f.id,
                                            type: 'before',
                                            userId2: that.data.user.id//登录用户的id
                                        }, success(res) {
                                            if (res.data !== '') {
                                                console.log(res.data)
                                                f.sTime = util.formatMonthDayHourMinute(new Date(res.data.startTime));
                                                // f.eTime=res.data.endTime
                                                f.liveName = res.data.liveName;
                                                f.living = 0;
                                                f.replay = res.data.videoInfo;
                                            }

                                            //没有最近直播 该用户还没有直播过 按钮为订阅该用户48小时内的地一场直播
                                            if (res.data === '') {
                                                f.living = -1;
                                                console.log("没有最近直播 该用户还没有直播过")
                                            }
                                        },
                                        complete(res) {
                                            that.setData({
                                                recommendToday: l
                                            })
                                        }
                                    });

                                } else {
                                    f.living = 1;
                                }
                            },
                            complete(res) {
                                that.setData({
                                    original: l
                                })
                            }
                        });
                    } else {
                        wx.request({
                            url: url.live,
                            method: 'GET',
                            data: {
                                userId: f.id,
                                enable: '1',
                                living: '2'
                            }, success(res) {
                                f.liveName = res.data.content[0].liveName;
                                console.log(f);
                            }, complete(res) {
                                that.setData({
                                    recommendToday: l
                                })
                            }
                        })
                    }
                });


            }
        })


        //获取草莓原创
        wx.request({
            url: url.userInfo + "official",
            method: "GET",

            success(res) {
                that.setData({
                    original: res.data,
                    gReady: false
                })

                let l = res.data;
                let user = null;
                //查询订阅关系
                wx.getStorage({
                    key: 'userInfo',
                    success(res) {
                        l.forEach(f => {
                            wx.request({
                                url: url.subscription + '/getSub',
                                method: 'GET',
                                data: {
                                    subId: f.id,
                                    fansId: res.data.id
                                },
                                success(res) {
                                    if (res.data !== '') {
                                        f.subing = true;
                                    }
                                }
                            });
                        })
                    }
                })
                l.forEach(f => {
                    f.fansNum = util.toThousands(f.fansNum);
                    if (f.living !== 2) {

                        //查询最近直播
                        wx.request({
                            url: url.live + '/nearLive',
                            data: {
                                userId: f.id,
                                type: 'after',
                                userId2: that.data.user.id//登录用户的id
                            }, success(res) {
                                if (res.data.startTime) {
                                    f.sTime = util.formatMonthDayHourMinute(new Date(res.data.startTime));
                                }
                                // f.eTime=res.data.endTime
                                f.liveName = res.data.liveName;
                                f.liveId = res.data.id;
                                f.remind = res.data.remind
                                //没有将要直播 查询最近一个直播
                                if (res.data === '') {
                                    wx.request({
                                        url: url.live + '/nearLive',
                                        data: {
                                            userId: f.id,
                                            type: 'before',
                                            userId2: that.data.user.id//登录用户的id
                                        }, success(res) {
                                            if (res.data !== '') {
                                                console.log(res.data)
                                                f.sTime = util.formatMonthDayHourMinute(new Date(res.data.startTime));
                                                // f.eTime=res.data.endTime
                                                f.liveName = res.data.liveName;
                                                f.living = 0;
                                                f.replay = res.data.videoInfo;
                                            }

                                            //没有最近直播 该用户还没有直播过 按钮为订阅该用户48小时内的地一场直播
                                            if (res.data === '') {
                                                f.living = -1;
                                                console.log("没有最近直播 该用户还没有直播过")
                                            }
                                        },
                                        complete(res) {
                                            that.setData({
                                                original: l
                                            })
                                        }
                                    });

                                } else {
                                    f.living = 1;
                                }
                            },
                            complete(res) {
                                that.setData({
                                    original: l
                                })
                            }
                        });
                    } else {
                        wx.request({
                            url: url.live,
                            method: 'GET',
                            data: {
                                userId: f.id,
                                enable: '1',
                                living: '2'
                            }, success(res) {
                                f.liveName = res.data.content[0].liveName;
                                console.log(f);
                            }, complete(res) {
                                that.setData({
                                    original: l
                                })
                            }
                        })
                    }
                });


            }
        })

        //获取达人优选
        wx.request({
            url: url.userInfo + "mechanism",
            method: "GET",

            success(res) {
                that.setData({
                    mechanism: res.data,
                    gReady: false
                })

                let l = res.data;
                let user = null;
                //查询订阅关系
                wx.getStorage({
                    key: 'userInfo',
                    success(res) {
                        l.forEach(f => {
                            wx.request({
                                url: url.subscription + '/getSub',
                                method: 'GET',
                                data: {
                                    subId: f.id,
                                    fansId: res.data.id
                                },
                                success(res) {
                                    if (res.data !== '') {
                                        f.subing = true;
                                    }
                                }
                            });
                        })
                    }
                })
                l.forEach(f => {
                    f.fansNum = util.toThousands(f.fansNum);
                    if (f.living !== 2) {

                        //查询最近直播
                        wx.request({
                            url: url.live + '/nearLive',
                            data: {
                                userId: f.id,
                                type: 'after',
                                userId2: that.data.user.id//登录用户的id
                            }, success(res) {
                                if (res.data.startTime) {
                                    f.sTime = util.formatMonthDayHourMinute(new Date(res.data.startTime));
                                }
                                // f.eTime=res.data.endTime
                                console.log(res.data)
                                f.liveName = res.data.liveName;
                                f.liveId = res.data.id;
                                f.remind = res.data.remind
                                //没有将要直播 查询最近一个直播
                                if (res.data === '') {
                                    wx.request({
                                        url: url.live + '/nearLive',
                                        data: {
                                            userId: f.id,
                                            type: 'before',
                                            userId2: that.data.user.id//登录用户的id
                                        }, success(res) {
                                            if (res.data !== '') {
                                                console.log(res.data)
                                                f.sTime = util.formatMonthDayHourMinute(new Date(res.data.startTime));
                                                // f.eTime=res.data.endTime
                                                f.liveName = res.data.liveName;
                                                f.living = 0;
                                                f.replay = res.data.videoInfo;
                                            }

                                            //没有最近直播 该用户还没有直播过 按钮为订阅该用户48小时内的地一场直播
                                            if (res.data === '') {
                                                f.living = -1;
                                                console.log("没有最近直播 该用户还没有直播过")
                                            }
                                        },
                                        complete(res) {
                                            that.setData({
                                                mechanism: l
                                            })
                                        }
                                    });

                                } else {
                                    f.living = 1;
                                }
                            },
                            complete(res) {
                                that.setData({
                                    mechanism: l
                                })
                            }
                        });
                    } else {
                        wx.request({
                            url: url.live,
                            method: 'GET',
                            data: {
                                userId: f.id,
                                enable: '1',
                                living: '2'
                            }, success(res) {
                                f.liveName = res.data.content[0].liveName;
                                console.log(f);
                            }, complete(res) {
                                that.setData({
                                    mechanism: l
                                })
                            }
                        })
                    }
                });


            }
        })

        //获取机构作品

        wx.request({
            url: url.userInfo + "certification",
            method: "GET",
            success(res) {
                that.setData({
                    certification: res.data,
                    gReady: false
                })

                let ll = res.data;
                console.log(ll)
                let user = null;
                //查询订阅关系
                wx.getStorage({
                    key: 'userInfo',
                    success(res) {
                        ll.forEach(f => {
                            wx.request({
                                url: url.subscription + '/getSub',
                                method: 'GET',
                                data: {
                                    subId: f.id,
                                    fansId: res.data.id
                                },
                                success(res) {
                                    if (res.data !== '') {
                                        f.subing = true;
                                    }
                                }
                            });
                        })
                    }
                })
                ll.forEach(f => {
                    f.fansNum = util.toThousands(f.fansNum);
                    if (f.living !== 2) {

                        //查询最近直播
                        wx.request({
                            url: url.live + '/nearLive',
                            data: {
                                userId: f.id,
                                type: 'after',
                                userId2: that.data.user.id//登录用户的id
                            }, success(res) {
                                if (res.data.startTime) {
                                    f.sTime = util.formatMonthDayHourMinute(new Date(res.data.startTime));
                                }
                                // f.eTime=res.data.endTime
                                f.liveName = res.data.liveName;
                                f.liveId = res.data.id;
                                f.remind = res.data.remind

                                //没有将要直播 查询最近一个直播
                                if (res.data === '') {
                                    wx.request({
                                        url: url.live + '/nearLive',
                                        data: {
                                            userId: f.id,
                                            type: 'before',
                                            userId2: that.data.user.id//登录用户的id
                                        }, success(res) {
                                            if (res.data !== '') {
                                                f.sTime = util.formatMonthDayHourMinute(new Date(res.data.startTime));
                                                // f.eTime=res.data.endTime
                                                // console.log(res.data);
                                                f.liveName = res.data.liveName;
                                                f.living = 0;
                                                f.replay = res.data.videoInfo;
                                            }

                                            //没有最近直播 该用户还没有直播过 按钮为订阅该用户48小时内的地一场直播
                                            if (res.data === '') {
                                                f.living = -1;
                                                console.log("没有最近直播 该用户还没有直播过")
                                            }
                                        },
                                        complete(res) {
                                            that.setData({
                                                certification: ll
                                            })
                                        }
                                    });

                                } else {
                                    f.living = 1;
                                }
                            },
                            complete(res) {
                                that.setData({
                                    certification: ll
                                })
                            }
                        });
                    } else {
                        wx.request({
                            url: url.live,
                            method: 'GET',
                            data: {
                                userId: f.id,
                                enable: '1',
                                living: '2'
                            }, success(res) {
                                f.liveName = res.data.content[0].liveName;
                            }, complete(res) {
                                that.setData({
                                    certification: ll
                                })
                            }
                        })
                    }
                });


            }
        })
    },
    remind(e) {
        let that = this;
        wx.requestSubscribeMessage({
            tmplIds: ['cONAyNQ0BbRtNHhRAmk0bnILn2ZRIUL5ECKDHgXU3sU'],
            success(res) {
                let r = res;
                wx.getStorage({
                    key: 'userInfo',
                    success(res) {
                        wx.request({
                            url: url.remindInfo,
                            method: 'POST',
                            data: {
                                userId: res.data.id,
                                liveId: e.target.dataset.item,
                                templateId: 'cONAyNQ0BbRtNHhRAmk0bnILn2ZRIUL5ECKDHgXU3sU'
                            }, success(res) {
                                if (r['cONAyNQ0BbRtNHhRAmk0bnILn2ZRIUL5ECKDHgXU3sU'] === 'accept') {
                                    wx.showToast({
                                        title: '已订阅该场直播',
                                        icon: 'none'
                                    });
                                    that.loadData();
                                }
                            }
                        })

                    }, fail(res) {
                        wx.navigateTo({
                            url: '/pages/my/login/login'
                        })
                    }
                })

            }
        })

    },
    reminded() {
        wx.showToast({
            title: '已设置提醒,等待直播',
            icon: "none"
        })
    },
    showModal(e) {
        let message = e.currentTarget.dataset.item;
        console.log("message", message);
        let livingW = message.livingW;
        let split = [];
        if (livingW !== null) {
            split = livingW.split('-');
        }
        console.log(message.livingImgUrl !== null && message.livingImgUrl !== "")
        if (split[3] === 'wxApp') {
            wx.navigateToMiniProgram({
                appId: split[1],//appid
                path: split[2],//跳转的页面路径
                extraData: {//携带的参数
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
            });
        } else if (message.livingImgUrl !== null && message.livingImgUrl !== "null") {
            console.log(message.livingImgUrl);
            this.setData({
                modalName: 'QRCode',
                QRCode: message.livingImgUrl
            });
        } else {
            if (message.livingK !== 'null' || message.livingD !== 'null') {
                this.setData({
                    modalName: e.currentTarget.dataset.target,
                    clickItem: message,
                });
            } else {
                wx.navigateTo({
                    url: 'plugin-private://wx2b03c6e691cd7370/pages/live-player-plugin?room_id=' + message.livingW
                });
            }
        }

    },
    showModal2(e) {
        let replay = e.currentTarget.dataset.replay;
        if (replay === null) {
            this.setData({
                modalName: e.currentTarget.dataset.target,
                clickItem: e.currentTarget.dataset.item,
            });
        } else {
            wx.navigateTo({
                url: "/pages/find/videoDetail/index?id=" + replay.id + "&url=" + replay.videoUrl + "&name=" + replay.videoName
            })
        }
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
            url = that.data.clickItem.livingK;
            toast = '打开快手观看'
        } else {
            url = that.data.clickItem.livingD;
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
    DotStyle(e) {
        console.log(e.detail.value)
        this.setData({
            DotStyle: e.detail.value
        })
    },
    // cardSwiper
    cardSwiper(e) {
        this.setData({
            cardCur: e.detail.current
        })
    },
    // towerSwiper
    // 初始化towerSwiper
    towerSwiper(name) {
        console.log(1)
        let list = this.data[name];
        for (let i = 0; i < list.length; i++) {
            list[i].zIndex = parseInt(list.length / 2) + 1 - Math.abs(i - parseInt(list.length / 2))
            list[i].mLeft = i - parseInt(list.length / 2)
        }
        this.setData({
            swiperList: list
        })
    },
    // towerSwiper触摸开始
    towerStart(e) {
        this.setData({
            towerStart: e.touches[0].pageX
        })
    },
    // towerSwiper计算方向
    towerMove(e) {
        this.setData({
            direction: e.touches[0].pageX - this.data.towerStart > 0 ? 'right' : 'left'
        })
    },
    // towerSwiper计算滚动
    towerEnd(e) {
        let direction = this.data.direction;
        let list = this.data.swiperList;
        if (direction == 'right') {
            let mLeft = list[0].mLeft;
            let zIndex = list[0].zIndex;
            for (let i = 1; i < list.length; i++) {
                list[i - 1].mLeft = list[i].mLeft
                list[i - 1].zIndex = list[i].zIndex
            }
            list[list.length - 1].mLeft = mLeft;
            list[list.length - 1].zIndex = zIndex;
            this.setData({
                swiperList: list
            })
        } else {
            let mLeft = list[list.length - 1].mLeft;
            let zIndex = list[list.length - 1].zIndex;
            for (let i = list.length - 1; i > 0; i--) {
                list[i].mLeft = list[i - 1].mLeft
                list[i].zIndex = list[i - 1].zIndex
            }
            list[0].mLeft = mLeft;
            list[0].zIndex = zIndex;
            this.setData({
                swiperList: list
            })
        }
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
                    }
                }, fail(res) {
                    wx.navigateTo({
                        url: '/pages/my/login/login'
                    })
                }
            })

        }
    },
    HFAims(e) {
        let url = e.target.dataset.url;
        wx.getStorage({
            key: 'userInfo',
            success(res) {
                wx.navigateTo({
                    url: url
                })
            }, fail(res) {
                wx.navigateTo({
                    url: '/pages/my/login/login'
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
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    onPageScroll: function (res) {
        // console.log(res)
        // if (220 < res.scrollTop ) {
        //   console.log(123)
        //   this.setData({
        //     top : false
        //   })
        // }else if(res.scrollTop <200 ) {
        //   this.setData({
        //     top : true
        //   })
        // }
    },
    scanCode() {
        wx.request({
            url: 'http://chiq-phone-media.smart-tv.cn:28080/search/lists',
            method:'POST',
            data:{
                pagesSize:30,
                pageNo:1,
                keyword:'综艺'
            },success(res) {
                console.log("res",res)
            }
        })
        let that = this;
        wx.scanCode({
            onlyFromCamera: true,
            success(res) {
                let TVIP = res.result.split("=")[6].split("|")[0];
                wx.setStorage({
                    key: 'TVIP',
                    data: TVIP
                })

                wx.connectSocket({
                    url: 'ws://' + TVIP + ':8686',
                    success(res) {
                        console.log("连接成功")
                        that.setData({
                            content: true
                        })
                        wx.onSocketOpen(function (res) {
                            wx.sendSocketMessage({
                                data: `vod:vod-play-{"player":vod.qqlive,"videoId":"e7hi6lep1yc51ca,h0018p9ihom","videoName":""}`
                            })

                        })

                        // `vod:vod-play-{"player":vod.qqlive,"videoId":"l3101s57slz,123154","videoName":""}`
                    }, fail(res) {
                        console.log("连接失败")
                    }
                })
            }
        })
    },
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        const that = this;
        return {
            title: '新鲜有滋味',
            path: '/pages/live/home/index?share=1'
        }
    },
    onShareTimeline() {
        const that = this;
        return {
            query: 'share=1&timeline=1'
        }
    }

})

