# Save Byte - Hostel Food Waste Management System

**Save Byte** is a full-stack web application developed as a final year B.Tech CSE project by a team of three students. It is designed to tackle the issue of food waste in hostels by creating a platform that connects hostels with surplus food to NGOs and Animal Welfare Centers (AWCs).

---

## 🚀 Motivation

Every year, tons of edible food are wasted in college and university hostels. This wastage not only represents a loss of resources but also has significant environmental and social implications. Our team was motivated to create a practical solution that could bridge the gap between food surplus and food scarcity. "Save Byte" was born out of the desire to create a sustainable system that ensures leftover food from hostels reaches those who need it most, thereby reducing waste and supporting local communities.

---

## ✨ Features

"Save Byte" is a multi-user platform with distinct features for each role:

### 🏨 For Hostels (Donors)

* **Donate Food**: An easy-to-use form to list surplus food, specifying details like food type, quantity, and expiry time.
* **Food Status Management**: A dashboard to track the status of donated food, with options to edit or delete listings.
* **Transaction History**: A complete record of all past donations, including recipient details and transaction status.
* **Wastage Analytics**: Interactive charts and graphs to visualize food waste patterns, with filters for date ranges and categories to help in making data-driven decisions for waste reduction.
* **Real-time Notifications**: Instant alerts when a food donation is accepted or a transaction is completed.

### 🤝 For NGOs & AWCs (Recipients)

* **View Available Food**: A real-time feed of available food donations from various hostels, tailored to their needs (fresh food for NGOs, plate waste for AWCs).
* **Route & Time Calculation**: The application calculates the distance and estimated travel time to the donor's location to help recipients choose the most convenient pickups.
* **Accept & Track Donations**: The ability to accept food donations and track the pickup in real-time on an interactive map.
* **Secure OTP Verification**: A secure One-Time Password (OTP) system to ensure a safe and verified handover of food.
* **Transaction History**: A log of all food pickups, including dates, donor details, and transaction status.

---

## 🛠️ Tech Stack

This project is built using the **MERN stack** and other modern technologies:

* **MongoDB**: A NoSQL database for storing application data in a flexible, JSON-like format.
* **Express.js**: A backend framework for building the RESTful APIs that power the application.
* **React.js**: A frontend library for creating a dynamic and responsive user interface.
* **Node.js**: A JavaScript runtime for the server-side application logic.
* **Socket.io**: For real-time communication and instant notifications between the server and clients.
* **JSON Web Tokens (JWT)**: For secure user authentication and authorization.
* **Bcrypt.js**: For hashing user passwords to ensure data security.
* **Nodemailer**: For sending emails, including registration confirmations and OTPs.
* **Chart.js**: For creating interactive and visually appealing charts for the analytics dashboard.
* **Leaflet & Geoapify API**: For map integration, real-time tracking, and route calculation.

---

## ⚙️ Installation and Setup

To get a local copy up and running, follow these simple steps.

### Prerequisites

* Node.js (v14 or higher)
* npm (Node Package Manager)
* MongoDB (local or a cloud instance like MongoDB Atlas)

### Installation

1.  **Clone the repository:**
    ```sh
    git clone [https://github.com/your-username/save-byte.git](https://github.com/your-username/save-byte.git)
    cd save-byte
    ```

2.  **Install backend dependencies:**
    ```sh
    cd backend
    npm install
    ```

3.  **Install frontend dependencies:**
    ```sh
    cd ../frontend
    npm install
    ```

4.  **Set up environment variables:**

    Create a `.env` file in the `backend` directory and add the following variables:
    ```
    MONGO_URI=your_mongodb_connection_string
    SECRET_KEY=your_jwt_secret_key
    EMAIL_USER=your_email_address
    EMAIL_PASS=your_email_password
    ```

5.  **Start the development servers:**

    * **Backend:** In the `backend` directory, run:
        ```sh
        npm start
        ```
    * **Frontend:** In the `frontend` directory, run:
        ```sh
        npm start
        ```

The application should now be running on `http://localhost:3000`.

---

## API Endpoints

The backend provides the following RESTful API endpoints:

* `POST /api/register`: Register a new user (Hostel, NGO, or AWC).
* `POST /api/login`: Log in a user and receive a JWT token.
* `POST /api/donate-food`: Add a new food donation (requires authentication).
* `GET /api/get-all-donated-foods`: Fetch all food donations made by a specific hostel.
* `GET /api/get-all-ngo-available-foods`: Fetch all available fresh food for NGOs.
* `GET /api/get-all-awc-available-foods`: Fetch all available plate waste for AWCs.
* `POST /api/accept-food/:foodId`: Accept a food donation.
* `POST /api/verify-otp/:transactionId`: Verify the OTP to complete a food pickup.
* `GET /api/get-wastage-report`: Generate a food waste report for a hostel.

---

## Database Schema

The database consists of five main collections:

* **users**: Stores user information, including roles, credentials, and contact details.
* **foods**: Contains details about donated food items.
* **donations**: Links food items to the hostels that donated them.
* **transactions**: Records the details of each food transaction, including the donor, recipient, status, and OTP.
* **notifications**: Stores all notifications sent to users.
