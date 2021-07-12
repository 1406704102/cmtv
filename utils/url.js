let baseUrl = 'https://cmtv.xmay.cc'
//测试
// let baseUrl = 'https://ch.xmay.cc'
// let baseUrl = 'https://dowell.xmay.cc'
// let baseUrl = 'http://192.168.123.187:8000'
// let baseUrl = 'http://pangjie.w3.luyouxia.net'
// let baseUrl = 'https://dowell.xmay.cc'
// let baseUrl = 'http://192.168.123.99:8001'
module.exports = {
  getOpenid: baseUrl + '/api/WX/getJ2SR',
  sendRemind: baseUrl + '/api/WX/sendRemind',
  setPhone: baseUrl + '/api/WX/phone',
  runData: baseUrl + '/api/WX/runData',
  getSignature: baseUrl + '/api/WX/getSignature',
  WX: baseUrl + '/api/WX',
  userInfo: baseUrl + '/api/userInfo/',
  banner: baseUrl + '/api/bannerInfo',
  live: baseUrl + '/api/liveInfo',
  video: baseUrl + '/api/videoInfo',
  subscription: baseUrl + '/api/subscriptionInfo',
  userBehaviorLV: baseUrl + '/api/userBehaviorLV',
  videoLikeInfo: baseUrl + '/api/videoLikeInfo',
  videoShareInfo: baseUrl + '/api/shareInfo',
  remindInfo: baseUrl + '/api/remindInfo',
  activeInfo: baseUrl + '/api/activeInfo',
  activeJoin: baseUrl + '/api/activeJoin',
  activeAttTalk: baseUrl + '/api/acitveAttTalk',
  activeAttTalkReplay: baseUrl + '/api/activeAttTalkReplay',
  activeAttTalkLike: baseUrl + '/api/activeAttTalkLike',
  activeAttStep: baseUrl + '/api/activeAttStep',
  cHBeanLog: baseUrl + '/api/cHBeanLog',
  specialActive: baseUrl + '/api/specialActive',
  activeInfoTalkNew: baseUrl+'/api/activeInfoTalkNew',
  setting: baseUrl + '/api/settingInfo',
  openEmailInfo: baseUrl + '/api/openEmailInfo',
  openEmailUserStar: baseUrl + '/api/openEmailUserStar',
  openEmailUserSend: baseUrl + '/api/openEmailUserSend',
  openEmailComments: baseUrl + '/api/openEmailComments',
  openEmailSetting:baseUrl + '/api/openEmailSetting',
  searchInfo:baseUrl + '/api/searchInfo',
  ayy: baseUrl+'/api/ayy',
  dayStep: baseUrl + '/api/dayStep',
  answerInfo: baseUrl + '/api/answerInfo',
  columnInfo: baseUrl + '/api/columnInfo',
  columnLiveInfo: baseUrl + '/api/columnLiveInfo',
  columnRecommendGoods: baseUrl + '/api/columnRecommendGoods',
  columnRecommendLives: baseUrl + '/api/columnRecommendLives',
  activeIndexShow: baseUrl + '/api/activeIndexShow',
  userJump: baseUrl + '/api/userJump',
  ringCustomize: baseUrl + '/api/ringCustomize',
}
