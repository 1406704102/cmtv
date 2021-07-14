// pages/login/login.js

var app = getApp()

const url = require('../../../utils/url')
Page({
  data: {
    //判断小程序的API，回调，参数，组件等是否在当前版本可用。
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    isHide: false,
    active: 'home',
    options: {}
  },
  onChange(event) {
    console.log(event)
    this.setData({active: event.detail});
  },
  back() {
    wx.navigateBack();
  },
  onLoad: function (options) {
    var that = this;

    that.setData({
      options: options
    })
    // 查看是否授权
    wx.getSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo']) {
          // wx.getUserInfo({
          //     success: function(res) {
          //         // 用户已经授权过,不需要显示授权页面,所以不需要改变 isHide 的值
          //         // 根据自己的需求有其他操作再补充
          //         // 我这里实现的是在用户授权成功后，调用微信的 wx.login 接口，从而获取code
          //         wx.login({
          //             success: res => {
          //                 // 获取到用户的 code 之后：res.code
          //                 console.log("用户的code:" + res.code);
          //                 // 可以传给后台，再经过解析获取用户的 openid
          //                 // 或者可以直接使用微信的提供的接口直接获取 openid ，方法如下：
          //                 wx.request({
          //                     // 自行补上自己的 APPID 和 SECRET
          //                     url: 'https://api.weixin.qq.com/sns/jscode2session?appid=wxa6860c09cb718a6c&secret=33a8ed457b90da263f212304e8331d9b&js_code=' + res.code + '&grant_type=authorization_code',
          //                     success: res => {
          //                         // 获取到用户的 openid
          //                         console.log("用户的openid:" + res.data.openid);
          //                     }
          //                 });
          //             }
          //         });
          //     }
          // });
        } else {
          // 用户没有授权
          // 改变 isHide 的值，显示授权页面
          that.setData({
            isHide: true
          });
        }
      }
    });
  },
  getPhoneNumber (e) {
    wx.getStorage({
      key: 'userInfo',
      success(r) {
        wx.login({
          success: res => {
            let l = res;
            wx.request({
              url: url.setPhone,
              method: 'GET',
              data: {
                code: l.code,
                openid: r.data.openid,
                encryptedData:e.detail.encryptedData,
                iv:e.detail.iv
              },
              success(res) {
                wx.setStorage({
                  key: 'userInfo',
                  data: res.data
                })
              }
            })
          }
        })
      }
    })

  },
  bindGetUserInfo: function (e) {
    let that = this
    if (e.detail.userInfo) {
      wx.showLoading({
        title:'登录中...'
      });

      console.log(e.detail.userInfo)
      wx.login({
        success: res => {
          let l = res;
          // 获取用户信息
          wx.getSetting({
            success: res => {
              if (res.authSetting['scope.userInfo']) {
                // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                wx.getUserInfo({
                  success: res => {
                    console.log(res)
                    // console.log("用户的code:" + res.code);


                    wx.request({
                      url: url.getOpenid,
                      method: 'GET',
                      data: {
                        code: l.code,
                        nickname: e.detail.userInfo.nickName,
                        avatar: e.detail.userInfo.avatarUrl,
                        sex: e.detail.userInfo.gender,
                        encryptedData:res.encryptedData,
                        iv:res.iv
                      },
                      success: res => {
                        app.globalData.user = res.data
                        wx.setStorage({
                          key: 'userInfo',
                          data: res.data

                        })
                        // wx.switchTab({
                        //   url:'/pages/live/home/index'
                        // })
                        let pages = getCurrentPages();
                        var prevPage = pages[pages.length - 2];
                        prevPage.onLoad(that.data.options)
                        wx.navigateBack();
                      }
                    })
                  }
                })
              }
            }
          })
        }
      });
      wx.hideLoading()
      //授权成功后,通过改变 isHide 的值，让实现页面显示出来，把授权页面隐藏起来
      that.setData({
        isHide: false
      });
    } else {
      //用户按了拒绝按钮
      wx.showModal({
        title: '警告',
        content: '您点击了拒绝授权，将无法进入小程序，请授权之后再进入!!!',
        showCancel: false,
        confirmText: '返回授权',
        success: function (res) {
          // 用户没有授权成功，不需要改变 isHide 的值
          if (res.confirm) {
            console.log('用户点击了“返回授权”');
          }
        }
      });
    }
  }
})


