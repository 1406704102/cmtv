// pages/active/allActive/index.js
const url = require('../../../utils/url')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLoad: true,

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this;
    wx.request({
      url: url.activeInfoTalkNew,
      method: "GET",
      data: {
        size: 1000,
        page: 0,
        enable: '1',
        sort: 'topNum,createTime,desc'
      }, success(res) {
        var list = res.data.content;
        list.forEach(f=>{

            let label = f.label;
          var labels = label.split(",");
          f.labels = labels;
        })
        that.setData({
          activeNewList: list
        })
        wx.request({
          url: url.activeInfo,
          method: 'GET',
          data: {
            page: 0,
            size: 1000,
            enable: 1,
            sort: 'top,desc'
          },
          success(res) {
            that.setData({
              activeList: res.data.content,
              isLoad: false
            });
          }
        })
      }
    })

  },
  toNewDetail(e) {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/active/detailTalk-new/index?id=' + id
    })
    console.log(id)
  },
  activeDetail(event) {
    wx.getStorage({
      key: 'userInfo',
      success(res) {
        let item = event.currentTarget.dataset.item;
        console.log("item", item);
        if (item.activeType === '0') {
          wx.navigateTo({
            url: "/pages/active/detailTalk/index?id=" + item.id
          });
        } else if (item.activeType === '1') {
          wx.navigateTo({
            url: "/pages/active/detailStep/index?id=" + item.id
          });
        } else {
          wx.navigateTo({
            url: "/pages/active/specialActive/index?id=" + item.specialId + "&activeId=" + item.id + "&attTimes=" + item.attendanceTimes + "&activeName=" + item.activeName + "&logo=" + item.activeLogo
          });
        }
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
