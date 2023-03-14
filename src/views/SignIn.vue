<template>
  <div class="signIn-login">
    <div class="signIn-now" v-if="!$store.state.userData.email">
      <div v-if="!a_loginWindow" class="signIn-area">
        <h2>情報を入力してsignInしてください</h2>
        <form @submit="creteUser_signIn">
          <label>
            icon image:
            <input type="file">
          </label>
          <label>
            Profile Name:
            <input type="text" v-model="userData.profileName" required>
            <span class="validity"></span>
          </label>
          <label>
            user Name:
            <input type="text" v-model="userData.userName" placeholder="@" required>
            <span class="validity"></span>
            <p class="passText">ユーザー名は英数小文字で 3文字以上</p>
          </label>
          <label>
            Email:
            <input type="email" v-model="userData.email" required>
            <span class="validity"></span>
          </label>
          <label>
            Password:
            <div class="pass-area">
              <span :class="toggleEye" @click="toggleInputType"></span>
              <input
              :type="inputType"
              v-model="userData.password"
              placeholder="6桁以上"
              autocomplete="current-password"
              required
              >
              <span class="validity"></span>
            </div>
          </label>
          <button type="submit">Sign In</button>
          <button @click.prevent="onLoginWindow">既にSignInがお済みの方はこちら</button>
        </form>
      </div>
      <div v-if="a_loginWindow" class="login-area">
        <h2>情報を入力してloginしてください</h2>
        <form @submit="login">
          <label>
            Email:
            <input type="email" v-model="userData.email" required>
          </label>
          <label>
            Password:
            <input type="password" v-model="userData.password" placeholder="6桁以上" required>
          </label>
          <button type="submit">log In</button>
          <button @click.prevent="onLoginWindow">まだSignInがお済みでない方はこちら</button>
        </form>
      </div>
    </div>
    <div class="signIn-already" v-if="$store.state.userData.email">
      <h2>{{$store.state.userData.userName}}様は既にサインインされています。</h2>
      <button>
        <router-link  outer-link to="/MyPage">マイページを開く</router-link>
      </button>
    </div>
  </div>
</template>


<script>
import firebase from "firebase/app";
import { mapActions } from 'vuex';

export default {
  name: 'MyPage',
  data() {
    return {
      inputType: 'password',
      toggleEye: 'fa fa-eye',
      a_loginWindow: false,
      userData: {
        profileName: '',
        userName: '',
        uuid: '',
        email: '',
        password: '',
        icon: '',
      },
    }
  },
  methods: {
    ...mapActions([
      'addUserDataForFirebase',
    ]),
    creteUser_signIn() {
      console.log('signIn run')
      firebase.auth().createUserWithEmailAndPassword(this.userData.email, this.userData.password)
      .then((userCredential) => {
        this.userData.uuid = userCredential.user.uid
        this.addUserDataForFirebase(this.userData)
        console.log('createUser_signIn run', userCredential)
        alert('サインイン完了')
      })
      .catch((error) => {
        alert('サインインできませんでした', error.message)
      });
    },
    login() {
      firebase.auth().signInWithEmailAndPassword(this.userData.email, this.userData.password)
      .then((userCredential) => {
        this.userData.uuid = userCredential.user.uid
        this.$store.commit('updateUserData', this.userData)
        console.log('login run', userCredential)
        alert('サインイン完了')
      })
      .catch((error) => {
        alert('ログインできませんでした', error.message)
      });
    },
    onLoginWindow() {
      if(this.a_loginWindow) {
      this.a_loginWindow = false
      } else {
      this.a_loginWindow = true
      }
    },
    toggleInputType() {
      if(this.inputType === 'password') {
        this.inputType = 'text'
        this.toggleEye = "fa fa-eye-slash"
      } else {
        this.inputType = 'password'
        this.toggleEye = "fa fa-eye"
      }
    },
  },
  created() {
    console.log('created run')
    this.$store.dispatch('onAuthStateChangedHandler')
  }
}
</script>



<style scoped>
.todo-area {
  display: inline-block;
}
form{
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  line-height: 5vh;
  width: fit-content;
  margin: auto;
}
.passText{
  font-size: 30%;
  font-weight: bold;
  color: gray;
  width: fit-content;
  height: fit-content;
  line-height: 2;
  margin: -10px 0 0 auto;
}
.pass-area{
  display: inline;
  border: 1px solid;
  border-radius: 2px;
}
.pass-area input{
  border: none;
}
input:invalid + span::after {
  position: absolute;
  content: "✖";
  padding-left: 5px;
}

input:valid + span::after {
  position: absolute;
  content: "✓";
  padding-left: 5px;
}

</style>
