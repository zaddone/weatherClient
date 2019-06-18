var app = getApp();
Page({
  data: {
    //msg: [],
    statusBarHeight: wx.getSystemInfoSync()['statusBarHeight'],
    windowsHeight: wx.getSystemInfoSync()['screenHeight'],
    windowsWidth: wx.getSystemInfoSync()['screenWidth'],
    show: "hidden",
    listshow: "hidden",
  },
  onReady(){

  },
  onLoad(obj) {
    
    wx.showLoading({
      title: '加载中',
    })
    
    if (obj && obj.loc){
      console.log(obj.loc)
      let that = this;
    wx.request({
      url: 'https://www.zaddone.com/getweather',
      data: {
        loc: obj.loc
      },
      success(res) {
        //console.log(res)
        let loc = obj.loc.split(",")
        that.data.loc = { latitude:loc[0], longitude: loc[1] }
        app.globalData.weather = res.data.msg.base.cityname + " " + res.data.msg.base.weather + res.data.msg.base.temp + "℃ ";
        that.setData({ msg: res.data.msg, show: "visible" })
        //console.log(res.data)
        wx.hideLoading();
        that.getPageList();
      },
      fail(err) {
        console.log(err);
        wx.hideLoading();
        wx.reLaunch({
          url: '../start/index'
        })
      }
    })
    return
    }

    //if ()

    let that = this
    wx.getLocation({
      type: 'gcj02',
      success(res) {
        that.data.loc = { latitude: res.latitude, longitude:res.longitude}
        wx.request({
          url: 'https://www.zaddone.com/getweather',
          data: {
            loc: res.latitude + "," + res.longitude
          },
          success(res) {
            app.globalData.weather = res.data.msg.base.cityname + " " + res.data.msg.base.weather + res.data.msg.base.temp + "℃ ";
            that.setData({ msg: res.data.msg, show: "visible" })
            //console.log(res.data)
            wx.hideLoading();
            that.getPageList();
          },
          fail(err) {
            console.log(err);
            wx.hideLoading();
            wx.reLaunch({
              url: '../index/index'
            })
          }
        })
      },
      fail(err) {
        console.log(err);
        wx.hideLoading();
        wx.reLaunch({
          url: '../index/index'
        })
      }
    })
    
  },
  getPageList() {
    let that = this
    //console.log("get page list")
    var query = wx.createSelectorQuery();
    query.select('.scroll-view_H').boundingClientRect(function (rect) {
      //console.log(rect.height)
      let top = rect.height + that.data.statusBarHeight + 10
      that.setData({
        scrollviewTop: rect.height,
        pagelistheight: (that.data.windowsHeight - rect.height),        
      })
    }).exec();
    function h(list) {
      if (list.length === 0) return
      wx.setStorageSync('list', list);
      let pages = [];
      for (let id of list) {
        let d = wx.getStorageSync(id)
        pages.push({ _id: d._id, title: d.title })
      }
      that.setData({
        pages: pages,
        listshow: "visible"
      })
    }
    let l = wx.getStorageSync("list") || [];
    //console.log(l);
    if (l.length === 0) {
      //console.log("init")
      app.initdb(h)
    } else {
      app.updatedb(l, h)
    }
  },
  onPullDownRefresh(){    
    wx.stopPullDownRefresh();
    this.onLoad()
  },
  openMap:function(){
    wx.reLaunch({
      url: '../map/map?latitude=' + this.data.loc.latitude + '&longitude=' + this.data.loc.longitude
    })
  }
})