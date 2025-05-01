// Überprüfen, ob der Benutzer über Administratorrechte verfügt
// Diese Funktion wird vor der Ausführung aller Funktionen aufgerufen, um sicherzustellen, dass der Benutzer angemeldet ist und Administratorrechte besitzt
function isAdmin() {
    // Prüft, ob die Privilegien des Benutzers das Recht "admin" enthalten
    return privileges && privileges.includes('admin'); // Gibt true zurück, wenn der Benutzer Administratorrechte hat, andernfalls false
}

// Überprüfung der Administratorrechte, um den Code nur für Administratoren auszuführen
document.addEventListener('DOMContentLoaded', () => {
    // Prüfen, ob der Benutzer über Administratorrechte verfügt
    if (!privileges.includes('admin')) {
        // Wenn der Benutzer kein Administrator ist, werden die Elemente, die nur für Administratoren sichtbar sind, ausgeblendet
        const adminSections = document.querySelectorAll('.admin-only');
        adminSections.forEach(section => {
            section.style.display = 'none'; // Setzt das Display der Admin-Bereiche auf 'none', sodass sie nicht angezeigt werden
        });
    }
});

// Wenn der Benutzer Administratorrechte hat, wird das Logging angepasst
if (isAdmin()) {
    // Überschreiben der console.log Funktion, damit Administratoren weiterhin Logs sehen können
    console._log = console.log; // Speichern der ursprünglichen console.log Funktion
    console.log = function () {
        console._log.apply(console, arguments); // Ruft die ursprüngliche console.log Funktion auf und zeigt die Logs in der Konsole an
    };
} else {
    // Wenn der Benutzer kein Administrator ist, wird die console.log Funktion überschrieben, sodass keine Logs angezeigt werden
    console.log = function () {}; // Ignoriert alle Log-Nachrichten, sodass sie nicht im Browser-Console erscheinen
}

// Funktion zum Setup des Inaktivität-Timers
function setupInactivityTimer() {
    let timeout; // Variable für den Timeout-Timer

    // Funktion zum Zurücksetzen des Timers bei Benutzeraktivität
    function resetTimer() {
        clearTimeout(timeout); // Löscht den vorherigen Timer
        timeout = setTimeout(() => {
            // Wenn keine Aktivität erkannt wird, führe Logout aus
            fetch('/admin/logout', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            })
            .then(() => {
                // Weiterleitung zur Login-Seite nach dem Logout
                window.location.href = '/admin/login';
            })
            .catch(error => {
                // Fehlerbehandlung, wenn der Logout fehlschlägt
                console.error('Fehler beim Beenden der Sitzung:', error);
            });
        }, 1000 * 60 * 10);  // Timeout nach 10 Minuten Inaktivität (600000ms)
    }

    // Event-Listener, um die Inaktivität zu überwachen und den Timer zurückzusetzen
    document.addEventListener('mousemove', resetTimer); // Bei Mausbewegung
    document.addEventListener('keypress', resetTimer); // Bei Tastendruck
    document.addEventListener('click', resetTimer); // Bei Mausklick
    document.addEventListener('scroll', resetTimer); // Bei Scrollen
    document.addEventListener('touchstart', resetTimer); // Bei Touch-Start auf mobilen Geräten

    // Initiales Setzen des Timers
    resetTimer();
}

// Funktion zur Steuerung des Chatbots
function setupChatbotControl() {
    if (!isAdmin()) {
        return;
    }
    const checkbox = document.getElementById('chatbot-control-checkbox'); // Checkbox zur Steuerung
    const chatbotControl = document.getElementById('chatbot-control'); // Bereich für den Chatbot

    // Überprüfen, ob beide Elemente vorhanden sind
    if (checkbox && chatbotControl) {
        // Event-Listener, um den Chatbot ein- oder auszublenden
        checkbox.addEventListener('change', () => {
            chatbotControl.style.display = checkbox.checked ? 'block' : 'none'; // Einblenden, wenn Checkbox aktiv
        });
    } else {
        // Fehlermeldung, falls die Elemente nicht gefunden wurden
        console.error('Es konnten keine Elemente zur Steuerung des Chatbots gefunden werden');
    }
}

function setupActionVisibility() {
    if (!isAdmin()) {
        return;
    }
    // Elemente für die Steuerung der Ansicht
    const actionSelect = document.getElementById('action-select'); // Auswahl der Aktion
    const sectionContainer = document.getElementById('section-container'); // Container für die Sektionen
    const questionsTableContainer = document.getElementById('questions-table-container'); // Container für die Fragen-Tabelle
    const actionButtons = document.getElementById('button-container'); // Container für die Aktions-Schaltflächen
    const confirmButtons = document.getElementById('confirm-buttons'); // Bestätigungs-Schaltflächen
    const editArea = document.getElementById('edit-area'); // Bereich für die Bearbeitung
    const editTextarea = document.getElementById('edit-textarea'); // Textarea für die Bearbeitung
    const editTypeLabel = document.getElementById('edit-type-label'); // Label für den Bearbeitungstyp
    const deleteMessage = document.getElementById('delete-message'); // Nachricht für die Löschung
    const insertFormContainer = document.getElementById('insert-form-container'); // Formular zum Hinzufügen
    const backButton = document.getElementById('back-button'); // Zurück-Schaltfläche

    // Funktion zum Ausblenden aller Steuerelemente
    function hideAllControls() {
        if (sectionContainer) sectionContainer.style.display = 'none'; // Verstecke den Sektionen-Container
        if (questionsTableContainer) questionsTableContainer.style.display = 'none'; // Verstecke den Tabellen-Container
        if (actionButtons) actionButtons.style.display = 'none'; // Verstecke die Aktions-Schaltflächen
        if (confirmButtons) confirmButtons.classList.add('dash_hidden'); // Verstecke die Bestätigungs-Schaltflächen
        if (editArea) editArea.classList.add('dash_hidden'); // Verstecke den Bearbeitungsbereich
        if (editTextarea) editTextarea.classList.add('dash_hidden'); // Verstecke das Bearbeitungs-Textarea
        if (editTypeLabel) editTypeLabel.classList.add('dash_hidden'); // Verstecke das Bearbeitungs-Typ-Label
        if (deleteMessage) deleteMessage.classList.add('dash_hidden'); // Verstecke die Löschnachricht
        if (insertFormContainer) insertFormContainer.classList.add('dash_hidden'); // Verstecke das Formular zum Hinzufügen
    }

    let notificationShown = false; // Flag für Tracking-Benachrichtigungen

    // Funktion zum Ausblenden der Bearbeitungssteuerung
    function hideEditControls() {
        if (editArea) editArea.classList.add('dash_hidden'); // Verstecke den Bearbeitungsbereich
        if (editTextarea) editTextarea.classList.add('dash_hidden'); // Verstecke das Textarea für die Bearbeitung
        if (editTypeLabel) editTypeLabel.classList.add('dash_hidden'); // Verstecke das Label für den Bearbeitungstyp
        if (confirmButtons) confirmButtons.classList.add('dash_hidden'); // Verstecke die Bestätigungs-Schaltflächen
        actionButtons.style.display = 'block'; // Zeige die Aktions-Schaltflächen wieder an
    }

    // Zeigen der Löschsteuerung für eine ausgewählte Zeile
    function showDeleteControls(row) {
        const id = row.dataset.id;
        const section = row.cells[1].textContent;

        // Nachricht für die Löschung der Zeile mit ID aktualisieren
        deleteMessage.textContent = `Möchten Sie die Zeile mit ID ${id} wirklich löschen?`;
        deleteMessage.classList.remove('dash_hidden');

        // Bestätigungsschaltflächen anzeigen
        confirmButtons.classList.remove('dash_hidden');
        actionButtons.style.display = 'none'; // Aktionsschaltflächen ausblenden

        // Nachricht mit ID und Abschnitt der ausgewählten Zeile aktualisieren
        document.getElementById('delete-id').textContent = id;
        document.getElementById('delete-section').textContent = section;
    }

    // Verstecken der Löschsteuerung und Zurücksetzen der Anzeige
    function hideDeleteControls() {
        deleteMessage.classList.add('dash_hidden');
        confirmButtons.classList.add('dash_hidden');
        actionButtons.style.display = 'block'; // Aktionsschaltflächen wieder anzeigen

        // Nachricht mit ID und Abschnitt zurücksetzen
        document.getElementById('delete-id').textContent = 'undefined';
        document.getElementById('delete-section').textContent = 'undefined';

        // Zeilenauswahl zurücksetzen, falls eine Zeile ausgewählt wurde
        const selectedRow = document.querySelector('#questions-table tbody tr.selected');
        if (selectedRow) {
            selectedRow.classList.remove('selected');
        }
    }

    // Funktion zum Zurücksetzen des Benachrichtigungs-Flags
    function resetNotificationFlag() {
        notificationShown = false; // Rücksetzen des Flags, wenn die Benachrichtigung verschwunden ist
    }

    // Beispiel für das Formular zum Hinzufügen von FAQ
    const insertForm = document.getElementById('insert-form');
    if (insertForm) {
        insertForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Verhindern des Standard-Formularversands

            // Abholen der Werte aus den Formularfeldern
            const section = document.getElementById('insert-section').value.trim();
            const question = document.getElementById('insert-question').value.trim();
            const answer = document.getElementById('insert-answer').value.trim();

            // Senden der Daten an die API, um die Frage hinzuzufügen
            fetch('/api/add-faq', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ section, question, answer }) // JSON-Daten im Request-Body
            })
            .then(response => response.json()) // Antwort als JSON verarbeiten
            .then(data => {
                if (data.success) {
                    // Erfolgreich hinzugefügt
                    showNotification('Die Frage wurde erfolgreich hinzugefügt.');
                    insertForm.reset(); // Formular zurücksetzen
                    document.getElementById('action-select').value = 'view'; // Auswahl zurücksetzen
                    document.getElementById('action-select').dispatchEvent(new Event('change')); // Ereignis auslösen, um die Ansicht zu aktualisieren
                } else {
                    // Fehler bei der Anfrage
                    if (data.error === 'duplicate') {
                        showNotification('Fehler: Diese Frage existiert bereits.'); // Fehlerfall für doppelte Frage
                    } else {
                        showNotification(`Fehler: ${data.message}`); // Allgemeine Fehlernachricht
                    }
                }
            })
            .catch(error => {
                console.error('Fehler beim Hinzufügen der Frage:', error);
                showNotification('Fehler beim Hinzufügen der Frage. Überprüfen Sie die Konsole für Details.');
            });
        });
    }

    // Wenn das Element 'actionSelect' existiert, fügen wir einen 'change' Event-Listener hinzu
    if (actionSelect) {
        actionSelect.addEventListener('change', function() {
            const value = actionSelect.value; // Holen Sie sich den aktuellen Wert der Auswahl
            hideAllControls(); // Blenden Sie alle anderen Steuerelemente aus, bevor die erforderlichen angezeigt werden

            // Überprüfen Sie den Wert der Auswahl und zeigen Sie je nach Auswahl die entsprechenden Steuerelemente an
            switch (value) {
                case 'view':
                    sectionContainer.style.display = 'block'; // Zeige den Abschnittscontainer an
                    questionsTableContainer.style.display = 'block'; // Zeige die Fragen-Tabelle an
                    actionButtons.style.display = 'block'; // Zeige die Aktionsbuttons an
                    loadQuestions(); // Lade die Fragen, um sie anzuzeigen
                    break;

                // Sie können hier weitere Fälle für andere Aktionswerte hinzufügen
                // default:
                //    console.error('Unbekannter Handlungswert:', value);
            }
        });
    } else {
        console.error('Element zur Auswahl der Aktion konnte nicht gefunden werden');
    }

    // Wenn das 'sectionSelect'-Element existiert, fügen wir einen 'change' Event-Listener hinzu
    const sectionSelect = document.getElementById('chatbot-sections');
    if (sectionSelect) {
        sectionSelect.addEventListener('change', function() {
            const section = this.value; // Holen Sie sich den ausgewählten Abschnitt
            if (section) {
                loadQuestions(section); // Fragen basierend auf der ausgewählten Sektion laden
            }
        });
    }

    // Holen Sie sich die 'deleteButton' und 'insertButton' Elemente
    const deleteButton = document.getElementById('submit-delete');
    const insertButton = document.getElementById('submit-insert'); // Button "Einfügen"

    // Wenn der 'deleteButton' existiert, fügen wir einen Klick-Event-Listener hinzu
    if (deleteButton) {
        deleteButton.addEventListener('click', () => {
            // Zeigen Sie die Bereiche für die Bestätigung des Löschens an
            sectionContainer.style.display = 'block'; // Zeige den Abschnittscontainer an
            questionsTableContainer.style.display = 'block'; // Zeige die Fragen-Tabelle an
            actionButtons.style.display = 'none'; // Blende die Aktionsbuttons aus
            confirmButtons.classList.remove('dash_hidden'); // Zeige die Bestätigungsbuttons an
            deleteMessage.classList.remove('dash_hidden'); // Zeige die Löschmeldung an
            document.getElementById('button-container').style.display = 'none'; // Blende die Schaltflächen „Bearbeiten“ und „Löschen“ aus
            // Wenn der Bearbeitungsbereich existiert, blenden wir ihn aus
            if (editArea) {
                editArea.style.display = 'none'; // Bearbeitungsbereich ausblenden
            }
        });
    }

    // Wenn der Button "insertButton" existiert, fügen wir einen Klick-Event-Listener hinzu
    if (insertButton) {
        insertButton.addEventListener('click', () => {
            hideAllControls(); // Alle Steuerelemente ausblenden
            insertFormContainer.classList.remove('dash_hidden'); // Formular zum Hinzufügen anzeigen
        });
    }

    // Wenn der Button "backButton" existiert, fügen wir einen Klick-Event-Listener hinzu
    if (backButton) {
        backButton.addEventListener('click', () => {
            hideAllControls(); // Alle Steuerelemente ausblenden
            const actionSelect = document.getElementById('action-select'); // Suche das Aktionsauswahl-Element
            if (actionSelect) {
                actionSelect.value = 'view'; // Setze den Wert der Aktionsauswahl auf 'view'
                actionSelect.dispatchEvent(new Event('change')); // Generiere ein Ereignis, dass die Auswahl geändert wurde
            }
        });
    }

    // Holen Sie sich das "cancelButton"-Element
    const cancelButton = document.getElementById('cancel-button');

    // Wenn der Button "cancelButton" existiert, fügen wir einen Klick-Event-Listener hinzu
    if (cancelButton) {
        cancelButton.addEventListener('click', () => {
            hideDeleteControls(); // Alle Steuerelemente im Zusammenhang mit dem Löschen ausblenden
        });
    }
    
}

let isLoadingQuestions = false;
const allSections = new Set(); // Fügen Sie diese Definition hinzu

// Nachdem die Benachrichtigung angezeigt wird, setzen Sie das Flag zurück
function resetNotificationFlag() {
    if (!isAdmin()) {
        console.log('Sie verfügen nicht über die Berechtigung, diesen Vorgang auszuführen');
        return;
    }
    notificationShown = false;
}

// Verwendung der Funktion für die Bestätigung des Löschvorgangs
const confirmButton = document.getElementById('confirm-button'); // Button für die Bestätigung des Löschens

// Überprüfen, ob der Button existiert und hinzufügen eines Event Listeners
if (confirmButton) {
    confirmButton.addEventListener('click', () => {
        // Überprüfung der Administratorrechte innerhalb eines Event-Handlers
        if (!isAdmin()) {
            console.log('Sie verfügen nicht über die Berechtigung, diesen Vorgang auszuführen');
            return; // Zurückgeben, wenn nicht korrekt
        }

        // Wir erhalten die ID und den Abschnitt der zu löschenden Zeile
        const deleteId = document.getElementById('delete-id').textContent;
        const deleteSection = document.getElementById('delete-section').textContent;

        // Wenn die Zeile nicht ausgewählt ist, wird eine Benachrichtigung angezeigt und die Ausführung gestoppt
        if (deleteId === 'undefined') {
            showNotification('Keine Zeile ausgewählt. Bitte wählen Sie eine Zeile aus, um fortzufahren.');
            return; // Rückkehr, wenn keine Zeile ausgewählt ist
        }

        // Bestätigung der Zeilenlöschung
        const confirmationMessage = `Möchten Sie die Zeile mit ID ${deleteId} wirklich löschen?`;
        
        // Bestätigungsdialog anzeigen
        if (confirm(confirmationMessage)) {
            // Wenn der Benutzer bestätigt hat, rufen Sie die Löschfunktion auf
            deleteRow(deleteId);
        } else {
            // Wenn der Benutzer kündigt, zeigen wir eine Kündigungsbenachrichtigung an
            showNotification('Löschvorgang abgebrochen.');
        }
    });
}

// Funktion zum Anzeigen einer Benachrichtigung (einfaches Alert für Demonstration)
function showNotification(message) {
    if (!isAdmin()) {
        console.log('Sie verfügen nicht über die Berechtigung, diesen Vorgang auszuführen');
        return;
    }
    alert(message); // Zeigt die Nachricht als Alert im Browser an
}

// Funktion zum Löschen einer Zeile (Frage) mit der angegebenen ID
function deleteRow(id) {
    if (!isAdmin()) {
        console.log('Sie verfügen nicht über die Berechtigung, diesen Vorgang auszuführen');
        return;
    }
    // Senden einer POST-Anfrage an die API, um die Frage mit der angegebenen ID zu löschen
    fetch('/api/delete-faq', {
        method: 'POST', // Wir verwenden die POST-Methode, da wir Daten auf dem Server löschen
        headers: { 'Content-Type': 'application/json' }, // Setzen des Inhalts-Typs als JSON
        body: JSON.stringify({ id }) // Senden der ID als JSON-Daten im Body der Anfrage
    })
    .then(response => {
        // Überprüfen, ob die Antwort vom Server erfolgreich war
        if (!response.ok) {
            throw new Error('Netzwerkantwort war nicht OK'); // Fehler, wenn der Statuscode der Antwort nicht ok ist
        }
        return response.json(); // Rückgabe der Antwort als JSON
    })
    .then(data => {
        // Überprüfen, ob der Server das Löschen erfolgreich durchgeführt hat
        if (data.success) {
            showNotification('Die Frage wurde erfolgreich gelöscht.'); // Zeigt eine Benachrichtigung an, wenn das Löschen erfolgreich war
            loadQuestions(); // Aktualisiert die Liste der Fragen nach dem Löschen
            resetDeleteMessage(); // Setzt die Löschenachricht zurück, um sie zu leeren
        } else {
            showNotification(`Fehler: ${data.message}`); // Zeigt eine Fehlernachricht an, wenn das Löschen fehlgeschlagen ist
        }
    })
    .catch(error => {
        // Falls ein Fehler beim Senden der Anfrage auftritt (z.B. Netzwerkfehler)
        console.error('Fehler beim Löschen der Frage:', error); // Fehler wird in der Konsole protokolliert
        showNotification('Fehler beim Löschen der Frage. Überprüfen Sie die Konsole für Details.'); // Zeigt eine allgemeine Fehlermeldung an
    });
}

// Funktion zum Zurücksetzen der Löschenachricht (ID und Abschnitt)
function resetDeleteMessage() {
    if (!isAdmin()) {
        console.log('Sie verfügen nicht über die Berechtigung, diesen Vorgang auszuführen');
        return;
    }
    // Setzt den Textinhalt für ID und Abschnitt auf 'undefined', um anzuzeigen, dass keine Frage mehr ausgewählt ist
    document.getElementById('delete-id').textContent = 'undefined';
    document.getElementById('delete-section').textContent = 'undefined';
}

// Funktion zum Laden von Sektionen (Abschnitten)
function loadSections() {
    if (!isAdmin()) {
        console.log('Sie verfügen nicht über die Berechtigung, diesen Vorgang auszuführen');
        return;
    }
    // Holt das Select-Element mit der ID 'chatbot-sections', wo die Sektionen angezeigt werden
    const sectionSelect = document.getElementById('chatbot-sections');

    // Senden einer Fetch-Anfrage an die API, um die Sektionen zu laden
    fetch('/api/update-faq-sections') // Ersetzen Sie hier durch die richtige Route, die die Sektionen zurückgibt
        .then(response => {
            // Überprüft, ob die Antwort vom Server erfolgreich war
            if (!response.ok) {
                throw new Error('Netzwerkfehler beim Laden von Sektionen'); // Fehler, wenn der Statuscode nicht OK ist
            }
            return response.json(); // Wenn alles gut geht, die Antwort als JSON zurückgeben
        })
        .then(data => {
            // Überprüfen der erhaltenen Daten und Aktualisieren des Dropdown-Menüs für die Sektionen
            if (!data.sections || data.sections.length === 0) {
                // Falls keine Sektionen vorhanden sind, eine entsprechende Option anzeigen
                sectionSelect.innerHTML = '<option value="">Keine Abschnitte verfügbar</option>';
                return; // Die Funktion verlassen, wenn keine Sektionen vorhanden sind
            }

            // Setzt eine Standard-Option "Alle Sektionen" für die Dropdown-Liste
            sectionSelect.innerHTML = '<option value="">Alle Sektionen</option>';

            // Iteriert über jede Sektion und fügt sie als Option im Select-Element hinzu
            data.sections.forEach(section => {
                const option = document.createElement('option');
                option.value = section; // Setzt den Wert der Option auf den Namen der Sektion
                option.textContent = section; // Setzt den Text der Option
                sectionSelect.appendChild(option); // Fügt die Option zum Select-Element hinzu
            });
        })
        .catch(error => {
            // Falls ein Fehler während des Fetch-Vorgangs auftritt, wird dieser hier behandelt
            console.error('Netzwerkfehler beim Laden von Sektionen:', error); // Fehler im Konsolenlog ausgeben
        });
}

// ABMELDEN-LINK (Link für die Abmeldung)
document.addEventListener('DOMContentLoaded', function() {
    // Holt das Element für den Abmelde-Link mit der ID 'logout-link'
    const logoutLink = document.getElementById('logout-link');
    
    // Wenn der Link existiert, wird ein Event-Listener hinzugefügt
    if (logoutLink) {
        logoutLink.addEventListener('click', function(event) {
            // Verhindert das Standardverhalten des Links (z.B. eine neue Seite zu laden)
            event.preventDefault(); 

            // Sendet eine POST-Anfrage an den Server, um die Sitzung zu beenden
            fetch('/admin/logout', {
                method: 'POST', // HTTP-Methode POST zum Beenden der Sitzung
                credentials: 'same-origin', // Sendet Cookies für die Authentifizierung
                headers: {
                    'Content-Type': 'application/json' // Definiert den Inhaltstyp als JSON
                }
            }).then(response => {
                // Wenn die Antwort erfolgreich ist, wird der Benutzer zur Login-Seite weitergeleitet
                if (response.ok) {
                    // Weiterleitung zur Anmeldeseite nach erfolgreichem Logout
                    window.location.href = '/admin/login';
                } else {
                    // Wenn ein Fehler beim Logout auftritt, wird eine Fehlermeldung ausgegeben
                    console.error('Fehler beim Beenden der Sitzung');
                    alert('Die Abmeldung von Ihrem Konto ist fehlgeschlagen. Versuchen Sie es erneut.');
                }
            }).catch(error => {
                // Wenn beim Senden der Anfrage ein Fehler auftritt, wird eine Fehlermeldung ausgegeben
                console.error('Fehler beim Senden der Abmeldeanfrage:', error);
            });
        });
    }
});

let currentSection = ''; // Variable zum Speichern des aktuell ausgewählten Abschnitts

updateSectionSelect();// Aufrufen einer Funktion zum Aktualisieren von Sektionen
setInterval(updateSectionSelect, 5000); // Jede 5 Sekunden

// Funktion zum Laden der Fragen basierend auf der ausgewählten Sektion
function loadQuestions(section = '') {
    if (!isAdmin()) {
        console.log('Sie verfügen nicht über die Berechtigung, diesen Vorgang auszuführen');
        return;
    }
    // Überprüft, ob gerade Fragen geladen werden, um mehrfaches Laden zu verhindern
    if (isLoadingQuestions) return;
    isLoadingQuestions = true;

    // Holt das <tbody>-Element der Tabelle, in das die Fragen geladen werden
    const tbody = document.querySelector('#questions-table tbody');

    // Wenn das <tbody>-Element gefunden wird, fahren wir mit dem Laden fort
    if (tbody) {
        // Leert die Tabelle, bevor neue Daten hinzugefügt werden
        tbody.innerHTML = ''; 

        // Startet die Anfrage zum Laden der Fragen, abhängig von der ausgewählten Sektion
        fetch(`/api/faq-questions?section=${encodeURIComponent(section)}`)
            .then(response => {
                // Wenn die Antwort vom Server nicht erfolgreich ist, werfen wir einen Fehler
                if (!response.ok) {
                    throw new Error('Netzwerkfehler beim Laden der Fragen');
                }
                // Wenn die Antwort erfolgreich war, wird sie als JSON zurückgegeben
                return response.json();
            })
            .then(data => {
                // Extrahiert die Fragen aus den empfangenen Daten
                const questions = data.questions;
                
                // Sortiert die Fragen nach ihrer ID in aufsteigender Reihenfolge
                const sortedQuestions = questions.sort((a, b) => a.id - b.id);

                // Geht jede Frage durch und fügt eine neue Zeile in die Tabelle ein
                sortedQuestions.forEach(question => {
                    // Erstellt eine neue Zeile (<tr>) für jede Frage
                    const row = document.createElement('tr');
                    row.dataset.id = question.id; // Setzt das ID-Attribut der Zeile für spätere Verwendung

                    // Erstellt eine Zelle für die ID der Frage und fügt sie der Zeile hinzu
                    const idCell = document.createElement('td');
                    idCell.textContent = question.id; // Setzt den Text der Zelle auf die Frage-ID
                    row.appendChild(idCell); // Fügt die Zelle der Zeile hinzu

                    // Erstellt eine Zelle für die Sektion der Frage und fügt sie der Zeile hinzu
                    const sectionCell = document.createElement('td');
                    sectionCell.textContent = question.section_name; // Verwendet section_name aus der Frage
                    row.appendChild(sectionCell); // Fügt die Zelle der Zeile hinzu

                    // Erstellt eine Zelle für die Frage selbst und fügt sie der Zeile hinzu
                    const questionCell = document.createElement('td');
                    questionCell.textContent = question.question; // Setzt den Text der Zelle auf die Frage
                    row.appendChild(questionCell); // Fügt die Zelle der Zeile hinzu

                    // Erstellt eine Zelle für die Antwort und fügt sie der Zeile hinzu
                    const answerCell = document.createElement('td');
                    answerCell.textContent = question.answer; // Setzt den Text der Zelle auf die Antwort
                    row.appendChild(answerCell); // Fügt die Zelle der Zeile hinzu

                    // Fügt die erstellte Zeile der Tabelle hinzu
                    tbody.appendChild(row);
                });
            })
            .catch(error => {
                // Gibt einen Fehler aus, wenn etwas schief geht
                console.error('Fehler beim Laden der Fragen:', error);
            })
            .finally(() => {
                // Setzt die isLoadingQuestions-Variable zurück, nachdem der Ladevorgang abgeschlossen ist
                isLoadingQuestions = false;
            });
    } else {
        // Falls das <tbody>-Element nicht gefunden wird, geben wir eine Fehlermeldung aus
        console.error('Tabelle konnte nicht gefunden werden');
    }
}

// Funktion zum Aktualisieren der Sektionen-Auswahl
function updateSectionSelect() {
    if (!isAdmin()) {
        return;
    }
    fetch('/api/update-faq-sections')
        .then(response => response.json())
        .then(data => {
            const selectElement = document.getElementById('chatbot-sections'); 
            selectElement.innerHTML = ''; // Löscht die aktuellen Optionen

            // Erstellt und fügt eine Option für die Auswahl der Sektionen hinzu
            const defaultOption = document.createElement('option');
            defaultOption.value = ''; // Leerer Wert für "Alle Sektionen"
            defaultOption.textContent = 'Alle Sektionen'; 
            selectElement.appendChild(defaultOption);

            // Erstellt und fügt Optionen für die Sektionen hinzu
            data.sections.forEach(section => {
                const option = document.createElement('option');
                option.value = section;
                option.textContent = section;
                selectElement.appendChild(option);
            });

            // Stellt die ausgewählte Sektion wieder her, falls vorhanden
            selectElement.value = currentSection; // Setzt den Wert der ausgewählten Sektion

            // Lädt Fragen für die aktuelle Sektion, falls ausgewählt
            if (currentSection) {
                loadQuestions(currentSection);
            }
        })
        .catch(error => {
            console.error('Fehler beim Aktualisieren der Sektionen:', error);
        });
}

document.addEventListener('DOMContentLoaded', () => {
    const sectionSelect = document.getElementById('chatbot-sections');
    if (sectionSelect) {
        sectionSelect.addEventListener('change', function() {
            if (!isAdmin()) {
                return;
            }
            currentSection = this.value;
            loadQuestions(currentSection);
        });
    } else {
        
    }
});

// Aufrufen einer Funktion zum Aktualisieren von Sektionen
updateSectionSelect();

// Funktion zum Einrichten der Zeilenauswahl in der Tabelle
function setupRowSelection() {
    if (!isAdmin()) {
        console.log('Sie verfügen nicht über die Berechtigung, diesen Vorgang auszuführen');
        return;
    }
    const tableBody = document.querySelector('#questions-table tbody');

    if (tableBody) {
        tableBody.addEventListener('click', function(event) {
            const clickedRow = event.target.closest('tr');
            if (!clickedRow) return; // Wenn nicht auf eine Zeile geklickt wird, nichts tun

            // Entfernt die Markierung von der vorher ausgewählten Zeile
            const previouslySelectedRow = tableBody.querySelector('tr.selected');
            if (previouslySelectedRow) {
                previouslySelectedRow.classList.remove('selected');
            }

            // Markiert die neue Zeile
            clickedRow.classList.add('selected');

            // Aktualisiert den Text im Element mit der ausgewählten Zeile
            const id = clickedRow.dataset.id;
            const section = clickedRow.cells[1].textContent;
            document.getElementById('delete-id').textContent = id;
            document.getElementById('delete-section').textContent = section;
        });
    } else {
        console.error('Tabellenkörper für die Zeilenauswahl konnte nicht gefunden werden');
    }
}

// Funktion, die nach dem Laden des DOMs ausgeführt wird, um verschiedene Funktionen zu initialisieren
document.addEventListener('DOMContentLoaded', function() {
    if (!isAdmin()) {
        return;
    }
    loadSections(); // Lädt die Abschnitte
    setupInactivityTimer(); // Startet den Inaktivitätstimer
    setupChatbotControl(); // Richtet die Chatbot-Steuerung ein
    setupActionVisibility(); // Stellt die Sichtbarkeit der Aktionen ein
    setupRowSelection(); // Fügt die Funktion zur Auswahl der Zeilen hinzu
});

// Funktion zum Aktualisieren der Checkboxen in den Zeilen
function updateRowCheckboxes(rows) {
    if (!isAdmin()) {
        console.log('Sie verfügen nicht über die Berechtigung, diesen Vorgang auszuführen');
        return;
    }
    const rowCheckboxesContainer = document.getElementById('row-checkboxes');
    if (!rowCheckboxesContainer) return;

    rowCheckboxesContainer.innerHTML = ''; // Löscht die vorherigen Checkboxen

    rows.forEach(row => {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'row-checkbox';
        checkbox.dataset.id = row.dataset.id; // Setzt die ID der Zeile

        rowCheckboxesContainer.appendChild(checkbox);
        rowCheckboxesContainer.appendChild(document.createElement('br')); // Fügt einen Zeilenumbruch hinzu
    });
}

//Button "Bearbeiten"
document.addEventListener('DOMContentLoaded', () => {
    if (!isAdmin()) {
        return;
    }
    // Elemente für Bearbeitungsprozess definieren
    const editButton = document.getElementById('submit-edit'); // Button zum Starten der Bearbeitung
    const buttonContainer = document.getElementById('button-container'); // Container für Standard-Buttons
    const editFormContainer = document.getElementById('edit-form-container'); // Container für das Bearbeitungsformular
    const editInstruction = document.getElementById('edit-instruction'); // Anweisung für Bearbeitungsmodus
    const table = document.getElementById('questions-table'); // Tabelle mit FAQs
    const sectionInput = document.getElementById('edit-section'); // Eingabefeld für die Sektion
    const questionInput = document.getElementById('edit-question'); // Eingabefeld für die Frage
    const answerInput = document.getElementById('edit-answer'); // Eingabefeld für die Antwort
    const backEditButton = document.getElementById('back-edit-button'); // Button zum Abbrechen der Bearbeitung
    const confirmButton = document.getElementById('edit_confirm_button'); // Button zum Bestätigen der Bearbeitung
    let selectedRow = null; // Speichert die aktuell ausgewählte Tabellenzeile

    // Funktion zum Verarbeiten des Klicks auf eine Tabellenzeile
    const handleRowClick = (row) => {
        selectedRow = row; // Speichert die ausgewählte Zeile
        const section = row.querySelector('td:nth-child(2)').innerText; // Sektion der Zeile
        const question = row.querySelector('td:nth-child(3)').innerText; // Frage der Zeile
        const answer = row.querySelector('td:nth-child(4)').innerText; // Antwort der Zeile

        // Übertragung der Werte in die Eingabefelder des Bearbeitungsformulars
        sectionInput.value = section;
        questionInput.value = question;
        answerInput.value = answer;

        editInstruction.classList.add('dash_hidden'); // Versteckt die Bearbeitungsanweisung
        buttonContainer.scrollIntoView({ behavior: 'smooth', block: 'start' }); // Scrollt zur Button-Gruppe
    };

    // Ereignislistener für das Klicken auf Tabellenzeilen (Delegierung)
    table.addEventListener('click', (event) => {
        const row = event.target.closest('tr'); // Findet die nächste Zeile
        if (row) handleRowClick(row); // Verarbeitet Klicks nur auf Zeilen
    });

    // Ereignislistener für den Bearbeitungsbutton
    editButton.addEventListener('click', () => {
        buttonContainer.style.display = 'none'; // Versteckt den Button-Container
        editInstruction.classList.remove('dash_hidden'); // Zeigt die Bearbeitungsanweisung
        editFormContainer.classList.remove('dash_hidden'); // Zeigt das Bearbeitungsformular
        sectionInput.value = '';
        questionInput.value = '';
        answerInput.value = '';
        selectedRow = null; // Zurücksetzen der ausgewählten Zeile
    });

    // Ereignislistener für das Auswahlfeld der Sektionen
    const sectionSelect = document.getElementById('chatbot-sections');
    sectionSelect.addEventListener('change', () => {
        selectedRow = null; // Setzt die Auswahl zurück bei Sektionenwechsel
        loadQuestions(sectionSelect.value); // Lädt die Fragen der gewählten Sektion
    });

    // Ereignislistener für den Bestätigungsbutton im Bearbeitungsformular
    confirmButton.addEventListener('click', () => {
        if (!selectedRow) { // Prüfung, ob eine Zeile ausgewählt wurde
            alert('Bitte wählen Sie eine Zeile aus, um die Änderungen vorzunehmen.');
            return;
        }

        const id = selectedRow.querySelector('td:nth-child(1)').innerText; // ID der gewählten Zeile
        const confirmUpdate = confirm(`Möchten Sie die Änderungen wirklich auf die Zeilen-ID ${id} anwenden?`);

        if (confirmUpdate) {
            const updatedData = {
                id: id,
                section: sectionInput.value,
                question: questionInput.value,
                answer: answerInput.value
            };

            // Senden der Aktualisierungsanforderung an den Server
            fetch('/api/edit-faq', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedData)
            })
            .then(response => {
                if (!response.ok) throw new Error('Fehler bei der Datenaktualisierung');
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    // Aktualisierung der lokalen Tabelle mit neuen Werten
                    selectedRow.querySelector('td:nth-child(2)').innerText = updatedData.section;
                    selectedRow.querySelector('td:nth-child(3)').innerText = updatedData.question;
                    selectedRow.querySelector('td:nth-child(4)').innerText = updatedData.answer;

                    editFormContainer.classList.add('dash_hidden'); // Versteckt das Bearbeitungsformular
                    buttonContainer.style.display = 'block'; // Zeigt den Button-Container
                    alert('Daten erfolgreich aktualisiert');
                } else {
                    alert(data.message || 'Daten konnten nicht aktualisiert werden');
                }
            })
            .catch(error => {
                console.error(error);
                alert('Daten konnten nicht aktualisiert werden');
            });
        }
    });

    // Ereignislistener für den Zurück-Button im Bearbeitungsmodus
    backEditButton.addEventListener('click', () => {
        editFormContainer.classList.add('dash_hidden'); // Versteckt das Bearbeitungsformular
        buttonContainer.style.display = 'block'; // Zeigt den Button-Container
        sectionInput.value = '';
        questionInput.value = '';
        answerInput.value = '';
        selectedRow = null; // Setzt die Auswahl der Zeile zurück
    });
});

// Sektionen löschen
document.addEventListener('DOMContentLoaded', () => {
    if (!isAdmin()) {
        return;
    }
    // Elemente für die verschiedenen Container und Buttons abrufen
    const deleteSectionButton = document.getElementById('submit-delete-section');
    const buttonContainer = document.getElementById('button-container');
    const deleteSectionContainer = document.getElementById('delete-section-container-admin');
    const sectionSelect = document.getElementById('section-select-admin');
    const confirmButtons = document.getElementById('confirm-buttons-admin');
    const sectionInfo = document.getElementById('section-info-admin');
    const warningMessage = document.getElementById('warning-message-admin');
    const confirmDeleteButton = document.getElementById('confirm-delete-button-admin');
    const cancelDeleteButton = document.getElementById('cancel-delete-button-admin');

    // Event-Listener für den Button zum Löschen von Sektionen
    if (deleteSectionButton) {
        deleteSectionButton.addEventListener('click', () => {
            buttonContainer.style.display = 'none'; // Haupt-Button-Container ausblenden
            deleteSectionContainer.classList.remove('dash_hidden'); // Löschen-Container anzeigen

            const sectionContainer = document.getElementById('section-container');
            if (sectionContainer) {
                sectionContainer.style.display = 'none'; // Sektionen-Container ausblenden
            }

            // Abruf der Sektionen vom Server
            fetch('/admin/get-sections')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Fehler beim Laden der Abschnitte');
                    }
                    return response.json();
                })
                .then(data => {
                    const tableContainer = document.getElementById('section-table-container');
                    tableContainer.innerHTML = ''; // Vorherigen Inhalt löschen

                    const questionsTable = document.getElementById('questions-table');
                    if (questionsTable) {
                        questionsTable.style.display = 'none'; // Fragen-Tabelle ausblenden
                    }

                    if (data.length === 0) {
                        alert('Sektionen nicht gefunden.');
                        return;
                    }

                    // Tabelle für Sektionen erstellen und füllen
                    const table = document.createElement('table');
                    table.className = 'styled-table';
                    table.innerHTML = `
                        <thead>
                            <tr>
                                <th>Auswahl</th>
                                <th>ID der Sektionen</th>
                                <th>Sektion</th>
                                <th>Datenmenge</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    `;

                    // Jede Sektion als Zeile hinzufügen
                    data.forEach(section => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td><input type="checkbox" value="${section.id}"></td>
                            <td>${section.id}</td>
                            <td>${section.section_name}</td>
                            <td>${section.questionCount}</td>
                        `;

                        // Checkbox aktivieren/deaktivieren beim Klick auf die Zeile
                        row.addEventListener('click', (event) => {
                            const checkbox = row.querySelector('input[type="checkbox"]');
                            checkbox.checked = !checkbox.checked;
                        });

                        table.querySelector('tbody').appendChild(row);
                    });

                    tableContainer.appendChild(table); // Tabelle dem Container hinzufügen
                    confirmButtons.classList.remove('dash_hidden'); // Bestätigungs-Buttons anzeigen
                })
                .catch(error => {
                    alert(error.message);
                    console.error('Fehler beim Laden der Sektionen:', error);
                });
        });
    }

    // Event-Listener für den Bestätigungs-Button zum Löschen
    if (confirmDeleteButton) {
        confirmDeleteButton.addEventListener('click', () => {
            // Auswahl der markierten Sektionen
            const checkboxes = document.querySelectorAll('#section-table-container input[type="checkbox"]:checked');
            const selectedSections = Array.from(checkboxes).map(checkbox => checkbox.value);

            if (selectedSections.length === 0) {
                alert('Bitte wählen Sie mindestens eine Sektion zum Löschen aus.');
                return;
            }

            // Bestätigungsnachricht für das Löschen der ausgewählten Sektionen
            const confirmDelete = confirm(`Sind Sie sicher, dass Sie die Sektionen mit ID: ${selectedSections.join(', ')} löschen möchten?`);
            if (confirmDelete) {
                // Löschen jeder ausgewählten Sektion und aktualisieren der Tabelle danach
                Promise.all(selectedSections.map(sectionId => 
                    fetch(`/admin/delete-section/${sectionId}`, {
                        method: 'DELETE'
                    }).then(response => {
                        if (!response.ok) {
                            throw new Error(`Fehler beim Löschen der Sektion mit ID ${sectionId}`);
                        }
                        return response.json();
                    })
                ))
                .then(data => {
                    alert('Sektionen erfolgreich gelöscht.');
                    // Aktualisieren der Sektionstabelle nach dem Löschen
                    return fetchSections();
                })
                .then(() => {
                    // Aktualisieren der Fragen-Tabelle nach dem Löschen
                    loadQuestions(); // Funktion für das Laden der Fragen erneut aufrufen
                })
                .catch(error => {
                    console.error('Fehler:', error);
                    alert(error.message);
                });
            }
        });
    }

    // Event-Listener für den Abbrechen-Button
    if (cancelDeleteButton) {
        cancelDeleteButton.addEventListener('click', () => {
            deleteSectionContainer.classList.add('dash_hidden'); // Löschen-Container ausblenden
            buttonContainer.style.display = 'block'; // Haupt-Buttons wieder anzeigen

            if (sectionSelect) {
                sectionSelect.value = ''; // Auswahl zurücksetzen
            }

            warningMessage.classList.add('dash_hidden'); // Warnnachricht ausblenden
            sectionInfo.classList.add('dash_hidden'); // Sektion-Info ausblenden

            // Sektionstabelle aktualisieren beim Abbrechen
            fetchSections();

            const sectionContainer = document.getElementById('section-container');
            if (sectionContainer) {
                sectionContainer.style.display = 'block'; // Sektionen-Container anzeigen
            }

            const questionsTable = document.getElementById('questions-table');
            if (questionsTable) {
                questionsTable.style.display = 'block'; // Fragen-Tabelle anzeigen
            }
        });
    }

    // Funktion zum Abrufen und Anzeigen der Sektionen
    function fetchSections() {
        return fetch('/admin/get-sections')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Fehler beim Laden der Sektionen nach dem Löschen');
                }
                return response.json();
            })
            .then(data => {
                const sectionTableContainer = document.getElementById('section-table-container');
                sectionTableContainer.innerHTML = ''; // Vorherigen Inhalt löschen
                const table = document.createElement('table');
                table.className = 'styled-table';
                table.innerHTML = `
                    <thead>
                        <tr>
                            <th>Auswahl</th>
                            <th>ID der Sektionen</th>
                            <th>Sektion</th>
                            <th>Datenmenge</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                `;

                // Jede Sektion als Zeile hinzufügen
                data.forEach(section => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td><input type="checkbox" value="${section.id}"></td>
                        <td>${section.id}</td>
                        <td>${section.section_name}</td>
                        <td>${section.questionCount}</td>
                    `;

                    // Checkbox aktivieren/deaktivieren beim Klick auf die Zeile
                    row.addEventListener('click', (event) => {
                        const checkbox = row.querySelector('input[type="checkbox"]');
                        checkbox.checked = !checkbox.checked;
                    });

                    table.querySelector('tbody').appendChild(row);
                });
                sectionTableContainer.appendChild(table); // Tabelle dem Container hinzufügen
            });
    }
});
