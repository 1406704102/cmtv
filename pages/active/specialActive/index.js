// pages/active/specialActive/index.js
const url = require('../../../utils/url')
const util = require('../../../utils/util')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    active: {},
    userInfo: {},
    modalName: '',
    liveId: '',
    page: 0,
    size: 5,
    totalElement: 0,
    share: 0,
    attTalkList: [],
    btnTexts: [],
    isLoad: true,
    likeIcon: 'unlike.png',
    activeId: '',
    activeName: '',
    timers: [],

    attTimes: -1,
    nowAttTimes: 0,
    join: '0',
    activeJoin: {},
    TabCur: 1,
    TabList: ['最新内容', '点赞排行'],
    scrollLeft: 0,

    sort: "createTime,desc"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this;
    if (options.share) {
      that.setData({
        share: 1
      })
    }
    wx.getStorage({
      key: 'userInfo',
      success(r) {
        console.log("attTimes: ", options.attTimes)
        that.setData({
          userInfo: r.data,
          id: options.id,
          activeId: options.activeId,
          attTimes: options.attTimes,
          activeName: options.activeName,
          logo: options.logo
        })
        wx.request({
          url: url.specialActive + "/getById",
          method: 'get',
          data: {
            id: options.id
          }, success(res) {
            let active = res.data;
            //获取订阅关系
            wx.request({
              url: url.subscription + '/getSub',
              method: 'GET',
              data: {
                subId: active.userInfo.id,
                fansId: r.data.id
              },
              success(e) {
                console.log(e)
                // active.userInfo.subing = true;

                if (e.data !== '') {
                  active.userInfo.subing = true;
                }
                active.userInfo.fansNum = util.toThousands(active.userInfo.fansNum);
                let btnText = active.btnText;
                let btnTexts = btnText.split(",");
                console.log("active",active)

                that.setData({
                  active: active,
                  btnTexts: btnTexts
                })
              }
            });
            //查询 最近新的直播
            wx.request({
              url: url.live + '/firstLive',
              method: 'get',
              data: {
                userId: active.userInfo.id,
                userId2: r.data.id
              }, success(s) {
                console.log("s.data",s.data);

                that.setData({
                  liveId: s.data.id,
                  liveName: s.data.liveName,
                  startTime: util.formatMonthDayHourMinute2(new Date(s.data.startTime))
                })
                if (s.data.videoInfo !== null) {
                  that.setData({
                    'active.userInfo.replay': s.data.videoInfo
                  });
                } else {
                  if (s.data.living === '1') {
                    that.setData({
                      'active.userInfo.living': 1
                    });
                  }
                }
                that.setData({
                  'active.userInfo.remind': s.data.remind
                });
              }
            })
          }
        })
        //查询是否参加
        wx.request({
          url: url.activeJoin + '/findByAIdAndUId',
          method: "GET",
          data: {
            activeId: options.activeId,
            userId: r.data.id,
          }, success(res) {
            console.log("参加信息", res)

            if (res.data !== '') {
              that.setData({
                join: '1',
                activeJoin: res.data
              })
              //查询当天打卡次数
              wx.request({
                url: url.activeAttTalk + '/attTimes',
                method: 'GET',
                data: {
                  activeId: options.activeId,
                  userId: that.data.userInfo.id
                }, success(res) {
                  console.log("打卡次数", res)
                  that.setData({
                    nowAttTimes: res.data
                  })
                }
              })
            }
          }
        })
        that.getAttTalkData();
      }, fail(res) {
        //id=" + item.specialId + "&activeId=" + item.id + "&attTimes=" + item.attendanceTimes + "&activeName=" + item.activeName + "&logo=" + item.activeLogo
        wx.navigateTo({
          url: "/pages/my/login/login?type=spActive&id=" + options.id + "&activeId=" + options.activeId + "&attTimes=" + options.attTimes + "&activeName=" + options.activeName + "&logo=" + options.logo
        })
      }
    })

    //和打卡数
    //获取浏览数
    wx.request({
      url: url.activeAttTalk + '/getViewPlusOne',
      method: 'get',
      data: {
        activeId: options.activeId
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
        activeId: options.activeId
      }, success(res) {
        that.setData({
          markNum: res.data
        })
      }
    })
  },

  wVideo(e) {
    console.log(e)
    wx.navigateTo({
      url: '/pages/my/userDetail/index?id=' + e.currentTarget.dataset.item.id + '&tabShow=1'
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
    console.log(split)
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
    } else if (message.livingImgUrl !== null && message.livingImgUrl !== "null") {
      console.log(message.livingImgUrl)
      this.setData({
        modalName: 'QRCode',
        QRCode: message.livingImgUrl
      })
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
    console.log(replay)

    if (replay === null || replay === undefined) {
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
                  that.setData({
                    'active.userInfo.remind': 1
                  })
                }
              }
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


  getAttTalkData() {
    const that = this;
    //分页查询打卡信息
    wx.getStorage({
      key: 'userInfo',
      success(r) {
        wx.request({
          url: url.activeAttTalk,
          method: 'GET',
          data: {
            activeId: that.data.activeId,
            page: that.data.page,
            size: that.data.size,
            userId2: r.data.id,
            sort: that.data.sort
          }, success(res) {
            console.log(res);
            let arr = res.data.content;
            arr.forEach(f => {
              f.createTime = util.formatMonthDayHourMinute(new Date(f.createTime))
            })
            that.setData({
              attTalkList: arr,
              totalElement: res.data.totalElements,
              isLoad: false
            })
          }
        })
      }
    })
  },
  getAttTalkList() {
    let that = this;
    that.setData({
      page: that.data.page + 1,
    })
    wx.request({
      url: url.activeAttTalk,
      method: 'GET',
      data: {
        activeId: that.data.activeId,
        page: that.data.page,
        size: that.data.size,
        userId2: that.data.userInfo.id,
        sort: that.data.sort
      }, success(res) {

        let arr = res.data.content;
        arr.forEach(f => {
          f.createTime = util.formatMonthDayHourMinute(new Date(f.createTime))
        })
        that.setData({
          attTalkList: that.data.attTalkList.concat(arr),
        })
      }, complete(res) {
        that.setData({
          isLoad: false
        })
      }
    })
  },
  previewImg: function (e) {
    console.log(e.currentTarget.dataset)
    let arr = [];
    arr.push(e.currentTarget.dataset.url)
    wx.previewImage({
      current: e.currentTarget.dataset.url,     //当前图片地址
      urls: arr,               //所有要预览的图片的地址集合 数组形式
      success: function (res) {
      },
      fail: function (res) {
      },
      complete: function (res) {
      },
    })
  },
  doLike(e) {
    let that = this;
    // let activeStatic = e.currentTarget.dataset.activestatic;
    // console.log(e.currentTarget.dataset)
    // if (activeStatic === '0') return;
    let item = e.currentTarget.dataset.item;
    let index = e.currentTarget.dataset.index;

    clearTimeout(that.data.timers[index]);
    let l = item.like;
    if (item.like === 1) {
      let list = that.data.attTalkList;
      list.forEach(f => {
        if (f.id === item.id) {
          f.likeNum = f.likeNum - 1;
          f.like = 0;
          l = 0;
        }
      });
      that.setData({
        attTalkList: list
      });
    } else {
      let list = that.data.attTalkList;
      list.forEach(f => {
        if (f.id === item.id) {
          f.likeNum = f.likeNum + 1;
          f.like = 1;
          l = 1;
        }
      })
      that.setData({
        attTalkList: list
      })
    }
    that.setData({
      'timers[index]': setTimeout(() => {
        let method = 'POST';
        if (l === 1) {
          wx.request({
            url: url.activeAttTalkLike,
            method: 'POST',
            data: {
              attTalkId: e.currentTarget.dataset.item.id,
              userId: that.data.userInfo.id,
            }
          });
        } else {
          wx.request({
            url: url.activeAttTalkLike,
            method: 'PUT',
            data: {
              attTalkId: e.currentTarget.dataset.item.id,
              userId: that.data.userInfo.id,
            }
          });
        }
      }, 900)
    })
  },
  doMark() {
    const that = this;
    //第一次点 自动报名
    if (that.data.join === '0') {
      that.join();
    } else {
      //查询当天打卡次数
      wx.request({
        url: url.activeAttTalk + '/attTimes',
        method: 'GET',
        data: {
          activeId: that.data.activeId,
          userId: that.data.userInfo.id
        }, success(res) {
          console.log("打卡次数", res)
          that.setData({
            nowAttTimes: res.data
          })
          if (that.data.attTimes > res.data) {
            wx.navigateTo({
              url: '/pages/active/attTalk/index?id=' + that.data.activeId + '&name=' + that.data.active.activeName
            });
          } else {
            wx.showToast({
              title: that.data.btnTexts[1],
              icon: 'none'
            })
          }
        }
      })
    }

  },
  join(event) {
    let that = this;
    wx.showLoading({
      title: '请稍后...'
    });
    wx.request({
      url: url.activeJoin,
      method: 'POST',
      data: {
        activeId: that.data.activeId,
        activeName: that.data.activeName,
        userId: that.data.userInfo.id,
        userName: that.data.userInfo.nickname,
        userAvatar: that.data.userInfo.avatar,
        openId: that.data.userInfo.openid
      }, success(res) {
        that.setData({
          join: '1'
        })
        wx.navigateTo({
          url: '/pages/active/attTalk/index?id=' + that.data.activeId + '&name=' + that.data.active.activeName
        })
      }, complete(res) {
        wx.hideLoading();
      }
    })
  },
  tabSelect(e) {
    let id = e.currentTarget.dataset.id;
    if (id === 0) {
      this.setData({
        page: 0,
        TabCur: id,
        scrollLeft: (id - 1) * 60,
        sort: 'createTime,desc'
      });
    } else {
      this.setData({
        page: 0,
        TabCur: id,
        scrollLeft: (id - 1) * 60,
        sort: 'likeNum,desc'
      });
    }
    this.getAttTalkData();
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
  toDetail(e) {
  wx.navigateTo({
    url: "/pages/active/replayAtt/index?id="+e.currentTarget.dataset.id+"&name="+e.currentTarget.dataset.username
  })
},
toUseTalk(e) {
  wx.navigateTo({
    url: "/pages/active/attTalkList/index?userId=" + e.currentTarget.dataset.userid + "&name=" + e.currentTarget.dataset.name + "&activeId=" + e.currentTarget.dataset.activeid
  });
},
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let that = this;
    let pages = parseInt(that.data.totalElement / that.data.size) + 1;
    if (pages > that.data.page) {
      that.setData({
        isLoad: true
      })
      that.getAttTalkList();
    }
  },
  toWeb() {
    let that = this;
    if (that.data.active.webUrl !== null && that.data.active.webUrl !== "" ) {
      wx.navigateTo({
        url: that.data.active.webUrl
      });
    }
  },

  // /pages/my/userDetail/index?id=(userId)&tabShow=1&videoType=(需要显示的视频类型)
  
  toWeb2() {
    let that = this;
    if (that.data.active.webUrl2 !== null && that.data.active.webUrl2 !== "" ) {
      wx.navigateTo({
        url: that.data.active.webUrl2
      });
    }
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    const that = this;
    let data = that.data;
    return {
      title: data.activeName,
      path: "/pages/active/specialActive/index?id=" + data.id + "&activeId=" + data.activeId + "&attTimes=" + data.attTimes + "&activeName=" + data.activeName + "&logo=" + that.data.active.posterUrl + '&share=' + 1,
      imageUrl: that.data.active.posterUrl
    }
  },
  // onShareTimeline() {
  //   const that = this;
  //   let data = that.data;
  //   let active = this.data.active;
  //   var query = "id=" + data.id;
  //   return {
  //     title: data.activeName,
  //     imageUrl: data.logo,
  //     query
  //   }
  // }
})
