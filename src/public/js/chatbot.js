document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const chatToggle = document.getElementById('chat-toggle');
    const chatContainer = document.getElementById('chat-container');
    const chatClose = document.getElementById('chat-close');
    const chatInput = document.getElementById('chat-input');
    const chatSendButton = document.getElementById('chat-send-button');
    const chatMessages = document.getElementById('chat-messages');
    const errorMessage = createErrorMessage();

    let sections = []; // List of sections
    let currentSection = ''; // Currently selected section
    let isGreetingShown = false; // Flag to control the display of the greeting

    // Chat initialization
    initChat();
    loadSections();
    setInterval(loadSections, 10000); // Request data every 10 seconds

    // Creation of an element for error display
    function createErrorMessage() {
        const error = document.createElement('div');
        error.className = 'error-message';
        error.style.display = 'none';
        chatContainer.insertBefore(error, chatMessages);
        return error;
    }

    // Initialization of chat events
    function initChat() {
        chatToggle.addEventListener('click', openChat);
        chatClose.addEventListener('click', closeChat);
        chatSendButton.addEventListener('click', sendMessage);
        chatInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') sendMessage();
        });
    }

    // Opening the chat and displaying the greeting
    function openChat() {
        chatContainer.classList.add('open');
        if (!isGreetingShown) {
            sendGreeting();
        }
    }

    // Closing the chat
    function closeChat() {
        chatContainer.classList.remove('open');
    }

    // Sending a message
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
                addMessage('bot-message', data.reply || 'No answer found.');
                scrollToBottom();
            })
            .catch(error => {
                console.error('Error:', error);
                addMessage('bot-message', 'There was a problem sending your message.');
                scrollToBottom();
            });
        } else {
            displayErrorMessage(true, 'Please enter a message to send.');
        }
    }

    // Sending a greeting message
    function sendGreeting() {
        const greetingMessage = 'Welcome to the chat! How can I help you?<br><button class="section-button">Select a Section</button>';
        addMessage('bot-message greeting-message', greetingMessage);
        scrollToBottom();
        isGreetingShown = true;
        attachSectionButtonHandler();
    }

    // Loading sections from the API
    function loadSections() {
        fetch('/api/faq-sections')
            .then(response => response.json())
            .then(data => {
                sections = data.sections || [];
                
                // Inform the user that the data has been updated
                //if (sections.length > 0) {
                //    addMessage('bot-message', 'Data has been updated. Please select a section.');
                //}
            })
            .catch(error => {
                console.error('Error loading sections:', error);
                addMessage('bot-message', 'There was a problem loading the section.');
            });
    }

    // Displaying the sections
    function showSections() {
        const sectionMessage = 'Please select a section:<br>' + sections.map(section => `<button class="section-option">${section}</button>`).join('<br>');
        addMessage('bot-message', sectionMessage);
        scrollToBottom();
        attachSectionOptionHandlers();
    }

    // Assigning the event handler for the "Select a Section" button
    function attachSectionButtonHandler() {
        const sectionButton = document.querySelector('.section-button');
        if (sectionButton) {
            sectionButton.addEventListener('click', () => {
                chatMessages.innerHTML = ''; // Clear messages before displaying sections
                showSections();
            });
        }
    }

    // Disable all buttons matching the selector
    function disableAllButtons(selector) {
        document.querySelectorAll(selector).forEach(button => {
            button.disabled = true;
        });
    }

    // Assigning event handlers for the section buttons
    function attachSectionOptionHandlers() {
        document.querySelectorAll('.section-option').forEach(button => {
            button.addEventListener('click', () => {
                disableAllButtons('.section-option');
                currentSection = button.textContent.trim();
                showQuestions(currentSection);
            });
        });
    }

    // Displaying questions from the selected section
    function showQuestions(section) {
        fetch(`/api/faq-questions?section=${encodeURIComponent(section)}`)
            .then(response => response.json())
            .then(data => {
                if (data.questions) {
                    const questionsMessage = 'Please select a question:<br>' + data.questions.map(q => `<button class="question-option">${q.question}</button>`).join('<br>');
                    addMessage('bot-message', questionsMessage);
                    scrollToBottom();
                    attachQuestionOptionHandlers();
                } else {
                    addMessage('bot-message', 'No questions found.');
                }
            })
            .catch(error => {
                console.error('Error loading questions:', error);
                addMessage('bot-message', 'There was a problem loading the questions.');
            });
    }

    // Assigning event handlers for the question buttons
    function attachQuestionOptionHandlers() {
        document.querySelectorAll('.question-option').forEach(button => {
            button.addEventListener('click', () => {
                disableAllButtons('.question-option');
                const questionText = button.textContent;
                showAnswer(questionText);
            });
        });
    }

    // Displaying the answer to the selected question
    function showAnswer(question) {
        fetch(`/api/faq-answer?question=${encodeURIComponent(question)}`)
            .then(response => response.json())
            .then(data => {
                addMessage('bot-message', data.answer || 'No answer found.');
                scrollToBottom();
                setTimeout(showMoreHelpOptions, 2000); // Display help options after 2 seconds
            })
            .catch(error => {
                console.error('Error loading answer:', error);
                addMessage('bot-message', 'There was a problem loading the answer.');
            });
    }

    // Displaying options for further help
    function showMoreHelpOptions() {
        const moreHelpMessage = 'Can I help you further?<br><button class="yes-option">Yes</button><button class="no-option">No</button>';
        addMessage('bot-message', moreHelpMessage);
        scrollToBottom();
        attachMoreHelpOptionHandlers();
    }

    // Assigning event handlers for "Yes" and "No" options
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

    // Action on clicking "Yes"
    function onYesClick() {
        chatMessages.innerHTML = '';
        showSections();
    }

    // Action on clicking "No"
    function onNoClick() {
        const noReply = 'Thank you for your understanding. If you have any further questions, please feel free to ask.<br><button class="restart-chat">Restart Chat</button>';
        addMessage('bot-message', noReply);
        scrollToBottom();
        attachRestartChatHandler();
    }

    // Assigning the event handler for the chat restart button
    function attachRestartChatHandler() {
        const restartChatButton = document.querySelector('.restart-chat');
        if (restartChatButton) {
            restartChatButton.addEventListener('click', () => {
                disableAllButtons('.restart-chat');
                chatMessages.innerHTML = '';
                isGreetingShown = false; // Reset greeting status
                sendGreeting();
            });
        }
    }

    // Adding a message to the chat
    function addMessage(className, textContent) {
        const messageElement = document.createElement('div');
        messageElement.className = className;
        messageElement.innerHTML = textContent;
        chatMessages.appendChild(messageElement);
    }

    // Scrolling the chat to the bottom
    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Displaying an error message
    function displayErrorMessage(isError, message = '') {
        if (isError) {
            errorMessage.style.display = 'block';
            errorMessage.textContent = message;
        } else {
            errorMessage.style.display = 'none';
        }
    }
});