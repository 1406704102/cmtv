var util = require('../../../../shopConfig/util.js');
var url = require('../../../../utils/url.js');
var api = require('../../../../shopConfig/api.js');
var md5 = require('../../../../lib/md5.js');

Page({
    data: {
        orderId: 0,
        orderInfo: {},
        orderGoods: [],
        expressInfo: {},
        flag: false,
        handleOption: {}
    },
    onLoad: function (options) {
        // 页面初始化 options为页面跳转所带来的参数
        this.setData({
            orderId: options.id
        });
        this.getOrderDetail();
    },
    onPullDownRefresh() {
        wx.showNavigationBarLoading() //在标题栏中显示加载
        this.getOrderDetail();
        wx.hideNavigationBarLoading() //完成停止加载
        wx.stopPullDownRefresh() //停止下拉刷新
    },
    expandDetail: function () {
        let that = this;
        this.setData({
            flag: !that.data.flag
        })
    },
    getOrderDetail: function () {
        wx.showLoading({
            title: '加载中',
        });

        setTimeout(function () {
            wx.hideLoading()
        }, 2000);

        let that = this;
        util.request(api.OrderDetail, {
            orderId: that.data.orderId
        }).then(function (res) {
            if (res.errno === 0) {
                console.log(res.data);
                that.setData({
                    orderInfo: res.data.orderInfo,
                    orderGoods: res.data.orderGoods,
                    handleOption: res.data.orderInfo.handleOption,
                    expressInfo: res.data.expressInfo
                });
            }

            wx.hideLoading();
        });
    },
    // “去付款”按钮点击效果
    payOrder: function () {
        let that = this;

        const orderId = that.data.orderId;
        let l = 'cmt+m_string->'

        var str7 = md5.hex_md5(l);

        wx.getStorage({
            key: 'userInfo',
            success(r) {
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


                                                        }
                                                        ;
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

    },
    // “取消订单”点击效果
    cancelOrder: function () {
        let that = this;
        let orderInfo = that.data.orderInfo;

        wx.showModal({
            title: '',
            content: '确定要取消此订单？',
            success: function (res) {
                if (res.confirm) {
                    util.request(api.OrderCancel, {
                        orderId: orderInfo.id
                    }, 'POST').then(function (res) {
                        if (res.errno === 0) {
                            wx.showToast({
                                title: '取消订单成功'
                            });
                            util.redirect('/pages/ucenter/order/order');
                        } else {
                            util.showErrorToast(res.errmsg);
                        }
                    });
                }
            }
        });
    },
    // “取消订单并退款”点击效果
    refundOrder: function () {
        let that = this;
        let orderInfo = that.data.orderInfo;

        wx.showModal({
            title: '',
            content: '确定要取消此订单？',
            success: function (res) {
                if (res.confirm) {
                    util.request(api.OrderRefund, {
                        orderId: orderInfo.id
                    }, 'POST').then(function (res) {
                        if (res.errno === 0) {
                            wx.showToast({
                                title: '取消订单成功'
                            });
                            util.redirect('/pages/ucenter/order/order');
                        } else {
                            util.showErrorToast(res.errmsg);
                        }
                    });
                }
            }
        });
    },
    // “删除”点击效果
    deleteOrder: function () {
        let that = this;
        let orderInfo = that.data.orderInfo;

        wx.showModal({
            title: '',
            content: '确定要删除此订单？',
            success: function (res) {
                if (res.confirm) {
                    util.request(api.OrderDelete, {
                        orderId: orderInfo.id
                    }, 'POST').then(function (res) {
                        if (res.errno === 0) {
                            wx.showToast({
                                title: '删除订单成功'
                            });
                            util.redirect('/pages/ucenter/order/order');
                        } else {
                            util.showErrorToast(res.errmsg);
                        }
                    });
                }
            }
        });
    },
    // “确认收货”点击效果
    confirmOrder: function () {
        let that = this;
        let orderInfo = that.data.orderInfo;

        wx.showModal({
            title: '',
            content: '确认收货？',
            success: function (res) {
                if (res.confirm) {
                    util.request(api.OrderConfirm, {
                        orderId: orderInfo.id
                    }, 'POST').then(function (res) {
                        if (res.errno === 0) {
                            wx.showToast({
                                title: '确认收货成功！'
                            });
                            util.redirect('/pages/ucenter/order/order');
                        } else {
                            util.showErrorToast(res.errmsg);
                        }
                    });
                }
            }
        });
    },
    copyCode() {
        var self = this;
        wx.setClipboardData({
            data: self.data.orderInfo.couponCode,
            success: function (res) {
                wx.navigateToMiniProgram({
                    appId: "wxab7430e6e8b9a4ab",//appid
                    path: "/pages/exchange-coupon/index?discountCode="+self.data.orderInfo.couponCode,//跳转的页面路径
                    // extraData: {//携带的参数
                    //     roomId: split[0]
                    // },
                    envVersion: 'trial',
                    success(res) {
                        // wx.showToast({
                        //   title: split[0]
                        // })
                    }, fail(res) {
                        // console.log(res)
                        // wx.showToast({
                        //   title: '系统错误!',
                        //   icon: 'none'
                        // })
                    }
                });
            }
        })
    },
    // “申请售后”点击效果
    aftersaleOrder: function () {
        if (this.data.orderInfo.aftersaleStatus === 0) {
            util.redirect('/pages/ucenter/aftersale/aftersale?id=' + this.data.orderId);
        } else {
            util.redirect('/pages/ucenter/aftersaleDetail/aftersaleDetail?id=' + this.data.orderId);
        }
    },
    onReady: function () {
        // 页面渲染完成
    },
    onShow: function () {
        // 页面显示
    },
    onHide: function () {
        // 页面隐藏
    },
    onUnload: function () {
        // 页面关闭
    }
})
