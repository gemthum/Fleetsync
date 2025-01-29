<template>
  <div class="login-container">
    <div class="login-box">
      <h2>LOGIN</h2>
      <form @submit.prevent="handleLogin">
        <div class="input-group">
          <img src="../assets/user_icon.png" alt="Email Icon" />
          <input v-model="username" placeholder="Usuario" required />
        </div>
        <div class="input-group">
          <img src="../assets/padlock_icon.png" alt="Password Icon" />
          <input v-model="password" placeholder="Contraseña" required />
        </div>
        <button type="submit">LOGIN</button>
        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      username: '',
      password: '',
      errorMessage: '',
    };
  },
  methods: {
    async handleLogin() {
      try {
        const response = await axios.post('http://3.129.63.121:3000/auth/login', {
          username: this.username,
          password: this.password
        });
        if (response.data.token) {
          localStorage.setItem('token', response.data.token); // Save token to local storage
          this.$router.push('/dashboard'); // Redirect to dashboard
        } else {
          const error = await response.json();
          this.errorMessage = error.message;
        }
      } catch (error) {
        console.error('Login failed:', error);
        this.errorMessage = 'Login failed. Please try again.';
      }
    },
  },
};
</script>

<style scoped>
/*
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: url("../assets/background-image.jpg") no-repeat center center/cover;
}

.login-box {
  background-color: rgba(255, 255, 255, 0.4);
  padding: 20px 30px;
  border-radius: 10px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
  text-align: center;
  width: 300px;
}*/

 /*reemplazar login-container y login-box con estos 3 elementos para añadir oscuridad al fondo */
.login-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: url("@/assets/background-image.jpg") no-repeat center center/cover;
}

.login-container::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5); 
  z-index: 1; 
}

.login-box {
  position: relative;
  z-index: 2; 
  background-color: rgba(255, 255, 255, 0.7); 
  padding: 20px 30px;
  border-radius: 10px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
  text-align: center;
  width: 300px;
}

.login-box h2 {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
}

.input-group {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  background-color: #c2c2c275;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 5px 10px;
}

.input-group img {
  width: 20px;
  height: 20px;
  margin-right: 10px;
}

.input-group input {
  flex: 1;
  border: none;
  outline: none;
  background: none;
  padding: 8px;
  font-size: 14px;
}

button {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  background-color: #d81e05;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #b31604;
}
</style>