// pages/active/activeDetailNew/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pic: "",
    name: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.type === 'detail') {
      this.setData({
        name: '活动规则'
      });
    }else if (options.type === 'winner') {
      this.setData({
        name: '获奖名单'
      });
    } else if(options.type === 'answerSynopsis'){
      this.setData({
        name: '人物介绍'
      });
    }else if (options.type === 'questionScope') {
      this.setData({
        name: '提问范围'
      });
    } else {
      this.setData({
        name: '上传声明'
      });
    }
    this.setData({
      pic: options.pic
    });
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
