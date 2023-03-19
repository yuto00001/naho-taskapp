<template>
  <div class="myPage">
    <div>
      <img class="header-image" src="" alt="">
      <img class="user-icon" :src="$store.state.userData.iconURL" alt="">
    </div>
    <div v-if="$store.state.userData.userName">
      <h2>ユーザー：{{ $store.state.userData.userName }}</h2>
      <router-link to="/SettingProfile">プロフィール設定</router-link>
    </div>
    <div v-else >
      <h2>現在ログインされておりません</h2>
      <p><router-link  outer-link to="/SignIn">サインインする</router-link></p>
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
      selectedFile: null,
      tasks: [],
    }
  },
  methods: {
    handleFileUpload() { //todo watchにいれるべきでは。。。ファイル追加されてもデータにはいらない
      // todo とりあえず手動でcomponentsを更新してチェックする
      this.selectedFile = this.$refs.fileInput.files[0];
    },
    addIconImageTest() {
      this.$store.dispatch('addIconImage', this.selectedFile)
    },
    ...mapActions([
      'addTodoForFirebase',
    ]),
    addTodo() {//todo ajaxを用いてtodoを部分読み込み
      console.log('addTodaaaao run')
      this.addTodoForFirebase(this.taskContent)
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
    deleteTask(task) { //todo データの更新を待たずに画面上だけ削除したい = 意味は違うがajaxでできる
      firebase.firestore().collection("todos").doc(task.docID).delete()
      .then(() => {
        alert("todoを削除しました");
      }).catch((error) => {
        console.error("Error removing document: ", error);
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
.header-image {
  width: 100vw;
  height: 8vh;
}
.user-icon {
  position: absolute;
  top: 10%;
  left: 41%;
}

</style>
