var util = require('../../../shopConfig/util.js');
var api = require('../../../shopConfig/api.js');
var user = require('../../../shopConfig/user.js');
var app = getApp();
const url = require('../../../utils/url')

Page({
  data: {
    userInfo: {
      nickName: '点击登录',
      avatarUrl: '/static/images/my.png'
    },
    swiperList:[],
    order: {
      unpaid: 0,
      unship: 0,
      unrecv: 0,
      uncomment: 0
    },
    hasLogin: false,

    categoryFilter: false,
    filterCategory: [],
    goodsList: [],
    categoryId: 0,
    currentSortType: 'default',
    currentSort: 'update_time',
    currentSortOrder: 'desc',
    page: 1,
    limit: 10
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    this.getGoodsList();
    this.getBanner()

  },
  onReady: function () {

  },
  onShow: function () {
    console.log("app.globalData.hasLogin", app.globalData.hasLogin);
    //获取用户的登录信息
    // if (app.globalData.hasLogin) {
    let userInfo = wx.getStorageSync('userInfo2');
    let that = this;

    console.log("userInfo", userInfo);

      this.setData({
        userInfo: userInfo,
        hasLogin: true
      });
      // util.request(api.UserIndex).then(function (res) {
      //   if (res.errno === 0) {
      //     that.setData({
      //       order: res.data.order
      //     });
      //   }
      // });



    // }

  },
  onHide: function () {
    // 页面隐藏

  },
  onUnload: function () {
    // 页面关闭
  },
  imageClick(event) {
    let url = event.currentTarget.dataset.url;
    if (url !== null) {
        wx.getStorage({
            key: 'userInfo',
            success(res) {
                if (url.search('in#@') != -1) {
                    wx.navigateTo({
                        url: url.slice(4, url.length)
                    });
                } else if (url.search('out#@') != -1) {
                    wx.navigateTo({
                        url: '/pages/webView/webView/index?src=' + url.slice(5, url.length)
                    });
                } else if (url.search('out!#@') != -1) {
                    var user = res.data;
                    wx.navigateTo({
                        url: '/pages/webView/webView/index?openid=' + user.id + '&nickname=' + user.nickname + '&avatar=' + user.avatar + '&src=' + url.slice(6, url.length)
                    });
                } else if (url.search('wxApp') != -1) {
                    let split = [];
                    split = url.split('-');
                    wx.navigateToMiniProgram({
                        appId: split[1],
                        path: split[2],
                        extraData: {
                            roomId: split[0]
                        },
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
                    })
                }
            },
            fail(res) {
                wx.navigateTo({
                    url: '/pages/my/login/login'
                })
            }
        })

    }
},
      //获取banner
      getBanner() {
        let that = this;

        //获取banner
        wx.request({
            url: url.banner,
            method: "GET",
            data: {
                bannerType: 'shop',
                enable: 1
            },
            success(res) {
                that.setData({
                    swiperList: res.data.content,
                    // bReady: false
                })
            }
        })
      },
  goLogin() {
    if (!this.data.hasLogin) {
      wx.navigateTo({
        url: "/pages/auth/login/login"
      });
    }
  },
  goOrder() {
    if (this.data.hasLogin) {
      try {
        wx.setStorageSync('tab', 0);
      } catch (e) {

      }
      wx.navigateTo({
        url: "/pages/goods/ucenter/order/order"
      });
    } else {
      wx.navigateTo({
        url: "/pages/auth/login/login"
      });
    }
  },
  goOrderIndex(e) {
    if (this.data.hasLogin) {
      let tab = e.currentTarget.dataset.index
      let route = e.currentTarget.dataset.route
      try {
        wx.setStorageSync('tab', tab);
      } catch (e) {

      }
      wx.navigateTo({
        url: route,
        success: function (res) {
        },
        fail: function (res) {
        },
        complete: function (res) {
        },
      })
    } else {
      wx.navigateTo({
        url: "/pages/auth/login/login"
      });
    }
    ;
  },
  goCoupon() {
    if (this.data.hasLogin) {
      wx.navigateTo({
        url: "/pages/goods/ucenter/couponList/couponList"
      });
    } else {
      wx.navigateTo({
        url: "/pages/auth/login/login"
      });
    }
    ;
  },
  goGroupon() {
    if (this.data.hasLogin) {
      wx.navigateTo({
        url: "/pages/groupon/myGroupon/myGroupon"
      });
    } else {
      wx.navigateTo({
        url: "/pages/auth/login/login"
      });
    }
    ;
  },
  goCollect() {
    if (this.data.hasLogin) {
      wx.navigateTo({
        url: "/pages/goods/ucenter/collect/collect"
      });
    } else {
      wx.navigateTo({
        url: "/pages/auth/login/login"
      });
    }
    ;
  },
  goFeedback(e) {
    if (this.data.hasLogin) {
      wx.navigateTo({
        url: "/pages/goods/ucenter/feedback/feedback"
      });
    } else {
      wx.navigateTo({
        url: "/pages/auth/login/login"
      });
    }
    ;
  },
  goFootprint() {
    if (this.data.hasLogin) {
      wx.navigateTo({
        url: "/pages/goods/ucenter/footprint/footprint"
      });
    } else {
      wx.navigateTo({
        url: "/pages/auth/login/login"
      });
    }
    ;
  },
  goAddress() {
    if (this.data.hasLogin) {
      wx.navigateTo({
        url: "/pages/goods/ucenter/address/address"
      });
    } else {
      wx.navigateTo({
        url: "/pages/auth/login/login"
      });
    }
    ;
  },
  bindPhoneNumber: function (e) {
    if (e.detail.errMsg !== "getPhoneNumber:ok") {
      // 拒绝授权
      return;
    }

    if (!this.data.hasLogin) {
      wx.showToast({
        title: '绑定失败：请先登录',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    util.request(api.AuthBindPhone, {
      iv: e.detail.iv,
      encryptedData: e.detail.encryptedData
    }, 'POST').then(function (res) {
      if (res.errno === 0) {
        wx.showToast({
          title: '绑定手机号码成功',
          icon: 'success',
          duration: 2000
        });
      }
    });
  },
  goAfterSale: function () {
    if (this.data.hasLogin) {
      wx.navigateTo({
        url: "/pages/goods/ucenter/aftersaleList/aftersaleList"
      });
    } else {
      wx.navigateTo({
        url: "/pages/auth/login/login"
      });
    }
    ;
  },
  aboutUs: function () {
    wx.navigateTo({
      url: '/pages/about/about'
    });
  },
  goHelp: function () {
    wx.navigateTo({
      url: '/pages/help/help'
    });
  },
  exitLogin: function () {
    wx.showModal({
      title: '',
      confirmColor: '#b4282d',
      content: '退出登录？',
      success: function (res) {
        if (!res.confirm) {
          return;
        }

        util.request(api.AuthLogout, {}, 'POST');
        app.globalData.hasLogin = false;
        wx.removeStorageSync('token');
        wx.removeStorageSync('userInfo2');
        wx.reLaunch({
          url: '/pages/index/index'
        });
      }
    })

  },


  getGoodsList: function () {
    var that = this;
    util.request(api.GoodsList, {
      isNew: true,
      page: that.data.page,
      limit: 30,
      order: that.data.currentSortOrder,
      sort: 'add_time',
      categoryId: that.data.categoryId
    })
    .then(function (res) {
      if (res.errno === 0) {
        util.request(api.GoodsList, {
          isHot: true,
          page: that.data.page,
          limit: 30,
          order: that.data.currentSortOrder,
          sort: that.data.currentSort,
          categoryId: that.data.categoryId
        })  .then(function (r) {
          let l = [];
          l = r.data.list;

          that.setData({
            goodsList:l.concat(res.data.list),
            filterCategory: res.data.filterCategoryList
          });
        })



      }
    });
  },
  openSortFilter: function(event) {
    let currentId = event.currentTarget.id;
    switch (currentId) {
      case 'categoryFilter':
        this.setData({
          categoryFilter: !this.data.categoryFilter,
          currentSortType: 'category',
          currentSort: 'add_time',
          currentSortOrder: 'desc'
        });
        break;
      case 'priceSort':
        let tmpSortOrder = 'asc';
        if (this.data.currentSortOrder == 'asc') {
          tmpSortOrder = 'desc';
        }
        this.setData({
          currentSortType: 'price',
          currentSort: 'retail_price',
          currentSortOrder: tmpSortOrder,
          categoryFilter: false
        });

        this.getGoodsList();
        break;
      default:
        //综合排序
        this.setData({
          currentSortType: 'default',
          currentSort: 'add_time',
          currentSortOrder: 'desc',
          categoryFilter: false,
          categoryId: 0
        });
        this.getGoodsList();
    }
  },
  selectCategory: function(event) {
    let currentIndex = event.target.dataset.categoryIndex;
    this.setData({
      'categoryFilter': false,
      'categoryId': this.data.filterCategory[currentIndex].id
    });
    this.getGoodsList();

  }

});
