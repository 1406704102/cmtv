// pages/active/stepList/index.js
const url = require('../../../utils/url')
const util = require('../../../utils/util')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userId: '',
    userName: '',
    activeId: '',
    userInfo: {},
    timers: [],

    page: 0,
    size: 20,
    totalElement: 0,
    attTalkList: [],
    isLoad: true,
    likeIcon: 'unlike.png',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    that.setData({
      userId: options.userId,
      activeId: options.activeId,
      userName: options.userName
    })
    wx.getStorage({
      key: 'userInfo',
      success(res) {
        that.setData({
          userInfo: res.data
        })
        wx.request({
          url: url.activeAttStep,
          method: 'GET',
          data: {
            activeId: options.activeId,
            page: that.data.page,
            size: that.data.size,
            userId: options.userId,
            userId2: res.data.id,
            sort: "createTime,desc"
          }, success(res) {
            let allAttStepList = res.data.content;
            allAttStepList.forEach(f => {
              f.createTime = util.formatMonthDayHourMinute(new Date(f.createTime))
            })
            that.setData({
              allAttStepList: allAttStepList,
              totalElement: res.data.totalElements,
              isLoad: false
            });
          }
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
        userId: that.data.userId,
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

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function () {
  //
  // }
})
