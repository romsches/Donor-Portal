// Klasse für ein benutzerdefiniertes HTML-Element 'SpecialHeader'
class SpecialHeader extends HTMLElement {
    // Wird aufgerufen, wenn das Element mit dem DOM verbunden wird
    connectedCallback() {
        this.innerHTML = `
        <div class="header_container">
            <nav>
                <ul>
                    <li><a href="/login">Startseite</a></li>
                    <li><a href="#">Blutspende</a></li>
                    <li><a href="#">Blutspender werden</a></li>
                    <li><a href="#">Informationen</a></li>
                    <li><a href="#">Kontakt</a></li>
                </ul>
            </nav>
        </div>
        `;
    }
}

// Klasse für ein benutzerdefiniertes HTML-Element 'SpecialLogo'
class SpecialLogo extends HTMLElement {
    // Wird aufgerufen, wenn das Element mit dem DOM verbunden wird
    connectedCallback() {
        this.innerHTML = `
        <section class="logo">
            <div>
                <img src="/img/logo.png" alt="logo"> 
            </div>
        </section>
        `;
    }
}

// Klasse für ein benutzerdefiniertes HTML-Element 'SpecialFooter'
class SpecialFooter extends HTMLElement {
    // Wird aufgerufen, wenn das Element mit dem DOM verbunden wird
    connectedCallback() {
        this.innerHTML = `
        <div class="footer_container">
            <div class="unten">
                <ul class="links">
                    <a href="#">Impressum</a>
                    <a href="#">Nutzungsbedingungen</a>
                    <a href="#">Datenschutz</a>
                </ul>
            </div>
            <div class="apps">
                <a href="#"><img src="/img/facebook-app-symbol.png" alt="fcb"></a>
                <a href="#"><img src="/img/instagram.png" alt="inst"></a>
                <a href="#"><img src="/img/twitter.png" alt="twit"></a>
            </div>
        </div>
        `;
    }
}

// Benutzerdefinierte HTML-Elemente registrieren
customElements.define('special-header', SpecialHeader);
customElements.define('special-footer', SpecialFooter);
customElements.define('special-logo', SpecialLogo);

// DOMContentLoaded-Ereignis überwachen, um sicherzustellen, dass das DOM vollständig geladen ist
document.addEventListener('DOMContentLoaded', () => {

    // Das Login-Formular im DOM suchen
    const loginForm = document.querySelector('#login-form');
    if (loginForm) { // Überprüfen, ob das Login-Formular existiert
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Verhindern des Standardformular-Absendevorgangs

            const formData = new FormData(loginForm); // Formulardaten sammeln

            try {
                const response = await fetch(loginForm.action, { // Asynchrone Anfrage mit fetch an die URL des Formulars
                    method: loginForm.method, // HTTP-Methode des Formulars (z.B. POST)
                    body: formData // Formulardaten als Anfragekörper
                });

                if (!response.ok) {
                    throw new Error('Netzwerkantwort war nicht ok.');
                }

                const data = await response.json(); // Antwort in JSON konvertieren

                if (data.success) { // Überprüfen, ob die Anmeldung erfolgreich war
                    if (data.redirectUrl) {
                        window.location.href = data.redirectUrl; // Bei Erfolg zur angegebenen URL weiterleiten
                    } else {
                        console.error('Keine Weiterleitungs-URL angegeben.'); // Fehlermeldung ausgeben
                    }
                } else {
                    console.error('Autorisierungsfehler:', data.message); // Fehler in der Konsole ausgeben
                }
            } catch (error) {
                console.error('Fehler beim Senden des Formulars:', error); // Fehler beim Senden des Formulars behandeln
            }
        });
    }
});
