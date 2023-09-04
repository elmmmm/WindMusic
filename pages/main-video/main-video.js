// pages/main-video/main-video.js
import {getTopMv} from "../../services/video"

Page({
    data: {
        videoList: [],
        offset: 0,  
        hasMore: true //数据剩余标志，热榜视频只有50条
    },

    onLoad(){
        //发送网络请求
        this.fetchTopMv()
    },

    async fetchTopMv(){
        const res = await getTopMv(this.data.offset)
        const newVideoList = [...this.data.videoList, ...res.data]
        // 追加新数据，而不是覆盖数据
        this.setData({videoList: newVideoList})
        this.data.offset = this.data.videoList.length
        this.data.hasMore = res.hasMore
    },

    // 上拉加载更多
    onReachBottom(){
        if(!this.data.hasMore) return
        this.fetchTopMv()
    },

    // 下拉刷新
    onPullDownRefresh(){
        // console.log('xiala')
        this.setData({videoList: []})
        this.data.offset = 0
        this.data.hasMore = true
        // 加载第一页数据后，停止下拉动作
        this.fetchTopMv().then( () => {
            wx.stopPullDownRefresh()
        })
    }
})