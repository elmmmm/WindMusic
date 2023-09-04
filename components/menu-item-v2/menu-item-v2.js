// components/menu-item-v2/menu-item-v2.js
import { menuCollection } from "../../database/index";
import menuStore from "../../store/menuStore";

Component({
   properties: {
       itemData: {
           type: Object,
           value: {}
       }
   },

   methods: {
        // 删除这个创建的歌单
        async onDeleteTap(){
            // 获取这条数据的_id
            const _id = this.properties.itemData._id
            // 删除这条数据
            let res = await menuCollection.remove(_id)
            if(res){
                wx.showToast({
                  title: '删除成功~',
                })
                menuStore.dispatch("fetchMenuListAction")
            }
        }
   }
})
