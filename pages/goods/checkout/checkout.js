var util = require('../../../shopConfig/util.js');
var api = require('../../../shopConfig/api.js');
var url = require('../../../utils/url.js');
var md5 = require('../../../lib/md5.js');

var app = getApp();

Page({
    data: {
        checkedGoodsList: [],
        checkedAddress: {},
        availableCouponLength: 0, // 可用的优惠券数量
        goodsTotalPrice: 0.00, //商品总价
        freightPrice: 0.00, //快递费
        couponPrice: 0.00, //优惠券的价格
        grouponPrice: 0.00, //团购优惠价格
        orderTotalPrice: 0.00, //订单总价
        actualPrice: 0.00, //实际需要支付的总价
        cartId: 0,
        addressId: 0,
        couponId: 0,
        userCouponId: 0,
        message: '',
        grouponLinkId: 0, //参与的团购
        grouponRulesId: 0, //团购规则ID
        goodsTotalCmb: 0,
        coupontype: null
    },
    onLoad: function (options) {
        if (options.coupontype !== 'undefined') {
            this.setData({
                coupontype: options.coupontype
            })
        };
        // 页面初始化 options为页面跳转所带来的参
        // wx.showModal({
        //   title: '仅供测试',
        //   content: '请勿在本小程序购买商品,付款后不退款且不发货!',
        //   success: function(res) {
        //     if (res.confirm) {
        //       console.log('用户点击确定')
        //     } else if (res.cancel) {
        //       console.log('用户点击取消')
        //     }
        //   }
        // })
    },

    //获取checkou信息
    getCheckoutInfo: function () {
        let that = this;
        util.request(api.CartCheckout, {
            cartId: that.data.cartId,
            addressId: that.data.addressId,
            couponId: that.data.couponId,
            userCouponId: that.data.userCouponId,
            grouponRulesId: that.data.grouponRulesId
        }).then(function (res) {
            console.log(res)
            if (res.errno === 0) {
                that.setData({
                    checkedGoodsList: res.data.checkedGoodsList,
                    checkedAddress: res.data.checkedAddress,
                    availableCouponLength: res.data.availableCouponLength,
                    actualPrice: res.data.actualPrice,
                    couponPrice: res.data.couponPrice,
                    grouponPrice: res.data.grouponPrice,
                    freightPrice: res.data.freightPrice,
                    goodsTotalPrice: res.data.goodsTotalPrice,
                    goodsTotalCmb: res.data.goodsTotalCmb,
                    orderTotalPrice: res.data.orderTotalPrice,
                    addressId: res.data.addressId,
                    couponId: res.data.couponId,
                    userCouponId: res.data.userCouponId,
                    grouponRulesId: res.data.grouponRulesId,
                });
            }
            wx.hideLoading();
        });
    },
    selectAddress() {
        wx.navigateTo({
            url: '/pages/goods/ucenter/address/address',
        })
    },
    selectCoupon() {
        wx.navigateTo({
            url: '/pages/goods/ucenter/couponSelect/couponSelect',
        })
    },
    bindMessageInput: function (e) {
        this.setData({
            message: e.detail.value
        });
    },
    onReady: function () {
        // 页面渲染完成

    },
    onShow: function () {
        // 页面显示
        wx.showLoading({
            title: '加载中...',
        });
        try {
            var cartId = wx.getStorageSync('cartId');
            if (cartId === "") {
                cartId = 0;
            }
            var addressId = wx.getStorageSync('addressId');
            if (addressId === "") {
                addressId = 0;
            }
            var couponId = wx.getStorageSync('couponId');
            if (couponId === "") {
                couponId = 0;
            }
            var userCouponId = wx.getStorageSync('userCouponId');
            if (userCouponId === "") {
                userCouponId = 0;
            }
            var grouponRulesId = wx.getStorageSync('grouponRulesId');
            if (grouponRulesId === "") {
                grouponRulesId = 0;
            }
            var grouponLinkId = wx.getStorageSync('grouponLinkId');
            if (grouponLinkId === "") {
                grouponLinkId = 0;
            }

            this.setData({
                cartId: cartId,
                addressId: addressId,
                couponId: couponId,
                userCouponId: userCouponId,
                grouponRulesId: grouponRulesId,
                grouponLinkId: grouponLinkId
            });

        } catch (e) {
            // Do something when catch error
            console.log(e);
        }

        this.getCheckoutInfo();
    },
    onHide: function () {
        // 页面隐藏

    },
    onUnload: function () {
        // 页面关闭

    },
    checkCMB() {
        let that = this;
        wx.getStorage({
            key: 'userInfo',
            success(r) {
                //查询草莓币
                wx.request({
                    url: url.userInfo + 'getCmb',
                    method: 'get',
                    data: {
                        userId: r.data.id,
                    }, success(res) {
                        console.log("caomeibi", res.data);
                        //判断草莓币够不够
                        return res.data;
                    }, fail(res) {
                        return {};
                    }
                })

            }
        })
    },
    submitOrder: function () {
        let that = this;
        if (this.data.addressId <= 0) {
            util.showErrorToast('请选择收货地址');
            return false;
        }
        wx.showLoading({
            title: '加载中...',
        })
        util.request(api.OrderSubmit, {
            cartId: this.data.cartId,
            addressId: this.data.addressId,
            couponId: this.data.couponId,
            userCouponId: this.data.userCouponId,
            message: this.data.message,
            grouponRulesId: this.data.grouponRulesId,
            grouponLinkId: this.data.grouponLinkId,
            cmb: that.data.goodsTotalCmb
        }, 'POST').then(res => {
            if (res.errno === 0) {

                // 下单成功，重置couponId
                try {
                    wx.setStorageSync('couponId', 0);
                } catch (error) {

                }

                const orderId = res.data.orderId;
                let l = 'cmt+m_string->'

                // var str7 = md5.hex_md5(l);

                wx.getStorage({
                    key: 'userInfo',
                     success(r) {
                        //总价>0 且 cmb = 0 微信支付
                        if (that.data.goodsTotalPrice > 0 && that.data.goodsTotalCmb === 0) {
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
                                            var str7 = md5.hex_md5(r.data.id + l + '0');

                                            // 扣除草莓币
                                            wx.request({
                                                url: url.userInfo + 'cmbPay',
                                                method: 'get',
                                                data: {
                                                    userId: r.data.id,
                                                    coupons: that.data.coupontype,
                                                    cmb: 0,
                                                    str: str7
                                                }, success(res) {

                                                }
                                            })
                                            if (grouponLinkId) {
                                                setTimeout(() => {
                                                    wx.redirectTo({
                                                        url: '/pages/groupon/grouponDetail/grouponDetail?id=' + grouponLinkId
                                                    })
                                                }, 1000);
                                            } else {
                                                wx.redirectTo({
                                                    url: '/pages/goods/payResult/payResult?status=1&orderId=' + orderId
                                                });

                                            }
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
                        if (that.data.goodsTotalPrice === 0 && that.data.goodsTotalCmb > 0) {
                            //先扣除cmb
                            var str6 = md5.b64_md5(l);

                            // console.log("str7", str7)

                            // let checkCMB = await that.checkCMB();
                            // console.log(checkCMB)

                            //查询草莓币
                            wx.request({
                                url: url.userInfo + 'getCmb',
                                method: 'get',
                                data: {
                                    userId: r.data.id,
                                }, success(res) {
                                    //判断草莓币够不够
                                    if ((res.data.chbeanNum / 100) >= that.data.goodsTotalCmb) {
                                        console.log(
                                            res.data.id + l + that.data.goodsTotalCmb
                                        );
                                        var str7 = md5.hex_md5(res.data.id + l + that.data.goodsTotalCmb);

                                        // 扣除草莓币
                                        wx.request({
                                            url: url.userInfo + 'cmbPay',
                                            method: 'get',
                                            data: {
                                                userId: res.data.id,
                                                cmb: that.data.goodsTotalCmb,
                                                coupons: that.data.coupontype,
                                                str: str7
                                            }, success(res) {
                                                if (res.data !== '验证失败') {

                                                    // if ()
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
                                                                        num: -that.data.goodsTotalCmb,
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
                                                    );


                                                } else {
                                                    wx.hideLoading();
                                                    wx.showToast({
                                                        title: '验证失败'
                                                    });
                                                }
                                            }
                                        });

                                    } else {
                                        wx.hideLoading();
                                        wx.showToast({
                                            title: '草莓币不足',
                                            icon: 'none'
                                        });
                                    }
                                },fail(res) {
                                    wx.hideLoading();
                                    wx.showToast({
                                        title:'无法获取草莓币'
                                    })
                                }
                            })

                        }

                        //总价>0 且 cmb > 0 微信+草莓币支付
                        if (that.data.goodsTotalPrice > 0 && that.data.goodsTotalCmb > 0) {

                            //查询草莓币
                            wx.request({
                                url: url.userInfo + 'getCmb',
                                method: 'get',
                                data: {
                                    userId: r.data.id,
                                }, success(res) {
                                    if ((res.data.chbeanNum / 100) >= that.data.goodsTotalCmb) {
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
                                                        var str7 = md5.hex_md5(r.data.id + l + that.data.goodsTotalCmb);

                                                        // 扣除草莓币
                                                        wx.request({
                                                            url: url.userInfo + 'cmbPay',
                                                            method: 'get',
                                                            data: {
                                                                userId: r.data.id,
                                                                cmb: that.data.goodsTotalCmb,
                                                                coupons: that.data.coupontype,
                                                                str: str7
                                                            }, success(res) {
                                                                if (res.data !== '验证失败') {
                                                                    //添加草莓币使用 记录
                                                                    wx.request({
                                                                        url: url.cHBeanLog,
                                                                        method: 'post',
                                                                        data: {
                                                                            message: '草莓商城消费',
                                                                            num: -that.data.goodsTotalCmb,
                                                                            userId: r.data.id,
                                                                            userName: r.data.nickname,
                                                                            userAvatar: r.data.avatar
                                                                        }, success(res) {
                                                                            console.log(res);
                                                                        }

                                                                    })
                                                                    wx.hideLoading();


                                                                }else {
                                                                    wx.hideLoading();
                                                                    wx.showToast({
                                                                        title: '验证失败'
                                                                    });
                                                                }
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
                                },fail(res) {
                                    wx.hideLoading();
                                    wx.showToast({
                                        title:'无法获取草莓币'
                                    })
                                }
                            })


                        }
                    }
                    ,fail(res) {
                        wx.showToast({
                            title:'获取用户信息失败...',
                            icon: 'none'
                        })
                    }
                })


            } else {
                util.showErrorToast(res.errmsg);
            }
        });
    }
});
