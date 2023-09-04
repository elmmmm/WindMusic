// pages/detail-song/detail-song.js
import recommendStore from "../../store/recommendStore";
import rankingStore from "../../store/rankingStore";
import playerStore from "../../store/playerStore";
import menuStore from "../../store/menuStore";
import {
    getPlaylistDetail
} from "../../services/music";

const db = wx.cloud.database()

Page({
    data: {
        // 歌曲列表详情页有好几个模块会用到，但数据和展示形式不一样
        type: "ranking",
        key: "newRanking",
        id: "", //歌单的id

        songInfo: {},
        menuList: []
    },

    onLoad(options) {
        // 确定导航过来的数据的类型
        // type: ranking -> 榜单数据
        // type: recommend -> 推荐数据
        // type: menu -> 歌单
        const type = options.type
        this.setData({
            type
        })
        // 用户创建的歌单数据-添加到歌单时需要用到
        menuStore.onState("menuList", this.handleMenuList)

        // 根据不同类型从store中获取数据或请求数据
        if (type === "ranking") { //排行榜模块
            const key = options.key
            this.data.key = key
            rankingStore.onState(key, this.handleSongs)
        } else if (type === "recommend") { //推荐歌曲（更多）
            recommendStore.onState("recommendSongInfo", this.handleSongs)
        } else if (type === "menu") { //热门、推荐歌单点击某个歌单
            const id = options.id
            this.data.id = id
            this.fetchMenuSongInfo()
        } else if(type === "profile"){ 
            const tabname = options.tabname
            const title = options.title
            if(tabname){//我的收藏、喜欢、历史
                this.handleProfileTabInfo(tabname, title)
            }else{ //用户的歌单
                this.handleMymenuInfo(title)
            }
        }
    },

    handleSongs(value) {
        this.setData({
            songInfo: value
        })
        wx.setNavigationBarTitle({
            title: value.name,
        })
    },

    async fetchMenuSongInfo() {
        const res = await getPlaylistDetail(this.data.id)
        this.setData({
            songInfo: res.playlist
        })
    },

    async handleProfileTabInfo(tabname, title){
        // 从数据库拿收藏、喜欢、历史歌曲数据
        const collection = db.collection(`c_${tabname}`)
        const res = await collection.get()
        this.setData({
            songInfo: {
                name: title,
                tracks: res.data
            }
        })
    },

    handleMenuList(value){
        this.setData({menuList: value})
    },
    handleMymenuInfo(title){
        const curMenu = this.data.menuList.filter((item) => item.name == title)
        this.setData({
            songInfo: {
                name: curMenu[0].name,
                tracks: curMenu[0].songList
            }
        })
    },

    onUnload() {
        if (this.data.type === "ranking") {
            rankingStore.offState(this.data.key, this.handleSongs)
        } else if (this.data.type === "recommend") {
            recommendStore.offState("recommendSongInfo", this.handleSongs)
        }
        menuStore.offState("menuList", this.handleMenuList)
    },

    // 从歌单详情页进入播放页前，设置好playerStore播放列表和索引
    onSongItemTap(event){
        const index = event.currentTarget.dataset.index
        playerStore.setState('playSongIndex', index)
        playerStore.setState('playSongList', this.data.songInfo.tracks)
    },

})