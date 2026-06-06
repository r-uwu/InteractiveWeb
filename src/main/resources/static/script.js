document.addEventListener('DOMContentLoaded', () => {
    const carousel = document.getElementById('carousel');
    const overlay = document.getElementById('overlay');

    const TOTAL_CARDS = 30;
    const CARD_WIDTH = 280;
    const BASE_SPEED = 0.03;
    const LIVE_RANGE = 2;

    /* Project Data setup omitted for brevity, assume projectData array exists here */
    const projectData = [
        { title: "삐약이 간식 시간", url: "Interactive-1.html", isReady: true },
        { title: "Kinetic Mesh", url: "Interactive-2.html", isReady: true },
        { title: "절차적 섬 생성기", url: "Interactive-3.html", isReady: true },
        { title: "대규모 파동 간섭", url: "Interactive-4.html", isReady: true },
        { title: "프랙탈 나무", url: "Interactive-5.html", isReady: true },
        { title: "복셀 아트", url: "Interactive-6.html", isReady: true },
        { title: "오로라 우주 파티클 심포니", url: "Interactive-7.html", isReady: true },
        { title: "네트워크 포폴로지", url: "Interactive-8.html", isReady: true },
        { title: "WARP SPACE", url: "Interactive-9.html", isReady: true },
        { title: "NEON DRIVE", url: "Interactive-10.html", isReady: true },
        { title: "바람", url: "Interactive-11.html", isReady: true },
        { title: "심연의 은하계", url: "Interactive-12.html", isReady: true },
        { title: "액체 금속 메타볼", url: "Interactive-13.html", isReady: true },
        { title: "3D 파티클 피아노", url: "Interactive-14.html", isReady: true },
        { title: "원소 입자 샌드박스", url: "Interactive-15.html", isReady: true },

        { title: "Upcoming Interactive", url: "", isReady: false }
    ];

    const theta = 360 / TOTAL_CARDS;
    const radius = Math.round((CARD_WIDTH / 2) / Math.tan(Math.PI / TOTAL_CARDS));

    let rotationAngle = 0;

    /* Variables for robust playback control */
    let speedMultiplier = 1;
    let isManuallyPaused = false;
    let isHoverPaused = false;
    let animationFrameId;

    const cardElements = [];

    /* Control DOM Elements */
    const btnPrev = document.getElementById('btn-prev');
    const btnPlay = document.getElementById('btn-play');
    const btnNext = document.getElementById('btn-next');
    const iconPause = document.getElementById('icon-pause');
    const iconPlay = document.getElementById('icon-play');

    /* Card Generation Loop */
    for (let i = 0; i < TOTAL_CARDS; i++) {
        const cardAngle = theta * i;
        const project = projectData[i] || { title: `Project ${i + 1}`, isReady: false };

        const card = document.createElement('div');
        card.className = 'card';
        if (!project.isReady) card.classList.add('not-ready');

        card.dataset.index = i;
        card.dataset.isReady = project.isReady;
        if (project.isReady) card.dataset.src = project.url;

        card.style.transform = `rotateY(${cardAngle}deg) translateZ(${radius}px)`;

        if (project.isReady) {
            card.innerHTML = `
                <div class="card-content">
                    <div class="loading-placeholder">
                        <div class="spinner"></div>
                        <span>Loading Live Preview...</span>
                    </div>
                    <div class="iframe-container"></div>
                    <div class="text-content">
                        <h3>${project.title}</h3>
                    </div>
                </div>
            `;
            card.addEventListener('click', () => handleCardClick(project.url));
        } else {
            card.innerHTML = `
                <div class="card-content coming-soon">
                    <div class="coming-soon-content">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lock-icon">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                        <h3>${project.title}</h3>
                        <span class="wait-text">아직 준비중입니다<br>기대해주세요!</span>
                    </div>
                </div>
            `;
        }

        /* Update hover logic to use specific hover state */
        card.addEventListener('mouseenter', () => isHoverPaused = true);
        card.addEventListener('mouseleave', () => isHoverPaused = false);

        carousel.appendChild(card);
        cardElements.push(card);
    }

    /* Playback Control Logic */
    function updatePlayIcon() {
        if (isManuallyPaused) {
            iconPause.style.display = 'none';
            iconPlay.style.display = 'block';
        } else {
            iconPause.style.display = 'block';
            iconPlay.style.display = 'none';
        }
    }

    function updateSpeedButtonUI() {
        btnPrev.classList.toggle('active-speed', speedMultiplier === -4);
        btnNext.classList.toggle('active-speed', speedMultiplier === 4);
    }

    btnPlay.addEventListener('click', () => {
        isManuallyPaused = !isManuallyPaused;

        /* Reset to 1x speed if unpaused from a fast forward/rewind state */
        if (!isManuallyPaused && speedMultiplier !== 1 && speedMultiplier !== -1) {
            speedMultiplier = speedMultiplier > 0 ? 1 : -1;
        }

        updatePlayIcon();
        updateSpeedButtonUI();
    });

    btnPrev.addEventListener('click', () => {
        /* Toggle logic: Normal Reverse (-1) -> Fast Reverse (-4) -> Normal Reverse (-1) */
        if (speedMultiplier > 0) {
            speedMultiplier = -1;
        } else if (speedMultiplier === -1) {
            speedMultiplier = -4;
        } else {
            speedMultiplier = -1;
        }
        isManuallyPaused = false;
        updatePlayIcon();
        updateSpeedButtonUI();
    });

    btnNext.addEventListener('click', () => {
        /* Toggle logic: Normal Forward (1) -> Fast Forward (4) -> Normal Forward (1) */
        if (speedMultiplier < 0) {
            speedMultiplier = 1;
        } else if (speedMultiplier === 1) {
            speedMultiplier = 4;
        } else {
            speedMultiplier = 1;
        }
        isManuallyPaused = false;
        updatePlayIcon();
        updateSpeedButtonUI();
    });

    /* Live Iframe Update Logic */
    function updateLiveIframes() {
        let centerIndex = Math.round((-rotationAngle % 360) / theta);

        if (centerIndex < 0) centerIndex += TOTAL_CARDS;
        if (centerIndex >= TOTAL_CARDS) centerIndex -= TOTAL_CARDS;

        const liveIndices = new Set();
        for (let i = -LIVE_RANGE; i <= LIVE_RANGE; i++) {
            let index = (centerIndex + i) % TOTAL_CARDS;
            if (index < 0) index += TOTAL_CARDS;
            liveIndices.add(index);
        }

        cardElements.forEach((card, idx) => {
            if (card.dataset.isReady !== "true") return;

            const container = card.querySelector('.iframe-container');
            const placeholder = card.querySelector('.loading-placeholder');
            const hasIframe = container.querySelector('iframe') !== null;

            if (liveIndices.has(idx)) {
                if (!hasIframe) {
                    const iframe = document.createElement('iframe');
                    iframe.src = card.dataset.src;
                    iframe.scrolling = "no";
                    iframe.frameBorder = "0";

                    iframe.onload = () => {
                        placeholder.style.opacity = '0';
                    };
                    container.appendChild(iframe);
                    card.classList.add('is-live');
                }
            } else {
                if (hasIframe) {
                    container.innerHTML = '';
                    placeholder.style.opacity = '1';
                    card.classList.remove('is-live');
                }
            }
        });
    }

    /* Animation Loop */
    function animate() {
        /* Rotate only if neither manually paused nor hovered */
        if (!isManuallyPaused && !isHoverPaused) {
            /* Apply speed multiplier to rotation speed */
            rotationAngle -= (BASE_SPEED * speedMultiplier);
            carousel.style.transform = `translateZ(${-radius}px) rotateY(${rotationAngle}deg)`;
            updateLiveIframes();
        }
        animationFrameId = requestAnimationFrame(animate);
    }

    carousel.style.transform = `translateZ(${-radius}px) rotateY(0deg)`;
    updateLiveIframes();
    animate();

    function handleCardClick(targetUrl) {
        if (overlay.classList.contains('active')) return;
        overlay.classList.add('active');
        setTimeout(() => {
            window.location.href = targetUrl;
        }, 600);
    }
});