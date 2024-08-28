let currentsong = new Audio();
let Song;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSong(folder){
    currFolder = folder;
    // let a = await fetch(`http://127.0.0.1:5500/${folder}/`)
    let a = await fetch(`/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    Song = []
    for(let i=0;i<as.length;i++){
        const element = as[i];
        if(element.href.endsWith(".mp3")){
            Song.push(element.href.split(`/${folder}/`)[1]);
        }  
    }
    // show all the songs in the playlist
    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for(const song of Song){
        songUL.innerHTML = songUL.innerHTML + `<li> 
                <img class="invert" src="img/music.svg" alt="">
                    <div class="info">
                        <div>${song.replaceAll("%20"," ")}</div>
                        <div></div>
                    </div>
                    <div class="playbtn"><p>Play Now</p>
                        <img class="invert" src="img/play.svg" alt="">
                    </div> </li>`;
    }

    // attach an event listener to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e=>{
        e.addEventListener("click",element=>{
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
        
    })
    return Song
}

const playMusic = (track,pause=false)=>{
    
    // let audio = new Audio("/Song/" + track)
    currentsong.src = `/${currFolder}/` + track
    if(!pause){
        currentsong.play()
        play.src = "img/pause.svg"
    }    
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

async function displayAlbum() {
    let a = await fetch(`http://127.0.0.1:5500/Song/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    Array.from(anchors).forEach(async e=>{
        // console.log(e.href)
        if(e.href.includes("/Song")){
            let folder = e.href.split("/").slice(-2)[1]
            // Get the metadata of the folder
            let a = await fetch(`https://127.0.0.1:5500/${folder}/info.json`)
            let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="Others" class="card ">
                        <svg class="play" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="40" height="40">
                            <circle cx="32" cy="32" r="32" fill="green"/>
                            <polygon points="24,18 24,46 46,32" fill="black" transform="translate()) scale(0.9)"/>
                          </svg>
                        <img aria-hidden="false" draggable="false" loading="lazy" src="/Song/${folder}/cover.jpg" data-testid="card-image" alt="" class="mMx2LUixlnN_Fu45JpFB yMQTWVwLJ5bV8VGiaqU3 Yn2Ei5QZn19gria6LjZj">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`
        }
    })
}

async function main(){
    
    // get the list of all elements
    await getSong("Song/Alan_Walker")
    playMusic(Song[0],true)

    // Display all the albums on the page
    displayAlbum()

    // attach an event listener to song buttons
    play.addEventListener("click", ()=>{
        if(currentsong.paused){
            currentsong.play()
            play.src = "img/pause.svg"
        }
        else{
            currentsong.pause()
            play.src = "img/play.svg"
        }
    })

    // current song time update and song duration function
    currentsong.addEventListener("timeupdate",() => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentsong.currentTime)}/${secondsToMinutesSeconds(currentsong.duration)}`
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration)*100 + "%"
    })

    // add event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click",e=>{
        let percent = (e.offsetX/e.target.getBoundingClientRect().width)*100
        document.querySelector(".circle").style.left = percent + "%";
        currentsong.currentTime = ((currentsong.duration)*percent)/100
    });

    //  add event listener for hamburger
    document.querySelector("#hamburger").addEventListener("click",()=>{
        document.querySelector(".left").style.left = "0"
    })

     //  add event listener for close button
     document.querySelector(".close").addEventListener("click",()=>{
        document.querySelector(".left").style.left = "-120%"
    })

    // adding event listener to pervious and next buttons
    previous.addEventListener("click",()=>{
        let index = Song.indexOf(currentsong.src.split("/").slice(-1)[0])
        if((index-1) >= 0){
            playMusic(Song[index-1])
        }
    })

    next.addEventListener("click",()=>{
        currentsong.pause()
        let index = Song.indexOf(currentsong.src.split("/").slice(-1)[0])
        if((index+1) < (Song.length)){
            playMusic(Song[index+1])
        }
    })

    // adding event listener to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",e=>{
        currentsong.volume = e.target.value/100
    })

    // load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e=>{
        // console.log(e)
        e.addEventListener("click",async item=>{
            Song = await getSong(`Song/${item.currentTarget.dataset.folder}`)
            playMusic(Song[0]);
        })
    })

    // Add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click",e=>{
        if(e.target.src.includes("img/volume.svg")){
            e.target.src = e.target.src.replace("img/volume.svg","img/mute.svg")
            currentsong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = e.target.src.replace("img/mute.svg","img/volume.svg")
            currentsong.volume = .1;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10
        }
    })


}

main()