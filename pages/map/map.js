var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    
  },
  
  regionchange(event){
    this.getCenterLocation()
    //console.log(event)
  },
  handmap:function(event){
    console.log(event)
  },
  markertap: function (event) {
    //app.globalData.loc.latitude = this.data.markers[event.markerId].latitude;
    //app.globalData.loc.longitude = this.data.markers[event.markerId].longitude;
    wx.reLaunch({
      url: '../start/index?loc=' + this.data.markers[event.markerId].latitude + ',' + this.data.markers[event.markerId].longitude
    })
    //console.log(event)
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onReady: function (e) {
    // 使用 wx.createMapContext 获取 map 上下文
  
  },
  onLoad: function (options) {
    if (!options.longitude){
      return
    }
    //console.log(options)
    this.mapCtx = wx.createMapContext('myMap')
    this.setData({
      latitude: options.latitude,
      longitude: options.longitude,
      windowsHeight: app.globalData.windowHeight,
      markers: [{
        iconPath: "../../images/shejiyeiconoiujmbtptap.png",
        id: 0,
        latitude: options.latitude,
        longitude: options.longitude,
        width: 50,
        height: 50
      }],
    })
  },
  getCenterLocation: function () {
    let that = this;
    this.mapCtx.getCenterLocation({
      success: function (res) {
        //app.globalData.loc.longitude = res.longitude;
        //app.globalData.loc.latitude = res.latitude;
        that.setData({
          markers: [{
            iconPath: "../../images/shejiyeiconoiujmbtptap.png",
            id: 0,
            latitude: res.latitude,
            longitude: res.longitude,
            width: 50,
            height: 50
          }],
        })

      }
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})