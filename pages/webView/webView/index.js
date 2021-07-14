// pages/webView/webView/index.js
const url = require('../../../utils/url')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    src: "",
    text: '返回'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options.src)
      this.setData({
        src: options.src
      })
    const that = this;
    if (options.share === "1") {
      console.log(options)
      that.setData({
        share: 1,
        text: '主页'
      })
    }
    wx.request({
      // url: url.banner + "active",
      url: url.banner,
      method: "GET",
      data: {
        enable: 1
      },
      success(res) {
        console.log(res.data);
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
   *
   */
  onShareAppMessage: function () {
    let src = this.data.src;
    return {
      // title: '视频彩铃 联通专区',
      path: '/pages/webView/webView/index?src=' + src + '&share=' + 1,
    }
  },
  onShareTimeline() {
    let src = this.data.src;
    return {
      query: 'src=' + src + '&share=' + 1
    }
  }
})
