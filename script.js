document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const body = document.body;
    const langToggle = document.getElementById('langToggle');
    const header = document.querySelector('.header');
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const mobileDrawer = document.querySelector('.mobile-drawer');
    const drawerClose = document.querySelector('.drawer-close');
    const drawerLinks = document.querySelectorAll('.drawer-link');
    
    // B2B Form & Modal Elements
    const evaluationForm = document.getElementById('evaluationForm');
    const formRoofArea = document.getElementById('formRoofArea');
    const successModal = document.getElementById('successModal');
    const modalCloseBtn = document.querySelector('.modal-close-btn');
    
    // 1. Language Toggle & Persistence System (localStorage)
    const placeholders = {
        zh: {
            companyName: "例：嘉睿股份有限公司",
            contactPerson: "例：林經理",
            contactPhone: "例：04-2491-9698 或 0912-345678",
            formRoofArea: "填寫數字，例如：500",
            formMessage: "例：預計對接用電大戶條款 / 廠房屋頂曾漏水希望兼顧防水 / 廠區變壓器容量限額希望用儲能動態擴容..."
        },
        en: {
            companyName: "e.g. CRi Energy Co., Ltd.",
            contactPerson: "e.g. Manager Lin",
            contactPhone: "e.g. +886-4-2491-9698",
            formRoofArea: "Enter number, e.g. 500",
            formMessage: "e.g. Compliance with Green Energy Act / Waterproofing needs / Peak-shifting with ESS..."
        }
    };



    function setLanguage(lang) {
        localStorage.setItem('cri-lang', lang);
        if (lang === 'en') {
            body.className = 'lang-en';
            updateFormPlaceholders('en');
        } else {
            body.className = 'lang-zh';
            updateFormPlaceholders('zh');
        }
        
        // Trigger ROI calculation on load/change if on calculator page
        if (typeof calculateROI === 'function') {
            calculateROI();
        }
    }

    function updateFormPlaceholders(lang) {
        const companyNameEl = document.getElementById('companyName');
        const contactPersonEl = document.getElementById('contactPerson');
        const contactPhoneEl = document.getElementById('contactPhone');
        const formRoofAreaEl = document.getElementById('formRoofArea');
        const formMessageEl = document.getElementById('formMessage');

        if (companyNameEl) companyNameEl.placeholder = placeholders[lang].companyName;
        if (contactPersonEl) contactPersonEl.placeholder = placeholders[lang].contactPerson;
        if (contactPhoneEl) contactPhoneEl.placeholder = placeholders[lang].contactPhone;
        if (formRoofAreaEl) formRoofAreaEl.placeholder = placeholders[lang].formRoofArea;
        if (formMessageEl) formMessageEl.placeholder = placeholders[lang].formMessage;
    }

    // Highlight Active Page in Nav Links
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinksList = document.querySelectorAll('.nav-links a, .drawer-links a');
    navLinksList.forEach(link => {
        const hrefPath = link.getAttribute('href');
        if (hrefPath === currentPath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // 2. Navigation Scroll Effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            if (header) header.classList.add('scrolled');
        } else {
            if (header) header.classList.remove('scrolled');
        }
    });

    // 3. Mobile Navigation Drawer Controls
    function toggleDrawer(open) {
        if (mobileDrawer) {
            if (open) {
                mobileDrawer.classList.add('open');
            } else {
                mobileDrawer.classList.remove('open');
            }
        }
    }

    if (mobileNavToggle) mobileNavToggle.addEventListener('click', () => toggleDrawer(true));
    if (drawerClose) drawerClose.addEventListener('click', () => toggleDrawer(false));
    
    drawerLinks.forEach(link => {
        link.addEventListener('click', () => toggleDrawer(false));
    });

    document.addEventListener('click', (e) => {
        if (mobileDrawer && mobileDrawer.classList.contains('open') && 
            !mobileDrawer.contains(e.target) && 
            mobileNavToggle && !mobileNavToggle.contains(e.target)) {
            toggleDrawer(false);
        }
    });

    // 4. Interactive ROI Calculator
    const roofAreaInput = document.getElementById('roofArea');
    const roofAreaSlider = document.getElementById('roofAreaSlider');
    const calcRoofType = document.getElementById('calcRoofType');
    const addStorageCheckbox = document.getElementById('addStorage');
    
    const resCapacity = document.getElementById('resCapacity');
    const resStorageCapacity = document.getElementById('resStorageCapacity');
    const essLabelDivider = document.getElementById('essLabelDivider');
    const essUnitText = document.getElementById('essUnitText');
    const resGeneration = document.getElementById('resGeneration');
    const resCarbon = document.getElementById('resCarbon');
    const resSavings = document.getElementById('resSavings');

    function calculateROI() {
        if (!roofAreaInput) return; // Only execute if calculator elements exist on page
        
        const area = parseFloat(roofAreaInput.value) || 0;
        const type = calcRoofType.value;
        const addStorage = addStorageCheckbox ? addStorageCheckbox.checked : false;
        const isEn = body.classList.contains('lang-en');

        let baseCapacityFactor = 6.0; // Pings per kW
        let solarEfficiencyFactor = 0.90; // Default flat roof (90%)

        if (type === 'factory') {
            baseCapacityFactor = 6.0;
            solarEfficiencyFactor = 0.90;
        } else if (type === 'greenhouse') {
            baseCapacityFactor = 6.0;
            solarEfficiencyFactor = 0.85;
        } else if (type === 'bipv') {
            baseCapacityFactor = 8.0;
            solarEfficiencyFactor = 0.70;
        } else if (type === 'repower') {
            baseCapacityFactor = 6.0;
            solarEfficiencyFactor = 1.80;
        }

        const capacity = area / baseCapacityFactor;
        const storageCapacity = addStorage ? capacity * 2.0 : 0;
        const annualGeneration = capacity * 1200 * solarEfficiencyFactor;
        const carbonReduction = annualGeneration * 0.495;

        const solarAnnualSavings = annualGeneration * 4.0;
        const storageAnnualSavings = storageCapacity * 3.5 * 300;
        const totalAnnualSavings = solarAnnualSavings + storageAnnualSavings;

        if (resCapacity) resCapacity.innerText = capacity.toFixed(1);
        if (resGeneration) resGeneration.innerText = Math.round(annualGeneration).toLocaleString();
        if (resCarbon) resCarbon.innerText = Math.round(carbonReduction).toLocaleString();

        if (resStorageCapacity && essLabelDivider && essUnitText) {
            if (addStorage) {
                resStorageCapacity.style.display = 'inline';
                essLabelDivider.style.display = 'inline';
                essUnitText.style.display = 'inline';
                resStorageCapacity.innerText = Math.round(storageCapacity).toLocaleString();
            } else {
                resStorageCapacity.style.display = 'none';
                essLabelDivider.style.display = 'none';
                essUnitText.style.display = 'none';
            }
        }
        
        if (resSavings) {
            if (isEn) {
                resSavings.innerText = `NT$ ${Math.round(totalAnnualSavings).toLocaleString()}`;
            } else {
                resSavings.innerText = `NT$ ${Math.round(totalAnnualSavings).toLocaleString()} 元`;
            }
        }

        if (formRoofArea) formRoofArea.value = Math.round(area);
    }

    // Sync Slider and Input Box
    if (roofAreaInput && roofAreaSlider) {
        roofAreaInput.addEventListener('input', (e) => {
            let val = parseFloat(e.target.value) || 0;
            if (val < 10) val = 10;
            if (val > 10000) val = 10000;
            roofAreaSlider.value = val;
            calculateROI();
        });

        roofAreaSlider.addEventListener('input', (e) => {
            roofAreaInput.value = e.target.value;
            calculateROI();
        });

        if (calcRoofType) calcRoofType.addEventListener('change', calculateROI);
        if (addStorageCheckbox) addStorageCheckbox.addEventListener('change', calculateROI);

        calculateROI(); // Initial calc
    }

    // 5. B2B Form Submission & Modal Handling
    if (evaluationForm) {
        evaluationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const submitBtn = document.getElementById('formSubmitBtn');
            const origContent = submitBtn.innerHTML;
            
            const isEn = body.classList.contains('lang-en');
            submitBtn.disabled = true;
            submitBtn.innerHTML = isEn 
                ? '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...' 
                : '<i class="fa-solid fa-spinner fa-spin"></i> 正在送出評估申請...';

            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = origContent;
                
                if (successModal) successModal.classList.add('open');
                evaluationForm.reset();
                if (typeof calculateROI === 'function') calculateROI(); 
            }, 1500);
        });
    }

    if (modalCloseBtn && successModal) {
        modalCloseBtn.addEventListener('click', () => {
            successModal.classList.remove('open');
        });

        successModal.addEventListener('click', (e) => {
            if (e.target === successModal) {
                successModal.classList.remove('open');
            }
        });
    }

    // 6. Smooth Scroll Reveal (Intersection Observer)
    const animateElements = document.querySelectorAll('.feature-card, .product-card, .scenario-card, .timeline-item, .calculator-wrapper, .repower-highlight-box');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.05
    });

    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
        observer.observe(el);
    });

    // Activate Language Toggle after all variables and functions are fully initialized (fixes TDZ bug)
    let currentLang = localStorage.getItem('cri-lang') || 'zh';
    setLanguage(currentLang);

    if (langToggle) {
        langToggle.addEventListener('click', () => {
            currentLang = currentLang === 'zh' ? 'en' : 'zh';
            setLanguage(currentLang);
        });
    }

    // 7. Partner Carousel Slider Logic (for partnerships.html)
    const slides = document.querySelector('.carousel-slides');
    const slideItems = document.querySelectorAll('.carousel-slide');
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    const dotsContainer = document.querySelector('.carousel-dots');

    if (slides && slideItems.length > 0) {
        let currentIndex = 0;
        const totalSlides = slideItems.length;

        // Clear existing dots just in case
        if (dotsContainer) dotsContainer.innerHTML = '';

        // Create dots
        slideItems.forEach((_, idx) => {
            const dot = document.createElement('div');
            dot.classList.add('carousel-dot');
            if (idx === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(idx));
            if (dotsContainer) dotsContainer.appendChild(dot);
        });

        const dots = document.querySelectorAll('.carousel-dot');

        function updateCarousel() {
            slides.style.transform = `translateX(-${currentIndex * 100}%)`;
            dots.forEach((dot, idx) => {
                if (idx === currentIndex) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }

        function goToSlide(idx) {
            currentIndex = idx;
            updateCarousel();
        }

        function nextSlide() {
            currentIndex = (currentIndex + 1) % totalSlides;
            updateCarousel();
        }

        function prevSlide() {
            currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
            updateCarousel();
        }

        if (nextBtn) nextBtn.addEventListener('click', nextSlide);
        if (prevBtn) prevBtn.addEventListener('click', prevSlide);

        // Auto play every 5 seconds
        let autoPlayTimer = setInterval(nextSlide, 5000);

        // Reset timer on user interaction
        const resetTimer = () => {
            clearInterval(autoPlayTimer);
            autoPlayTimer = setInterval(nextSlide, 5000);
        };

        if (nextBtn) nextBtn.addEventListener('click', resetTimer);
        if (prevBtn) prevBtn.addEventListener('click', resetTimer);
        dots.forEach(dot => dot.addEventListener('click', resetTimer));
    }
});
