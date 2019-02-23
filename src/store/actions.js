import * as types from './mutation-types'
import {playMode} from "common/js/config";
import {shuffle} from "common/js/util";
import {saveSearch, deleteSearch, clearSearch, savePlay, saveFavorite, deleteFavorite} from "common/js/cache";


function findIndex(list, song) {
    return list.findIndex((item) => {
        return item.id === song.id
    })
}

//提交这些mutation
export const selectPlay = function ({commit, state}, {list, index}) {
    commit(types.SET_SEQUENCE_LIST, list)
    if(state.mode === playMode.random) {
        let randomList = shuffle(list)
        commit(types.SET_PLAY_LIST, randomList)
        index = findIndex(randomList, list[index])
    }else{
        commit(types.SET_PLAY_LIST, list)
    }

    commit(types.SET_CURRENT, index)
    commit(types.SET_FULL_SCREEN, true)
    commit(types.SET_PLAYING_STATE, false)
    setTimeout(() => {
        commit(types.SET_PLAYING_STATE, true)
    }, 20)
}

export const randomPlay = function ({commit}, {list}) {
    commit(types.SET_PLAY_MODE, playMode.random)  //随机播放
    commit(types.SET_SEQUENCE_LIST, list)

    let randomList = shuffle(list)
    commit(types.SET_PLAY_LIST, randomList)

    commit(types.SET_CURRENT, 0)
    commit(types.SET_FULL_SCREEN, true)
    commit(types.SET_PLAYING_STATE, true)
}

//向歌曲列表中插入搜索选中的歌曲
export const insertSong = function ({commit, state}, song) {
    let playList = state.playList.slice()
    let sequenceList = state.sequenceList.slice()
    let currentIndex = state.currentIndex
    //插入前，记录当前歌曲
    let currentSong = playList[currentIndex]
    //查找当前歌曲播放列表是否含有待插入的歌曲并返回其索引
    let fpIndex = findIndex(playList, song)
    //因为是插入歌曲，所以索引+1
    currentIndex++
    //插入这首歌曲到当前索引
    playList.splice(currentIndex, 0, song)
    //如果歌曲列表已存在这首歌曲，则删掉已有歌曲，并将这首歌曲插入到当前索引
    if(fpIndex > -1) {
        if(currentIndex > fpIndex) {
            playList.splice(fpIndex, 1)
            currentIndex--
        }else {
            playList.splice(fpIndex+1, 1)
        }
    }

    //顺序播放列表插入歌曲的索引
    let currentSIndex = findIndex(sequenceList, currentSong) + 1
    let fsIndex = findIndex(sequenceList, song)

    sequenceList.splice(currentSIndex, 0, song)

    if(fsIndex > -1) {
        if(currentSIndex > fsIndex) {
            sequenceList.splice(fsIndex, 1)
        }else {
            sequenceList.splice(fsIndex+1, 1)
        }
    }


    commit(types.SET_PLAY_LIST, playList)
    commit(types.SET_SEQUENCE_LIST, sequenceList)
    commit(types.SET_CURRENT, currentIndex)
    commit(types.SET_FULL_SCREEN, true)
    commit(types.SET_PLAYING_STATE, false)

    setTimeout(() => {
        commit(types.SET_PLAYING_STATE, true)
    },20)
}

export const saveSearchHistory = function ({commit}, query) {
    commit(types.SET_SEARCH_HISTORY, saveSearch(query))
}

export const deleteSearchHistory = function ({commit}, query) {
    commit(types.SET_SEARCH_HISTORY, deleteSearch(query))
}

export const clearSearchHistory = function ({commit}) {
    commit(types.SET_SEARCH_HISTORY, clearSearch())
}

export const deleteSong = function ({commit, state}, song) {
    let playList = state.playList.slice()
    let sequenceList = state.sequenceList.slice()
    let currentIndex = state.currentIndex

    let pIndex = findIndex(playList, song)
    playList.splice(pIndex, 1)

    let sIndex = findIndex(sequenceList, song)
    sequenceList.splice(sIndex, 1)

    if(currentIndex > pIndex || currentIndex === playList.length) {
        currentIndex--
    }

    commit(types.SET_PLAY_LIST, playList)
    commit(types.SET_SEQUENCE_LIST, sequenceList)
    commit(types.SET_CURRENT, currentIndex)

    if(!playList.length) { //删完所有歌曲后，播放状态置为false
        commit(types.SET_PLAYING_STATE, false)
    }else {
        commit(types.SET_PLAYING_STATE, false)
        setTimeout(() => {
            commit(types.SET_PLAYING_STATE, true)
        }, 20)
    }
}

export const deleteSongList = function ({commit}) {
    commit(types.SET_PLAY_LIST, [])
    commit(types.SET_SEQUENCE_LIST, [])
    commit(types.SET_CURRENT, -1)
    commit(types.SET_PLAYING_STATE, false)
}

//存储播放历史到本地缓存
export const savePlayHistory = function ({commit}, song) {
    commit(types.SET_PLAY_HISTORY, savePlay(song))
}


//收藏状态切换
export const saveFavoriteList = function ({commit}, song) {
    commit(types.SET_FAVORITE_LIST, saveFavorite(song))
}

export const deleteFavoriteList = function ({commit}, song) {
    commit(types.SET_FAVORITE_LIST, deleteFavorite(song))
}