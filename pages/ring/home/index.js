// pages/ring/home/index.js
const url = require('../../../utils/url')

Page({

    /**
     * 页面的初始数据
     */
    data: {
        swiperList: [],
        tabList: ['热门推荐', '...', '...'],
        ringType: '热门推荐',
        tabShow: 0,
        TabCur: 0,
        scrollLeft: 0,
        ringList: [],

        size: 10,
        page: 0,
        total: 0,
        isLoad: true,
        isLoadShow: true,

        isFixed: false,
        idTop: 0,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let that = this;
        //获取banner
        wx.request({
            // url: url.banner + "active",
            url: url.banner,
            method: "GET",
            data: {
                bannerType: 'ring',
                enable: 1
            },
            success(res) {
                that.setData({
                    swiperList: res.data.content,
                    bReady: false
                })
            }
        })
        wx.request({
            url: url.setting,
            method: 'GET',
            success(res) {
                console.log(res.data)
                that.setData({
                    tabList: res.data.content[0].ringList.split(","),
                    setting: res.data.content[0]
                });
            }
        })
        that.getData()

    },
    tabSelect(e) {
        let that = this;
        // this.loadProgress()
        this.setData({
            page: 0,
            TabCur: e.currentTarget.dataset.id,
            scrollLeft: (e.currentTarget.dataset.id - 1) * 60,
            tabShow: e.currentTarget.dataset.id,
            ringType: that.data.tabList[e.currentTarget.dataset.id]
        });
        that.getData()


    },


    selectBar: function (e) {
        let that = this;

        console.log("(e.currentTarget.dataset.id - 1) * 60", (e.currentTarget.dataset.id - 1) * 60);
        this.setData({
            // barIndex: e.currentTarget.dataset.id,
            page: 0,
            TabCur: e.currentTarget.dataset.id,
            scrollLeft: (e.currentTarget.dataset.id - 1) * 60,
            tabShow: e.currentTarget.dataset.id,
            ringType: that.data.tabList[e.currentTarget.dataset.id]

            // barScrollLeft: (e.currentTarget.dataset.index - 1) * (res[0].width / this.data.barList.length)
        })
        // const query = wx.createSelectorQuery()
        // query.select('#tabId2').boundingClientRect()
        // query.exec((res) => {
        //
        // })
        this.getData()
    },

    getData() {
        let that = this;
        wx.request({
            url: url.video,
            data: {
                show: "1",
                enable: "1",
                size: that.data.size,
                page: that.data.page,
                videoTypeName: '视频彩铃',
                ringType: that.data.ringType,
                sort: 'top,desc'
            }, success(res) {
                that.setData({
                    isLoad: false,
                    isLoadShow: false,
                });
                if (that.data.page === 0) {
                    that.setData({
                        ringList: res.data.content,
                        total: res.data.totalElements
                    });
                } else {
                    that.setData({
                        ringList: that.data.ringList.concat(res.data.content),
                        total: res.data.totalElements
                    });
                }
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
        wx.setTabBarStyle({
            color: '#afafaf',
            selectedColor: '#F86564',
            backgroundColor: '#ffffff',
            borderStyle: 'white',
        });
        // wx.setTabBarItem({
        //     index: 2,
        //     text: 'text',
        //     iconPath: 'http://cmtv.xmay.cc/image/icon/hl.png',
        //     selectedIconPath: 'http://cmtv.xmay.cc/image/icon/hgsk.jpg'
        // });
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
                    }
                }, fail(res) {
                    wx.navigateTo({
                        url: '/pages/my/login/login'
                    })
                }
            })

        }
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
        this.setData({
            page: 0
        })
        this.getData();
        setTimeout(() => {
            wx.stopPullDownRefresh()
        }, 1000)
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        let that = this;
        var page = parseInt(that.data.total / that.data.size);

        console.log(that.data.total);
        console.log(page);
        if (page > that.data.page) {
            that.setData({
                isLoad: true,
                isLoadShow: true,
                page: that.data.page + 1
            });
            this.getData();
        } else {
            that.setData({
                isLoad: false,
                isLoadShow: true,
            });
        }
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },
    onShareTimeline() {
    },

})
