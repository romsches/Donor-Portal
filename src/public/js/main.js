// Class for a custom HTML element 'SpecialHeader'
class SpecialHeader extends HTMLElement {
    // Called when the element is connected to the DOM
    connectedCallback() {
        this.innerHTML = `
        <div class="header_container">
            <nav>
                <ul>
                    <li><a href="/login">Home</a></li>
                    <li><a href="#">Blood Donation</a></li>
                    <li><a href="#">Become a Donor</a></li>
                    <li><a href="#">Information</a></li>
                    <li><a href="#">Contact</a></li>
                </ul>
            </nav>
        </div>
        `;
    }
}

/*
// Class for a custom HTML element 'SpecialLogo'
class SpecialLogo extends HTMLElement {
    // Called when the element is connected to the DOM
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
*/

// Class for a custom HTML element 'SpecialFooter'
class SpecialFooter extends HTMLElement {
    // Called when the element is connected to the DOM
    connectedCallback() {
        this.innerHTML = `
        <div class="footer_container">
            <div class="unten">
                <ul class="links">
                    <a href="#">Legal Notice</a>
                    <a href="#">Terms of Use</a>
                    <a href="#">Privacy Policy</a>
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

// Register custom HTML elements
customElements.define('special-header', SpecialHeader);
customElements.define('special-footer', SpecialFooter);
//customElements.define('special-logo', SpecialLogo);

// Monitor the DOMContentLoaded event to ensure the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {

    // Find the login form in the DOM
    const loginForm = document.querySelector('#login-form');
    if (loginForm) { // Check if the login form exists
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent the default form submission process

            const formData = new FormData(loginForm); // Collect form data

            try {
                const response = await fetch(loginForm.action, { // Asynchronous request using fetch to the form's URL
                    method: loginForm.method, // HTTP method of the form (e.g., POST)
                    body: formData // Form data as the request body
                });

                if (!response.ok) {
                    throw new Error('Network response was not OK.');
                }

                const data = await response.json(); // Convert response to JSON

                if (data.success) { // Check if the login was successful
                    if (data.redirectUrl) {
                        window.location.href = data.redirectUrl; // On success, redirect to the specified URL
                    } else {
                        console.error('No redirect URL specified.'); // Output error message
                    }
                } else {
                    console.error('Authorization Error:', data.message); // Output error in the console
                }
            } catch (error) {
                console.error('Error submitting the form:', error); // Handle error during form submission
            }
        });
    }
});