// 视频数据请求模块
import { hyRequest } from "./request"

export function getTopMv( offset=0, limit=20){ //设置默认值
    return hyRequest.get({
        url: "/top/mv",
        data: {
            limit,
            offset
        }
    })
}

export function getMVUrl(id) {
    return hyRequest.get({
      url: "/mv/url",
      data: {
        id
      }
    })
  }

  export function getMVInfo(mvid) {
    return hyRequest.get({
      url: "/mv/detail",
      data: {
        mvid
      }
    })
  }
  
  export function getMVRelated(mvid) {
    return hyRequest.get({
    //   url: "/related/allvideo",
      url: "/simi/mv",
      data: {
        mvid
      }
    })
  }