<template>
  <div class="SettingProfile">
    <div class="EditableArea">
      <section class="profile-image">
        <h1>プロフィール写真</h1>
        <div  v-if="statusEditing" >
          <input type="file" @change="handleFileUpload" ref="fileInput" required>
          <span class="validity"></span>
        </div>
        <div v-else>
          <img class="user-icon" :src="$store.state.userData.iconURL" alt="">
        </div>
      </section>
      <section class="profile-data">
        <div>
          <h1>メールアドレス</h1>
          <div  v-if="statusEditing" >
            <input type="email" v-model="userData.email" required>
            <span class="validity"></span>
          </div>
          <div v-else>
            <p>{{ $store.state.userData.email }}</p>
          </div>
        </div>
      </section>
    </div>
    <button v-if="statusEditing"  class="set" @click="updateUserData">編集を完了する</button>
    <div v-else class="notEditableArea">
      <button class="set" @click="dataInForInput">編集する</button>
      <router-link to="/MyPage">マイページに戻る</router-link>
    </div>
    <div v-if="!statusEditing" class="signOut-delete">
      <button class="resetPass" @click="resetPass">パスワード再設定</button>
      <button @click="signOut">サインアウト</button>
      <button @click="deleteAccount">アカウント削除</button>
    </div>
  </div>
</template>

<script>
import firebase from "firebase/app";



export default {
  name: 'SettingProfile',
  data() {
    return {
      statusEditing: false,
      selectedFile: null,
      inputType: 'password',
      toggleEye: 'fa fa-eye',
      userData: {
        email: '',
      },
    }
  },
  methods: {
    handleFileUpload() {
      this.selectedFile = this.$refs.fileInput.files[0];
    },
    editStatus() {
      this.statusEditing = !this.statusEditing
    },
    async dataInForInput() {
      if (!window.confirm("編集をするためにユーザーの再認証を行いますか?")) {
        return
      } else {
        try {
          const credential = await this.$store.dispatch('promptForCredentials');
          await firebase.auth().currentUser.reauthenticateWithCredential(credential);
          this.userData.email = this.$store.state.userData.email
          this.editStatus()
        } catch(error) {
          alert('メールアドレスもしくはパスワードが間違っています');
          console.error(error.message)
        }
      }
    },
    updateUserData() {
      const user = firebase.auth().currentUser;
      user.updateEmail(this.userData.email)
      .then(() => {
        this.$store.dispatch('updateEmail', this.userData.email)
        this.$store.dispatch('addIconImage', this.selectedFile)
        alert('編集を完了しました')
        this.editStatus()
      }).catch((error) => {
        alert('編集を完了できませんでした')
        console.log('編集を完了できませんでした', error.message)
      });
    },
    resetPass() {
      this.$store.dispatch('resetPass')
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
    signOut() {
      if(confirm('本当にサインアウトしますか？')) {
        firebase.auth().signOut()
        .then(() => {
          alert('正常にサインアウトしました')
          this.$store.commit('signOut');
          this.$router.push('/SignIn');
        }).catch((error) => {
          alert('正常にサインアウトできませんでした')
          console.error('正常にサインアウトできませんでした', error.message)
        });
      }
    },
    async deleteAccount() {
      const confirmResult = confirm('あなたのデータは全て削除されます。本当にアカウントを削除しますか？');
      if (confirmResult) {
        try {
          const credential = await this.$store.dispatch('promptForCredentials');
          await firebase.auth().currentUser.reauthenticateWithCredential(credential);
          console.log('ユーザーが再認証されました');

          await firebase.auth().currentUser.delete();
          alert('正常にアカウントを削除しました');
          this.deleteUserData();
          this.deleteUsersTodoData();
          this.$router.push('/SignIn');
        } catch (error) {
          alert('正常にアカウントを削除できませんでした');
          console.error(error);
        }
      } else {
        return;
      }
    },
    deleteUserData() { //todo できていない
      firebase.firestore().collection("users").doc(this.$store.state.userData.uuid).delete()
      .then(() => {
        alert('正常にユーザーデータを削除しました')
      }).catch((error) => {
        alert('正常にユーザーデータを削除できませんでした');
          console.error(error);

      });
    },
    deleteUsersTodoData() { //todo できていない
      firebase.firestore().collection("todos").doc(this.$store.state.userData.uuid).delete()
      .then(() => {
        alert('正常にあなたのTodoデータを削除しました')
      }).catch((error) => {
        alert('正常にあなたのTodoデータを削除できませんでした');
        console.error(error);

      });
    },
  },
  created() {
    this.$store.dispatch('onAuthStateChangedHandler')
  }
}
</script>

<style scoped>
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

.user-icon {
  width: 50%;
}

.EditableArea {
  margin: 0 5vw 5vh 5vw;
  padding: 2vh 0 5vh;
  border-radius: 15px;
  background: #fafaff;
  box-shadow: 8px 8px 16px #d5d5d9, -8px -8px 16px #ffffff;
}
.signOut-delete,
.notEditableArea {
  display: flex;
  flex-direction: column;
  width: 80vw;
  margin: auto;
}
.signOut-delete {
  margin: 2vh auto 0;
}
.signOut-delete button {
  margin: 1vh 0;
}
.set,
.signOut-delete button  {
  margin: 2vh 0;
  padding: 1vh;
  border: none;
  border-radius: 10px;
  background: #fafaff;
  box-shadow:  7px 7px 10px #d7d7db,-7px -7px 10px #ffffff;
}
</style>
