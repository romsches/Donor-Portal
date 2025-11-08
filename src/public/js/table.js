// Class for the custom HTML element "special-header"
// This class creates a custom HTML element for the page header.
class SpecialHeader extends HTMLElement {
    connectedCallback() {
        // HTML content for the custom header element
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
// Class for the custom HTML element "SpecialLogo"
// This class creates a custom HTML element for the logo.
class SpecialLogo extends HTMLElement {
    connectedCallback() {
        // HTML content for the custom logo element
        this.innerHTML = `
        <section class="logodrk">
            <div>
                <img src="/views/img/label.png" alt="logo">
            </div>
        </section>
        `;
    }
}
*/

// Class for the custom HTML element "special-footer"
// This class creates a custom HTML element for the page footer.
class SpecialFooter extends HTMLElement {
    connectedCallback() {
        // HTML content for the custom footer element
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
// These lines register the custom HTML elements so they can be used in HTML.
customElements.define('special-header', SpecialHeader);
//customElements.define('special-logo', SpecialLogo);
customElements.define('special-footer', SpecialFooter);

// Variable for the logout timer
let logoutTimer;

// Add event listeners for user activity
// These event listeners reset the logout timer when the user performs one of the specified actions (e.g., mouse movement, key presses).
document.addEventListener('mousemove', resetLogoutTimer);
document.addEventListener('mousedown', resetLogoutTimer);
document.addEventListener('keypress', resetLogoutTimer);
document.addEventListener('touchstart', resetLogoutTimer);

// Function to set the minimum date for the date input field
// This function ensures that the date input field cannot be set to a date in the past.
function setMinDate() {
    const dateInput = document.getElementById('dtm');
    if (dateInput) {
        // Set today as the minimum date
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);
    } else {
        console.error('Element with ID "dtm" not found.');
    }
}

// Function to set the initial date to today
// This function sets the date input field to today's date.
function setInitialDate() {
    const dateInput = document.getElementById('dtm');
    if (dateInput) {
        // Set today as the initial date
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    } else {
        console.error('Element with ID "dtm" not found.');
    }
}

// Function to update the table
// This function fetches the table data from the server and updates the content.
window.refreshTable = refreshTable;

// Function to reset the logout timer
// This function is called on every user activity to reset the logout timer.
function resetLogoutTimer() {
    clearTimeout(logoutTimer); // Clear the current timer
    initializeLogoutTimer();  // Restart the timer
}

// Function to initialize the logout timer
// This timer logs the user out after a specified period of inactivity.
function initializeLogoutTimer() {
    clearTimeout(logoutTimer); // Clear the timer
    logoutTimer = setTimeout(() => {
        window.location.href = '/login'; // Redirect user to the login page
    }, 2 * 60 * 1000); // 2 minutes of inactivity (in milliseconds)
}

// Asynchronous function to refresh a table
// This function fetches data from the server to update the table with donor meeting data.
async function refreshTable() {
    try {
        // Retrieve filter values from the input fields
        const selectedLocation = document.getElementById('location-filter').value || 'All Locations';
        const dateFilter = document.getElementById('dtm').value || '';
        const donorID = ''; // Placeholder for the actual donor ID logic

        // Request data from the server
        const response = await fetch(`/refreshTable?SpenderID=${donorID}&location=${encodeURIComponent(selectedLocation)}&date=${encodeURIComponent(dateFilter)}`);
        if (!response.ok) {
            throw new Error('Network error.');
        }
        const data = await response.json();

        const tableBody = document.querySelector('#meeting-table tbody');
        tableBody.innerHTML = ''; // Remove old table content

        // If meeting data is available, populate the table
        if (data.meetings && data.meetings.length > 0) {
            data.meetings.forEach(meeting => {
                // Format the date
                const dateFormatted = formatDate(meeting.Datum);
                const address = selectedLocation === 'All Locations'
                    ? `${meeting.Strasse || 'Street missing'} (${meeting.Stadt || 'City missing'})`
                    : `${meeting.Strasse || 'Street missing'}`;

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${dateFormatted}</td>
                    <td>${address}</td>
                    <td>${meeting.Uhrzeit || 'Time missing'}</td>
                    <td>${meeting.Status || 'Status missing'}</td>
                `;
                tableBody.appendChild(row);
            });
        } else {
            // If no meeting data is available, display a message
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.setAttribute('colspan', '4');
            cell.textContent = 'No results found.';
            row.appendChild(cell);
            tableBody.appendChild(row);
        }

        // Update donation information
        updateDonationInfo(data.canDonate);
    } catch (error) {
        console.error('Error updating the table:', error);
    }
}

// Function to format the date in "dd.mm.yyyy" format
// This function formats the date from "yyyy-mm-dd" to "dd.mm.yyyy" format.
function formatDate(dateString) {
    if (!dateString) return 'Date missing';

    const dateParts = dateString.split('-');
    const day = dateParts[2] || '';
    const month = dateParts[1] || '';
    const year = dateParts[0] || '';

    let formattedDate = '';
    if (day) formattedDate += `${day}.`;
    if (month) formattedDate += `${month}.`;
    if (year) formattedDate += `${year}`;

    return formattedDate || 'Date missing';
}

// Asynchronous function to load cities from the server
// This function fetches a list of cities from the server and populates the location selection field.
async function loadCities() {
    try {
        const response = await fetch('/cities');
        if (!response.ok) {
            throw new Error('Network error.');
        }
        const data = await response.json();
        // console.log('Loaded Cities:', data); // For debugging
        const locationFilter = document.getElementById('location-filter');
        if (locationFilter) {
            locationFilter.innerHTML = '<option value="All Locations">All Locations</option>'; // Clear old values
            data.cities.forEach(city => {
                const option = document.createElement('option');
                option.value = city.Ort;
                option.textContent = city.Ort;
                locationFilter.appendChild(option);
            });
        } else {
            console.error('Element with ID "location-filter" not found.');
        }
    } catch (error) {
        console.error('Error loading cities:', error);
    }
}

// Function to update donation information
// This function displays information on whether the user is eligible to donate.
function updateDonationInfo(canDonate) {
    const donateInfoElement = document.getElementById('can-donate-info');
    if (donateInfoElement) {
        donateInfoElement.textContent = canDonate
            ? 'You can donate blood!'
            : 'You are currently not eligible to donate.';
    }
}

// Function to initialize the page
// This function is called when the page loads to update the table and load the locations.
function initializePage() {
    loadCities(); // Load cities
    setMinDate(); // Set minimum date
    setInitialDate(); // Set initial date
    refreshTable(); // Populate the table with current data
}

// Initialize page on load
window.addEventListener('load', initializePage);