// pages/my//showUser/index.js
const url = require('../../../utils/url')
const util = require('../../../utils/util')
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getIndexShow();
  },
  getIndexShow() {
    let that = this;
    wx.request({
      url: url.userInfo + 'getMRCO',
      method: "GET",
      success(res) {
        let data = []
        data = res.data;
        let tabName = [];
        data.forEach(f => {
          let d = {};
          d.name = f.nickname;
          tabName.push(d);
          // f.likeNum = util.makeFriendly(f.likeNum)
          f.fansNum = util.makeFriendly(f.fansNum)
        })
        console.log(data)
        that.setData({
          tabName: tabName,
          indexShow: data
        })
      }
    })
  },
  toUserDetail(event) {
    wx.navigateTo({url: '/pages/my/userDetail/index?id=' + event.currentTarget.dataset.item.id + event.currentTarget.dataset.tabshow})
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
