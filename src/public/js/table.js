// Klasse für benutzerdefiniertes HTML-Element „SpecialHeader“
// Diese Klasse erstellt ein benutzerdefiniertes HTML-Element für den Header.
class SpecialHeader extends HTMLElement {
    connectedCallback() {
        // HTML-Inhalt für das benutzerdefinierte Header-Element
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

// Klasse für benutzerdefiniertes HTML-Element „SpecialLogo“
// Diese Klasse erstellt ein benutzerdefiniertes HTML-Element für das Logo.
class SpecialLogo extends HTMLElement {
    connectedCallback() {
        // HTML-Inhalt für das benutzerdefinierte Logo-Element
        this.innerHTML = `
        <section class="logodrk">
            <div>
                <img src="/views/img/label.png" alt="logo">
            </div>
        </section>
        `;
    }
}

// Klasse für benutzerdefiniertes HTML-Element „SpecialFooter“
// Diese Klasse erstellt ein benutzerdefiniertes HTML-Element für den Footer.
class SpecialFooter extends HTMLElement {
    connectedCallback() {
        // HTML-Inhalt für das benutzerdefinierte Footer-Element
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
                <a href="#"><img src="/views/img/facebook-app-symbol.png" alt="fcb"></a>
                <a href="#"><img src="/views/img/instagram.png" alt="inst"></a>
                <a href="#"><img src="/views/img/twitter.png" alt="twit"></a>
            </div>
        </div>
        `;
    }
}

// Registrieren benutzerdefinierter HTML-Elemente
// Diese Zeilen registrieren die benutzerdefinierten HTML-Elemente, sodass sie in HTML verwendet werden können.
customElements.define('special-header', SpecialHeader);
customElements.define('special-logo', SpecialLogo);
customElements.define('special-footer', SpecialFooter);

// Variable für den Logout-Timer
let logoutTimer;

// Hinzufügen von Ereignis-Listenern für benutzerdefinierte Aktivitäten
// Diese Ereignis-Listener setzen den Logout-Timer zurück, wenn der Benutzer eine der angegebenen Aktionen durchführt (z. B. Mausbewegung, Tastendrücke).
document.addEventListener('mousemove', resetLogoutTimer);
document.addEventListener('mousedown', resetLogoutTimer);
document.addEventListener('keypress', resetLogoutTimer);
document.addEventListener('touchstart', resetLogoutTimer);

// Funktion zum Festlegen des Mindestdatums für das Datumseingabefeld
// Diese Funktion stellt sicher, dass das Datumseingabefeld nicht auf ein Datum in der Vergangenheit gesetzt werden kann.
function setMinDate() {
    const dateInput = document.getElementById('dtm');
    if (dateInput) {
        // Heute als Mindestdatum festlegen
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);
    } else {
        console.error('Element mit der ID "dtm" nicht gefunden.');
    }
}

// Funktion zum Festlegen des Startdatums auf heute
// Diese Funktion setzt das Datumseingabefeld auf das heutige Datum.
function setInitialDate() {
    const dateInput = document.getElementById('dtm');
    if (dateInput) {
        // Heute als Startdatum festlegen
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    } else {
        console.error('Element mit der ID "dtm" nicht gefunden.');
    }
}

// Funktion zum Aktualisieren der Tabelle
// Diese Funktion ruft die Tabelle vom Server ab und aktualisiert den Inhalt.
window.refreshTable = refreshTable;

// Funktion zum Zurücksetzen des Logout-Timers
// Diese Funktion wird bei jeder Benutzeraktivität aufgerufen, um den Logout-Timer zurückzusetzen.
function resetLogoutTimer() {
    clearTimeout(logoutTimer); // Den aktuellen Timer zurücksetzen
    initializeLogoutTimer();  // Den Timer neu starten
}

// Funktion zur Initialisierung des Logout-Timers
// Dieser Timer loggt den Benutzer nach einer bestimmten Zeit der Inaktivität aus.
function initializeLogoutTimer() {
    clearTimeout(logoutTimer); // Den Timer zurücksetzen
    logoutTimer = setTimeout(() => {
        window.location.href = '/login'; // Benutzer zur Login-Seite umleiten
    }, 2 * 60 * 1000); // 2 Minuten Inaktivität (in Millisekunden)
}

// Asynchrone Funktion zum Aktualisieren einer Tabelle
// Diese Funktion ruft die Daten vom Server ab, um die Tabelle mit Spenderdaten zu aktualisieren.
async function refreshTable() {
    try {
        // Filterwerte von den Eingabefeldern abrufen
        const selectedLocation = document.getElementById('location-filter').value || 'Alle Standorte';
        const dateFilter = document.getElementById('dtm').value || '';
        const donorID = ''; // Platzhalter für die eigentliche Spender-ID-Logik

        // Daten vom Server anfordern
        const response = await fetch(`/refreshTable?SpenderID=${donorID}&location=${encodeURIComponent(selectedLocation)}&date=${encodeURIComponent(dateFilter)}`);
        if (!response.ok) {
            throw new Error('Netzwerkfehler.');
        }
        const data = await response.json();

        const tableBody = document.querySelector('#meeting-table tbody');
        tableBody.innerHTML = ''; // Alte Tabelleninhalte entfernen

        // Wenn Meetings-Daten vorhanden sind, die Tabelle füllen
        if (data.meetings && data.meetings.length > 0) {
            data.meetings.forEach(meeting => {
                // Datum formatieren
                const dateFormatted = formatDate(meeting.Datum);
                const address = selectedLocation === 'Alle Standorte'
                    ? `${meeting.Strasse || 'Straße fehlt'} (${meeting.Stadt || 'Stadt fehlt'})`
                    : `${meeting.Strasse || 'Straße fehlt'}`;

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${dateFormatted}</td>
                    <td>${address}</td>
                    <td>${meeting.Uhrzeit || 'Uhrzeit fehlt'}</td>
                    <td>${meeting.Status || 'Status fehlt'}</td>
                `;
                tableBody.appendChild(row);
            });
        } else {
            // Wenn keine Meetings-Daten vorhanden sind, eine Nachricht anzeigen
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.setAttribute('colspan', '4');
            cell.textContent = 'Keine Ergebnisse gefunden.';
            row.appendChild(cell);
            tableBody.appendChild(row);
        }

        // Spendeninformationen aktualisieren
        updateDonationInfo(data.canDonate);
    } catch (error) {
        console.error('Fehler beim Aktualisieren der Tabelle:', error);
    }
}

// Funktion zum Formatieren des Datums im Format „tt.mm.jjjj“
// Diese Funktion formatiert das Datum von "yyyy-mm-dd" in das Format "dd.mm.yyyy".
function formatDate(dateString) {
    if (!dateString) return 'Datum fehlt';

    const dateParts = dateString.split('-');
    const day = dateParts[2] || '';
    const month = dateParts[1] || '';
    const year = dateParts[0] || '';

    let formattedDate = '';
    if (day) formattedDate += `${day}.`;
    if (month) formattedDate += `${month}.`;
    if (year) formattedDate += `${year}`;

    return formattedDate || 'Datum fehlt';
}

// Asynchrone Funktion zum Herunterladen von Städten vom Server
// Diese Funktion ruft eine Liste von Städten vom Server ab und füllt das Standortauswahlfeld.
async function loadCities() {
    try {
        const response = await fetch('/cities');
        if (!response.ok) {
            throw new Error('Netzwerkfehler.');
        }
        const data = await response.json();
        // console.log('Geladene Städte:', data); // Für Debugging
        const locationFilter = document.getElementById('location-filter');
        if (locationFilter) {
            locationFilter.innerHTML = '<option value="Alle Standorte">Alle Standorte</option>'; // Alte Werte löschen
            data.cities.forEach(city => {
                const option = document.createElement('option');
                option.value = city.Ort;
                option.textContent = city.Ort;
                locationFilter.appendChild(option);
            });
        } else {
            console.error('Element mit der ID "location-filter" nicht gefunden.');
        }
    } catch (error) {
        console.error('Fehler beim Laden der Städte:', error);
    }
}

// Funktion zum Aktualisieren der Spendeninformationen
// Diese Funktion zeigt Informationen an, ob der Benutzer noch spenden kann.
function updateDonationInfo(canDonate) {
    const donateInfoElement = document.getElementById('can-donate-info');
    if (donateInfoElement) {
        donateInfoElement.textContent = canDonate
            ? 'Sie können Blut spenden!'
            : 'Sie können derzeit nicht spenden.';
    }
}

// Funktion zur Initialisierung der Seite
// Diese Funktion wird beim Laden der Seite aufgerufen, um die Tabelle zu aktualisieren und die Standorte zu laden.
function initializePage() {
    loadCities(); // Städte laden
    setMinDate(); // Mindestdatum festlegen
    setInitialDate(); // Startdatum festlegen
    refreshTable(); // Tabelle mit den aktuellen Daten füllen
}

// Seite beim Laden initialisieren
window.addEventListener('load', initializePage);
