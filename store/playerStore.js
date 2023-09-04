import { HYEventStore } from "hy-event-store";
import { getSongDetail, getSongLyric } from "../services/player";
import { parseLyric } from "../utils/parse-lyric";
import { historyCollection } from "../database/index";
export const audioContext = wx.createInnerAudioContext()

const playerStore = new HYEventStore({
    state: {
        playSongIndex: 0,
        playSongList: [],
        id: 0,
        currentSong: {},
        durationTime: 0, //音乐时长
        currentTime: 0, //当前播放完成时间
        lyricInfos: [], //歌词数据
        currentLyricText: "", //当前进行的某句歌词
        currentLyricIndex: -1, //当前歌词索引
        isFirstPlay: true,
        isPlaying: false, //播放、暂停
        playModeIndex: 0, // 0:顺序播放 1:单曲循环 2:随机播放
    },

    actions: {
        // 播放音乐
        playMusicWithSongIdAction(ctx, id){
            // 重置当前的播放状态，避免界面有上一首音乐信息的残影
            ctx.currentSong = {}
            ctx.durationTime = 0
            ctx.currentTime = 0
            ctx.currentLyricIndex = 0
            ctx.currentLyricText = " "
            ctx.lyricInfos = []

            // 保存歌曲ID
            ctx.id = id
            ctx.isPlaying = true

            // 请求数据
            // 歌曲数据
            getSongDetail(id).then(res => {
                ctx.currentSong = res.songs[0],
                ctx.durationTime = res.songs[0].dt

                // 添加到历史记录
                historyCollection.query(0, 20, {id: ctx.currentSong.id})
                .then(res => {
                    if(res.data.length){ // 如果已存在就忽略
                        console.log('已有记录')
                        return
                    }else{
                        historyCollection.add(ctx.currentSong)
                    }
                })
                
            })
            // 歌词数据
            getSongLyric(id).then(res => {
                const lrcString = res.lrc.lyric
                const lyricInfos = parseLyric(lrcString)
                ctx.lyricInfos = lyricInfos
            })
            
            // 使用微信的音频对象来播放音乐
            audioContext.stop() //切歌之前要先停止当前音乐，否则有问题
            audioContext.autoplay = true
            // 有的歌可能没有mp3音频资源，所以播放不了
            audioContext.src = `https://music.163.com/song/media/outer/url?id=${id}.mp3`
            
            // --------- 监听音乐播放事件（应当只绑定一次 isFirstPlay） ---------
            if(ctx.isFirstPlay){
                ctx.isFirstPlay = false
                audioContext.onError((res) => {
                    console.log('play err', res)
                })
                // 随着音乐播放，当前时刻，当前歌词等信息需要实时更新
                audioContext.onTimeUpdate(() => {  //这里之前有节流的
                    ctx.currentTime = audioContext.currentTime * 1000 //更新时刻
                    // console.log("onTimeUpdate--", ctx.currentTime/1000)
                    // 更新当前演唱的歌词
                    // 根据每句歌词的时间戳，遍历匹配正在演唱的歌词的索引和文本
                    if(!ctx.lyricInfos.length) return
                    let index = ctx.lyricInfos.length - 1 //默认为最后一句歌词
                    for(let i=0; i < ctx.lyricInfos.length; i++){
                        const info = ctx.lyricInfos[i]
                        if(info.time > audioContext.currentTime * 1000){
                            index = i - 1
                            break
                        }
                    }
                    if(index === ctx.currentLyricIndex) return  //这句没唱完
                    const currentLyricText = ctx.lyricInfos[index]?.text
                    ctx.currentLyricIndex = index
                    ctx.currentLyricText = currentLyricText
                })
                audioContext.onEnded(() => { //播放结束自动下一曲
                    this.dispatch("playNewSongAction")
                })
                audioContext.onWaiting(() => {
                    audioContext.pause()
                })
                audioContext.onCanplay(() => {
                    audioContext.play()
                })
            }
            
        },
        // 切歌(上一曲、下一曲)
        playNewSongAction(ctx, isNext=true){
            // 获取上一个索引
            const length = ctx.playSongList.length
            let index = ctx.playSongIndex
            // 计算新的索引
            switch(ctx.playModeIndex){
                case 0:  //顺序播放
                    index = isNext ? index+1 : index-1
                    if(index===length) index = 0
                    if(index===-1) index = length-1
                case 1: //单曲循环
                    break
                case 2: //随机播放
                    index = Math.floor(Math.random()*length)
                    break
            }
            const newSong = ctx.playSongList[index]
            
            console.log(newSong.name)
            // 开始播放新的歌曲（或重新播放当前曲目）
            this.dispatch("playMusicWithSongIdAction",newSong.id)
            ctx.playSongIndex = index
        },
        // 播放暂停、继续
        changeMusicStatusAction(ctx){
            if(audioContext.paused){
                audioContext.play()
                ctx.isPlaying = true
            }else{
                audioContext.pause()
                ctx.isPlaying = false
            }
        },
        // 切换播放模式（顺序、循环、随机）
        changePlayModeAction(ctx){
            // 计算新的模式
            let modeIndex = ctx.playModeIndex
            modeIndex = modeIndex + 1
            if(modeIndex === 3) modeIndex=0
            ctx.playModeIndex = modeIndex
        }
    }
})
export default playerStore