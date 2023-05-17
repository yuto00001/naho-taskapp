<template>
  <div id="app">
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
    margin: 5% 2%;
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
.memo {
  width: 100px;
  height: 25px;
  padding: 5px 20px;
  overflow: hidden;
  line-height: 2rem;
}
.memo p {
  text-align: start;
}
.navLink {
  display: flex;
  flex-direction: column;
  width:25%
}
.navLink a {
  margin: 6px 8px;
  text-decoration: none;
  border-radius: 7px;
  background: #fafaff;
  box-shadow: 3px 3px 5px #d7d7db, -3px -3px 5px #ffffff;
}

.user-icon {
  width: 100%;
  border-radius: 50%;
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




.input-area {
  width: 90%;
  margin: 2%;
  padding: 2%;
  border-radius: 15px;
  background: #fafaff;
  box-shadow: 4px 4px 8px #d5d5d9, -4px -4px 8px #ffffff;
}
.input-area input{
  width: 75%;
  padding-right: 5px;
  border: none;
}
.input-area button{
  border: none;
  background: none;

}




.nav-modal {
  position: absolute;
  top: 5vh;
  right: 0;
  left: 0;
  margin: 0 auto;
  height: 85vh;
  width: 80vw;
  z-index: 20;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 2%;
  border-radius: 10px;
  background: #f5f5f5;
  box-shadow: 1px 1px 1px #f3f3f3, -1px -1px 1px #f7f7f7;
}
.nav-textArea {
  height: 90%;
  margin: 5% 0;
  display: flex;
  align-items: center;
  border-radius: 15px;
  background: #f5f5f5;
  box-shadow: -3px -3px 5px #ffffff;
}

.back-bord {
  background-color: rgba(19, 19, 19, 0.633);
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 10;
}
.nav-input {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.nav-input h2 {
  border-radius: 10px;
  box-shadow: -5px -5px 5px #ffffff;
}
.nav-input input {
  border: none;
  border-radius: 10px;
  padding: 3px 10px;
}
.nav-input textarea {
  border: none;
  border-radius: 10px;
  padding: 15px 10px;
  height: 82%;
}

.nav-modal button {
  height: 6%;
  border-radius: 10px;
  background: #f5f5f5;
  box-shadow: 5px 5px 5px #b8b8b8, -5px -5px 5px #ffffff;
  border: none;
}
.navItemsArea {
  height: 100%;
}
.navModalTitle {
  margin: 5% 0 3%;
  height: 5%;
}
.navModalTextArea {
  height: 88%;
}
.headInfo {
  margin: 3vh 0 0;
}
.main {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.todos-area {
  display: inline-block;
  width: 90%;
  margin: 2%;
  padding: 2%;
  border-radius: 20px;
  background: #fafdff;
  box-shadow: 6px 6px 8px #dadcde, -6px -6px 8px #ffffff;
}
.memo-area {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    overflow: scroll;
    height: 105px;
    width: 70vw;
    border-radius: 10px;
    background: #fafdff;
    box-shadow: 5px 5px 5px #e4e6e8, -5px -5px 5px #ffffff;
}
.add-menu {
  padding: 5px;
}
table {
  margin: auto;
  padding: 10px 0;
  width: 100%;
}
.archive-task,
.placeholderText {
  opacity: .5;
}
#container {
  height: 90vh;
  display: grid;
  grid-template-rows: 15% 15% 70%;
  grid-template-columns: 20% 80%;
  grid-template-areas:
    "nav  nav"
    "img head"
    "main main"

}
#itemA {
  grid-area: head;
}
#itemB {
  grid-area: nav;
  display: flex;
}
#itemC {
  grid-area: main;
}
#itemD {
  grid-area: img;
  align-self: end;
}

input[type='datetime-local'] {
  width: 20px;
  padding: 2px 5px;
  opacity: 0;
  position: relative;
  z-index: 2;
}
.td-1 {
  width: 13%;
}
.td-2 {
  display:  flex;
}
.td-3 {
  width: 70%;
}
.formattedDate {
  position: absolute;
  z-index: 1;
}
</style>
