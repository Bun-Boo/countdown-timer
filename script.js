class FlipClockTimer {
    constructor() {
        this.timerInterval = null;
        this.currentTime = 0; // in seconds
        this.isRunning = false;
        this.isPaused = false;
        this.currentMode = 'work'; // 'work', 'break', 'longBreak'
        this.sessionCount = 1;
        this.totalSessions = 0;

        // Animation state tracking - simplified
        this.isAnimating = {
            hours: false,
            minutes: false,
            seconds: false
        };

        // Ambient sound system - using Audio elements for better compatibility
        this.audioContext = null;
        this.ambientSounds = {
            rain: { 
                active: false, 
                audio: null,
                urls: [
                    'https://www.soundjay.com/misc/sounds/rain-01.wav',
                    'https://archive.org/download/RainThunder/Rain.ogg'
                ]
            },
            thunder: { 
                active: false, 
                audio: null,
                urls: [
                    'https://www.soundjay.com/misc/sounds/thunder-01.wav',
                    'https://archive.org/download/RainThunder/Thunder.ogg'
                ]
            },
            birds: { 
                active: false, 
                audio: null,
                urls: [
                    'https://www.soundjay.com/misc/sounds/birds-01.wav',
                    'https://archive.org/download/BirdsChirping/Birds.ogg'
                ]
            },
            lofi: { 
                active: false, 
                audio: null,
                urls: [
                    'https://stream.chillhop.com/lofi',
                    'https://www.youtube.com/watch?v=jfKfPfyJRdk', // LoFi Hip Hop Radio
                    'https://radio.lofi.co/lofi'
                ]
            },
            brainwave: { 
                active: false, 
                audio: null,
                frequencies: [8, 10, 12, 14] // Alpha and Beta waves
            }
        };

        // DOM elements
        this.hoursCard = document.getElementById('hours');
        this.minutesCard = document.getElementById('minutes');
        this.secondsCard = document.getElementById('seconds');
        this.currentModeElement = document.getElementById('current-mode');
        this.sessionCountElement = document.getElementById('session-count');
        
        // Control elements
        this.startBtn = document.getElementById('start-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.skipBtn = document.getElementById('skip-btn');
        
        // Settings elements
        this.workTimeInput = document.getElementById('work-time');
        this.breakTimeInput = document.getElementById('break-time');
        this.longBreakTimeInput = document.getElementById('long-break-time');
        this.sessionsBeforeLongBreakInput = document.getElementById('sessions-before-long-break');
        
        // Volume control
        this.volumeSlider = document.getElementById('volume');
        this.volumeValue = document.getElementById('volume-value');
        this.notificationSound = document.getElementById('notification-sound');

        // Popup controls
        this.settingsBtn = document.getElementById('settings-btn');
        this.controlsPanel = document.getElementById('controls-panel');
        this.backdrop = document.getElementById('backdrop');
        this.closeBtn = document.getElementById('close-btn');

        // YouTube popup elements
        this.youtubePopup = document.getElementById('youtube-popup');
        this.youtubeCloseBtn = document.getElementById('youtube-close-btn');
        this.youtubeUrl = document.getElementById('youtube-url');
        this.playYoutubeBtn = document.getElementById('play-youtube-btn');
        this.stopMusicBtn = document.getElementById('stop-music-btn');
        this.currentPlaying = document.getElementById('current-playing');
        this.currentTitle = document.getElementById('current-title');

        // Ambient sound buttons
        this.ambientButtons = {
            rain: document.getElementById('rain-btn'),
            thunder: document.getElementById('thunder-btn'),
            birds: document.getElementById('birds-btn'),
            lofi: document.getElementById('lofi-btn'),
            brainwave: document.getElementById('brainwave-btn')
        };

        // Previous values for animation detection
        this.previousValues = {
            hours: '',
            minutes: '',
            seconds: ''
        };

        this.initializeEventListeners();
        this.initializeAmbientSounds();
        this.resetTimer();
        this.updateDisplay();
        this.initializeCards();
    }

    initializeEventListeners() {
        // Control buttons
        this.startBtn.addEventListener('click', () => this.startTimer());
        this.pauseBtn.addEventListener('click', () => this.pauseTimer());
        this.resetBtn.addEventListener('click', () => this.resetTimer());
        this.skipBtn.addEventListener('click', () => this.skipSession());

        // Settings popup controls
        this.settingsBtn.addEventListener('click', () => this.showSettings());
        this.closeBtn.addEventListener('click', () => this.hideSettings());

        // YouTube popup controls
        this.youtubeCloseBtn.addEventListener('click', () => this.hideYouTubePopup());
        this.playYoutubeBtn.addEventListener('click', () => this.playYouTubeMusic());
        this.stopMusicBtn.addEventListener('click', () => this.stopMusic());
        
        // Suggestion buttons
        document.querySelectorAll('.suggestion-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const url = e.target.getAttribute('data-url');
                this.youtubeUrl.value = url;
                this.playYouTubeMusic();
            });
        });

        // Backdrop click handling
        this.backdrop.addEventListener('click', () => {
            this.hideSettings();
            this.hideYouTubePopup();
        });

        // Volume control
        this.volumeSlider.addEventListener('input', (e) => {
            const volume = e.target.value;
            this.volumeValue.textContent = `${volume}%`;
            this.notificationSound.volume = volume / 100;
        });

        // Settings input validation
        [this.workTimeInput, this.breakTimeInput, this.longBreakTimeInput, this.sessionsBeforeLongBreakInput]
            .forEach(input => {
                input.addEventListener('change', () => {
                    if (!this.isRunning) {
                        this.resetTimer();
                    }
                });
            });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT') return;
            
            switch(e.code) {
                case 'Space':
                    e.preventDefault();
                    if (this.isRunning && !this.isPaused) {
                        this.pauseTimer();
                    } else {
                        this.startTimer();
                    }
                    break;
                case 'KeyR':
                    e.preventDefault();
                    this.resetTimer();
                    break;
                case 'KeyS':
                    e.preventDefault();
                    this.skipSession();
                    break;
                case 'Escape':
                    e.preventDefault();
                    this.hideSettings();
                    this.hideYouTubePopup();
                    break;
                case 'KeyC':
                case 'KeyP':
                    e.preventDefault();
                    this.showSettings();
                    break;
            }
        });

        // Prevent context menu on right click for cleaner look
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }

    showSettings() {
        this.controlsPanel.classList.add('active');
        this.backdrop.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    hideSettings() {
        this.controlsPanel.classList.remove('active');
        this.backdrop.classList.remove('active');
        document.body.style.overflow = '';
    }

    showYouTubePopup() {
        this.youtubePopup.classList.add('active');
        this.backdrop.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    hideYouTubePopup() {
        this.youtubePopup.classList.remove('active');
        this.backdrop.classList.remove('active');
        document.body.style.overflow = '';
    }

    startTimer() {
        if (this.currentTime <= 0) {
            this.resetTimer();
        }

        this.isRunning = true;
        this.isPaused = false;
        this.updateButtonStates();

        this.timerInterval = setInterval(() => {
            this.currentTime--;
            this.updateDisplay();

            if (this.currentTime <= 0) {
                this.timerComplete();
            }
        }, 1000);
    }

    pauseTimer() {
        this.isPaused = true;
        this.isRunning = false;
        clearInterval(this.timerInterval);
        this.updateButtonStates();
    }

    resetTimer() {
        this.isRunning = false;
        this.isPaused = false;
        clearInterval(this.timerInterval);
        
        // Set time based on current mode
        if (this.currentMode === 'work') {
            this.currentTime = parseInt(this.workTimeInput.value) * 60;
        } else if (this.currentMode === 'break') {
            this.currentTime = parseInt(this.breakTimeInput.value) * 60;
        } else if (this.currentMode === 'longBreak') {
            this.currentTime = parseInt(this.longBreakTimeInput.value) * 60;
        }

        this.updateDisplay();
        this.updateButtonStates();
        this.initializeCards();
    }

    skipSession() {
        this.timerComplete();
    }

    timerComplete() {
        this.isRunning = false;
        this.isPaused = false;
        clearInterval(this.timerInterval);
        
        // Play notification sound
        this.playNotification();

        // Show browser notification if supported
        this.showBrowserNotification();

        // Switch modes
        this.switchMode();
        
        this.updateButtonStates();
        this.updateDisplay();
    }

    switchMode() {
        if (this.currentMode === 'work') {
            this.totalSessions++;
            
            // Check if it's time for long break
            const sessionsBeforeLongBreak = parseInt(this.sessionsBeforeLongBreakInput.value);
            if (this.totalSessions % sessionsBeforeLongBreak === 0) {
                this.currentMode = 'longBreak';
                this.currentTime = parseInt(this.longBreakTimeInput.value) * 60;
            } else {
                this.currentMode = 'break';
                this.currentTime = parseInt(this.breakTimeInput.value) * 60;
            }
        } else {
            // From break back to work
            this.currentMode = 'work';
            this.currentTime = parseInt(this.workTimeInput.value) * 60;
            if (this.currentMode === 'work') {
                this.sessionCount++;
            }
        }

        this.updateModeDisplay();
    }

    updateDisplay() {
        const hours = Math.floor(this.currentTime / 3600);
        const minutes = Math.floor((this.currentTime % 3600) / 60);
        const seconds = this.currentTime % 60;

        const formattedHours = hours.toString().padStart(2, '0');
        const formattedMinutes = minutes.toString().padStart(2, '0');
        const formattedSeconds = seconds.toString().padStart(2, '0');

        // Only trigger animation if value actually changed
        if (this.previousValues.hours !== formattedHours) {
            this.updateNumberCard(this.hoursCard, formattedHours, 'hours');
            this.previousValues.hours = formattedHours;
        }

        if (this.previousValues.minutes !== formattedMinutes) {
            this.updateNumberCard(this.minutesCard, formattedMinutes, 'minutes');
            this.previousValues.minutes = formattedMinutes;
        }

        if (this.previousValues.seconds !== formattedSeconds) {
            this.updateNumberCard(this.secondsCard, formattedSeconds, 'seconds');
            this.previousValues.seconds = formattedSeconds;
        }
    }

    updateNumberCard(cardElement, newValue, cardType) {
        const numberElement = cardElement.querySelector('.number');
        const currentValue = numberElement.textContent;
        
        // If already animating, skip to prevent animation conflicts
        if (this.isAnimating[cardType]) {
            numberElement.textContent = newValue;
            return;
        }

        // Only animate when value changes
        if (currentValue !== newValue) {
            this.isAnimating[cardType] = true;
            
            // Add updating class for animation
            cardElement.classList.add('updating');
            
            // Update the number
            numberElement.textContent = newValue;
            
            // Remove animation class after animation completes
            setTimeout(() => {
                cardElement.classList.remove('updating');
                this.isAnimating[cardType] = false;
            }, 600); // Match animation duration
        }
    }

    updateModeDisplay() {
        let modeText = '';
        let modeClass = '';

        switch(this.currentMode) {
            case 'work':
                modeText = 'Chế độ: Làm việc';
                modeClass = 'work-mode';
                break;
            case 'break':
                modeText = 'Chế độ: Nghỉ ngắn';
                modeClass = 'break-mode';
                break;
            case 'longBreak':
                modeText = 'Chế độ: Nghỉ dài';
                modeClass = 'break-mode';
                break;
        }

        this.currentModeElement.textContent = modeText;
        this.currentModeElement.className = `mode-indicator ${modeClass}`;
        this.sessionCountElement.textContent = `Phiên: ${this.sessionCount}`;
    }

    updateButtonStates() {
        if (this.isRunning) {
            this.startBtn.disabled = true;
            this.pauseBtn.disabled = false;
            this.startBtn.textContent = 'Đang chạy...';
        } else if (this.isPaused) {
            this.startBtn.disabled = false;
            this.pauseBtn.disabled = true;
            this.startBtn.textContent = 'Tiếp tục';
        } else {
            this.startBtn.disabled = false;
            this.pauseBtn.disabled = true;
            this.startBtn.textContent = 'Bắt đầu';
        }
    }

    playNotification() {
        if (this.notificationSound.volume > 0) {
            try {
                // Create multiple beep sounds for better notification
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                
                // Create 3 distinct beeps with increasing frequency
                const frequencies = [800, 1000, 1200];
                frequencies.forEach((freq, index) => {
                    setTimeout(() => {
                        const oscillator = audioContext.createOscillator();
                        const gainNode = audioContext.createGain();
                        
                        oscillator.connect(gainNode);
                        gainNode.connect(audioContext.destination);
                        
                        oscillator.frequency.value = freq;
                        oscillator.type = 'sine';
                        
                        gainNode.gain.setValueAtTime(this.notificationSound.volume * 0.3, audioContext.currentTime);
                        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                        
                        oscillator.start(audioContext.currentTime);
                        oscillator.stop(audioContext.currentTime + 0.3);
                    }, index * 250);
                });
            } catch (error) {
                console.log('Audio notification không được hỗ trợ');
            }
        }
    }

    showBrowserNotification() {
        if ('Notification' in window) {
            if (Notification.permission === 'granted') {
                const title = this.currentMode === 'work' ? 'Thời gian nghỉ! 🔔' : 'Thời gian làm việc! 💼';
                const body = this.currentMode === 'work' ? 
                    'Đã hoàn thành một phiên làm việc. Hãy nghỉ ngơi!' : 
                    'Thời gian nghỉ đã kết thúc. Hãy bắt đầu làm việc!';
                
                const notification = new Notification(title, {
                    body: body,
                    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="%23000"/><text x="50" y="60" text-anchor="middle" fill="white" font-size="30">⏰</text></svg>',
                    requireInteraction: false,
                    tag: 'fliqlo-timer'
                });

                // Auto close notification after 5 seconds
                setTimeout(() => {
                    notification.close();
                }, 5000);

                // Close on click and focus window
                notification.onclick = () => {
                    notification.close();
                    window.focus();
                };
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        this.showBrowserNotification();
                    }
                });
            }
        }
    }

    // Utility method to format time for title
    formatTimeForTitle() {
        const hours = Math.floor(this.currentTime / 3600);
        const minutes = Math.floor((this.currentTime % 3600) / 60);
        const seconds = this.currentTime % 60;
        
        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else {
            return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    // Initialize all cards with current time
    initializeCards() {
        const hours = Math.floor(this.currentTime / 3600);
        const minutes = Math.floor((this.currentTime % 3600) / 60);
        const seconds = this.currentTime % 60;

        const formattedHours = hours.toString().padStart(2, '0');
        const formattedMinutes = minutes.toString().padStart(2, '0');
        const formattedSeconds = seconds.toString().padStart(2, '0');

        this.setCardValue(this.hoursCard, formattedHours);
        this.setCardValue(this.minutesCard, formattedMinutes);
        this.setCardValue(this.secondsCard, formattedSeconds);

        // Update previous values
        this.previousValues = {
            hours: formattedHours,
            minutes: formattedMinutes,
            seconds: formattedSeconds
        };
    }

    setCardValue(cardElement, value) {
        const numberElement = cardElement.querySelector('.number');
        numberElement.textContent = value;
    }

    initializeAmbientSounds() {
        // Initialize Web Audio Context for brainwave generation only
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.log('Web Audio không được hỗ trợ');
        }

        // Add event listeners for ambient sound buttons
        Object.keys(this.ambientButtons).forEach(soundType => {
            this.ambientButtons[soundType].addEventListener('click', () => {
                this.toggleAmbientSound(soundType);
            });
        });
    }

    toggleAmbientSound(soundType) {
        const sound = this.ambientSounds[soundType];
        const button = this.ambientButtons[soundType];

        if (soundType === 'lofi') {
            // Special handling for lofi
            if (sound.active) {
                // Stop music if currently playing
                this.stopMusic();
            } else {
                // Show popup to select music
                this.showYouTubePopup();
            }
            return;
        }

        // For other sound types
        if (sound.active) {
            // Stop the sound
            this.stopAmbientSound(soundType);
            button.classList.remove('active');
        } else {
            // Start the sound
            this.startAmbientSound(soundType);
            button.classList.add('active');
        }

        sound.active = !sound.active;
    }

    startAmbientSound(soundType) {
        const sound = this.ambientSounds[soundType];

        if (soundType === 'brainwave') {
            this.createBrainwaveSound();
            return;
        }

        // For other sounds, generate audio
        if (soundType === 'rain') {
            this.createGeneratedRainSound();
        } else if (soundType === 'thunder') {
            this.createGeneratedThunderSound();
        } else if (soundType === 'birds') {
            this.createGeneratedBirdSound();
        }
    }

    stopAmbientSound(soundType) {
        const sound = this.ambientSounds[soundType];
        
        // Handle iframe (lofi)
        if (soundType === 'lofi') {
            const existingFrame = document.getElementById('lofi-frame');
            if (existingFrame) {
                existingFrame.remove();
            }
        }
        
        if (sound.audio) {
            sound.audio.pause();
            sound.audio = null;
        }
        
        if (sound.oscillators) {
            sound.oscillators.forEach(osc => {
                try {
                    osc.stop();
                } catch (e) {
                    // Oscillator might already be stopped
                }
            });
            sound.oscillators = [];
        }

        if (sound.sources) {
            sound.sources.forEach(source => {
                try {
                    source.stop();
                } catch (e) {
                    // Source might already be stopped
                }
            });
            sound.sources = [];
        }
    }

    createGeneratedRainSound() {
        if (!this.audioContext) return;
        
        const sound = this.ambientSounds.rain;
        
        // Resume audio context if suspended
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        // Create continuous white noise for rain
        const bufferSize = this.audioContext.sampleRate * 2;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        
        const whiteNoise = this.audioContext.createBufferSource();
        whiteNoise.buffer = buffer;
        whiteNoise.loop = true;
        
        // Filter for rain-like sound
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1500;
        filter.Q.value = 0.5;
        
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = 0.2;
        
        whiteNoise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        whiteNoise.start();
        
        sound.sources = [whiteNoise];
    }

    createGeneratedThunderSound() {
        if (!this.audioContext) return;
        
        const sound = this.ambientSounds.thunder;
        
        // Resume audio context if suspended
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        const playThunder = () => {
            if (!sound.active) return;
            
            // Low frequency rumble
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(30, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(15, this.audioContext.currentTime + 3);
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.4, this.audioContext.currentTime + 0.2);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 3);
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 3);
            
            // Schedule next thunder (8-25 seconds)
            const nextThunder = Math.random() * 17000 + 8000;
            setTimeout(playThunder, nextThunder);
        };
        
        // Start first thunder after 2-5 seconds
        setTimeout(playThunder, Math.random() * 3000 + 2000);
    }

    createGeneratedBirdSound() {
        if (!this.audioContext) return;
        
        const sound = this.ambientSounds.birds;
        
        // Resume audio context if suspended
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        const playBird = () => {
            if (!sound.active) return;
            
            // Random bird chirp patterns
            const patterns = [
                // Pattern 1: Single chirp
                () => {
                    const freq = 800 + Math.random() * 1200;
                    this.createChirp(freq, 0.15, 0.1);
                },
                // Pattern 2: Double chirp
                () => {
                    const freq = 1000 + Math.random() * 800;
                    this.createChirp(freq, 0.1, 0.08);
                    setTimeout(() => this.createChirp(freq * 1.2, 0.1, 0.08), 100);
                },
                // Pattern 3: Trill
                () => {
                    const baseFreq = 1200 + Math.random() * 600;
                    for (let i = 0; i < 4; i++) {
                        setTimeout(() => {
                            this.createChirp(baseFreq + i * 100, 0.08, 0.06);
                        }, i * 60);
                    }
                }
            ];
            
            // Random pattern
            const pattern = patterns[Math.floor(Math.random() * patterns.length)];
            pattern();
            
            // Schedule next bird sound (1-8 seconds)
            const nextBird = Math.random() * 7000 + 1000;
            setTimeout(playBird, nextBird);
        };
        
        // Start first bird sound after 1-3 seconds
        setTimeout(playBird, Math.random() * 2000 + 1000);
    }

    createChirp(frequency, duration, volume) {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.frequency.linearRampToValueAtTime(frequency * 1.3, this.audioContext.currentTime + duration * 0.3);
        oscillator.frequency.linearRampToValueAtTime(frequency * 0.9, this.audioContext.currentTime + duration);
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    createBrainwaveSound() {
        if (!this.audioContext) return;
        
        const sound = this.ambientSounds.brainwave;
        
        // Resume audio context if suspended
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        // Random frequency from alpha/beta range
        const frequencies = sound.frequencies;
        const beatFreq = frequencies[Math.floor(Math.random() * frequencies.length)];
        const carrierFreq = 200 + Math.random() * 100; // 200-300 Hz carrier
        
        // Left ear
        const oscLeft = this.audioContext.createOscillator();
        const gainLeft = this.audioContext.createGain();
        oscLeft.frequency.value = carrierFreq;
        oscLeft.type = 'sine';
        gainLeft.gain.value = 0.1;
        
        // Right ear (with binaural beat difference)
        const oscRight = this.audioContext.createOscillator();
        const gainRight = this.audioContext.createGain();
        oscRight.frequency.value = carrierFreq + beatFreq;
        oscRight.type = 'sine';
        gainRight.gain.value = 0.1;
        
        // Stereo separation
        const pannerLeft = this.audioContext.createStereoPanner();
        pannerLeft.pan.value = -0.8;
        
        const pannerRight = this.audioContext.createStereoPanner();
        pannerRight.pan.value = 0.8;
        
        oscLeft.connect(gainLeft);
        gainLeft.connect(pannerLeft);
        pannerLeft.connect(this.audioContext.destination);
        
        oscRight.connect(gainRight);
        gainRight.connect(pannerRight);
        pannerRight.connect(this.audioContext.destination);
        
        oscLeft.start();
        oscRight.start();
        
        sound.oscillators = [oscLeft, oscRight];
    }

    playYouTubeMusic() {
        const url = this.youtubeUrl.value.trim();
        if (!url) {
            alert('Vui lòng nhập link YouTube!');
            return;
        }

        const videoId = this.extractYouTubeVideoId(url);
        if (!videoId) {
            alert('Link YouTube không hợp lệ!');
            return;
        }

        // Remove existing iframe if any
        const existingFrame = document.getElementById('lofi-frame');
        if (existingFrame) {
            existingFrame.remove();
        }

        // Create embedded YouTube player
        const iframe = document.createElement('iframe');
        iframe.id = 'lofi-frame';
        iframe.style.display = 'none';
        iframe.style.position = 'absolute';
        iframe.style.left = '-9999px';
        iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}&controls=0`;
        iframe.allow = 'autoplay; encrypted-media';
        iframe.width = '1';
        iframe.height = '1';
        
        document.body.appendChild(iframe);

        // Update UI
        const sound = this.ambientSounds.lofi;
        sound.audio = iframe;
        sound.active = true;
        this.ambientButtons.lofi.classList.add('active');

        // Show current playing info
        this.currentTitle.textContent = this.extractTitleFromUrl(url);
        this.currentPlaying.style.display = 'block';

        // Hide popup
        this.hideYouTubePopup();

        console.log('🎵 Đang phát YouTube music:', url);
    }

    stopMusic() {
        const sound = this.ambientSounds.lofi;
        
        // Remove iframe
        const existingFrame = document.getElementById('lofi-frame');
        if (existingFrame) {
            existingFrame.remove();
        }

        // Update UI
        sound.audio = null;
        sound.active = false;
        this.ambientButtons.lofi.classList.remove('active');
        this.currentPlaying.style.display = 'none';

        // Hide popup
        this.hideYouTubePopup();

        console.log('🛑 Đã dừng nhạc');
    }

    extractYouTubeVideoId(url) {
        // Handle various YouTube URL formats
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
            /youtube\.com\/v\/([^&\n?#]+)/,
            /youtube\.com\/user\/[^\/]+\/[^\/]+\/([^&\n?#]+)/
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1]) {
                return match[1];
            }
        }

        return null;
    }

    extractTitleFromUrl(url) {
        // Try to extract title from URL or use default
        if (url.includes('jfKfPfyJRdk')) return 'Lofi Hip Hop Radio';
        if (url.includes('5qap5aO4i9A')) return 'Chill Lofi Beats';
        if (url.includes('DWcJFNfaw9c')) return 'Study Lofi Music';
        if (url.includes('4xDzrJKXOOY')) return 'Winter Lofi Vibes';
        if (url.includes('MCkOUpeie_M')) return 'Jazz Lofi Cafe';
        
        try {
            // Extract from URL if possible
            const urlObj = new URL(url);
            if (urlObj.searchParams.get('v')) {
                return `YouTube Video (${urlObj.searchParams.get('v').substring(0, 8)}...)`;
            }
        } catch (e) {
            // URL parsing failed, use default
        }
        
        return 'YouTube Music';
    }
}

// Utility functions
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

// Initialize the timer when page loads
document.addEventListener('DOMContentLoaded', () => {
    const timer = new FlipClockTimer();
    
    // Request notification permission on first interaction
    document.addEventListener('click', requestNotificationPermission, { once: true });
    
    // Update page title with countdown
    setInterval(() => {
        if (timer.isRunning) {
            const modeText = timer.currentMode === 'work' ? '💼 Làm việc' : '☕ Nghỉ ngơi';
            document.title = `${timer.formatTimeForTitle()} - ${modeText} | Fliqlo Timer`;
        } else {
            document.title = 'Thời gian đang dừng - Tiếp tục làm việc nào !!!';
        }
    }, 1000);

    // Console help for keyboard shortcuts
    console.log('🔥 Fliqlo Clock - Phím tắt:');
    console.log('Space: Bắt đầu/Tạm dừng timer');
    console.log('R: Đặt lại timer');
    console.log('S: Bỏ qua phiên hiện tại');
    console.log('C/P: Mở cài đặt');
    console.log('Escape: Đóng cài đặt');
    console.log('Double-click: Bật/tắt toàn màn hình');

    // Hide cursor after inactivity for true fullscreen experience
    let cursorTimeout;
    let isControlsOpen = false;
    
    const hideCursor = () => {
        if (!isControlsOpen) {
            document.body.style.cursor = 'none';
        }
    };
    
    const showCursor = () => {
        document.body.style.cursor = '';
        clearTimeout(cursorTimeout);
        cursorTimeout = setTimeout(hideCursor, 3000);
    };

    // Track controls panel state
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.target.classList.contains('controls-panel')) {
                isControlsOpen = mutation.target.classList.contains('active');
                if (isControlsOpen) {
                    document.body.style.cursor = '';
                    clearTimeout(cursorTimeout);
                } else {
                    showCursor(); // Reset cursor timeout
                }
            }
        });
    });

    observer.observe(timer.controlsPanel, { attributes: true, attributeFilter: ['class'] });

    document.addEventListener('mousemove', showCursor);
    document.addEventListener('mousedown', showCursor);
    document.addEventListener('keydown', showCursor);
    
    // Initial cursor hide timeout
    cursorTimeout = setTimeout(hideCursor, 3000);

    // Prevent page refresh on F5 when running
    document.addEventListener('keydown', (e) => {
        if (e.key === 'F5' && timer.isRunning) {
            e.preventDefault();
            console.log('Tránh làm mới trang khi timer đang chạy');
            return false;
        }
    });

    // Handle visibility change - timer continues in background
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && timer.isRunning) {
            console.log('Tab ẩn - timer tiếp tục chạy nền');
        } else if (!document.hidden && timer.isRunning) {
            console.log('Tab hiển thị - timer đang chạy');
        }
    });

    // Fullscreen toggle with double-click
    document.addEventListener('dblclick', (e) => {
        // Don't trigger fullscreen if clicking on controls
        if (e.target.closest('.controls-panel') || e.target.closest('.settings-btn')) {
            return;
        }
        
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log('Không hỗ trợ toàn màn hình:', err);
            });
        } else {
            document.exitFullscreen();
        }
    });

    // Handle fullscreen change
    document.addEventListener('fullscreenchange', () => {
        if (document.fullscreenElement) {
            console.log('Đã vào chế độ toàn màn hình');
        } else {
            console.log('Đã thoát chế độ toàn màn hình');
        }
    });
});

// Prevent selection for cleaner UI
document.addEventListener('selectstart', (e) => {
    e.preventDefault();
});

// Prevent drag for cleaner UI
document.addEventListener('dragstart', (e) => {
    e.preventDefault();
});

// Handle window resize gracefully
window.addEventListener('resize', () => {
    // Force repaint for better responsive behavior
    document.body.style.display = 'none';
    document.body.offsetHeight; // Trigger reflow
    document.body.style.display = '';
});

// Performance optimization - remove console logs in production
if (window.location.protocol === 'https:' || window.location.hostname !== 'localhost') {
    console.log = () => {};
    console.warn = () => {};
    console.error = () => {};
} 