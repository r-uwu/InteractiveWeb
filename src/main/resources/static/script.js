document.addEventListener('DOMContentLoaded', () => {
    const carousel = document.getElementById('carousel');
    const overlay = document.getElementById('overlay');

    const TOTAL_CARDS = 20;
    const CARD_WIDTH = 280;
    const ROTATION_SPEED = 0.03;
    const LIVE_RANGE = 2;

    /* Project metadata array */
    const projectData = [
        { title: "삐약이 간식 시간", url: "Interactive-1.html", isReady: true },
        { title: "Kinetic Mesh Interactive", url: "Interactive-2.html", isReady: true },
        { title: "", url: "Interactive-3.html", isReady: true },
        { title: "", url: "Interactive-4.html", isReady: true },
        { title: "", url: "Interactive-5.html", isReady: true },
        { title: "Upcoming Interactive 6", url: "", isReady: false }
    ];

    const theta = 360 / TOTAL_CARDS;
    const radius = Math.round((CARD_WIDTH / 2) / Math.tan(Math.PI / TOTAL_CARDS));

    let rotationAngle = 0;
    let isPaused = false;
    let animationFrameId;

    const cardElements = [];

    for (let i = 0; i < TOTAL_CARDS; i++) {
        const cardAngle = theta * i;

        /* Apply project data or default to 'Coming Soon' if index exceeds array length */
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

        card.addEventListener('mouseenter', () => isPaused = true);
        card.addEventListener('mouseleave', () => isPaused = false);

        carousel.appendChild(card);
        cardElements.push(card);
    }

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
            /* Skip iframe injection logic for unready cards */
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

    function animate() {
        if (!isPaused) {
            rotationAngle -= ROTATION_SPEED;
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