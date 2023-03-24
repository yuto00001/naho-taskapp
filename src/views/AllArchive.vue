<template>
  <div id="container" class="AllArchive">
    <section id="itemA" class="header">
      <div>
        <img class="user-icon" :src="$store.state.userData.iconURL" alt="">
      </div>
      <div v-if="$store.state.userData.userName" class="headInfo">
        <h2>ユーザー：{{ $store.state.userData.userName }}</h2>
        <router-link to="/SettingProfile">プロフィール設定</router-link>
      </div>
      <div v-else >
        <h2>現在ログインされておりません</h2>
        <p><router-link  outer-link to="/SignIn">サインインする</router-link></p>
      </div>
    </section>
    <section id="itemB" class="nav">
      <h2>Month</h2>
      <section>
        <router-link to="/Month2">
          <p>{{ '2' }}月</p>
        </router-link>
      </section>
    </section>
    <section id="itemC" class="main">
      <h3 clsss="nowDate">{{ $store.state.nowDate }}</h3>
      <div class="todos-area end-todos">
        <h3>Archive Tasks</h3>
        <table>
          <tr>
            <th>完了</th>
            <th>期限</th>
            <th>todo</th>
          </tr>

          <tr v-for="(task, index) in archiveTasksValue" :key="index">
            <td><input type="checkbox" v-model="task.completed" @change="handleCheckboxChange(task)" name="" id=""></td>
            <td><input type="datetime-local" v-model="task.dateLimit" @change="dateLimitSet(task)" class="archive-task"></td>
            <td @click="editTask(task)" class="archive-task">
              <span v-if="!task.editing">{{ task.taskContent }}</span>
              <input v-else type="text" v-model="task.taskContent" @keydown.enter="editEnd(task)">
            </td>
            <button  v-if="task.editing" @click="editEnd(task)">完了</button>
            <button @click="deleteTask(task)">削除</button>
          </tr>

        </table>
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
  name: 'AllArchive',
  computed: {
    tasksValue() {
      return this.$store.state.tasks
    },
    archiveTasksValue() {
      return this.$store.state.archiveTasks
    },
  },
  data() {
    return {
      taskContent: '',
      selectedFile: null,
    }
  },
  methods: {
    handleCheckboxChange(task) {
      console.log('task.completed', task.completed)
      this.switchTaskCheck(task)
    },
    switchTaskCheck(task) {
      console.log('archive run', task.completed)
      this.$store.dispatch('updateCheckTaskForFirestore', task)
    },
    dateLimitSet(task) {
      console.log('dateLiimitSet', task.dateLimit)
      this.$store.dispatch('updateLimitForFirestore', task)
    },
    handleFileUpload() { //todo watchにいれるべきでは。。。ファイル追加されてもデータにはいらない
      // todo とりあえず手動でcomponentsを更新してチェックする
      this.selectedFile = this.$refs.fileInput.files[0];
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
.archive-task {
  opacity: 1;
}
</style>
