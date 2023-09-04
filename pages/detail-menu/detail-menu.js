import { getSongMenuTag, getSongMenuList } from "../../services/music";

// pages/detail-menu/detail-menu.js
Page({
    data: {
        songMenus: []
    },
    onLoad(options) {
        this.fetchAllMenuList()
    },
    
    async fetchAllMenuList(){
        // 要先请求获取歌单分类名
        const tagRes = await getSongMenuTag()
        // 阻塞
        const tags = tagRes.tags

        // 根据tag请求分别请求不同类别的歌单数据
        const allPromises = []
        for(let tag of tags){
            const promise = getSongMenuList(tag.name)
            allPromises.push(promise)
        }
        // 在获取到全部类别的数据再进行一次setData，这样能避免多次更新视图
        Promise.all(allPromises).then( res => {
            this.setData({ songMenus: res })
        })
    }
})