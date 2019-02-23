import {mapGetters, mapMutations, mapActions} from 'vuex'
import {playMode} from "./config";
import {shuffle} from "./util";
import {deleteFavorite} from "./cache";
import {deleteFavoriteList} from "../../store/actions";

export const playlistMixin = {
    computed: {
        ...mapGetters([
            'playList'
        ])
    },
    mounted() {
        this.handlePlaylist(this.playList)
    },
    activated() {
        this.handlePlaylist(this.playList)
    },
    watch: {
        playList(newVal) {
            this.handlePlaylist(newVal)
        }
    },
    methods: {
        handlePlaylist() {
            throw new Error('component must implement method: handlePlaylist')
        }
    }
}

export const playerMixin = {
    computed: {
        iconMode() {
            return this.mode === playMode.sequence ? 'icon-svg-2' : this.mode === playMode.loop ? 'icon-loop' : 'icon-random'
        },
        ...mapGetters([
            'sequenceList',
            'playList',
            'currentSong',
            'mode',
            'favoriteList'
        ])
    },
    methods: {
        changeMode() {  //切换播放模式
            let mode = (this.mode + 1) % 3;　　　　//点击循环切换
            this.setPlayMode(mode);
            let list = null;
            if(mode === playMode.random){
                list = shuffle(this.sequenceList)
            }else{
                list = this.sequenceList;
            }
            this.resetCurrentIndex(list);  　　//由于playlist 变成随机模式，currentsong是根据currentindex 和playlist 改变的，需要保持currentindex 在随机播放列表的正确位置，以确保当前播放歌曲不变
            this.setPlayList(list);
        },
        resetCurrentIndex(list) {  // 切换列表时保持歌曲不变
            let index = list.findIndex((item) => {
                return item.id === this.currentSong.id
            })
            this.setCurrent(index)
        },
        toggleFavorite(song) {
            if(this.isFavorite(song)) {
                this.deleteFavoriteList(song)
            }else {
                this.saveFavoriteList(song)
            }
        },
        getFavoriteIcon(song) {
            if(this.isFavorite(song)) {
                return 'icon-favorite'
            }else {
                return 'icon-not-favorite'
            }
        },
        isFavorite(song) {
            const index = this.favoriteList.findIndex((item) => {
                return item.id === song.id
            })
            return index > -1
        },
        ...mapMutations({  //通过mutations映射到methods,不能直接在methods里改变state
            setPlayingState: 'SET_PLAYING_STATE',
            setCurrent: 'SET_CURRENT',
            setPlayMode: 'SET_PLAY_MODE',
            setPlayList: 'SET_PLAY_LIST',
            setSequenceList: 'SET_SEQUENCE_LIST'
        }),
        ...mapActions([
            'saveFavoriteList',
            'deleteFavoriteList'
        ])
    }
}


export const searchMixin = {
    data() {
        return {
            query: '',
            refreshDelay: 120
        }
    },
    computed: {
        ...mapGetters([
            'searchHistory'
        ])
    },
    methods: {
        onQueryChange(query) {
            this.query = query
        },
        blurInput() {
            this.$refs.searchBox.blur()
        },
        addQuery(query) {
            this.$refs.searchBox.setQuery(query)
        },
        saveSearch() {
            this.saveSearchHistory(this.query)
        },
        ...mapActions([
            'saveSearchHistory',
            'deleteSearchHistory'
        ])
    }
}
