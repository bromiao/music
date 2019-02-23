//state.js 定义数据
import {playMode} from 'common/js/config'
import {loadSearch, loadPlay, loadFavorite} from "common/js/cache";

const state = {
    singer: {},
    playing: false,
    fullScreen: false,
    playList: [],
    sequenceList: [],
    mode: playMode.sequence,
    currentIndex: -1,  //歌曲前进、后退状态
    disc: {},
    topList: {},
    searchHistory: loadSearch(),
    playHistory: loadPlay(),
    favoriteList: loadFavorite()
}

export default state