document.addEventListener('DOMContentLoaded', () => {
    // DOM-Elemente
    const chatToggle = document.getElementById('chat-toggle');
    const chatContainer = document.getElementById('chat-container');
    const chatClose = document.getElementById('chat-close');
    const chatInput = document.getElementById('chat-input');
    const chatSendButton = document.getElementById('chat-send-button');
    const chatMessages = document.getElementById('chat-messages');
    const errorMessage = createErrorMessage();

    let sections = []; // Liste der Sektionen
    let currentSection = ''; // Aktuell ausgewählte Sektion
    let isGreetingShown = false; // Flag zur Steuerung der Begrüßungsanzeige

    // Initialisierung des Chats
    initChat();
    loadSections();
    setInterval(loadSections, 10000); // Daten alle 10 Sekunden anfordern

    // Erstellung eines Elements für die Fehleranzeige
    function createErrorMessage() {
        const error = document.createElement('div');
        error.className = 'error-message';
        error.style.display = 'none';
        chatContainer.insertBefore(error, chatMessages);
        return error;
    }

    // Initialisierung der Chat-Ereignisse
    function initChat() {
        chatToggle.addEventListener('click', openChat);
        chatClose.addEventListener('click', closeChat);
        chatSendButton.addEventListener('click', sendMessage);
        chatInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') sendMessage();
        });
    }

    // Öffnen des Chats und Anzeige der Begrüßung
    function openChat() {
        chatContainer.classList.add('open');
        if (!isGreetingShown) {
            sendGreeting();
        }
    }

    // Schließen des Chats
    function closeChat() {
        chatContainer.classList.remove('open');
    }

    // Senden einer Nachricht
    function sendMessage() {
        const userMessage = chatInput.value.trim();
        if (userMessage) {
            displayErrorMessage(false);
            addMessage('user-message', userMessage);
            chatInput.value = '';

            fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: userMessage })
            })
            .then(response => response.json())
            .then(data => {
                addMessage('bot-message', data.reply || 'Keine Antwort gefunden.');
                scrollToBottom();
            })
            .catch(error => {
                console.error('Fehler:', error);
                addMessage('bot-message', 'Es gab ein Problem beim Senden Ihrer Nachricht.');
                scrollToBottom();
            });
        } else {
            displayErrorMessage(true, 'Bitte geben Sie eine Nachricht ein, um sie zu senden.');
        }
    }

    // Senden einer Begrüßungsnachricht
    function sendGreeting() {
        const greetingMessage = 'Willkommen im Chat! Wie kann ich Ihnen helfen?<br><button class="section-button">Wählen Sie eine Sektion</button>';
        addMessage('bot-message greeting-message', greetingMessage);
        scrollToBottom();
        isGreetingShown = true;
        attachSectionButtonHandler();
    }

    // Laden der Sektionen aus der API
    function loadSections() {
        fetch('/api/faq-sections')
            .then(response => response.json())
            .then(data => {
                sections = data.sections || [];
                
                // Benutzer informieren, dass die Daten aktualisiert wurden
                //if (sections.length > 0) {
                //    addMessage('bot-message', 'Daten wurden aktualisiert. Bitte wählen Sie eine Sektion.');
                //}
            })
            .catch(error => {
                console.error('Fehler beim Laden der Sektionen:', error);
                addMessage('bot-message', 'Es gab ein Problem beim Laden der Sektion.');
            });
    }

    // Anzeige der Sektionen
    function showSections() {
        const sectionMessage = 'Bitte wählen Sie eine Sektion:<br>' + sections.map(section => `<button class="section-option">${section}</button>`).join('<br>');
        addMessage('bot-message', sectionMessage);
        scrollToBottom();
        attachSectionOptionHandlers();
    }

    // Zuweisung des Event-Handlers für die Schaltfläche "Sektion wählen"
    function attachSectionButtonHandler() {
        const sectionButton = document.querySelector('.section-button');
        if (sectionButton) {
            sectionButton.addEventListener('click', () => {
                chatMessages.innerHTML = ''; // Nachrichten löschen, bevor die Sektionen angezeigt werden
                showSections();
            });
        }
    }

    // Deaktivieren aller Schaltflächen, die dem Selektor entsprechen
    function disableAllButtons(selector) {
        document.querySelectorAll(selector).forEach(button => {
            button.disabled = true;
        });
    }

    // Zuweisung der Event-Handler für die Schaltflächen mit Sektionen
    function attachSectionOptionHandlers() {
        document.querySelectorAll('.section-option').forEach(button => {
            button.addEventListener('click', () => {
                disableAllButtons('.section-option');
                currentSection = button.textContent.trim();
                showQuestions(currentSection);
            });
        });
    }

    // Anzeige der Fragen aus der gewählten Sektion
    function showQuestions(section) {
        fetch(`/api/faq-questions?section=${encodeURIComponent(section)}`)
            .then(response => response.json())
            .then(data => {
                if (data.questions) {
                    const questionsMessage = 'Bitte wählen Sie eine Frage:<br>' + data.questions.map(q => `<button class="question-option">${q.question}</button>`).join('<br>');
                    addMessage('bot-message', questionsMessage);
                    scrollToBottom();
                    attachQuestionOptionHandlers();
                } else {
                    addMessage('bot-message', 'Keine Fragen gefunden.');
                }
            })
            .catch(error => {
                console.error('Fehler beim Laden der Fragen:', error);
                addMessage('bot-message', 'Es gab ein Problem beim Laden der Fragen.');
            });
    }

    // Zuweisung der Event-Handler für die Schaltflächen mit Fragen
    function attachQuestionOptionHandlers() {
        document.querySelectorAll('.question-option').forEach(button => {
            button.addEventListener('click', () => {
                disableAllButtons('.question-option');
                const questionText = button.textContent;
                showAnswer(questionText);
            });
        });
    }

    // Anzeige der Antwort auf die gewählte Frage
    function showAnswer(question) {
        fetch(`/api/faq-answer?question=${encodeURIComponent(question)}`)
            .then(response => response.json())
            .then(data => {
                addMessage('bot-message', data.answer || 'Keine Antwort gefunden.');
                scrollToBottom();
                setTimeout(showMoreHelpOptions, 2000); // Anzeige der Hilfeoptionen nach 2 Sekunden
            })
            .catch(error => {
                console.error('Fehler beim Laden der Antwort:', error);
                addMessage('bot-message', 'Es gab ein Problem beim Laden der Antwort.');
            });
    }

    // Anzeige von Optionen für weitere Hilfe
    function showMoreHelpOptions() {
        const moreHelpMessage = 'Kann ich Ihnen noch weiterhelfen?<br><button class="yes-option">Ja</button><button class="no-option">Nein</button>';
        addMessage('bot-message', moreHelpMessage);
        scrollToBottom();
        attachMoreHelpOptionHandlers();
    }

    // Zuweisung der Event-Handler für die Optionen "Ja" und "Nein"
    function attachMoreHelpOptionHandlers() {
        const yesButton = document.querySelector('.yes-option');
        const noButton = document.querySelector('.no-option');
        if (yesButton) {
            yesButton.addEventListener('click', () => {
                disableAllButtons('.yes-option, .no-option');
                onYesClick();
            });
        }
        if (noButton) {
            noButton.addEventListener('click', () => {
                disableAllButtons('.yes-option, .no-option');
                onNoClick();
            });
        }
    }

    // Aktion bei Klick auf "Ja"
    function onYesClick() {
        chatMessages.innerHTML = '';
        showSections();
    }

    // Aktion bei Klick auf "Nein"
    function onNoClick() {
        const noReply = 'Vielen Dank für Ihr Verständnis. Wenn Sie noch Fragen haben, stehe ich Ihnen gerne zur Verfügung.<br><button class="restart-chat">Chat neu starten</button>';
        addMessage('bot-message', noReply);
        scrollToBottom();
        attachRestartChatHandler();
    }

    // Zuweisung des Event-Handlers für den Chat-Neustart-Button
    function attachRestartChatHandler() {
        const restartChatButton = document.querySelector('.restart-chat');
        if (restartChatButton) {
            restartChatButton.addEventListener('click', () => {
                disableAllButtons('.restart-chat');
                chatMessages.innerHTML = '';
                isGreetingShown = false; // Begrüßungsstatus zurücksetzen
                sendGreeting();
            });
        }
    }

    // Hinzufügen einer Nachricht zum Chat
    function addMessage(className, textContent) {
        const messageElement = document.createElement('div');
        messageElement.className = className;
        messageElement.innerHTML = textContent;
        chatMessages.appendChild(messageElement);
    }

    // Scrollen des Chats zum unteren Ende
    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Anzeige einer Fehlermeldung
    function displayErrorMessage(isError, message = '') {
        if (isError) {
            errorMessage.style.display = 'block';
            errorMessage.textContent = message;
        } else {
            errorMessage.style.display = 'none';
        }
    }
});
