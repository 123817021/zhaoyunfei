const util = {

  backHomeListener: function () {
    //监听返回主页事件
    api.addEventListener({
        name: 'backHome'
    }, function(ret, err){
        const winName = api.winName

        if(winName == "root"){
          if(switchBtn && typeof(switchBtn)=="function"){
            switchBtn(0,true);
          }
        }else{
          api.closeWin();
        }
    });
  },
  /**
  * 页面初始化后加载
  */
  globalInit: function () {
    //增加全局监听

    // 刷新每个窗口
    api.addEventListener({
        name: 'refresh'
    }, function(ret, err){
      util.checkLogin();
      if(typeof(initData)=="function"){
        initData(false);
      }
    });
  },
  checkLogin: function () {
    //检查是否登录
    const userStr = util.getPrefs(cfg.userCacheKEY)
    if (!userStr) {
      api.openWin({
          name: 'login',
          url: 'widget://html/login.html'
      });
      return false;
    }
    return true;
  },
  //================数据存储=================
  // 获取参数
  getPrefs: function(key) {
    return api.getPrefs({
      sync: true,
      key: key
    })
  },
  //设置参数
  setPrefs: function (key,value) {
    api.setPrefs({
      key: key,
      value: value
    });
  },
  rmPrefs: function (key) {
    api.removePrefs({
        key: key
    });
  },
  // 获取参数
  getStorage: function(key) {
    return $api.getStorage(key);
  },
  //设置参数
  setStorage: function (key,value) {
    $api.setStorage(key,value);
  },
  rmStorage: function (key) {
    $api.rmStorage(key);
  },

  //================数据存储=================
  //发送get请求
  get: function (url,params,funObj) {
    util.ajax(url,"GET",params,funObj);
  },
  //发送get请求
  post: function (url,params,funObj) {
    util.ajax(url,"POST",params,funObj);
  },
  ajax: function (url,method,params,funObj) {
    util.loading();
    var token = "",userId="",orgId="";
    const userStr = util.getPrefs(cfg.userCacheKEY)
    if(userStr){
      const user = JSON.parse(userStr);
      token = user.token;
      userId = user.userId;
      orgId = user.orgId;
    }
    params.userId = userId
    params.orgId = orgId
    api.ajax({
         url: cfg.baseUrl+url,
         timeout : 1000,
         method: method,
         headers: {
           Authorization: token,
           TokenId: userId
         },
         data: {
             values: params
         }
     }, function(json, err) {
       util.loadingClose();
       //先判断状态是否正常返回
       if(json == undefined || json == ''){
         //登录信息获取失败
        util.toast("网络异常，请稍后重试！"+json);
       }else if(json.code=='200'){
         funObj(json);
       }else{
         util.toast(json.msg);
       }

     });
  },
  //返回主目录
  /**
  * index 0-3 首页下的工具选中下标
  */
  backHome: function () {
    api.sendEvent({
        name: 'backHome',
        extra: {}
    });

  },
  refresh: function () {
    api.sendEvent({
        name: 'refresh'
    });

  },
  //对提示进行封装
  toast: function (msg) {
    api.toast({msg: msg});
  },
  open: function (name,url) {
    api.openWin({
        name: name,
        url: url
    });
  },
  loading: function () {
    const loading = $api.byId("loading");
    if(loading){
      $api.css(loading,"display:block");
    }else{
      var loadHtml = "<div id='loading' class='loading'>"
        +"<img src='"+api.wgtRootDir + "/image/loading_more.gif'></div>"
      $api.append($api.dom("body"), loadHtml);
      $api.css($api.byId("loading"),"display:block");
    }
  },
  loadingClose: function () {
    $api.css($api.byId("loading"),"display:none")
  }

}
Date.prototype.format = function(fmt) {
     var o = {
        "M+" : this.getMonth()+1,                 //月份
        "d+" : this.getDate(),                    //日
        "h+" : this.getHours(),                   //小时
        "m+" : this.getMinutes(),                 //分
        "s+" : this.getSeconds(),                 //秒
        "q+" : Math.floor((this.getMonth()+3)/3), //季度
        "S"  : this.getMilliseconds()             //毫秒
    };
    if(/(y+)/.test(fmt)) {
            fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
    }
     for(var k in o) {
        if(new RegExp("("+ k +")").test(fmt)){
             fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
         }
     }
    return fmt;
}
