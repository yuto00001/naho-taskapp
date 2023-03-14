<template>
  <div class="SettingProfile">
    <div>
      <section class="profile-image">
        <h1>プロフィール写真</h1>
        <img src="$store.state.userData.icon" alt="">
        <button>編集する</button>
      </section>
      <section class="profile-data">
        <div>
          <h1>名前</h1>
          <h2>{{ $store.state.userData.profileName }}</h2>
          <input type="text" name="" id="" required>
          <span class="validity"></span>
          <button>編集する</button>
        </div>
        <div>
          <h1>メールアドレス</h1>
          <h2>{{ $store.state.userData.email }}</h2>
          <input type="email" name="" id="" required>
          <span class="validity"></span>
          <button>編集する</button>
        </div>
        <div>
          <h1>パスワード</h1>
          <h2>{{ $store.state.userData.password }}</h2>
          <input type="password" name="" id="" required>
          <span class="validity"></span>
          <button>編集する</button>
        </div>
      </section>
      <button class="set">編集を完了する</button>
    </div>
    <router-link to="/MyPage">マイページに戻る</router-link>
  </div>
</template>

<script>
export default {
  name: 'SettingProfile',
}
</script>

<style>
input:invalid + span::after {
  position: absolute;
  content: "✖";
  padding-left: 5px;
}

input:valid + span::after {
  position: absolute;
  content: "✓";
  padding-left: 5px;
}
</style>
