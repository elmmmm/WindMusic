// components/nav-bar/nav-bar.js
const app = getApp()

Component({
    options: {
        multipleSlots: true  //使用多个插槽
    },
    properties: {
        title: {
            type: String,
            value: "导航标题"
        }
    },
    data: {
        statusHeight: 20
    },
    lifetimes: {
        attached(){
            this.setData({ statusHeight: app.globalData.statusHeight })
        }
    },
    methods: {
        onLeftClick(){
            this.triggerEvent("leftClick")
        }
    }
})
