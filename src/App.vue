<template>
  <div id="app">
    <nav>
      <router-link to="/">Home</router-link> |
      <router-link to="/SignIn">signin</router-link> |
    </nav>
    <router-view/>
  </div>
</template>

<script>
</script>

<style>
* {
  margin: 0;
  padding: 0;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  max-width: 100vw;
  height: 90vh;
  margin: 5% 2%;
  padding: 5% 2%;
  border: 1px solid rgb(41, 41, 41);
  border-radius: 5px;
}
body {
  max-width: 500px;
  width: 100%;
  height: 95vh;
  margin: 0 auto;
}
nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}

.user-icon {
  width: 20%;
  aspect-ratio: 1 / 1;
}
span,
input[type="text"],
input[type="email"],
input[type="checkbox"],
input[type="datetime-local"],
button {
  cursor: pointer;
}
</style>
