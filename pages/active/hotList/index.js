// pages/active/hotList/index.js
const url = require('../../../utils/url')
const util = require('../../../utils/util')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: '',
    name: '',
    page: 0,
    size: 20,
    hotList: [],
    totalElement: 0,
    isLoad: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    that.setData({
      id: options.id,
      name: options.name,
    })
    //查询所有报名用户
    wx.request({
      url: url.activeJoin,
      method: 'GET',
      data: {
        page: that.data.page,
        size: that.data.size,
        activeId:options.id,
        sort: 'heat,desc'
      }, success(res) {
        that.setData({
          hotList: res.data.content,
          totalElement:res.data.totalElements,
          isLoad: false
        })
      }
    })
  },
  getHotList() {
    let that = this;
    that.setData({
      page: that.data.page + 1,
    })
    wx.request({
      url: url.activeJoin,
      method: 'GET',
      data: {
        page: that.data.page,
        size: that.data.size,
        activeId:that.data.id,
        sort: 'heat,desc'
      }, success(res) {
        let l = res.data.content;
        that.setData({
          hotList: that.data.hotList.concat(l),
          isLoad: false
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
    let that = this;
    let pages = parseInt(that.data.totalElement / that.data.size) + 1;
    console.log(pages);
    if (pages > that.data.page) {
      that.setData({
        isLoad: true
      })
      that.getHotList();
    }
  },

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function () {
  //
  // }
})
