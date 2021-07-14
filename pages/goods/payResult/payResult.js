var util = require('../../../shopConfig/util.js');
var api = require('../../../shopConfig/api.js');
var url = require('../../../utils/url.js');
var md5 = require('../../../lib/md5.js');

var app = getApp();
Page({
  data: {
    status: false,
    orderId: 0
  },
  onLoad: function(options) {
    // 页面初始化 options为页面跳转所带来的参数
    let that = this;

    this.setData({
      orderId: options.orderId,
      status: options.status === '1' ? true : false
    })
    util.request(api.OrderDetail, {
      orderId: options.orderId
    }).then(function(res) {
      if (res.errno === 0) {
        console.log(res.data);
        that.setData({
          orderInfo: res.data.orderInfo,
          orderGoods: res.data.orderGoods,
          handleOption: res.data.orderInfo.handleOption,
          expressInfo: res.data.expressInfo
        });
      }

    });
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
  payOrder() {
    let that = this;
    // util.request(api.OrderPrepay, {
    //   orderId: that.data.orderId
    // }, 'POST').then(function(res) {
    //   if (res.errno === 0) {
    //     const payParam = res.data;
    //     console.log("支付过程开始")
    //     wx.requestPayment({
    //       'timeStamp': payParam.timeStamp,
    //       'nonceStr': payParam.nonceStr,
    //       'package': payParam.packageValue,
    //       'signType': payParam.signType,
    //       'paySign': payParam.paySign,
    //       'success': function(res) {
    //         console.log("支付过程成功")
    //         that.setData({
    //           status: true
    //         });
    //       },
    //       'fail': function(res) {
    //         console.log("支付过程失败")
    //         util.showErrorToast('支付失败');
    //       },
    //       'complete': function(res) {
    //         console.log("支付过程结束")
    //       }
    //     });
    //   }
    // });
    const orderId = that.data.orderId;
    let l = 'cmt+m_string->'

    var str7 = md5.hex_md5(l);

    wx.getStorage({
      key: 'userInfo',
      async success(r) {
        //总价>0 且 cmb = 0 微信支付
        if (that.data.orderInfo.actualPrice > 0 && that.data.orderInfo.cmb === 0) {
          // const grouponLinkId = res.data.grouponLinkId;
          util.request(api.OrderPrepay, {
            orderId: orderId
          }, 'POST').then(function (res) {
            if (res.errno === 0) {

              const payParam = res.data;
              console.log("支付过程开始");
              wx.requestPayment({
                'timeStamp': payParam.timeStamp,
                'nonceStr': payParam.nonceStr,
                'package': payParam.packageValue,
                'signType': payParam.signType,
                'paySign': payParam.paySign,
                'success': function (res) {
                  console.log("支付过程成功");
                  // if (grouponLinkId) {
                  //   setTimeout(() => {
                  //     wx.redirectTo({
                  //       url: '/pages/groupon/grouponDetail/grouponDetail?id=' + grouponLinkId
                  //     })
                  //   }, 1000);
                  // } else {
                  wx.redirectTo({
                    url: '/pages/goods/payResult/payResult?status=1&orderId=' + orderId
                  });
                  // }
                },
                'fail': function (res) {
                  console.log("支付过程失败");
                  wx.redirectTo({
                    url: '/pages/goods/payResult/payResult?status=0&orderId=' + orderId
                  });
                },
                'complete': function (res) {
                  console.log("支付过程结束")
                }
              });

            } else {
              wx.redirectTo({
                url: '/pages/goods/payResult/payResult?status=0&orderId=' + orderId
              });
            }

          });

        }
        //总价=0 且 cmb > 0 草莓币支付
        if (that.data.orderInfo.actualPrice === 0 && that.data.orderInfo.cmb > 0) {
          //先扣除cmb
          var str6 = md5.b64_md5(l);
          console.log("str7", str7)

          let checkCMB = await that.checkCMB();
          console.log(checkCMB)

          //查询草莓币
          wx.request({
            url: url.userInfo + 'getCmb',
            method: 'get',
            data: {
              userId: r.data.id,
            }, success(res) {
              console.log("caomeibi", res.data);
              //判断草莓币够不够
              if ((res.data.chbeanNum / 100) >= that.data.orderInfo.cmb) {
                // 扣除草莓币
                wx.request({
                  url: url.userInfo + 'cmbPay',
                  method: 'get',
                  data: {
                    userId: res.data.id,
                    cmb: that.data.orderInfo.cmb,
                    str: str7
                  }, success(res) {
                    if (res.data !== '验证失败') {
                      //修改订单状态
                      util.request(api.cmbPay, {orderId: orderId}, 'GET').then(
                          res => {
                            console.log(res);
                            if (res.errno === 0) {
                              //添加草莓币使用 记录
                              wx.request({
                                url: url.cHBeanLog,
                                method: 'post',
                                data: {
                                  message: '草莓商城消费',
                                  num: -that.data.orderInfo.cmb,
                                  userId: r.data.id,
                                  userName: r.data.nickname,
                                  userAvatar: r.data.avatar
                                }, success(res) {
                                  console.log(res);
                                }

                              })
                              wx.hideLoading();

                              wx.redirectTo({
                                url: '/pages/goods/payResult/payResult?status=1&orderId=' + orderId
                              });
                            }

                          }
                      )


                    }
                    ;
                  }
                });

              } else {
                wx.hideLoading();
                wx.showToast({
                  title: '草莓币不足',
                  icon: 'none'
                })

              }


            }
          })

        }

        //总价>0 且 cmb > 0 微信+草莓币支付
        if (that.data.orderInfo.actualPrice > 0 && that.data.orderInfo.cmb > 0) {

          //查询草莓币
          wx.request({
            url: url.userInfo + 'getCmb',
            method: 'get',
            data: {
              userId: r.data.id,
            }, success(res) {
              if ((res.data.chbeanNum / 100) >= that.data.orderInfo.cmb) {
                const grouponLinkId = res.data.grouponLinkId;
                util.request(api.OrderPrepay, {
                  orderId: orderId
                }, 'POST').then(function (res) {
                  if (res.errno === 0) {

                    const payParam = res.data;
                    console.log("支付过程开始");
                    wx.requestPayment({
                      'timeStamp': payParam.timeStamp,
                      'nonceStr': payParam.nonceStr,
                      'package': payParam.packageValue,
                      'signType': payParam.signType,
                      'paySign': payParam.paySign,
                      'success': function (res) {
                        console.log("支付过程成功");

                        // 扣除草莓币
                        wx.request({
                          url: url.userInfo + 'cmbPay',
                          method: 'get',
                          data: {
                            userId: r.data.id,
                            cmb: that.data.orderInfo.cmb,
                            str: str7
                          }, success(res) {
                            if (res.data !== '验证失败') {
                              //添加草莓币使用 记录
                              wx.request({
                                url: url.cHBeanLog,
                                method: 'post',
                                data: {
                                  message: '草莓商城消费',
                                  num: -that.data.orderInfo.cmb,
                                  userId: r.data.id,
                                  userName: r.data.nickname,
                                  userAvatar: r.data.avatar
                                }, success(res) {
                                  console.log(res);
                                }

                              })
                              wx.hideLoading();


                            };
                          }
                        });

                        wx.redirectTo({
                          url: '/pages/goods/payResult/payResult?status=1&orderId=' + orderId
                        });
                      },
                      'fail': function (res) {
                        console.log("支付过程失败");
                        wx.redirectTo({
                          url: '/pages/goods/payResult/payResult?status=0&orderId=' + orderId
                        });
                      },
                      'complete': function (res) {
                        console.log("支付过程结束")
                      }
                    });

                  } else {
                    wx.redirectTo({
                      url: '/pages/goods/payResult/payResult?status=0&orderId=' + orderId
                    });
                  }

                });
              } else {
                wx.hideLoading();
                wx.showToast({
                  title: '草莓币不足',
                  icon: 'none'
                })
              }
            }
          })


        }
      }
    })
  }
})
