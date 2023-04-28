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
        <router-link to="/AllArchive">AllArchive</router-link>
        <router-link to="/SettingProfile">setting</router-link>
      </div>
      <div class="navItemsArea" @click="openNewMemoEdit">
        <!-- add用のarticle -->
        <article @click.stop>
          <div v-if="navData.newNavOpen" @click="addNavItem" class="back-bord"></div>
          <div v-if="navData.newNavOpen" class="nav-modal">
            <div class="nav-input">
              <input type="text" class="navModalTitle" v-model="navData.navModalTitle" placeholder="Title">
              <textarea class="navModalTextArea" v-model="navData.navModalTextArea" cols="30" rows="10"></textarea>
            </div>
            <button @click="closeNewTextStatus">キャンセル</button>
          </div>
        </article>
        <article @click.stop>
          <draggable :options="options">
            <div v-for="(memo, index) in navMemoValue" :key="index" class="memo">
              <div v-if="memo.navOpen" @click="closeNavModal(memo)" class="back-bord"></div>
              <p @click="openMemoEdit(memo)">{{ memo.navModalTitle }}</p>
              <div v-if="memo.navOpen" class="nav-modal">
                <div v-if="!memo.editText" @click="editTextStatus(memo)" class="nav-input">
                  <h2>{{ memo.navModalTitle }}</h2>
                  <pre class="nav-textArea">{{ memo.navModalTextArea }}</pre>
                </div>
                <div v-if="memo.editText" class="nav-input">
                  <input type="text" class="navModalTitle" v-model="memo.navModalTitle" placeholder="Title">
                  <textarea class="navModalTextArea" v-model="memo.navModalTextArea" cols="30" rows="10"></textarea>
                </div>
                <button @click="deleteNavItem(memo)">削除</button>
              </div>
            </div>
          </draggable>
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
            <td><input type="checkbox" v-model="task.completed" @change="handleCheckboxChange(task)"></td>
            <td><input type="datetime-local" v-model="task.dateLimit" @change="dateLimitSet(task)"></td>
            <td @click="taskOpen(task)">
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
                <textarea class="taskModalTextArea" v-model="task.taskModalTextArea" cols="30" rows="10"></textarea>
              </div>
              <button @click="deleteTask(task)">削除</button>
            </div>
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
              <textarea class="taskModalTextArea" v-model="navData.taskModalTextArea" cols="30" rows="10"></textarea>
              </div>
              <button @click="deleteTask(task)">削除</button>
            </div>
          </tr>

        </table>
      </div>
      <div class="input-area">
        <input type="text" v-model="taskContent">
        <button @click="addTodo()">追加</button>

      </div>
    </section>
  </div>
</template>
<script>
import firebase from "firebase/app";
import { mapActions } from 'vuex';
import axios from 'axios';
import draggable from 'vuedraggable'
// const CollectionURL = 'https://firestore.googleapis.com/v1/projects/task-app-64bfb/databases/(default)/documents'
// const usersCollectionURL = CollectionURL + "/users";
// const todosCollectionURL = CollectionURL + "/todos";
// const navItemsCollectionURL = CollectionURL + "/navItems";


const toDate = firebase.firestore.Timestamp.now().toDate();
import { format } from 'date-fns';
const myShaped = format(toDate, 'yyyyMMddHHmmss');


export default {
  name: 'MyPage',
  components: {
    draggable
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
      options: {
        animation: 200
      },
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
      memo.navOpen = false,
      console.log('memo closeNavModal', memo)
      this.updateMemoData(memo)
      memo.editText = false
    },
    closeNewTextStatus() {
      this.navData.newNavOpen = false
      console.log('new item modal close')
    },
    updateMemoData(memo) {
      axios.get("https://firestore.googleapis.com/v1/projects/task-app-64bfb/databases/(default)/documents/navItems")
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
            `https://firestore.googleapis.com/v1/projects/task-app-64bfb/databases/(default)/documents/navItems/${documentId}?${updateMaskParams}`,
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
            console.log("editEnd run");
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
      }
    },
    deleteNavItem(memo) {
      if(!confirm('本当に削除しますか？')) {
        return
      } else {
        axios.get("https://firestore.googleapis.com/v1/projects/task-app-64bfb/databases/(default)/documents/navItems")
        .then(response => {
          const navItems = response.data.documents;
          const targetNavItems = navItems.find(item => {
            return item.fields.z_createdAt.stringValue === memo.z_createdAt;
          });
          if (targetNavItems) {
            const fullPath = targetNavItems.name;
            const documentId = fullPath.split('/').pop();
            axios.delete(
              `https://firestore.googleapis.com/v1/projects/task-app-64bfb/databases/(default)/documents/navItems/${documentId}`
            )
            .then(() => {
              memo.navOpen = false
              // memo 配列から削除されたタスクを削除
              this.$store.commit('removeNavItem', memo);
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
      console.log('taskOpen')
    },
    editTaskStatus(task) {
      task.editing = true
    },
    editEnd(task) {
      axios.get("https://firestore.googleapis.com/v1/projects/task-app-64bfb/databases/(default)/documents/todos")
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
            `https://firestore.googleapis.com/v1/projects/task-app-64bfb/databases/(default)/documents/todos/${documentId}?${updateMaskParams}`,
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
        axios.get("https://firestore.googleapis.com/v1/projects/task-app-64bfb/databases/(default)/documents/todos")
        .then(response => {
          const todos = response.data.documents;
          const targetTodo = todos.find(item => {
            return item.fields.z_createdAt.stringValue === task.z_createdAt;
          });
          if (targetTodo) {
            const fullPath = targetTodo.name;
            const documentId = fullPath.split('/').pop();
            axios.delete(
              `https://firestore.googleapis.com/v1/projects/task-app-64bfb/databases/(default)/documents/todos/${documentId}`
            )
            .then(() => {
              task.taskOpen = false
              task.editing = false
              // tasks 配列から削除されたタスクを削除
              this.$store.commit('removeTask', task);
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
.memo:hover {
  cursor: grab;
}
.memo:active {
  cursor: grabbing;
}
.nav-modal {
  background-color: blanchedalmond;
  position: absolute;
  top: 25vh;
  right: 0;
  left: 0;
  margin: 0 auto;
  height: 65vh;
  width: 75vw;
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
  text-align: initial;
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
.navLink {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.navItemsArea {
  height: 90%;
}
.navModalTitle {
  margin: 5% 0 3%;
  height: 5%;
}
.navModalTextArea {
  height: 83%;
  padding: 5% 2%;
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
  grid-template-rows: 15% 35%;
  grid-template-columns: 20% 80%;
  grid-template-areas:
    "img  head"
    "nav  main"
    "nav  main"
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
#itemD {
  grid-area: img;
  align-self: end;
}

</style>
