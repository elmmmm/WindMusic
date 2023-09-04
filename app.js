// app.js
App({
  globalData: {
    // 设备宽高
    screenWidth: 375,
    screenHeight: 667,
    statusHeight: 20,
    contentHeight: 500,
  },

  onLaunch(){
        // 获取设备信息
      wx.getSystemInfo({
          success: (res) => {
              this.globalData.screenWidth = res.screenWidth
              this.globalData.screenHeight = res.screenHeight
              this.globalData.statusHeight = res.statusBarHeight
              this.globalData.contentHeight = res.screenHeight - res.statusBarHeight - 44
          }
      })

    //  云能力初始化
    wx.cloud.init({
        env: "fairwind-4g87wuol3589aac5"
    })
  }
})
