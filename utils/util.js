const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}
const formatTime2 = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day, hour, minute, second].map(formatNumber).join('')
}
const formatMonthDayHourMinute = date => {
  // const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  // const second = date.getSeconds()

  return month + '月' + day + '日 ' + [hour, minute].map(formatNumber).join(':')
}
const formatMonthDayHourMinute2 = date => {
  // const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  // const second = date.getSeconds()

  return month + '-' + day + '  ' + [hour, minute].map(formatNumber).join(':')
}
const formatYearMonthDay = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return year + '/' + month + '/' + day;
}
const formatMonthDay = date => {
  // const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  // const second = date.getSeconds()

  return [month, day].map(formatNumber).join('-')
}
const formatSeconds = date => {
  return date.getSeconds()
}
const plusDate = number => {
  let date = new Date();
  date = date.setMinutes(date.getMinutes() + number);

  return new Date(date);
}
const minutesSub = (date1,date2) => {
  let date = new Date();
  date = date.setMinutes(date.getMinutes() + number);

  return new Date(date);
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}


const toThousands = num => {
  var num = (num || 0).toString(), result = '';
  while (num.length > 3) {
    result = ',' + num.slice(-3) + result;
    num = num.slice(0, num.length - 3);
  }
  if (num) {
    result = num + result;
  }
  return result;
}

function intlFormat(num) {
  return new Intl.NumberFormat().format(Math.round(num * 10) / 10);
}

function makeFriendly(num) {
  var param = '';
  var k = 10000,
    size = ['', 'W'], i;
  if (typeof (num) === "number") {
    if (num < k) {
      param = num;
    } else {
      i = Math.floor((Math.log(num) / Math.log(k)));
      param = (num / Math.pow(k, i)).toFixed(2) + size[i];
    }
    return param;
  } else {
    return 0;
  }
}
function getPackageId(type) {
  if (type === 'dx') {
    return "135999999999999000068";
  }else if (type === 'lt') {
    return "";
  } else {
    return "";
  }
}

module.exports = {
  formatTime: formatTime,
  formatTime2: formatTime2,
  formatSeconds: formatSeconds,
  formatMonthDayHourMinute: formatMonthDayHourMinute,
  formatMonthDayHourMinute2: formatMonthDayHourMinute2,
  formatMonthDay: formatMonthDay,
  formatYearMonthDay: formatYearMonthDay,
  toThousands: toThousands,
  makeFriendly: makeFriendly,
  getPackageId: getPackageId,
  plusDate: plusDate
}
