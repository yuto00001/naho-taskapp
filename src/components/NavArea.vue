<template>
  <div>
    <div class="navLink" @click="CAUTION">
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
                <div v-else class="nav-textArea placeholderText">
                  <p>{{ memo.navModalTextArea }}</p>
                </div>
              </div>
              <div v-if="memo.editText" class="nav-input">
                <input type="text" class="navModalTitle" v-model="memo.navModalTitle" placeholder="Title">
                <textarea class="navModalTextArea" v-model="memo.navModalTextArea" placeholder="Text Area" cols="30" rows="10"></textarea>
              </div>
              <button @click="deleteNavItem(memo)">削除</button>
            </div>
          </div>
          <div>
            <p class="add-menu memo" @click="openNewMemoEdit">+</p>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<script>
import firebase from "firebase/app";
import axios from 'axios';
import { mapActions } from 'vuex';
import Snd from 'snd-lib';
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
    CAUTION() {
      this.snd.play(Snd.SOUNDS.CAUTION);
    },
    BUTTON() {
      this.snd.play(Snd.SOUNDS.BUTTON);
    },
    DISABLED() {
      this.snd.play(Snd.SOUNDS.DISABLED);
    },
    TYPE() {
      this.snd.play(Snd.SOUNDS.TYPE);
    },
    SWIPE() {
      this.snd.play(Snd.SOUNDS.SWIPE);
    },
    openNewMemoEdit() {
      this.navData.newNavOpen = true,
      console.log('openNewNavItem')
      this.BUTTON()
    },
    openMemoEdit(memo) {
      memo.navOpen = true,
      document.body.classList.add("no-scroll")
      console.log('memo openMemoEdit', memo)
      this.BUTTON()
    },
    editTextStatus(memo) {
      memo.editText = true
    },
    closeNavModal(memo) {
      memo.navOpen = false,
      document.body.classList.remove("no-scroll")
      console.log('memo closeNavModal', memo)
      this.updateMemoData(memo)
      this.DISABLED()
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
            this.navData.navModalTitle = '';
            this.navData.navModalTextArea = '';
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
        this.SWIPE()
      } else {
        console.log('addNavItem run', this.navData)
        this.$store.dispatch('addNavItemForFirestore', this.navData)
        this.closeNewTextStatus()
        this.$store.commit('sortNavData');
        this.TYPE()
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
  }
}
</script>

<style scoped>
</style>
