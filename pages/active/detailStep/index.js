const url = require('../../../utils/url')
const util = require('../../../utils/util')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    active: {},
    userInfo: {},
    activeJoin: {},
    attStep: {},
    join: '0',
    joinNum: 0,

    attStepList: [],
    AllAttStepList: [],
    totalElement: 0,
    page: 0,
    size: 10,

    timers: [],
    stepRank: '*',
    stepNum: '....',
    haveMy: 0,
    tabShow: '0',
    TabCur: 0,
    tabList: ['今日步数排行', '累计步数排行'],

    stepListDay: 'stepListDay',
    stepListAll: 'stepListAll',

    joinRankAllList: [],
    joinRankAll: 1,

    share: 0,
    HFShow: false,
    modalName: '',
    btnText: []
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
    wx.getStorage({
      key: 'userInfo',
      success(res) {
        that.setData({
          userInfo: res.data
        });
        wx.request({
          url: url.activeInfo + '/' + options.id,
          method: 'GET',
          success(res) {
            let active = res.data;
            console.log("active", active);
            active.startTime = util.formatYearMonthDay(new Date(active.startTime));
            active.endTime = util.formatYearMonthDay(new Date(active.endTime));
            const btnText = active.btnText.split(',');
            that.setData({
              active: active,
              btnText: btnText,
              joinNum: active.joinNum
            })
            //查询是否参加
            wx.request({
              url: url.activeJoin + '/findByAIdAndUId',
              method: "GET",
              data: {
                activeId: that.data.active.id,
                userId: that.data.userInfo.id,
              }, success(res) {
                if (res.data !== '') {
                  that.setData({
                    join: '1',
                    activeJoin: res.data
                  });
                } else {
                  that.setData({
                    modalName: 'Image'
                  })
                }
                //查询当天打卡次数
                wx.request({
                  url: url.activeAttStep + '/attTimes',
                  method: 'GET',
                  data: {
                    activeId: options.id,
                    userId: that.data.userInfo.id
                  }, success(res) {
                    that.setData({
                      nowAttTimes: res.data.length
                    })
                    //获取今天的步数打卡
                    if (res.data.length !== 0) {
                      that.setData({
                        attStep: res.data[0],
                        haveMy: res.data.length
                      })
                    }
                  }
                });
              }
            });
          }
        })
        that.getDayRank(options.id);
        //获取今日步数排名列表
        that.getDayRankList(options.id);

        //查询我的累计打卡数据
        //累计排名
        //累计排名list
        that.getJoinRank(options.id);
        wx.getStorage({
          key: 'userInfo',
          success(res) {
            //获取所有步数打卡
            wx.request({
              url: url.activeAttStep,
              method: 'GET',
              data: {
                activeId: options.id,
                page: that.data.page,
                size: that.data.size,
                userId2: res.data.id,
                sort: "createTime,desc"
              }, success(res) {
                let allAttStepList = res.data.content;
                allAttStepList.forEach(f => {
                  f.createTime = util.formatMonthDayHourMinute(new Date(f.createTime))
                })
                that.setData({
                  allAttStepList: allAttStepList,
                  totalElement: res.data.totalElements
                });
              }
            });
          }
        })
        that.getStep()

      },fail(res) {
        wx.navigateTo({
          url: '/pages/my/login/login?type=0&id=' + options.id
        })
      }
    })
    //和打卡数
    //获取浏览数
    wx.request({
      url: url.activeAttTalk + '/getViewPlusOne',
      method: 'get',
      data: {
        activeId: options.id
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
        activeId: options.id
      }, success(res) {
        that.setData({
          markNum: res.data
        })
      }
    })
    //查询累计
  },
  getJoinRank(id) {
    let that = this;
    wx.getStorage({
      key: 'userInfo',
      success(res) {
        wx.request({
          url: url.activeJoin,
          method: 'GET',
          data: {
            activeId: id,
            userId: res.data.id
          }, success(res) {
            that.setData({
              myJoinRank: res.data.content[0]
            })
          }
        })
        wx.request({
          url: url.activeAttStep + '/stepRankAll',
          method: 'GET',
          data: {
            activeId: id,
            userId: res.data.id
          }, success(res) {
            that.setData({
              joinRankAll: res.data
            })
          }
        })
        wx.request({
          url: url.activeAttStep + '/stepRankAllList',
          method: 'GET',
          data: {
            activeId: id
          }, success(res) {
            const l = []
            const data = res.data
            for (var v = 0; v < data.length; v++) {
              if (v < 5) {
                l.push(data[v]);
              }
            }
            that.setData({
              joinRankAllList: l
            })
          }
        })
      }
    })

  },
  getDayRank(id) {
    let that = this;
    //查询 我的排名
    wx.getStorage({
      key: 'userInfo',
      success(res) {
        wx.request({
          url: url.activeAttStep + '/stepRankDay',
          method: 'GET',
          data: {
            activeId: id,
            userId: res.data.id
          }, success(res) {
            that.setData({
              stepRankDay: res.data
            })
          }
        })
      }
    })
  },
  //获取今日步数排名列表
  getDayRankList(id) {
    let that = this;
    wx.request({
      url: url.activeAttStep + '/stepRankList',
      method: 'GET',
      data: {
        activeId: id,
      }, success(res) {
        let attStepList = res.data;
        let l = [];
        for (let v = 0; v < attStepList.length; v++) {
          if (v < 5) {
            l.push(attStepList[v])
          }
        }
        that.setData({
          attStepList: l
        })
      }
    })
  },
  getAllAttStepList() {
    let that = this;
    that.setData({
      page: that.data.page + 1
    })
    //获取所有步数打卡
    wx.request({
      url: url.activeAttStep,
      method: 'GET',
      data: {
        activeId: that.data.active.id,
        page: that.data.page,
        size: that.data.size,
        userId2: that.data.userInfo.id,
        sort: "createTime,desc"
      }, success(res) {
        let items = res.data.content;
        items.forEach(f => {
          f.createTime = util.formatMonthDayHourMinute(new Date(f.createTime))
        })
        that.setData({
          allAttStepList: that.data.allAttStepList.concat(items),
          isLoad: false
        });
      }
    })
  },
  tabSelect(e) {
    let that = this;
    // this.loadProgress()
    if (e.currentTarget.dataset.id === 0) {

    } else {

    }

    this.setData({
      TabCur: e.currentTarget.dataset.id + '',
      scrollLeft: (e.currentTarget.dataset.id - 1) * 60,
      tabShow: e.currentTarget.dataset.id + '',
    });
  },

  join(event) {
    let that = this;
    wx.showLoading({
      title: '报名中...'
    });
    wx.request({
      url: url.activeJoin,
      method: 'POST',
      data: {
        activeId: that.data.active.id,
        activeName: that.data.active.activeName,
        userId: that.data.userInfo.id,
        userName: that.data.userInfo.nickname,
        userAvatar: that.data.userInfo.avatar
      }, success(res) {
        that.setData({
          join: '1',
          'active.joinNum': that.data.joinNum + 1
        })
      }, complete(res) {
        wx.hideLoading();
      }
    })
  },
  getStep() {
    let that = this;
    console.log('getStep');
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
                      stepNum: res.data.stepInfoList[30].step
                    })
                  }
                })
              },fail(res) {
                console.log("失败")
              }
            })
          },fail(res) {
            console.log("失败")
          }
        })
      }
    })

  },
  doStep() {
    let that = this;
    let active = that.data.active;
    if (typeof that.data.stepNum === 'number') {
      if (that.data.stepNum < active.stepNum) {
        wx.showToast({
          title: '最低步数为' + active.stepNum + '步,请再走动走动吧!',
          icon: 'none',
          duration: 3000
        });
      } else {
        wx.showLoading({
          title: '打卡中'
        });
        wx.request({
          url: url.activeAttStep,
          method: 'POST',
          data: {
            activeId: active.id,
            activeName: active.activeName,
            userId: that.data.userInfo.id,
            userName: that.data.userInfo.nickname,
            userAvatar: that.data.userInfo.avatar,
            stepNum: that.data.stepNum
          }, success(res) {
            let l = [];
            let items1 = res.data;
            l.push(items1);
            let items = that.data.allAttStepList;
            items1.like = 0;
            items1.createTime = util.formatMonthDayHourMinute(new Date(items1.createTime));
            that.setData({
              attStep: items1,
              haveMy: 1,
              nowAttTimes: 1,
              allAttStepList: l.concat(items)
            })

            that.getDayRank(active.id)
            that.getDayRankList(active.id)
            that.getJoinRank(active.id);
          }, complete(res) {
            wx.hideLoading();
          }
        });
      }
    }


  },
  doLike(e) {
    let that = this;
    let index = e.currentTarget.dataset.index;
    clearTimeout(that.data.timers[index]);
    let item = e.currentTarget.dataset.item;
    let l = item.like;
    if (item.like === 1) {
      let list = that.data.allAttStepList;
      list.forEach(f => {
        if (f.id === item.id) {
          f.likeNum = f.likeNum - 1;
          f.like = 0;
          l = 0;
        }
      });
      that.setData({
        allAttStepList: list
      });
    } else {
      let list = that.data.allAttStepList;
      list.forEach(f => {
        if (f.id === item.id) {
          f.likeNum = f.likeNum + 1;
          f.like = 1;
          l = 1;
        }
      })
      that.setData({
        allAttStepList: list
      })
    }
    that.setData({
      'timers[index]': setTimeout(() => {
        if (l === 1) {
          wx.request({
            url: url.activeAttTalkLike + '/createStepLike',
            method: 'POST',
            data: {
              attTalkId: e.currentTarget.dataset.item.id,
              userId: that.data.userInfo.id,
            }
          });
        } else {
          wx.request({
            url: url.activeAttTalkLike + '/updateStepLike',
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
    let that = this;
    let pages = parseInt(that.data.totalElement / that.data.size) + 1;
    if (pages > that.data.page) {
      that.setData({
        isLoad: true
      })
      that.getAllAttStepList();
    }
  },
  showDetail(e) {
    let id = e.currentTarget.dataset.item.id;
    wx.navigateTo({
      url: '/pages/active/activeDetail/index?id=' + id
    })
  },
  hideModal() {
    this.setData({
      modalName: ''
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    let active = this.data.active;
    return {
      title: active.activeName,
      path: '/pages/active/detailStep/index?id=' + active.id + '&share=' + 1,
      imageUrl: active.activeLogo
    }
  },
  onShareTimeline() {
    let active = this.data.active;
    var query = "id=" + active.id;
    return {
      title: active.activeName,
      imageUrl: active.activeLogo,
      query
    }
  }
})
