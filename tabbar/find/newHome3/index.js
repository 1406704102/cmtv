// tabbar/find/newHome3/index.js
const url = require('../../../utils/url')
const util = require('../../../utils/util')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    videoList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    wx.getStorage({
      key: 'userInfo',
      success(res) {
        wx.request({
          url: url.video + '/getAll',
          method: 'GET',
          data: {
            userId: res.data.id,
            videoId: '3e026d9e4da846dba08799a13469d7f0'
          }
          , success(res) {
            let videoList = res.data;
            that.setData({
              videoList: videoList
            })
            // const videos = that.genVideo(videoList.length, videoList);
            // setTimeout(() => {
            //   that.setData({
            //     videos
            //   });
            // }, 10);
            // wx.hideLoading();

          }
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
  onShareAppMessage: function () {

  }
})
