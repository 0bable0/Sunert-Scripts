/*
更新时间: 2020-02-26 02:35 取消打卡挑战，ck时效短，可弃坑

本脚本仅适用于京东来客有礼每日获取京豆
获取Cookie方法:
1.将下方[rewrite_local]和[MITM]地址复制的相应的区域
下，
2.微信搜索'来客有礼'小程序,登陆京东账号，点击'发现',即可获取Cookie，获取后请禁用或注释掉❗️
3.非专业人士制作，欢迎各位大佬提出宝贵意见和指导
4.5月17日增加自动兑换京豆，需设置兑换京豆数，现可根据100、200和500设置，不可设置随机兑换数，根据页面填写兑换数值，默认设置500，注意是京豆数❗️ 已取消自动兑换‼️
5.增加打卡挑战赛自动报名，需要5天后手动领取瓜分奖励‼️

by Macsuny
~~~~~~~~~~~~~~~~
Surge 4.0 :
[Script]
lkyl.js = type=cron,cronexp=35 5 0 * * *,script-path=https://raw.githubusercontent.com/Sunert/Scripts/master/Task/lkyl.js,script-update-interval=0

# 来客有礼 Cookie.
lkyl.js = type=http-request,pattern=https:\/\/draw\.jdfcloud\.com\/\/api\/bean\/square\/silverBean\/task\/get\?,script-path=https://raw.githubusercontent.com/Sunert/Scripts/master/Task/lkyl.js
~~~~~~~~~~~~~~~~
Loon 2.1.0+
[Script]
cron "04 00 * * *" script-path=https://raw.githubusercontent.com/Sunert/Scripts/master/Task/lkyl.js, enabled=true, tag=来客有礼

http-request https:\/\/draw\.jdfcloud\.com\/\/api\/bean\/square\/silverBean\/task\/get\? script-path=https://raw.githubusercontent.com/Sunert/Scripts/master/Task/lkyl.js
-----------------

QX 1.0. 7+ :
[task_local]
0 9 * * * lkyl.js

[rewrite_local]
https:\/\/draw\.jdfcloud\.com\/\/api\/bean\/square\/silverBean\/task\/get\? url script-request-header lkyl.js
~~~~~~~~~~~~~~~~
[MITM]
hostname = draw.jdfcloud.com
~~~~~~~~~~~~~~~~

*/
const challengebean= 100 //默认挑战赛100档
const jdbean = "500" //兑换京豆数
const $ = new Env('来客有礼小程序')
let opa = $.getdata('token_lkyl')
let signVal = $.getdata('signature_lkyl')

let isGetCookie = typeof $request !== 'undefined'
if (isGetCookie) {
   GetCookie()
} else {
!(async () => {
  openid = opa.split('&')[0],
  appid = opa.split('&')[1];
  Sign = signVal.split('&')[0],
  token = signVal.split('&')[1];
  await sign();     // 签到
  await info();     // 账号信息
  await total();    // 总计
  await tasklist(); // 任务列表
  await lottery();  // 0元抽奖
  //await challenge();// 打卡挑战
  await status();   // 任务状态
  await video();    // 视频任务
  await Daily();    // 日常任务
  //await exChange(); // 银豆兑换
})()
  .catch((e) => $.logErr(e))
  .finally(() => $.done())
}
function GetCookie() {
if ($request && $request.method != 'OPTIONS') {
  const opa = $request.headers['openId']+"&"+$request.headers['App-Id']
  const signtoken = $request.headers['Lottery-Access-Signature']+'&'
+$request.headers['LKYLToken']
  if (opa) $.setdata(opa, 'token_lkyl');
  if (signtoken) $.setdata(signtoken, 'signature_lkyl');
    $.log(`opa:${opa}`),
    $.log(`signtoken:${signtoken}`)
    $.msg($.name, `获取Cookie: 成功🎉`, ``)
  }
 $.done()
}

function Host(api,body) {
  return {
     url: "https://draw.jdfcloud.com//api/"+api+"openId="+openid+"&appId="+appid,
     headers: {
       'App-Id': appid,
       'Content-Type': 'application/json',
       'Host': 'draw.jdfcloud.com',
       'Lottery-Access-Signature': Sign,
       'openId': openid,
       'LKYLToken': token
     },
     body: body
   }
}  
function sign() {
  return new Promise((resolve, reject) =>{
    $.get(Host('turncard/card?&petSign=true&turnTableId=131&index=1&'), (error, response, data) =>{
      //$.log( `签到信息: ${data}`)
      let result = JSON.parse(data);
      if (result.success == true) {
        $.sub = `  签到成功🎉`
        detail = result.data.topLine + ' ' + result.data.rewardName + ' 获得' + result.data.jdBeanQuantity + '个京豆\n'
      } else if (result.errorMessage == '今天已经签到过了哦') {
        $.sub = `  重复签到 🔁`
        detail = ``
      } else if (result.errorCode == 'L0001') {
        $.sub = `签到失败，Cookie 失效❌`
        detail = `说明: ${result.errorMessage}`
        $.msg($.name, $.sub, detail); return
      }
      resolve()
    })
  })
}
function info() {
 return new Promise((resolve, reject) =>{
  $.get(Host('user/user/detail?'),(error, resp, data) => {
    //$.log(`账号信息: ${data}`)
     let info = JSON.parse(data)  
        uesername = info.data.nickName
        resolve()
    })
 })
}          

function total() {
  return new Promise((resolve, reject) =>{
    $.get(Host('bean/square/silverBean/getUserBalance?'), async(error, resp, data) =>{
      //$.log(JSON.stringify(Host('bean/square/silverBean/getUserBalance?')))
      //$.log(` 统计: ${data}`)
      let result = JSON.parse(data);
      if (result.success == true) {
        SilverBean = result.data
        Silvertotal = '收益总计：'+SilverBean+'银豆';
         await beanList()
        }
        resolve()
    })
  })
}

function beanList() {
  return new Promise((resolve, reject) =>{
    $.get(Host('bean/square/silverBean/getJdBeanList?'), async(error, resp, data) =>{
      let obj = JSON.parse(data);
      //$.log(JSON.stringify(obj,null,2))
      exchangs = obj.datas;
      if (SilverBean > exchangs[0].salePrice && SilverBean < exchangs[1].salePrice) {
        $.log(SilverBean + '银豆，可' + exchangs[x].memo)
      } else {
        for (x in exchangs) {
          salePrice = exchangs[x].salePrice,
          productPrice = exchangs[x].productPrice,
          leftStock = exchangs[x].leftStock;
          if (leftStock > 0 && SilverBean <= salePrice) {
            $.log(exchangs[x - 1].salePrice + '银豆可兑换' + exchangs[x - 1].productPrice + "京豆");
            if (jdbean == exchangs[x - 1].productPrice) {
              await exChange()
            }
            break
          }
        }
      }
      resolve()
    })
  })
}

function status() {
  return new Promise((resolve, reject) =>{
    $.get(Host('bean/square/silverBean/task/get?'), (error, resp, data) =>{
       //$.log(` 任务状态: ${data}`)
      taskstatus = JSON.parse(data);
      if (taskstatus.data.dailyTasks[0].status != 'received') {
        detail +=  `【日常抽奖】: 🔕 已完成/总计: ${doneSteps}/${totalSteps}次\n`
      };
      if (taskstatus.data.dailyTasks[0].status == 'received') {
        detail += `【日常抽奖】: ✅  +${taskstatus.data.dailyTasks[0].taskReward} 银豆\n`
      };
      if (taskstatus.data.weeklyTasks[0].status != 'received') {
        detail += `【每周任务】: 🔕 已完成/总计:${taskstatus.data.weeklyTasks[0].finishedCount}/${taskstatus.data.weeklyTasks[0].inviteAmount}次\n`
        weektask()
      } else if (taskstatus.data.weeklyTasks[0].status == 'received') {
        detail += `【每周任务】: ✅  +${taskstatus.data.weeklyTasks[0].taskReward}个银豆\n`
      }
      resolve()
    })
  })
}

 function video() {
  return new Promise(async(resolve, reject) =>{
    if (taskstatus.data.dailyTasks[1].status != 'received') {
      bodyVal = '{"openId": ' + '"' + openid + '","taskCode": "watch_video"}'
      for (j = 0; j < 4; j++) {
        $.post(Host('bean/square/silverBean/task/join?', bodyVal),function(error, resp, data){$.log(`视频: ${data}`)});
        await $.wait(1000);
        $.get(Host('bean/square/silverBean/taskReward/get?taskCode=watch_video&'),function(error, resp, data) {
          //$.log(`视频银豆: ${data}`)
        })
      }
    }
    if (taskstatus.data.dailyTasks[1].status == 'received') {
      detail += `【视频任务】: ✅ + ${taskstatus.data.dailyTasks[1].taskReward}银豆\n`
    }
    resolve()
  })
}

function lottery() {
  return new Promise((resolve, reject) =>{
    $.get(Host('bean/square/getTaskInfo?taskCode=lottery&'), async(error, resp, data) =>{
     //$.log(`0元抽奖${data}`);
      let lotteryres = JSON.parse(data);
      doneSteps = lotteryres.data.doneSteps,
      totalSteps = lotteryres.data.totalSteps,
      uncomplete = totalSteps - doneSteps,
      rewardAmount = lotteryres.data.rewardAmount;
      if (uncomplete > 0) {
        for (tasks of task.data.homeActivities) {
          if (tasks.participated == false) {
            for (j = 0; j < uncomplete; j++) {
              lotteryId = tasks.activityId;
              await cycleLucky()
            }
          }
        }
      }
      resolve()
    })
  })
}

function challenge() {
 return new Promise((resolve, reject) =>{
     body = '{"appId":'+' "'+appid+'"'+', "openId":'+' "'+openid+'"'+',"challengeStage":"'+$.time("yyyyMMdd")+'","deductAmount":'+challengebean+',"signLevelAmount":'+challengebean+'}'
    $.post(Host('sign/challenge/apply?',body), (error, response, data) => {
    $.log(`${cookieName}, 打卡挑战赛: ${data}`)
   let challres = JSON.parse(data)  
   if(challres.data==true){
     detail += `【打卡挑战】: 报名成功，押金: `+challengebean+'\n'
    }
   if(challres.errorCode=="exist"){
     detail += `【打卡挑战】: 已报名，押金: `+challengebean+'银豆\n'
    }
if(challres.errorCode=="deduct_fail"){
     detail += `【打卡挑战】: ❎ 报名失败 押金: 不足\n`
    }
    resolve()
  })
 })
}

function tasklist() {
   return new Promise((resolve, reject) =>{
    $.get(Host('lottery/home/v2?'), (error, response, data) => {
    //$.log(`任务列表: ${data}`)
    task = JSON.parse(data)
    resolve()
  })
 })
}

function cycleLucky() {
   return new Promise((resolve, reject) =>{
 $.post(Host('lottery/participate?lotteryId='+lotteryId+'&formId=123&source=HOME&'), (error, resp, data) => {
    $.log(`抽奖任务: ${data}`)
         })
     resolve()
    })
  }

//日常抽奖银豆
function Daily() {
  return new Promise((resolve, reject) =>{
    $.get(Host('bean/square/silverBean/taskReward/get?taskCode=lottery&taskType=lottery&inviterOpenId=&'), (error, resp, data) =>{
      $.log(` 日常抽奖银豆: ${data}`)
    })
    resolve();
   $.msg($.name, '昵称: ' + uesername + ' ' + $.sub, detail);
   $.log('昵称: ' + uesername + ' ' + $.sub + detail)
  })
}
// 每周银豆
function weektask() {
return new Promise((resolve, reject) => {
    $.get(Host('square/silverBean/taskReward/get?taskCode=lottery_multi&taskType=lottery_multi&inviterOpenId=&'), (error, response, data) =>
  {
    $.log(`本周任务: ${data}`)
    })
   resolve()
  })
}

function Daily() {
  return new Promise((resolve, reject) =>{
    $.get(Host('bean/square/silverBean/taskReward/get?taskCode=lottery&taskType=lottery&'), (error, resp, data) =>{
      $.log(` 日常银豆: ${data}`)
    }) ;
   $.msg($.name, '昵称: ' + uesername + ' ' + $.sub, detail)
   resolve()
  })
}

function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),a={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(a,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t){let e={"M+":(new Date).getMonth()+1,"d+":(new Date).getDate(),"H+":(new Date).getHours(),"m+":(new Date).getMinutes(),"s+":(new Date).getSeconds(),"q+":Math.floor(((new Date).getMonth()+3)/3),S:(new Date).getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,((new Date).getFullYear()+"").substr(4-RegExp.$1.length)));for(let s in e)new RegExp("("+s+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?e[s]:("00"+e[s]).substr((""+e[s]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r)));let h=["","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];h.push(e),s&&h.push(s),i&&h.push(i),console.log(h.join("\n")),this.logs=this.logs.concat(h)}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
