// pages/active/replayAtt/index.js
const url = require('../../../utils/url')
const util = require('../../../utils/util')
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: '',
    name: '',
    replayId: '',
    replayUserId: '',
    replayName: '',
    replayDetail: '',
    answer: {},
    userInfo: {},
    timers: [],
    timer: {},
    share: 0,
    canSub: true,
    typeList: ['最新', '最热'],
    typeId: 0,
    btn: false,
    focus: false,
    placeholder: '问点什么吧~',
    showIndex: [],
    replayType: '0',
    replayIndex: -1,
    options: {},
    sort: "hotNum,createTime,desc",
    replayPage: 0,
    activeAttTalkReplays: [],
    activeAttTalkReplaysTotal: 0,


    timeline: 0,
    bgImage: '',
    color: 'white',

    viewNum:0,
    markNum: 0,
    tag: [],
    CustomBar: app.globalData.CustomBar,
    isFixed: false,
    idTop: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getIdTop()

    let that = this;
    console.log(options)
    wx.showLoading({
      title: '加载中...'
    })
    if (options.share) {
      that.setData({
        share: 1,
      })
    }
    if (options.timeline) {
      that.setData({
        timeline: 1,
      })

      //查询打卡信息
      wx.request({
        url: url.activeAttTalk + '/findById',
        method: 'GET',
        data: {
          id: options.id,
          userId: ''
        },
        success(res) {
          let att = res.data;
          att.createTime = util.formatMonthDayHourMinute(new Date(att.createTime));
          that.setData({
            attTalk: att,
            replayUserId: att.userId,
            replayName: att.userName,
          });
          that.getReplays();

        }
      })
    }
    wx.request({
      url: url.answerInfo,
      method: 'GET',
      data:{
        userId:options.userId
      },success(res) {
        var answer = res.data.content[0];
        var split = answer.answerTag.split(',');
        console.log(answer);
        that.setData({
          answer: answer,
          tag: split,
          replayId: answer.id,
          replayUserId:answer.userId,
          replayName: answer.replayName,
        })
        that.getReplays(answer);
      }
    })
    that.setData({
      // id: options.id,
      options: options,
      replayPage: 0
    });
    wx.getStorage({
      key: 'userInfo',
      success(re) {
        that.setData({
          userInfo: re.data
        })
        // //查询打卡信息
        // wx.request({
        //   url: url.activeAttTalk + '/findById',
        //   method: 'GET',
        //   data: {
        //     id: that.data.id,
        //     userId: re.data.id
        //   },
        //   success(res) {
        //     let att = res.data;
        //     att.createTime = util.formatMonthDayHourMinute(new Date(att.createTime));
        //     that.setData({
        //       attTalk: att,
        //       replayUserId: att.userId,
        //       replayName: att.userName,
        //     });
        //     that.getReplays();
        //
        //   }
        // })
      }, fail(res) {
        wx.navigateTo({
          url: '/pages/my/login/login?type=0&id=' + options.id + '&name=' + options.name
        })
      }
    })
  },
  getToReplay(id, i, data) {
    let that = this;
    wx.showLoading()
    wx.request({
      url: url.activeAttTalkReplay,
      method: 'GET',
      data: {
        attTalkId: id,
        sort: that.data.sort,
        enable: '1',
        size: 1000
      }, success(res) {
        var content = res.data.content;
        content.forEach(o => {
          o.createTime = util.formatMonthDayHourMinute(new Date(o.createTime));
        });
        data[i].replays = content;
        console.log(data);
        wx.hideLoading()
        that.setData({
          activeAttTalkReplays: data
        });
      }
    })
  },
  getReplays(answer) {

    let that = this;
    // console.log(answer.id);
    wx.request({
      url: url.activeAttTalkReplay,
      method: 'GET',
      data: {
        answerId: answer.id,
        userId: that.data.userInfo.id,
        sort: that.data.sort,
        page: that.data.replayPage,
        size: 10,
        enable: '1'
      }, success(r) {
        var c = r.data.content;
        console.log(c)
        if (c.length > 0) {
          c.forEach((f, i) => {
            f.createTime = util.formatMonthDayHourMinute(new Date(f.createTime));
          })
        }
        wx.hideLoading()
        if (that.data.replayPage === 0) {
          that.setData({
            activeAttTalkReplays: c,
            activeAttTalkReplaysTotal: r.data.totalElements
          });
        } else {
          that.setData({
            activeAttTalkReplays: that.data.activeAttTalkReplays.concat(c),
            activeAttTalkReplaysTotal: r.data.totalElements
          });
        }
      }, fail(res) {
        that.setData({
          replayPage: that.data.replayPage - 1
        })
      }
    })

  },
  submit() {
    let that = this;

    if (that.data.replayDetail !== '') {

      wx.showLoading({
        title: '加载中...',
      });
      let type = '';
      if (that.data.replayType === '0') {
        type = 'toAnswer';
      } else {
        type = 'toAnswerReplay'
      }
      that.setData({
        canSub: false
      });
      wx.request({
        url: url.activeAttTalkReplay,
        method: 'POST',
        data: {
          attTalkId: that.data.replayId,
          userId: that.data.userInfo.id,
          userName: that.data.userInfo.nickname,
          userAvatar: that.data.userInfo.avatar,
          replayUserId: that.data.replayUserId,
          replayName: that.data.replayName,
          replayDetail: that.data.replayDetail,
          type: type,
          likeNum: 0,
          enable: 1
        }, success(res) {
          if (res.data !== 600) {
            let arr = [];
            let item = res.data;
            console.log(item)
            item.createTime = util.formatMonthDayHourMinute(new Date(item.createTime));
            item.like = 0;
            arr.push(item);
            if (that.data.replayType === '0') {
              let concat = arr.concat(that.data.activeAttTalkReplays);
              that.setData({
                activeAttTalkReplays: concat,
              });
            } else {
              // if (that.data.replayIndex === 0) {
              let activeAttTalkReplays = that.data.activeAttTalkReplays;
              activeAttTalkReplays.forEach((f, i) => {
                if (i === that.data.replayIndex) {
                  let a = [];
                  a.push(item)
                  f.replayShow = true;
                  f.replaySum = f.replaySum + 1;
                  if (f.replays === undefined) {
                    that.getToReplay(that.data.replayId, i, activeAttTalkReplays)
                  } else {
                    f.replays = a.concat(f.replays);
                    that.setData({
                      activeAttTalkReplays: activeAttTalkReplays,
                    })
                  }
                }
              })
              // console.log(attTalk)

              // }
            }
            that.setData({
              replayDetail: '',
              replayId: that.data.answer.id,
              replayUserId: that.data.answer.userId,
              replayName: that.data.answer.replayName,

              // focus: true,
              placeholder: '问点什么吧~',
              replayType: '0',
            });
            wx.hideLoading();
            // that.onLoad(that.data.options);
          } else {
            wx.hideLoading();

            wx.showToast({
              title: '请输入合法内容!',
              icon: "none"
            })
          }
          that.setData({
            canSub: true
          })
        }
      });
    } else {
      wx.showToast({
        title: '请输入内容!',
        icon: "none"
      })
    }
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

    if (that.data.timeline === 1) {
      wx.showToast({
        title: '请前往小程序使用完整服务',
        icon: "none"
      })
    } else {

      let item = e.currentTarget.dataset.item;
      let index = e.currentTarget.dataset.index;
      clearTimeout(that.data.timers[index]);
      let l = item.like;
      if (item.like === 1) {
        let list = that.data.activeAttTalkReplays;
        list.forEach(f => {
          if (f.id === item.id) {
            f.likeNum = f.likeNum - 1;
            f.like = 0;
            l = 0;
          }
        });
        that.setData({
          activeAttTalkReplays: list
        });
      } else {
        let list = that.data.activeAttTalkReplays;
        list.forEach(f => {
          if (f.id === item.id) {
            f.likeNum = f.likeNum + 1;
            f.like = 1;
            l = 1;
          }
        })
        that.setData({
          activeAttTalkReplays: list
        })
      }
      that.setData({
        'timers[index]': setTimeout(() => {
          if (l === 1) {
            wx.request({
              url: url.activeAttTalkLike,
              method: 'POST',
              data: {
                attTalkReplayId: e.currentTarget.dataset.item.id,
                userId: that.data.userInfo.id,
              }
            });
          } else {
            wx.request({
              url: url.activeAttTalkLike,
              method: 'PUT',
              data: {
                attTalkReplayId: e.currentTarget.dataset.item.id,
                userId: that.data.userInfo.id,
              }
            });
          }
        }, 900)
      })
    }

  },
  doLike2(e) {
    console.log("doLike22")
    let that = this;
    if (that.data.timeline === 1) {
      wx.showToast({
        title: '请前往小程序使用完整服务',
        icon: "none"
      })
    } else {
      wx.getStorage({
        key: 'userInfo',
        success(res) {
          let item = e.currentTarget.dataset.item;
          clearTimeout(that.data.timers);
          let l = item.like;
          if (item.like === 1) {
            let f = that.data.attTalk;

            f.likeNum = f.likeNum - 1;
            f.like = 0;
            l = 0;
            that.setData({
              attTalk: f
            });
          } else {
            let f = that.data.attTalk;

            f.likeNum = f.likeNum + 1;
            f.like = 1;
            l = 1;
            that.setData({
              attTalk: f
            })
          }
          that.setData({
            'timers': setTimeout(() => {
              if (l === 1) {
                wx.request({
                  url: url.activeAttTalkLike,
                  method: 'POST',
                  data: {
                    attTalkId: e.currentTarget.dataset.item.id,
                    userId: res.data.id,
                  }
                });
              } else {
                wx.request({
                  url: url.activeAttTalkLike,
                  method: 'PUT',
                  data: {
                    attTalkId: e.currentTarget.dataset.item.id,
                    userId: res.data.id,
                  }
                });
              }
            }, 900)
          });
        }, fail(res) {
          wx.navigateTo({
            url: '/pages/my/login/login'
          })
        }
      })
    }

  },
  onfocus(e) {
    console.log(e)
    this.setData({
      btn: !this.data.btn
    })
  },
  blur() {


  },
  hideModal() {
    this.setData({
      focus: false,
    })
  },
  replayClick3(e) {
    let that = this;
    that.setData({
      replayDetail: '',
      replayId: e.currentTarget.dataset.item.id,
      replayUserId: e.currentTarget.dataset.item.userId,
      replayName: e.currentTarget.dataset.item.userName,

      // focus: true,
      placeholder: '问点什么吧~',
      replayType: e.currentTarget.dataset.type,
      replayIndex: e.currentTarget.dataset.index
    })
  },
  replayClick(e) {
    let that = this;
    that.setData({
      replayDetail: '',
      replayId: e.currentTarget.dataset.item.id,
      replayUserId: e.currentTarget.dataset.item.userId,
      replayName: e.currentTarget.dataset.item.userName,

      focus: true,
      placeholder: '回复 ' + e.currentTarget.dataset.item.userName + '：',
      replayType: e.currentTarget.dataset.type,
      replayIndex: e.currentTarget.dataset.index
    })
  },
  replayClick2(e) {
    let that = this;
    console.log('e.currentTarget.dataset.index', e.currentTarget.dataset.index);
    that.setData({
      replayDetail: '',
      replayId: e.currentTarget.dataset.item.id,
      replayUserId: e.currentTarget.dataset.item2.userId,
      replayName: e.currentTarget.dataset.item2.userName,

      focus: true,
      placeholder: '回复 ' + e.currentTarget.dataset.item2.userName + '：',
      replayType: 2,
      replayIndex: e.currentTarget.dataset.index
    })
  },
  showReplay(e) {
    let that = this;
    // console.log( that.data.attTalk.activeAttTalkReplays)
    var forEach = that.data.activeAttTalkReplays
    forEach.forEach((item, i) => {
      if (i === e.currentTarget.dataset.index) {
        // console.log(i);
        item.replayShow = !item.replayShow
        if (item.replayShow) {
          that.getToReplay(item.id, i, forEach);
        } else {
          that.setData({
            activeAttTalkReplays: forEach
          })
        }
      }
    });
    // console.log(forEach);

    // that.setData({
    //     'attTalk.activeAttTalkReplays': forEach
    // })
    // console.log(that.data.attTalk.activeAttTalkReplays[e.currentTarget.dataset.index]);

  },
  selectSort: function (e) {
    var typeId = e.currentTarget.dataset.index;
    console.log(typeof (typeId));
    if (typeId === 0) {
      this.setData({
        typeId: typeId,
        sort: 'hotNum,createTime,desc'
      });
    } else {
      this.setData({
        typeId: typeId,
        sort: 'hotNum,likeNum,desc'
      });
    }
    this.onLoad(this.data.options)
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
    //和打卡数
    //获取浏览数
    wx.request({
      url: url.activeAttTalk + '/getViewPlusOne',
      method: 'get',
      data: {
        activeId: that.data.answer.id
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
        activeId: that.data.answer.id
      }, success(res) {
        that.setData({
          markNum: res.data
        })
      }
    })

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
    console.log('onPullDownRefresh');
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let that = this;
    var page = parseInt(that.data.activeAttTalkReplaysTotal / 10);
    if (page > that.data.replayPage) {
      that.setData({
        replayPage: that.data.replayPage + 1
      });
      wx.showLoading()
      this.getReplays(that.data.answer);
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    var options = this.data.options;
    var answer = this.data.answer;
    return {
      title: answer.answerName + ',问答',
      path: "pages/find/qa/index?userId=" + options.userId + "&share=" + 1,
      // imageUrl: active.activeLogo
    }
  },
  onShareTimeline() {
    var attTalk = this.data.attTalk;
    return {
      title:attTalk.attDetail,
      query: 'id=' + attTalk.id + '&timeline=1&name=' + attTalk.userName + '&share=' + 1
    }
  },
  // 监听屏幕滚动 判断上下滚动 bindscroll
  onPageScroll: function (ev) {
    let that = this;
    if (ev.scrollTop >= this.data.idTop - this.data.CustomBar) {
      if (!this.data.p) {

        this.setData({
          bgImage: 'http://cmtv.xmay.cc/image/live/bg_01.png',
          p: true,
          answerName: that.data.answer.answerName
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
          p: false,
          answerName: ""
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
