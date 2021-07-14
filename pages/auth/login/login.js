var api = require('../../../shopConfig/api.js');
var util = require('../../../shopConfig/util.js');
var user = require('../../../shopConfig/user.js');

var app = getApp();
Page({
  onLoad: function(options) {
    // 页面初始化 options为页面跳转所带来的参数
    // 页面渲染完成

  },
  onReady: function() {

  },
  onShow: function() {
    // 页面显示
  },
  onHide: function() {
    // 页面隐藏

  },
  onUnload: function() {
    // 页面关闭

  },
  getUserProfile: function(e) {
    // if (e.detail.userInfo == undefined) {
    //   app.globalData.hasLogin = false;
    //   // util.showErrorToast('微信登录失败');
    //   return;
    // }

    user.checkLogin().catch(() => {
      wx.getStorage({
        key: 'userInfo',
        success(res) {
          console.log("res.data", res.data);
          let u = {};
          u.avatarUrl = res.data.avatar;
          u.nickName = res.data.nickname;
          u.gender = res.data.sex;
          user.loginByWeixin(u).then(res => {
            app.globalData.hasLogin = true;

            wx.navigateBack({
              delta: 1
            })
          }).catch((err) => {
            app.globalData.hasLogin = false;
            util.showErrorToast('微信登录失败');
          });
        },
        fail(res) {
          wx.showToast({
            title:'请您先登录草莓台',
            icon: 'none'
          })
          setTimeout(() => {
            wx.switchTab({
              url: "/tabbar/live/newhome/index"
            })
          }, 1000);
        }
      })
    });
  },
  accountLogin: function() {
    wx.navigateTo({
      url: "/pages/auth/accountLogin/accountLogin"
    });
  },
  cancel() {
      wx.switchTab({
        url: "/tabbar/goods/index/index"
      })
  }
})
