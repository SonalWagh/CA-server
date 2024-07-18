<template>
  <div class="login-page">
    <!-- Logo container -->
    <div class="logo-container">
      <img class="logo" src="@/assets/Fev.png" alt="Logo" />
    </div>
    <h2>Login to CA Server</h2>
    <form @submit.prevent="login">
      <div>
        <label for="email">Email:</label>
        <input type="email" v-model="email" id="email" required />
      </div>
      <div>
        <label for="password">Password:</label>
        <input type="password" v-model="password" id="password" required />
      </div>
      <button type="submit">Login</button>
    </form>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
  </div>
</template>
  
  <script>
import Swal from "sweetalert2";

export default {
  data() {
    return {
      email: "",
      password: "",
      errorMessage: "",
    };
  },
  methods: {
    async login() {
      try {
        const response = await fetch(
          "http://localhost:3000/auth/login?email=admin@fev.com&password=admin",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: this.email,
              password: this.password,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Login failed");
        }

        //   const data = await response.json();

        //   if (data.success) {
        //     // Show success alert
        Swal.fire("Success", "Login successful", "success");
        this.$router.push("/home");
        //     // Redirect to home page
        //   } else {
        //     this.errorMessage = data.message || 'Login failed';
        //     // Show error alert
        //     Swal.fire('Error', this.errorMessage, 'error');
        //   }
      } catch (error) {
        this.errorMessage = error.message;
        // Show error alert
        Swal.fire("Error", this.errorMessage, "error");
      }
    },
  },
};
</script>
  
  <style scoped>
.login-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f0f0f0;
  background-image: url("@/assets/image.png"); /* Set background image */
  background-size: cover; /* Ensure the image covers the entire container */
  background-position: center; /* Center the image */
}

.logo-container {
    margin-bottom: 20px;
    display: flex;
    justify-content: center;
  }
  .logo {
    max-width: 100px;
  }

h2 {
  margin-bottom: 20px;
  text-align: center;
}

form {
  display: flex;
  flex-direction: column;
  align-items: center;
}

form > div {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
}

input {
  width: 100%;
  padding: 10px;
  font-size: 16px;
}

button {
  font-weight: bold;
  background-color: rgb(174, 212, 157);
  font-size: 20px;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
}

.error {
  color: red;
}
</style>
  