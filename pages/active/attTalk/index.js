// pages/active/attTalk/index.js
const VodUploader = require("../../../lib/vod-wx-sdk-v2.js");
const url = require('../../../utils/url')
const util = require('../../../utils/util')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: '',
    name: '',
    imgList: [],
    videoFile: null,
    attDetail: '',
    attPic: '',
    // getSignature: '',
    fileName: '123',
    coverFile: null,
    progress: 0,
    uploader: null,
    modalName: '',
    videoName: '',
    videoUrl: '',
    videoImg: '',
    new: '0',

    isChecked: false,
    canSub: true
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
    let that = this;
    if (that.data.new === '1') {
      that.setData({
        modalName: "DialogModal3"
      });
    } else {
      that.ChooseImage();
    }
    // wx.showModal({
    //   content: '上传视频或者图片',
    //   cancelText: '图片',
    //   cancelColor:'#000',
    //   confirmText: '视频',
    //   confirmColor: '#000',
    //   complete(res) {
    //     console.log(res.confirm);
    //     //视频
    //     if (res.confirm) {
    //       that.chooseVideo();
    //     } else {//图片
    //       that.ChooseImage();
    //     }
    //   }
    // });
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
    this.hideModal();
    wx.chooseImage({
      count: 1, //默认9
      sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], //从相册选择
      success: (res) => {
        this.setData({
          canSub: true
        })
        if (this.data.imgList.length != 0) {
          this.setData({
            imgList: this.data.imgList.concat(res.tempFilePaths),
          })
        } else {
          this.setData({
            imgList: res.tempFilePaths
          })
        }
        this.setData({
          videoFile: ''
        })
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
    wx.chooseMedia({
      mediaType: ['video'],
      // sourceType: ["album", "camera"],
      // compressed: false,
      // maxDuration: 1,
      success: function (file) {
        self.setData({
          videoFile: file.tempFiles[0],
          imgList: [],
          canSub: false
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

      mediaName: self.data.videoName, //选填，视频名称，强烈推荐填写(如果不填，则默认为“来自小程序”)
      coverFile: self.data.coverFile, // 选填，视频封面
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
        // console.log("finish");
        // console.log(result);


        that.setData({
          videoUrl: result.videoUrl,
          videoName: result.videoName,
          videoImg: result.coverUrl
        })


        let options = {
          id: that.data.id
        }
        console.log("that.data.coverFile", that.data.coverFile[0]);
        wx.getStorage({
          key: 'userInfo',
          success(res) {
            wx.request({
              url: url.activeAttTalk,
              method: 'POST',
              data: {
                activeId: that.data.id,
                activeName: that.data.name,
                userId: res.data.id,
                userName: res.data.nickname,
                userAvatar: res.data.avatar,
                attDetail: that.data.attDetail,
                videoName: result.videoName,
                videoUrl: result.videoUrl,
                videoImg: that.data.videoImg,
                enable: 1,
                videoShow: '0'
              }, success(res) {
                console.log(res)
                let l = [];
                let items = res.data;
                items.createTime = util.formatMonthDay(new Date(items.createTime))
                l.push(items);
                if (items === 600) {
                  wx.showToast({
                    title: '内容不合法!',
                    icon: 'none'
                  });
                } else {
                  wx.showToast({
                    title: '审核中...',
                    icon: 'none',
                    success(res) {

                    }
                  })
                  // let pages = getCurrentPages();
                  // var prevPage = pages[pages.length - 2];
                  // prevPage.setData({
                  //   // nowAttTimes: prevPage.data.nowAttTimes + 1
                  //   // attTalkList: l.concat(prevPage.data.attTalkList)
                  //   page: 0
                  // });
                  // wx.navigateBack();/**/
                  // wx.hideLoading();
                  setTimeout(() => {
                    wx.navigateBack();
                  }, 1000)
                }
              }
            })

          }
        })


        // wx.showModal({
        //   title: "上传成功",
        //   content:
        //     "fileId:" + result.fileId + "\nvideoName:" + result.videoNam
        // });
        self.reset();
      }
    });
    this.setData({
      uploader: uploader,
    })
  },
  reset() {
    this.setData({
      fileName: "",
      videoFile: null,
      coverFile: null,
      progress: 0,
      uploader: null,
    })
  },
  submit() {
    let that = this;

    if (that.data.attDetail.length > 10) {
      wx.showLoading({
        title: '加载中...',
      });
      wx.getStorage({
        key: 'userInfo',
        success(res) {
          that.setData({
            canSub: false
          })
          if (that.data.imgList.length !== 0) {//上传图片
            wx.uploadFile({
              url: url.activeAttTalk + '/talkUploadFile',
              filePath: that.data.imgList[0],
              name: "file",
              header: {
                "Content-Type": "multipart/form-data"
              },
              formData: {
                "fileName": new Date().getTime(),
                activeId: that.data.id,
                userId: res.data.id
              },
              success: function (r) {
                if (r.data === '600') {
                  wx.showToast({
                    title: '图片不合法!',
                    icon: 'none'
                  });
                } else if (r.data === '601') {
                  wx.showToast({
                    title: '打卡次数已达上限!',
                    icon: 'none'
                  });
                } else {
                  that.setData({
                    attPic: r.data
                  })

                  wx.request({
                    url: url.activeAttTalk,
                    method: 'POST',
                    data: {
                      activeId: that.data.id,
                      activeName: that.data.name,
                      userId: res.data.id,
                      userName: res.data.nickname,
                      userAvatar: res.data.avatar,
                      attDetail: that.data.attDetail,
                      attPic: r.data
                    }, success(res) {
                      console.log(res)
                      let l = [];
                      let items = res.data;

                      if (items === 600) {
                        wx.showToast({
                          title: '内容不合法!',
                          icon: 'none'
                        });
                        wx.hideLoading();

                      } else if (items === 700) {
                        wx.showToast({
                          title: '当前用户被限制发言,请联系客服!',
                          icon: 'none'
                        });
                        wx.hideLoading();

                      } else {
                        items.createTime = util.formatMonthDay(new Date(items.createTime))
                        l.push(items);
                        let pages = getCurrentPages();
                        var prevPage = pages[pages.length - 2];
                        prevPage.setData({
                          nowAttTimes: prevPage.data.nowAttTimes + 1,
                          attTalkList: l.concat(prevPage.data.attTalkList)
                        });
                        let options = {
                          id: that.data.id
                        };
                        wx.hideLoading();
                        wx.navigateBack();
                      }
                    }
                  })

                }
              }
            });
          } else if (that.data.videoFile !== null) {//上传视频
            if (that.data.isChecked) {
              if (that.data.coverFile !== null) {
                that.startUpload();
              } else {
                // if (that.data.coverFile === null) {
                  wx.showToast({
                    title: '请添加视频封面',
                    icon: 'none'
                  });
                // }
                // if (that.data.videoName === '') {
                //   wx.showToast({
                //     title: '请添加视频名称',
                //     icon: 'none'
                //   })
                // }
              }
            } else {
              wx.showToast({
                title: '请同意上传声明',
                icon: 'none'
              })
            }


          } else {//只有文字
            wx.request({
              url: url.activeAttTalk,
              method: 'POST',
              data: {
                activeId: that.data.id,
                activeName: that.data.name,
                userId: res.data.id,
                userName: res.data.nickname,
                userAvatar: res.data.avatar,
                attDetail: that.data.attDetail,
              }, success(res) {
                console.log(res)
                if (res.data === 600) {
                  wx.hideLoading();
                  wx.showToast({
                    title: '内容不合法!',
                    icon: 'none'
                  });
                } else if (res.data === 700) {
                  wx.hideLoading();
                  wx.showToast({
                    title: '当前用户被限制发言,请联系客服!',
                    icon: 'none'
                  });
                } else {
                  let l = [];
                  let items = res.data;
                  items.createTime = util.formatMonthDay(new Date(items.createTime))
                  l.push(items);

                  let pages = getCurrentPages();
                  var prevPage = pages[pages.length - 2];
                  prevPage.setData({
                    nowAttTimes: prevPage.data.nowAttTimes + 1,
                    attTalkList: l.concat(prevPage.data.attTalkList)
                  })
                  let options = {
                    id: that.data.id
                  }
                  wx.hideLoading();
                  wx.navigateBack();
                }
              }
            });
          }

        }
      });
    } else {
      wx.showToast({
        title: '请多说一点吧...',
        icon: "none"
      });
    }
  },
  hideModal() {
    this.setData({
      modalName: ''
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    let that = this;
    that.setData({
      id: options.id,
      name: options.name,
      new: options.new,
      activeStatement: options.activeStatement
    })
    // that.getSignature();
  }
  ,

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  }
  ,

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  }
  ,

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  }
  ,

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  }
  ,

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  }
  ,

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  }
  ,

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function () {
  //
  // }
})
