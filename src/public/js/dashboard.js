// Check if the user has administrator privileges
// This function is called before all other functions to ensure the user is logged in and has admin rights.
function isAdmin() {
    // Checks if the user's privileges include the "admin" right.
    return privileges && privileges.includes('admin'); // Returns true if the user has admin rights, otherwise false.
}

// Admin privileges check to execute code only for administrators
document.addEventListener('DOMContentLoaded', () => {
    // Check if the user does NOT have admin privileges
    if (!privileges.includes('admin')) {
        // If the user is not an administrator, hide elements visible only to admins
        const adminSections = document.querySelectorAll('.admin-only');
        adminSections.forEach(section => {
            section.style.display = 'none'; // Set the display of admin areas to 'none' so they are not shown.
        });
    }
});

// If the user has administrator privileges, adjust logging behavior
if (isAdmin()) {
    // Overriding the console.log function so that administrators can still see logs
    console._log = console.log; // Store the original console.log function
    console.log = function () {
        console._log.apply(console, arguments); // Call the original console.log function and display logs in the console.
    };
} else {
    // If the user is not an administrator, the console.log function is overridden so no logs are displayed
    console.log = function () {}; // Ignores all log messages so they don't appear in the browser console.
}

// Function to set up the inactivity timer
function setupInactivityTimer() {
    let timeout; // Variable for the timeout timer

    // Function to reset the timer upon user activity
    function resetTimer() {
        clearTimeout(timeout); // Clear the previous timer
        timeout = setTimeout(() => {
            // If no activity is detected, perform logout
            fetch('/admin/logout', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            })
            .then(() => {
                // Redirect to the login page after logout
                window.location.href = '/admin/login';
            })
            .catch(error => {
                // Error handling if logout fails
                console.error('Error ending session:', error);
            });
        }, 1000 * 60 * 10);  // Timeout after 10 minutes of inactivity (600000ms)
    }

    // Event listeners to monitor inactivity and reset the timer
    document.addEventListener('mousemove', resetTimer); // On mouse movement
    document.addEventListener('keypress', resetTimer); // On key press
    document.addEventListener('click', resetTimer); // On mouse click
    document.addEventListener('scroll', resetTimer); // On scrolling
    document.addEventListener('touchstart', resetTimer); // On touch-start on mobile devices

    // Initial setup of the timer
    resetTimer();
}

// Function to control the chatbot visibility
function setupChatbotControl() {
    if (!isAdmin()) {
        return;
    }
    const checkbox = document.getElementById('chatbot-control-checkbox'); // Checkbox for control
    const chatbotControl = document.getElementById('chatbot-control'); // Area for the chatbot

    // Check if both elements exist
    if (checkbox && chatbotControl) {
        // Event listener to show or hide the chatbot
        checkbox.addEventListener('change', () => {
            chatbotControl.style.display = checkbox.checked ? 'block' : 'none'; // Show if checkbox is checked
        });
    } else {
        // Error message if elements are not found
        console.error('Could not find elements for chatbot control');
    }
}

function setupActionVisibility() {
    if (!isAdmin()) {
        return;
    }
    // Elements for controlling the view
    const actionSelect = document.getElementById('action-select'); // Action selection
    const sectionContainer = document.getElementById('section-container'); // Container for sections
    const questionsTableContainer = document.getElementById('questions-table-container'); // Container for the questions table
    const actionButtons = document.getElementById('button-container'); // Container for action buttons
    const confirmButtons = document.getElementById('confirm-buttons'); // Confirmation buttons
    const editArea = document.getElementById('edit-area'); // Area for editing
    const editTextarea = document.getElementById('edit-textarea'); // Textarea for editing
    const editTypeLabel = document.getElementById('edit-type-label'); // Label for the edit type
    const deleteMessage = document.getElementById('delete-message'); // Message for deletion
    const insertFormContainer = document.getElementById('insert-form-container'); // Form for adding
    const backButton = document.getElementById('back-button'); // Back button

    // Function to hide all controls
    function hideAllControls() {
        if (sectionContainer) sectionContainer.style.display = 'none'; // Hide the sections container
        if (questionsTableContainer) questionsTableContainer.style.display = 'none'; // Hide the table container
        if (actionButtons) actionButtons.style.display = 'none'; // Hide the action buttons
        if (confirmButtons) confirmButtons.classList.add('dash_hidden'); // Hide the confirmation buttons
        if (editArea) editArea.classList.add('dash_hidden'); // Hide the editing area
        if (editTextarea) editTextarea.classList.add('dash_hidden'); // Hide the editing textarea
        if (editTypeLabel) editTypeLabel.classList.add('dash_hidden'); // Hide the edit type label
        if (deleteMessage) deleteMessage.classList.add('dash_hidden'); // Hide the deletion message
        if (insertFormContainer) insertFormContainer.classList.add('dash_hidden'); // Hide the form for adding
    }

    let notificationShown = false; // Flag for tracking notifications

    // Function to hide edit controls
    function hideEditControls() {
        if (editArea) editArea.classList.add('dash_hidden'); // Hide the editing area
        if (editTextarea) editTextarea.classList.add('dash_hidden'); // Hide the textarea for editing
        if (editTypeLabel) editTypeLabel.classList.add('dash_hidden'); // Hide the label for the edit type
        if (confirmButtons) confirmButtons.classList.add('dash_hidden'); // Hide the confirmation buttons
        actionButtons.style.display = 'block'; // Show the action buttons again
    }

    // Show delete controls for a selected row
    function showDeleteControls(row) {
        const id = row.dataset.id;
        const section = row.cells[1].textContent;

        // Update message for deleting the row with ID
        deleteMessage.textContent = `Do you really want to delete the row with ID ${id}?`;
        deleteMessage.classList.remove('dash_hidden');

        // Show confirmation buttons
        confirmButtons.classList.remove('dash_hidden');
        actionButtons.style.display = 'none'; // Hide action buttons

        // Update message with ID and section of the selected row
        document.getElementById('delete-id').textContent = id;
        document.getElementById('delete-section').textContent = section;
    }

    // Hide delete controls and reset the display
    function hideDeleteControls() {
        deleteMessage.classList.add('dash_hidden');
        confirmButtons.classList.add('dash_hidden');
        actionButtons.style.display = 'block'; // Show action buttons again

        // Reset message with ID and section
        document.getElementById('delete-id').textContent = 'undefined';
        document.getElementById('delete-section').textContent = 'undefined';

        // Reset row selection, if a row was selected
        const selectedRow = document.querySelector('#questions-table tbody tr.selected');
        if (selectedRow) {
            selectedRow.classList.remove('selected');
        }
    }

    // Function to reset the notification flag
    function resetNotificationFlag() {
        notificationShown = false; // Reset the flag when the notification disappears
    }

    // Example for the form to add FAQ
    const insertForm = document.getElementById('insert-form');
    if (insertForm) {
        insertForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent the default form submission

            // Retrieve values from the form fields
            const section = document.getElementById('insert-section').value.trim();
            const question = document.getElementById('insert-question').value.trim();
            const answer = document.getElementById('insert-answer').value.trim();

            // Send data to the API to add the question
            fetch('/api/add-faq', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ section, question, answer }) // JSON data in the request body
            })
            .then(response => response.json()) // Process response as JSON
            .then(data => {
                if (data.success) {
                    // Successfully added
                    showNotification('The question was successfully added.');
                    insertForm.reset(); // Reset form
                    document.getElementById('action-select').value = 'view'; // Reset selection
                    document.getElementById('action-select').dispatchEvent(new Event('change')); // Trigger event to update the view
                } else {
                    // Error in the request
                    if (data.error === 'duplicate') {
                        showNotification('Error: This question already exists.'); // Error case for duplicate question
                    } else {
                        showNotification(`Error: ${data.message}`); // General error message
                    }
                }
            })
            .catch(error => {
                console.error('Error adding the question:', error);
                showNotification('Error adding the question. Check the console for details.');
            });
        });
    }

    // If the 'actionSelect' element exists, add a 'change' event listener
    if (actionSelect) {
        actionSelect.addEventListener('change', function() {
            const value = actionSelect.value; // Get the current value of the selection
            hideAllControls(); // Hide all other controls before showing the required ones

            // Check the value of the selection and display the corresponding controls
            switch (value) {
                case 'view':
                    sectionContainer.style.display = 'block'; // Show the section container
                    questionsTableContainer.style.display = 'block'; // Show the questions table
                    actionButtons.style.display = 'block'; // Show the action buttons
                    loadQuestions(); // Load the questions to display them
                    break;

                // You can add more cases here for other action values
                // default:
                //    console.error('Unknown action value:', value);
            }
        });
    } else {
        console.error('Element for action selection could not be found');
    }

    // If the 'sectionSelect' element exists, add a 'change' event listener
    const sectionSelect = document.getElementById('chatbot-sections');
    if (sectionSelect) {
        sectionSelect.addEventListener('change', function() {
            const section = this.value; // Get the selected section
            if (section) {
                loadQuestions(section); // Load questions based on the selected section
            }
        });
    }

    // Get the 'deleteButton' and 'insertButton' elements
    const deleteButton = document.getElementById('submit-delete');
    const insertButton = document.getElementById('submit-insert'); // "Insert" button

    // If the 'deleteButton' exists, add a click event listener
    if (deleteButton) {
        deleteButton.addEventListener('click', () => {
            // Show areas for delete confirmation
            sectionContainer.style.display = 'block'; // Show the section container
            questionsTableContainer.style.display = 'block'; // Show the questions table
            actionButtons.style.display = 'none'; // Hide the action buttons
            confirmButtons.classList.remove('dash_hidden'); // Show the confirmation buttons
            deleteMessage.classList.remove('dash_hidden'); // Show the delete message
            document.getElementById('button-container').style.display = 'none'; // Hide the "Edit" and "Delete" buttons
            // If the editing area exists, hide it
            if (editArea) {
                editArea.style.display = 'none'; // Hide editing area
            }
        });
    }

    // If the "insertButton" exists, add a click event listener
    if (insertButton) {
        insertButton.addEventListener('click', () => {
            hideAllControls(); // Hide all controls
            insertFormContainer.classList.remove('dash_hidden'); // Show the form for adding
        });
    }

    // If the "backButton" exists, add a click event listener
    if (backButton) {
        backButton.addEventListener('click', () => {
            hideAllControls(); // Hide all controls
            const actionSelect = document.getElementById('action-select'); // Find the action selection element
            if (actionSelect) {
                actionSelect.value = 'view'; // Set the action selection value to 'view'
                actionSelect.dispatchEvent(new Event('change')); // Generate an event that the selection has changed
            }
        });
    }

    // Get the "cancelButton" element
    const cancelButton = document.getElementById('cancel-button');

    // If the "cancelButton" exists, add a click event listener
    if (cancelButton) {
        cancelButton.addEventListener('click', () => {
            hideDeleteControls(); // Hide all controls related to deletion
        });
    }
    
}

let isLoadingQuestions = false;
const allSections = new Set(); // Add this definition

// After the notification is shown, reset the flag
function resetNotificationFlag() {
    if (!isAdmin()) {
        console.log('You do not have permission to perform this operation');
        return;
    }
    notificationShown = false;
}

// Usage of the function for delete confirmation
const confirmButton = document.getElementById('confirm-button'); // Button for delete confirmation

// Check if the button exists and add an event listener
if (confirmButton) {
    confirmButton.addEventListener('click', () => {
        // Checking administrator rights within an event handler
        if (!isAdmin()) {
            console.log('You do not have permission to perform this operation');
            return; // Return if not correct
        }

        // Get the ID and section of the row to be deleted
        const deleteId = document.getElementById('delete-id').textContent;
        const deleteSection = document.getElementById('delete-section').textContent;

        // If the row is not selected, a notification is shown and execution is stopped
        if (deleteId === 'undefined') {
            showNotification('No row selected. Please select a row to proceed.');
            return; // Return if no row is selected
        }

        // Confirmation of row deletion
        const confirmationMessage = `Do you really want to delete the row with ID ${deleteId}?`;
        
        // Show confirmation dialog
        if (confirm(confirmationMessage)) {
            // If the user confirmed, call the delete function
            deleteRow(deleteId);
        } else {
            // If the user cancels, show a cancellation notification
            showNotification('Deletion cancelled.');
        }
    });
}

// Function to display a notification (simple alert for demonstration)
function showNotification(message) {
    // Check for administrator privileges
    if (!isAdmin()) {
        console.log('You do not have permission to perform this operation');
        return;
    }
    alert(message); // Displays the message as an alert in the browser
}

// Function to delete a row (question) with the specified ID
function deleteRow(id) {
    // Check for administrator privileges
    if (!isAdmin()) {
        console.log('You do not have permission to perform this operation');
        return;
    }
    // Send a POST request to the API to delete the question with the specified ID
    fetch('/api/delete-faq', {
        method: 'POST', // Use the POST method, as we are deleting data on the server
        headers: { 'Content-Type': 'application/json' }, // Set the content type as JSON
        body: JSON.stringify({ id }) // Send the ID as JSON data in the request body
    })
    .then(response => {
        // Check if the server response was successful
        if (!response.ok) {
            throw new Error('Network response was not OK'); // Error if the response status code is not ok
        }
        return response.json(); // Return the response as JSON
    })
    .then(data => {
        // Check if the server successfully performed the deletion
        if (data.success) {
            showNotification('The question was successfully deleted.'); // Display a notification if the deletion was successful
            loadQuestions(); // Update the list of questions after deletion
            resetDeleteMessage(); // Reset the deletion message to clear it
        } else {
            showNotification(`Error: ${data.message}`); // Display an error message if the deletion failed
        }
    })
    .catch(error => {
        // Handle error if sending the request fails (e.g., network error)
        console.error('Error deleting the question:', error); // Error is logged in the console
        showNotification('Error deleting the question. Check the console for details.'); // Display a general error message
    });
}

// Function to reset the deletion message (ID and section)
function resetDeleteMessage() {
    // Check for administrator privileges
    if (!isAdmin()) {
        console.log('You do not have permission to perform this operation');
        return;
    }
    // Set the text content for ID and section to 'undefined' to indicate that no question is selected anymore
    document.getElementById('delete-id').textContent = 'undefined';
    document.getElementById('delete-section').textContent = 'undefined';
}

// Function to load sections
function loadSections() {
    // Check for administrator privileges
    if (!isAdmin()) {
        console.log('You do not have permission to perform this operation');
        return;
    }
    // Get the select element with the ID 'chatbot-sections' where the sections are displayed
    const sectionSelect = document.getElementById('chatbot-sections');

    // Send a Fetch request to the API to load the sections
    fetch('/api/update-faq-sections') // Replace here with the correct route that returns the sections
        .then(response => {
            // Check if the response from the server was successful
            if (!response.ok) {
                throw new Error('Network error loading sections'); // Error if the status code is not OK
            }
            return response.json(); // If all goes well, return the response as JSON
        })
        .then(data => {
            // Check the received data and update the dropdown menu for the sections
            if (!data.sections || data.sections.length === 0) {
                // If no sections are available, display a corresponding option
                sectionSelect.innerHTML = '<option value="">No Sections Available</option>';
                return; // Exit the function if no sections are available
            }

            // Set a default option "All Sections" for the dropdown list
            sectionSelect.innerHTML = '<option value="">All Sections</option>';

            // Iterate over each section and add it as an option in the select element
            data.sections.forEach(section => {
                const option = document.createElement('option');
                option.value = section; // Set the value of the option to the section name
                option.textContent = section; // Set the text of the option
                sectionSelect.appendChild(option); // Add the option to the select element
            });
        })
        .catch(error => {
            // If an error occurs during the fetch process, it is handled here
            console.error('Network error loading sections:', error); // Output error in the console log
        });
}

// LOGOUT LINK
document.addEventListener('DOMContentLoaded', function() {
    // Get the element for the logout link with the ID 'logout-link'
    const logoutLink = document.getElementById('logout-link');
    
    // If the link exists, an event listener is added
    if (logoutLink) {
        logoutLink.addEventListener('click', function(event) {
            // Prevent the default link behavior (e.g., loading a new page)
            event.preventDefault(); 

            // Send a POST request to the server to end the session
            fetch('/admin/logout', {
                method: 'POST', // HTTP method POST to end the session
                credentials: 'same-origin', // Send cookies for authentication
                headers: {
                    'Content-Type': 'application/json' // Define the content type as JSON
                }
            }).then(response => {
                // If the response is successful, the user is redirected to the login page
                if (response.ok) {
                    // Redirect to the login page after successful logout
                    window.location.href = '/admin/login';
                } else {
                    // If an error occurs during logout, an error message is output
                    console.error('Error ending session');
                    alert('Logout from your account failed. Please try again.');
                }
            }).catch(error => {
                // If an error occurs while sending the request, an error message is output
                console.error('Error sending the logout request:', error);
            });
        });
    }
});

let currentSection = ''; // Variable to store the currently selected section

// Function call to update sections (will run immediately)
updateSectionSelect();
// Run function every 5 seconds
setInterval(updateSectionSelect, 5000); 

// Function to load questions based on the selected section
function loadQuestions(section = '') {
    // Check for administrator privileges
    if (!isAdmin()) {
        console.log('You do not have permission to perform this operation');
        return;
    }
    // Check if questions are currently being loaded to prevent multiple loads
    if (isLoadingQuestions) return;
    isLoadingQuestions = true;

    // Get the <tbody> element of the table where the questions will be loaded
    const tbody = document.querySelector('#questions-table tbody');

    // If the <tbody> element is found, we proceed with loading
    if (tbody) {
        // Clear the table before new data is added
        tbody.innerHTML = ''; 

        // Start the request to load the questions, depending on the selected section
        fetch(`/api/faq-questions?section=${encodeURIComponent(section)}`)
            .then(response => {
                // If the response from the server is not successful, throw an error
                if (!response.ok) {
                    throw new Error('Network error loading questions');
                }
                // If the response was successful, return it as JSON
                return response.json();
            })
            .then(data => {
                // Extract the questions from the received data
                const questions = data.questions;
                
                // Sort the questions by their ID in ascending order
                const sortedQuestions = questions.sort((a, b) => a.id - b.id);

                // Iterate through each question and insert a new row into the table
                sortedQuestions.forEach(question => {
                    // Create a new row (<tr>) for each question
                    const row = document.createElement('tr');
                    row.dataset.id = question.id; // Set the ID attribute of the row for later use

                    // Create a cell for the question ID and add it to the row
                    const idCell = document.createElement('td');
                    idCell.textContent = question.id; // Set the text of the cell to the question ID
                    row.appendChild(idCell); // Add the cell to the row

                    // Create a cell for the question section and add it to the row
                    const sectionCell = document.createElement('td');
                    sectionCell.textContent = question.section_name; // Use section_name from the question
                    row.appendChild(sectionCell); // Add the cell to the row

                    // Create a cell for the question itself and add it to the row
                    const questionCell = document.createElement('td');
                    questionCell.textContent = question.question; // Set the text of the cell to the question
                    row.appendChild(questionCell); // Add the cell to the row

                    // Create a cell for the answer and add it to the row
                    const answerCell = document.createElement('td');
                    answerCell.textContent = question.answer; // Set the text of the cell to the answer
                    row.appendChild(answerCell); // Add the cell to the row

                    // Add the created row to the table
                    tbody.appendChild(row);
                });
            })
            .catch(error => {
                // Output an error if something goes wrong
                console.error('Error loading questions:', error);
            })
            .finally(() => {
                // Reset the isLoadingQuestions variable after the loading process is complete
                isLoadingQuestions = false;
            });
    } else {
        // If the <tbody> element is not found, output an error message
        console.error('Table could not be found');
    }
}

// Function to update the section selection
function updateSectionSelect() {
    // Check for administrator privileges
    if (!isAdmin()) {
        return;
    }
    fetch('/api/update-faq-sections')
        .then(response => response.json())
        .then(data => {
            const selectElement = document.getElementById('chatbot-sections'); 
            selectElement.innerHTML = ''; // Clear the current options

            // Create and add an option for section selection
            const defaultOption = document.createElement('option');
            defaultOption.value = ''; // Empty value for "All Sections"
            defaultOption.textContent = 'All Sections'; 
            selectElement.appendChild(defaultOption);

            // Create and add options for the sections
            data.sections.forEach(section => {
                const option = document.createElement('option');
                option.value = section;
                option.textContent = section;
                selectElement.appendChild(option);
            });

            // Restore the selected section, if present
            selectElement.value = currentSection; // Set the value of the selected section

            // Load questions for the current section, if selected
            if (currentSection) {
                loadQuestions(currentSection);
            }
        })
        .catch(error => {
            console.error('Error updating sections:', error);
        });
}

document.addEventListener('DOMContentLoaded', () => {
    const sectionSelect = document.getElementById('chatbot-sections');
    if (sectionSelect) {
        // Listener for changes in the section selection dropdown
        sectionSelect.addEventListener('change', function() {
            if (!isAdmin()) {
                return;
            }
            // Update the global variable for the currently selected section
            currentSection = this.value;
            // Load questions filtered by the new section
            loadQuestions(currentSection);
        });
    } else {
        // console.error('Section select element not found.');
    }
});

// Calling a function to update sections (defined in a previous code block)
updateSectionSelect();

// Function to set up row selection in the questions table
function setupRowSelection() {
    if (!isAdmin()) {
        console.log('You do not have permission to perform this operation');
        return;
    }
    const tableBody = document.querySelector('#questions-table tbody');

    if (tableBody) {
        // Event delegation: listen for clicks on the table body
        tableBody.addEventListener('click', function(event) {
            // Find the closest table row (<tr>) ancestor of the clicked element
            const clickedRow = event.target.closest('tr');
            if (!clickedRow) return; // Do nothing if a row wasn't clicked

            // Remove the selection from the previously selected row
            const previouslySelectedRow = tableBody.querySelector('tr.selected');
            if (previouslySelectedRow) {
                previouslySelectedRow.classList.remove('selected');
            }

            // Mark the new row as selected
            clickedRow.classList.add('selected');

            // Update the display elements with the selected row's ID and Section
            const id = clickedRow.dataset.id;
            const section = clickedRow.cells[1].textContent;
            document.getElementById('delete-id').textContent = id;
            document.getElementById('delete-section').textContent = section;
        });
    } else {
        console.error('Table body for row selection could not be found');
    }
}

// Function executed after the DOM is loaded to initialize various features
document.addEventListener('DOMContentLoaded', function() {
    // Only run initialization if the user is an admin
    if (!isAdmin()) {
        return;
    }
    loadSections(); // Load sections (dropdown options)
    setupInactivityTimer(); // Start the inactivity timer
    setupChatbotControl(); // Set up chatbot control visibility
    setupActionVisibility(); // Set up action visibility (e.g., Edit/Delete buttons)
    setupRowSelection(); // Add row selection functionality
});

// Function to update checkboxes in the rows (for multi-selection, currently unused by the initializer)
function updateRowCheckboxes(rows) {
    if (!isAdmin()) {
        console.log('You do not have permission to perform this operation');
        return;
    }
    const rowCheckboxesContainer = document.getElementById('row-checkboxes');
    if (!rowCheckboxesContainer) return;

    rowCheckboxesContainer.innerHTML = ''; // Clear previous checkboxes

    rows.forEach(row => {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'row-checkbox';
        checkbox.dataset.id = row.dataset.id; // Set the row ID

        rowCheckboxesContainer.appendChild(checkbox);
        rowCheckboxesContainer.appendChild(document.createElement('br')); // Add a line break
    });
}

// "Edit" Button Logic
document.addEventListener('DOMContentLoaded', () => {
    if (!isAdmin()) {
        return;
    }
    // Define elements for the editing process
    const editButton = document.getElementById('submit-edit'); 
    const buttonContainer = document.getElementById('button-container'); 
    const editFormContainer = document.getElementById('edit-form-container'); 
    const editInstruction = document.getElementById('edit-instruction'); 
    const table = document.getElementById('questions-table'); 
    const sectionInput = document.getElementById('edit-section'); 
    const questionInput = document.getElementById('edit-question'); 
    const answerInput = document.getElementById('edit-answer'); 
    const backEditButton = document.getElementById('back-edit-button'); 
    const confirmButton = document.getElementById('edit_confirm_button'); 
    let selectedRow = null; // Stores the currently selected table row

    // Function to handle clicking on a table row in edit mode
    const handleRowClick = (row) => {
        selectedRow = row; // Store the selected row
        // Get data from cells (Section, Question, Answer)
        const section = row.querySelector('td:nth-child(2)').innerText; 
        const question = row.querySelector('td:nth-child(3)').innerText; 
        const answer = row.querySelector('td:nth-child(4)').innerText; 

        // Transfer values to the input fields of the edit form
        sectionInput.value = section;
        questionInput.value = question;
        answerInput.value = answer;

        editInstruction.classList.add('dash_hidden'); // Hide the edit instruction
        // Scroll to the button group for better visibility
        buttonContainer.scrollIntoView({ behavior: 'smooth', block: 'start' }); 
    };

    // Event delegation: listen for clicks on table rows during edit mode
    if (table) {
        table.addEventListener('click', (event) => {
            const row = event.target.closest('tr'); // Find the closest row
            // Only process the click if the edit form is visible AND a row was clicked
            if (row && !editFormContainer.classList.contains('dash_hidden')) {
                handleRowClick(row); 
            }
        });
    }

    // Event listener for the Edit button
    if (editButton) {
        editButton.addEventListener('click', () => {
            buttonContainer.style.display = 'none'; // Hide the standard button container
            editInstruction.classList.remove('dash_hidden'); // Show the edit instruction
            editFormContainer.classList.remove('dash_hidden'); // Show the edit form
            
            // Clear previous form data
            sectionInput.value = '';
            questionInput.value = '';
            answerInput.value = '';
            selectedRow = null; // Reset the selected row
        });
    }

    // Event listener for the confirmation button in the edit form
    if (confirmButton) {
        confirmButton.addEventListener('click', () => {
            if (!selectedRow) { // Check if a row has been selected
                alert('Please select a row to apply the changes.');
                return;
            }

            const id = selectedRow.querySelector('td:nth-child(1)').innerText; // ID of the selected row
            const confirmUpdate = confirm(`Do you really want to apply the changes to row ID ${id}?`);

            if (confirmUpdate) {
                const updatedData = {
                    id: id,
                    section: sectionInput.value,
                    question: questionInput.value,
                    answer: answerInput.value
                };

                // Send the update request to the server
                fetch('/api/edit-faq', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updatedData)
                })
                .then(response => {
                    if (!response.ok) throw new Error('Error during data update');
                    return response.json();
                })
                .then(data => {
                    if (data.success) {
                        // Update the local table with new values
                        selectedRow.querySelector('td:nth-child(2)').innerText = updatedData.section;
                        selectedRow.querySelector('td:nth-child(3)').innerText = updatedData.question;
                        selectedRow.querySelector('td:nth-child(4)').innerText = updatedData.answer;

                        editFormContainer.classList.add('dash_hidden'); // Hide the edit form
                        buttonContainer.style.display = 'block'; // Show the standard button container
                        alert('Data successfully updated');
                    } else {
                        alert(data.message || 'Data could not be updated');
                    }
                })
                .catch(error => {
                    console.error(error);
                    alert('Data could not be updated');
                });
            }
        });
    }

    // Event listener for the back/cancel button in edit mode
    if (backEditButton) {
        backEditButton.addEventListener('click', () => {
            editFormContainer.classList.add('dash_hidden'); // Hide the edit form
            buttonContainer.style.display = 'block'; // Show the standard button container
            
            // Clear form fields
            sectionInput.value = '';
            questionInput.value = '';
            answerInput.value = '';
            selectedRow = null; // Reset the row selection
        });
    }
});

// Delete Sections Logic
document.addEventListener('DOMContentLoaded', () => {
    if (!isAdmin()) {
        return;
    }
    // Get elements for the different containers and buttons
    const deleteSectionButton = document.getElementById('submit-delete-section');
    const buttonContainer = document.getElementById('button-container');
    const deleteSectionContainer = document.getElementById('delete-section-container-admin');
    const confirmButtons = document.getElementById('confirm-buttons-admin');
    const sectionSelect = document.getElementById('section-select-admin'); // NOTE: Element not used in this block
    // const confirmDeleteButton = document.getElementById('confirm-delete-button-admin'); // NOTE: Element not used in this block
    // const cancelDeleteButton = document.getElementById('cancel-delete-button-admin'); // NOTE: Element not used in this block

    // Event listener for the Delete Sections button
    if (deleteSectionButton) {
        deleteSectionButton.addEventListener('click', () => {
            buttonContainer.style.display = 'none'; // Hide the main button container
            deleteSectionContainer.classList.remove('dash_hidden'); // Show the delete section container

            const sectionContainer = document.getElementById('section-container');
            if (sectionContainer) {
                sectionContainer.style.display = 'none'; // Hide the general section container
            }

            // Fetch sections from the server
            fetch('/admin/get-sections')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Error loading sections');
                    }
                    return response.json();
                })
                .then(data => {
                    const tableContainer = document.getElementById('section-table-container');
                    tableContainer.innerHTML = ''; // Clear previous content

                    const questionsTable = document.getElementById('questions-table');
                    if (questionsTable) {
                        questionsTable.style.display = 'none'; // Hide the questions table
                    }

                    if (data.length === 0) {
                        alert('Sections not found.');
                        return;
                    }

                    // Create and populate the table for sections
                    const table = document.createElement('table');
                    table.className = 'styled-table';
                    table.innerHTML = `
                        <thead>
                            <tr>
                                <th>Select</th>
                                <th>Section ID</th>
                                <th>Section Name</th>
                                <th>Question Count</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    `;

                    // Add each section as a row
                    data.forEach(section => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td><input type="checkbox" value="${section.id}"></td>
                            <td>${section.id}</td>
                            <td>${section.section_name}</td>
                            <td>${section.questionCount}</td>
                        `;

                        // Toggle checkbox on row click
                        row.addEventListener('click', (event) => {
                            // Only toggle if the target isn't the checkbox itself (to avoid double-toggling)
                            if (event.target.type !== 'checkbox') {
                                const checkbox = row.querySelector('input[type="checkbox"]');
                                checkbox.checked = !checkbox.checked;
                            }
                        });

                        table.querySelector('tbody').appendChild(row);
                    });

                    tableContainer.appendChild(table); // Add table to the container
                    confirmButtons.classList.remove('dash_hidden'); // Show confirmation buttons
                })
                .catch(error => {
                    alert(error.message);
                    console.error('Error loading sections:', error);
                });
        });
    }

const confirmDeleteButton = document.getElementById('confirm-delete-section'); 
const cancelDeleteButton = document.getElementById('cancel-delete-section');

// Event listener for the confirmation button for deletion
    if (confirmDeleteButton) {
        confirmDeleteButton.addEventListener('click', () => {
            // Selection of marked sections
            const checkboxes = document.querySelectorAll('#section-table-container input[type="checkbox"]:checked');
            const selectedSections = Array.from(checkboxes).map(checkbox => checkbox.value);

            if (selectedSections.length === 0) {
                alert('Please select at least one section to delete.');
                return;
            }

            // Confirmation message for deleting the selected sections
            const confirmDelete = confirm(`Are you sure you want to delete the sections with ID: ${selectedSections.join(', ')}?`);
            if (confirmDelete) {
                // Deleting each selected section and updating the table afterward
                Promise.all(selectedSections.map(sectionId => 
                    fetch(`/admin/delete-section/${sectionId}`, {
                        method: 'DELETE'
                    }).then(response => {
                        if (!response.ok) {
                            throw new Error(`Error deleting the section with ID ${sectionId}`);
                        }
                        return response.json();
                    })
                ))
                .then(data => {
                    alert('Sections successfully deleted.');
                    // Updating the section table after deletion
                    return fetchSections();
                })
                .then(() => {
                    // Updating the questions table after deletion
                    loadQuestions(); // Call the function for loading questions again
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert(error.message);
                });
            }
        });
    }

    // Event listener for the cancel button
    if (cancelDeleteButton) {
        cancelDeleteButton.addEventListener('click', () => {
            deleteSectionContainer.classList.add('dash_hidden'); // Hide deletion container
            buttonContainer.style.display = 'block'; // Show main buttons again

            if (sectionSelect) {
                sectionSelect.value = ''; // Reset selection
            }

            warningMessage.classList.add('dash_hidden'); // Hide warning message
            sectionInfo.classList.add('dash_hidden'); // Hide section info

            // Update section table upon cancellation
            fetchSections();

            const sectionContainer = document.getElementById('section-container');
            if (sectionContainer) {
                sectionContainer.style.display = 'block'; // Show sections container
            }

            const questionsTable = document.getElementById('questions-table');
            if (questionsTable) {
                questionsTable.style.display = 'block'; // Show questions table
            }
        });
    }

    // Function to retrieve and display the sections
    function fetchSections() {
        return fetch('/admin/get-sections')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error loading sections after deletion');
                }
                return response.json();
            })
            .then(data => {
                const sectionTableContainer = document.getElementById('section-table-container');
                sectionTableContainer.innerHTML = ''; // Clear previous content
                const table = document.createElement('table');
                table.className = 'styled-table';
                table.innerHTML = `
                    <thead>
                        <tr>
                            <th>Selection</th>
                            <th>ID of sections</th>
                            <th>Section</th>
                            <th>Data volume</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                `;

                // Add each section as a row
                data.forEach(section => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td><input type="checkbox" value="${section.id}"></td>
                        <td>${section.id}</td>
                        <td>${section.section_name}</td>
                        <td>${section.questionCount}</td>
                    `;

                    // Activate/deactivate checkbox upon clicking the row
                    row.addEventListener('click', (event) => {
                        const checkbox = row.querySelector('input[type="checkbox"]');
                        checkbox.checked = !checkbox.checked;
                    });

                    table.querySelector('tbody').appendChild(row);
                });
                sectionTableContainer.appendChild(table); // Add table to the container
            });
    }
});