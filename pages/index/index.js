var app = getApp();
Page({
  data: {
    parid: 0,
    statusBarHeight: app.globalData.statusBarHeight,
    showDialog: false,
    dark: false,
    //theme : 'dark',
    windowsHeight: wx.getSystemInfoSync()['screenHeight'],
    visibility: "hidden",
    top: wx.getMenuButtonBoundingClientRect().top,
    //right: right_bottom,
    //right_top: wx.getSystemInfoSync()['windowHeight'] / 2,
    //windowsWeight:app.globalData.windowsWeight,
    //bottomMove:0,
    //history: new Array(),
  },
  toggleDialog() {
    this.setData({
      showDialog: !this.data.showDialog
    });
  },
  __bind_touchmove(event) {
    //console.log(event);
  },
  __bind_touchend(event) {
    //console.log(event.target.dataset._el,"touchend");
  },
  __bind_touchstart(event){
    //console.log(event.target.dataset._el, "__bind_touchstart");   
  },
  __bind_tap(event) {
    console.log(event)
    if (event.target.dataset._el.tag != "image") return;
   
    let url = event.target.dataset._el.attr.src;
    console.log(url)
    wx.previewImage({
      current: url, 
      urls: [url] 
    })
    //console.log(event, "__bind_tap");
  },
  onLoad(obj) {
    wx.showLoading({
      title: '加载中',
    })
    //console.log(app.globalData.weather)
    //this.data.history = new Array();
    //this.setPageStyle();
    var list = wx.getStorageSync('list');
    if (obj && obj.id) {
      this.getPageDB(obj.id, this.viewPage);
      if (list && list.length > 0)
        for (const i in list) {
          if (list[i] === obj.id) {
            list.splice(i, 1);
            wx.setStorageSync("list", list);
            break;
          };
        }
      return;
    }
    if (!list) {
      var that = this;
      app.initdb(function (res) {
        that.getPageDB(res.shift(), that.viewPage);
        wx.setStorageSync('list', res);
      })
    } else if (list.length === 0) {
      //ad page
      var that = this;
      app.initdb(function (res) {
        that.getPageDB(res.shift(), that.viewPage);
        wx.setStorageSync('list', res);
      })
    } else {
      this.getPageDB(list.shift(), this.viewPage);
      wx.setStorageSync('list', list);
      app.updatedb(list);
    }
  },
  getPageDB: function (key, hand) {
    let db = wx.getStorageSync(key);
    //console.log(key,db);
    if (!db) {
      wx.cloud.database().collection('pageColl').doc(key).get().then(res => {
        if (res.data.length > 0) {
          hand(res.data[0]);
          app.addHistory(key);
        }
      })
      //return false;
    } else {
      hand(db);
      app.addHistory(key);
    }
  },
  gohome:function(){
    wx.reLaunch({
      url: '../start/index'
    })
  },
  viewPage: function (db) {
    db.article.theme = app.theme();
    if (app.globalData.weather){
      this.setData({
        visibility:"visible",
        title: app.globalData.weather,
      });
    }
   
    this.setData({
      db: db,
      sign: db.sign,
      showDialog: false,
      dark: app.theme() === "dark_big",
      scrollTop:0,
    });
    wx.hideLoading();
  },
  
  onPullDownRefresh() {
    wx.vibrateShort();
    var that = this;
    wx.getStorage({
      key: 'history',
      success: function (res) {
        //console(res);
        //let k = res.data.pop();
        if (res.data.length === 1) {
          wx.stopPullDownRefresh();
          return;
        }
        var val = wx.getStorageSync('list') || [];
        val.unshift(res.data.pop());
        that.getPageDB(res.data[res.data.length - 1], function (db) {
          that.viewPage(db);
          wx.stopPullDownRefresh();
          wx.setStorage({
            key: 'list',
            data: val,
          })
          wx.setStorage({
            key: 'history',
            data: res.data,
          })
        });
      },
      fail: wx.stopPullDownRefresh(),
    })
  },
  tapBottom() {    
    
    if (!this.data.sign){
      wx.vibrateShort();
      this.toggleDialog();
    }    
  },
  reachBottom() {
    wx.vibrateShort();
    this.onLoad();
  },
  reachBottomTap() {
    this.toggleDialog();
    this.reachBottom();
  },
  onSignTap: function () {
    this.toggleDialog();
    this.onSign();
    this.onLoad();
  },
  onSign: function () {
    wx.vibrateShort();
    let id = this.data.db._id;
    let si = wx.getStorageSync("sign") || [];
    console.log(si);
    let len = si.length;
    if (this.data.db.sign) {
      for (let i = 0; i < len; i++) {
        if (si[i] === id) {
          si.splice(i, 1);
          break;
        }
      }
      console.log(si);
      wx.setStorage({
        key: 'sign',
        data: si,
      });
    } else {
      if (len === 0 || !(new Set(si)).has(id)) {
        si.push(id);
        if (len > 20) si.shift();
        console.log(si);
        wx.setStorage({
          key: 'sign',
          data: si,
        });
      }
    }
    this.data.db.sign = !this.data.db.sign;
    this.setData({ sign: this.data.db.sign });
    wx.setStorage({
      key: id,
      data: this.data.db,
    });
  },
  //onPageScroll(e){
  //  console.log(e);
  //}
  onShareAppMessage: function (res) {
    return {
      title: this.data.db.title,
      path: 'pages/index/index?id=' + this.data.db._id
    }
  },
})