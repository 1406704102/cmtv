// tabbar/live/search/index.js
const url = require('../../../utils/url')
const util = require('../../../utils/util')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    searchText: '',
    type: '1',
    activeInfoList: [],
    userInfoList: [],
    history: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    wx.getStorage({
      key: 'history',
      success(res) {
        console.log(res.data)
        that.setData({
          history:res.data
        })
      },
      fail(res) {
        wx.setStorage({
          key: 'history',
          data: [],success(res) {
            that.setData({
              history:res.data
            })
          }, fail(res) {
            console.log("fail");
          }
        })
      }
    })
    wx.request({
      url: url.setting,
      method: 'GET',
      success(res) {
        that.setData({
          guessSearch: res.data.content[0].guessSearch.split(","),
        });
      }
    });
  },
  doSearch() {
    let that = this;
    if (that.data.searchText !== '') {
      if (that.data.history.indexOf(that.data.searchText) === -1) {
        wx.setStorage({
          key: 'history',
          data: that.data.history.concat(that.data.searchText),
          success(res) {
            that.setData({
              history: that.data.history.concat(that.data.searchText)
            })
          }
        });
      }
      this.search();
    }
  },
  search() {
    wx.showLoading({
      title:'加载中...'
    })
    let that = this;
    that.setData({
      type: '0'
    })

    wx.request({
      url:url.searchInfo,
      method: 'GET',
      data:{
        searchContent: that.data.searchText
      }, success(res) {
        console.log(res)
        let ringList = [];
        let videoList = [];
        res.data.videoInfo.forEach(f => {
          if (f.ringType !== null) {
            ringList.push(f);
          } else {
            f.createTime = util.formatMonthDay(new Date(f.createTime))
            videoList.push(f);
          }
        });
        that.setData({
          activeInfoList: res.data.activeInfoList,
          activeInfoTalkNewList: res.data.activeInfoTalkNew,
          specialActiveList: res.data.specialActive,
          userInfoList: res.data.userInfo,
          videoInfoList: videoList,
          ringList: ringList,
          type: '2'
        });
        wx.hideLoading()
      },
    })
  },
  cancel() {
    this.setData({
      type: '1',
      searchText: '',
      activeInfoList: [],
      activeInfoTalkNewList: [],
      specialActiveList: [],
      userInfoList:[],
      videoInfoList: [],
      ringList: []
    })
    wx.navigateBack();
  },
  del() {

    this.setData({
      history: []
    })
    wx.setStorage({
      key:'history',
      data: []
    })
  },
  dos(e) {
    this.setData({
      searchText: e.currentTarget.dataset.item
    })
    this.doSearch();
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

  // /**
  //  * 用户点击右上角分享
  //  */
  // onShareAppMessage: function () {
  //
  // }
})
