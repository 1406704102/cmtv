// pages/find/home/index.js
const url = require('../../../utils/url')
const util = require('../../../utils/util')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    swiperList: [],
    livingData: [],
    videoData: [],
    unReady: true,
    size: 10,
    page: 0,
    videoNum: 0,
    liveNum: 0,
    isLoad: true
  },
  showModal(e) {
    console.log(e)
    let message = e.currentTarget.dataset.item;
    if (message.liveKUrl !== null || message.liveDUrl !== null) {
      this.setData({
        modalName: e.currentTarget.dataset.target,
        clickItem: message,
      });
    } else {
      wx.navigateTo({
        url: 'plugin-private://wx2b03c6e691cd7370/pages/live-player-plugin?room_id='+message.liveWxId
      })
    }
  },
  hideModal(e) {
    this.setData({
      modalName: null
    })
  },
  copyUrl(e) {
    let that = this;
    let url = '';
    let toast = ''
    if (e.currentTarget.dataset.type === 'k') {
      url = that.data.clickItem.liveKUrl;
      toast = '打开快手观看'
    } else {
      url = that.data.clickItem.liveDUrl;
      toast = '打开抖音观看'
    }
    console.log(url)
    //获取剪切板内容
    wx.getClipboardData({
      success(res) {
        wx.setClipboardData({
          data: url,
          success(res) {
            wx.showToast({
              title: toast
            })
          }
        })
      }
    });
    this.hideModal();
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
//获取banner
    wx.request({
      url: url.banner,
      method: "GET",
      data: {
        bannerType: 'find',
        enable: 1
      },
      success(res) {
        that.setData({
          swiperList: res.data.content,
          bReady: false
        })
      }
    })
    //获取直播
    wx.request({
      url: url.live,
      data: {
        living: "2"
      }, success(res) {
        console.log(res.data)
        that.setData({
          livingData: res.data.content,
          liveNum: res.data.totalElements
        })
      }
    })
    //获取视频
    wx.request({
      url: url.video,
      data: {
        show: "1",
        enable: "1",
        size: that.data.size,
        page: that.data.page
      },
      success(res) {
        console.log(res)
        let l = res.data.content;
        l.forEach(f => {
          f.createTime = util.formatMonthDay(new Date(f.createTime))
        })
        that.setData({
          videoData: l,
          videoNum: res.data.totalElements,
          isLoad: false
        })
      }
    })
  },
  getVideo() {
    let that = this;
    //获取视频
    that.setData({
      page: that.data.page + 1,
    })
    wx.request({
      url: url.video,
      data: {
        show: "1",
        enable: "1",
        size: that.data.size,
        page: that.data.page
      },
      success(res) {
        let l = res.data.content;
        l.forEach(f => {
          f.createTime = util.formatMonthDay(new Date(f.createTime))
        })
        that.setData({
          videoData: that.data.videoData.concat(l),
          isLoad: false
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.setData({
      unReady: false
    })
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
    this.setData({
      page: 0
    })
    this.onLoad();
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 2000)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let that = this;
    let pages = parseInt(that.data.videoNum / that.data.size) + 1;
    if (pages > that.data.page) {
      that.setData({
        isLoad: true
      })
      that.getVideo();
    }

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '新鲜有滋味',
      path: '/pages/find/home/index',
    }
  }
})
