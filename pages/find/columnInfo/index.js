// pages/find//columnInfo/index.js
const url = require('../../../utils/url')
const app = getApp();
const util = require('../../../utils/util');
let tabNum = 0; // 当前选中第几个tab标题
Page({

  /**
   * 页面的初始数据
   */
  data: {
    winHeight: "", // 窗口高度
    currentTab: 0, // 预设当前项的值
    scrollLeft: 0, // tab标题的滚动条位置
    tabName:[], // tab标题的名字
    choosedTabInformation: "", // 当前选中tab标题的信息
    CustomBar: app.globalData.CustomBar,
    isFixed: false,
    idTop: 0,
    bgImage: '',
    color: 'white',
    p: false,
    share: 0,
    id: '',
    columnInfo: {},
    liveInfo: {},

    goods: [],
    lives: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      id: options.id
    })
    this.getColumnInfo();
    this.getWindowHeight(); // 高度自适应（rpx）
    this.getTabName(); // 获取头部导航栏tab标题的名字
    this.getInformation(tabNum); //  获取当前选中tab标题的信息
  },
  getColumnInfo() {
    let that = this;
    wx.request({
      url: url.columnInfo+'/'+that.data.id,
      method: 'GET',
      success(res) {
        console.log("columnInfo", res.data);
        var liveInfo = res.data.liveInfos[0];
        that.setData({
          columnInfo: res.data,
          liveInfo: liveInfo
        })
        wx.request({
          url:url.columnRecommendGoods,
          method: "GET",
          data:{
            enable: 1,
            liveId: liveInfo.id,
            size: 9999
          }, success(res) {
            that.setData({
              goods:res.data.content
            })
            console.log("goods",res.data.content)
          }
        })
      }
    })
  },
  getLives() {
    let that = this;
    wx.request({
      url: url.columnLiveInfo,
      method: 'GET',
      data:{
        enable: 1,
        size:9999,
        sort: 'startTime,desc',
        columnId:this.data.columnInfo.id
      },success(res) {
        var lives = res.data.content;
        lives.forEach(f => {
          f.startTime = util.formatMonthDayHourMinute(new Date(f.startTime));
        });
        that.setData({
          lives: lives
        })
      }
    })
  },
  toBuy(e) {
    let that = this;
    let item = e.currentTarget.dataset.item;
    that.setData({
      clickItem: item,
      modalName: 'DialogModal'
    })
    var goods = that.data.goods;
    console.log(goods);

    goods.forEach(f=>{
      if (f.id === item.id) {
        f.clickNum=(f.clickNum + 1);
      }
    })
    that.setData({
      goods: goods
    })
    wx.request({
      url: url.columnRecommendGoods + '/click',
      method: 'GET',
      data:{
        id: item.id
      }
    })
    console.log(goods);

  },
  toVideo(e) {
    console.log(e.currentTarget.dataset.videourl)
    wx.navigateTo({
      url: "/pages/find/columnInfoVideo/index?videoUrl="+e.currentTarget.dataset.videourl
    })
  },
  copyUrl() {
    //获取剪切板内容
    let that = this;
    wx.getClipboardData({
      success(res) {
        wx.setClipboardData({
          data: that.data.clickItem.goodUrl,
          success(res) {
          }
        })
      }
    });
    this.hideModal();
  },
  toOldLive(e) {
    console.log("e.currentTarget.dataset.columnInfo", e);
    wx.navigateTo({
      url: '/pages/find/oldColumnInfo/index?id=' + e.currentTarget.dataset.columninfo.id + '&liveId=' + e.currentTarget.dataset.live.id
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  // 监听屏幕滚动 判断上下滚动 bindscroll
  onPageScroll: function (ev) {
    if (ev.scrollTop >= this.data.idTop - this.data.CustomBar) {
      if (!this.data.p) {

        this.setData({
          bgImage: 'http://cmtv.xmay.cc/image/live/bg_01.png',
          p: true
        });
        // wx.setNavigationBarColor({
        //     frontColor: '#000000',
        //     backgroundColor: ''
        // });

      }


    } else {
      if (this.data.p) {
        this.setData({
          bgImage: '',
          p: false
        })
        // wx.setNavigationBarColor({
        //     frontColor: '#ffffff',
        //     backgroundColor: ''
        // })
      }

    }

  },
  getIdTop: function () {
    const query = wx.createSelectorQuery()
    query.select('#pj').boundingClientRect()
    query.selectViewport().scrollOffset()
    query.exec(res => {
      let miss = res[1].scrollTop + res[0].top
      this.setData({
        idTop: miss
      })
    })
  },
  // 左右滚动tab标题，切换标签
  switchTab: function(e) {
    let current = e.detail.current;
    this.setData({
      currentTab: current
    });
    if (current === 1) {
      if (this.data.lives.length === 0) {
        this.getLives();
      }
    }
    console.log("当前选中tab标题", current);
    this.getInformation(current); //  获取当前选中tab标题的信息
  },

  // 点击tab标题，切换当前页
  swichNav: function(e) {
    console.log("点击tab标题", e.target.dataset.current);
    let cur = e.target.dataset.current;
    if (this.data.currentTab == cur) {
      return false;
    } else {
      this.setData({
        currentTab: cur
      })
    }
    console.log("当前选中tab标题", cur);
    this.getInformation(cur); //  获取当前选中tab标题的信息
  },

  /****************    高度自适应（rpx）    ****************/
  getWindowHeight: function() {
    let that = this;
    wx.getSystemInfo({
      success: function(res) {
        let clientHeight = res.windowHeight,
            clientWidth = res.windowWidth,
            rpxR = 750 / clientWidth; //比例
        // console.log(clientHeight);
        // console.log(clientWidth);
        let calc = clientHeight * rpxR - (610+48); // 如有最底部导航栏空间，则 calc - 底部导航栏高度
        console.log("rpxR", rpxR);
        console.log("calc", calc);
        that.setData({
          winHeight: calc
        });
      }
    });
  },
  /****************    获取头部导航栏tab标题的名字    ****************/
  getTabName: function () {
    console.log("获取头部导航栏tab标题的名字");
    // 假数据
    this.setData({
      // tabName: [{ name: "星巴克" }, {name:"肯德基"},{name:"必胜客"},{name:"优酷会员"},{name:"哈根达斯"},{name:"太平洋咖啡"},{name:"呷哺呷哺"},{name:"喜马拉雅"},{name:"百果园"},{name:"汉堡王"},{name:"COSTA咖啡"},{name:"coco都可"}],
      tabName: [{ name: "本期好物" }, {name:"往期推荐"}],
    })
  },

  /****************    获取对应tab标题的信息    ****************/
  getInformation: function(tabNum) {
    // 假数据
    if (tabNum == 0) {
      console.log("当前选中第1个tab标题");
      this.setData({
        choosedTabInformation: "1",
      })
    } else if (tabNum == 1) {
      console.log("当前选中第2个tab标题");
      this.setData({
        choosedTabInformation: "2",
      })
    }else if (tabNum == 2) {
      console.log("当前选中第3个tab标题");
      this.setData({
        choosedTabInformation: "3",
      })
    } else if (tabNum == 3) {
      console.log("当前选中第4个tab标题");
      this.setData({
        choosedTabInformation: "4",
      })
    } else if (tabNum == 4) {
      console.log("当前选中第5个tab标题");
      this.setData({
        choosedTabInformation: "5",
      })
    } else if (tabNum == 5) {
      console.log("当前选中第6个tab标题");
      this.setData({
        choosedTabInformation: "6",
      })
    } else if (tabNum == 6) {
      console.log("当前选中第7个tab标题");
      this.setData({
        choosedTabInformation: "7",
      })
    } else if (tabNum == 7) {
      console.log("当前选中第8个tab标题");
      this.setData({
        choosedTabInformation: "8",
      })
    } else if (tabNum == 8) {
      console.log("当前选中第9个tab标题");
      this.setData({
        choosedTabInformation: "9",
      })
    } else if (tabNum == 9) {
      console.log("当前选中第10个tab标题");
      this.setData({
        choosedTabInformation: "10",
      })
    } else if (tabNum == 10) {
      console.log("当前选中第11个tab标题");
      this.setData({
        choosedTabInformation: "11",
      })
    } else if (tabNum == 11) {
      console.log("当前选中第12个tab标题");
      this.setData({
        choosedTabInformation: "12",
      })
    }
  },    //关闭弹出框
  hideModal(e) {
    this.setData({
      modalName: null
    })
  },
})
