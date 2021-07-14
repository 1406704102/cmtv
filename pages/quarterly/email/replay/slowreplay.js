// pages/slowreplay/slowreplay.js
var util = require('../../../../shopConfig/util.js');
var url = require('../../../../utils/url.js');
var util2 = require('../../../../utils/util.js');
var md5 = require('../../../../lib/md5.js');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        type: 0,
        email: {},
        imgList: [],
        videoFile: null,
        writerTabbar: ['消耗 0 草莓币', '消耗 50 草莓币', '消耗 100 草莓币'],
        writerTabbarId: 0,
        shudongTabbar: ['不匿名', '匿名'],
        shudongTabbarId: 0,


        userInfo: {},
        replayContent: "",
        sendTime: 60,
        sendTimes: ['60','30','15'],
        timeIndex: 0,
        cmb: [0, 50, 100],
        names: [],
        nameId: 1,
        authorName: '',
        oldName: null,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log(options)
        this.setData({
            type: options.type
        })
        let that = this;
        wx.request({
            url: url.openEmailInfo + "/" + options.id,
            method: 'GET',
            success(res) {
                that.setData({
                    email: res.data
                })
            }
        })
        wx.getStorage({
            key: 'userInfo',
            success(res) {
                that.setData({
                    userInfo: res.data
                })
            }
        })
        that.getName()
        wx.getStorage({
            key: 'oldName',
            success(res) {
                that.setData({
                    'names[1]': res.data
                })
            }
        })
    },getName() {
        let that = this;
        wx.request({
            url: url.openEmailInfo + '/getName',
            method: 'GET',
            success(res) {
                that.setData({
                    authorName: res.data.authorName,
                    'names[0]': res.data.authorName
                })
            }
        })
    }, Choose() {
        console.log(1)
        let that = this;
        if (that.data.new === '1') {
            that.setData({
                modalName: "DialogModal3"
            });
        } else {
            that.ChooseImage();
        }
    },

    chooseCover() {
        const self = this;
        wx.chooseImage({
            sourceType: ["album", "camera"],
            count: 1,
            success: function (file) {
                console.log(file);
                self.setData({
                    coverFile: file
                });
                console.log(`add coverFile`, file);
            }
        });
    },
    ChooseImage() {
        console.log(2)
        this.hideModal();
        let that = this;
        that.setData({
            videoFile: null
        })
        wx.chooseImage({
            count: 9, //默认9
            sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
            sourceType: ['album', 'camera'], //从相册选择
            success: (res) => {
                that.setData({
                    canSub: 1
                });
                if (that.data.imgList.length != 0) {
                    that.setData({
                        imgList: that.data.imgList.concat(res.tempFilePaths),
                    })
                } else {
                    that.setData({
                        imgList: res.tempFilePaths
                    })
                }
                that.setData({
                    videoFile: ''
                })
            },
            complete(res) {

            }
        });
    },
    ViewImage(e) {
        wx.previewImage({
            urls: this.data.imgList,
            current: e.currentTarget.dataset.url
        });
    },
    DelImg(e) {
        wx.showModal({
            title: '',
            content: '确定要删除图片?',
            cancelText: '取消',
            confirmText: '确定',
            success: res => {
                if (res.confirm) {
                    this.data.imgList.splice(e.currentTarget.dataset.index, 1);
                    this.setData({
                        imgList: this.data.imgList
                    })
                }
            }

        })
    },
    chooseVideo: function () {
        const self = this;
        self.hideModal()
        self.setData({
            videoFile: null
        })
        wx.chooseMedia({
            mediaType: ['video'],
            count: 1,
            // sourceType: ["album", "camera"],
            // compressed: false,
            // maxDuration: 1,
            success: function (file) {

                self.setData({
                    videoFile: file.tempFiles[0],
                    imgList: [],
                    canSub: 1
                });
                // console.log(`add videoFile`, file.tempFiles[0]);

            }, fail(res) {
                console.log(res);
            }
        });
    },
    getSignature: function (callback) {
        const that = this;
        wx.request({
            url: url.getSignature,
            method: 'get',
            dataType: 'json',
            success: function (res) {
                console.log(res);
                that.setData({
                    getSignature: res.data
                })
                callback(res.data)
                // if (res.data && res.data.data.signature) {
                //   callback(res.data.data.signature);
                // } else {
                //   return '获取签名失败';
                // }
            }
        });
    },
    hideModal() {
        this.setData({
            modalName: ''
        })
    },
    startUpload() {
        wx.showLoading({
            title: '处理中',
            mask: true,
        })
        const self = this;
        const that = this;
        const uploader = VodUploader.start({
            mediaFile: self.data.videoFile, //必填，把chooseVideo回调的参数(file)传进来
            getSignature: self.getSignature, //必填，获取签名的函数

            mediaName: self.data.emailContent.substring(0, 9), //选填，视频名称，强烈推荐填写(如果不填，则默认为“来自小程序”)
            // coverFile: self.data.coverFile, // 选填，视频封面
            error: function (result) {
                wx.hideLoading();
                wx.showModal({
                    title: "上传失败",
                    showCancel: false
                });
            },
            progress: function (result) {
                // console.log("progress");
                // console.log(result);
                wx.hideLoading();
                self.setData({
                    progress: parseInt(result.percent * 100)
                })
                wx.showLoading({
                    title: "上传中 " + result.percent * 100 + "%"
                });
            },
            finish: function (result) {
                console.log(result);
                that.submit(null, result.videoUrl);
            }
        });
        this.setData({
            uploader: uploader,
        })
    },
    checkCMB() {
        let that = this;
        wx.getStorage({
            key: 'userInfo',
            success(res) {
                wx.request({
                    url: url.userInfo + 'getCmb?userId=' + res.data.id,
                    method: 'GET',
                    success(res) {
                        var chbeanNum = res.data.chbeanNum / 100;
                        console.log(chbeanNum >= that.data.cmb[that.data.timeIndex])
                        if (chbeanNum >= that.data.cmb[that.data.timeIndex]) {
                            that.send();
                        } else {
                            wx.showToast({
                                icon:'none',
                                title:'草莓币不足'
                            })
                        }
                    },fail(res) {
                        wx.showToast({
                            icon:'none',
                            title:'请稍后再试'
                        })
                    }
                })
            }
        })
    },
    send() {
        let that = this;
        if (that.data.replayContent.length > 10) {
            wx.showLoading({
                title: '加载中...'
            })
            that.setData({
                canSub: 0
            })
            var imgList = that.data.imgList;
            var index = imgList.length;
            if (index > 0) {
                that.uploadImg(imgList, 0);
            } else if (that.data.videoFile !== null) {

                // that.submit(null, videoUrl);
                that.startUpload();
            } else {
                that.submit2(null, null);
            }
        } else {
            wx.showToast({
                title: '您的信件内容也太短了吧!',
                icon: 'none'
            })
        }
    },
    checkImg(imgList, index) {
        console.log(imgList)
        console.log(index)
        let that = this;
        wx.uploadFile({
            url: url.WX + '/checkImg',
            filePath: imgList[index],
            name: "file",
            header: {
                "Content-Type": "multipart/form-data"
            },
            formData: {
                "fileName": new Date().getTime()
            },
            success: function (r) {
                if (r.data === '600') {
                    wx.showToast({
                        icon: 'none',
                        title: '第' + (index + 1) + '图片不合法'
                    })
                } else {
                    console.log("index", index);
                    if (index !== 0) {
                        that.checkImg(imgList, index - 1);
                    } else {
                        that.uploadImg(imgList, imgList.length - 1, '');
                    }
                }
            },
        })
    },
    uploadImg(imgList, index, imgUrl) {
        let that = this;
        console.log("uploadImg")
        wx.uploadFile({
            url: url.WX + '/uploadImg',
            filePath: imgList[index],
            name: "file",
            header: {
                "Content-Type": "multipart/form-data"
            },
            formData: {
                "fileName": new Date().getTime()
            },
            success: function (r) {
                if (r.data === '600') {
                    wx.showToast({
                        icon: 'none',
                        title: '第' + (index + 1) + '图片不合法'
                    })
                } else {
                    imgUrl = r.data + ',' + imgUrl;
                    if (index < imgList.length - 1) {
                        that.uploadImg(imgList, index + 1, imgUrl);
                    } else {
                        that.submit2(imgUrl, null);
                    }
                }
            },
        })
    },
    submit2(imgUrl, videoUrl) {
        let that = this;
        // console.log("imgUrl")        console.log(util2.plusDate(parseInt(e.detail.value)));
        let l = 'cmt+m_string->'

        var str7 = md5.hex_md5(l);
        var userInfo = that.data.userInfo;
        if (that.data.timeIndex !== 0) {

            wx.request({
                url: url.userInfo + 'cmbPay2',
                method: 'get',
                data: {
                    userId: that.data.userInfo.id,
                    cmb: that.data.cmb[that.data.timeIndex],
                    str: str7
                }, success(res) {
                    if (res.data === 200) {
                        wx.request({
                            url: url.openEmailInfo,
                            method: 'POST',
                            data: {
                                authorId: userInfo.id,
                                authorName: userInfo.nickname,
                                authorAvatar: userInfo.avatar,
                                emailType: "0",
                                emailPic: imgUrl,
                                emailContent: that.data.replayContent,
                                videoUrl: videoUrl,
                                isRead: '0',
                                isAnonymous: "2",
                                toUser: that.data.email.authorId,
                                sendTime: util2.plusDate(parseInt(that.data.sendTime))
                            }, success(res) {
                                // that.setData({
                                //     email: res.data
                                // })
                                wx.hideLoading();
                                that.setData({
                                    canSub: 2
                                })
                                // console.log(res);
                                wx.navigateBack({
                                    delta: 2
                                });
                            }
                        });
                    } else {
                        wx.showToast({
                            icon:'none',
                            title:'请稍后再试'
                        })
                    }
                }
            });
        } else {
            wx.request({
                url: url.openEmailInfo,
                method: 'POST',
                data: {
                    authorId: userInfo.id,
                    authorName: userInfo.nickname,
                    authorAvatar: userInfo.avatar,
                    emailType: "0",
                    emailPic: imgUrl,
                    emailContent: that.data.replayContent,
                    videoUrl: videoUrl,
                    isRead: '0',
                    isAnonymous: "2",
                    toUser: that.data.email.authorId,
                    sendTime: util2.plusDate(parseInt(that.data.sendTime))
                }, success(res) {
                    // that.setData({
                    //     email: res.data
                    // })
                    wx.hideLoading();
                    that.setData({
                        canSub: 2
                    })
                    // console.log(res);
                    wx.navigateBack({
                        delta: 2
                    });
                }
            });
        }


    },
    sendTime(e) {
        this.setData({
            sendTime: e.detail.value
        })
        console.log(util2.plusDate(parseInt(e.detail.value)));
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
    submit() {
        let that = this;
        wx.showLoading({
            title:'加载中...'
        })
        var userInfo = that.data.userInfo;
        let name = userInfo.nickname;
        if (that.data.shudongTabbarId === 1) {
            name = that.data.names[that.data.nameId];
        }
        console.log(that.data.type);
        if (that.data.type === '0') {
            wx.request({
                url:url.openEmailComments,
                method: 'POST',
                data:{
                    userId:userInfo.id,
                    userName: name,
                    commentsContent: that.data.replayContent,
                    userAvatar:userInfo.avatar,
                    emailId: that.data.email.id,
                    isAnonymous: that.data.shudongTabbarId
                }, success(res) {
                    if (res.data !== '600') {
                        wx.setStorage({
                            key: 'oldName',
                            data: name
                        })
                        wx.hideLoading();
                        wx.navigateBack();
                    } else {
                        wx.hideLoading();
                        wx.showToast({
                            icon: 'none',
                            title: '请输入合法内容!'
                        })
                    }
                }
            })
        }
    },
    /**
     * changWriteTabbar
     */
    /**
     * changShudongTabbar
     */
    changShudongTabbar: function (e) {
        this.setData({
            shudongTabbarId: e.currentTarget.dataset.index
        })
    },
    setName(e) {
        var index = e.currentTarget.dataset.index;
        if (index === this.data.nameId && this.data.nameId === 0) {
            this.getName();
        }
        this.setData({
            nameId: index
        });
    },
    /**
     * 选择图片
     */
    ChooseImage: function () {
        wx.chooseImage({
            count: 9 - this.data.imgList.length, // 默认9
            sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ['album'], // 从相册选择
            success: (res) => {
                if (this.data.imgList.length != 0) {
                    this.setData({
                        imgList: this.data.imgList.concat(res.tempFilePaths)
                    })
                } else {
                    this.setData({
                        imgList: res.tempFilePaths
                    })
                }
            }
        })
    },
    changWriteTabbar: function (e) {
        var index = e.currentTarget.dataset.index;
        if (index === 0) {
            this.setData({
                sendTime: 60,
                timeIndex: 0
            });
        }else if (index === 1) {
            this.setData({
                sendTime: 30,
                timeIndex: 1

            });
        } else {
            this.setData({
                sendTime: 15,
                timeIndex: 2
            });
        }
        this.setData({
            writerTabbarId: index
        });

    },
});
