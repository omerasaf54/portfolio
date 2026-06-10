document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.querySelector('.contact-form');
    const statusDiv = document.getElementById('form-status');

    if (contactForm) {
        const savedDraft = JSON.parse(localStorage.getItem('contact_form_draft'));
        if (savedDraft) {
            Object.keys(savedDraft).forEach(key => {
                const field = contactForm.querySelector(`[name="${key}"]`);
                if (field) field.value = savedDraft[key];
            });
        }

        contactForm.addEventListener('input', () => {
            const draft = Object.fromEntries(new FormData(contactForm));
            localStorage.setItem('contact_form_draft', JSON.stringify(draft));
        });

        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = contactForm.querySelector('.submit-btn');
            const originalBtnText = submitBtn.textContent;

            submitBtn.disabled = true;
            submitBtn.textContent = 'Gönderiliyor...';

            const formData = new FormData(contactForm);

            try {
                const response = await fetch('https://formspree.io/f/xaqzbrwv', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
                }

                await new Promise(resolve => setTimeout(resolve, 1500));

                statusDiv.textContent = 'Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağım.';
                statusDiv.className = 'form-status success';
                contactForm.reset();
                localStorage.removeItem('contact_form_draft');
            } catch (error) {
                statusDiv.textContent = 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.';
                statusDiv.className = 'form-status error';
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;

                setTimeout(() => {
                    if (statusDiv.classList.contains('success')) statusDiv.style.display = 'none';
                }, 5000);
            }
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('blog-search');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const blogItems = document.querySelectorAll('.blog-item');

    let activeFilter = 'all';
    let searchQuery = '';

    function filterBlogs() {
        blogItems.forEach(item => {
            const itemTag = item.getAttribute('data-tag');
            const itemTitle = item.getAttribute('data-title') || '';

            const matchesFilter = (activeFilter === 'all' || itemTag === activeFilter);
            const matchesSearch = itemTitle.includes(searchQuery.toLowerCase().trim());

            if (matchesFilter && matchesSearch) item.style.display = 'block';
            else item.style.display = 'none';
        });
    }

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            activeFilter = button.getAttribute('data-filter');
            filterBlogs();
        });
    });

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            filterBlogs();
        });
    }
});

const projectFilterButtons = document.querySelectorAll('.filter-btns .filter-btn');
const projectItems = document.querySelectorAll('.project-card-item');

if (projectFilterButtons.length > 0 && projectItems.length > 0) {
    projectFilterButtons.forEach(button => {
        button.addEventListener('click', () => {
            projectFilterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const selectedFilter = button.getAttribute('data-filter');

            projectItems.forEach(item => {
                const itemTag = item.getAttribute('data-tag');

                if (selectedFilter === 'all' || itemTag === selectedFilter) item.style.display = 'block';
                else item.style.display = 'none';
            });
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    updateSpotifyStatus();
    setInterval(updateSpotifyStatus, 3000);
    
});

async function updateSpotifyStatus() {
    const statusContainer = document.getElementById('spotify-status');
    const avatarImg = document.getElementById('avatar-img');

    const access = "BQAMuAqeAaOorU-gsQXuv0ctAS3-t5Ad_j4EK93GXWiQ_RVNu6RbCJ51NT-SW9Kty2Lh1DfNHTtrRqS4FIlugH9k6--KUEehtvYA5OKeWdwl0R8f4x7lSTDGztTMmUviejoKoJy4GjWFmFcgbVQKI7yA5sPR89U3b_b4OsusZEsZ5SQbOGYa8EixeH9Fq4lBAlbkr-vSJPN9N_aSUmkigxxouzo5AuiWG6sH_r4ggm0mule8z_26upI8V6qdmBAcAyw"; 

    try {
        const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
            headers: {
                'Authorization': `Bearer ${access}`
            }
        });

        if (response.status === 204) {
            setSpotifyOffline(statusContainer, avatarImg);
            return;
        }

        if (!response.ok) {
            throw new Error('Spotify API hatası.');
        }

        const data = await response.json();

        if (data && data.is_playing && data.currently_playing_type === "track") {
            const songName = data.item.name;
            const artistName = data.item.artists[0].name;

            statusContainer.classList.add('listening');
            statusContainer.title = `Şu an çalıyor: ${songName} - ${artistName}`;
        } else {
            setSpotifyOffline(statusContainer, avatarImg);
        }
    } catch (error) {
        console.error("Spotify verisi çekilemedi:", error);
        setSpotifyOffline(statusContainer, avatarImg);
    }
}

function setSpotifyOffline(container, img) {
    if (container) {
        container.classList.remove('listening');
        container.title = "Şu an bir şey dinlemiyor";
    }
    if (img) {
        img.src = "https://github.com/omerasaf54.png";
    }
}