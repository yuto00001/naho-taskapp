import Vue from 'vue'
import Vuex from 'vuex'
import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import "firebase/storage";
import axios from 'axios';
const CollectionURL = 'https://firestore.googleapis.com/v1/projects/task-app-64bfb/databases/(default)/documents'
const navItemsCollectionURL = CollectionURL + "/navItems";
const todosCollectionURL = CollectionURL + "/todos";

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
    addTasksData(state, newTaskData) {
      state.tasks.push(newTaskData)
    },
    removeTask(state, task) {
      const taskIndex = state.tasks.findIndex(t => t.docID === task.docID);
      if (taskIndex !== -1) {
        state.tasks.splice(taskIndex, 1);
      }
    },
    sortTasksData(state, tasksData) {
      state.tasks = tasksData
    },
    sortArchiveTasksData(state, tasksData) {
      state.archiveTasks = tasksData
    },
    setNavData(state, navData) {
      state.navData = navData
    },
    addNavData(state, navData) {
      state.navData.push(navData)
    },
    removeNavItem(state, memo) {
      const memoIndex = state.navData.findIndex(t => t.docID === memo.docID);
      if (memoIndex !== -1) {
        state.navData.splice(memoIndex, 1);
      }
    },
    sortNavData(state) {
      state.navData.sort(function(a, b) {
        return a.navModalTitle.localeCompare(b.navModalTitle);
      });
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
      state.archiveTasks.push(taskData)
      const taskIndex = state.tasks.findIndex(task => task.z_createdAt === taskData.z_createdAt);
      if (taskIndex !== -1) {
        state.tasks.splice(taskIndex, 1);
      }
    },
    reAddTask(state, taskData) {
      state.tasks.push(taskData)
      const taskIndex = state.archiveTasks.findIndex(task => task.z_createdAt === taskData.z_createdAt);
      if (taskIndex !== -1) {
        state.archiveTasks.splice(taskIndex, 1);
      }
    },
    toggleInput(state) {
      state.editing = !state.editing;
    },
  },
  actions: { //methods的にイジる。この中は非同期。コンポ間で共有したいメソッドのみ。

    addTodoForFirebase(context, taskContent) {
      const nowDate = firebase.firestore.Timestamp.now().toDate();
      const newShaped = format(nowDate, 'yyyyMMddHHmmss');

      // todo axiosを用いてデータのやり取りをする（部分更新）
      axios.post(
        todosCollectionURL,
        {
          fields: {
            userName: {
              stringValue: context.state.userData.userName
            },
            email: {
              stringValue: context.state.userData.email
            },
            uuid: {
              stringValue: context.state.userData.uuid
            },
            docID: {
              stringValue: ''
            },
            taskModalTextArea: {
              stringValue: ''
            },
            taskContent: {
              stringValue: taskContent
            },
            z_createdAt: {
              stringValue: newShaped
            },
            z_updatedAt: {
              stringValue: newShaped
            },
            editing: {
              booleanValue: context.state.editing
            },
            completed: {
              booleanValue: false
            },
            taskOpen: {
              booleanValue: false
            },
          }
        }
      ).then(response => {
        // ドキュメントの追加が成功した場合の処理
        console.log('addTodo run', response)
        const documentId = response.data.name.split('/').pop();
        axios.get(
          `${todosCollectionURL}/${documentId}`
        )
        .then(res => {
          const fields = res.data.fields;
          const fieldValues = {};
          for (const key in fields) {
            fieldValues[key] = Object.prototype.hasOwnProperty.call(fields[key], 'stringValue')
              ? fields[key].stringValue
              : fields[key].booleanValue;
          }
          console.log(fieldValues);
          context.commit('addTasksData', fieldValues);
        });
      }).catch(error => {
        // エラーが発生した場合の処理
        console.error("todo post Error ", error.message, todosCollectionURL);
      });
    },
    addNavItemForFirestore(context, navData) {
      const nowDate = firebase.firestore.Timestamp.now().toDate();
      const newShaped = format(nowDate, 'yyyyMMddHHmmss');
      axios.post(
        navItemsCollectionURL,
        {
          fields: {
            navModalTitle: {
              stringValue: navData.navModalTitle
            },
            navModalTextArea:  {
              stringValue: navData.navModalTextArea
            },
            uuid: {
              stringValue: context.state.userData.uuid
            },
            docID: {
              stringValue:  ''
            },
            z_createdAt: {
              stringValue: newShaped
            },
            z_updatedAt: {
              stringValue: newShaped
            },
            navOpen: {
              booleanValue: false
            },
            editText: {
              booleanValue: false
            },
            newNavOpen: {
              booleanValue: navData.newNavOpen
            },
          }
        }
      )
      .then(response => {
        // ドキュメントの追加が成功した場合の処理
        console.log('addTodo run', response)
        const documentId = response.data.name.split('/').pop();
        axios.get(
          `${navItemsCollectionURL}/${documentId}`
        )
        .then(res => {
          const fields = res.data.fields;
          const fieldValues = {};
          for (const key in fields) {
            fieldValues[key] = Object.prototype.hasOwnProperty.call(fields[key], 'stringValue')
              ? fields[key].stringValue
              : fields[key].booleanValue;
          }
          console.log(fieldValues);
          return new Promise((resolve) => {
            context.commit('addNavData', fieldValues);
            resolve();
          })
        })
        .then(() => {
          context.commit('sortNavData');
        })
        .catch((error) => {
          console.error("Error updating document: ", error.response.data);
        });
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
        context.commit('updateIconURL', url)
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
      axios.get(todosCollectionURL)
      .then(response => {
        const todos = response.data.documents;
        const targetTodo = todos.find(item => {
          return item.fields.z_createdAt.stringValue === task.z_createdAt;
        });
        if (targetTodo) {
          const fullPath = targetTodo.name;
          const documentId = fullPath.split('/').pop();
          const updateMaskParams = [
            "updateMask.fieldPaths=completed",
            "updateMask.fieldPaths=z_updatedAt"
          ].join('&');

          axios.patch(
            `${todosCollectionURL}/${documentId}?${updateMaskParams}`,
            {
              fields: {
                completed: {
                  booleanValue: task.completed,
                },
                z_updatedAt: {
                  stringValue: myShaped,
                },
              },
            }
          )
          .then((res) => {
            const fields = res.data.fields;
            const fieldValues = {};
            for (const key in fields) {
              fieldValues[key] = Object.prototype.hasOwnProperty.call(fields[key], 'stringValue')
                ? fields[key].stringValue
                : fields[key].booleanValue;
            }
            console.log("Document successfully updated!!", fieldValues);
            // Promiseを返す
            return new Promise((resolve) => {
              if(task.completed) {
                context.commit('addArchiveTask', fieldValues);
              } else {
                context.commit('reAddTask', fieldValues);
              }
              resolve(); // commitが完了したらresolve()を呼び出す
            });
          })
          .then(() => {
            // 前のthenブロックでcommitが完了した後、dispatchを実行
            context.dispatch('sortUpdatedTasks');
            context.dispatch('sortUpdatedArchiveTasks');
          })
          .catch((error) => {
            console.error("Error updating document: ", error.response.data);
          });
        } else {
          console.log('No matching data found');
        }
      });
    },
    updateLimitForFirestore(context, task) {
      console.log("updateLimitForFirestore");
      axios.get(todosCollectionURL)
      .then(response => {
        const todos = response.data.documents;
        const targetTodo = todos.find(item => {
          return item.fields.z_createdAt.stringValue === task.z_createdAt;
        });
        if (targetTodo) {
          const fullPath = targetTodo.name;
          const documentId = fullPath.split('/').pop();
          const updateMaskParams = [
            "updateMask.fieldPaths=dateLimit",
            "updateMask.fieldPaths=z_updatedAt"
          ].join('&');
          axios.patch(
            `${todosCollectionURL}/${documentId}?${updateMaskParams}`,
            {
              fields: {
                dateLimit: {
                  stringValue: task.dateLimit,
                },
                z_updatedAt: {
                  stringValue: myShaped,
                },
              },
            }
          )
          .then((res) => {
            console.log("updateLimitForFirestore successfully updated!", res);
            context.dispatch('sortUpdatedTasks');
            context.dispatch('sortUpdatedArchiveTasks');
          })
          .catch((error) => {
            console.error("Error updating document: ", error.response.data);
          });
        } else {
          console.log('No matching data found');
        }
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
    sortUpdatedTasks(context) {
      firebase.firestore().collection("todos")
      .where("uuid", "==", context.state.userData.uuid)
      .where("completed", "==", false)
      .get()
      .then((querySnapshot) => {
        const myData = []
        // querySnapshotを使用してデータを処理する.該当のtaskを抜き出す
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          myData.push(data)
          console.log(data);
        });
        // タスクを日付順にソート
        myData.sort(function(x, y) {
          if (!Object.prototype.hasOwnProperty.call(x, 'dateLimit')) {
            return -1;
          }
          if (!Object.prototype.hasOwnProperty.call(y, 'dateLimit')) {
            return 1;
          }
          return new Date(x.dateLimit) - new Date(y.dateLimit);
        });
        // ソートされたタスクをストアに反映
        context.commit('sortTasksData', myData);
      })
      .catch((error) => {
        console.error("Error getting documents: ", error.message);
      });
    },
    sortUpdatedArchiveTasks(context) {
      firebase.firestore().collection("todos")
      .where("uuid", "==", context.state.userData.uuid)
      .where("completed", "==", true)
      .get()
      .then((querySnapshot) => {
        const myData = []
        // querySnapshotを使用してデータを処理する.該当のtaskを抜き出す
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          myData.push(data)
          console.log(data);
        });
        // タスクを日付順にソート
        myData.sort(function(x, y) {
          if (!Object.prototype.hasOwnProperty.call(x, 'dateLimit')) {
            return -1;
          }
          if (!Object.prototype.hasOwnProperty.call(y, 'dateLimit')) {
            return 1;
          }
          return new Date(x.dateLimit) - new Date(y.dateLimit);
        });
        // ソートされたタスクをストアに反映
        context.commit('sortArchiveTasksData', myData);
      })
      .catch((error) => {
        console.error("Error getting documents: ", error.message);
      });
    },
    fetchTodoData(context) {
      console.log('fetchTodoData', context.state.userData);
      if(!context.state.userData.email) {
        console.log('fetchTodoData: userData.email is empty');
        return
      } else {
        console.log('フェッチTODOデータ run')
        context.dispatch('sortUpdatedTasks');
        context.dispatch('sortUpdatedArchiveTasks');
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
          return new Promise((resolve) => {
            context.commit('setNavData', navData);
            resolve();
          })
        })
        .then(() => {
          context.commit('sortNavData');
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
        } else {
          console.log('onAuthStateChangedHandler', 'User is signed out');
        }
      });
    },
  },
})
