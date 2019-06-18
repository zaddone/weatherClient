const Towxml = require('towxml/main');

//app.js
App({
  onLaunch: function () {
    //console.log("run");
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'guomi-2i7wu',
        traceUser: true,
      })
    }
    //wx.clearStorageSync();    
    //this.init(); light dark
    //let theme = 
    this.globalData = {
      statusBarHeight: wx.getSystemInfoSync()['statusBarHeight'],
      windowHeight: wx.getSystemInfoSync()['windowHeight'],
    }
  },
  theme: function () {
    var h = (new Date()).getHours();
    //console.log(new Date())
    return (h > 8 && h < 19) ? "light_big" : "dark_big";
  },
  inDB: function (data, hand) {
    let len = data.length;
    if (len == 0) return;
    //sign = new Set(wx.getStorageSync("sign"));
    var that = this;
    for (let i = len - 1, _d; i >= 0; i--) {
      _d = data[i];
     
      if (!wx.getStorageSync(_d._id)) {
        //console.log(_d)
        wx.setStorageSync(_d._id, {
          article: that.towxml.toJson("\n***\n# " + _d.title + "\n" + decodeURIComponent(_d.text).replace(/\+/g, " ") + "    \n***", 'markdown'),
          title: _d.title,
          _id: _d._id,
          link: _d.link,
          sign: false,
        });
        if (hand) hand(_d._id);
        //list.push(_d._id);
      }
    }
  },
  checkClearHistorydb: function (his) {
    var dbinfo = wx.getStorageInfoSync();
    if (dbinfo.currentSize / dbinfo.limitSize > 0.8) {
      for (let i = 0, n = his.length / 2; i < n; i++) wx.clearStorageSync(his.shift())
      wx.setStorageSync('history', his);
    }
  },
  initdb: function (obj) {
    var list = new Array();
    let his = wx.getStorageSync('history');
    const db = wx.cloud.database();
    var dbq = db.collection('pageColl')
    if (his) {
      this.checkClearHistorydb(his);
      dbq = dbq.where({ _id: db.command.nin(his) })
    }
    var that = this;
    dbq.orderBy('_id', 'desc').get({
      success: function (res) {
        that.inDB(res.data, function (_id) {list.push(_id); });
        if (obj) obj(list);
        else wx.setStorageSync('list', list);
      },
    })
  },
  updatedb: function (list, obj) {
    //let his = wx.getStorageSync('history');
    //if (his) this.checkClearHistorydb(his);
    var that = this;
    wx.cloud.database().collection('pageColl').orderBy('_id', 'desc').get({
      success: function (res) {
        that.inDB(res.data, function (_id) { list.unshift(_id) });
        //wx.setStorageSync('list', list);        
        //console.log(res.data)
        if (obj) obj(list);
        else wx.setStorageSync('list', list);
      },
    });
  },
  
  towxml: new Towxml(),
  addHistory: function (key) {
    //console.log(key);
    wx.getStorage({
      key: 'history',
      success: function (res) {
        for (let i of res.data) {
          if (i === key) return;
        }
        //console.log(key);
        res.data.push(key);
        wx.setStorage({
          key: 'history',
          data: res.data
        });
      },
      fail: function () {
        wx.setStorage({
          key: 'history',
          data: [key]
        })
      },
    })
  },
})