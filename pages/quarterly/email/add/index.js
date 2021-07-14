// pages/quarterly//email/add/index.js
const VodUploader = require("../../../../lib/vod-wx-sdk-v2.js");
var util = require('../../../../shopConfig/util.js');
var util2 = require('../../../../utils/util.js');
var url = require('../../../../utils/url.js');
var md5 = require('../../../../lib/md5.js');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        id: '',
        name: '',
        imgList: [],
        videoFile: null,
        emailContent: '',
        attPic: '',
        sendTime: 60,
        fileName: '123',
        coverFile: null,
        progress: 0,
        uploader: null,
        modalName: '',
        new: '0',

        isChecked: false,
        canSub: 1,
        userInfo: {},
        authorName: '',
        oldName: null,

        email: {},

        new: '1',

        names: [],
        nameId: 1,
        chooseTabbar: ['私人信件', '树洞信件'],
        chooseTabbarId: 1,

        writerTabbar: ['消耗 0 草莓币', '消耗 50 草莓币', '消耗 100 草莓币'],
        writerTabbarId: 0,
        shudongTabbar: ['不匿名', '匿名'],
        shudongTabbarId: 0,
        sendTimes: ['60', '30', '15'],
        timeIndex: 0,
        cmb: [0, 50, 100]
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let that = this;
        wx.getStorage({
            key: 'userInfo',
            success(res) {
                that.setData({
                    userInfo: res.data
                })
            }, fail(res) {
                wx.navigateTo({
                    url: '/pages/my/login/login'
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

    },
    getName() {
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
    },
    check(e) {
        this.setData({
            isChecked: !e.currentTarget.dataset.checked
        })
        this.setData({
            canSub: !e.currentTarget.dataset.checked
        });
    },
    textareaAInput(e) {
        this.setData({
            textareaAValue: e.detail.value
        })
    },
    Choose() {
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
                                icon: 'none',
                                title: '草莓币不足'
                            })
                        }
                    }, fail(res) {
                        wx.showToast({
                            icon: 'none',
                            title: '请稍后再试'
                        })
                    }
                })
            }
        })
    },
    send() {
        let that = this;
        if (that.data.emailContent.length > 10) {
            wx.showLoading({
                title: '内容上传中...'
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
                that.submit(null, null);
            }
        } else {
            wx.showToast({
                title: '您的信件内容也太短了吧!',
                icon: 'none'
            })
        }
    },
    checkImg(imgList, index) {
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
                        that.submit(imgUrl, null);
                    }
                }
            },
        })
    },
    submit(imgUrl, videoUrl) {
        let that = this;
        // console.log("imgUrl")        console.log(util2.plusDate(parseInt(e.detail.value)));
        var userInfo = that.data.userInfo;
        let l = 'cmt+m_string->'

        var str7 = md5.hex_md5(l);

        // 扣除草莓币
        if (that.data.timeIndex !== 0) {

            wx.request({
                url: url.userInfo + 'cmbPay2',
                method: 'get',
                data: {
                    userId: that.data.userInfo.id,
                    cmb: that.data.cmb[that.data.timeIndex],
                    str: str7
                }, success(res) {
                    wx.request({
                        url: url.openEmailInfo,
                        method: 'POST',
                        data: {
                            authorId: userInfo.id,
                            authorName: userInfo.nickname,
                            authorAvatar: userInfo.avatar,
                            emailType: that.data.chooseTabbarId,
                            emailPic: imgUrl,
                            emailContent: that.data.emailContent,
                            videoUrl: videoUrl,
                            isRead: '0',
                            isAnonymous: that.data.shudongTabbarId,
                            sendTime: util2.plusDate(parseInt(that.data.sendTime))
                        }, success(res) {
                            that.setData({
                                email: res.data
                            })
                            console.log(res);
                            wx.hideLoading();
                            if (that.data.chooseTabbarId === 1) {

                            } else {
                                that.setData({
                                    canSub: 2
                                });
                            }
                        }
                    });
                }
            });
        } else {
            let name = userInfo.nickname;
            if (that.data.shudongTabbarId === 1) {
                name = that.data.names[that.data.nameId];
            }
            wx.request({
                url: url.openEmailInfo,
                method: 'POST',
                data: {
                    authorId: userInfo.id,
                    authorName: name,
                    authorAvatar: userInfo.avatar,
                    emailType: that.data.chooseTabbarId,
                    emailPic: imgUrl,
                    emailContent: that.data.emailContent,
                    videoUrl: videoUrl,
                    isRead: '0',
                    isAnonymous: that.data.shudongTabbarId,
                    sendTime: util2.plusDate(parseInt(that.data.sendTime))
                }, success(res) {
                    that.setData({
                        email: res.data
                    });
                    wx.setStorage({
                        key: 'oldName',
                        data: name
                    })
                    wx.hideLoading();
                    if (that.data.chooseTabbarId === 1) {
                        let pages = getCurrentPages();
                        var prevPage = pages[pages.length - 2];
                        try {
                            prevPage.setData({
                                typeIndex: 0,
                                emailType: '1'
                            })
                            setTimeout(function () {
                                prevPage.onLoad();

                            }, 1000);
                        } catch (e) {

                        }
                        wx.navigateBack();
                    } else {
                        that.setData({
                            canSub: 2
                        });
                    }
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
        let that = this;
        // wx.uploadFile({
        //     url: url.WX + '/checkImg',
        //     filePath: imgList[index],
        //     name: "file",
        //     header: {
        //         "Content-Type": "multipart/form-data"
        //     },
        //     formData: {
        //         "fileName": new Date().getTime()
        //     },
        //     success: function (r) {
        //         if (r.data === '600') {
        //             wx.showToast({
        //                 icon: 'none',
        //                 title: '第' + (index + 1) + '图片不合法'
        //             })
        //         } else {
        //             console.log("index", index);
        //             if (index !== 0) {
        //                 that.upload(imgList, index - 1);
        //             } else {
        //
        //             }
        //         }
        //     },
        // })
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
        let that = this;

        var imgList = that.data.imgList;
        var index = imgList.length;
        // that.uploadImg(imgList, index - 1);
        console.log(that.data.email);
        let pages = getCurrentPages();
        var prevPage = pages[pages.length - 2];
        try {
            prevPage.setData({
                typeIndex: 1,
                emailType: '0'
            })

            prevPage.onLoad();

        } catch (e) {

        }
        // wx.navigateBack();

        return {
            // title: that.data.userInfo.nickname + '给您的信件',
            title: that.data.email.authorName + '给您的信件',
            imageUrl: 'https://obs-qych2.obs.cn-north-4.myhuaweicloud.com/email/email.jpg',
            desc: that.data.email.emailContent.substring(0, 10) + '...',
            path: 'pages/quarterly/email/home/index?send=send&emailType=0&typeIndex=1&emailId=' + that.data.email.id

        }
    },
    /**
     * changChooseTabbar
     */
    changChooseTabbar: function (e) {
        this.setData({
            chooseTabbarId: e.currentTarget.dataset.index,
            timeIndex: 0,
            writerTabbarId: 0
        })
    },

    /**
     * changWriteTabbar
     */
    changWriteTabbar: function (e) {
        var index = e.currentTarget.dataset.index;
        if (index === 0) {
            this.setData({
                sendTime: 60,
                timeIndex: 0

            });
        } else if (index === 1) {
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
     * changShudongTabbar
     */
    changShudongTabbar: function (e) {
        this.setData({
            shudongTabbarId: e.currentTarget.dataset.index
        })
    },
})
