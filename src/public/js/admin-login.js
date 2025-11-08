// The following code is executed once the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function () {
    // Select the login form and the input fields for username and password
    const loginForm = document.querySelector('form');
    const usernameInput = document.getElementById('adminID');
    const passwordInput = document.getElementById('password');

    // Check if the form exists
    if (loginForm) {
        // Add event listener for form submission
        loginForm.addEventListener('submit', function (event) {
            event.preventDefault(); // Prevents the default form action (page reload)

            const username = usernameInput.value.trim(); // Removes whitespace in the username
            const password = passwordInput.value.trim(); // Removes whitespace in the password

            clearErrors(); // Removes previous error messages

            // Send login credentials to the server
            fetch('/admin/login', {
                method: 'POST', // HTTP method POST is used
                headers: { 'Content-Type': 'application/json' }, // Data is sent as JSON
                body: JSON.stringify({ username, password }), // Convert username and password to JSON
                credentials: 'same-origin'
            })
                .then(response => {
                    if (!response.ok) {
                        // If the server response fails, extract error data
                        return response.json().then(data => {
                            if (data.errors) {
                                showErrors(data.errors); // Shows error messages, if present
                            }
                        });
                    } else {
                        // Redirect to the dashboard page upon successful login
                        window.location.href = '/admin/dashboard';
                    }
                })
                .catch(error => console.error('Error during login:', error)); // Output error from the request
        });
    }

    // Function to remove old error messages
    function clearErrors() {
        const errorMessages = document.querySelectorAll('.error-message'); // Find all error message elements
        errorMessages.forEach(msg => msg.remove()); // Remove all error messages from the DOM
    }

    // Function to display new error messages
    function showErrors(errors) {
        if (errors.username) {
            // Create and add error message for the username
            const usernameError = document.createElement('span');
            usernameError.textContent = errors.username; // Set error message text
            usernameError.classList.add('error-message'); // Add CSS class for styling
            usernameInput.parentElement.appendChild(usernameError); // Insert error message after the input field
        }

        if (errors.password) {
            // Create and add error message for the password
            const passwordError = document.createElement('span');
            passwordError.textContent = errors.password; // Set error message text
            passwordError.classList.add('error-message'); // Add CSS class for styling
            passwordInput.parentElement.appendChild(passwordError); // Insert error message after the input field
        }
    }
});