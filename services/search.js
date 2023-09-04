import {hyRequest} from "./request";

export function getHotSearch(){
    return hyRequest.get({
        url: "/search/hot",
    })
}

export function getSuggestSearch(value){
    return hyRequest.get({
        url: "/search/suggest",
        data:{
            keywords: value
        }
    })
}

export function getSearchResult(value){
    return hyRequest.get( {
        url:"/search",
        data:{
            keywords: value
        }
    })
}