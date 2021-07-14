

// pages/find/videoDetail/index.js
const util = require('../../../utils/util')
const url = require('../../../utils/url')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: '',
    name: '',
    videoUrl: '',
    likeImg: '/images/like.png',
    liking: 0,
    like: 0,
    likeNum: 0,
    startTime: 0,
    videoInfo: {},
    ringId: "0",
    userInfo: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // wx.hideShareMenu()
    let that = this;


    that.setData({
      id: options.id,
      name: options.name,
      videoUrl: options.url
    })
    //获取订阅关系
    wx.getStorage({
      key: 'userInfo',
      success(res) {
        wx.request({
          url: url.videoLikeInfo + '/getVideoLike',
          method: 'GET',
          data: {
            videoId: options.id,
            userId: res.data.id,
            enable: '1'
          },
          success(res) {

            if (res.data !== "") {
              that.setData({
                likeImg: '/images/liking.png',
                liking: 1,
              })
            }
          }
        })
      }
    })
    //获取视频信息(喜欢数/分享数)
    wx.request({
      url: url.video,
      method: 'GET',
      data: {
        id: options.id
      }, success(res) {
        let contentElement = res.data.content[0];
        console.log("video", contentElement.ringId);
        if (contentElement.ringId !== null) {
          that.setData({
            ringId: contentElement.ringId
          });
        }
        that.setData({
          videoInfo: contentElement,
          likeNum: contentElement.videoLikeNum
        });
        wx.request({
          url: url.userInfo + contentElement.userId,
          method: 'GET',
          success(res) {
            console.log(res.data);
            that.setData({
              userInfo: res.data
            })
          }
        })
      }
    })
    //获取用户信息(头像/id)


    //获取分享数

  },
  doLike() {
    let that = this
    let liking = that.data.liking;
    that.setData({
      like: 1
    })
    wx.getStorage({
      key: 'userInfo',
      success(res) {
        if (liking === 1) {
          that.setData({
            liking: 0,
            likeImg: '/images/like.png',
            likeNum: that.data.likeNum - 1
          })
        } else if (liking === 0){
          that.setData({
            liking: 1,
            likeImg: '/images/liking.png',
            likeNum: that.data.likeNum + 1
          })
        }
      }, fail(res) {
        wx.navigateTo({
          url: '/pages/my/login/login?type=0&id='+that.data.id+'&url='+that.data.videoUrl+'&name='+that.data.name,
        })
      }
    })
  },
  like() {
    let that = this;

    wx.getStorage({
      key: 'userInfo',
      success(res) {
        let user = res.data;
        console.log(user)
        let videoListElement = that.data.videoInfo;
        clearTimeout(that.data.timer);
        let l = videoListElement.like;
        console.log(l);
        if (videoListElement.like === 1) {
          videoListElement.like = 0;
          videoListElement.videoLikeNum = videoListElement.videoLikeNum - 1;
          l = 0;
          that.setData({
            likeImg:'/images/like.png',
            videoInfo:videoListElement
          });
        } else {
          videoListElement.like = 1;
          videoListElement.videoLikeNum = videoListElement.videoLikeNum + 1;
          l = 1;
          that.setData({
            likeImg:'/images/liking.png',
            videoInfo:videoListElement
          });
        }
        that.setData({
          timer:setTimeout(()=>{
            if (l === 1) {
              wx.request({
                url: url.videoLikeInfo,
                method: 'POST',
                data:{
                  videoId:that.data.videoInfo.id2,
                  userId: res.data.id
                }
              });
            } else {
              wx.request({
                url: url.videoLikeInfo,
                method: 'PUT',
                data:{
                  videoId:that.data.videoInfo.id2,
                  userId: res.data.id
                }
              });
            }
          },900)
        })
      }, fail(res) {
        wx.navigateTo({
          url: '/pages/my/login/login?type=0&id='+that.data.id+'&url='+that.data.videoUrl+'&name='+that.data.name,
        })
      }
    });


  },
  share() {
    let that = this;
    wx.getStorage({
      key: 'userInfo',
      success(res) {
        wx.request({
          url:url.videoShareInfo,
          method: 'POST',
          data:{
            userId: res.data.id,
            videoId: that.data.id
          },
          success(res) {
            that.setData({
              'videoInfo.videoShareNum':res.data.videoShareNum
            })
          }
        })
      }, fail(res) {
        wx.navigateTo({
          url: '/pages/my/login/login?type=0&id='+that.data.id+'&url='+that.data.videoUrl+'&name='+that.data.name,
        })
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
    let that = this

    this.setData({
      startTime: new Date().getTime()
    })
    // wx.getStorage({
    //   key: 'userInfo',
    //   success(res) {
        // that.setData({
        //   autoPlay: true
        // })
        wx.request({
          url: url.video,
          method: 'GET',
          data: {
            id: that.data.id
          }, success(res) {
            let contentElement = res.data.content[0];
            console.log(contentElement)
            that.setData({
              videoInfo: contentElement
            })
          }
        })

    //   }
    // })
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
    let that = this;
    wx.getStorage({
      key: 'userInfo',
      success(res) {
        let userInfo = res.data;
        wx.request({
          url: url.userBehaviorLV,
          method: 'POST',
          data: {
            liveVideo: 'video',
            liveVideoId: that.data.id,
            liveVideoName: that.data.name,
            userId: userInfo.id,
            nickname: userInfo.nickname,
            stayTime: new Date().getTime() - that.data.startTime
          }
        })
        if (that.data.like === 1) {
          let method = '';
          if (that.data.liking === 1) {
            method = 'POST';
          } else if (that.data.liking === 0){
            method = 'PUT'
          }
          wx.request({
            url: url.videoLikeInfo,
            method: method,
            data:{
              videoId:that.data.videoInfo.id,
              userId: res.data.id
            }, success(res) {
              // that.setData({
              //   videoInfo:res.data.videoInfo
              // })
            }
          })
        }

      }, fail(res) {
        wx.request({
          url: url.userBehaviorLV,
          method: 'POST',
          data: {
            liveVideo: 'video',
            liveVideoId: that.data.id,
            liveVideoName: that.data.name,
            stayTime: new Date().getTime() - that.data.startTime
          }
        })
      }
    })
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
  setVideo(e){
    let videoInfo = e.currentTarget.dataset.item
    console.log(videoInfo)
    wx.navigateTo({
      url: '/pages/find/setVideo/index?id='+videoInfo.id+'&name='+videoInfo.videoName,
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage () {
    let that = this;
    wx.getStorage({
      key:'userInfo',
      success(res) {
        wx.request({
          url:url.videoShareInfo,
          method:'POST',
          data:{
            userId:res.data.id,
            videoId:that.data.id
          },success(res) {
            that.setData({
              'videoInfo.videoShareNum':res.data.videoShareNum
            })
          }
        })
      },fail(res) {
        wx.navigateTo({
          url: '/pages/my/login/login'
        })
      }
    })
    return {
      title: that.data.name,
      path: '/pages/find/videoDetail/index?id='+that.data.id+'&url='+that.data.videoUrl+'&name='+that.data.name,
      imageUrl: that.data.videoInfo.videoPic
    }
  },
  onShareTimeline() {
    let that = this;
    return {
      title: that.data.name,
      path: '/pages/find/videoDetail/index?id='+that.data.id+'&url='+that.data.videoUrl+'&name='+that.data.name,
      imageUrl: that.data.videoInfo.videoPic
    }
  }
})
