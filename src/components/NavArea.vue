<template>
  <div>
    <div class="navLink">
      <router-link to="/MyPage">MyPage</router-link>
      <router-link to="/AllArchive">AllArchive</router-link>
      <router-link to="/SettingProfile">Setting</router-link>
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
  </div>
</template>

<script>
import firebase from "firebase/app";
import axios from 'axios';
const CollectionURL = 'https://firestore.googleapis.com/v1/projects/task-app-64bfb/databases/(default)/documents'
const navItemsCollectionURL = CollectionURL + "/navItems";


const toDate = firebase.firestore.Timestamp.now().toDate();
import { format } from 'date-fns';
const myShaped = format(toDate, 'yyyyMMddHHmmss');


export default {
  name: 'NavArea',
  props: {
    msg: String
  },
  computed: {
    navMemoValue() {
      return this.$store.state.navData
    },
  },
  data() {
    return {
      options: {
        animation: 200
      },
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
  }
}
</script>

<style scoped>
</style>
