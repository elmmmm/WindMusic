// pages/main-profile/main-profile.js
import { menuCollection } from "../../database/index";
import { historyCollection, db } from "../../database/index";
import menuStore from "../../store/menuStore";

Page({
    data:{  
        isLogin: false,
        userinfo: {},
        tabs: [
            {name: "我的收藏", type: "favor"},
            {name: "我的喜欢", type: "like"},
            {name: "历史记录", type: "history"},
        ],
        isShowDialog: false,
        menuName: "", //创建新歌单
        menuList: [], //已创建歌单 
    },
    onLoad(){
        // 判断用户是否登录
        const openid = wx.getStorageSync('openid')
        const userinfo = wx.getStorageSync('userinfo')
        this.setData({ isLogin: !!openid })
        if(this.data.isLogin){
            this.setData({userinfo})
        }
        // 监听歌单数据
        menuStore.onState("menuList", this.handleMenuList)
        // historyCollection.remove({id: db.command.gt(1)}, false)
    },
    // ------------------- 事件监听 -------------------
    // 点击头像昵称获取用户信息
    async onUserInfoTap(){
        if(this.data.isLogin) return
        //手动授权弹窗
        wx.showModal({    
            title: '授权登录提示',
            content: '是否允许授权？',
            showCancel: true,
            confirmText: '允许',
            confirmColor: '#669F76',
            cancelColor: '#CC463D',
            success: async res => {
              if (res.confirm) {     //用户确认
                const profile = await
                  wx.getUserProfile({    //获取用户信息，最新版本已不支持弹窗
                    desc: '用户授权',
                  })
                // 云函数获取openid
                const loginRes = await wx.cloud.callFunction({
                    name: "music-login"
                })
                const openid = loginRes.result.openid
                // 保存到本地
                wx.setStorageSync('openid', openid)
                wx.setStorageSync('userinfo', profile.userInfo)
                // 保存登录状态，更新头像和昵称
                this.setData({ isLogin: true, userinfo: profile.userInfo })
              } else if (res.cancel) {     //用户取消
                wx.showToast({
                  title: '取消授权',
                  mask: true,
                  icon: 'error'
                })
              }
            }
          })
    },
    // 收藏、喜欢、历史模块点击
    onTabItemClick(event){
        const item = event.currentTarget.dataset.item
        wx.navigateTo({
          url: `/pages/detail-song/detail-song?type=profile&tabname=${item.type}&title=${item.name}`,
        })
    },
    // 创建歌单
    onPlusTap(){
        this.setData({isShowDialog: true})
    },
    onInputChange(){},
    async onConfirmTap(){
        // 新歌单的名字
        const menuname = this.data.menuName
        if(!menuname) return
        // 歌单的数据组成
        const menuRecord = {
            name: menuname,
            songList: []
        }
        // 将新歌单记录添加到数据库中
        const res = await menuCollection.add(menuRecord)
        if(res){
            wx.showToast({
              title: '创建成功~',
            })
            this.setData({menuName: ""})
            menuStore.dispatch("fetchMenuListAction")
        }
    },

    onMymenuTap(event){
        const item = event.currentTarget.dataset.item
        wx.navigateTo({
          url: `/pages/detail-song/detail-song?type=profile&title=${item.name}`,
        })
    },

    // ---------------- 数据共享 ----------------
    handleMenuList(value){
        this.setData({menuList: value})
    },

    onUnload(){
        menuStore.offState("menuList", this.handleMenuList)
    }
})