// pages/my/sign/index.js
const url = require('../../../utils/url')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    name: '',
    school: '',
    major: '',
    class: '',
    userInfo: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
    const that = this;
    wx.getStorage({
      key: 'userInfo',
      success(res) {
        that.setData({
          userInfo: res.data
        })
      }, fail(res) {
        wx.navigateTo({
          url: '/pages/my/login/login'
        })
      }
    })
  },
  sign() {
    const that = this;
    var _data = that.data;
    if (_data.name !== '' && _data.school !== '' && _data.major !== '' && _data.class !== '') {
      let information = '姓名:' + _data.name + ';学校:' + _data.school + ';系别:' + _data.major + ';班级:' + _data.class;
      wx.request({
        url: url.userInfo + 'setSignInformation',
        method: 'get',
        data: {
          userId: _data.userInfo.id,
          information: information
        }, success(res) {
          wx.showToast({
            title:'报名成功！'
          })
          setTimeout(() => {
            wx.switchTab({
              url: "/pages/live/home/index"
            })
          }, 1000);
        }
      })
    } else {
      wx.showToast({
        title: '请填填写报名信息',
        icon:'none'
      })
    }

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
