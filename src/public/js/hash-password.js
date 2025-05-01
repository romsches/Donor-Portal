const bcrypt = require('bcryptjs');

const plainPassword = '12345'; // Ersetzen dies durch das tatsächliche Passwort

bcrypt.hash(plainPassword, 10, (err, hashedPassword) => {
    if (err) {
        console.error('Fehler beim Hashen des Passworts:', err); // Fehler beim Hashen des Passworts ausgeben
        return;
    }
    console.log('Gehashtes Passwort:', hashedPassword); // Gehashtes Passwort ausgeben
});
