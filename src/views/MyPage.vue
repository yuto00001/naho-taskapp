<template>
  <div class="myPage">
    <div v-if="$store.state.userData.userName">
      <h1>{{ $store.state.userData.userName }}としてログインしています</h1>
      <router-link to="/SettingProfile">プロフィール設定</router-link>
    </div>
    <div v-else >
      <h1>現在ログインされておりません</h1>
      <p><router-link  outer-link to="/SignIn">サインインする</router-link></p>
    </div>
    <div class="signOut-delete">
      <button @click="signOut">SignOut</button>
      <button @click="deleteAccount">アカウントを削除</button>
    </div>
    <section class="calendar">
      <h2>calendar</h2>
    </section>
    <section class="main-area">
      <div class="todo-area">
        <table>
          <tr>
            <th>完了</th>
            <th>期限</th>
            <th>todo</th>
          </tr>

          <tr v-for="(task, index) in tasksValue" :key="index">
            <td><input type="checkbox" name="" id=""></td>
            <td><input type="date" name="" id=""></td>
            <td @click="editTask(task)">
              <span v-if="!task.editing">{{ task.taskContent }}</span>
              <input v-else type="text" v-model="task.taskContent" @keydown.enter="editEnd(task)">
            </td>
            <button  v-if="task.editing" @click="editEnd(task)">完了</button>
            <button @click="deleteTask(task)">削除</button>
          </tr>

        </table>
      </div>
      <div class="input-area">
        <input type="text" name="" id="" v-model="taskContent">
        <button @click="addTodo()">追加</button>
      </div>
    </section>
  </div>
</template>
<script>
import firebase from "firebase/app";
import { mapActions } from 'vuex';



const toDate = firebase.firestore.Timestamp.now().toDate();
import { format } from 'date-fns';
const myShaped = format(toDate, 'yyyyMMddHHmmss');


export default {
  name: 'MyPage',
  computed: {
    tasksValue() {
      return this.$store.state.tasks
    },
  },
  data() {
    return {
      taskContent: '',
      tasks: [],
    }
  },
  methods: {
    ...mapActions([
      'addTodoForFirebase',
    ]),
    addTodo() {//! ajaxを用いてtodoを部分読み込み
      console.log('addTodaaaao run')
      this.addTodoForFirebase(this.taskContent)
    },
    signOut() {
      if(confirm('本当にサインアウトしますか？')) {
        firebase.auth().signOut()
        .then(() => {
          alert('正常にサインアウトしました')
        }).catch((error) => {
          console.error(error)
        });
      }
    },
    editTask(task) {
      if(task.editing) {
        return
      } else {
        task.editing = true
      }
    },
    editEnd(task) {
      if(!task.editing) {
        return
      } else {
        task.editing = false
        firebase.firestore().collection("todos").doc(task.docID).update({
          taskContent: task.taskContent,
          z_updatedAt: myShaped,
        })
        .then(() => {
          console.log("editEnd run");
        })
        .catch((error) => {
          console.error("Error updating document: ", error);
        });
      }
    },
    deleteTask(task) { //! データの更新を待たずに画面上だけ削除したい = 意味は違うがajaxでできる
      firebase.firestore().collection("todos").doc(task.docID).delete()
      .then(() => {
        console.log("Document successfully deleted!");
      }).catch((error) => {
        console.error("Error removing document: ", error);
      });
    },
    deleteAccount() {
      firebase.auth().currentUser.reauthenticateWithCredential(this.promptForCredentials())
      .then((doc) => {
        console.log('デリート、プロンプト', doc)
        // ユーザーが認証されている場合はアカウント削除を実行する
        const confirmResult = confirm('あなたのデータは全て削除されます。本当にアカウントを削除しますか？');
        if (confirmResult) {
          firebase.auth().currentUser.delete()
          .then(() => {
            alert('正常にアカウントを削除しました');
            this.deleteUserData();
            this.deleteUsersTodoData();
          }).catch((error) => {
            alert('正常にアカウントを削除できませんでした');
            console.error(error);
          });
        } else {
          return
        }
      }).catch((error) => {
        console.error(error.message);
      });
    },
    promptForCredentials() {
      const email = prompt('メールアドレスを入力してください');
      const password = prompt('パスワードを入力してください');
      return firebase.auth.EmailAuthProvider.credential(email, password);
    },
    deleteUserData() {
      firebase.firestore().collection("users").doc(this.$store.state.userData.uuid).delete()
      .then(() => {
        alert('正常にユーザーデータを削除しました')
      }).catch((error) => {
        alert('正常にユーザーデータを削除できませんでした', error);
      });
    },
    deleteUsersTodoData() {
      firebase.firestore().collection("todos").doc(this.$store.state.userData.uuid).delete()
      .then(() => {
        alert('正常にあなたのTodoデータを削除しました')
      }).catch((error) => {
        alert('正常にあなたのTodoデータを削除できませんでした', error);
      });
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

</style>
