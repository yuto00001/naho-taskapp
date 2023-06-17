<template>
  <div id="container" class="myPage">
    <section id="itemA" class="header">
      <div v-if="$store.state.userData.userName" class="headInfo">
        <h2>{{ $store.state.userData.userName }}</h2>
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
      <div class="input-area">
        <input type="text" v-model="taskContent" placeholder="new task">
        <button @click="addTodo()">ADD</button>
      </div>
      <div class="todos-area">
        <div class="task-head">
          <div class="open-or-close" @click="closeTasksAreaButton">
            <span class="material-icons" @click="TRANSITION_DOWN" v-if="$store.state.closeTasksArea">open_in_full</span>
            <span class="material-icons" @click="TRANSITION_UP" v-else>close_fullscreen</span>
          </div>
          <h3>Tasks</h3>
        </div>
        <table v-if="!$store.state.closeTasksArea">
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
                <div v-else class="nav-textArea placeholderText">
                  <p>{{ task.taskModalTextArea  }}</p>
                </div>
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
        <div class="task-head">
          <div class="open-or-close" @click="closeArchiveAreaButton">
            <span class="material-icons" @click="TRANSITION_DOWN" v-if="$store.state.closeArchiveArea">open_in_full</span>
            <span class="material-icons" @click="TRANSITION_UP" v-else>close_fullscreen</span>
          </div>
          <h3>Archive Tasks</h3>
        </div>
        <table v-if="!$store.state.closeArchiveArea">
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
import axios from 'axios';
import Snd from 'snd-lib';
const CollectionURL = 'https://firestore.googleapis.com/v1/projects/task-app-64bfb/databases/(default)/documents'
const todosCollectionURL = CollectionURL + "/todos";


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
      snd: null,
    }
  },
  mounted() {
    this.snd = new Snd();
    this.snd.load(Snd.KITS.SND01);
  },
  methods: {
    ...mapActions(
      ['playSound'],
      ),
    BUTTON() {
      this.snd.play(Snd.SOUNDS.BUTTON);
    },
    DISABLED() {
      this.snd.play(Snd.SOUNDS.DISABLED);
    },
    SWIPE() {
      this.snd.play(Snd.SOUNDS.SWIPE);
    },
    TYPE() {
      this.snd.play(Snd.SOUNDS.TYPE);
    },
    PROGRESS_LOOP() {
      this.snd.play(Snd.SOUNDS.PROGRESS_LOOP);
    },
    TRANSITION_UP() {
      this.snd.play(Snd.SOUNDS.TRANSITION_UP);
    },
    TRANSITION_DOWN() {
      this.snd.play(Snd.SOUNDS.TRANSITION_DOWN);
    },

    closeTasksAreaButton() {
      this.$store.commit('closeTasksAreaButton')
    },
    closeArchiveAreaButton() {
      this.$store.commit('closeArchiveAreaButton')
    },
    handleCheckboxChange(task) {
      console.log('task.completed', task.completed)
      this.$store.dispatch('updateCheckTaskForFirestore', task)
      if (task.completed) {
        this.PROGRESS_LOOP()
      } else {
        this.DISABLED()
      }
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
    addTodo() {
      console.log('addTodaaaao run')
      this.$store.dispatch('addTodoForFirebase', this.taskContent)
      this.taskContent = ''
      this.TYPE()
    },
    taskOpen(task) {
      task.taskOpen = true
      document.body.classList.add("no-scroll")
      console.log('taskOpen')
      this.BUTTON()
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
            this.DISABLED()
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
              document.body.classList.remove("no-scroll");
              // tasks 配列から削除されたタスクを削除
              this.$store.commit('removeTask', task);
              this.$store.dispatch('sortUpdatedTasks');
              this.$store.dispatch('sortUpdatedArchiveTasks');
              this.SWIPE()
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
    this.$store.dispatch('loadSnd');
    this.$store.dispatch('onAuthStateChangedHandler')
  }
}

</script>

<style scoped>



</style>
