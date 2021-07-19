const app = getApp();
Component({
    /**
     * 组件的一些选项
     */
    options: {
        addGlobalClass: true,
        multipleSlots: true
    },
    /**
     * 组件的对外属性
     */
    properties: {
        bgColor: {
            type: String,
            default: ''
        },
        isCustom: {
            type: [Boolean, String],
            default: false
        },
        isBack: {
            type: [Boolean, String],
            default: false
        },
        isHome: {
            type: [Boolean, String],
            default: false
        },
        bgImage: {
            type: String,
            default: ''
        },
        iconColor: {
            type: String,
            default: 'white'
        },
        radius: {
            type: Boolean,
            default: false
        },
        isSearch: {
            type: Boolean,
            default: false
        },
        stepInfo: {
            type: {},
            default: null
        },
        download: {
            type: String,
            default: null
        }
    },
    /**
     * 组件的初始数据
     */
    data: {
        StatusBar: app.globalData.StatusBar,
        CustomBar: app.globalData.CustomBar,
        Custom: app.globalData.Custom,
        height: app.globalData.height,
    },
    /**
     * 组件的方法列表
     */
    methods: {
        BackPage() {
            wx.navigateBack({
                delta: 1
            });
        },
        toHome() {
            wx.reLaunch({
                url: '/tabbar/live/newhome/index',
            })
        },
        downloadFile() {
            let that = this;
            console.log("downloadFile");
            const filePath = wx.env.USER_DATA_PATH + '/123.mp4'

            wx.getSetting({
                success: function (res) {
                    console.log(res)
                    //不存在相册授权
                    if (!res.authSetting['scope.writePhotosAlbum']) {
                        wx.authorize({
                            scope: 'scope.writePhotosAlbum',
                            success: function () {
                                that.setData({
                                    canWrite: true
                                })
                                wx.downloadFile({
                                    url: that.properties.download, // 下载资源的 url
                                    filePath: filePath,
                                    success(res) {
                                        // const filePath = res.tempFilePath
                                        wx.saveImageToPhotosAlbum({
                                            filePath: filePath,
                                            success: function (res2) {
                                                if (res.statusCode === 200) {
                                                    wx.showToast({
                                                        icon: 'none',
                                                        title: '文件已保存到相册'
                                                    })
                                                }
                                            },
                                            fail: function (res2) {
                                                console.log('保存到本地相册-失败', res2)
                                            },
                                            complete: function (res2) {
                                                console.log('保存到本地相册-请求complete', res2)
                                            }
                                        })
                                    }
                                })

                            },
                            fail: function (err) {
                                that.setData({
                                    canWrite: false
                                })
                            }
                        })
                    }else {
                        that.setData({
                            canWrite: true
                        });
                        wx.downloadFile({
                            url: that.properties.download, // 下载资源的 url
                            filePath: filePath,
                            success(res) {
                                // const filePath = res.tempFilePath
                                wx.saveVideoToPhotosAlbum({
                                    filePath: filePath,
                                    success: function (res2) {
                                        if (res2.statusCode === 200) {
                                            wx.showToast({
                                                icon: 'none',
                                                title: '文件已保存到相册'
                                            })
                                        }
                                    },
                                    fail: function (res2) {
                                        console.log('保存到本地相册-失败', res2)
                                    },
                                    complete: function (res2) {
                                        console.log('保存到本地相册-请求complete', res2)
                                    }
                                })
                            }
                        })

                    }
                }
            })

            // let api = wx.saveVideoToPhotosAlbum
            // if (obj.file_type.match(/^image\/*/)) {
            //     api = wx.saveImageToPhotosAlbum
            // }
        }
    }
})
