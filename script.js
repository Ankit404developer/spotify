const audioPlayer = document.getElementById('audioPlayer');
let currentSong = null;
let isPlaying = false;

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    loadLibrary();
    setupEventListeners();
});

function setupEventListeners() {
    // Progress bar click handler
    document.querySelector('.progress-container').addEventListener('click', (e) => {
        const rect = e.target.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        audioPlayer.currentTime = pos * audioPlayer.duration;
    });
}

// Upload Form Handling
function showUploadForm() {
    document.getElementById('uploadForm').style.display = 'block';
}

function hideUploadForm() {
    document.getElementById('uploadForm').style.display = 'none';
    document.getElementById('uploadForm').reset();
}

// Song Upload Logic
function uploadSong() {
    const songTitle = document.getElementById('songTitle').value.trim();
    const songArtist = document.getElementById('songArtist').value.trim();
    const songFile = document.getElementById('songFile').files[0];
    const coverImage = document.getElementById('coverImage').files[0];

    if (!songTitle || !songArtist || !songFile || !coverImage) {
        alert('Please fill all fields');
        return;
    }

    const song = {
        id: Date.now(),
        title: songTitle,
        artist: songArtist,
        audioUrl: URL.createObjectURL(songFile),
        coverUrl: URL.createObjectURL(coverImage)
    };

    saveSongToLibrary(song);
    hideUploadForm();
    loadLibrary();
}

function saveSongToLibrary(song) {
    const library = JSON.parse(localStorage.getItem('library') || '[]');
    library.push(song);
    localStorage.setItem('library', JSON.stringify(library));
}

// Library Management
function loadLibrary() {
    const library = JSON.parse(localStorage.getItem('library') || '[]');
    const libraryDiv = document.getElementById('library');
    libraryDiv.innerHTML = '';

    library.forEach(song => {
        const songCard = document.createElement('div');
        songCard.className = 'song-card';
        songCard.innerHTML = `
            <img src="${song.coverUrl}" alt="${song.title}">
            <h3>${song.title}</h3>
            <p>${song.artist}</p>
        `;
        songCard.addEventListener('click', () => playSong(song));
        libraryDiv.appendChild(songCard);
    });
}

// Audio Playback Control
function playSong(song) {
    if (currentSong?.id === song.id) {
        togglePlay();
        return;
    }

    currentSong = song;
    audioPlayer.src = song.audioUrl;
    audioPlayer.play();
    isPlaying = true;
    updatePlayerDisplay();
}

function togglePlay() {
    if (isPlaying) {
        audioPlayer.pause();
    } else {
        audioPlayer.play();
    }
    isPlaying = !isPlaying;
    updatePlayButton();
}

// UI Updates
function updatePlayerDisplay() {
    document.getElementById('currentSongTitle').textContent = 
        `${currentSong.title} - ${currentSong.artist}`;
    document.querySelector('.player-cover').src = currentSong.coverUrl;
}

function updatePlayButton() {
    const playButton = document.querySelector('.play-button i');
    playButton.className = isPlaying ? 'fas fa-pause' : 'fas fa-play';
}

// Progress Updates
audioPlayer.addEventListener('timeupdate', () => {
    const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    document.querySelector('.progress').style.width = `${progress}%`;
    updateTimeDisplay();
});

function updateTimeDisplay() {
    const currentTime = formatTime(audioPlayer.currentTime);
    const duration = formatTime(audioPlayer.duration);
    document.querySelector('.time-display').textContent = 
        `${currentTime} / ${duration}`;
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Handle audio end
audioPlayer.addEventListener('ended', () => {
    playNextSong();
});

function playNextSong() {
    const library = JSON.parse(localStorage.getItem('library') || '[]');
    const currentIndex = library.findIndex(song => song.id === currentSong.id);
    const nextIndex = (currentIndex + 1) % library.length;
    playSong(library[nextIndex]);
}
