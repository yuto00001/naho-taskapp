import Vue from 'vue'
import Vuex from 'vuex'
// import axios from 'axios'
import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import "firebase/storage";


import { format } from 'date-fns';
const toDate = firebase.firestore.Timestamp.now().toDate();
const myShaped = format(toDate, 'yyyyMMddHHmmss');

Vue.use(Vuex)

export default new Vuex.Store({
  state: { // 空のオブジェクトを定義する
    nowDate: format(toDate, 'yyyy . MM / dd'),
    tasks: [],
    archiveTasks: [],
    navData: [],
    a_loginWindow: false,
    editing: false,
    userData: {
      userName: '',
      email: '',
      password: '', //todo セキュリティ対応
      fileName: '',
      iconURL: null,
      uuid: '',
      docID: '',
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
    setArchiveTasksData(state, archiveTasksData) {
      state.archiveTasks = archiveTasksData
    },
    setNavData(state, navData) {
      state.navData = navData
    },
    updateUserData(state, doc) {
      const {data, id} = doc
      state.userData.userName = data.userName
      state.userData.email = data.email
      state.userData.password = data.password
      state.userData.fileName = data.fileName
      state.userData.iconURL = data.iconURL
      state.userData.uuid = data.uuid
      state.userData.docID = id
      state.userData.z_createdAt = myShaped
      state.userData.z_updatedAt = myShaped
    },
    updateFileName(state, file) {
      state.userData.fileName = file
    },
    updateIconURL(state, url) {
      state.userData.iconURL = url
    },
    addUuid(state, uuid) {
      state.userData.uuid = uuid
    },
    addArchiveTask(state, taskData) {
      state.archiveTasks = taskData
    },
    reAddTask(state, taskData) {
      state.tasks = taskData
    },
    toggleInput(state) {
      state.editing = !state.editing;
    },
  },
  actions: { //methods的にイジる。この中は非同期。コンポ間で共有したいメソッドのみ。

    addTodoForFirebase(context, taskContent) {
      // todo axiosを用いてデータのやり取りをする（部分更新）
      // axios.post("https://firestore.googleapis.com/v1/projects/task-app-64bfb/databases/(default)/documents/todos", { //! なぜかうまく送信できない 400error = URLに問題あり?
      //   fields: {
      //     userName: context.state.userData.userName,
      //     email: context.state.userData.email,
      //     icon: '',
      //     uuid: context.state.userData.uuid,
      //     docID: '',
      //     taskContent: taskContent,
      //     editing: context.state.editing,
      //     z_createdAt: myShaped,
      //     z_updatedAt: myShaped,
      //   }
      firebase.firestore().collection("todos").add({
        userName: context.state.userData.userName,
        email: context.state.userData.email,
        uuid: context.state.userData.uuid,
        docID: '',
        completed: false,
        taskOpen: false,
        taskModalTextArea: '',
        taskContent: taskContent,
        editing: context.state.editing,
        z_createdAt: myShaped,
        z_updatedAt: myShaped,
      }).then(response => {
        // ドキュメントの追加が成功した場合の処理
        console.log('addTodo run', response)
      }).catch(error => {
        // エラーが発生した場合の処理
        console.error("Error writing document: ", error.message);
      });
    },
    addNavItemForFirestore(context, navData) {
      firebase.firestore().collection("navItems").add({
        newNavOpen: navData.newNavOpen,
        navOpen: false,
        editText: false,
        navModalTitle: navData.navModalTitle,
        navModalTextArea: navData.navModalTextArea,
        uuid: context.state.userData.uuid,
        docID: '',
        z_createdAt: myShaped,
        z_updatedAt: myShaped,
      }).then(response => {
        // ドキュメントの追加が成功した場合の処理
        console.log('addNavItem run', response)
      }).catch(error => {
        // エラーが発生した場合の処理
        console.error("addNavItem Error writing document: ", error.message);
      });
    },
    async addUserDataForFirebase(context, userData) {
      await firebase.firestore().collection("users").add({
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
    addIconImage(context, file) {
      const fileName = file.name;
      console.log('addIconImage', file);
      console.log('addIconImage', file.name);
      context.commit('updateFileName', fileName)
      firebase.storage().ref().child(`icons/${fileName}`).put(file)
      .then((snapshot) => {
        console.log('Uploaded a blob or file!', snapshot);
        context.dispatch('deleteOtherIconImage')
        context.dispatch('updateImageDataForFirestore', file)
      });
    },
    deleteOtherIconImage(context) {
      firebase.storage().ref().child(`icons`).listAll()
      .then((result) => {
        result.items.forEach((itemRef) => {
          if(itemRef.name !== context.state.userData.fileName) {
            itemRef.delete()
            .then(() => {
              console.log('File deleted successfully:', itemRef.name);
            })
            .catch((error) => {
              console.error('Error deleting file:', itemRef.name, error);
            });
          }
        })
      }).catch((error) => {
        console.error('did not delete storage', error);
      });
    },
    updateImageDataForFirestore(context, file) {
      const fileName = file.name
      console.log('updateImageDataForFirestore run', file)
      firebase.storage().ref().child(`icons/${fileName}`).getDownloadURL()
      .then((url) => {
        console.log('url', url)
        firebase.firestore().collection('users').doc(context.state.userData.docID)
        .update({
          iconURL: url,
          fileName: fileName,
          z_updatedAt: myShaped,
        });
      })
      .catch((error) => {
        console.error('Error saving user data:', error.message);
      });
    },
    updateCheckTaskForFirestore(context, task) {
      firebase.firestore().collection("todos").doc(task.docID)
      .update({
        completed: task.completed,
        z_updatedAt: myShaped,
      })
      .then(() => {
        console.log("Document successfully updated!");
        const taskData = []
        taskData.push(task)
        if(task.completed) {
          context.dispatch('addArchiveTask', taskData)
        } else {
          context.dispatch('reAddTask', taskData)
        }
      })
      .catch((error) => {
        console.error("Error updating document: ", error.message);
      });
    },
    updateLimitForFirestore(context, task) {
      console.log("updateLimitForFirestore");
      firebase.firestore().collection("todos").doc(task.docID)
      .update({
        dateLimit: task.dateLimit,
        z_updatedAt: myShaped,
      })
      .then(() => {
        console.log("updateLimitForFirestore successfully updated!", context);
      })
      .catch((error) => {
        console.error("Error updating document: ", error.message);
      });
    },
    updateEmail(context, newEmail) {
      firebase.firestore().collection("users").doc(context.state.userData.docID)
      .update({
        email: newEmail,
        z_updatedAt: myShaped,
      })
      .then(() => {
        console.log("Document successfully updated!");
      })
      .catch((error) => {
        console.error("Error updating document: ", error.message);
      });
    },
    resetPass(context) {
      firebase.auth().sendPasswordResetEmail(context.state.userData.email)
      .then(() => {
        alert('再設定用メールを送信しました')
      })
      .catch((error) => {
        alert('再設定用メールを送信できませんでした')
        console.error("再設定用メールを送信できませんでした", error.message);
        // ..
      });
    },
    promptForCredentials() {
      const email = prompt('メールアドレスを入力してください');
      const password = prompt('パスワードを入力してください');
      return firebase.auth.EmailAuthProvider.credential(email, password);
    },
    addArchiveTask(context, taskData) {
      context.commit('addArchiveTask', taskData)
    },
    reAddTask(context, taskData) {
      context.commit('reAddTask', taskData)
    },
    sortTasks(context, data) {
      const {tasksData, archiveTasksData} = data
      console.log('sortTasks', context)
      tasksData.sort(function(x, y) {
        return new Date(x.dateLimit) - new Date(y.dateLimit);
      })
      archiveTasksData.sort(function(x, y) {
        // sort基準はcheckした順
        return new Date(x.z_updatedAt) - new Date(y.z_updatedAt);
      })
    },
    sortNavItems(context, navData) { //!next
      console.log('sortNavItems', context, navData)
      navData.sort(function(x, y) {
        return new Date(x.z_updatedAt) - new Date(y.z_updatedAt);
      })
    },
    fetchTodoData(context) {
      console.log('fetchTodoData', context.state.userData);
      if(!context.state.userData.email) {
        console.log('fetchTodoData: userData.email is empty');
        return
      } else {
        firebase.firestore().collection("todos").where("uuid", "==", context.state.userData.uuid).get()
        .then((querySnapshot) => {
          console.log('フェッチTODOデータ run')
          const tasksData = []
          const archiveTasksData = []
          querySnapshot.forEach((doc) => {
            const data = {
              ...doc.data(),
              docID: doc.id,
            }
            console.log('fetchTodoData run', doc.id, " => ", doc.data());
            console.log('フェッチTODOデータ run', tasksData);
            if(!doc.data().completed) { //! 配列の内容を特定の条件で絞り込む = filterメソッドを使用する。に書き換える。p138
              console.log('if run', doc.data().completed)
              tasksData.push(data)
            } else {
              console.log('else run', doc.data().completed)
              archiveTasksData.push(data)
            }
          });
          context.commit('setTasksData', tasksData);
          context.commit('setArchiveTasksData', archiveTasksData);
          context.dispatch('sortTasks', {tasksData: tasksData ,archiveTasksData: archiveTasksData})
        })
        .catch((error) => {
          console.error("Error getting documents: ", error.message);
        });
      }
    },
    fetchNavItemData(context) {
      console.log('fetchNavItemData', context.state.userData);
      if(!context.state.userData.email) {
        console.log('fetchNavItemData: userData.email is empty');
        return
      } else {
        firebase.firestore().collection("navItems").where("uuid", "==", context.state.userData.uuid).get()
        .then((querySnapshot) => {
          console.log('フェッチnavItemデータ run')
          const navData = []
          querySnapshot.forEach((doc) => {
            const data = {
              ...doc.data(),
              docID: doc.id
            }
            console.log('fetchNavData run', doc.id, " => ", doc.data());
            navData.push(data)
          });
          context.commit('setNavData', navData);
          context.dispatch('sortNavItems', navData);
        })
        .catch((error) => {
          console.error("Error getting documents: ", error.message);
        });
      }
    },
    fetchUserData(context) {
      console.log('fetchUserData', context.state.userData.uuid);
      firebase.firestore().collection("users").where("uuid", "==", context.state.userData.uuid).get()
      .then((querySnapshot) => {
        const doc = querySnapshot.docs[0];
        if (doc.exists) {
          console.log("Document data:", doc.id);
          context.commit('updateUserData', { data: doc.data(), id: doc.id })
          context.dispatch('fetchIconImage')
          context.dispatch('fetchTodoData')
          context.dispatch('fetchNavItemData')
        } else {
          console.log("No such document!");
        }
      }).catch((error) => {
        console.log("Error getting document:", error);
      });
    },
    fetchIconImage(context) {
        console.log('フェッチイメージ run', context)
      firebase.storage().ref().child(`icons/${context.state.userData.fileName}`).getDownloadURL()
      .then((url) => {
        context.commit('updateIconURL', url)
        console.log('フェッチイメージ run', url)
      })
      .catch((error) => {
        switch (error.code) {
          case 'storage/object-not-found':
            // File doesn't exist
            break;
          case 'storage/unauthorized':
            // User doesn't have permission to access the object
            break;
          case 'storage/canceled':
            // User canceled the upload
            break;
          case 'storage/unknown':
            // Unknown error occurred, inspect the server response
            break;
        }
      });
    },
    onAuthStateChangedHandler(context) {
      firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          context.commit('addUuid', user.uid)
          console.log('onAuthStateChangedHandler run', user.uid, user)
          context.dispatch('fetchUserData')
          // todo axiosを用いてデータのやり取りをする（部分更新）
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
})
