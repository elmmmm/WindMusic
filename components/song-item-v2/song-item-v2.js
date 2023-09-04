// components/song-item-v2/song-item-v2.js
// 云数据库
// const db = wx.cloud.database()
// const favorCollection = db.collection('c_favor')
// const likeCollection = db.collection('c_like')
import { favorCollection, likeCollection, db, menuCollection } from "../../database/index";

Component({
    /**
     * 组件的属性列表
     */
    properties: {
        itemData: {
            type: Object,
            value: {}
        },
        index: {
            type: Number,
            value: -1
        },
        iconshow: {
            type: Boolean,
            value: true
        },
        menuList: { //用户创建的歌单
            type: Array,
            value: []
        }
    },

    /**
     * 组件的初始数据
     */
    data: {

    },

    /**
     * 组件的方法列表
     */
    methods: {
        onSongItemTap(){
            const id = this.properties.itemData.id
            wx.navigateTo({
              url: `/packagePlayer/pages/music-player/music-player?id=${id}`,
            })
        },
        onMoreIconTap(){
            // 弹出选择框
            wx.showActionSheet({
              itemList: ["收藏", "喜欢", "添加到歌单"],
              success: (res) => {
                  const index = res.tapIndex
                  this.handleOperationResult(index)
              }
            })
        },
        async handleOperationResult(index){
            let res = null
            switch(index){
                case 0: //收藏
                    res = await favorCollection.add(this.properties.itemData)
                    break
                case 1: //喜欢
                    res = await likeCollection.add(this.properties.itemData)
                    break
                case 2: //添加到歌单
                    const menuName = this.properties.menuList.map(item => item.name)
                    wx.showActionSheet({
                      itemList: menuName,
                      success: (res) => {
                          const menuIndex = res.tapIndex
                          this.handleMenuIndex(menuIndex)
                      }
                    })
                    return
            }
            if(res){
                let title = index === 0 ? '收藏' : '喜欢'
                wx.showToast({
                  title: `${title}成功~`,
                })
            }

        },
        async handleMenuIndex(index){
            const menuItem = this.properties.menuList[index]
            // 把当前歌曲添加进对应歌单（追加）
            const data = this.properties.itemData
            const cmd = db.command
            const res = await menuCollection.update(menuItem._id, {
                songList: cmd.push(data)
            })
            if(res){
                wx.showToast({
                  title: '添加成功~',
                })
            }
        }   

    }
})