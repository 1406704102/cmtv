const util = require('../../../utils/util')
const url = require('../../../utils/url')
const videoList = []
Page({
  data: {
    videoList,
    activeId: 1,
    isPlaying: true,

    likeImg: '/images/like.png',
    liking: 0,
    like: 0,
    likeNum: 0,
    userInfo: {},
    startTime: 0,

    timer:null
  },
  onLoad() {
    wx.setTabBarStyle({
      color: '#AFAFAF',
      selectedColor: '#F86564',
      backgroundColor: '#000',
      borderStyle: 'black'
    });
    wx.showLoading({
      title: '加载中..'
    })
    var that = this
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          systemInfo: res
        })
        console.log(res)
      }
    })
    this.getVideo();
  },
  doLike(e) {
    let that = this;

    wx.getStorage({
      key: 'userInfo',
      success(res) {
        let user = res.data;
        console.log(user)
        let videoListElement = that.data.videoList[that.data.activeId];
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
      },fail(res) {
        wx.navigateTo({
          url: '/pages/my/login/login'
        })
      }
    })

  },
  getVideo() {
    let that = this;

    // that.setData({
    //   page: that.data.page + 1
    // })
    wx.getStorage({
      key: 'userInfo',
      success(res) {
        wx.request({
          url: url.video + '/getAll',
          method: 'GET',
          data: {
            userId: res.data.id
          }
          , success(res) {
            let videoList = res.data;

            that.setData({
              videoList: videoList,
              videoInfo: videoList[that.data.activeId]
            })
            console.log(videoList)
            that.onStart1();
          }
        });
      },fail(res) {
        wx.navigateTo({
          url: '/pages/my/login/login'
        })
      }
    })

  },
  onPlay(e) {
    // console.log("开始播放",e)
  },
  onShowPause(e) {
    this.setData({
      isPlaying: false
    })
  },
  onHidePause(e) {
    this.setData({
      isPlaying: true
    })
  },
  onPause(e) {
  },

  onEnded(e) {
    console.log('jiesu le ')
  },

  onError(e) {
    // console.log(e)
  },

  onWaiting(e) {

    // console.log(e)
  },

  onTimeUpdate(e) {
    // console.log(e)

  },

  onProgress(e) {
    // console.log(e)
  },
  //第一个视频
  onStart1() {
    let that = this;
    let activeId = 1;
    let videoListElement = that.data.videoList[activeId];
    console.log(videoListElement)
    this.setData({
      activeId: activeId,
      likeNum: videoListElement.videoLikeNum,
      videoInfo: videoListElement
    })
    wx.request({
      url: url.userInfo + videoListElement.userId,
      method: 'GET',
      success(res) {
        console.log(res.data);
        that.setData({
          userInfo: res.data
        })
      }
    })
    wx.getStorage({
      key: 'userInfo',
      success(res) {
        wx.request({
          url: url.videoLikeInfo + '/getVideoLike',
          method: 'GET',
          data: {
            videoId: videoListElement.id2,
            userId: res.data.id,
            enable: '1'
          },
          success(res) {
            console.log(res);
            if (res.data !== "") {
              that.setData({
                likeImg: '/images/liking.png',
                liking: 1,
              });
            } else {
              that.setData({
                likeImg: '/images/like.png',
                liking: 0,
              });
            }
            wx.hideLoading();
          }
        })
      }
    })
  },
  onChange(e) {
    let that = this;
    let activeId = e.detail.activeId;
    let videoListElement = that.data.videoList[activeId];
    console.log(videoListElement)
    this.setData({
      activeId: activeId,
      likeNum: videoListElement.videoLikeNum,
      videoInfo: videoListElement
    })
    wx.request({
      url: url.userInfo + videoListElement.userId,
      method: 'GET',
      success(res) {
        console.log(res.data);
        that.setData({
          userInfo: res.data
        })
      }
    })
    wx.getStorage({
      key: 'userInfo',
      success(res) {
        wx.request({
          url: url.videoLikeInfo + '/getVideoLike',
          method: 'GET',
          data: {
            videoId: videoListElement.id2,
            userId: res.data.id,
            enable: '1'
          },
          success(res) {
            console.log(res);
            if (res.data !== "") {
              that.setData({
                likeImg: '/images/liking.png',
                liking: 1,
              });
            } else {
              that.setData({
                likeImg: '/images/like.png',
                liking: 0,
              });
            }
          }
        })
      }
    })
  },
  onLoadedMetaData(e) {
    console.log('LoadedMetaData', e)
  },
  setVideo(e){
    let videoInfo = e.currentTarget.dataset.item
    console.log(videoInfo)
    wx.navigateTo({
      url: '/pages/find/setVideo/index?id='+videoInfo.id2+'&name='+videoInfo.videoName,
    })
  },
  onShow() {
    wx.setTabBarStyle({
      color: '#AFAFAF',
      selectedColor: '#F86564',
      backgroundColor: '#000',
      borderStyle: 'black'
    });
  }
})
