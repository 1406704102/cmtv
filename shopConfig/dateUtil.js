const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatDate = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  // const hour = date.getHours()
  // const minute = date.getMinutes()
  // const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/')
}
const formatTime2 = date => {
  // const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  // const second = date.getSeconds()

  return [month, day].map(formatNumber).join('/') + ' ' + [hour, minute].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

const dateCompare = (date1,date2,date3) =>{
  if (date1 < date2) {
    return '直播预告';
  }
  if (date1 > date3) {
    return '直播结束'
  }
  if (date2 < date1 < date3) {
    return '正在直播'
  }
}

const formLottery = n => {
  switch (n) {
    case 0:
      return '无抽奖'
    case 1:
      return '进行中'
    case 2:
      return '待开奖'
    case 3:
      return '已开奖'
  }
}

module.exports = {
  formatTime: formatTime,
  formatDate: formatDate,
  formLottery: formLottery,
  formatTime2: formatTime2,
  dateCompare: dateCompare
}
