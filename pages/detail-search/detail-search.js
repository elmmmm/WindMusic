// pages/detail-search/detail-search.js
import { getHotSearch, getSuggestSearch, getSearchResult } from "../../services/search"
import playerStore from "../../store/playerStore";
import menuStore from "../../store/menuStore";

Page({
    data: {
        isSearch: false,
        searchValue: "",
        hots: [],
        suggestSongs: [],
        searchSongs: [], //搜索结果
        menuList: [], //已创建歌单 
    },

    onLoad(options){
        //获取热门搜索数据
        getHotSearch().then( res => {
            this.setData({
                hots: res.result.hots
            })
        })
        menuStore.onState("menuList", this.handleMenuList)
    },

    // ----------------------- 事件监听 -----------------------
    // 搜索框聚焦，隐藏热门搜索
    handleSearchFocus(){
        this.setData({ isSearch: true })
    },
    handleSearchCancel: function() {
        this.setData({ isSearch: false })
        this.setData({ searchSongs: [] })
    },
    // 搜索联想提示
    handleSearchChange: function(event){
        this.setData({searchSongs: []})
        const searchValue = event.detail
        this.setData({ searchValue }) //不是双向绑定的！
        if(searchValue.length <= 0) return
        getSuggestSearch(searchValue).then( res => {
            if(!res.result) return
            // console.log('suggest', res.result)
            const result = res.result
            const order = res.result.order
            let suggestSongs = []
            for(const type of order){
                const typeResult = result[type]
                suggestSongs = suggestSongs.concat(typeResult)
            }
            this.setData({
                suggestSongs
            })
        })
    },
    // 确定搜索-回车
    handleSearchAction(){
        getSearchResult(this.data.searchValue).then(res => {
            this.setData({ searchSongs: res.result.songs })
        })
    },
    // 热门搜索点击
    handleTagClick(event){
        const value =  event.currentTarget.dataset.value
        this.setData({ searchValue: value }, () => {
            this.handleSearchAction()
        })
    },
    // 搜索联想点击
    handleItemSelect(event){
        const value = event.target.dataset.name
        this.setData({ searchValue: value }, () => {
        this.handleSearchAction()
        })
    },
    // 点击搜索结果，转跳播放页
    handleSongItemClick(event){
        const index = event.currentTarget.dataset.index
        // const item = event.currentTarget.dataset.item //dataset还可以放对象呢！
        playerStore.setState('playSongList', this.data.searchSongs)
        playerStore.setState('playSongIndex', index)
    },
    handleMenuList(value){
        this.setData({menuList: value})
    },
})