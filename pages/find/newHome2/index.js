
const util = require('../../../utils/util')
const url = require('../../../utils/url')
const app = getApp();

Page({
	data: {
		videos: [],
		videoIndex: 0,
		duration: 500,
		timer: null,
		videoInfo: {}

	},
	onLoad: function (options) {
		// console.log('options.videoId', options.videoId);
		let vId
		if (options.videoId !== undefined) {
			vId = options.videoId
		}
		let that = this;
		wx.showLoading({
			title: '加载中...'
		})
		wx.getStorage({
			key: 'userInfo',
			success(res) {
				wx.request({
					url: url.video + '/getAll',
					method: 'GET',
					data: {
						userId: res.data.id,
						videoId: vId
					}
					, success(res) {
						let videoList = res.data;
						const videos = that.genVideo(videoList.length, videoList);
						setTimeout(() => {
							that.setData({
								videos
							});
						}, 10);
						wx.hideLoading();

					}
				})
			}, fail(res) {
				wx.navigateTo({
					url: '/pages/my/login/login'
				})
			}
		})


	},
	onChange(e) {
		console.log('change', e.detail.video);
	},
	onPlay(e) {
		console.log('play', e.detail.video);
	},
	onPanelForward(e) {
		this.setData({
			videoInfo:e.detail.video.videoInfo
		})
		// console.log('panel event: forward', e.detail.video);
		// wx.showToast({
		// 	title: 'panel事件111：' + e.detail.video.title,
		// 	icon: 'none'
		// });
	},
	test(event) {
		console.log("event",event)
	},
	genVideo(count,videoData) {
		const length = this.data.videos.length;
		const videos = [];
		for (let i = 0; i < count; i++) {
			let src = '';
			let poster = '';
			if (i % 2 === 0) {
				src = videoData[i].videoUrl;
				poster = '';
			} else {
				src = videoData[i].videoUrl;
				poster = '';
			}
			videos.push({
				title: videoData[i].videoName,
				src,
				videoInfo:videoData[i],
				poster
			});
		}
		return videos;
	},
	onShow() {
		wx.setTabBarStyle({
			color: '#AFAFAF',
			selectedColor: '#F86564',
			backgroundColor: '#000',
			borderStyle: 'black'
		});
	},
	onShareAppMessage: function (event) {
		let that = this;
		let video = event.target.dataset.video;
		console.log(video)
		wx.getStorage({
		  key: 'userInfo',
		  success(res) {
		    wx.request({
		      url: url.videoShareInfo,
		      method: 'POST',
		      data: {
		        userId: res.data.id,
		        videoId: video.id
		      }, success(res) {
		        that.setData({
		          'videoData.videoInfo.videoShareNum': res.data.videoShareNum
		        })
		      }
		    })
		  }, fail(res) {
		    wx.navigateTo({
		      url: '/pages/my/login/login'
		    })
		  }
		})

		return {
			title: video.videoName,
			path: '/pages/find/newHome2/index?videoId=' + video.id,
			imageUrl: video.videoPic
		};
	}

});
