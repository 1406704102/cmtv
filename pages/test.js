const util = require('../utils/util')
const url = require('../utils/url')
Page({
  data: {
    videoList: [],
    videoData: [],
    page: -1,
    size: 3,
    current: 0,
    index: 1,
    loading: false,
    circular: true
  },
  onLoad(options) {
    let that = this;
    wx.getStorage({
      key:'userInfo',
      success(res) {
        wx.request({
          url: url.video + '/getAll',
          method: 'GET',
          data: {
            userId: res.data.id
          }
          , success(res) {
            let videoList = res.data;
            console.log(videoList)

            that.setData({
              videoData: videoList.splice(3, videoList.length),
              videoList: videoList.splice(0, 3),
              videoInfo: videoList[that.data.activeId]
            })

          }
        });
      }
    })
  },
  getVideo() {
    let that = this;
    that.setData({
      page:that.data.page+1,
    })
    let size =  that.data.size
    if (that.data.page === 0) {
      size = 3;
    }
    // that.setData({
    //   page: that.data.page + 1
    // })
    wx.showLoading({
      title:'加载中...'
    })
    wx.getStorage({
      key: 'userInfo',
      success(res) {
        wx.request({
          url: url.video,
          method: 'GET',
          data: {
            // userId: res.data.id,
            page: that.data.page,
            size: size
          }
          , success(res) {
            if (that.data.page === 0) {

              that.setData({
                videoList: res.data.content
              });
            } else {
              let videList = that.data.videoList;
              videList.shift();
              console.log(videList);
              // videList.shift();
              // videList.shift();
              videList.unshift(res.data.content[0]);
              console.log(videList);

              that.setData({
                videoList: videList,
              });
            }
            wx.hideLoading()
            // that.onStart1();
          }
        });
      }, fail(res) {
        wx.navigateTo({
          url: '/pages/my/login/login'
        })
      }
    });
  },
  changeVideo() {
    let that = this;
    let videoList = that.data.videoList;
    let videoData = that.data.videoData;
    if (videoData.length !== 0) {
      let remove = videoList.shift();
      let add = videoData.shift();
      console.log("add",add);
      videoList[that.data.current] = add;
      that.setData({
        videoList: videoList,
        videoData: videoData
      })
    }
  },
  change(event) {
    let that = this;
    console.log("videoData",that.data.videoData)
    console.log("videoList",that.data.videoList)
    let current = event.detail.current + 1;
    console.log(current)
    let index = that.data.index + 1;
    that.setData({
      index: index,
      current: current
    })
    // console.log("index", index);
    // if (index >= 3) {
      that.changeVideo();
    // }
  }
})

