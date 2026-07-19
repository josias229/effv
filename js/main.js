document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. NAVBAR SCROLL LOGIC
    // ==========================================
    const navbar = document.querySelector('.navbar-custom');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // ==========================================
    // 2. MOBILE MENU TOGGLE
    // ==========================================
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const navMenu = document.querySelector('.navbar-custom nav');

    if (mobileBtn && navMenu) {
        mobileBtn.addEventListener('click', () => {
            navMenu.classList.toggle('show');
        });
    }

    // ==========================================
    // 3. MENU ACTIF DYNAMIQUE
    // ==========================================
    // On récupère le nom du fichier actuel (ex: "apropos.html" ou "" pour index)
    let currentPath = window.location.pathname.split('/').pop();
    
    // Si c'est la racine (ex: www.effv.org/), on considère que c'est index.html
    if (currentPath === '' || currentPath === '/') {
        currentPath = 'index.html';
    }

    // Fonction pour surligner les liens correspondants
    function setActiveLinks(selector) {
        const links = document.querySelectorAll(selector);
        links.forEach(link => {
            // Nettoyage de l'attribut href pour comparer
            let linkHref = link.getAttribute('href');
            
            // Si le lien correspond au path actuel
            if (linkHref === currentPath) {
                link.classList.add('nav-active');
            } else {
                link.classList.remove('nav-active');
            }
        });
    }

    // On applique la détection sur le menu desktop, le menu mobile et le footer
    setActiveLinks('.navbar-custom nav a');
    setActiveLinks('#mobile-menu a');
    // On peut aussi le faire pour le footer si besoin (optionnel)
    // setActiveLinks('footer a');

    // ==========================================
    // 4. VIDEO MODAL LOGIC (Famille Chrétienne / Mediatheque)
    // ==========================================
    const videoCards = document.querySelectorAll('.video-card');
    const videoModalEl = document.getElementById('videoModal');
    const videoIframe = document.getElementById('videoIframe');

    if (videoCards.length > 0 && videoModalEl && videoIframe) {
        // Only initialize if we are on a page that uses it
        const videoModal = new bootstrap.Modal(videoModalEl);

        videoCards.forEach(card => {
            card.addEventListener('click', () => {
                const videoUrl = card.getAttribute('data-video');
                if(videoUrl) {
                    const playUrl = videoUrl.includes('?') ? videoUrl + '&autoplay=1' : videoUrl + '?autoplay=1';
                    videoIframe.src = playUrl;
                    videoModal.show();
                }
            });
        });

        // Stop video when modal closes
        videoModalEl.addEventListener('hidden.bs.modal', () => {
            videoIframe.src = '';
        });
    }

    // ==========================================
    // 5. NOTES MODAL LOGIC (Famille Chrétienne)
    // ==========================================
    // We bind it to window so it can be called from onclick attributes in HTML
    window.openNotes = function(title) {
        const notesModalTitle = document.getElementById('notesModalTitle');
        const notesModalBody = document.getElementById('notesModalBody');
        const notesModalEl = document.getElementById('notesModal');
        
        if (notesModalTitle && notesModalBody && notesModalEl) {
            notesModalTitle.innerText = title;
            
            notesModalBody.innerHTML = `
                <div class="mb-4">
                    <span class="badge bg-light text-brand-accent mb-3 border border-danger">Résumé Exclusif</span>
                    <p class="text-secondary" style="line-height: 1.7;">
                        Voici les notes écrites et les grandes lignes abordées durant l'enseignement de la Jeunesse <strong>"${title}"</strong>.
                    </p>
                    
                    <h6 class="fw-bold mt-4 mb-3 text-dark"><i class="fas fa-check-circle text-success me-2"></i>Points Clés de l'Enseignement :</h6>
                    <ul class="list-unstyled text-secondary">
                        <li class="mb-3 d-flex align-items-start"><i class="fas fa-angle-right text-brand-accent mt-1 me-2"></i> Un jeune consacré est une arme redoutable dans les mains de Dieu.</li>
                        <li class="mb-3 d-flex align-items-start"><i class="fas fa-angle-right text-brand-accent mt-1 me-2"></i> Nos choix d'aujourd'hui déterminent notre destinée de demain.</li>
                        <li class="mb-3 d-flex align-items-start"><i class="fas fa-angle-right text-brand-accent mt-1 me-2"></i> S'entourer de bonnes connexions spirituelles est vital.</li>
                    </ul>
                    
                    <div class="bg-brand-lightgrey p-3 rounded mt-4 border-start border-4 border-brand-accent">
                        <p class="fst-italic small mb-0">"Que personne ne méprise ta jeunesse; mais sois un modèle pour les fidèles, en parole, en conduite, en charité, en foi, en pureté." - <span class="fw-bold">1 Timothée 4:12</span></p>
                    </div>
                </div>
            `;
            
            const notesModal = new bootstrap.Modal(notesModalEl);
            notesModal.show();
        }
    };

    // ==========================================
    // 6. EVENT MODAL LOGIC (Événement)
    // ==========================================
    window.currentBasePrice = 0;
    window.isFreeEvent = false;

    window.openInscriptionModal = function(eventName, eventPriceStr) {
        const recapEventName = document.getElementById('recapEventName');
        if(!recapEventName) return; // Only run on pages with the modal

        recapEventName.innerText = eventName;
        document.getElementById('recapUnitPrice').innerText = eventPriceStr;
        
        // Réinitialiser le select
        document.getElementById('ticketCount').value = "1";

        // Analyser le prix
        if (eventPriceStr.toLowerCase() === 'gratuit' || eventPriceStr.toLowerCase() === 'entrée libre') {
            window.currentBasePrice = 0;
            window.isFreeEvent = true;
            document.getElementById('recapTotal').innerText = "Gratuit";
            document.querySelector('#paymentBox button[type="submit"]').innerHTML = 'Confirmer mon Inscription <i class="fas fa-check ms-2"></i>';
            document.querySelector('.alert-info').style.display = 'none';
        } else {
            // Extraire le nombre du string (ex: "10 000 FCFA" -> 10000)
            window.currentBasePrice = parseInt(eventPriceStr.replace(/\D/g, ''));
            window.isFreeEvent = false;
            document.getElementById('recapTotal').innerText = eventPriceStr;
            document.querySelector('#paymentBox button[type="submit"]').innerHTML = 'Payer & S\'inscrire <i class="fas fa-arrow-right ms-2"></i>';
            document.querySelector('.alert-info').style.display = 'flex';
        }

        // Ouvrir la modale
        var myModal = new bootstrap.Modal(document.getElementById('inscriptionModal'));
        myModal.show();
    };

    window.updateTotal = function() {
        if(window.isFreeEvent) return;
        const count = parseInt(document.getElementById('ticketCount').value);
        const total = window.currentBasePrice * count;
        // Formater avec espace (ex: 20000 -> 20 000)
        const formattedTotal = total.toLocaleString('fr-FR') + " FCFA";
        document.getElementById('recapTotal').innerText = formattedTotal;
    };

    window.handleRegistration = function(e) {
        e.preventDefault();
        if(window.isFreeEvent) {
            alert("Votre inscription a bien été prise en compte !");
        } else {
            alert("Redirection en cours vers la plateforme de paiement (FedaPay/Mobile Money)...");
        }
        // Fermer la modale
        var myModalEl = document.getElementById('inscriptionModal');
        var modal = bootstrap.Modal.getInstance(myModalEl);
        modal.hide();
    };

    // ==========================================
    // 7. HERO CAROUSEL LOGIC (Accueil)
    // ==========================================
    const slides = document.querySelectorAll('.slide');
    if (slides.length > 0) {
        let currentSlide = 0;
        let slideInterval;

        window.showSlide = function(index) {
            slides.forEach((slide, i) => {
                slide.classList.remove('active');
                if (i === index) slide.classList.add('active');
            });
        };

        window.nextSlide = function() {
            currentSlide = (currentSlide + 1) % slides.length;
            window.showSlide(currentSlide);
        };

        window.prevSlide = function() {
            currentSlide = (currentSlide - 1 + slides.length) % slides.length;
            window.showSlide(currentSlide);
        };

        const prevBtn = document.querySelector('.prev');
        const nextBtn = document.querySelector('.next');
        
        if(nextBtn) {
            nextBtn.addEventListener('click', () => {
                window.nextSlide();
                window.resetInterval();
            });
        }
        if(prevBtn) {
            prevBtn.addEventListener('click', () => {
                window.prevSlide();
                window.resetInterval();
            });
        }

        window.startInterval = function() {
            slideInterval = setInterval(window.nextSlide, 6000);
        };

        window.resetInterval = function() {
            clearInterval(slideInterval);
            window.startInterval();
        };

        const carousel = document.querySelector('.carousel');
        if(carousel) {
            carousel.addEventListener('mouseenter', () => {
                clearInterval(slideInterval);
            });
            carousel.addEventListener('mouseleave', () => {
                window.startInterval();
            });
        }

        window.showSlide(0);
        window.startInterval();
    }

    // ==========================================
    // 8. TABS LOGIC (A Propos / Médiathèque)
    // ==========================================
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    function activateTab(targetId) {
        tabBtns.forEach(btn => {
            btn.classList.remove('active');
        });
        tabContents.forEach(content => {
            content.classList.remove('active');
        });

        const activeBtn = document.querySelector(`.tab-btn[data-target="${targetId}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        const activeContent = document.getElementById(targetId);
        if (activeContent) {
            activeContent.classList.add('active');
        }
    }

    if (tabBtns.length > 0) {
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const target = btn.getAttribute('data-target');
                activateTab(target);
                const mobileSelect = document.getElementById('mobile-tab-select');
                if (mobileSelect) {
                    mobileSelect.value = target;
                }
            });
        });
    }

    const mobileSelect = document.getElementById('mobile-tab-select');
    if (mobileSelect) {
        mobileSelect.addEventListener('change', (e) => {
            activateTab(e.target.value);
        });
    }

    // ==========================================
    // 9. MEDIA LOGIC (Video & Notes)
    // ==========================================
    { // <-- Ajout d'un bloc pour isoler le scope
        const mediaVideoCards = document.querySelectorAll('.video-card');
        const mediaVideoModalEl = document.getElementById('videoModal');
        
        if (mediaVideoCards.length > 0 && mediaVideoModalEl) {
            const mediaVideoModal = new bootstrap.Modal(mediaVideoModalEl);
            const mediaVideoIframe = document.getElementById('videoIframe');

            mediaVideoCards.forEach(card => {
                card.addEventListener('click', () => {
                    const videoUrl = card.getAttribute('data-video');
                    const playUrl = videoUrl.includes('?') ? videoUrl + '&autoplay=1' : videoUrl + '?autoplay=1';
                    mediaVideoIframe.src = playUrl;
                    mediaVideoModal.show();
                });
            });

            mediaVideoModalEl.addEventListener('hidden.bs.modal', () => {
                mediaVideoIframe.src = '';
            });
        }
    } // <-- Fin du bloc

    window.openNotes = function(title) {
        document.getElementById('notesModalTitle').innerText = title;
        
        document.getElementById('notesModalBody').innerHTML = `
            <div class="mb-4">
                <span class="badge bg-light text-brand-accent mb-3 border border-danger">Résumé Exclusif</span>
                <p class="text-secondary" style="line-height: 1.7;">
                    Voici les notes écrites et les grandes lignes abordées durant l'enseignement <strong>"${title}"</strong>. 
                    Méditez sur ces paroles pour fortifier votre foi tout au long de la semaine.
                </p>
                
                <h6 class="fw-bold mt-4 mb-3 text-dark"><i class="fas fa-check-circle text-success me-2"></i>Points Clés de l'Enseignement :</h6>
                <ul class="list-unstyled text-secondary">
                    <li class="mb-3 d-flex align-items-start"><i class="fas fa-angle-right text-brand-accent mt-1 me-2"></i> La fondation de la foi repose sur la révélation de la Parole.</li>
                    <li class="mb-3 d-flex align-items-start"><i class="fas fa-angle-right text-brand-accent mt-1 me-2"></i> Nos déclarations façonnent notre réalité spirituelle et physique.</li>
                    <li class="mb-3 d-flex align-items-start"><i class="fas fa-angle-right text-brand-accent mt-1 me-2"></i> L'obéissance radicale déclenche la provision divine.</li>
                </ul>
                
                <div class="bg-brand-lightgrey p-3 rounded mt-4 border-start border-4 border-brand-accent">
                    <p class="fst-italic small mb-0">"La foi vient de ce qu'on entend, et ce qu'on entend vient de la parole de Christ." - <span class="fw-bold">Romains 10:17</span></p>
                </div>
            </div>
        `;
        
        const notesModal = new bootstrap.Modal(document.getElementById('notesModal'));
        notesModal.show();
    };

    // ==========================================
    // 10. COUNTDOWN LOGIC
    // ==========================================
    const timerContainer = document.getElementById('countdown-timer');
    if (timerContainer) {
        function getNextServiceDate() {
            const now = new Date();
            let target = new Date();

            const dayOfWeek = now.getDay();
            const daysUntilSunday = (7 - dayOfWeek) % 7;

            target.setDate(now.getDate() + daysUntilSunday);
            target.setHours(8, 0, 0, 0);

            if (dayOfWeek === 0) {
                if (now.getHours() >= 10 && now.getMinutes() >= 30) {
                    target.setDate(target.getDate() + 7);
                } else if (now.getHours() >= 8) {
                    return 'ONGOING';
                }
            }

            return target;
        }

        const daysEl = document.getElementById('cd-days');
        const hoursEl = document.getElementById('cd-hours');
        const minutesEl = document.getElementById('cd-minutes');
        const secondsEl = document.getElementById('cd-seconds');
        const statusContainer = document.getElementById('culte-status');

        function updateCountdown() {
            const targetDate = getNextServiceDate();

            if (targetDate === 'ONGOING') {
                timerContainer.classList.add('d-none');
                statusContainer.classList.remove('d-none');
                return;
            } else {
                timerContainer.classList.remove('d-none');
                statusContainer.classList.add('d-none');
            }

            const now = new Date().getTime();
            const distance = targetDate.getTime() - now;

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            if (daysEl && hoursEl && minutesEl && secondsEl) {
                daysEl.innerText = days.toString().padStart(2, '0');
                hoursEl.innerText = hours.toString().padStart(2, '0');
                minutesEl.innerText = minutes.toString().padStart(2, '0');
                secondsEl.innerText = seconds.toString().padStart(2, '0');
            }
        }

        setInterval(updateCountdown, 1000);
        updateCountdown();
    }

    // ==========================================
    // 11. GLOBAL DONATION MODAL LOGIC
    // ==========================================
    // Inject the donation modal HTML into the body if it doesn't exist
    if (!document.getElementById('donModal')) {
        const donModalHTML = `
        <div class="modal fade" id="donModal" tabindex="-1" aria-labelledby="donModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content border-0 rounded-4 overflow-hidden">
                    <div class="modal-header bg-brand-dark text-white border-0 p-4">
                        <div>
                            <h5 class="modal-title font-heading fw-bold fs-3" id="donModalLabel">Faire un Don Sécurisé</h5>
                            <p class="mb-0 text-white-50 small">Sélectionnez le type et le montant de votre don</p>
                        </div>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body bg-light p-4">
                        <form id="globalDonationForm" onsubmit="event.preventDefault(); alert('Redirection vers FedaPay/Stripe en cours...');">
                            <div class="mb-4">
                                <label class="form-label fw-bold text-brand-dark">Motif du Don</label>
                                <select class="form-select border-2" required>
                                    <option value="offrande">Offrande Libre</option>
                                    <option value="dime">Dîme</option>
                                    <option value="projet">Projet de Construction</option>
                                    <option value="action_grace">Action de Grâce</option>
                                </select>
                            </div>
                            <div class="mb-4">
                                <label class="form-label fw-bold text-brand-dark">Montant (FCFA)</label>
                                <div class="input-group">
                                    <span class="input-group-text bg-white border-2 fw-bold text-brand-accent">CFA</span>
                                    <input type="number" class="form-control border-2 fs-5 fw-bold" placeholder="Ex: 5000" min="500" required>
                                </div>
                            </div>
                            <div class="row g-3 mb-4">
                                <div class="col-12">
                                    <label class="form-label fw-bold text-brand-dark">Nom Complet (Optionnel)</label>
                                    <input type="text" class="form-control border-2" placeholder="Ex: Jean Dupont">
                                </div>
                            </div>
                            <div class="alert alert-success small d-flex align-items-center mb-4 border-0 shadow-sm">
                                <i class="fas fa-lock fs-4 me-3 text-success"></i>
                                <div>Votre paiement sera traité de manière 100% sécurisée.</div>
                            </div>
                            <button type="submit" class="btn w-100 py-3 fs-5 fw-bold text-uppercase tracking-wider rounded-3" style="background-color: var(--brand-dark); color: white;">
                                Procéder au Paiement <i class="fas fa-chevron-right ms-2"></i>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', donModalHTML);
    }

    // Attach event listeners to all "Faire un Don" links (except the nav link that goes to the page, or maybe override it if desired)
    // Actually, the user asked to make the modals function everywhere.
    // If they click "Faire un Don" on the navbar, they should probably go to `don.html`.
    // Let's bind the global modal to any element with data-bs-target="#donModal".
    
    // Also, inject Video Modal globally if not exists
    if (!document.getElementById('videoModal')) {
        const videoModalHTML = `
        <div class="modal fade" id="videoModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-xl">
                <div class="modal-content bg-transparent border-0">
                    <div class="modal-header border-0 pb-0 justify-content-end">
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body p-0">
                        <div class="ratio ratio-16x9 bg-black rounded overflow-hidden">
                            <iframe id="videoIframe" src="" allowfullscreen allow="autoplay"></iframe>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', videoModalHTML);
    }

    // Also, inject Notes Modal globally if not exists
    if (!document.getElementById('notesModal')) {
        const notesModalHTML = `
        <div class="modal fade" id="notesModal" tabindex="-1" aria-labelledby="notesModalTitle" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-lg">
                <div class="modal-content border-0 rounded-4 overflow-hidden">
                    <div class="modal-header bg-brand-dark text-white border-0 p-4">
                        <h5 class="modal-title font-heading fw-bold fs-3" id="notesModalTitle">Titre de la Note</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body bg-white p-4 p-md-5" id="notesModalBody">
                    </div>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', notesModalHTML);
    }

});
