// Sobald das DOM vollständig geladen ist, wird der folgende Code ausgeführt
document.addEventListener('DOMContentLoaded', function () {
    // Selektieren des Login-Formulars und der Eingabefelder für Benutzername und Passwort
    const loginForm = document.querySelector('form');
    const usernameInput = document.getElementById('adminID');
    const passwordInput = document.getElementById('password');

    // Überprüfung, ob das Formular existiert
    if (loginForm) {
        // Event-Listener für das Absenden des Formulars hinzufügen
        loginForm.addEventListener('submit', function (event) {
            event.preventDefault(); // Verhindert die Standardaktion des Formulars (Seiten-Neuladen)

            const username = usernameInput.value.trim(); // Entfernt Leerzeichen im Benutzernamen
            const password = passwordInput.value.trim(); // Entfernt Leerzeichen im Passwort

            clearErrors(); // Entfernt vorherige Fehlermeldungen

            // Senden der Anmeldeinformationen an den Server
            fetch('/admin/login', {
                method: 'POST', // HTTP-Methode POST wird verwendet
                headers: { 'Content-Type': 'application/json' }, // Daten werden als JSON gesendet
                body: JSON.stringify({ username, password }), // Benutzername und Passwort in JSON umwandeln
            })
                .then(response => {
                    if (!response.ok) {
                        // Wenn der Server-Response fehlschlägt, Fehlerdaten extrahieren
                        return response.json().then(data => {
                            if (data.errors) {
                                showErrors(data.errors); // Zeigt Fehlermeldungen an, falls vorhanden
                            }
                        });
                    } else {
                        // Weiterleitung zur Dashboard-Seite bei erfolgreichem Login
                        window.location.href = '/admin/dashboard';
                    }
                })
                .catch(error => console.error('Fehler bei der Anmeldung:', error)); // Fehler bei der Anfrage ausgeben
        });
    }

    // Funktion zum Entfernen alter Fehlermeldungen
    function clearErrors() {
        const errorMessages = document.querySelectorAll('.error-message'); // Alle Fehlermeldungselemente finden
        errorMessages.forEach(msg => msg.remove()); // Alle Fehlermeldungen aus dem DOM entfernen
    }

    // Funktion zum Anzeigen neuer Fehlermeldungen
    function showErrors(errors) {
        if (errors.username) {
            // Fehlermeldung für den Benutzernamen erstellen und hinzufügen
            const usernameError = document.createElement('span');
            usernameError.textContent = errors.username; // Fehlermeldungstext setzen
            usernameError.classList.add('error-message'); // CSS-Klasse für Stil hinzufügen
            usernameInput.parentElement.appendChild(usernameError); // Fehlermeldung nach dem Eingabefeld einfügen
        }

        if (errors.password) {
            // Fehlermeldung für das Passwort erstellen und hinzufügen
            const passwordError = document.createElement('span');
            passwordError.textContent = errors.password; // Fehlermeldungstext setzen
            passwordError.classList.add('error-message'); // CSS-Klasse für Stil hinzufügen
            passwordInput.parentElement.appendChild(passwordError); // Fehlermeldung nach dem Eingabefeld einfügen
        }
    }
});
