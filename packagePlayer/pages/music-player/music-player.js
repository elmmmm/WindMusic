// pages/music-player/music-player.js
import { throttle } from "underscore";
import playerStore, {audioContext} from "../../../store/playerStore";

const app = getApp()
const modeNames = ["order", "repeat", "random"]

Page({
    data: {
        stateKeys: ["id", "currentSong", "durationTime", "currentTime", "lyricInfos", "currentLyricText", "currentLyricIndex", "isPlaying", "playModeIndex"],
        pageTitles: ["歌曲", "歌词"],
        currentPage: 0,
        contentHeight: 500,
        playModeName: "order",
        sliderValue: 0, //播放进度（百分比）
        isSliderChanging: false,
        isWaiting: false,

        id: 0,
        currentSong: {},
        playSongList: [], //播放列表
        playSongIndex: 0, //当前播放音乐的索引
        durationTime: 0, //音乐时长
        currentTime: 0, //当前播放完成时间
        isFirstPlay: true,
        isPlaying: false, //播放、暂停
        
        lyricInfos: [], //歌词数据
        currentLyricText: "", //当前进行的某句歌词
        currentLyricIndex: -1, //当前歌词索引
        lyricScrollTop: 0, //第二页滚动位置
    },
    onLoad(options){
        // 设置设备的宽高信息
        this.setData({
            contentHeight: app.globalData.contentHeight, 
            statusHeight: app.globalData.statusHeight
        })

        // 获取传入的歌曲id
        const id = options.id

        // 播放id对应的音乐
        if(id){ //如果从主页播放器组件转跳过来，无需重新请求播放
            playerStore.dispatch("playMusicWithSongIdAction", id)
        }
       
        // 监听获取store共享的数据
        // 歌曲列表和当前歌曲索引
        playerStore.onStates(["playSongList", "playSongIndex"], this.getPlaySongInfosHandler)
        // 其他播放器状态参量
        playerStore.onStates(this.data.stateKeys, this.getPlayerInfosHandler)
    },
    onUnload(){
        // 解除store监听
        playerStore.offStates(["playSongList", "playSongIndex"], this.getPlaySongInfosHandler)
        playerStore.offStates(this.data.stateKeys, this.getPlayerInfosHandler)
    },

    // 播放时刻、进度条
    updateProgress: throttle(function(currentTime){
        if (this.data.isSliderChanging) return
        // //更新时刻、更新进度条
        const sliderValue = currentTime/this.data.durationTime * 100
        this.setData({currentTime, sliderValue}) 
    }, 500, { leading: false, trailing: false }),
     
    // ----------------------------- 共享数据保存和更新 -----------------------------
    // 保存歌曲列表和索引数据
    getPlaySongInfosHandler(value){
        if(value.playSongList){
            this.data.playSongList = value.playSongList
        }
        if(value.playSongIndex !== undefined){
            this.data.playSongIndex = value.playSongIndex
        }
    },
    getPlayerInfosHandler({ 
        id, currentSong, durationTime, currentTime,
        lyricInfos, currentLyricText, currentLyricIndex,
        isPlaying, playModeIndex
      }){
        if(id !== undefined){
            this.setData({id})
        }
        if (currentTime !== undefined) {
            // 根据当前时刻改变进度
            this.updateProgress(currentTime) //因为当前时刻变动很频繁，所以updateProgress做了节流
        }
        if(currentSong){
            this.setData({currentSong})
        }
        if (durationTime !== undefined) {
            this.setData({ durationTime })
        }
        if (lyricInfos) {
            this.setData({ lyricInfos })
        }
        if (currentLyricText) {
        this.setData({ currentLyricText })
        }
        if (currentLyricIndex !== undefined) { 
            // 修改第二页滚动距离，高亮歌词的索引
            this.setData({ currentLyricIndex, lyricScrollTop: currentLyricIndex * 35 })
        }
        if (isPlaying !== undefined) {
            // 播放暂停，图标跟着变
            this.setData({ isPlaying })
        }
        if (playModeIndex !== undefined) {
            // 播放模式改变，图标跟着变
            this.setData({ playModeName: modeNames[playModeIndex] })
        }
    },

    // ----------------------------- 事件监听 -----------------------------
    // 书写顺序可以按照界面中按钮上下的位置来排序
    onNavBackTap(){
        wx.navigateBack()
    },
    onNavTabItemTap(event){
        const index = event.currentTarget.dataset.index
        this.setData({currentPage: index})
    },
    onSwiperChange(event){
        this.setData({currentPage: event.detail.current})
    },
    // 播放进度条点击
    onSliderChange(event){
        this.data.isWaiting = true  //防止滑块抖动
        setTimeout(()=>{
            this.data.isWaiting = false
        }, 1500)
        // 获取滑块位置对应的值
        const value = event.detail.value
        // 根据滑块值按照百分比计算出对应播放的当前时刻
        const currentTime = value/100*this.data.durationTime
        // 设置音频对象的当前时刻
        audioContext.seek(currentTime/1000)
        // console.log('seek--', currentTime/1000)
        // this.data.currentTime = currentTime //试试这样呢。没用。
        this.setData({currentTime})
        this.data.isSliderChanging = false
    },
    // 播放进度条拖动(节流)
    onSliderChanging: throttle(function(event) {
        // 1.获取滑动到的位置的value
        const value = event.detail.value
    
        // 2.根据当前的值, 计算出对应的时间
        const currentTime = value / 100 * this.data.durationTime
        this.setData({ currentTime })
    
        // 3.当前正在滑动
        this.data.isSliderChanging = true
      }, 100),
    //   暂停继续
    onPlayOrPauseTap(){
        playerStore.dispatch('changeMusicStatusAction')
    },
    // 播放模式切换
    onModeBtnTap(){
        playerStore.dispatch("changePlayModeAction")
    },
    onPrevBtnTap(){
        playerStore.dispatch("playNewSongAction", false)
    },
    onNextBtnTap() {
        playerStore.dispatch("playNewSongAction")
    },
})