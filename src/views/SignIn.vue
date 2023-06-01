<template>
  <div class="signIn-login">
    <div class="signIn-now" v-if="!$store.state.userData.email">
      <div v-if="!a_loginWindow" class="signIn-area">
        <h2>Please enter your information and signIn</h2>
        <form class="mainForm">
          <label class="iconLabel">
            icon image:
            <img class="user-icon" :src="$store.state.userData.iconURL" alt="">
            <div class="addFileBtn">
              <label for="fileInput" class="custom-file-input-label">
                &nbsp;&nbsp;Select File&nbsp;&nbsp;
              </label>
              <input id="fileInput" type="file" class="custom-file-input" @change="handleFileUpload" ref="fileInput" required>
              <span class="validity"></span>
            </div>
          </label>
          <label>
            user Name:
            <div class="writing-area">
              <input type="text" v-model="userData.userName" placeholder="@" required>
              <span class="validity"></span>
            </div>
            <p class="passText">ユーザー名は英数小文字で 3文字以上</p>
          </label>
          <label>
            Email:
            <div class="writing-area">
              <input type="email" v-model="userData.email" required>
              <span class="validity"></span>
            </div>
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
          <button class="resetPass" type="button" @click="resetPass">Reset Password</button>
          <button @click="creteUser_signIn">Sign In</button>
          <button @click.prevent="onLoginWindow">Already SignIn?</button>
        </form>
      </div>
      <div v-if="a_loginWindow" class="login-area">
        <h2>Please enter your information and login</h2>
        <form class="login-input-area">
          <label>
            Email:
            <div class="writing-area">
              <input type="email" v-model="userData.email" required>
            </div>
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
          <button @click="login" class="login-btn">log In</button>
          <button @click.prevent="onLoginWindow">Haven't SignIn yet?</button>
        </form>
      </div>
    </div>
    <div class="signIn-already" v-if="$store.state.userData.email">
      <h2>{{$store.state.userData.userName}}, You are already signed in</h2>
      <button>
        <router-link  outer-link to="/MyPage">open my page</router-link>
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
      selectedFile: null,
      userData: {
        userName: '',
        email: '',
        password: '',
        uuid: '',
      },
    }
  },
  methods: {
    handleFileUpload() {
      const file = this.$refs.fileInput.files[0];
      this.selectedFile = file;
      this.$store.dispatch('addIconImage', file)
      console.log('handleFileUpload', this.$refs.fileInput);
      console.log('handleFileUpload', this.selectedFile);
    },
    ...mapActions([
      'addUserDataForFirebase',
    ]),
    async creteUser_signIn() {
      console.log('signIn run')
      try {
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(this.userData.email, this.userData.password)
        this.userData.uuid = userCredential.user.uid
        await this.addUserDataForFirebase(this.userData)
        await this.$store.dispatch('addIconImage', this.selectedFile)
        console.log('createUser_signIn run', userCredential)
        alert('サインイン完了')
        this.$router.push('/MyPage');
      } catch (error) {
        console.error('Error during sign in:', error);
        alert('サインインできませんでした');
      }
    },
    login() {
      firebase.auth().signInWithEmailAndPassword(this.userData.email, this.userData.password)
      .then((userCredential) => {
        this.userData.uuid = userCredential.user.uid
        this.$store.commit('updateUserData', {data: this.userData, id: userCredential.user.uid})
        console.log('login run', userCredential)
        alert('ログイン完了')
      })
      .catch((error) => {
        console.error('Error during login:', error);
        console.error('Error during login:', error.message);
        alert('ログインできませんでした。メールアドレスかパスワードを間違えている可能性があります')
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
    resetPass() {
      if (window.confirm('パスワードの再設定用メールを送信しますか？')) {
        const email = prompt('メールアドレスを入力してください');
        firebase.auth().sendPasswordResetEmail(email)
          .then(() => {
            alert('再設定用メールを送信しました')
          })
          .catch((error) => {
            alert('再設定用メールを送信できませんでした')
            console.error("再設定用メールを送信できませんでした", error.message);
          });
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
.mainForm {
  width: 85%;
}
.signIn-login {
  margin: 5vh 5vw;
}
.signIn-area h2{
  border-radius: 20px;
  background: #fafaff;
  box-shadow: -6px -6px 12px #ffffff;
}
.iconLabel {
  width: 100%;
}
.user-icon {
  width: 90%;
}
.addFileBtn {
  width: 100%;
  text-align: end;
}
.custom-file-input-label {
  /* ラベルのスタイルを設定する */
  width: fit-content;
  text-align: end;
  display: inline-block;
  border-radius: 10px;
  background: #fafaff;
  box-shadow:  5px 5px 6px #e1e1e6,-5px -5px 6px #ffffff;
  }

.custom-file-input {
  /* input要素のスタイルを設定する */
  display: none;
}
button {
  border-radius: 10px;
  background: #fafaff;
  box-shadow: 5px 5px 6px #e1e1e6, -5px -5px 6px #ffffff;
  border: none;
  padding: 3%;
  margin-bottom: 2vh;
}

.writing-area,
.pass-area {
  display: inline;
  border: none;
  border-radius: 10px;
  background: #fafaff;
  box-shadow: 5px 5px 6px #e1e1e6, -5px -5px 6px #ffffff;
}
.pass-area input,
.writing-area input {
  border: none;
  background: none;
}
.resetPass,
.login-btn {
  margin-top: 7vh;
}

.login-input-area {
  margin-top: 50vh;
  width: 85%;
}


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
