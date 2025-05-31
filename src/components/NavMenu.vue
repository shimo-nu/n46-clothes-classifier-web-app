<template>
  <nav class="nav-container">
    <div class="logo">乃木坂</div>
    <ul class="nav-links">
      <li><a href="/">Home</a></li>
      <li><a href="/clothes-classification">制服</a></li>
      <li><a href="/music-costume-classification">歌衣装</a></li>
      <li><a href="/new-image">新規画像追加</a></li>
    </ul>
    <div class="burger" @click="toggleMenu">
      <div :class="{ 'line1': true, 'toggle': isMenuOpen }"></div>
      <div :class="{ 'line2': true, 'toggle': isMenuOpen }"></div>
      <div :class="{ 'line3': true, 'toggle': isMenuOpen }"></div>
    </div>
  </nav>
</template>

<script>
export default {
  data() {
    return {
      isMenuOpen: false,
    };
  },
  methods: {
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen;
    },
  },
};
</script>

<style scoped>
/* ナビゲーションバーのスタイル */
.nav-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: #333;
  color: white;
}

.logo {
  font-size: 1.5em;
  font-weight: bold;
}

.nav-links {
  display: flex;
  list-style: none;
}

.nav-links li {
  margin-left: 20px;
}

.nav-links li a {
  text-decoration: none;
  color: white;
  font-size: 1.2em;
  transition: color 0.3s ease;
}

.nav-links li a:hover {
  color: #f0a500;
}

/* レスポンシブなメニュー（ハンバーガーアイコン） */
.burger {
  display: none;
  cursor: pointer;
  flex-direction: column;
}

.burger div {
  width: 25px;
  height: 3px;
  background-color: white;
  margin: 5px;
  transition: all 0.3s ease;
}

/* ハンバーガーアイコンのアニメーション */
.line1.toggle {
  transform: rotate(-45deg) translate(-5px, 6px);
}

.line2.toggle {
  opacity: 0;
}

.line3.toggle {
  transform: rotate(45deg) translate(-5px, -6px);
}

/* レスポンシブデザイン */
@media (max-width: 768px) {
  .nav-links {
    position: absolute;
    right: 0;
    height: 100vh;
    top: 0;
    background-color: #333;
    flex-direction: column;
    align-items: center;
    width: 200px;
    transform: translateX(100%);
    transition: transform 0.3s ease;
  }

  .nav-links li {
    margin: 20px 0;
  }

  .burger {
    display: flex;
  }

  .nav-links.show {
    transform: translateX(0);
  }
}
</style>
