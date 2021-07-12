const util = require('../../../utils/util')
const app = getApp();
const url = require('../../../utils/url')
Component({
    properties: {
        video: {
            type: Object,
            value: null
        },
        videoId: {
            type: String,
            value: 'undefined'
        }
    },

    data: {
        videoData: {},
        likeImg: '/images/like.png',
        timer: null,
        userId2: null,
        question: {},
        StatusBar: app.globalData.StatusBar,
        CustomBar: app.globalData.CustomBar,
        Custom: app.globalData.Custom,
        height: app.globalData.height,
    },

    observers: {
        video(video) {
            let that = this
            console.log("video",video)
            wx.request({
                url: url.activeAttTalkReplay + '/getReplyByUserId',
                method: 'GET',
                data:{
                    userId: video.videoInfo.userId,
                },success(res) {
                    if (res.data !== 404) {
                        that.setData({
                            question: res.data
                        })
                    }
                }
            })
            // wx.getStorage({
            //     key: 'userInfo',
            //     success(res) {
            //         that.setData({
            //             userId2: res.data.id
            //         })
            //     }
            // })
            // wx.request({
            //     url: url.video,
            //     method: 'GET',
            //     data: {
            //         id: video.videoInfo.id,
            //         userId2: that.data.userId2
            //     }, success(res) {
            //         var video = res.data.content[0];
            //
            //         if (video.like === 1) {
            //
            //             that.setData({
            //                 // videoData: video,
            //                 likeImg: '/images/liking.png'
            //             });
            //         } else {
            //             that.setData({
            //                 // videoData: video,
            //                 likeImg: '/images/like.png'
            //             });
            //         }
            //         that.setData({
            //             'videoData.videoInfo': video
            //         })
            //     }
            // })
            if (typeof video === 'object') {
                if (video.videoInfo.like === 1) {

                    this.setData({
                        videoData: video,
                        likeImg: '/images/liking.png'
                    });
                } else {
                    this.setData({
                        videoData: video,
                        likeImg: '/images/like.png'
                    });
                }
            }
        }
    },
    methods: {
        onForwardTap() {
            this.setData({
                'videoData.videoInfo.videoShareNum': this.data.videoData.videoInfo.videoShareNum + 1
            })
        },
        toUserDetail(event) {
            console.log(event)
            wx.navigateTo({url: '/pages/my/userDetail/index?id=' + event.currentTarget.dataset.item+'&tabShow=1'})
        },
        doLike(e) {
            let that = this;

            wx.getStorage({
                key: 'userInfo',
                success(res) {
                    let user = res.data;
                    console.log(user)
                    let videoListElement = that.data.videoData.videoInfo;
                    clearTimeout(that.data.timer);
                    let l = videoListElement.like;
                    console.log(l);
                    if (videoListElement.like === 1) {
                        videoListElement.like = 0;
                        videoListElement.videoLikeNum = videoListElement.videoLikeNum - 1;
                        l = 0;
                        that.setData({
                            likeImg: '/images/like.png',
                            'videoData.videoInfo': videoListElement
                        });
                    } else {
                        videoListElement.like = 1;
                        videoListElement.videoLikeNum = videoListElement.videoLikeNum + 1;
                        l = 1;
                        that.setData({
                            likeImg: '/images/liking.png',
                            'videoData.videoInfo': videoListElement
                        });
                    }
                    that.setData({
                        timer: setTimeout(() => {
                            if (l === 1) {
                                wx.request({
                                    url: url.videoLikeInfo,
                                    method: 'POST',
                                    data: {
                                        videoId: videoListElement.id,
                                        userId: res.data.id
                                    }
                                });
                            } else {
                                wx.request({
                                    url: url.videoLikeInfo,
                                    method: 'PUT',
                                    data: {
                                        videoId: videoListElement.id,
                                        userId: res.data.id
                                    }
                                });
                            }
                        }, 500)
                    })
                }, fail(res) {
                    wx.navigateTo({
                        url: '/pages/my/login/login'
                    })
                }
            })

        },
        setVideo(e) {
            let videoInfo = e.currentTarget.dataset.item
            console.log(videoInfo)
            wx.navigateTo({
                url: '/pages/find/setVideo/index?id=' + videoInfo.id + '&name=' + videoInfo.videoName,
            })
        },
        btnComment: function () {
            console.log(21)
            this.triggerEvent('btnComment', this.data.video.videoInfo)
            // let that = this;
            // console.log(that.data.popupShow);
            // this.setData({
            //   popupShow: !that.data.popupShow
            // })
        },
        toQA(e){
            console.log(e.currentTarget.dataset.video.userId)
            wx.navigateTo({
                url: '/pages/find/qa/index?userId=' + e.currentTarget.dataset.video.userId
            })
        },
        downloadFile(e) {
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
                                wx.showLoading({
                                    title:'下载中...'
                                })
                                wx.downloadFile({
                                    url: e.currentTarget.dataset.item.videoUrl, // 下载资源的 url
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
                                                wx.hideLoading()
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
                        wx.showLoading({
                            title:'下载中...'
                        })
                        wx.downloadFile({
                            url: e.currentTarget.dataset.item.videoUrl, // 下载资源的 url
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
                                        wx.hideLoading()
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
});
