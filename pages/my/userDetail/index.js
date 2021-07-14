// pages/live/userDetail/index.js
const app = getApp()
const url = require('../../../utils/url')
const util = require('../../../utils/util')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    share: 0,
    id: '',
    isUser: false,
    tabList: ['直播', '视频'],
    isLiveLoad: true,
    isVideoLoad: false,
    isVideoLoadShow: false,

    tabShow: 0,
    TabCur: 1,
    livePage: 0,
    liveSize: 10,
    liveTotal: 0,
    videoPage: 0,
    videoSize: 6,
    videoTotal: 0,
    mySubscriptionNum: 0,
    fansNum:0,
    likeNum:0,

    loadProgress: 0,
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    myLive: [],
    userInfo: {},
    //当前用户
    user: {},
    url: '',
    //订阅 0否1是
    subing: 0,
    sub: {},
    modalName: '',

    typeList: [],
    typeName: null,

    timeline: 0,

    clickTimes: 0
  },
  showModal3(e) {
    let replay = e.currentTarget.dataset.item.videoInfo;
    if (replay === null) {
      this.setData({
        modalName: e.currentTarget.dataset.target,
        clickItem: e.currentTarget.dataset.item.videoInfo,
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
  getLiveWithLogin(res) {
    let that = this;
    that.setData({
      isVideoLoadShow: false,
      isLiveLoad: true
    });
    wx.request({
      url: url.live + "/selectInfoList",
      method: 'GET',
      data: {
        userId: that.data.id,
        userId2: res.data.id,
        page: that.data.page,
        size: that.data.size,
      }, success(res) {
        that.setData({
          myLive: res.data,
          liveTotal: res.data.length,
          isLiveLoad: false
        })
      }
    })
  },
  getLiveWithoutLogin(res) {
    let that = this;
    wx.request({
      url: url.live,
      method: 'GET',
      data: {
        userId: that.data.id,
        enable: "1",
        page: that.data.livePage,
        size: that.data.liveSize
      }, async success(res) {
        let l = await that.replayFor(res.data.content)
        let l2 = await that.getRemind(l);
        that.setData({
          myLive: l2,
          liveTotal: res.data.totalElements,
          isLiveLoad: false
        })

      }
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {


    let that = this;

    if (options.share){
      that.setData({
        share: 1
      })
    }
    if (options.timeline) {
      that.getVideo(0);
    }

    that.setData({
      id: options.id
    });
    wx.getStorage({
      key: 'userInfo',
      success(res) {
        let user = res.data;
        if (user.id === options.id) {
          that.setData({
            isUser: true
          })
        }
        that.setData({
          user: user
        });

        if (parseInt(options.tabShow) === 0) {
          that.getLive(0);
        } else {
          that.getVideo(0);
          // that.setData({
          //   isVideoLoadShow: true
          // })
          // wx.request({
          //   url: url.video,
          //   method: 'GET',
          //   data: {
          //     userId: that.data.id,
          //     enable: '1'
          //   }, success(res) {
          //     that.setData({
          //       isVideoLoad: false
          //
          //     })
          //     if (res.data.totalElements !== 0) {
          //       let l = res.data.content;
          //       l.forEach(f => {
          //         f.createTime = util.formatMonthDay(new Date(f.createTime))
          //       })
          //       that.setData({
          //         videoList: l,
          //         videoTotal: res.data.totalElements,
          //
          //       })
          //     }
          //
          //   }
          // });
        }
      }, fail(res) {
        wx.navigateTo({
          url: '/pages/my/login/login?type=0&id=' + options.id + '&tabShow=1'


        })
      }
    })
    that.setData({
      id: options.id,
      tabShow: parseInt(options.tabShow),
      TabCur: parseInt(options.tabShow)
    })
    //查询user
    wx.request({
      url: url.userInfo + options.id,
      method: "GET",
      success(res) {
        let user = res.data;
        that.setData({
          mySubscriptionNum : util.makeFriendly(user.mySubscriptionNum),
          fansNum : util.makeFriendly(user.fansNum),
          likeNum : util.makeFriendly(user.likeNum),
          userInfo: res.data
        });
      }
    })


      //查询 视频类型
      wx.request({
        url: url.video + '/getTypeByUserId',
        method: 'GET',
        data:{
          userId: options.id
        }, success(res) {
          if (res.statusCode === 200) {
            let typeData = [];
            let types = [];
            types = res.data;

            if (options.videoType) {

              typeData = typeData.concat({
                name :'全部',
                color :'gray'
              });
              for (let name in types) {
                console.log("name",types[name])
                if (types[name] === options.videoType) {
                  typeData = typeData.concat({
                    name :types[name],
                    color :'F86564'
                  });
                } else {
                  typeData = typeData.concat({
                    name :types[name],
                    color :'gray'
                  });
                }

              }

              that.setData({
                typeName: options.videoType,
                videoPage: 0,
              });

              that.getVideo(0);

            } else {
              typeData = typeData.concat({
                name :'全部',
                color :'F86564'
              });
              for (let name in types) {
                console.log("name",types[name])
                typeData = typeData.concat({
                  name :types[name],
                  color :'gray'
                })

              }
            }




            that.setData({
              typeList: typeData
            })
          }

        }
      });




    //查询订阅关系
    wx.getStorage({
      key: 'userInfo',
      success(res) {
        wx.request({
          url: url.subscription + '/getSub',
          method: 'GET',
          data: {
            subId: that.data.id,
            fansId: res.data.id
          },
          success(res) {
            if (res.data != "") {
              that.setData({
                subing: 1,
                sub: res.data
              });
            } else {
              that.setData({
                subing: 0
              })
            }
          }
        })
      }
    })


    //查询直播
    // let l = []
    if (options.tabShow === 0) {
      that.setData({
        isVideoLoadShow: false,
        isLiveLoad: true
      });

    } else {

    }


  },
  replayFor(l) {
    let that = this;
    return new Promise(resolve => {

      l.forEach(f => {
        //已经直播
        if (f.living === '0') {
          wx.request({
            url: url.live + '/' + f.id,
            method: 'GET',
            success(res) {
              f.replay = res.data.videoInfo

            }
          })
        } else if (f.living === '1') {
        }
        f.sTime = util.formatMonthDayHourMinute(new Date(f.startTime))
      });
      resolve(l)
    })

    // return l;
  },
  getRemind(l) {
    let that = this
    return new Promise(resolve => {
      l.forEach(f => {
        wx.request({
          url: url.remindInfo,
          method: 'GET',
          data: {
            liveId: f.id,
            userId: that.data.user.id
          }, success(res) {
            f.reminding = res.data.content.length
          }
        })
        console.log(f)
      });
      that.setData({
        myLive: l
      });
      resolve(l);
    })
  },

  reminded() {
    wx.showToast({
      title: '已设置提醒,等待直播',
      icon: "none"
    })
  },
  //订阅
  subscription() {
    wx.showLoading({
      title: '加载中...'
    })
    let that = this;
    let method = '';
    if (that.data.subing === 1) {
      method = 'PUT';
    } else {
      method = 'POST'
    }
    wx.getStorage({
      key: 'userInfo',
      success(res) {
        wx.request({
          url: url.subscription,
          method: method,
          data: {
            subId: that.data.id,
            fansId: res.data.id,
            subName: that.data.userInfo.nickname,
            fansName: res.data.nickname
          },
          success(res) {
            that.setData({
              'userInfo.fansNum': res.data.fansNum
            })
            if (method === 'PUT') {
              that.setData({
                subing: 0
              });
              wx.showToast({
                title: '取消订阅',
                icon: "none"
              })
            } else {
              that.setData({
                subing: 1
              });
              wx.showToast({
                title: '已订阅',
                icon: "none"
              })
            }
          }
        })
      }, fail(res) {
        wx.navigateTo({
          url: '/pages/my/login/login'
        })
      }
    });
  },
  loadProgress() {
    this.setData({
      loadProgress: this.data.loadProgress + 3
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

  tabSelect(e) {
    let that = this;
    // this.loadProgress()
    this.setData({
      TabCur: e.currentTarget.dataset.id,
      scrollLeft: (e.currentTarget.dataset.id - 1) * 60,
      tabShow: e.currentTarget.dataset.id,
    });
    console.log("e.currentTarget.dataset.id", e.currentTarget.dataset.id);
    if (e.currentTarget.dataset.id === 0) {

      that.getLive(0);
      // wx.request({
      //   url: url.live,
      //   method: 'GET',
      //   data: {
      //     userId: that.data.id,
      //     enable: "1",
      //     page: that.data.livePage,
      //     size: that.data.liveSize
      //   }, async success(res) {
      //     // f.replay = res.data.videoInfo
      //     console.log(res.data)
      //     let l = await that.replayFor(res.data.content)
      //     // l.forEach(f=>{
      //     //   f.liveInfo.sTime = util.formatMonthDayHourMinute(new Date(f.liveInfo.startTime))
      //     // })
      //     that.setData({
      //       myLive: l,
      //       liveTotal: res.data.totalElements,
      //       isLiveLoad: false
      //     })
      //
      //   }
      // });
    } else {
      that.getVideo(0)
      // that.setData({
      //   isVideoLoadShow: true
      // })
      // if (that.data.videoPage === 0) {
      //
      //   wx.request({
      //     url: url.video,
      //     method: 'GET',
      //     data: {
      //       userId: that.data.id,
      //       enable: '1'
      //     }, success(res) {
      //       that.setData({
      //         isVideoLoad: false
      //
      //       })
      //       if (res.data.totalElements !== 0) {
      //         let l = res.data.content;
      //         l.forEach(f => {
      //           f.createTime = util.formatMonthDay(new Date(f.createTime))
      //         })
      //         that.setData({
      //           videoList: l,
      //           videoTotal: res.data.totalElements,
      //
      //         })
      //       }
      //
      //     }
      //   });
      // }
    }
    // if (e.currentTarget.dataset.id === 1) {
    //   //查询视频
    //   wx.request({
    //     url: url.live,
    //     method: 'GET',
    //     data: {
    //       userId: res.data.id,
    //       enable: "1"
    //     }, success(res) {
    //       that.setData({
    //         myLive: res.data.content,
    //         loadProgress: 100
    //       })
    //     }
    //   });
    // }

  },
  showModal(e) {
    let message = e.currentTarget.dataset.item;
    console.log(message)
    let liveWxId = message.liveWxId;
    let split = [];
    if (liveWxId !== null) {
      split = liveWxId.split('-');
    }
    console.log(message.liveImgUrl !== null && message.liveImgUrl !== "")
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
          //   title: '打开成功!'
          // })
        },fail(res) {
          // wx.showToast({
          //   title: '系统错误!'
          // })
        }
      })
    }else if (message.liveImgUrl !== null && message.liveImgUrl !== "") {
      this.setData({
        modalName: 'QRCode',
        QRCode: message.liveImgUrl
      });
      console.log(message.liveImgUrl);
    } else {
      if (message.liveKUrl !== null || message.liveDUrl !== null) {
        this.setData({
          modalName: e.currentTarget.dataset.target,
          clickItem: message,
        });
      } else {
        wx.navigateTo({
          url: 'plugin-private://wx2b03c6e691cd7370/pages/live-player-plugin?room_id=' + message.liveWxId
        })
      }
    }
  },
  showModal2(e) {
    console.log(e)
    // cb9fdae269c848dfb2b3b76474c3a572
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
  getLive(page) {
    let that = this;
    that.setData({
      isVideoLoadShow: false,
      isLiveLoadShow: true,
      isLiveLoad: true
    })
    // that.setData({
    //   livePage: that.data.livePage + 1,
    // })
    wx.request({
        url: url.live + '/selectInfoList',
        method: 'GET',
        data: {
            userId: that.data.id,
            userId2: that.data.user.id,
            enable: "1",
            page: that.data.livePage,
            size: that.data.liveSize,
            sort: 'createTime,desc'
        }, success(res) {
            that.setData({
                isLiveLoad: false,
            })
            // f.replay = res.data.videoInfo
            // let l =  that.replayFor(res.data.content);
            let l = res.data.content;
            for (let i = 0; i < l.length; i++) {
                var f = l[i];

                if (i === l.length - 1) {
                    //已经直播

                    if (f.living === '0') {
                        wx.request({
                            url: url.live + '/' + f.id,
                            method: 'GET',
                            success(res) {
                                f.replay = res.data.videoInfo

                            }
                        });
                    } else if (f.living === '1') {
                    }
                    console.log(util.formatMonthDayHourMinute(new Date(f.startTime)))
                    f.sTime = util.formatMonthDayHourMinute(new Date(f.startTime))
                    if (page !== 0) {
                        that.setData({
                            myLive: that.data.myLive.concat(l),
                            isLiveLoad: false
                        });
                    } else {
                        that.setData({
                            myLive: l,
                            isLiveLoad: false,
                            liveTotal: res.data.totalElements
                        });
                    }

                } else {
                    //已经直播
                    if (f.living === '0') {
                        wx.request({
                            url: url.live + '/' + f.id,
                            method: 'GET',
                            success(res) {
                                f.replay = res.data.videoInfo

                            }
                        });
                    } else if (f.living === '1') {
                    }
                    console.log(util.formatMonthDayHourMinute(new Date(f.startTime)))
                    f.sTime = util.formatMonthDayHourMinute(new Date(f.startTime))
                }

            }
        }
    })
  },
  getVideo(page) {
    let that = this;
    that.setData({
      isLiveLoadShow: false,
      isVideoLoadShow: true,
      isVideoLoad: true
    })
    let data1 = {}
    console.log("that.data.typeName", that.data.typeName);
    if (that.data.typeName === null) {
      data1 = {
        userId: that.data.id,
        enable: '1',
        page: that.data.videoPage,
        size: that.data.videoSize,
        sort: 'createTime,desc'
      };
    } else {
      data1={
        userId: that.data.id,
        enable: '1',
        videoTypeName:that.data.typeName,
        page: that.data.videoPage,
        size: that.data.videoSize,
        sort: 'createTime,desc'
      }
    }
    wx.request({
      url: url.video,
      method: 'GET',
      data: data1,
      success(res) {
        let l = res.data.content;
        console.log(res.data)
        l.forEach(f => {
          f.createTime = util.formatMonthDay(new Date(f.createTime))
        })
        if (page !== 0) {
          that.setData({
            videoList: that.data.videoList.concat(l),
            isVideoLoad: false
          });
        } else {
          that.setData({
            videoList: l,
            isVideoLoad: false,
            videoTotal: res.data.totalElements
          });
        }

      }
    });
  },
  remind(e) {
    console.log(e)
    let that = this
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
                  that.setData({
                    page: 0
                  })
                  that.getLive(0);
                }
              }
            })
          }
        })

      }, fail(res) {
        wx.navigateTo({
          url: '/pages/my/login/login'
        })
      }
    })

  },
  type: function (e) {
    let typeName = e.currentTarget.dataset.name;
    console.log("index", e.currentTarget.dataset.index);
    let typeL = this.data.typeList;

    typeL.forEach((item, index)=>{
      if (index === e.currentTarget.dataset.index) {
        item.color = 'F86564';
      } else {
        item.color = 'gray';
      }
    })
    console.log("typeL",typeL)
    if (typeName !== '全部') {
      this.setData({
        typeName: typeName,
        videoPage: 0,
        typeList: typeL
      });
    } else {
      this.setData({
        typeName: null,
        videoPage: 0,
        typeList: typeL
      });
    }
    this.getVideo(0);
  },
  toQA(e){
    console.log(e.currentTarget.dataset.id)
    if (this.data.clickTimes >= 10) {
      wx.navigateTo({
        url: '/pages/find/qa/index?userId=' + e.currentTarget.dataset.id
      });
    } else {
      this.setData({
        clickTimes: this.data.clickTimes + 1
      })
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  }
  ,

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      clickTimes: 0
    })
  }
  ,

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  }
  ,

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  }
  ,

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  }
  ,

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let that = this;
    let livePages = parseInt(that.data.liveTotal / that.data.liveSize);
    let videoPages = parseInt(that.data.videoTotal / that.data.videoSize);

    console.log(videoPages)
    console.log(videoPages)
    if (that.data.tabShow === 0) {
      if (livePages > that.data.livePage) {
        that.setData({
          isLiveLoad: true,
          livePage: that.data.livePage + 1,
        })
        that.getLive(1);
      }
    } else {
      console.log(100)
      if (videoPages > that.data.videoPage) {
        that.setData({
          isVideoLoad: true,
          videoPage: that.data.videoPage + 1,
        })
        that.getVideo(1);
      }
    }
  }
  ,

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    const that = this;
    return {
      title: that.data.userInfo.nickname,
      path: '/pages/my/userDetail/index?id=' + that.data.id + '&share=' + 1 +'&tabShow=1'
    }
  },
  onShareTimeline() {
    const that = this;
    return {
      query: 'id=' + that.data.id + '&share=' + 1 + '&tabShow=1&timeline=1'
    }
  }
})
