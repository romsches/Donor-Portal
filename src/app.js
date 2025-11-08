const express = require('express'); // Express.js-Modul für den Webserver importieren
const mysql = require('mysql2'); // MySQL2-Modul für die Verbindung zur MySQL-Datenbank importieren
const path = require('path'); // Path-Modul für die Arbeit mit Dateipfaden importieren
const bodyParser = require('body-parser'); // Body-Parser-Modul für das Parsen von Anforderungs-Body-Daten importieren
const winston = require('winston'); // Winston-Modul für die Protokollierung importieren
const session = require('express-session'); // Express-Session-Modul für das Sessions-Management importieren
const bcrypt = require('bcryptjs'); // Bcrypt-Modul für die Passwortsicherung importieren
const dotenv = require('dotenv'); // dotenv-Modul für die Arbeit mit Umgebungsvariablen importieren

const app = express(); // Eine neue Instanz der Express-Anwendung erstellen

dotenv.config();

// Protokollierung mit Winston einrichten
const logger = winston.createLogger({
    level: 'info', // Setzt das Protokollierungsniveau auf 'info'
    format: winston.format.combine(
        winston.format.timestamp(), // Fügt einen Zeitstempel zu jedem Log-Eintrag hinzu
        winston.format.json() // Log-Einträge im JSON-Format speichern
    ),
    transports: [
        new winston.transports.Console(), // Log-Ausgabe wird in der Konsole angezeigt
    ],
});

// Middleware
app.use(express.json()); // Middleware für das Parsen von JSON-Daten im Anforderungs-Body
app.use(bodyParser.urlencoded({ extended: true })); // Middleware für das Parsen von URL-kodierten Daten im Anforderungs-Body
app.use(bodyParser.json()); // Middleware für das Parsen von JSON-Daten im Anforderungs-Body (wird hier zusätzlich verwendet)

// Sitzungen einrichten
app.use(session({
    // Секретный ключ из .env (у вас '123')
    secret: process.env.SESSION_SECRET, 
    // Запрещает сохранять сессию, если она не была изменена
    resave: false, 
    // Запрещает создавать сессию для неаутентифицированных пользователей
    saveUninitialized: false, 
    cookie: {
        // У вас в .env: COOKIE_SECURE=false. На локальном HTTP-сервере это критично!
        secure: process.env.COOKIE_SECURE === 'true', 
        // Запрещает доступ к куки через клиентский JavaScript
        httpOnly: true, 
        // Время жизни куки (например, 1 день)
        maxAge: 1000 * 60 * 60 * 24 
    }
}));

const dbUser = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_USER_PASSWORD,
    database: process.env.DB_NAME
});

const dbAdmin = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_ADMIN_USER,
    password: process.env.DB_ADMIN_PASSWORD,
    database: process.env.DB_NAME
});

// Middleware zur Auswahl einer Datenbankverbindung
function setDatabaseConnection(req, res, next) {
    req.db = req.session.adminId ? dbAdmin : dbUser; // Wenn der Benutzer ein Administrator ist, wird die Admin-Datenbank verwendet
    next(); // Weiter zur nächsten Middleware oder Route
}

// Middleware zur Auswahl der Datenbankverbindung
app.use(setDatabaseConnection); // Diese Middleware wählt die entsprechende Datenbankverbindung basierend auf der Session des Benutzers aus

// Middleware zur Protokollierung des Verbindungstyps
function logConnectionType(req, res, next) {
    // Bestimmt, ob der Benutzer ein Administrator ist und loggt den Verbindungstyp
    let connectionType = req.session.adminId ? 'adminname' : 'adminname';
    // Protokolliert die Anfrage, einschließlich des Verbindungstyps und der angeforderten URL
    logger.info(`Anfrage per Verbindung: ${connectionType}, URL: ${req.originalUrl}`);
    next(); // Übergibt die Kontrolle an die nächste Middleware oder Route
}

app.use(logConnectionType); // Aktiviert die Protokollierung für alle eingehenden Anfragen

// Middleware zur Deaktivierung des Caching
app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store'); // Setzt den Header, um das Caching zu verhindern
    next(); // Übergibt die Kontrolle an die nächste Middleware oder Route
});

// CORS einrichten (Cross-Origin Resource Sharing)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // Erlaubt Anfragen von allen Domains
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Erlaubt bestimmte Header
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Erlaubt bestimmte HTTP-Methoden
    next(); // Übergibt die Kontrolle an die nächste Middleware oder Route
});

// Statische Dateien und Vorlagen (Ressourcen wie Bilder, Skripte und Stylesheets)
app.use('/ejs', express.static(path.join(__dirname, 'views/ejs'))); // Statische HTML/Vorlagen-Dateien
app.use('/img', express.static(path.join(__dirname, 'public/img'))); // Statische Bilddateien
app.use('/js', express.static(path.join(__dirname, 'public/js'))); // Statische JavaScript-Dateien
app.use('/css', express.static(path.join(__dirname, 'public/css'))); // Statische CSS-Dateien

// EJS als Template-Engine festlegen
app.set('view engine', 'ejs'); // Legt EJS als Template-Engine fest
app.set('views', path.join(__dirname, 'views', 'ejs')); // Legt das Verzeichnis für die Vorlagen fest

// Routenhandler (Routen zur Darstellung von Seiten)

// Route für die Startseite (zeigt das Login-Formular an)
app.get('/', (req, res) => {
    res.render('login'); // Rendert die login.ejs Datei
});

// Route für die Login-Seite (wird ebenfalls verwendet, um das Login-Formular anzuzeigen)
app.get('/login', (req, res) => {
    res.render('login'); // Rendert die login.ejs Datei
});

// Route für die Fehlerseite bei Login (zeigt Fehlermeldung an, wenn der Login fehlschlägt)
app.get('/login-error', (req, res) => {
    res.render('login-error', { error: req.query.error || '' }); // Überträgt die Fehlernachricht an die login-error.ejs
});

// Route für die Admin-Login-Seite (zeigt das Admin-Login-Formular an)
app.get('/admin/login', (req, res) => {
    res.render('admin-login'); // Rendert die admin-login.ejs Datei
});

// Route für die Spender-Anmeldung (Login für Spender)
app.post('/login', (req, res) => {
    // Holt die SpenderID aus dem POST-Request
    const donorID = req.body.SpenderID;

    // Überprüft, ob eine SpenderID eingegeben wurde
    if (!donorID) {
        return res.redirect('/login-error?error=Bitte geben Sie Ihre SpenderID ein.'); // Wenn keine SpenderID vorhanden ist, wird eine Fehlermeldung angezeigt
    }

    // SQL-Abfrage, um den Spender anhand der ID zu finden
    const sqlQuery = 'SELECT * FROM spender WHERE blutspender_id = ?';
    
    // Datenbankabfrage durchführen
    dbUser.query(sqlQuery, [donorID], (error, results) => {
        if (error) {
            // Protokolliert einen Fehler, wenn die Anfrage fehlschlägt
            logger.error('Fehler bei der Ausführung der Anfrage:', error);
            return res.status(500).send('Interner Serverfehler'); // Gibt eine 500-Fehlerseite zurück
        }
        
        // Wenn der Spender in der Datenbank gefunden wurde
        if (results.length > 0) {
            const donor = results[0]; // Holt den ersten Spender aus den Ergebnissen
            res.render('table', { meetings: [], canDonate: true, selectedLocation: '', selectedDate: '', SpenderID: donorID }); // Rendert die Tabelle für den Spender
        } else {
            // Wenn der Spender nicht gefunden wurde, wird eine Fehlermeldung angezeigt
            return res.redirect('/login-error?error=Invalid donor ID'); // Weiterleitung zur Fehlerseite
        }
    });
});

// ---------------------------------
// ** API Anfragen und Antworten **
// ---------------------------------

// AKTUALISIERUNG DER SPENDETERMINE-TABELLE
app.get('/refreshTable', (req, res) => {
    // Holt die SpenderID, den ausgewählten Standort und das ausgewählte Datum aus den Abfrageparametern
    const donorID = req.query.SpenderID;
    const selectedLocation = req.query.location;
    const selectedDate = req.query.date;

    // SQL-Abfrage für die Spendetermine-Tabelle
    let sqlQuery = `
            SELECT 
                DATE_FORMAT(spendetermine.datum, '%d.%m.%Y') AS Datum,  -- Formatieren des Datums
                ort.strasse AS Strasse,                                 -- Straße des Ortes
                ort.stadt AS Stadt,                                     -- Stadt des Ortes
                CONCAT(spendetermine.uhrzeit_von, ' - ', spendetermine.uhrzeit_bis) AS Uhrzeit,  -- Uhrzeit der Spende
                status.status AS Status                                 -- Status des Spendetermins
            FROM spendetermine
            JOIN ort ON spendetermine.orts_id = ort.orts_id             -- Join der Tabellen für den Ort
            JOIN status ON spendetermine.status_id = status.status_id   -- Join der Tabellen für den Status
            `;

    // Hinzufügen des Joins zur 'spende'-Tabelle, falls wir nach einem Spender filtern
    // Ein LEFT JOIN ist notwendig, um auch zukünftige Termine anzuzeigen, die noch keine abgeschlossene Spende sind.
    if (donorID) {
        sqlQuery += `
            LEFT JOIN spende ON spendetermine.termin_id = spende.termin_id
            `;
    }

    // Array für Filterbedingungen und Abfrageparameter
    const filterConditions = [];
    const queryParams = [];

    // Wenn ein Standort ausgewählt wurde, füge eine Filterbedingung hinzu
    if (selectedLocation && selectedLocation !== 'All Locations') {
        filterConditions.push('ort.stadt = ?');
        queryParams.push(selectedLocation);
    }

    // Wenn ein Datum ausgewählt wurde, füge eine Filterbedingung hinzu
    if (selectedDate) {
        // Wir filtern Termine, die am oder nach dem ausgewählten Datum liegen
        filterConditions.push('spendetermine.datum >= ?');
        queryParams.push(selectedDate);
    } else {
        // Wenn kein Datum angegeben wurde (als Absicherung), benutze das heutige Datum
        filterConditions.push('spendetermine.datum >= ?');
        queryParams.push(new Date().toISOString().split('T')[0]);
    }

    // Wenn eine SpenderID angegeben wurde, füge auch eine Filterbedingung für den Spender hinzu
    if (donorID) {
        // Filtern nach der SpenderID in der Tabelle 'spende'
        filterConditions.push('spende.blutspender_id = ?');
        queryParams.push(donorID);
    }

    // Wenn Filterbedingungen existieren, füge sie der SQL-Abfrage hinzu
    if (filterConditions.length > 0) {
        sqlQuery += ' WHERE ' + filterConditions.join(' AND ');
    }

    // Sortiere die Ergebnisse nach Datum
    sqlQuery += ' ORDER BY spendetermine.datum ASC';

    // Führe die Abfrage aus
    dbUser.query(sqlQuery, queryParams, (error, results) => {
        if (error) {
            // Fehlerbehandlung, wenn die Abfrage fehlschlägt
            logger.error('Fehler bei der Ausführung der Anfrage:', error);
            res.status(500).json({ error: 'Interner Serverfehler' });
        } else {
            // Rückgabe der Ergebnisse als JSON
            res.json({ meetings: results, canDonate: true });
        }
    });
});

// TABELLE NACH DEM FILTERUNG AKTUALISIEREN
app.get('/cities', (req, res) => {
    // SQL-Abfrage, um alle Städte (Standorte) der Spendetermine abzurufen
    const sqlQuery = 'SELECT DISTINCT ort.stadt AS Ort FROM spendetermine JOIN ort ON spendetermine.orts_id = ort.orts_id';

    // Führe die Abfrage aus
    dbUser.query(sqlQuery, (error, results) => {
        if (error) {
            // Fehlerbehandlung, wenn die Abfrage fehlschlägt
            logger.error('Fehler bei der Ausführung der Anfrage:', error);
            return res.status(500).json({ error: 'Interner Serverfehler' });
        } else {
            // Rückgabe der Städte als JSON
            res.json({ cities: results.map(row => ({ Ort: row.Ort })) });
        }
    });
});

// ---------------------------------
// ** API Anfragen und Antworten für Chatbot **
// ---------------------------------

// ERHALTUNG DER DATEN FÜR FAQ-SEKTIONEN
app.get('/api/faq-sections', (req, res) => {
    // SQL-Abfrage für alle Sektionen der FAQ
    const sqlQuery = 'SELECT section_name FROM faq_sections';

    // Führe die Abfrage aus
    dbUser.query(sqlQuery, (error, results) => {
        if (error) {
            // Fehlerbehandlung, wenn die Abfrage fehlschlägt
            logger.error('Fehler bei der Ausführung der Anfrage:', error);
            return res.status(500).json({ error: 'Interner Serverfehler' });
        }
        // Rückgabe der Sektionen als JSON
        res.json({ sections: results.map(row => row.section_name) });
    });
});

// ERHALTUNG DER DATEN FÜR FAQ-VERWEISFRAGEN
app.get('/api/faq-questions', (req, res) => {
    // Holt die Sektion aus den Abfrageparametern (falls angegeben)
    const section = req.query.section || '';

    // SQL-Abfrage je nachdem, ob eine Sektion angegeben wurde oder nicht
    const sqlQuery = section ? 
        'SELECT cf.*, fs.section_name FROM chat_faq cf JOIN faq_sections fs ON cf.section_id = fs.id WHERE fs.section_name = ?' : 
        'SELECT cf.*, fs.section_name FROM chat_faq cf JOIN faq_sections fs ON cf.section_id = fs.id';

    // Führe die Abfrage aus
    dbUser.query(sqlQuery, [section], (error, results) => {
        if (error) {
            // Fehlerbehandlung, wenn die Abfrage fehlschlägt
            logger.error('Fehler bei der Ausführung der Anfrage:', error);
            return res.status(500).json({ error: 'Interner Serverfehler' });
        }
        // Rückgabe der Fragen als JSON
        res.json({ questions: results });
    });
});

// ERHALTUNG DER DATEN FÜR DIE ANTWORTEN AUF FRAGEN
app.get('/api/faq-answer', (req, res) => {
    // Holt die Frage aus den Abfrageparametern
    const { question } = req.query;

    // Wenn keine Frage angegeben ist, gibt es einen Fehler zurück
    if (!question) {
        return res.status(400).json({ error: 'Frage nicht angegeben' });
    }

    // SQL-Abfrage für die Antwort auf eine gegebene Frage
    const sqlQuery = 'SELECT answer FROM chat_faq WHERE question = ?';

    // Führe die Abfrage aus
    dbUser.query(sqlQuery, [question], (error, results) => {
        if (error) {
            // Fehlerbehandlung, wenn die Abfrage fehlschlägt
            logger.error('Fehler bei der Ausführung der Anfrage:', error);
            return res.status(500).json({ error: 'Interner Serverfehler' });
        }
        // Wenn Ergebnisse gefunden wurden, gibt die Antwort zurück
        if (results.length > 0) {
            res.json({ answer: results[0].answer });
        } else {
            // Wenn keine Antwort gefunden wurde, gibt einen 404-Fehler zurück
            res.status(404).json({ error: 'Antwort nicht gefunden' });
        }
    });
});

// EINFÜGEN - Fügt eine neue FAQ (Frage und Antwort) hinzu
app.post('/api/add-faq', (req, res) => {
    const { section, question, answer } = req.body;

    // Überprüfen, ob alle erforderlichen Felder ausgefüllt sind
    if (!section || !question || !answer) {
        return res.status(400).json({ success: false, message: 'Alle Felder sind erforderlich.' });
    }

    // Überprüfen, ob die angegebene Sektion existiert
    const checkSectionQuery = 'SELECT id FROM faq_sections WHERE section_name = ?';
    dbAdmin.query(checkSectionQuery, [section], (err, sectionResults) => {
        if (err) {
            logger.error('Fehler bei der Ausführung der Anfrage:', err);
            return res.status(500).json({ success: false, message: 'Interner Serverfehler' });
        }

        let sectionId;

        // Wenn die Sektion nicht existiert, fügen wir eine neue Sektion hinzu
        if (sectionResults.length === 0) {
            const insertSectionQuery = 'INSERT INTO faq_sections (section_name) VALUES (?)';
            dbAdmin.query(insertSectionQuery, [section], (insertErr, result) => {
                if (insertErr) {
                    logger.error('Fehler beim Hinzufügen der Sektion:', insertErr);
                    return res.status(500).json({ success: false, message: 'Interner Serverfehler' });
                }
                sectionId = result.insertId; // ID der neuen Sektion speichern

                // Überprüfen, ob die Frage bereits existiert
                const checkQuestionQuery = 'SELECT COUNT(*) AS count FROM chat_faq WHERE section_id = ? AND question = ?';
                dbAdmin.query(checkQuestionQuery, [sectionId, question], (checkErr, questionResults) => {
                    if (checkErr) {
                        logger.error('Fehler bei der Überprüfung der Frage:', checkErr);
                        return res.status(500).json({ success: false, message: 'Interner Serverfehler' });
                    }

                    // Wenn die Frage bereits existiert, Fehler zurückgeben
                    if (questionResults[0].count > 0) {
                        return res.status(400).json({ success: false, message: 'Diese Frage existiert bereits.' });
                    }

                    // Füge die FAQ (Frage und Antwort) in die Datenbank ein
                    const sqlQuery = 'INSERT INTO chat_faq (section_id, question, answer) VALUES (?, ?, ?)';
                    dbAdmin.query(sqlQuery, [sectionId, question, answer], (insertFaqErr) => {
                        if (insertFaqErr) {
                            logger.error('Fehler bei der Ausführung der Anfrage:', insertFaqErr);
                            return res.status(500).json({ success: false, message: 'Interner Serverfehler' });
                        }
                        res.json({ success: true, message: 'FAQ erfolgreich hinzugefügt.' });
                    });
                });
            });
        } else {
            // Wenn die Sektion bereits existiert, verwende deren ID
            sectionId = sectionResults[0].id;

            // Überprüfen, ob die Frage bereits existiert
            const checkQuestionQuery = 'SELECT COUNT(*) AS count FROM chat_faq WHERE section_id = ? AND question = ?';
            dbAdmin.query(checkQuestionQuery, [sectionId, question], (checkErr, questionResults) => {
                if (checkErr) {
                    logger.error('Fehler bei der Überprüfung der Frage:', checkErr);
                    return res.status(500).json({ success: false, message: 'Interner Serverfehler' });
                }

                // Wenn die Frage bereits existiert, Fehler zurückgeben
                if (questionResults[0].count > 0) {
                    return res.status(400).json({ success: false, message: 'Fehler: Diese Frage existiert bereits.' });
                }

                // Füge die FAQ (Frage und Antwort) in die Datenbank ein
                const sqlQuery = 'INSERT INTO chat_faq (section_id, question, answer) VALUES (?, ?, ?)';
                dbAdmin.query(sqlQuery, [sectionId, question, answer], (error) => {
                    if (error) {
                        logger.error('Fehler bei der Ausführung der Anfrage:', error);
                        return res.status(500).json({ success: false, message: 'Interner Serverfehler' });
                    }
                    res.json({ success: true, message: 'FAQ erfolgreich hinzugefügt.' });
                });
            });
        }
    });
});

// RESET AUTO-INCREMENT - Setzt den AUTO_INCREMENT-Wert der Tabelle zurück
app.post('/api/reset-auto-increment', (req, res) => {
    const sqlQuery = 'ALTER TABLE chat_faq AUTO_INCREMENT = 1';
    dbAdmin.query(sqlQuery, (error) => {
        if (error) {
            logger.error('Fehler bei der Ausführung der Anfrage:', error);
            return res.status(500).json({ success: false, message: 'Interner Serverfehler' });
        }
        res.json({ success: true, message: 'AUTO_INCREMENT erfolgreich zurückgesetzt.' });
    });
});

// BEARBEITEN - Aktualisiert eine bestehende FAQ (Frage und Antwort)
app.post('/api/edit-faq', (req, res) => {
    const { id, section, question, answer } = req.body;

    // Überprüfen, ob alle erforderlichen Felder ausgefüllt sind
    if (!id || !question || !answer || !section) {
        return res.status(400).json({ success: false, message: 'Alle Felder sind erforderlich.' });
    }

    // Überprüfen, ob die angegebene Sektion existiert
    const checkSectionQuery = 'SELECT id FROM faq_sections WHERE section_name = ?';
    dbAdmin.query(checkSectionQuery, [section], (err, sectionResults) => {
        if (err) {
            logger.error('Fehler bei der Ausführung der Anfrage:', err);
            return res.status(500).json({ success: false, message: 'Interner Serverfehler' });
        }

        let sectionId;

        // Wenn die Sektion nicht existiert, fügen wir eine neue Sektion hinzu
        if (sectionResults.length === 0) {
            const insertSectionQuery = 'INSERT INTO faq_sections (section_name) VALUES (?)';
            dbAdmin.query(insertSectionQuery, [section], (insertErr, result) => {
                if (insertErr) {
                    logger.error('Fehler beim Hinzufügen der Sektion:', insertErr);
                    return res.status(500).json({ success: false, message: 'Interner Serverfehler' });
                }
                sectionId = result.insertId; // ID der neuen Sektion speichern

                // Jetzt die FAQ (Frage und Antwort) aktualisieren
                const sqlQuery = 'UPDATE chat_faq SET question = ?, answer = ?, section_id = ? WHERE id = ?';
                dbAdmin.query(sqlQuery, [question, answer, sectionId, id], (error) => {
                    if (error) {
                        logger.error('Fehler bei der Ausführung der Anfrage:', error);
                        return res.status(500).json({ success: false, message: 'Interner Serverfehler' });
                    }
                    res.json({ success: true, message: 'FAQ erfolgreich aktualisiert.' });
                });
            });
        } else {
            // Wenn die Sektion bereits existiert, verwende deren ID
            sectionId = sectionResults[0].id;

            // Aktualisieren der FAQ (Frage und Antwort)
            const sqlQuery = 'UPDATE chat_faq SET question = ?, answer = ?, section_id = ? WHERE id = ?';
            dbAdmin.query(sqlQuery, [question, answer, sectionId, id], (error) => {
                if (error) {
                    logger.error('Fehler bei der Ausführung der Anfrage:', error);
                    return res.status(500).json({ success: false, message: 'Interner Serverfehler' });
                }
                res.json({ success: true, message: 'FAQ erfolgreich aktualisiert.' });
            });
        }
    });
});

// UPDATE nach Änderungen der FAQ-Sektionen
app.post('/api/update-chat-faq-sections', (req, res) => {
    // Holen Sie sich alle Sektionen aus der faq_sections Tabelle
    const getSectionsQuery = 'SELECT id, section_name FROM faq_sections';
    
    dbAdmin.query(getSectionsQuery, (err, sections) => {
        if (err) {
            logger.error('Fehler beim Abrufen der Sektionen:', err);
            return res.status(500).json({ success: false, message: 'Interner Serverfehler' });
        }

        // Aktualisierung der Sektionen in der Tabelle chat_faq
        const updatePromises = sections.map(section => {
            const updateQuery = 'UPDATE chat_faq SET section_id = ? WHERE question LIKE ? AND section_id IS NULL';
            return new Promise((resolve, reject) => {
                // Angenommen, die Fragen enthalten den Namen der Sektion
                dbAdmin.query(updateQuery, [section.id, `%${section.section_name}%`], (updateErr) => {
                    if (updateErr) {
                        logger.error('Fehler beim Aktualisieren der FAQs:', updateErr);
                        reject(updateErr);
                    } else {
                        resolve();
                    }
                });
            });
        });

        // Warten auf die Ergebnisse der Aktualisierungen und Rückmeldung an den Benutzer
        Promise.all(updatePromises)
            .then(() => {
                res.json({ success: true, message: 'FAQ-Sektionen erfolgreich aktualisiert.' });
            })
            .catch(() => {
                res.status(500).json({ success: false, message: 'Fehler beim Aktualisieren der FAQs.' });
            });
    });
});

// Aktualisierung einer spezifischen FAQ-Zeile
app.post('/api/update-row', (req, res) => {
    const { id, section_name, question, answer } = req.body;

    // Überprüfen, ob alle erforderlichen Daten vorhanden sind
    if (!id || !section_name || !question || !answer) {
        console.log('Fehler: Nicht genug Daten zum Aktualisieren der Zeile');
        return res.status(400).json({ success: false, message: 'Alle Felder müssen ausgefüllt werden' });
    }

    // Suchen Sie zuerst die ID der Sektion anhand des Namens der Sektion
    const sectionQuery = 'SELECT id FROM faq_sections WHERE section_name = ?';
    
    dbAdmin.query(sectionQuery, [section_name], (sectionError, sectionResults) => {
        if (sectionError) {
            console.error('Fehler beim Suchen der Sektion:', sectionError);
            return res.status(500).json({ success: false, message: 'Fehler beim Suchen der Sektion' });
        }

        // Wenn die Sektion nicht gefunden wird, fügen wir eine neue Sektion hinzu
        if (sectionResults.length === 0) {
            const insertSectionQuery = 'INSERT INTO faq_sections (section_name) VALUES (?)';
            
            dbAdmin.query(insertSectionQuery, [section_name], (insertError, insertResults) => {
                if (insertError) {
                    console.error('Fehler beim Hinzufügen der neuen Sektion:', insertError);
                    return res.status(500).json({ success: false, message: 'Fehler beim Hinzufügen der neuen Sektion' });
                }

                // Holen Sie sich die ID der neu erstellten Sektion
                const newSectionId = insertResults.insertId;

                // Aktualisieren Sie die Zeile in der Tabelle chat_faq mit der neuen section_id
                updateFaqRow(newSectionId);
            });
        } else {
            // Wenn die Sektion bereits existiert, verwenden wir die ID der Sektion zum Aktualisieren der Zeile
            const existingSectionId = sectionResults[0].id;
            updateFaqRow(existingSectionId);
        }

        // Funktion zum Aktualisieren der Zeile in der Tabelle chat_faq
        function updateFaqRow(section_id) {
            const updateQuery = 'UPDATE chat_faq SET section_id = ?, question = ?, answer = ? WHERE id = ?';
            const updateValues = [section_id, question, answer, id];

            dbAdmin.query(updateQuery, updateValues, (updateError, updateResults) => {
                if (updateError) {
                    console.error('Fehler beim Aktualisieren der Zeile:', updateError);
                    return res.status(500).json({ success: false, message: 'Fehler beim Aktualisieren der Zeile' });
                }

                return res.json({ success: true, message: 'Zeile erfolgreich aktualisiert' });
            });
        }
    });
});

// Löschen einer FAQ-Datenzeile
app.post('/api/delete-faq', (req, res) => {
    const { id } = req.body;
    
    // Überprüfen, ob eine ID vorhanden ist
    if (!id) {
        return res.status(400).json({ success: false, message: 'ID ist erforderlich.' });
    }

    // SQL-Abfrage zum Löschen der FAQ-Zeile anhand der ID
    const sqlQuery = 'DELETE FROM chat_faq WHERE id = ?';
    
    dbAdmin.query(sqlQuery, [id], (error) => {
        if (error) {
            logger.error('Fehler bei der Ausführung der Anfrage:', error);
            res.status(500).json({ success: false, message: 'Interner Serverfehler' });
        } else {
            res.json({ success: true, message: 'FAQ erfolgreich gelöscht.' });
        }
    });
});


// Sektion löschen (entfernen)
app.delete('/admin/delete-section/:id', (req, res) => {
    const sectionId = req.params.id; // Holt sich die ID der Sektion aus den Parametern

    // Zuerst löschen wir alle Datensätze aus der Tabelle chat_faq, die mit dieser Sektion verbunden sind
    dbAdmin.query('DELETE FROM chat_faq WHERE section_id = ?', [sectionId], (err, result) => {
        if (err) {
            console.error('Fehler beim Löschen der verbundenen Daten:', err);
            return res.status(500).json({ error: 'Fehler beim Löschen der verbundenen Daten.' });
        }

        // Dann löschen wir die Sektion selbst
        dbAdmin.query('DELETE FROM faq_sections WHERE id = ?', [sectionId], (err, result) => {
            if (err) {
                console.error('Error deleting section:', err);
                return res.status(500).json({ error: 'Error deleting section.' });
            }

            // Erfolgreich gelöscht
            res.status(200).json({ message: 'Section and associated data have been successfully deleted..' });
        });
    });
});

// Information zur Sektion abrufen
app.get('/admin/get-section-info/:id', (req, res) => {
    const sectionId = req.params.id;

    // Abfrage der Datenbank, um Informationen zur Sektion zu erhalten
    dbAdmin.query('SELECT * FROM faq_sections WHERE id = ?', [sectionId], (error, results) => {
        if (error) {
            console.error('Error retrieving section information:', error);
            return res.status(500).json({ error: 'Error retrieving section information.' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Section not found.' });
        }
        res.json(results[0]); // Gibt die Informationen zur Sektion zurück
    });
});

// Alle Sektionen abrufen (mit der Anzahl der Fragen pro Sektion)
app.get('/admin/get-sections', (req, res) => {
    const query = `
        SELECT s.id, s.section_name, COUNT(f.id) AS questionCount 
        FROM faq_sections s 
        LEFT JOIN chat_faq f ON s.id = f.section_id 
        GROUP BY s.id
    `;

    req.db.query(query, (error, sections) => {
        if (error) {
            console.error('Error retrieving sections:', error);
            return res.status(500).json({ error: 'Error retrieving sections.' });
        }
        res.json(sections); // Gibt alle Sektionen zurück, einschließlich der Anzahl der Fragen
    });
});

// FAQ-Sektionen aktualisieren
app.get('/api/update-faq-sections', (req, res) => {
    const sqlQuery = 'SELECT section_name FROM faq_sections';
    dbUser.query(sqlQuery, (error, results) => {
        if (error) {
            logger.error('Error while executing the request:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json({ sections: results.map(row => row.section_name) }); // Gibt die Namen der Sektionen zurück
    });
});

// ---------------------------------
// ** Sonstige Routen **
// ---------------------------------

// Route für die 'Über uns'-Seite
app.get('/about', (req, res) => {
    res.render('about'); // Rendert die 'about'-Seite
});

// Route für die 'Kontakt'-Seite
app.get('/contact', (req, res) => {
    res.render('contact'); // Rendert die 'contact'-Seite
});

// Middleware zur Sitzungsprüfung, um sicherzustellen, dass der Benutzer eingeloggt ist
function ensureAuthenticated(req, res, next) {
    if (req.session.adminId) {
        return next(); // Wenn der Benutzer eingeloggt ist, wird die nächste Middleware aufgerufen
    }
    res.redirect('/admin/login'); // Wenn der Benutzer nicht eingeloggt ist, wird zur Login-Seite umgeleitet
}

// Middleware für die ADMIN-DASHBOARD-ÜBERPRÜFUNG
app.get('/admin/dashboard', ensureAuthenticated, (req, res) => {
    // Wenn die Sitzung des Administrators nicht existiert, wird er auf die Login-Seite weitergeleitet
    if (!req.session.adminId) {
        return res.redirect('/admin/login');
    }

    const adminId = req.session.adminId; // Holt sich die ID des Administrators aus der Sitzung

    // SQL-Abfragen zur Überprüfung der Berechtigungen des Administrators und seiner Daten
    const sqlQueryPermissions = 'SELECT * FROM admin_permission WHERE admin_id = ?';
    const sqlQueryAdmin = 'SELECT * FROM admins WHERE admin_id = ?';

    // Abfrage für die Berechtigungen des Administrators
    req.db.query(sqlQueryPermissions, [adminId], (error, results) => {
        if (error) {
            logger.error('Error while executing the request:', error);
            return res.status(500).send('Internal server error');
        }

        const privileges = results.map(result => result.permission); // Extrahiert alle Berechtigungen des Administrators

        // 🔥 ИСПРАВЛЕНИЕ: Добавляем ключ 'admin' в массив, который ожидает клиентский код.
        if (privileges.length > 0) {
            privileges.push('admin'); 
        }

        // Abfrage für die Daten des Administrators
        req.db.query(sqlQueryAdmin, [adminId], (error, adminResults) => {
            if (error) {
                logger.error('Error while executing the request:', error);
                return res.status(500).send('Internal server error');
            }

            const admin = adminResults[0]; // Holt sich die Informationen des Administrators

            // Rendert das Dashboard und übergibt die Daten der Berechtigungen und des Administrators
            res.render('dashboard', {
                permissions: results, // Berechtigungen des Administrators
                adminId: adminId, // ID des Administrators
                adminName: admin.username, // Benutzername des Administrators
                privileges: privileges // Alle Berechtigungen des Administrators
            });
        });
    });
});

// ---------------------------------
// ** ABMELDEN (Logout) **
// ---------------------------------

// Route für den Logout-Mechanismus
app.post('/admin/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            logger.error('Error terminating session:', err);
            return res.status(500).send('Error terminating session');
        }
        res.clearCookie('connect.sid'); // Löscht das Sitzungscookie
        res.redirect('/admin/login'); // Weiterleitung zur Login-Seite nach dem Logout
    });
});

// ---------------------------------
// ** WER HAT SICH ANGEMELDET (Session-Überprüfung) **
// ---------------------------------

// Route, um zu überprüfen, ob der Administrator eingeloggt ist
app.get('/admin/check-session', (req, res) => {
    if (req.session.adminId) {
        res.json({ isAuthenticated: true }); // Wenn der Administrator eingeloggt ist
    } else {
        res.json({ isAuthenticated: false }); // Wenn der Administrator nicht eingeloggt ist
    }
});

// ---------------------------------
// ** ANMELDUNG ADMIN-SEITE (Login) **
// ---------------------------------

// API: Administrator login handler
app.post('/admin/login', (req, res) => {
    // Destructure user input (username and password) from the request body
    const { username, password } = req.body;

    // Check if username and password are provided
    if (!username || !password) {
        return res.status(400).json({
            errors: {
                // If username is missing
                username: !username ? 'Username is required.' : undefined,
                // If password is missing
                password: !password ? 'Password is required.' : undefined,
            },
        });
    }

    // SQL query to find the user by username
    const sqlQuery = 'SELECT * FROM admins WHERE username = ?';
    // FIX: Using dbAdmin.query to resolve "ReferenceError: db is not defined"
    dbAdmin.query(sqlQuery, [username], (error, results) => {
        if (error) {
            // Log SQL query error
            logger.error('Database error while searching for administrator:', error);
            // FIX: Returning JSON for 500 error to avoid client-side SyntaxError
            return res.status(500).json({ general: 'Internal server error while executing query.' });
        }

        // Check if administrator was found in the database
        if (results.length > 0) {
            const admin = results[0]; // The first administrator found

            // Compare the hashed password with the provided password
            bcrypt.compare(password, admin.password, (bcryptErr, bcryptRes) => {
                if (bcryptErr) {
                    // Log error if password verification failed
                    logger.error('Error during password verification:', bcryptErr);
                    // FIX: Returning JSON for 500 error to avoid client-side SyntaxError
                    return res.status(500).json({ general: 'Internal server error during password check.' });
                }

                // If password is correct
                if (bcryptRes) {
                    // Save administrator ID in the session
                    req.session.adminId = admin.admin_id;
                    // Return successful response
                    return res.status(200).send('Successful login');
                } else {
                    // Return error if password is incorrect
                    return res.status(400).json({
                        errors: { password: 'Incorrect password' },
                    });
                }
            });
        } else {
            // Return error if username was not found
            return res.status(400).json({
                errors: { username: 'User not found' },
            });
        }
    });
});


// ---------------------------------
// ** Server starten **
// ---------------------------------

// Definiert den Port für den Server
const PORT = process.env.PORT || 7777;
app.listen(PORT, () => {
    console.log(`Der Server läuft auf Port ${PORT}`); // Bestätigt, dass der Server läuft
});

