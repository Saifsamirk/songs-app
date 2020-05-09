const form = document.getElementById('form');
const search = document.getElementById('search');
const result = document.getElementById('result');
const more = document.getElementById('more');
const voice = document.getElementById('voice');
const singersContainer = document.getElementById('singers-container');
const loader = document.getElementById('loader');
const apiURL = 'https://api.lyrics.ovh';

// Initialze the speech recognition service
window.SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

let recognition = new window.SpeechRecognition();

// Capture user speak
function onSpeak(e) {

    const msg = e.results[0][0].transcript;

    search.value = msg;
    searchSongs(msg)

    return msg;
};


// Search by song or artist
async function searchSongs(term) {
    const res = await fetch(`${apiURL}/suggest/${term}`);
    const data = await res.json();

    showData(data);
}

// fetch songs by Artist from Deezer api 
async function songsByArtist() {
    const singers = ["Sia", "Eminem", "Shakira", "Adele"]
    singers.forEach(singer => {
        const res = fetch(`https://deezerdevs-deezer.p.rapidapi.com/artist/${singer}`,
            {
                mode: 'cors', // no-cors, *cors, same-origin,
                headers: {
                    "x-rapidapi-host": "deezerdevs-deezer.p.rapidapi.com",
                    "x-rapidapi-key": "f82cce4d8fmsh993a96224f6e848p18ed25jsn2fc72f5b4448"
                }
            })
            .then(res => res.json())
            .then(singer => {
                const singerEl = document.createElement('div');
                singerEl.classList.add('singer');
                singerEl.innerHTML = `
                    <h2>${singer.name}</h2>
                    <img src="${singer.picture_medium}"/>
                    <span>Number of Fans : <strong>${singer.nb_fan}</strong></span>
                    <span>Number of Albums : <strong>${singer.nb_album}</strong></span>
                `;
                singersContainer.appendChild(singerEl);
            })
    })
}

setTimeout(() => {
    songsByArtist();
    loader.classList.remove('show');
}, 5000);

// Show song and artist in DOM
function showData(data) {
    result.innerHTML = `
    <ul class="songs">
      ${data.data
            .map(
                song => `<li>
      <span><strong>${song.artist.name}</strong> - ${song.title}</span>
      <button class="btn" data-artist="${song.artist.name}" data-songtitle="${song.title}">Get Lyrics</button>
    </li>`
            )
            .join('')}
    </ul>
  `;

    if (data.prev || data.next) {
        more.innerHTML = `
      ${
            data.prev
                ? `<button class="btn" onclick="getMoreSongs('${data.prev}')">Prev</button>`
                : ''
            }
      ${
            data.next
                ? `<button class="btn" onclick="getMoreSongs('${data.next}')">Next</button>`
                : ''
            }
    `;
    } else {
        more.innerHTML = '';
    }
}

// Get prev and next songs
async function getMoreSongs(url) {
    const res = await fetch(`https://cors-anywhere.herokuapp.com/${url}`);
    const data = await res.json();

    showData(data);
}

// Get lyrics for song
async function getLyrics(artist, songTitle) {
    const res = await fetch(`${apiURL}/v1/${artist}/${songTitle}`);
    const data = await res.json();

    const lyrics = data.lyrics.replace(/(\r\n|\r|\n)/g, '<br>');

    result.innerHTML = `<h2><strong>${artist}</strong> - ${songTitle}</h2>
  <span>${lyrics}</span>`;

    more.innerHTML = '';
}

// Event listeners
form.addEventListener('submit', e => {
    e.preventDefault();

    const searchTerm = search.value.trim();

    if (!searchTerm) {
        alert('Please type in a search term');
    } else {
        searchSongs(searchTerm);
    }
});

// Get lyrics button click
result.addEventListener('click', e => {
    const clickedEl = e.target;

    if (clickedEl.tagName === 'BUTTON') {
        const artist = clickedEl.getAttribute('data-artist');
        const songTitle = clickedEl.getAttribute('data-songtitle');

        getLyrics(artist, songTitle);
    }
});

// Speak result 
recognition.addEventListener('result', onSpeak);
voice.addEventListener('click', () => recognition.start());

