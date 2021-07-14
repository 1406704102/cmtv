// pages/my/subFans/index.js
const app = getApp()
const url = require('../../../utils/url')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: '',
    nickname: '',
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    loadProgress: 0,
    tabList: ['订阅', '粉丝'],
    tabShow: '0',
    TabCur: '0',
    subList: [],
    fansList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    that.setData({
      id: options.id,
      TabCur: options.tabShow,
      tabShow: options.tabShow,
      nickname: options.nickname
    })
    if (options.tabShow === '0') {
      this.mySub();
    } else {
      this.myFans()
    }
  },
  mySub() {
    this.loadProgress()
    let that = this;
    //查询我的订阅
    wx.request({
      url: url.subscription,
      method: 'GET',
      data: {
        fansId: that.data.id,
        enable: '1'
      },
      success(res) {
        that.setData({
          subList: res.data.content,
          loadProgress: 100
        })
      }
    })
  },
  myFans() {
    this.loadProgress()
    let that = this;
    //查询我的订阅
    wx.request({
      url: url.subscription,
      method: 'GET',
      data: {
        subId: that.data.id,
        enable: '1'
      },
      success(res) {
        that.setData({
          fansList: res.data.content,
          loadProgress: 100

        })
      }
    })
  },
  unSub(e) {
    let that = this;
    this.loadProgress()
    wx.request({
      url: url.subscription,
      method: 'PUT',
      data: {
        subId: e.target.dataset.subid,
        fansId: that.data.id
      }, success(res) {
        console.log(res);
        let subList = that.data.subList;
        let predicate = res.data;
        subList.splice(subList.findIndex(predicate => predicate.id === e.target.dataset.subid), 1);
        that.setData({
          subList: subList,
          loadProgress: 100
        })
        wx.showToast({
          title: '取消订阅',
          icon: "none"
        })
      }
    })
  },
  loadProgress() {
    this.setData({
      loadProgress: this.data.loadProgress + 20
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
    wx.getStorage({
      key: "userInfo",
      success(res) {
        if (e.currentTarget.dataset.id === 0) {
          that.mySub()
        }
        if (e.currentTarget.dataset.id === 1) {
          that.myFans()
        }

      }
    })
    that.setData({
      loadProgress: 0
    })

    this.setData({
      TabCur: e.currentTarget.dataset.id + '',
      scrollLeft: (e.currentTarget.dataset.id - 1) * 60,
      tabShow: e.currentTarget.dataset.id + '',
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

  },

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function () {
  //
  // }
})
