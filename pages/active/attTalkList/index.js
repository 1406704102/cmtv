// pages/active/attTalkList/index.js
const url = require('../../../utils/url')
const util = require('../../../utils/util')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userId: '',
    name: '',
    activeId: '',
    userInfo: {},
    timers: [],

    page: 0,
    size: 15,
    totalElement: 0,
    attTalkList: [],
    isLoad: true,
    likeIcon: 'unlike.png',
    modalName:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    that.setData({
      userId: options.userId,
      name: options.name,
      activeId: options.activeId
    })
    //分页查询打卡信息
    wx.getStorage({
      key: 'userInfo',
      success(r) {
        that.setData({
          userInfo: r.data
        })
        wx.request({
          url: url.activeAttTalk,
          method: 'GET',
          data: {
            activeId: options.activeId,
            page: that.data.page,
            size: that.data.size,
            userId: options.userId,
            userId2: r.data.id,
            sort: 'isTop,topTime,desc'
          }, success(res) {
            let arr = res.data.content;
            arr.forEach(f => {
              f.createTime = util.formatMonthDayHourMinute(new Date(f.createTime))
            })
            that.setData({
              attTalkList: arr,
              totalElement: res.data.totalElements,
              isLoad: false
            })
          }
        })
      }
    });
  },
  getAttTalkList() {
    let that = this;
    that.setData({
      page: that.data.page + 1,
    })
    wx.request({
      url: url.activeAttTalk,
      method: 'GET',
      data: {
        activeId: that.data.activeId,
        page: that.data.page,
        size: that.data.size,
        userId: that.data.userId,
        userId2: that.data.userInfo.id,
        sort: 'isTop,topTime,desc'
      }, success(res) {
        let arr = res.data.content;
        arr.forEach(f => {
          f.createTime = util.formatMonthDayHourMinute(new Date(f.createTime))
        })
        that.setData({
          attTalkList: that.data.attTalkList.concat(arr),
        })
      },complete(res) {
        that.setData({
          isLoad: false
        })
      }
    })
  },
  previewImg: function (e) {
    console.log(e.currentTarget.dataset)
    let arr = [];
    arr.push(e.currentTarget.dataset.url)
    wx.previewImage({
      current: e.currentTarget.dataset.url,     //当前图片地址
      urls: arr,               //所有要预览的图片的地址集合 数组形式
      success: function (res) {
      },
      fail: function (res) {
      },
      complete: function (res) {
      },
    })
  },
  doLike(e) {
    let that = this;
    // let activeStatic = e.currentTarget.dataset.activestatic;
    // console.log(e.currentTarget.dataset)
    // if (activeStatic === '0') return;
    let item = e.currentTarget.dataset.item;
    let index = e.currentTarget.dataset.index;
    console.log(index)
    console.log(typeof(index))
    clearTimeout(that.data.timers[index]);
    let l = item.like;
    if (item.like === 1) {
      let list = that.data.attTalkList;
      list.forEach(f => {
        if (f.id === item.id) {
          f.likeNum = f.likeNum - 1;
          f.like = 0;
          l = 0;
        }
      });
      that.setData({
        attTalkList: list
      });
    } else {
      let list = that.data.attTalkList;
      list.forEach(f => {
        if (f.id === item.id) {
          f.likeNum = f.likeNum + 1;
          f.like = 1;
          l = 1;
        }
      })
      that.setData({
        attTalkList: list
      })
    }
    that.setData({
      'timers[index]': setTimeout(() => {
        let method = 'POST';
        if (l === 1) {
          wx.request({
            url: url.activeAttTalkLike,
            method: 'POST',
            data: {
              attTalkId: e.currentTarget.dataset.item.id,
              userId: that.data.userInfo.id,
            }
          });
        } else {
          wx.request({
            url: url.activeAttTalkLike,
            method: 'PUT',
            data: {
              attTalkId: e.currentTarget.dataset.item.id,
              userId: that.data.userInfo.id,
            }
          });
        }
      }, 900)
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
    if (pages > that.data.page) {
      that.setData({
        isLoad: true
      })
      that.getAttTalkList();
    }
  },

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function () {
  //
  // }
})
