const url = require('../utils/url')
const util = require('../utils/util')

Component({
    properties: {
        vertical: {
            type: Boolean,
            value: true
        },
        duration: {
            type: Number,
            value: 500
        },
        videoList: {
            type: Array,
            value: []
        },
        initialIndex: {
            type: Number,
            value: 0
        },
        objectFit: {
            type: String,
            value: 'contain'
        },
        loop: {
            type: Boolean,
            value: true
        },
        defaultPoster: {
            type: String,
            value: ''
        },
        autoPlay: {
            type: Boolean,
            value: true
        },
        panelType: {
            type: String,
            value: 'default'
        },
        width: {
            type: Number,
            value: 0
        },
        height: {
            type: Number,
            value: 0
        },
        videoId: {
            type: String,
            value: 'undefined'
        }
    },
    data: {
        playIndex: 0,
        players: [
            {
                id: 'video_0',
                scene: false,
                status: 0, // 0: initial; 1: play; 2: pause
                src: null,
                poster: null
            },
            {
                id: 'video_1',
                scene: false,
                status: 0,
                src: null,
                poster: null
            },
            {
                id: 'video_2',
                scene: false,
                status: 0,
                src: null,
                poster: null
            }
        ],
        playerIdx: 0,
        trackData: {
            width: 0,
            height: 0,
            vertical: true,
            duration: 500,
            operation: {}
        },
        curQueue: [{}, {}, {}],
        curVideo: null,


        popupShow: false,
        video: {},
        userInfo: {},
        replays: [],

        timers: [],
        timer: {},

        videoId: null,
        attTalkId: null,
        replayDetail: '',
        replayId: '',
        replayUserId: '',
        replayName: '',

        focus: false,
        placeholder: '输入你的评论：',
        replayType: '0',
        replayIndex: -1,


        canSub: false,

        totalElements: 0,
    },
    observers: {
        'width, height': function (width, height) {
            if (width < 0 || height < 0) {
                throw new Error('width or height can not be less than 0.');
            }
            if (this._rect) {
                this.setData({
                    'trackData.operation': {
                        width,
                        height,
                        rect: this._rect
                    }
                });
            }
        },
        vertical(vertical) {
            this.setData({
                'trackData.vertical': vertical
            });
        },
        duration(duration) {
            this.setData({
                'trackData.duration': duration
            });
        },
        initialIndex(index) {
            if (index < 0) {
                throw new Error('initialIndex can not be less than 0.');
            }
        },
        videoList(videoList) {
            if (!Array.isArray(videoList)) {
                throw new Error('videoList is expected an array.');
            }
        },
        'initialIndex, videoList': function (initialIndex, videoList) {
            const operation = {};
            if (initialIndex !== this._initialIndex && videoList.length > 0) {
                this._initialIndex = initialIndex;
                this._dataIdx = initialIndex;
                operation.dataIdx = initialIndex;
            }
            operation.dataCount = videoList.length;
            if (!this._videoList) {
                this._playing = this.data.autoPlay;
            }
            this.setData(
                {
                    'trackData.operation': operation
                },
                () => {
                    this.loadCurQueue(this._dataIdx, this._playing);
                }
            );
        }
    },

    created() {
        this._rect = null;
        this._videoList = null;
        this._initialIndex = -1;
        this._dataIdx = 0;
        this._lastDataIdx = -1;
        this._lastVideo = null;
        this._playing = true;
        this._pausing = {
            idx: -1,
            timmer: null
        };
        this._savedPlayerIdx = -1;
        this._playerIdx = 0;
        this._isAndroid = wx.getSystemInfoSync().platform === 'android';
    },
    attached() {
        this._videoContexts = [];
        this.data.players.forEach((item) => {
            this._videoContexts.push(wx.createVideoContext(item.id, this));
        });
    },
    ready() {
        this.initialize();
    },

    methods: {
        play() {
            const {curVideo} = this.data;
            if (curVideo) {
                this.playCurrent(this._playerIdx);
            }
        },
        pause() {
            this._videoContexts.forEach((ctx) => {
                ctx.pause();
            });
        },
        swiperChange(args) {
            const dataIdx = args.dataIdx;
            this._dataIdx = dataIdx;
            this.loadCurQueue(dataIdx, false);
        },
        loadCurQueue(dataIdx, playing = false) {
            const curQueue = this.data.curQueue.slice(0);
            const {videoList, players, defaultPoster} = this.data;
            const maxIdx = videoList.length - 1;
            let curVideo = null;
            let curDataIdx = dataIdx;
            let cur = 0;
            if (maxIdx < 0) {
                curQueue.forEach((video) => {
                    video = {};
                });
            } else {
                if (curDataIdx > maxIdx) {
                    curDataIdx = maxIdx;
                }
                let preV = {},
                    nextV = {};
                let pre = 0,
                    next = 0;
                cur = curDataIdx % 3;
                pre = cur - 1;
                if (pre < 0) {
                    pre = 2;
                }
                next = cur + 1;
                if (next > 2) {
                    next = 0;
                }
                if (curDataIdx - 1 >= 0) {
                    preV = videoList[curDataIdx - 1];
                }
                if (curDataIdx + 1 <= maxIdx) {
                    nextV = videoList[curDataIdx + 1];
                }
                curQueue[pre] = preV;
                curQueue[next] = nextV;
                curVideo = videoList[curDataIdx];
                curQueue[cur] = curVideo;
                curVideo = videoList[curDataIdx];
            }

            for (let i = 0; i < 3; i++) {
                const video = curQueue[i];
                const player = players[i];
                const poster = video.poster || defaultPoster || null;
                const src = video.src || null;
                player.src = src;
                player.poster = poster;
            }

            this.setData({
                players,
                curQueue,
                curVideo
            });
            this._playerIdx = cur;
            this._savedPlayerIdx = -1;
            if (curVideo) {
                this._videoList = videoList;
                if (curDataIdx !== this._lastDataIdx) {
                    this._lastDataIdx = curDataIdx;
                    this.triggerEvent('change', {
                        video: curVideo,
                        dataIdx: curDataIdx,
                        videoList
                    });
                }
                this._lastVideo = curVideo;
                if (playing && curVideo) {
                    wx.nextTick(() => {
                        this._savedPlayerIdx = cur;
                        this.playCurrent(cur);
                    });
                }
            }
        },
        onVideoOverlayTap(e) {
            const idx = e.currentTarget.dataset.playerIdx;
            const ctx = this._videoContexts[idx];
            const player = this.data.players[idx];
            if (player.status === 2) {
                if (player.src) {
                    ctx.play();
                }
            } else {
                ctx.pause();
                const status = `players[${idx}].status`;
                const scene = `players[${idx}].scene`;
                this.setData({
                    [status]: 2,
                    [scene]: true
                });
            }
        },
        onVideoPlayBtnTap(e) {
            const idx = e.currentTarget.dataset.playerIdx;
            const ctx = this._videoContexts[idx];
            const player = this.data.players[idx];
            if (player.src) {
                ctx.play();
            }
        },
        onPlay(e) {
            console.log("play")
            const idx = e.currentTarget.dataset.playerIdx;
            // console.log('play', idx);
            // this.setDate({
            // 	playIndex: idx
            // })
            const player = this.data.players[idx];
            const _pausing = this._pausing;
            const lastStatus = player.status;
            this._playing = true;
            if (idx === _pausing.idx) {
                clearTimeout(_pausing.timmer);
                this._pausing = {
                    idx: -1,
                    timmer: null
                };
            }
            if (lastStatus !== 1) {
                const scene = `players[${idx}].scene`;
                const status = `players[${idx}].status`;
                this.setData({
                    [scene]: true,
                    [status]: 1
                });
                if (lastStatus === 2) {
                    this.trigger(e, 'replay');
                } else {
                    this.trigger(e, 'play');
                }
            }
        },
        onPause(e) {
            console.log("onPause")

            const idx = e.currentTarget.dataset.playerIdx;
            const player = this.data.players[idx];
            this._playing = false;
            if (player.status !== 2) {
                const status = `players[${idx}].status`;
                this._pausing = {
                    idx,
                    timmer: setTimeout(() => {
                        this.setData({
                            [status]: 2
                        });
                        this._pausing = {
                            idx: -1,
                            timmer: null
                        };
                    }, 200)
                };
            }
            this.trigger(e, 'pause');
        },
        onEnded(e) {
            this.trigger(e, 'ended');
        },
        onError(e) {
            this.trigger(e, 'error');
        },
        onTimeUpdate(e) {
            this.trigger(e, 'timeupdate');
        },
        onWaiting(e) {
            this.trigger(e, 'wait');
        },
        onProgress(e) {
            this.trigger(e, 'progress');
        },
        onLoadedMetaData(e) {
            this.trigger(e, 'loadedmetadata');
        },
        trigger(e, type) {
            let ext = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
            let detail = e.detail;
            const {curVideo} = this.data;
            this.triggerEvent(type, Object.assign(Object.assign({}, detail), {video: curVideo}, ext));
        },
        playCurrent(cur) {
            const {players} = this.data;
            this._videoContexts.forEach((ctx, idx) => {
                const player = players[idx];
                if (cur === idx) {
                    if (player.src) {
                        ctx.play();
                    }
                } else {
                    player.scene = false;
                    player.status = 0;
                    ctx.stop();
                }
            });
            this.setData({
                playerIdx: cur,
                players
            });
        },
        onTransitionEnd() {
            const {curVideo} = this.data;
            if (this._playerIdx !== this._savedPlayerIdx) {
                if (curVideo) {
                    this._savedPlayerIdx = this._playerIdx;
                    this.playCurrent(this._playerIdx);
                }
            }
        },
        initialize() {
            this.getRect('#aswiper__track').then((rect) => {
                const {width, height} = this.data;
                this._rect = rect;
                this.setData({
                    'trackData.width': width,
                    'trackData.height': height,
                    'trackData.operation': {
                        rect
                    }
                });
            });
        },
        getRect(selector, all) {
            var _this = this;
            return new Promise(function (resolve) {
                wx
                    .createSelectorQuery()
                    .in(_this)
                    [all ? 'selectAll' : 'select'](selector)
                    .boundingClientRect(function (rect) {
                        if (all && Array.isArray(rect) && rect.length) {
                            resolve(rect);
                        }
                        if (!all && rect) {
                            resolve(rect);
                        }
                    })
                    .exec();
            });
        },
        noop() {
        },
        btnComment: function (e) {
            let that = this;

            // var videoId = that.data.curQueue[that.data.playIndex].videoInfo.id;
            console.log(e);
            that.setData({
                video: e.detail,
                replayType: '0',
                videoId: e.detail.id,
                replayUserId: e.detail.userId,
                replayName: e.detail.userName,
                placeholder: '输入你的评论~',
                replays: [],
                totalElements: 0
            })
            wx.getStorage({
                key: 'userInfo',
                success(res) {
                    that.setData({
                        userInfo: res.data
                    })
                    if (!that.data.popupShow) {
                        wx.request({
                            url: url.activeAttTalkReplay,
                            method: 'GET',
                            data: {
                                videoId: e.detail.id,
                                userId: res.data.id,
                                enable: '1',
                                sort: 'createTime,desc',
                            }, success(res) {
                                var replays = res.data.content;
                                replays.forEach(f=>{
                                    f.createTime = util.formatMonthDayHourMinute(new Date(f.createTime));
                                })
                                that.setData({
                                    replays: replays,
                                    totalElements: replays.length
                                })
                            }
                        })
                    }
                    that.setData({
                        popupShow: !that.data.popupShow
                    });
                }, fail(res) {
                    wx.navigateTo({
                        url: '/pages/my/login/login'
                    })
                }
            })


        },
        submit() {
            let that = this;

            if (that.data.replayDetail !== '') {
                let replayc = that.data.replayDetail;

                wx.showLoading({
                    title: '加载中...',
                });
                that.setData({
                    canSub: false
                })
                let type = '';
                if (that.data.replayType === '0') {
                    type = 'toVideo';
                } else {
                    type = 'toVideoReplay'
                }
                wx.request({
                    url: url.activeAttTalkReplay,
                    method: 'POST',
                    data: {
                        videoId: that.data.videoId,
                        attTalkId: that.data.attTalkId,
                        userId: that.data.userInfo.id,
                        userName: that.data.userInfo.nickname,
                        userAvatar: that.data.userInfo.avatar,
                        replayUserId: that.data.replayUserId,
                        replayName: that.data.replayName,
                        replayDetail: replayc,
                        type: type,
                        likeNum: 0,
                        enable: 1
                    }, success(res) {
                        wx.hideLoading();
                        var data1 = res.data;
                        data1.like = 0;
                        data1.createTime = util.formatMonthDayHourMinute(new Date(data1.createTime));
                        let l = [];
                        l.push(data1)
                        var replays = that.data.replays;
                        if (that.data.replayType === '0') {
                            that.setData({
                                canSub: true,
                                'video.videoCommentNum': that.data.video.videoCommentNum + 1,
                                replays: l.concat(replays)
                            });
                        } else {
                            replays.forEach((f, i) => {
                                if (i === that.data.replayIndex) {
                                    // f.createTime = util.formatMonthDayHourMinute(new Date(f.createTime));
                                    f.replayShow = true;
                                    f.replaySum = f.replaySum + 1;
                                    if (f.replays === undefined) {
                                        wx.request({
                                            url: url.activeAttTalkReplay,
                                            method: 'GET',
                                            data: {
                                                attTalkId: f.id,
                                                userId: that.data.userInfo.id,
                                                size: 1000,
                                                sort:'createTime,desc'
                                            }, success(r) {

                                                r.data.content.forEach(f => {
                                                    f.createTime = util.formatMonthDayHourMinute(new Date(f.createTime));
                                                })
                                                f.replays = r.data.content;
                                                that.setData({
                                                    'video.videoCommentNum': that.data.video.videoCommentNum + 1,
                                                    canSub: true,
                                                    replays: replays
                                                })
                                            }
                                        });
                                    } else {
                                        f.replays = l.concat(f.replays);
                                        that.setData({
                                            'video.videoCommentNum': that.data.video.videoCommentNum + 1,
                                            canSub: true,
                                            replays: replays
                                        });
                                    }
                                }

                            });

                        }
                        that.setData({
                            replayType: '0',
                            replayDetail: '',
                            videoId: that.data.video.id,
                            attTalkId: null,
                            replayUserId: that.data.video.userId,
                            replayName: that.data.video.userName,
                            placeholder: '输入你的评论~',
                        })
                    }
                })
            } else {
                wx.showToast({
                    title: '请输入内容!',
                    icon: "none"
                })
            }
        },
        replayClick3() {
            let that = this;
            this.setData({
                replayType: '0',
                replayDetail: '',
                videoId: that.data.video.id,
                replayUserId: that.data.video.userId,
                replayName: that.data.video.userName,
                placeholder: '输入你的评论~',
            })
        },
        replayClick(e) {
            let that = this;
            console.log('replayClick', e);
            that.setData({
                replayDetail: '',
                attTalkId: e.currentTarget.dataset.item.id,
                videoId: null,
                replayUserId: e.currentTarget.dataset.item.userId,
                replayName: e.currentTarget.dataset.item.userName,

                focus: true,
                placeholder: '回复 ' + e.currentTarget.dataset.item.userName + '：',
                replayType: '1',
                replayIndex: e.currentTarget.dataset.index
            })

            console.log(typeof (that.data.replayType))
        },
        replayClick2(e) {
            let that = this;
            console.log('replayClick2', e);

            that.setData({
                replayDetail: '',
                attTalkId: e.currentTarget.dataset.item.id,
                replayUserId: e.currentTarget.dataset.item2.userId,
                replayName: e.currentTarget.dataset.item2.userName,

                focus: true,
                placeholder: '回复 ' + e.currentTarget.dataset.item2.userName + '：',
                replayType: '2',
                replayIndex: e.currentTarget.dataset.index
            })
        },
        showReplay(e) {
            let that = this;
            // console.log( that.data.attTalk.activeAttTalkReplays)
            var replays = that.data.replays
            replays.forEach((item, i) => {
                if (i === e.currentTarget.dataset.index) {
                    console.log(i);
                    item.replayShow = !item.replayShow;

                    // console.log(replays)

                    wx.request({
                        url: url.activeAttTalkReplay,
                        method: 'GET',
                        data: {
                            attTalkId: item.id,
                            userId: that.data.userInfo.id,
                            enable: '1',
                            size: 1000
                        }, success(r) {

                            r.data.content.forEach(f => {
                                f.createTime = util.formatMonthDayHourMinute(new Date(f.createTime));
                            })
                            item.replays = r.data.content;
                            that.setData({
                                replays: replays,
                                totalElements: replays.length
                            })
                        }
                    })

                }
            });
            // console.log(forEach);

            that.setData({
                replays: replays
            })
            // console.log(that.data.attTalk.activeAttTalkReplays[e.currentTarget.dataset.index]);

        },
        doLike2(e) {
            let that = this;
            let item = e.currentTarget.dataset.item;
            let index = e.currentTarget.dataset.index;
            clearTimeout(that.data.timers[index]);
            let l = item.like;
            if (item.like === 1) {
                let replays = that.data.replays;
                replays.forEach(f => {
                    if (f.id === item.id) {
                        f.likeNum = f.likeNum - 1;
                        f.like = 0;
                        l = 0;
                    }
                });
                that.setData({
                    replays: replays
                });
            } else {
                let replays = that.data.replays;
                replays.forEach(f => {
                    if (f.id === item.id) {
                        f.likeNum = f.likeNum + 1;
                        f.like = 1;
                        l = 1;
                    }
                })
                that.setData({
                    replays: replays
                })
            }
            that.setData({
                'timers[index]': setTimeout(() => {
                    if (l === 1) {
                        wx.request({
                            url: url.activeAttTalkLike,
                            method: 'POST',
                            data: {
                                attTalkReplayId: e.currentTarget.dataset.item.id,
                                userId: that.data.userInfo.id,
                            }
                        });
                    } else {
                        wx.request({
                            url: url.activeAttTalkLike,
                            method: 'PUT',
                            data: {
                                attTalkReplayId: e.currentTarget.dataset.item.id,
                                userId: that.data.userInfo.id,
                            }
                        });
                    }
                }, 900)
            })
        },
    }
});
