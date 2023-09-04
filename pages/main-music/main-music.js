// pages/main-music/main-music.js
import { getMusicBanner, getPlaylistDetail, getSongMenuList} from "../../services/music"
import querySelect from "../../utils/query-select"
import throttle from "../../utils/throttle"
import rankingStore from "../../store/rankingStore";
import recommendStore from "../../store/recommendStore";
import playerStore from "../../store/playerStore"

// 添加节流
const querySelectThrottle = throttle(querySelect, 100)
// 获取app
const app = getApp()
Page({
    data: {
        searchValue: "",
        banners: [],
        bannerHeight: 150,
        recommendSongs: [],

        // 歌单数据
        screenWidth: 375,
        hotMenuList: [], //热门歌单
        recMenuList: [], //推荐歌单
        // 排行榜数据
        rankingInfos: {},
        // 播放器数据
        currentSong: {},
        isPlaying: true
    },

    onLoad(){
        // 设置屏幕的尺寸
        this.setData({ screenWidth: app.globalData.screenWidth })
        this.fetchMusicBanner()
        this.fetchSongMenuList()

        // 监听数据和请求数据
        recommendStore.onState("recommendSongInfo", this.handleRecommendSongs)
        recommendStore.dispatch("fetchRecommendSongsAction")
        rankingStore.onState("newRanking", this.handleNewRanking)
        rankingStore.onState("originRanking", this.handleOriginRanking)
        rankingStore.onState("upRanking", this.handleUpRanking)
        rankingStore.dispatch("fetchRankingDateAction")
        playerStore.onStates(["currentSong", "isPlaying"], this.handlePlayInfos)
    },

    // 轮播图数据
    async fetchMusicBanner(){
        const res = await getMusicBanner()
        this.setData({banners: res.banners})
    },
    // 热门推荐数据 
    fetchMusicRecommend(){
        getPlaylistDetail(3778678).then( (res) => {
            const playlist = res.playlist
            const recommendSongs = playlist.tracks.slice(0, 6)
            this.setData({recommendSongs: recommendSongs})
        })
    },
    // 两个歌单
    fetchSongMenuList(){
        getSongMenuList().then(res => {
            this.setData({ hotMenuList: res.playlists })
        })
        getSongMenuList("华语").then(res => {
            this.setData({ recMenuList: res.playlists })
        })
    },

    // ----------------------------- 事件监听
    onSearchClick(){
        wx.navigateTo({
          url: '/pages/detail-search/detail-search',
        })
    },
    onBannerImageLoad(){
        // console.log('----')
        querySelectThrottle(".banner-image").then( res => {
            console.log('height')
            this.setData({ bannerHeight: res[0].height })
        })
    },
    onRecommendMoreClick(){
        wx.navigateTo({
          url: '/pages/detail-song/detail-song?type=recommend',
        })
    },
    // 从'热门推荐'项目进入播放页前，设置好播放列表和索引
    onSongItemTap(event){
        const index = event.currentTarget.dataset.index
        playerStore.setState('playSongIndex', index)
        playerStore.setState('playSongList', this.data.recommendSongs)
    },
    // 点击播放器封面，进入播放页
    onPlayBarAlbumTap(){
        wx.navigateTo({
            url: '/packagePlayer/pages/music-player/music-player',
        })
    },
    // 暂停、继续
    onPlayOrPauseBtnTap(){
        playerStore.dispatch('changeMusicStatusAction')
    },

    // ----------------------------- Store的监听回调，更新视图
    handleRecommendSongs(value){
        if (!value.tracks) return   //首次监听时 value为空
        this.setData({ recommendSongs: value.tracks.slice(0, 6) })
    },
    handleNewRanking(value){
        const newRankingInfos = {...this.data.rankingInfos, newRanking: value}
        this.setData({rankingInfos: newRankingInfos})
    },
    handleOriginRanking(value){
        const newRankingInfos = {...this.data.rankingInfos, originRanking: value}
        this.setData({rankingInfos: newRankingInfos})
    },
    handleUpRanking(value){
        const newRankingInfos = {...this.data.rankingInfos, upRanking: value}
        this.setData({rankingInfos: newRankingInfos})
    },
    handlePlayInfos({currentSong, isPlaying}){
        if(currentSong){
            this.setData({currentSong})
        }
        if(isPlaying !== undefined){
            this.setData({isPlaying})
        }
    },
    // 卸载Store监听
    onUnload() {
        recommendStore.offState("recommendSongs", this.handleRecommendSongs)
        rankingStore.offState("newRanking", this.handleNewRanking)
        rankingStore.offState("originRanking", this.handleOriginRanking)
        rankingStore.offState("upRanking", this.handleUpRanking)
        playerStore.offStates(["currentSong", "isPlaying"], this.handlePlayInfos)
    }

})