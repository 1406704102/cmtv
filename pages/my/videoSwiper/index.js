
const util = require('../../../utils/util')
const url = require('../../../utils/url')
const app = getApp();

Page({
	data: {
		videos: [],
		userInfo:{
			id: ''
		},
		videoIndex: 0,
		duration: 500,
		videoInfo: {},
		id: '',
		userId: "",
		timeline: 0,
		share: 0,
		download:'http://1254336666.vod2.myqcloud.com/be774ed4vodtranscq1254336666/5556449f5285890814022571430/v.f100020.mp4'
	},
	onLoad: function(options) {
		let that = this;
		wx.showLoading({
			title:'加载中...'
		})
		if (options.timeline) {
			that.setData({
				timeline: 1
			});
		}
		if (options.share) {
			that.setData({
				share: 1
			});
		}
			wx.request({
				url: url.video,
				method: 'GET',
				data: {
					id: options.id,
				}
				, success(res) {
					console.log(res.data);
					wx.hideLoading()
					that.setData({
						videoInfo: res.data.content[0]
					})
					// let videoList = res.data;
					// const videos = that.genVideo(videoList.length, videoList);
					// setTimeout(() => {
					// 	that.setData({
					// 		videos
					// 	});
					// }, 10);
				}
			});
		// } else {


			wx.getStorage({
				key: 'userInfo',
				success(res) {
					that.setData({
						userInfo: res.data
					})
				}
			})
					if (options.type === 'user') {
						wx.request({
							url: url.video + '/getAllByUserId',
							method: 'GET',
							data: {
								userId: that.data.userInfo.id,
								userDetailId: options.userId,
								videoId: options.id
							}
							, success(res) {
								let videoList = res.data;
								const videos = that.genVideo(videoList.length, videoList);
								setTimeout(() => {
									that.setData({
										id: options.id,
										userId: options.userId,
										videos
									});
								}, 100);
							}
						});
					} else {
						wx.request({
							url: url.videoLikeInfo,
							method: 'GET',
							data: {
								userId: options.userId,
								enable: '1',
								// page: that.data.likePage,
								// size: that.data.size
							}, success(res) {
								let l = res.data.content;
								let datas = []
								l.forEach(f => {
									f.videoInfo.like = 1;
									datas.push(f.videoInfo);
								})
								console.log("datas", datas);
								// l.forEach(f => {
								// 	f.videoInfo.createTime = util.formatMonthDay(new Date(f.videoInfo.createTime))
								// })
								// that.setData({
								// 	videoLikeList: that.data.videoLikeList.concat(l),
								// })
								const videos = that.genVideo(l.length, datas);
								setTimeout(() => {
									that.setData({
										videos
									});
								}, 100);
							}
						})
					}
					wx.hideLoading();

					// 	},fail(res) {
					// 		wx.navigateTo({
					// 			url: '/pages/my/login/login'
					// 		})
					// 	}
					// });
					// }


				},
	onChange(e) {
		console.log('change', e.detail.video);
	},
	onPlay(e) {
		console.log('play', e.detail.video);
	},
	onPanelForward(e) {
		console.log('panel event: forward', e.detail.video);
		wx.showToast({
			title: 'panel事件：' + e.detail.video.title,
			icon: 'none'
		});
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
	onShareAppMessage: function (event) {
		let that = this;
		let video = event.target.dataset.video;
		console.log(event)
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
			title: that.data.videoInfo.videoName,
			path: '/pages/my/videoSwiper/index?id=' + that.data.id + '&share=' + 1 + '&timeline=1&type=user&userId=' + that.data.userId,
			imageUrl: that.data.videoInfo.videoPic
		};
	},
	onShareTimeline() {
		const that = this;
		// imageUrl: that.data.videoInfo.videoPic,

		return {
			title:that.data.videoInfo.videoName,
			query: 'id=' + that.data.id + '&share=' + 1 + '&timeline=1&type=user&userId=' + that.data.userId
		}
	}
});
