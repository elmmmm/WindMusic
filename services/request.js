// 对网络请求api进行封装
class HYRequest{
    constructor(baseURL){
        this.baseURL = baseURL
    }
    request(options){
        const {url} = options
        return new Promise((resolve, reject) => {
            wx.request({
                ...options,
                url: this.baseURL + url,
                success: (res) => {
                    resolve(res.data)
                },
                fail: reject
            })
        })
    }
    get(options){
        return this.request({...options, method: "get"})
    }
    post(options){
        return this.request({...options, method: "post"})
    }
}

export const hyRequest =  new HYRequest('http://codercba.com:9002')
// export const hyRequest =  new HYRequest('https://coderwhy-music.vercel.app')