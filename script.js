/**
 * SPOTIFY CLONE - FULL OPTIMIZED & DYNAMIC SEARCH
 */

// --- 1. DEĞİŞKENLER VE ELEMENTLER ---
let songs = []; 
let currentSongIndex = 0;
let isPlaying = false;
let isShuffle = false;
let navHistory = ['home']; 
let historyIndex = 0;

// Müzik Çalar Temel Elementleri
const audio = document.getElementById('audio-element');
const fileInput = document.getElementById('file-input');
const playBtn = document.getElementById('play-pause');
const nextBtn = document.getElementById('next');
const prevBtn = document.getElementById('prev');
const progress = document.getElementById('progress');
const progressContainer = document.getElementById('progress-container');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('total-duration');
const volumeSlider = document.getElementById('volume');

// Arama Elementleri
const searchInput = document.getElementById('search-input');
const searchResultsContainer = document.getElementById('search-results-container');
const searchResultsList = document.getElementById('search-results-list');
const defaultSearchContent = document.getElementById('default-search-content');
const searchTitle = document.getElementById('search-query-title');

// Kontrol Butonları
const repeatBtn = document.getElementById('repeat-btn');
const shuffleBtn = document.getElementById('shuffle-btn');

// Navigasyon
const backBtn = document.getElementById('nav-back');
const forwardBtn = document.getElementById('nav-forward');
const topbarSearch = document.getElementById('topbar-search');

const sections = {
    home: document.getElementById('home-section'),
    search: document.getElementById('search-section'),
    library: document.getElementById('library-section'),
    liked: document.getElementById('liked-section')
};

// --- 2. BÖLÜM VE GEZİNTİ YÖNETİMİ ---
function showSection(sectionKey, addToHistory = true) {
    Object.keys(sections).forEach(key => {
        if (sections[key]) sections[key].style.display = (key === sectionKey) ? 'block' : 'none';
    });

    document.querySelectorAll('.menu li').forEach(li => {
        li.classList.remove('active');
        if (li.id === `nav-${sectionKey}`) li.classList.add('active');
    });

    if (topbarSearch) topbarSearch.style.display = (sectionKey === 'search') ? 'flex' : 'none';

    if (addToHistory && navHistory[historyIndex] !== sectionKey) {
        navHistory = navHistory.slice(0, historyIndex + 1);
        navHistory.push(sectionKey);
        historyIndex++;
    }
    updateNavButtonsStatus();
    
    // Geçişte listeleri otomatik tazele
    if (sectionKey === 'liked') updateLikedSongsList();
    if (sectionKey === 'library') updateAllLists();
}

function updateNavButtonsStatus() {
    if(!backBtn || !forwardBtn) return;
    backBtn.style.opacity = historyIndex > 0 ? "1" : "0.3";
    forwardBtn.style.opacity = historyIndex < navHistory.length - 1 ? "1" : "0.3";
}

// Navigasyon Eventleri
document.getElementById('nav-home')?.addEventListener('click', () => showSection('home'));
document.getElementById('nav-search')?.addEventListener('click', () => showSection('search'));
document.getElementById('nav-library')?.addEventListener('click', () => showSection('library'));
document.getElementById('nav-liked')?.addEventListener('click', () => showSection('liked'));

backBtn?.addEventListener('click', () => {
    if (historyIndex > 0) {
        historyIndex--;
        showSection(navHistory[historyIndex], false);
    }
});

forwardBtn?.addEventListener('click', () => {
    if (historyIndex < navHistory.length - 1) {
        historyIndex++;
        showSection(navHistory[historyIndex], false);
    }
});

// --- 3. VERİ VE LİSTELEME ---
fileInput?.addEventListener('change', function(e) {
    const files = e.target.files;
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        songs.push({
            id: Date.now() + i,
            title: file.name.replace(/\.[^/.]+$/, ""),
            artist: "Yerel Dosya",
            url: URL.createObjectURL(file),
            cover: `https://picsum.photos/seed/${Math.random()}/400`,
            liked: false 
        });
    }
    updateAllLists();
    showSection('library');
});

function renderTableRows(songArray) {
    return songArray.map((song) => {
        const realIndex = songs.indexOf(song);
        const isActive = (realIndex === currentSongIndex && isPlaying);
        const heartClass = song.liked ? 'fas fa-heart liked' : 'far fa-heart';
        
        return `
        <tr class="${isActive ? 'active-song-row' : ''}" onclick="playSong(${realIndex})">
            <td>${realIndex + 1}</td>
            <td style="color: ${isActive ? '#1db954' : 'white'}; font-weight: 500;">${song.title}</td>
            <td>${song.artist}</td>
            <td class="action-cell"><i class="${heartClass}" onclick="toggleLike(${realIndex}, event)"></i></td>
            <td>--:--</td>
            <td class="action-cell"><i class="fas fa-ellipsis-h"></i></td>
        </tr>`;
    }).join('');
}

function updateAllLists() {
    const mainList = document.getElementById('song-list');
    const libraryList = document.getElementById('user-songs-list');
    if(mainList) mainList.innerHTML = renderTableRows(songs);
    if(libraryList) {
        libraryList.innerHTML = songs.length > 0 ? 
            `<table class="song-table"><tbody>${renderTableRows(songs)}</tbody></table>` : 
            `<p style="padding:20px; opacity:0.5;">Şarkı bulunamadı.</p>`;
    }
    updateLikedSongsList();
}

// --- 4. ARAMA MOTORU MANTIĞI ---
searchInput?.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();

    if (query.length > 0) {
        const filteredSongs = songs.filter(song => 
            song.title.toLowerCase().includes(query) || 
            song.artist.toLowerCase().includes(query)
        );

        if(defaultSearchContent) defaultSearchContent.style.display = 'none';
        if(searchResultsContainer) searchResultsContainer.style.display = 'block';
        if(searchTitle) searchTitle.innerText = `"${query}" için sonuçlar`;

        if (filteredSongs.length > 0) {
            searchResultsList.innerHTML = renderTableRows(filteredSongs);
        } else {
            searchResultsList.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:40px; opacity:0.5;">Eşleşen şarkı bulunamadı.</td></tr>`;
        }
    } else {
        if(defaultSearchContent) defaultSearchContent.style.display = 'block';
        if(searchResultsContainer) searchResultsContainer.style.display = 'none';
    }
});

// --- 5. OYNATICI KONTROLLERİ ---
function playSong(index) {
    if (!songs[index]) return;
    currentSongIndex = index;
    const song = songs[currentSongIndex];

    document.getElementById('current-title').innerText = song.title;
    document.getElementById('current-artist').innerText = song.artist;
    document.getElementById('current-cover').src = song.cover;

    updateRightPanel(song);

    audio.src = song.url;
    audio.play().catch(err => console.error("Çalma hatası:", err));
    isPlaying = true;
    updatePlayIcon();
    updateAllLists();
    
    // Arama sonuçlarındaysa orayı da güncelle
    if (searchInput && searchInput.value.length > 0) {
        searchInput.dispatchEvent(new Event('input'));
    }
}

function updateRightPanel(songData) {
    const mappings = {
        'panel-track-title': songData.title,
        'panel-main-title': songData.title,
        'panel-main-artist': songData.artist,
        'panel-credit-artist': songData.artist,
        'panel-cover-img': songData.cover
    };
    Object.keys(mappings).forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            if (el.tagName === 'IMG') el.src = mappings[id];
            else el.innerText = mappings[id];
        }
    });
}

function updatePlayIcon() {
    if (playBtn) playBtn.innerHTML = isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
}

playBtn?.addEventListener('click', () => {
    if (songs.length === 0) return;
    isPlaying ? audio.pause() : audio.play();
    isPlaying = !isPlaying;
    updatePlayIcon();
    updateAllLists();
});

nextBtn?.addEventListener('click', () => {
    if (songs.length === 0) return;
    currentSongIndex = isShuffle ? Math.floor(Math.random() * songs.length) : (currentSongIndex + 1) % songs.length;
    playSong(currentSongIndex);
});

prevBtn?.addEventListener('click', () => {
    if (songs.length === 0) return;
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    playSong(currentSongIndex);
});

// --- 6. İLERLEME VE SES ---
audio.addEventListener('timeupdate', () => {
    if (!audio.duration) return;
    const percent = (audio.currentTime / audio.duration) * 100;
    if (progress) progress.style.width = percent + "%";
    if (currentTimeEl) currentTimeEl.innerText = formatTime(audio.currentTime);
    if (durationEl) durationEl.innerText = formatTime(audio.duration);
});

progressContainer?.addEventListener('click', (e) => {
    if (!audio.duration) return;
    audio.currentTime = (e.offsetX / progressContainer.clientWidth) * audio.duration;
});

volumeSlider?.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    audio.volume = val;
    volumeSlider.className = val >= 0.95 ? 'danger' : (val > 0.8 ? 'warning' : '');
});

function formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec < 10 ? '0' + sec : sec}`;
}

// --- 7. EKSTRALAR ---
function toggleLike(index, event) {
    if(event) event.stopPropagation();
    songs[index].liked = !songs[index].liked;
    updateAllLists();
}

function updateLikedSongsList() {
    const container = document.getElementById('liked-songs-list');
    if (!container) return;
    const liked = songs.filter(s => s.liked);
    container.innerHTML = liked.length > 0 ? 
        `<table class="song-table"><tbody>${renderTableRows(liked)}</tbody></table>` : 
        `<div style="text-align:center; opacity:0.5; padding:40px;"><i class="fas fa-heart" style="font-size:40px;"></i><p>Henüz şarkı beğenmedin.</p></div>`;
}

shuffleBtn?.addEventListener('click', () => {
    isShuffle = !isShuffle;
    shuffleBtn.classList.toggle('active', isShuffle);
});

repeatBtn?.addEventListener('click', () => {
    audio.loop = !audio.loop;
    repeatBtn.classList.toggle('active', audio.loop);
});

// Başlat
showSection('home');

function updateDynamicBackground(imgElement) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Resmi canvas'a çiz (küçülterek hızı artırıyoruz)
    canvas.width = 1;
    canvas.height = 1;
    ctx.drawImage(imgElement, 0, 0, 1, 1);
    
    // Tek bir pikselin rengini al
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    const contentArea = document.querySelector('.content');
    
    // Spotify tarzı koyu gradyan uygula
    if (contentArea) {
        contentArea.style.background = `linear-gradient(to bottom, rgba(${r},${g},${b}, 0.5), var(--bg-dark))`;
    }
}

// playSong fonksiyonun içine şu satırı ekle:
// const img = document.getElementById('current-cover');
// img.onload = () => updateDynamicBackground(img);

// Verileri Kaydet
function saveData() {
    const likedSongIds = songs.filter(s => s.liked).map(s => s.id);
    localStorage.setItem('spotify_liked_songs', JSON.stringify(likedSongIds));
    localStorage.setItem('spotify_volume', audio.volume);
}

// Verileri Yükle (Sayfa açılışında çağır)
function loadSavedData() {
    const savedLikes = JSON.parse(localStorage.getItem('spotify_liked_songs') || '[]');
    const savedVolume = localStorage.getItem('spotify_volume');

    songs.forEach(song => {
        if (savedLikes.includes(song.id)) song.liked = true;
    });

    if (savedVolume !== null) {
        audio.volume = savedVolume;
        if(volumeSlider) volumeSlider.value = savedVolume;
    }
    updateAllLists();
}

// toggleLike ve volumeSlider event listener'larının sonuna saveData() ekle.

window.addEventListener('keydown', (e) => {
    // Eğer kullanıcı arama kutusuna yazı yazıyorsa kısayolları durdur
    if (document.activeElement.tagName === 'INPUT') return;

    switch (e.code) {
        case 'Space':
            e.preventDefault(); // Sayfanın aşağı kaymasını engelle
            playBtn.click();
            break;
        case 'ArrowRight':
            audio.currentTime += 10;
            break;
        case 'ArrowLeft':
            audio.currentTime -= 10;
            break;
        case 'KeyM':
            audio.muted = !audio.muted;
            break;
    }
});

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'spotify-toast';
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}

let debounceTimer;
searchInput.oninput = (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => performSearch(e.target.value), 300);
};

// Basit bir görselleştirici kurulumu
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioCtx.createAnalyser();
const source = audioCtx.createMediaElementSource(audio);
source.connect(analyser);
analyser.connect(audioCtx.destination);

analyser.fftSize = 64; // Çubuk sayısı
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

function drawVisualizer() {
    requestAnimationFrame(drawVisualizer);
    analyser.getByteFrequencyData(dataArray);
    // Burada Canvas üzerine dataArray değerlerine göre barlar çizebilirsiniz.
}
function updateWelcomeMessage() {
    const hour = new Date().getHours();
    const welcomeText = document.getElementById('welcome-text');
    
    if (hour >= 5 && hour < 12) welcomeText.innerText = "Günaydın";
    else if (hour >= 12 && hour < 18) welcomeText.innerText = "Tünaydın";
    else if (hour >= 18 && hour < 22) welcomeText.innerText = "İyi Akşamlar";
    else welcomeText.innerText = "İyi Geceler";
}

// Sayfa yüklendiğinde çalıştır
updateWelcomeMessage();

let deferredPrompt;
const installBtn = document.getElementById('nav-install');

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if(installBtn) installBtn.style.display = 'flex';
});

installBtn?.addEventListener('click', async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') deferredPrompt = null;
    }
});