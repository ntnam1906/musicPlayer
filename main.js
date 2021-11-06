const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = "F8_NTN_PLAYER";

const cd = $('.cd');
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const playBtn = $('.btn-toggle-play');
const player = $('.player');
const progress = $('#progress');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const playlist = $('.playlist');



const app = {
    currentIndex: 0,
    isPlaying : false,
    isRandom : false,
    isRepeat : false,
    config: JSON.parse(localStorage.getItem("PLAYER_STORAGE_KEY")) || {},
    setConfig: function (key, value) {
        this.config[key] = value;
        localStorage.setItem("PLAYER_STORAGE_KEY", JSON.stringify(this.config));
    },
    // Bài hát //
    songs: [
    {
        name: "Summertime",
        singer: "K-391",
        path: "./assets/music/Song7.mp3",
        image: "./assets/image/Song7.jpg",
    },
    {
        name: "Lạnh Lẽo",
        singer: "Aska Yang",
        path: "./assets/music/Song2.mp3",
        image: "./assets/image/Song2.jpg",
    },
    {
        name: "Mình cùng nhau đóng băng",
        singer: "Thùy Chi",
        path: "./assets/music/Song3.mp3",
        image: "./assets/image/Song3.jpg",
    },
    {
        name: "My Love",
        singer: "Westlife",
        path: "./assets/music/Song4.mp3",
        image: "./assets/image/Song4.jpg",
    },
    {
        name: "Axel F",
        singer: "Crazy Frog",
        path: "./assets/music/Song1.mp3",
        image: "./assets/image/Song1.jpg",
    },
    {
        name: "Sai người sai thời điểm",
        singer: "Thanh Hưng",
        path: "./assets/music/Song6.mp3",
        image: "./assets/image/Song6.jpg",
    },
    {
        name: "Nevada",
        singer: "Victone",
        path: "./assets/music/Song5.mp3",
        image: "./assets/image/Song5.jpg",
    },
    {
        name: "Sunshine in the rain",
        singer: "Ryan Farish",
        path: "./assets/music/Song8.mp3",
        image: "./assets/image/Song8.jpg",
    },
    {
        name: "The Fat Rat",
        singer: "Xenogenesis",
        path: "./assets/music/Song9.mp3",
        image: "./assets/image/Song9.jpg",
    },
    {
        name: "What is Love",
        singer: "Lost Frequencies",
        path: "./assets/music/Song10.mp3",
        image: "./assets/image/Song10.jpg",
    },],
    render: function() {
        const htmls = this.songs.map((song, index) => {
            return `
                <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                    <div class="thumb"
                        style="background-image: url(${song.image})">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>  
            `
        })
        playlist.innerHTML = htmls.join('');
    },
    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex];
            }
        })
    },
    
    handleEvents: function() {
        const cdWidth = cd.offsetWidth;

        //Xử lý CD quay / dừng
        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)'}
        ], {
            duration: 10000, //10 seconds
            iterations: Infinity
        })
        cdThumbAnimate.pause()

        // Xử lý phóng to / thu nhỏ CD
        document.onscroll = function() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newWidth = cdWidth - scrollTop

            cd.style.width = newWidth > 0 ? newWidth + 'px' : 0;
            cd.style.opacity = newWidth / cdWidth;
        }

        // Xử lý khi click play
        playBtn.onclick = function() {
            if(app.isPlaying) {
                audio.pause();
            }
            else {
                audio.play();
            }
        }

        // Khi song được play
        audio.onplay = function() {
            app.isPlaying = true;
            player.classList.add('playing');
            cdThumbAnimate.play();
        }

        // Khi song đang pause
        audio.onpause = function() {
            app.isPlaying = false;
            player.classList.remove('playing');
            cdThumbAnimate.pause();
        }

        // Khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function() {
            if(audio.duration) {
                let progressPercent = Math.floor((audio.currentTime / audio.duration) * 100)
                progress.value = progressPercent
            }
        } 
        
        //Xử lý khi tua
        progress.onchange = function(e){
            let seekTime = (e.target.value * audio.duration) / 100;
            audio.currentTime = seekTime;
        }

        // Khi next song
        nextBtn.onclick = function() {
            if(app.isRandom) {
                app.playRandomSong();
            }else {
                app.nextSong()
            }
            audio.play();
            app.render();
            app.scrollToActiveSong()
        }

        // Khi prev song
        prevBtn.onclick = function() {
            if(app.isRandom) {
                app.playRandomSong();
            }else {
                app.prevSong()
            }
            audio.play()
            app.render();
            app.scrollToActiveSong()
        }

        // Random
        randomBtn.onclick = function() {
            app.isRandom = !app.isRandom;
            app.setConfig("isRandom", app.isRandom);
            randomBtn.classList.toggle('active',app.isRandom)
        }

        // Repeat
        repeatBtn.onclick = function() {
            app.isRepeat = !app.isRepeat
            app.setConfig("isRepeat", app.isRepeat);
            repeatBtn.classList.toggle('active',app.isRepeat)
        }

        // Xử lý next song khi audio ended
        audio.onended = function() {
            if(app.isRepeat) {
                audio.play()
            }else {
                nextBtn.click()
            }
        }

        // Lắng nghe click vào playlist
        playlist.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active');
            if(songNode || !e.target.closest('.option')) {
                // Xử lý click vào song
                if(songNode) {
                    app.currentIndex = Number(songNode.dataset.index);
                    app.loadCurrentSong()
                    audio.play()
                    app.render()
                }

                //Xử lý khi click vào Song Option
            }
        }
    },
    scrollToActiveSong: function() {
        setTimeout(() => {
            if(this.currentIndex < 3) {
                $('.song.active').scrollIntoView({
                behavior: "smooth",
                block: "end"
              })
              }else{
              $('.song.active').scrollIntoView({
                behavior: "smooth",
                block: "nearest"
              })
            }
        }, 500)
    },
    loadCurrentSong: function() {

        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path

    },
    nextSong: function() {
        this.currentIndex++
        if(this.currentIndex >= this.songs.length ){
            this.currentIndex = 0
        }
        this.loadCurrentSong()
    },
    prevSong: function() {
        this.currentIndex--
        if(this.currentIndex < 0){
            this.currentIndex = this.songs.length - 1
        }
        this.loadCurrentSong()
    },
    playRandomSong: function() {
        let newIndex 
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while(this.currentIndex === newIndex)

        this.currentIndex = newIndex
        this.loadCurrentSong();
    },
    start: function() {
        // Định nghĩa các thuộc tính cho object
        this.defineProperties()

        // Lắng nghe / xử lý các sự kiện(DOM events)
        this.handleEvents()

        // Tải thông tin bài hát đầu tiên vào UI khi chạy
        this.loadCurrentSong()

        // Render Playlist
        this.render()
    }
}

app.start();