<template>
  <div id="container" class="AllArchive">
    <section id="itemA" class="header">
      <div v-if="$store.state.userData.userName" class="headInfo">
        <h2>ユーザー：{{ $store.state.userData.userName }}</h2>
      </div>
      <div v-else >
        <h2>現在ログインされておりません</h2>
        <p><router-link  outer-link to="/SignIn">サインインする</router-link></p>
      </div>
      <div>
        <img class="user-icon" :src="$store.state.userData.iconURL" alt="">
      </div>
    </section>

    <section id="itemB" class="nav">
      <router-link to="/MyPage">MyPage</router-link>
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
      <div class="todos-area end-todos">
        <h3>Archive Tasks</h3>
        <table>
          <tr>
            <th>完了</th>
            <th>期限</th>
            <th>todo</th>
          </tr>

          <tr v-for="(task, index) in archiveTasksValue" :key="index">
            <td><input type="checkbox" v-model="task.completed" @change="handleCheckboxChange(task)"></td>
            <td><input type="datetime-local" v-model="task.dateLimit" @change="dateLimitSet(task)" class="archive-task"></td>
            <td @click="taskOpen(task)"  class="archive-task">
              <span v-if="!task.taskOpen">{{ task.taskContent }}</span>
            </td>
            <div v-if="task.taskOpen" @click="editEnd(task)" class="back-bord"></div>
            <div v-if="task.taskOpen" class="nav-modal">
              <div v-if="!task.editing" @click="editTaskStatus(task)" class="nav-input">
                <h2>{{ task.taskContent }}</h2>
                <p v-if="!task.taskModalTextArea" class="nav-textArea placeholderText">Text Area</p>
                <p v-else class="nav-textArea">{{ task.taskModalTextArea }}</p>
              </div>
              <div v-else class="nav-input">
                <input type="text" class="navModalTitle" v-model="task.taskContent" placeholder="Task">
                <input type="text" class="navModalTextArea" v-model="task.taskModalTextArea" placeholder="Text Area">
              </div>
              <button @click="deleteTask(task)">削除</button>
            </div>
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
    handleFileUpload() {
      this.selectedFile = this.$refs.fileInput.files[0];
    },
    ...mapActions([
      'addTodoForFirebase',
      'addNavItemForFirestore',
    ]),
    addTodo() {
      console.log('addTodaaaao run')
      this.addTodoForFirebase(this.taskContent)
    },
    taskOpen(task) {
      task.taskOpen = true
      console.log('taskOpen')
    },
    editTaskStatus(task) {
      task.editing = true
    },
    editEnd(task) {
      firebase.firestore().collection("todos").doc(task.docID).update({
        taskContent: task.taskContent,
        taskModalTextArea: task.taskModalTextArea,
        z_updatedAt: myShaped,
      })
      .then(() => {
        console.log("editEnd run");
        task.taskOpen = false
        task.editing = false
      })
      .catch((error) => {
        console.error("Error updating document: ", error);
      });
    },
    deleteTask(task) {
      if(!confirm('このtaskを削除しますか？')) {
        return
      } else {
        firebase.firestore().collection("todos").doc(task.docID).delete()
        .then(() => {
          alert("todoを削除しました");
          task.taskOpen = false
          task.editing = false
        }).catch((error) => {
          console.error("Error removing document: ", error);
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
.nav-textArea {
  height: 90%;
  margin: 5% 0;
  display: flex;
  align-items: center;
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
.archive-task,
.placeholderText {
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
