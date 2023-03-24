<template>
  <div id="container" class="myPage">
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
      <router-link to="/AllArchive">AllArchive</router-link>
      <div class="navItemsArea" @click="openNewMemoEdit">
        <!-- add用のarticle -->
        <article @click.stop>
          <div v-if="navData.newNavOpen" @click="closeNavModal" class="back-bord"></div>
          <div v-if="navData.newNavOpen" class="nav-modal">
            <div class="nav-input">
              <input type="text" class="navModalTitle" v-model="navData.navModalTitle" placeholder="Title">
              <input type="text" class="navModalTextArea" v-model="navData.navModalTextArea" placeholder="Text Area">
            </div>
            <button @click="addNavItem">追加する</button>
          </div>
        </article>

        <article v-for="(memo, index) in navMemoValue" :key="index" @click.stop>
          <div v-if="memo.navOpen" @click="closeNavModal(memo)" class="back-bord"></div>
          <p @click="openMemoEdit(memo)">{{ memo.navModalTitle }}</p>
          <div v-if="memo.navOpen" class="nav-modal">

            <div v-if="!memo.editText" @click="editTextStatus(memo)" class="nav-input">
              <h2>{{ memo.navModalTitle }}</h2>
              <p class="nav-textArea">{{ memo.navModalTextArea }}</p>
            </div>

            <div v-if="memo.editText" class="nav-input">
              <input type="text" class="navModalTitle" v-model="memo.navModalTitle" placeholder="Title">
              <input type="text" class="navModalTextArea" v-model="memo.navModalTextArea" placeholder="Text Area">
            </div>

            <button @click="deleteNavItem(memo)">削除</button>
          </div>
        </article>

      </div>
    </section>
    <section id="itemC" class="main">
      <h3 clsss="nowDate">{{ $store.state.nowDate }}</h3>
      <div class="todos-area">
        <table>
          <tr>
            <th>完了</th>
            <th>期限</th>
            <th>todo</th>
          </tr>

          <tr v-for="(task, index) in tasksValue" :key="index">
            <td><input type="checkbox" v-model="task.completed" @change="handleCheckboxChange(task)" name="" id=""></td>
            <td><input type="datetime-local" v-model="task.dateLimit" @change="dateLimitSet(task)" name="" id=""></td>
            <td @click="editTask(task)">
              <span v-if="!task.editing">{{ task.taskContent }}</span>
              <input v-else type="text" v-model="task.taskContent" @keydown.enter="editEnd(task)">
            </td>
            <button  v-if="task.editing" @click="editEnd(task)">完了</button>
            <button @click="deleteTask(task)">削除</button>
          </tr>

        </table>
      </div>
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
  components: {
  },
  computed: {
    navMemoValue() {
      return this.$store.state.navData
    },
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
      navData: {
        newNavOpen: false,
        navModalTitle: '',
        navModalTextArea: '',
      }
    }
  },
  methods: {
    openNewMemoEdit() {
      this.navData.newNavOpen = true,
      console.log('openNewNavItem')
    },
    openMemoEdit(memo) {
      memo.navOpen = true,
      console.log('memo openMemoEdit', memo)
    },
    editTextStatus(memo) {
      memo.editText = true
    },
    closeNavModal(memo) {
      if(!memo.navOpen) {
        this.navData.newNavOpen = false
        console.log('closeNavModal')
      } else {
        memo.navOpen = false,
        console.log('memo closeNavModal', memo)
      }
      memo.editText = false
    },
    addNavItem() {
      if(!this.navData.navModalTitle) {
        return
      } else {
        this.addNavItemForFirestore(this.navData)
        console.log('addNavItem run', this.navData)
        this.navData.newNavOpen = false
      }
    },
    deleteNavItem(memo) {
      if(!confirm('本当に削除しますか？')) {
        return
      } else {
        firebase.firestore().collection("navItems").doc(memo.docID).delete()
        .then(() => {
          alert("memoを削除しました");
          memo.navOpen = false
        }).catch((error) => {
          console.error("memo Error removing document: ", error);
        });
      }
    },



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
      'addNavItemForFirestore',
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
.nav-modal {
  background-color: blanchedalmond;
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
.nav-modal button {
  height: 6%;
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



.todos-area {
  display: inline-block;
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
  border: 1px solid black;
  border-radius: 5px;
  width: 90%;
  margin: 2%;
  padding: 2%;
}
table {
  margin: auto;
}
.archive-task {
  pointer-events: none;
  user-select: none;
  opacity: .5;
}

#container {
  height: 82vh;
  display: grid;
  grid-template-rows: 30% 70%;
  grid-template-columns: 1fr 80%;
  grid-template-areas:
    "nav  head"
    "nav  main"
}
#itemA {
  grid-area: head;
}
#itemB {
  grid-area: nav;
}
#itemC {
  grid-area: main;
}

</style>
