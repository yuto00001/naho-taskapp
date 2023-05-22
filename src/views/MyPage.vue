<template>
  <div id="container" class="myPage">
    <section id="itemA" class="header">
      <div v-if="$store.state.userData.userName" class="headInfo">
        <h2>ユーザー：{{ $store.state.userData.userName }}</h2>
      </div>
      <div v-else >
        <h2>現在ログインされておりません</h2>
        <p><router-link  outer-link to="/SignIn">サインインする</router-link></p>
      </div>
    </section>
    <section id="itemD">
      <img class="user-icon" :src="$store.state.userData.iconURL" alt="">
    </section>
    <section id="itemB" class="nav">
      <div class="navLink">
        <router-link to="/SignIn">signin</router-link>
        <router-link to="/AllArchive">AllArchive</router-link>
        <router-link to="/SettingProfile">setting</router-link>
      </div>
      <div class="navItemsArea">
        <!-- add用のarticle -->
        <article>
          <div v-if="navData.newNavOpen" @click="addNavItem" class="back-bord"></div>
          <div v-if="navData.newNavOpen" class="nav-modal">
            <div class="nav-input">
              <input type="text" class="navModalTitle" v-model="navData.navModalTitle" placeholder="Title">
              <textarea class="navModalTextArea" v-model="navData.navModalTextArea" placeholder="Text Area" cols="30" rows="10"></textarea>
            </div>
            <button @click="closeNewTextStatus">キャンセル</button>
          </div>
        </article>
        <article>
          <div class="memo-area">
            <div v-for="(memo, index) in navMemoValue" :key="index" class="memo">
              <div v-if="memo.navOpen" @click="closeNavModal(memo)" class="back-bord"></div>
              <p @click="openMemoEdit(memo)">{{ memo.navModalTitle }}</p>
              <div v-if="memo.navOpen" class="nav-modal">
                <div v-if="!memo.editText" @click="editTextStatus(memo)" class="nav-input">
                  <h2>{{ memo.navModalTitle }}</h2>
                  <p v-if="!memo.navModalTextArea" class="nav-textArea placeholderText">Text Area</p>
                  <p v-else class="nav-textArea placeholderText">{{ memo.navModalTextArea }}</p>
                </div>
                <div v-if="memo.editText" class="nav-input">
                  <input type="text" class="navModalTitle" v-model="memo.navModalTitle" placeholder="Title">
                  <textarea class="navModalTextArea" v-model="memo.navModalTextArea" placeholder="Text Area" cols="30" rows="10"></textarea>
                </div>
                <button @click="deleteNavItem(memo)">削除</button>
              </div>
            </div>
            <div>
              <p class="add-menu" @click="openNewMemoEdit">+</p>
            </div>
          </div>
        </article>
      </div>
    </section>
    <section id="itemC" class="main">
      <h3 clsss="nowDate">{{ $store.state.nowDate }}</h3>
      <div class="input-area">
        <input type="text" v-model="taskContent" placeholder="new task">
        <button @click="addTodo()">ADD</button>
      </div>
      <div class="todos-area">
        <h3>Tasks</h3>
        <table>
          <tr v-for="(task, index) in tasksValue" :key="index">
            <td class="td-1"><input type="checkbox" v-model="task.completed" @change="handleCheckboxChange(task)"></td>
            <td class="td-2">
              <input type="datetime-local" v-model="task.dateLimit" @change="dateLimitSet(task)">
              <p class="formattedDate">{{ formatDate(task.dateLimit) }}</p>
            </td>
            <td class="td-3" @click="taskOpen(task)">
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
      <div class="todos-area end-todos">
        <h3>Archive Tasks</h3>
        <table>
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
import { mapActions } from 'vuex';
import axios from 'axios';
const CollectionURL = 'https://firestore.googleapis.com/v1/projects/task-app-64bfb/databases/(default)/documents'
const todosCollectionURL = CollectionURL + "/todos";
const navItemsCollectionURL = CollectionURL + "/navItems";


const toDate = firebase.firestore.Timestamp.now().toDate();
import { format } from 'date-fns';
const myShaped = format(toDate, 'yyyyMMddHHmmss');


export default {
  name: 'MyPage',
  components: {},
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
      options: {
        animation: 200
      },
      taskContent: '',
      selectedFile: null,
      navData: {
        newNavOpen: false,
        navModalTitle: '',
        navModalTextArea: '',
      },
    }
  },
  methods: {
    openNewMemoEdit() {
      this.navData.newNavOpen = true,
      console.log('openNewNavItem')
    },
    openMemoEdit(memo) {
      memo.navOpen = true,
      document.body.classList.add("no-scroll")
      console.log('memo openMemoEdit', memo)
    },
    editTextStatus(memo) {
      memo.editText = true
    },
    closeNavModal(memo) {
      memo.navOpen = false,
      document.body.classList.remove("no-scroll");
      console.log('memo closeNavModal', memo)
      this.updateMemoData(memo)
      memo.editText = false
    },
    closeNewTextStatus() {
      this.navData.newNavOpen = false
      console.log('new item modal close')
    },
    updateMemoData(memo) {
      axios.get(navItemsCollectionURL)
      .then(response => {
        const navItems = response.data.documents;

        const targetNavItem = navItems.find(item => {
          return item.fields.z_createdAt.stringValue === memo.z_createdAt;
        });

        if (targetNavItem) {
          const fullPath = targetNavItem.name;
          const documentId = fullPath.split('/').pop();
          console.log('update get fullpath cut', documentId);

          const updateMaskParams = [
            "updateMask.fieldPaths=navModalTitle",
            "updateMask.fieldPaths=navModalTextArea",
            "updateMask.fieldPaths=z_updatedAt"
          ].join('&');

          axios.patch(
            `${navItemsCollectionURL}/${documentId}?${updateMaskParams}`,
            {
              fields: {
                navModalTitle: {
                  stringValue: memo.navModalTitle,
                },
                navModalTextArea: {
                  stringValue: memo.navModalTextArea,
                },
                z_updatedAt: {
                  stringValue: myShaped,
                },
              },
            }
          )
          .then(() => {
            this.$store.commit('sortNavData');
          })
          .catch((error) => {
            console.error("Error updating document: ", error.response.data);
          });
        } else {
          console.log('No matching data found');
        }
      });
    },


    addNavItem() {
      if(!this.navData.navModalTitle) {
        this.navData.newNavOpen = false;
      } else {
        console.log('addNavItem run', this.navData)
        this.addNavItemForFirestore(this.navData)
        this.closeNewTextStatus()
        this.$store.commit('sortNavData');
      }
    },
    deleteNavItem(memo) {
      if(!confirm('本当に削除しますか？')) {
        return
      } else {
        axios.get(navItemsCollectionURL)
        .then(response => {
          const navItems = response.data.documents;
          const targetNavItems = navItems.find(item => {
            return item.fields.z_createdAt.stringValue === memo.z_createdAt;
          });
          if (targetNavItems) {
            const fullPath = targetNavItems.name;
            const documentId = fullPath.split('/').pop();
            axios.delete(
              `${navItemsCollectionURL}/${documentId}`
            )
            .then(() => {
              memo.navOpen = false
              // memo 配列から削除されたタスクを削除
              this.$store.commit('removeNavItem', memo);
              this.$store.commit('sortNavData');
              this.$store.dispatch('sortNavItems');
            })
            .catch((error) => {
              console.error("Error delete document: ", error.response.data);
            });
          } else {
            console.log('No matching data found');
          }
        });
      }
    },


    handleCheckboxChange(task) {
      console.log('task.completed', task.completed)
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
      this.taskContent = ''
    },
    taskOpen(task) {
      task.taskOpen = true
      document.body.classList.add("no-scroll")
      console.log('taskOpen')
    },
    editTaskStatus(task) {
      task.editing = true
    },
    editEnd(task) {
      axios.get(todosCollectionURL)
      .then(response => {
        const todos = response.data.documents;

        const targetTodo = todos.find(item => {
          return item.fields.z_createdAt.stringValue === task.z_createdAt;
        });

        if (targetTodo) {
          const fullPath = targetTodo.name;
          const documentId = fullPath.split('/').pop();
          console.log('update get fullpath cut', documentId);

          const updateMaskParams = [
            "updateMask.fieldPaths=taskContent",
            "updateMask.fieldPaths=taskModalTextArea",
            "updateMask.fieldPaths=z_updatedAt"
          ].join('&');

          axios.patch(
            `${todosCollectionURL}/${documentId}?${updateMaskParams}`,
            {
              fields: {
                taskContent: {
                  stringValue: task.taskContent,
                },
                taskModalTextArea: {
                  stringValue: task.taskModalTextArea,
                },
                z_updatedAt: {
                  stringValue: myShaped,
                },
              },
            }
          )
          .then(() => {
            console.log("editEnd run");
            document.body.classList.remove("no-scroll")
            task.taskOpen = false
            task.editing = false
          })
          .catch((error) => {
            console.error("Error updating document: ", error.response.data);
          });
        } else {
          console.log('No matching data found');
        }
      });
    },
    deleteTask(task) {
      if(!confirm('このtaskを削除しますか？')) {
        return
      } else {
        axios.get(todosCollectionURL)
        .then(response => {
          const todos = response.data.documents;
          const targetTodo = todos.find(item => {
            return item.fields.z_createdAt.stringValue === task.z_createdAt;
          });
          if (targetTodo) {
            const fullPath = targetTodo.name;
            const documentId = fullPath.split('/').pop();
            axios.delete(
              `${todosCollectionURL}/${documentId}`
            )
            .then(() => {
              task.taskOpen = false
              task.editing = false
              // tasks 配列から削除されたタスクを削除
              this.$store.commit('removeTask', task);
              this.$store.dispatch('sortUpdatedTasks');
              this.$store.dispatch('sortUpdatedArchiveTasks');
            })
            .catch((error) => {
              console.error("Error delete document: ", error.response.data);
            });
          } else {
            console.log('No matching data found');
          }
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
