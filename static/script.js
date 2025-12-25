// ============================================
// GESTION DU THÈME (MODE CLAIR / MODE SOMBRE)
// ============================================
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme === 'dark' ? 'dark' : 'light');
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// ============================================
// ANIMATION TYPEWRITER LETTRE PAR LETTRE (INFINI)
// ============================================
function typeWriterAnimation() {
    const codeLines = document.querySelectorAll('.code-line');
    const lines = Array.from(codeLines).map(line => line.innerHTML);
    
    function animateCycle() {
        // Réinitialiser le texte
        codeLines.forEach((line, idx) => {
            line.innerHTML = '';
        });
        
        // Animation typewriter
        codeLines.forEach((line, lineIndex) => {
            const text = lines[lineIndex];
            let charIndex = 0;
            const delay = lineIndex * 1000; // 1 seconde entre chaque ligne
            
            setTimeout(() => {
                const typeInterval = setInterval(() => {
                    if (charIndex < text.length) {
                        line.innerHTML += text.charAt(charIndex);
                        charIndex++;
                    } else {
                        clearInterval(typeInterval);
                    }
                }, 30); // 30ms par caractère
            }, delay);
        });
        
        // Relancer la boucle après 4 secondes (durée totale d'écriture + pause)
        setTimeout(animateCycle, 4000);
    }
    
    animateCycle();
}

// ============================================
// CONFIGURATION SÉCURITÉ PAR CATÉGORIE D'ÂGE
// ============================================
const ageProfiles = {
    '8-12': {
        label: '👶 Enfant (8-12 ans)',
        minLength: 12,
        maxLength: 12,
        defaults: { maj: true, min: true, num: false, spec: false },
        info: 'Mot de passe simple et facile à mémoriser'
    },
    '13-19': {
        label: '🧒 Adolescent (13-19 ans)',
        minLength: 12,
        maxLength: 14,
        defaults: { maj: true, min: true, num: true, spec: false },
        info: 'Complexité modérée avec chiffres'
    },
    '20-35': {
        label: '👨 Adulte (20-35 ans)',
        minLength: 14,
        maxLength: 20,
        defaults: { maj: true, min: true, num: true, spec: true },
        info: 'Maximum de sécurité - Tous les caractères'
    },
    '36-50': {
        label: '👴 Adulte+ (36-50 ans)',
        minLength: 12,
        maxLength: 16,
        defaults: { maj: true, min: true, num: true, spec: false },
        info: 'Équilibre entre sécurité et mémorisation'
    },
    '50+': {
        label: '🧓 Senior (50+ ans)',
        minLength: 12,
        maxLength: 14,
        defaults: { maj: true, min: true, num: true, spec: false },
        info: 'Sécurisé mais facile à retenir'
    }
};

// ============================================
// Fonction sécurisée pour générer un nombre aléatoire
// ============================================
function getSecureRandomInt(max) {
    const randomArray = new Uint32Array(1);
    crypto.getRandomValues(randomArray);
    return randomArray[0] % max;
}

// ============================================
// Fonction de dérivation cryptographique
// ============================================
async function pbkdf2(password, salt, iterations = 100000) {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveBits']
    );
    
    const derivedBits = await crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            salt: encoder.encode(salt),
            iterations: iterations,
            hash: 'SHA-256'
        },
        key,
        256
    );
    
    return new Uint8Array(derivedBits);
}

// Support detection for -webkit-text-security
const USE_TEXT_SECURITY = (typeof CSS !== 'undefined' && typeof CSS.supports === 'function' && CSS.supports('-webkit-text-security', 'disc'));

// ============================================
// Générer un seed aléatoire unique
// ============================================
function generateSecureSeed() {
    const randomArray = new Uint8Array(16);
    crypto.getRandomValues(randomArray);
    return Array.from(randomArray).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ============================================
// Afficher les erreurs
// ============================================
function showError(message) {
    const feedback = document.getElementById('copy-feedback') || createFeedback();
    feedback.textContent = "❌ " + message;
    feedback.style.backgroundColor = "#ff4444";
    feedback.style.display = "block";
    setTimeout(() => {
        feedback.style.display = "none";
    }, 4000);
}

function createFeedback() {
    const feedback = document.createElement('div');
    feedback.id = 'copy-feedback';
    feedback.className = 'copy-feedback';
    document.body.appendChild(feedback);
    return feedback;
}

// ============================================
// Générer hint mnémonique VISIBLE et retourner les éléments
// ============================================
function generateMnemonic(nom, postnom, prenom, telephone) {
    const initials = nom.charAt(0).toUpperCase() + postnom.charAt(0).toUpperCase() + prenom.charAt(0).toUpperCase();
    const firstTelDigit = telephone.replace(/\D/g, '').charAt(0);
    const mnemonicBase = initials + firstTelDigit;
    
    const mnemonicContainer = document.querySelector('.mnemonic-container');
    const mnemonicText = document.querySelector('.mnemonic-text');
    
    if (mnemonicContainer && mnemonicText) {
        mnemonicText.textContent = mnemonicBase;
        mnemonicContainer.classList.add('show');
    }
    
    return mnemonicBase;
}

// ============================================
// Mettre à jour les options selon l'âge
// ============================================
function updateAgeProfile() {
    const ageCategory = document.getElementById('ageCategory').value;
    const profile = ageProfiles[ageCategory];
    
    // Mettre à jour les defaults
    document.getElementById('maj').checked = profile.defaults.maj;
    document.getElementById('min').checked = profile.defaults.min;
    document.getElementById('num').checked = profile.defaults.num;
    document.getElementById('spec').checked = profile.defaults.spec;
    
    // Afficher l'info
    const ageInfo = document.getElementById('ageInfo');
    ageInfo.innerHTML = `<p>${profile.label}<br><small>${profile.info}</small></p>`;
    ageInfo.style.display = 'block';
}

// ============================================
// FONCTION PRINCIPALE : Générer le mot de passe
// ============================================
async function generatePassword() {
    // Récupération des valeurs
    const nom = document.getElementById('nom').value.trim();
    const postnom = document.getElementById('postnom').value.trim();
    const prenom = document.getElementById('prenom').value.trim();
    const telephone = document.getElementById('telephone').value.trim();
    const ageCategory = document.getElementById('ageCategory').value;
    const secretKey = document.getElementById('secretKey').value.trim();
    
    const profile = ageProfiles[ageCategory];

    // === VALIDATION ===
    const nameRegex = /^[A-Za-zÀ-ÿ\s\-]+$/;
    const telRegex = /^[\d\+\-\s]+$/;

    if (!nom || !postnom || !prenom || !telephone) {
        showError("Tous les champs doivent être remplis !");
        return;
    }

    if (!nameRegex.test(nom) || !nameRegex.test(postnom) || !nameRegex.test(prenom)) {
        showError("Les champs Nom, Post-nom et Prénom ne doivent contenir que des lettres.");
        return;
    }

    if (!telRegex.test(telephone)) {
        showError("Le numéro de téléphone ne doit contenir que des chiffres, + et -.");
        return;
    }

    if (nom.length < 2 || postnom.length < 2 || prenom.length < 2 || telephone.length < 2) {
        showError("Au moins 2 caractères pour chaque champ.");
        return;
    }

    // Options sélectionnées
    const useMaj = document.getElementById('maj').checked;
    const useMin = document.getElementById('min').checked;
    const useNum = document.getElementById('num').checked;
    const useSpec = document.getElementById('spec').checked;
    const passwordLength = parseInt(document.getElementById('passwordLength').value) || 16;

    if (!useMaj && !useMin && !useNum && !useSpec) {
        showError("Cochez au moins un type de caractère.");
        return;
    }

    // Jeux de caractères
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const digits = "0123456789";
    const special = "!@#$%^&*()_+-=[]{}|;:,.<>?";

    const charTypes = [];
    if (useMaj) charTypes.push({ set: upper });
    if (useMin) charTypes.push({ set: lower });
    if (useNum) charTypes.push({ set: digits });
    if (useSpec) charTypes.push({ set: special });

    // ============================================
    // ÉTAPE 1 : Générer seed aléatoire
    // ============================================
    const randomSeed = generateSecureSeed();

    // ============================================
    // ÉTAPE 1.5 : Générer mnemonic (identifiants clés)
    // ============================================
    const mnemonicBase = generateMnemonic(nom, postnom, prenom, telephone);

    // ============================================
    // ÉTAPE 2 : Combiner entrées + seed + clé secrète
    // ============================================
    let combinedInput = nom + postnom + prenom + telephone + randomSeed;
    if (secretKey) {
        combinedInput += secretKey;
    }

    // ============================================
    // ÉTAPE 3 : Dérivation cryptographique
    // ============================================
    const derivedBits = await pbkdf2(combinedInput, randomSeed, 100000);
    
    const fullSet = charTypes.map(t => t.set).join('');
    let passwordChars = [];

    // DÉBUT : Ajouter les identifiants clés (mnemonic) au début du mot de passe
    for (let i = 0; i < mnemonicBase.length; i++) {
        passwordChars.push(mnemonicBase.charAt(i));
    }

    // Ajouter au moins un caractère de chaque type (sauf s'il en existe déjà)
    charTypes.forEach(type => {
        const randomIndex = getSecureRandomInt(type.set.length);
        passwordChars.push(type.set.charAt(randomIndex));
    });

    // Compléter avec dérivation cryptographique
    for (let i = 0; i < passwordLength - passwordChars.length; i++) {
        const byteIndex = i % derivedBits.length;
        const randomIndex = derivedBits[byteIndex] % fullSet.length;
        passwordChars.push(fullSet.charAt(randomIndex));
    }

    // ============================================
    // ÉTAPE 4 : Mélange COMPLET (Fisher-Yates)
    // ============================================
    passwordChars = shuffleArray(passwordChars);

    const finalPassword = passwordChars.join('').slice(0, passwordLength);

    // ============================================
    // ÉTAPE 5 : Affichage
    // ============================================
    document.getElementById('result').value = finalPassword;
    const pwHidden = document.getElementById('resultPassword');
    if (pwHidden) pwHidden.value = finalPassword;
    updatePasswordStrength(finalPassword);
}

// ============================================
// Fonction pour évaluer la force
// ============================================
function updatePasswordStrength(password) {
    const strengthBar = document.querySelector('.strength-bar');
    const strengthText = document.querySelector('.strength-text');
    
    if (!strengthBar || !strengthText) return;

    let strength = 0;
    let strengthLabel = "Très faible";
    let strengthColor = "#ff4444";

    if (password.length >= 14) strength += 25;
    else if (password.length >= 12) strength += 15;
    
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[a-z]/.test(password)) strength += 20;
    if (/\d/.test(password)) strength += 20;
    if (/[!@#$%^&*()_+\[\]{}<>?]/.test(password)) strength += 15;

    if (strength >= 80) {
        strengthLabel = "Très forte 💪";
        strengthColor = "#00ff00";
    } else if (strength >= 60) {
        strengthLabel = "Forte 👍";
        strengthColor = "#66ff00";
    } else if (strength >= 40) {
        strengthLabel = "Moyenne ⚠️";
        strengthColor = "#ffaa00";
    } else if (strength >= 20) {
        strengthLabel = "Faible ⚠️";
        strengthColor = "#ff6600";
    }

    strengthBar.style.width = strength + "%";
    strengthBar.style.backgroundColor = strengthColor;
    strengthText.textContent = strengthLabel;
    strengthText.style.color = strengthColor;
}

// ============================================
// Mélange Fisher-Yates (sécurisé)
// ============================================
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = getSecureRandomInt(i + 1);
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// ============================================
// Copier le mot de passe (Clipboard API moderne)
// ============================================
async function copyPassword() {
    const result = document.getElementById('result');
    
    // Vérifier si le mot de passe est vide
    if (!result.value || result.value.trim() === "") {
        showError("❌ Générez d'abord un mot de passe !");
        return;
    }

    try {
        // Copier le mot de passe dans le presse-papier
        await navigator.clipboard.writeText(result.value);
        
        // Créer/récupérer le feedback
        let feedback = document.getElementById('copy-feedback');
        if (!feedback) {
            feedback = createFeedback();
        }
        
        // Afficher le message de succès
        feedback.textContent = "✅ Mot de passe copié !";
        feedback.style.backgroundColor = "linear-gradient(135deg, #6366f1, #ec4899)";
        feedback.style.display = "block";
        feedback.style.background = "linear-gradient(135deg, #6366f1, #ec4899)";
        
        // Animation du bouton
        const copyBtn = document.querySelector('.btn-secondary');
        if (copyBtn) {
            copyBtn.classList.add('pulse');
            setTimeout(() => copyBtn.classList.remove('pulse'), 400);
        }
        
        // Masquer après 3 secondes
        setTimeout(() => {
            feedback.style.display = "none";
        }, 3000);
        
        console.log("✅ Mot de passe copié avec succès !");
    } catch (err) {
        console.error("Erreur copie :", err);
        showError("❌ Impossible de copier. Vérifiez les permissions.");
    }
}

// ============================================
// Réinitialiser le formulaire
// ============================================
function resetForm() {
    document.getElementById('nom').value = '';
    document.getElementById('postnom').value = '';
    document.getElementById('prenom').value = '';
    document.getElementById('telephone').value = '';
    document.getElementById('secretKey').value = '';
    document.getElementById('result').value = '';
    
    const strengthBar = document.querySelector('.strength-bar');
    const strengthText = document.querySelector('.strength-text');
    if (strengthBar) strengthBar.style.width = '0%';
    if (strengthText) strengthText.textContent = '';
    
    const mnemonicDiv = document.getElementById('mnemonic');
    if (mnemonicDiv) mnemonicDiv.style.display = 'none'; // Déjà masqué pour sécurité
    
    document.getElementById('nom').focus();
}

// ============================================
// Toggle visibilité mot de passe
// ============================================
function togglePassword(element) {
    const passwordInput = document.getElementById('result');
    const passwordInputHidden = document.getElementById('resultPassword');
    
    if (!passwordInput) {
        console.error("Champ mot de passe non trouvé");
        return;
    }
    // If browser supports -webkit-text-security, toggle the class (visual mask)
    if (USE_TEXT_SECURITY) {
        if (passwordInput.classList.contains('password-hidden')) {
            passwordInput.classList.remove('password-hidden');
            element.textContent = '🙈';
            element.title = 'Masquer le mot de passe';
        } else {
            passwordInput.classList.add('password-hidden');
            element.textContent = '👁';
            element.title = 'Afficher le mot de passe';
        }
        return;
    }

    // Fallback for browsers without -webkit-text-security:
    // swap visibility between the text input and a password input to avoid changing type dynamically
    if (passwordInputHidden) {
        const isTextVisible = window.getComputedStyle(passwordInput).display !== 'none';
        if (isTextVisible) {
            // hide text, show password
            passwordInput.style.display = 'none';
            passwordInputHidden.style.display = '';
            element.textContent = '🙈';
            element.title = 'Masquer le mot de passe';
        } else {
            // show text, hide password
            passwordInput.style.display = '';
            passwordInputHidden.style.display = 'none';
            element.textContent = '👁';
            element.title = 'Afficher le mot de passe';
        }
    } else {
        // As a last resort, toggle the class anyway
        passwordInput.classList.toggle('password-hidden');
    }
}

// Initialisation au chargement
document.addEventListener("DOMContentLoaded", function () {
    // Initialiser le thème
    initTheme();
    
    // Lancer l'animation typewriter
    typeWriterAnimation();
    
    // Ajouter l'écouteur au bouton de thème
    const themeButton = document.querySelector('.theme-toggle');
    if (themeButton) {
        themeButton.addEventListener('click', toggleTheme);
    }
    
    createFeedback();
    
    // Mettre à jour le profil quand l'âge change
    const ageCategorySelect = document.getElementById('ageCategory');
    if (ageCategorySelect) {
        ageCategorySelect.addEventListener('change', updateAgeProfile);
        updateAgeProfile(); // Appel initial
    }
    
    // Toggle icône œil
    const toggleIcon = document.querySelector(".toggle-password");
    if (toggleIcon) {
        toggleIcon.addEventListener("click", function (e) {
            e.preventDefault();
            togglePassword(this);
        });
    }
    
    // Toggle des indices mnémoniques
    const mnemonicToggle = document.getElementById('mnemonicToggle');
    if (mnemonicToggle) {
        mnemonicToggle.addEventListener('click', function (e) {
            e.preventDefault();
            const dots = this.querySelector('.mnemonic-dots');
            const text = this.querySelector('.mnemonic-text');
            
            if (dots.style.display === 'none') {
                // Cacher le texte, afficher les points
                dots.style.display = 'inline';
                text.style.display = 'none';
            } else {
                // Afficher le texte, cacher les points
                dots.style.display = 'none';
                text.style.display = 'inline';
            }
        });
    }

    // Afficher force à chaque frappe (pour affichage du seed)
    const resultInput = document.getElementById('result');
    if (resultInput) {
        resultInput.addEventListener('input', function () {
            if (this.value) {
                updatePasswordStrength(this.value);
            }
            // keep fallback password input in sync
            const pwHidden = document.getElementById('resultPassword');
            if (pwHidden) pwHidden.value = this.value;
        });
    }
});

// ============================================
// Fonction pour toggle les options avancées
// ============================================
function toggleAdvanced() {
    const content = document.getElementById('advancedContent');
    const toggle = document.querySelector('.advanced-toggle');
    
    content.classList.toggle('active');
    toggle.classList.toggle('active');
}

// ============================================
// Fonction pour gérer le slider de longueur
// ============================================
function setupLengthSlider() {
    const slider = document.getElementById('passwordLength');
    const valueDisplay = document.getElementById('lengthValue');
    
    if (slider && valueDisplay) {
        slider.addEventListener('input', function () {
            valueDisplay.textContent = this.value;
        });
    }
}

// Initialiser le slider au chargement
document.addEventListener('DOMContentLoaded', setupLengthSlider);

// ============================================
// GESTION DU MODAL D'ACCEPTATION DES CONDITIONS
// ============================================
function initConditionsModal() {
    const modal = document.getElementById('conditions-modal');
    const acceptCheckbox = document.getElementById('conditions-accept');
    const continueBtn = document.getElementById('conditions-btn');
    const form = document.getElementById('generator-form');
    const generatorCard = document.querySelector('.generator-form-card');
    
    if (!modal) return; // Si modal n'existe pas, ne rien faire
    
    // Vérifier si conditions déjà acceptées dans cette session
    const conditionsAccepted = sessionStorage.getItem('conditions-accepted') === 'true';
    
    if (conditionsAccepted) {
        modal.style.display = 'none';
        if (generatorCard) generatorCard.style.opacity = '1';
        if (form) form.style.pointerEvents = 'auto';
    } else {
        modal.style.display = 'flex';
        if (generatorCard) generatorCard.style.opacity = '0.5';
        if (form) form.style.pointerEvents = 'none';
    }
    
    // Écouter le changement du checkbox
    acceptCheckbox.addEventListener('change', function () {
        continueBtn.disabled = !this.checked;
    });
    
    // Écouter le clic du bouton continuer
    continueBtn.addEventListener('click', function () {
        if (acceptCheckbox.checked) {
            sessionStorage.setItem('conditions-accepted', 'true');
            modal.style.display = 'none';
            if (generatorCard) generatorCard.style.opacity = '1';
            if (form) form.style.pointerEvents = 'auto';
            // Focus sur le premier champ du formulaire
            const firstInput = form.querySelector('input');
            if (firstInput) firstInput.focus();
        }
    });
}

// Initialiser le modal au chargement
document.addEventListener('DOMContentLoaded', initConditionsModal);
