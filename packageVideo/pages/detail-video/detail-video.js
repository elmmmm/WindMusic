// pages/detail-video/detail-video.js
import {getMVUrl, getMVInfo, getMVRelated} from "../../../services/video"
import playerStore from "../../../store/playerStore";
Page({
    data: {
        id: 0,
        mvUrl: "",
        mvInfo: {},
        relatedVideo: [],
        
    },
    stopMusic(value){
        if(value){
            console.log('isPlaying', value)
            playerStore.dispatch("changeMusicStatusAction")
        }
    },
    onLoad(options) {
        // 关掉正在播放的音乐
        playerStore.onState('isPlaying', this.stopMusic)
        const id = options.id
        this.setData({id})
        // 请求数据
        this.fecthMVUrl()
        this.fetchMVInfo()
        this.fetchMVRelated()
    },
    onUnload(){
        // 取消监听，不然回调音乐主页播放暂停还是会被监听到
        playerStore.offState('isPlaying', this.stopMusic)
    },
    // 请求mv地址
    async fecthMVUrl(){
        const res = await getMVUrl(this.data.id)
        this.setData({ mvUrl: res.data.url })
    },
    //请求mv信息
    async fetchMVInfo() {
        const res = await getMVInfo(this.data.id)
        this.setData({ mvInfo: res.data })
      },
    //请求推荐mv
    async fetchMVRelated() {
        const res = await getMVRelated(this.data.id)
        this.setData({ relatedVideo: res.mvs })
    }

})  