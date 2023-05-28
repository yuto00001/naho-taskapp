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
    </section>
    <UserIcon id="itemD"/>
    <NavArea id="itemB" class="nav"/>
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
            <td class="td-1"><input type="checkbox" v-model="task.completed" @change="handleCheckboxChange(task)"></td>
            <td class="td-2">
              <input type="datetime-local" class="archive-task" v-model="task.dateLimit" @change="dateLimitSet(task)">
              <p class="formattedDate">{{ formatDate(task.dateLimit) }}</p>
            </td>
            <td class="td-3 archive-task" @click="taskOpen(task)">
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
                <textarea class="taskModalTextArea" v-model="task.taskModalTextArea" placeholder="Text Area" cols="30" rows="10"></textarea>
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
import UserIcon from '@/components/UserIcon.vue';
import NavArea from '@/components/NavArea.vue';
import { mapActions } from 'vuex';




const toDate = firebase.firestore.Timestamp.now().toDate();
import { format } from 'date-fns';
const myShaped = format(toDate, 'yyyyMMddHHmmss');



export default {
  name: 'MyPage',
  components: {
    UserIcon,
    NavArea,
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
    formatDate(dateString) {
      if(dateString) {
        const date = new Date(dateString);
        return `${date.getMonth() + 1}/${date.getDate()}`;
      } else {
        return 'null';
      }
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



</style>
