'use strict';

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const audioPlayer = document.getElementById('audioPlayer');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const progressBar = document.getElementById('progressBar');
    const volumeSlider = document.getElementById('volumeSlider');
    const currentTimeSpan = document.getElementById('currentTime');
    const durationSpan = document.getElementById('duration');
    const nowPlayingTitle = document.getElementById('nowPlayingTitle');
    const nowPlayingArtist = document.getElementById('nowPlayingArtist');
    const playlistElement = document.getElementById('playlist');
    const addTrackForm = document.getElementById('addTrackForm');
    const errorContainer = document.getElementById('errorContainer');

    // State
    let playlist = [];
    let currentTrackIndex = -1;
    let isPlaying = false;

    // Initialize with some demo tracks
    const demoTracks = [
        {
            id: 1,
            title: 'Demo Track 1',
            artist: 'Artist 1',
            src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
        },
        {
            id: 2,
            title: 'Demo Track 2',
            artist: 'Artist 2',
            src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
        }
    ];

    // Load demo tracks
    playlist = [...demoTracks];
    renderPlaylist();

    // Utility Functions
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    function showError(message) {
        errorContainer.textContent = message;
        errorContainer.classList.remove('hidden');
        setTimeout(() => {
            errorContainer.classList.add('hidden');
        }, 5000);
    }

    // Playlist Management
    function renderPlaylist() {
        playlistElement.innerHTML = '';
        playlist.forEach((track, index) => {
            const li = document.createElement('li');
            li.className = `flex items-center justify-between p-3 ${
                index === currentTrackIndex ? 'bg-purple-100' : 'bg-gray-50'
            } rounded-md`;
            
            li.innerHTML = `
                <div class="flex-1">
                    <h4 class="font-medium">${track.title}</h4>
                    <p class="text-sm text-gray-600">${track.artist}</p>
                </div>
                <div class="flex items-center space-x-2">
                    ${index > 0 ? `
                        <button class="move-up text-gray-600 hover:text-purple-600 p-1">
                            <i class="fas fa-arrow-up"></i>
                        </button>
                    ` : ''}
                    ${index < playlist.length - 1 ? `
                        <button class="move-down text-gray-600 hover:text-purple-600 p-1">
                            <i class="fas fa-arrow-down"></i>
                        </button>
                    ` : ''}
                    <button class="play-track text-gray-600 hover:text-purple-600 p-1">
                        <i class="fas fa-play"></i>
                    </button>
                    <button class="remove-track text-gray-600 hover:text-red-600 p-1">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;

            // Event Listeners for playlist item buttons
            li.querySelector('.play-track')?.addEventListener('click', () => playTrack(index));
            li.querySelector('.remove-track')?.addEventListener('click', () => removeTrack(index));
            li.querySelector('.move-up')?.addEventListener('click', () => moveTrack(index, 'up'));
            li.querySelector('.move-down')?.addEventListener('click', () => moveTrack(index, 'down'));

            playlistElement.appendChild(li);
        });
    }

    function addTrack(title, artist, src) {
        const newTrack = {
            id: Date.now(),
            title,
            artist,
            src
        };
        playlist.push(newTrack);
        renderPlaylist();
    }

    function removeTrack(index) {
        playlist.splice(index, 1);
        if (currentTrackIndex === index) {
            stopPlayback();
        } else if (currentTrackIndex > index) {
            currentTrackIndex--;
        }
        renderPlaylist();
    }

    function moveTrack(index, direction) {
        if (direction === 'up' && index > 0) {
            [playlist[index], playlist[index - 1]] = [playlist[index - 1], playlist[index]];
            if (currentTrackIndex === index) currentTrackIndex--;
            else if (currentTrackIndex === index - 1) currentTrackIndex++;
        } else if (direction === 'down' && index < playlist.length - 1) {
            [playlist[index], playlist[index + 1]] = [playlist[index + 1], playlist[index]];
            if (currentTrackIndex === index) currentTrackIndex++;
            else if (currentTrackIndex === index + 1) currentTrackIndex--;
        }
        renderPlaylist();
    }

    // Playback Controls
    function loadTrack(index) {
        if (index >= 0 && index < playlist.length) {
            currentTrackIndex = index;
            const track = playlist[currentTrackIndex];
            audioPlayer.src = track.src;
            nowPlayingTitle.textContent = track.title;
            nowPlayingArtist.textContent = track.artist;
            renderPlaylist();
        }
    }

    function playTrack(index) {
        if (currentTrackIndex !== index) {
            loadTrack(index);
        }
        audioPlayer.play()
            .then(() => {
                isPlaying = true;
                updatePlayPauseButton();
            })
            .catch(error => {
                showError('Error playing track: ' + error.message);
            });
    }

    function stopPlayback() {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
        isPlaying = false;
        currentTrackIndex = -1;
        nowPlayingTitle.textContent = 'No track selected';
        nowPlayingArtist.textContent = '-';
        updatePlayPauseButton();
    }

    function updatePlayPauseButton() {
        const icon = playPauseBtn.querySelector('i');
        icon.className = isPlaying ? 'fas fa-pause text-2xl' : 'fas fa-play text-2xl';
    }

    // Event Listeners
    playPauseBtn.addEventListener('click', () => {
        if (currentTrackIndex === -1 && playlist.length > 0) {
            playTrack(0);
        } else if (isPlaying) {
            audioPlayer.pause();
            isPlaying = false;
        } else {
            audioPlayer.play()
                .then(() => {
                    isPlaying = true;
                })
                .catch(error => {
                    showError('Error playing track: ' + error.message);
                });
        }
        updatePlayPauseButton();
    });

    prevBtn.addEventListener('click', () => {
        if (currentTrackIndex > 0) {
            playTrack(currentTrackIndex - 1);
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentTrackIndex < playlist.length - 1) {
            playTrack(currentTrackIndex + 1);
        }
    });

    volumeSlider.addEventListener('input', (e) => {
        audioPlayer.volume = e.target.value / 100;
    });

    audioPlayer.addEventListener('timeupdate', () => {
        const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progressBar.style.width = `${progress}%`;
        currentTimeSpan.textContent = formatTime(audioPlayer.currentTime);
    });

    audioPlayer.addEventListener('loadedmetadata', () => {
        durationSpan.textContent = formatTime(audioPlayer.duration);
    });

    audioPlayer.addEventListener('ended', () => {
        if (currentTrackIndex < playlist.length - 1) {
            playTrack(currentTrackIndex + 1);
        } else {
            stopPlayback();
        }
    });

    addTrackForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('trackTitle').value;
        const artist = document.getElementById('trackArtist').value;
        const url = document.getElementById('trackUrl').value;

        try {
            new URL(url);
            addTrack(title, artist, url);
            e.target.reset();
        } catch (error) {
            showError('Please enter a valid URL');
        }
    });

    // Error handling for audio element
    audioPlayer.addEventListener('error', () => {
        showError('Error loading audio file. Please check the URL and try again.');
        stopPlayback();
    });
});
