// components/pbitem.js
const url = require('../../utils/url')
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    object2: {
      type: Object,
      value: {}
    },
    activeName: {
      type: Boolean,
      value: false
    },
    video: {
      type: Boolean,
      value: false
    },
    userId: {
      type: String,
      value: ''
    },
    showTop:{
      type:Boolean,
      value: false
    },
    type: {
      type: String,
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    timers: {},
    object2: {}
  },

  /**
   * 组件的方法列表
   */
  methods: {
    doLike(e) {
      let that = this;
      wx.getStorage({
        key: 'userInfo',
        success(res) {
          let item = e.currentTarget.dataset.item;
          clearTimeout(that.data.timers);
          let l = item.like;
          if (item.like === 1) {
            let f = that.data.object2;

            f.likeNum = f.likeNum - 1;
            f.like = 0;
            l = 0;
            that.setData({
              object2: f
            });
          } else {
            console.log(that)
            console.log(this)
            let f = that.data.object2;

            f.likeNum = f.likeNum + 1;
            f.like = 1;
            l = 1;
            that.setData({
              object2: f
            })
          }
          that.setData({
            'timers': setTimeout(() => {
              if (l === 1) {
                wx.request({
                  url: url.activeAttTalkLike,
                  method: 'POST',
                  data: {
                    attTalkId: e.currentTarget.dataset.item.id,
                    userId: res.data.id,
                  }
                });
              } else {
                wx.request({
                  url: url.activeAttTalkLike,
                  method: 'PUT',
                  data: {
                    attTalkId: e.currentTarget.dataset.item.id,
                    userId: res.data.id,
                  }
                });
              }
            }, 900)
          });
        },fail(res) {
          wx.navigateTo({
            url: '/pages/my/login/login'
          })
        }
      })

    },

    toDetail(e) {
      const that = this;
      wx.getStorage({
        key: 'userInfo',
        success(res) {
          wx.navigateTo({
            url: "/pages/active/replayAtt/index?id=" + e.currentTarget.dataset.id + "&name=" + e.currentTarget.dataset.username
          });
        }, fail(res) {
          wx.navigateTo({
            url: '/pages/my/login/login'
          })
        }
      })
    },
  },
  lifetimes: {
    attached: function () {
      // 在组件实例进入页面节点树时执行
      this.setData({
        object2: this.properties.object2,
        userId: this.properties.userId
      })
    }
  },
})
