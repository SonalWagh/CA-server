# CA-server
# CA Server Project

This project consists of a Certificate Authority (CA) server with a frontend built using Vue.js and a backend using Node.js, Express, and MongoDB. The server allows clients to upload Certificate Signing Requests (CSRs) and receive signed certificates.

## Table of Contents

1. [Project Structure](#project-structure)
2. [Installation](#installation)
3. [Running the Application](#running-the-application)
4. [API Endpoints](#api-endpoints)
5. [Frontend Usage](#frontend-usage)

## Project Structure

CA-Server/
├── backend/
│ ├── models/
│ │ └── Certificate.js
│ ├── server.js
│ ├── package.json
│ └── uploads/
├── frontend/
│ ├── src/
│ │ ├── assets/
│ │ ├── components/
│ │ │ ├── HomePage.vue
│ │ │ └── LoginPage.vue
│ │ ├── router/
│ │ │ └── index.js
│ │ ├── App.vue
│ │ ├── main.js
│ ├── public/
│ ├── package.json
│ └── vue.config.js
├── README.md


## Installation

### Backend

1. **Navigate to the backend directory**:

    ```sh
    cd backend
    ```

2. **Install the dependencies**:

    ```sh
    npm install express router mongosh curl nodemon path

    ```

3. **Ensure MongoDB is running locally**.

### Frontend

1. **Navigate to the frontend directory**:

    ```sh
    cd frontend
    ```

2. **Install the dependencies**:

    ```sh
    npm install
    ```

## Running the Application

### Backend

1. **Start the backend server**:

    ```sh
    nodemon run
    ```

   The backend server will run on `http://localhost:3000`.

### Frontend

1. **Start the frontend server**:

    ```sh
    npm run serve
    ```

   The frontend server will run on `http://localhost:8080`.

## API Endpoints

### POST /upload-csr

- **Description**: Upload a CSR file along with the client's hostname.
- **Endpoint**: `http://localhost:3000/upload-csr`
- **Request**:
  - Method: `POST`
  - Form Data: 
    - `csr`: The CSR file to upload.
    - `hostname`: The hostname of the client machine.

- **Response**:
  - Success: `CSR file and hostname received and saved.`
  - Failure: Appropriate error message.

## Frontend Usage

### Login Page

- **URL**: `http://localhost:8080/login`
- **Components**:
    - `LoginPage.vue`: Contains a form to input email and password for authentication.

- 