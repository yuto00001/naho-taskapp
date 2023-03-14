import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";


import { format } from 'date-fns';
const toDate = firebase.firestore.Timestamp.now().toDate();
const myShaped = format(toDate, 'yyyyMMddHHmmss');

Vue.use(Vuex)

export default new Vuex.Store({
  state: { // 空のオブジェクトを定義する
    tasks: [],
    a_loginWindow: false,
    taskContent: '', //todo これいらないのでは
    editing: false,
    userData: {
      profileName: '',
      userName: '', //todo いらない
      email: '',
      password: '', //todo セキュリティ対応
      icon: '',
      uuid: '',
      z_createdAt: '',
      z_updatedAt: '',
    },
  },
  getters: {// state の値を取得するための関数を定義する
// 注意：JavaScriptのオブジェクトや配列は参照型(値が格納されているメモリアドレスをコピーして使用する)であるため、更新された場合に自動的に再描画されない。だから、値に変更があるごとに更新されるgettersにアクセスしたい場合がある。

  },
  mutations: { //state変更できる唯一の手段。この中は同期的。
    //? なぜmutationを経由してstateを変更することしかしてはいけないのか
    setTasksData(state, tasksData) {
      state.tasks = tasksData
    },
    updateUserData(state, userData) {
      state.userData.profileName = userData.profileName
      state.userData.userName = userData.userName
      state.userData.email = userData.email
      state.userData.password = userData.password
      state.userData.icon = userData.icon
      state.userData.uuid = userData.uuid
      state.userData.z_createdAt = myShaped
      state.userData.z_updatedAt = myShaped
    },
    addUuid(state, uuid) {
      state.userData.uuid = uuid
    },
    toggleInput(state) {
      state.editing = !state.editing;
    },
  },
  actions: { //methods的にイジる。この中は非同期。コンポ間で共有したいメソッドのみ。
    addTodoForFirebase(context, taskContent) {
      axios.post("https://firestore.googleapis.com/v1/projects/task-app-64bfb/databases/(default)/documents/todos", { //! なぜかうまく送信できない 400error = URLに問題あり
        fields: {
          profileName: context.state.userData.profileName,
          userName: context.state.userData.userName,
          email: context.state.userData.email,
          icon: '',
          uuid: context.state.userData.uuid,
          docID: '',
          taskContent: taskContent,
          editing: context.state.editing,
          z_createdAt: myShaped,
          z_updatedAt: myShaped,
          // profileName: {
          //   stringValue:context.state.userData.profileName,
          // },
          // userName: {
          //   stringValue: context.state.userData.userName,
          // },
          // email: {
          //   stringValue: context.state.userData.email,
          // },
          // icon: {
          //   stringValue: '',
          // },
          // uuid: {
          //   stringValue: context.state.userData.uuid,
          // },
          // docID: {
          //   stringValue: '',
          // },
          // taskContent: {
          //   stringValue: taskContent,
          // },
          // editing: {
          //   stringValue: context.state.editing,
          // },
          // z_createdAt: {
          //   stringValue: myShaped,
          // },
          // z_updatedAt: {
          //   stringValue: myShaped,
          // },
        }
      // }, {
      //   headers: {
      //     'Authorization': "Bearer " + firebase.auth().currentUser.getIdToken(), //アクセストークンを取得、指定
      //     'Content-Type': 'application/json' //送信するデータの形式を指定
      //     //! その次は、axiosをデータの取得にも反映させて、画面に表示できるようにする。
      //   }
      }).then(response => {
        // ドキュメントの追加が成功した場合の処理
        console.log('addTodo run', response)
      }).catch(error => {
        // エラーが発生した場合の処理
        console.error("Error writing document: ", error.message);
      });
    },
    addUserDataForFirebase(context, userData) {
      firebase.firestore().collection("users").add({
        ...userData,
        z_createdAt: myShaped,
        z_updatedAt: myShaped,
      })
      .then(() => {
        console.log('User data added to Firebase:', userData, context)
      })
      .catch((error) => {
        console.error('Error adding user data to Firebase:', error)
      })
    },
    fetchTodoData(context) {
      // context.state.tasks = [];
      console.log('fetchTodoData', context.state.userData);
      if(!context.state.userData.email) {
        console.log('fetchTodoData: userData.email is empty');
        return
      } else {
        firebase.firestore().collection("todos").where("uuid", "==", context.state.userData.uuid).get()
        .then((querySnapshot) => {
          const tasksData = []
          querySnapshot.forEach((doc) => {
            const data = {
              profileName: doc.data().profileName,
              userName: doc.data().userName,
              email: doc.data().email,
              icon: '',
              uuid: doc.data().uuid,
              docID: doc.id,
              taskContent: doc.data().taskContent,
              editing: doc.data().editing,
              z_createdAt: doc.data().z_createdAt,
              z_updatedAt: doc.data().z_updatedAt,
            }
            console.log('fetchTodoData run', doc.id, " => ", doc.data());
            console.log('フェッチTODOデータ run', tasksData);
            tasksData.push(data)
          });
          context.commit('setTasksData', tasksData);
        })
        .catch((error) => {
          console.error("Error getting documents: ", error);
        });
      }
    },
    fetchUserData(context) {
      console.log('fetchUserData', context.state.userData.uuid);
      firebase.firestore().collection("users").where("uuid", "==", context.state.userData.uuid).get()
      .then((querySnapshot) => {
        const doc = querySnapshot.docs[0];
        if (doc.exists) {
          console.log("Document data:", doc.data());
          context.commit('updateUserData', doc.data())
          context.dispatch('fetchTodoData')
        } else {
          console.log("No such document!");
        }
      }).catch((error) => {
        console.log("Error getting document:", error);
      });
    },
    onAuthStateChangedHandler(context) {
      firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          context.commit('addUuid', user.uid)
          console.log('onAuthStateChangedHandler run', user.uid, user)
          context.dispatch('fetchUserData')
          // user.getIdToken().then(function(token) {
          //   // getIdToken()は、Firebase Authから取得したトークンを取得するためのメソッド。取得したトークンを使用して、Firebaseの各種サービスに対してAPIリクエストを行うことが可能。
          //   axios.get('https://firestore.googleapis.com/v1/projects/{task-app-64bfb}/databases/(default)/documents/{todos}', {
          //     headers: {
          //       'Authorization': 'Bearer ' + token
          //     }
          //   }).then(response => {
          //     console.log('addTodo run', response)
          //   }).catch(error => {
          //     console.error("Error writing document: ", error.message);
          //   });
          // });
        } else {
          console.log('onAuthStateChangedHandler', 'User is signed out');
        }
      });
    },
  },
  modules: {
  }
})
