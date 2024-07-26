<template>
  <div class="home">
    <!-- Logo container -->
    <div class="logo-container">
      <img class="logo" src="@/assets/Fev.png" alt="Logo" />
    </div>

    <!-- Welcome message container -->
    <div class="welcome-container">
      <h1>Welcome to CA SERVER!</h1>
    </div>

    <!-- Main content container -->
    <div class="main-container">
      <!-- Button containers for each button in a separate column -->
      <div class="button-column">
        <button @click="fetchCSRList" style="font-weight: bold; font-size: 20px">
          List of CSR
        </button>
        <ul>
          <li v-for="csr in csrList" :key="csr._id">
            {{ csr.type }} - {{ csr.content }}
          </li>
        </ul>
      </div>
      <div class="button-column">
        <button @click="signCSR" style="font-weight: bold; font-size: 20px">
          Sign Certificates
        </button>
      </div>
      <div class="button-column">
        <button @click="fetchCRTList" style="font-weight: bold; font-size: 20px">
          List Certificates
        </button>
        <ul>
          <li v-for="crt in crtList" :key="crt._id">
            {{ crt.type }} - {{ crt.content }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import Swal from "sweetalert2";

export default {
  name: "HomePage",
  data() {
    return {
      csrList: [],
      crtList: [], // Add a data property for CRT list
    };
  },
  methods: {
    async fetchCSRList() {
      try {
        const response = await fetch("http://localhost:3000/crt/list-csr", {
          method: "POST",
        });
        this.csrList = await response.json();
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("CSR not found");
          }
          throw new Error("Failed to fetch CSR list");
        }
        Swal.fire("Success", "CSR list fetched successfully", "success");
      } catch (error) {
        console.error("Error fetching CSR list:", error);
        Swal.fire("Error", error.message, "error");
      }
    },
    async signCSR() {
      try {
        const response = await fetch(
          "http://localhost:3000/crt/generateAndSaveClientCertificate",
          {
            method: "POST",
          }
        );
        if (!response.ok) {
          throw new Error("Failed to sign CSR");
        }
        await response.json();
        Swal.fire("Success", "CSR signed successfully", "success");
      } catch (error) {
        console.error("Error signing CSR:", error);
        Swal.fire("Error", error.message, "error");
      }
    },
    async fetchCRTList() {
      try {
        const response = await fetch("http://localhost:3000/crt/list-crts", {
          method: "POST",
        });
        if (!response.ok) {
          throw new Error("Failed to fetch CRT list");
        }
        this.crtList = await response.json();
        Swal.fire("Success", "CRT list fetched successfully", "success");
      } catch (error) {
        console.error("Error fetching CRT list:", error);
        Swal.fire("Error", error.message, "error");
      }
    },
  },
};
</script>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  height: 100vh; /* Ensures the home container takes full viewport height */
  padding: 10px;
  background-image: url("@/assets/image.png"); /* Set background image */
  background-size: cover; /* Ensure the image covers the entire container */
  background-position: center; /* Center the image */
}

.logo-container {
  margin-top: 10px; /* Adjust top margin as needed */
}

.logo {
  max-width: 100px; /* Adjust max-width to resize the logo */
}

.welcome-container {
  margin-top: 20px; /* Adjust margin as needed */
}

.main-container {
  display: flex;
  justify-content: space-between; /* Distribute space between columns */
  width: 80%; /* Adjust width as needed */
  margin-top: 20px; /* Adjust margin as needed */
}

.button-column {
  flex: 1; /* Each column takes up equal space */
  display: flex;
  flex-direction: column;
  align-items: center;
}

button {
  font-weight: bold;
  background-color: rgb(193, 242, 155);
  font-size: 20px; /* Increase button font size */
  padding: 20px 30px; /* Adjust padding for button size */
  border-radius: 10px;
  margin-bottom: 20px;
}
</style>
