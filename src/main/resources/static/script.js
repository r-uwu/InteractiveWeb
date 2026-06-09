document.addEventListener('DOMContentLoaded', () => {
    const carousel = document.getElementById('carousel');
    const overlay = document.getElementById('overlay');

    const TOTAL_CARDS = 30;
    const CARD_WIDTH = 280;
    const BASE_SPEED = 0.003;
    const LIVE_RANGE = 2;

    let gridObserver;

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
        { title: "포인터 파티클과 잔상", url: "Interactive-16.html", isReady: true },
        { title: "익스트림 블룸", url: "Interactive-17.html", isReady: true },
        { title: "라인 아트", url: "Interactive-18.html", isReady: true },
        { title: "자라나는 트라이앵글", url: "Interactive-19.html", isReady: true },
        { title: "프렉탈 터널2", url: "Interactive-20.html", isReady: true },
        { title: "절차적 행성 생성기", url: "Interactive-21.html", isReady: true },
        { title: "Upcoming Interactive", url: "", isReady: false }
    ];

    const theta = 360 / TOTAL_CARDS;
    const radius = Math.round((CARD_WIDTH / 2) / Math.tan(Math.PI / TOTAL_CARDS));

    let rotationAngle = 0;
    let speedMultiplier = 1;
    let isManuallyPaused = false;
    let isHoverPaused = false;
    let isGridMode = false;
    let lastTime = 0;
    let animationFrameId;
    let savedScrollPosition = 0;

    const cardElements = [];

    const btnPrev = document.getElementById('btn-prev');
    const btnPlay = document.getElementById('btn-play');
    const btnNext = document.getElementById('btn-next');
    const btnGrid = document.getElementById('btn-grid');
    const iconPause = document.getElementById('icon-pause');
    const iconPlay = document.getElementById('icon-play');

    /* Initialize Cards */
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

        card.addEventListener('mouseenter', () => isHoverPaused = true);
        card.addEventListener('mouseleave', () => isHoverPaused = false);

        carousel.appendChild(card);
        cardElements.push(card);
    }

    /* Control Logics */
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
        btnPrev.classList.toggle('active-speed', speedMultiplier < -1);
        btnNext.classList.toggle('active-speed', speedMultiplier > 1);
    }

    function initGridObserver() {
        if (gridObserver) gridObserver.disconnect();
        gridObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const card = entry.target;
                if (card.dataset.isReady !== "true") return;

                const container = card.querySelector('.iframe-container');
                const placeholder = card.querySelector('.loading-placeholder');
                const hasIframe = container.querySelector('iframe') !== null;

                if (entry.isIntersecting) {
                    /* Load iframe when card enters viewport */
                    if (!hasIframe) {
                        const iframe = document.createElement('iframe');
                        iframe.src = card.dataset.src;
                        iframe.scrolling = "no";
                        iframe.frameBorder = "0";

                        iframe.onload = () => {
                            placeholder.style.opacity = '0';
                            setTimeout(() => { placeholder.style.visibility = 'hidden'; }, 300);
                        };

                        /* Fallback for local testing */
                        setTimeout(() => {
                            if (placeholder.style.opacity !== '0') {
                                placeholder.style.opacity = '0';
                                setTimeout(() => { placeholder.style.visibility = 'hidden'; }, 300);
                            }
                        }, 1500);

                        container.appendChild(iframe);
                        card.classList.add('is-live');
                    }
                } else {
                    /* Remove iframe when card leaves viewport to free memory */
                    if (hasIframe) {
                        container.innerHTML = '';
                        placeholder.style.visibility = 'visible';
                        placeholder.style.opacity = '1';
                        card.classList.remove('is-live');
                    }
                }
            });
        }, {
            root: null,
            rootMargin: '200px', /* Pre-load slightly before coming into actual view */
            threshold: 0.1
        });
    }

    btnPlay.addEventListener('click', () => {
        isManuallyPaused = !isManuallyPaused;
        if (!isManuallyPaused && speedMultiplier !== 1 && speedMultiplier !== -1) {
            speedMultiplier = speedMultiplier > 0 ? 1 : -1;
        }
        updatePlayIcon();
        updateSpeedButtonUI();
    });

    btnPrev.addEventListener('click', () => {
        if (speedMultiplier > 0) speedMultiplier = -1;
        else if (speedMultiplier === -1) speedMultiplier = -2;
        else if (speedMultiplier === -2) speedMultiplier = -4;
        else speedMultiplier = -1;

        isManuallyPaused = false;
        updatePlayIcon();
        updateSpeedButtonUI();
    });

    btnNext.addEventListener('click', () => {
        if (speedMultiplier < 0) speedMultiplier = 1;
        else if (speedMultiplier === 1) speedMultiplier = 2;
        else if (speedMultiplier === 2) speedMultiplier = 4;
        else speedMultiplier = 1;

        isManuallyPaused = false;
        updatePlayIcon();
        updateSpeedButtonUI();
    });

    btnGrid.addEventListener('click', () => {
        isGridMode = !isGridMode;

        if (isGridMode) {
            btnGrid.classList.add('active-speed');
            document.body.classList.add('grid-view');

            /* Clear all existing iframes from 3D mode first */
            cardElements.forEach(card => {
                if (card.dataset.isReady === "true") {
                    const container = card.querySelector('.iframe-container');
                    const placeholder = card.querySelector('.loading-placeholder');
                    container.innerHTML = '';
                    placeholder.style.visibility = 'visible';
                    placeholder.style.opacity = '1';
                    card.classList.remove('is-live');
                }
            });

            /* Start Intersection Observer for Grid Mode */
            if (!gridObserver) initGridObserver();
            cardElements.forEach(card => {
                if (card.dataset.isReady === "true") {
                    gridObserver.observe(card);
                }
            });

            requestAnimationFrame(() => {
                window.scrollTo(0, savedScrollPosition);
            });

        } else {
            //현재 그리드 뷰의 스크롤 위치 저장
            savedScrollPosition = window.scrollY;

            btnGrid.classList.remove('active-speed');
            document.body.classList.remove('grid-view');

            window.scrollTo(0, 0);

            /* Stop Observer when returning to 3D mode */
            if (gridObserver) gridObserver.disconnect();

            /* Reset positions for 3D */
            cardElements.forEach((card, i) => {
                card.style.transform = `rotateY(${theta * i}deg) translateZ(${radius}px)`;
            });
            updateLiveIframes();
        }
    });

    /* Live Preview Loader */
    function updateLiveIframes() {
        if (isGridMode) return;

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

                    /* Standard onload trigger */
                    iframe.onload = () => {
                        placeholder.style.opacity = '0';
                        setTimeout(() => { placeholder.style.visibility = 'hidden'; }, 300);
                    };

                    /* Fallback for local CORS blocking */
                    setTimeout(() => {
                        if (placeholder.style.opacity !== '0') {
                            placeholder.style.opacity = '0';
                            setTimeout(() => { placeholder.style.visibility = 'hidden'; }, 300);
                        }
                    }, 1500);

                    container.appendChild(iframe);
                    card.classList.add('is-live');
                }
            } else {
                if (hasIframe) {
                    container.innerHTML = '';
                    placeholder.style.visibility = 'visible';
                    placeholder.style.opacity = '1';
                    card.classList.remove('is-live');
                }
            }
        });
    }

    /* Animation Framework */
    function animate(currentTime) {
        if (!lastTime) lastTime = currentTime;
        const deltaTime = currentTime - lastTime;
        lastTime = currentTime;

        if (!isManuallyPaused && !isHoverPaused && !isGridMode) {
            rotationAngle -= (BASE_SPEED * speedMultiplier * deltaTime);
            carousel.style.transform = `translateZ(${-radius}px) rotateY(${rotationAngle}deg)`;
            updateLiveIframes();
        }
        animationFrameId = requestAnimationFrame(animate);
    }

    carousel.style.transform = `translateZ(${-radius}px) rotateY(0deg)`;
    updateLiveIframes();
    animationFrameId = requestAnimationFrame(animate);

    /* Click and Bfcache Navigation Control */
    function handleCardClick(targetUrl) {
        if (overlay.classList.contains('active')) return;
        overlay.classList.add('active');
        setTimeout(() => {
            window.location.href = targetUrl;
        }, 600);
    }

    window.addEventListener('pageshow', (event) => {
        if (event.persisted) {
            overlay.classList.remove('active');
            isManuallyPaused = false;
            speedMultiplier = 1;
            lastTime = 0;
            updatePlayIcon();
            updateSpeedButtonUI();
        }
    });
});