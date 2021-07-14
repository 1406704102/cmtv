// pages/active/detailTalk/index.js
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
    join: '0',
    joinNum: 0,
    joinList: [],
    hotList: [],
    nowAttTimes: 0,

    page: 0,
    size: 10,
    totalElement: 0,
    attTalkList: [],
    isLoad: true,
    likeIcon: 'unlike.png',

    share: 0,

    timers: [],

    HFShow: false,

    modalName: '',

    btnText: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("onLoad",options)
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
        })
      }
    });
    wx.request({
      url: url.activeInfo + '/' + options.id,
      method: 'GET',
      success(res) {
        let active = res.data;
        active.startTime = util.formatYearMonthDay(new Date(active.startTime));
        active.endTime = util.formatYearMonthDay(new Date(active.endTime));
        const btnText = active.btnText.split(',');
        console.log(btnText)
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
              })
              //查询当天打卡次数
              wx.request({
                url: url.activeAttTalk + '/attTimes',
                method: 'GET',
                data: {
                  activeId: options.id,
                  userId: that.data.userInfo.id
                }, success(res) {
                  that.setData({
                    nowAttTimes: res.data
                  })
                }
              })
            }else {
              that.setData({
                modalName: 'Image'
              })
            }
          }
        })
      }
    })
    //查询参加用户
    wx.request({
      url: url.activeJoin,
      method: 'GET',
      data: {
        page: 0,
        size: 6,
        activeId: options.id,
        sort: 'heat,desc'
      }, success(res) {
        that.setData({
          joinList: res.data.content
        })
      }
    })
    //查询热度用户
    wx.request({
      url: url.activeJoin,
      method: 'GET',
      data: {
        page: 0,
        size: 5,
        activeId: options.id,
        sort: 'heat,desc'
      }, success(res) {
        that.setData({
          hotList: res.data.content
        })
      }
    })
    //分页查询打卡信息
    wx.getStorage({
      key: 'userInfo',
      success(r) {
        wx.request({
          url: url.activeAttTalk,
          method: 'GET',
          data: {
            activeId: options.id,
            page: that.data.page,
            size: that.data.size,
            userId2: r.data.id,
            sort: 'isTop,topTime,desc'
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
        activeId: that.data.active.id,
        page: that.data.page,
        size: that.data.size,
        userId2: that.data.userInfo.id,
        sort: 'isTop,topTime,desc'
      }, success(res) {

        let arr = res.data.content;
        arr.forEach(f => {
          f.createTime = util.formatMonthDayHourMinute(new Date(f.createTime))
        })
        that.setData({
          attTalkList: that.data.attTalkList.concat(arr),
        })
      },complete(res) {
        that.setData({
          isLoad: false
        })
      }
    })
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
        userAvatar: that.data.userInfo.avatar,
        openId: that.data.userInfo.openid
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
  joinList() {
    let that = this;
    wx.navigateTo({
      url: '/pages/active/joinList/index?id=' + that.data.active.id + '&name=' + that.data.active.activeName
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
    console.log(index)
    console.log(typeof(index))
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
  showDetail(e) {
    let id = e.currentTarget.dataset.item.id;
    wx.navigateTo({
      url: '/pages/active/activeDetail/index?id=' + id
    })
    // this.setData({
    //   HFShow: true
    // })
  },
  hideHF() {
    this.setData({
      HFShow: false
    })
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
  hideModal() {
    this.setData({
      modalName:''
    })
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
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    let active = this.data.active;
    return {
      title: active.activeName,
      path: '/pages/active/detailTalk/index?id=' + active.id + '&share=' + 1,
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
