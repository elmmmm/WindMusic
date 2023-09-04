// Promise版定时器节流
export default function throttle(fn, delay) {
    let timer = null
    return function (...args) {
        return new Promise((resolve, reject) => {
            if (!timer) {
                timer = setTimeout(() => {
                    const res = fn.apply(this, args)
                    timer = null
                    resolve(res)
                }, delay)
            }
        })
    }
}
