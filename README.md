# 🩸 Full-Stack Donor Portal

A web application for donor management, donation eligibility checks, appointment scheduling, and administrative management. Developed as a training project to explore full-stack web development, relational database design, and role-based access control.

## ✨ Features

- **Donor Authentication** — Login using a unique Donor ID, with input validation and error handling.
- **Donation Eligibility** — Automated eligibility checks based on donation intervals and configured criteria.
- **Appointment Scheduling** — Browse donation locations and available appointment slots.
- **Interactive FAQ Chatbot** — Embedded support widget with categorized questions and answers.
- **Role-Based Access Control (RBAC)** — Separate administrative access with configurable permissions.
- **FAQ Management** — Create, edit, and delete chatbot content, questions, answers, sections, and categories.

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| Backend | Node.js, Express.js |
| Database | MySQL |
| Frontend | HTML5, CSS3, SCSS, JavaScript (ES6+) |
| API | REST API |
| Security | Server-side validation, protected routes, role-based access control |
| Development | Git, npm |

## 📸 Screenshots

### 1. Donor Authentication

| Donor Login | Validation & Error Handling |
|:---:|:---:|
| ![Donor Authentication](assets/screenshots/1.Donor%20Authentication%20Interface.png) | ![Login Validation](assets/screenshots/2.Login%20Error%20Handling%20%26%20Validation.png) |

### 2. Eligibility & Appointment Scheduling

| Eligibility & Available Appointments | Location Filtering |
|:---:|:---:|
| ![Eligibility Check](assets/screenshots/3.Automated%20Eligibility%20Check%20%26%20Available%20Appointments%20(All%20Locations).png) | ![Academia Location](assets/screenshots/4.Dynamic%20Location%20Filtering%20(Academia%20Branch).png) |

| Appointment Scheduling |
|:---:|
| ![Metropolis Appointment Scheduling](assets/screenshots/5.Appointment%20Scheduling%20(Metropolis%20Branch).png) |

### 3. Interactive Support Chatbot

| Chatbot Widget | FAQ Interaction |
|:---:|:---:|
| ![Support Chatbot](assets/screenshots/6.Embedded%20Interactive%20Support%20Chatbot.png) | ![Chatbot FAQ](assets/screenshots/7.Chatbot%20Knowledge%20Base%20%26%20FAQ%20Interaction.png) |

### 4. Admin Panel & Access Control

| Admin Login | Admin Dashboard |
|:---:|:---:|
| ![Admin Authentication](assets/screenshots/8.Admin%20Manager%20Authentication%20Entry.png) | ![Admin Dashboard](assets/screenshots/9.Admin%20Dashboard%20%26%20Privilege%20Overview.png) |

### 5. Chatbot Content Management

| Content Management | Edit FAQ |
|:---:|:---:|
| ![Chatbot Content Management](assets/screenshots/10.Dynamic%20Chatbot%20Content%20%26%20Section%20Management.png) | ![Edit FAQ](assets/screenshots/11.Dynamic%20FAQ%20%26%20Chatbot%20Question%20Editing.png) |

| Delete Confirmation | Add New FAQ |
|:---:|:---:|
| ![Delete Confirmation](assets/screenshots/12.Record%20Deletion%20%26%20Confirmation%20Modal.png) | ![Add FAQ](assets/screenshots/13.FAQ%20Creation%20Form%20Add%20New%20Record.png) |

| Section & Category Management |
|:---:|
| ![Category Management](assets/screenshots/14.Chatbot%20Section%20%26%20Category%20Management.png) |

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) — compatible version for the project
- [MySQL](https://dev.mysql.com/downloads/) — database server
- Git

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/romsches/Donor-Portal.git
cd Donor-Portal
```

**2. Install dependencies**

```bash
npm install
```

**3. Configure environment variables**

Create a `.env` file in the project root directory:

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=donor_portal
```

Replace the example database credentials with your local MySQL configuration.

**4. Initialize the database**

Import the SQL schema and any required initialization scripts from the project's `sql/` directory into your MySQL database.

**5. Start the application**

```bash
npm start
```

Open the local URL configured by your application, usually `http://localhost:3000`.

> **Note:** The environment variables, SQL file locations, and npm scripts must match the actual project configuration. Check `package.json`, the database connection code, and the `sql/` directory if setup differs.

## 🎯 Project Background

This project was developed during my vocational training as an IT Specialist in Application Development (*Fachinformatiker für Anwendungsentwicklung*). It provided practical experience with full-stack application development, REST APIs, relational databases, authentication, and administrative interfaces.

## 👨‍💻 Author

**Roman Schesler**

- GitHub: [@romsches](https://github.com/romsches)
- LinkedIn: [Roman Schesler](https://www.linkedin.com/in/roman-schesler-9021a2267/)
