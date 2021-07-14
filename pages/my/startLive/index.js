// pages/my/startLive/index.js
const url = require('../../../utils/url')
const util = require('../../../utils/util')
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    CustomBar: app.globalData.CustomBar,
    loadProgress:0,
    liveId: '',
    live: {},
    loading: '',
    liveWxId: null,
    liveKUrl: null,
    liveDUrl: null
    // picker: [{value: 'TikTop', label:'抖音'},{value: 'Kwai', label:'快手'}],
    // picker: ['抖音','快手'],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loadProgress()
    this.setData({
      liveId: options.id
    })
    let that = this;
    //查询直播信息
    wx.request({
      url: url.live + '/' + options.id,
      method: "GET",
      success(res) {
        console.log(res.data)
        let live = res.data;
        if (live.livePlatform === 'TikTop') {
          live.livePlatform = ' 抖音';
          that.setData({
            TikTop: true
          })
        }
        if (live.livePlatform === 'Kwai') {
          live.livePlatform = live.livePlatform + ' 快手';
          that.setData({
            Kwai: true
          });
        }
        if (live.liveWxId !== null){
          live.livePlatform = live.livePlatform + ' 小程序';
        }
        live.startTime = util.formatTime(new Date(live.startTime));
        live.endTime = util.formatTime(new Date(live.endTime));
        that.setData({
          live: res.data
        });
        that.setData({
          loadProgress: 100
        })
      }
    })
  },
  PickerChange(e) {
    console.log(e);
    this.setData({
      index: e.detail.value
    })
  },
  loadModal () {
    this.setData({
      loadModal: true
    })
    setTimeout(()=> {
      this.setData({
        loadModal: false
      })
    }, 2000)
  },
  startLive() {
    // if (this.data.liveWxId === null) {
    //   wx.showToast({
    //     title: '直播id为空',
    //     icon: 'none'
    //   });
    //   return false
    // }
    if (this.data.liveKUrl === null && this.data.Kwai) {
      wx.showToast({
        title:'快手url为空',
        icon:'none'
      })
      return false
    }
    if (this.data.liveDUrl === null && this.data.TikTop) {
      wx.showToast({
        title: '抖音url为空',
        icon:'none'
      })
      return false
    }
    this.setData({
      loading: 'cuIcon-loading'
    })
    let that = this;
    wx.getStorage({
      key: 'userInfo',
      success(res) {
        wx.request({
          url: url.live + '/startLive',
          method: "POST",
          data:{
            id:that.data.liveId,
            liveWxId: that.data.live.liveWxId,
            liveKUrl: that.data.liveKUrl,
            liveDUrl: that.data.liveDUrl,
            liveImgUrl: that.data.live.liveImgUrl,//bug
            userId: res.data.id
          },
          success(r) {
            that.setData({
              loading: ''
            })
            let pages = getCurrentPages();
            var prevPage = pages[pages.length - 2];
            prevPage.liveList(res)
            wx.navigateBack()
          }
        })
      }
    })

  },
  loadProgress(){
    this.setData({
      loadProgress: this.data.loadProgress+3
    })
    if (this.data.loadProgress<100){
      setTimeout(() => {
        this.loadProgress();
      }, 1000)
    }else{
      this.setData({
        loadProgress: 0
      })
    }
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
