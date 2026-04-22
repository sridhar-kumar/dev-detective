let mode = "search";

// MODE SWITCH
function setMode(m) {
  mode = m;

  document.getElementById("user2").classList.toggle("hidden", m === "search");

  document.getElementById("searchBtn").classList.toggle("active", m === "search");
  document.getElementById("battleBtn").classList.toggle("active", m === "battle");

  document.getElementById("result").innerHTML = "";
}

// LOADING
function showLoading() {
  document.getElementById("result").innerHTML = `
    <div class="skeleton"></div>
    <div class="skeleton"></div>
  `;
}

// ERROR
function showError(msg) {
  document.getElementById("result").innerHTML = `
    <div class="error-card">❌ ${msg}</div>
  `;
}

// 🎯 MOCK DATA (FALLBACK)
function getMockUser(username) {
  return {
    login: username,
    name: username.toUpperCase(),
    bio: "Demo user profile",
    followers: Math.floor(Math.random() * 1000),
    avatar_url: "https://avatars.githubusercontent.com/u/583231?v=4",
    repos_url: null
  };
}

// API CALL (SAFE)
async function getUser(username) {

  // ❌ If starts with number → reject
  if (/^\d/.test(username)) {
    throw new Error("User Not Found ❌");
  }

  try {
    const res = await fetch(`https://api.github.com/users/${username}`);

    if (res.status === 404) {
      throw new Error("User Not Found ❌");
    }

    if (res.status === 403) {
      // 🔥 LIMIT → fallback to mock
      return getMockUser(username);
    }

    return await res.json();

  } catch {
    // 🔥 NETWORK FAIL → fallback
    return getMockUser(username);
  }
}

// STARS (SAFE)
async function getStars(url) {
  if (!url) return Math.floor(Math.random() * 500);

  try {
    const res = await fetch(url);
    const repos = await res.json();

    return repos.reduce((sum, r) => sum + r.stargazers_count, 0);
  } catch {
    return Math.floor(Math.random() * 500);
  }
}

// MAIN
async function handleAction() {
  const u1 = document.getElementById("user1").value.trim();
  const u2 = document.getElementById("user2").value.trim();

  if (!u1) {
    showError("Enter username");
    return;
  }

  if (mode === "battle" && !u2) {
    showError("Enter both usernames");
    return;
  }

  showLoading();

  try {

    if (mode === "search") {

      const user = await getUser(u1);
      const stars = await getStars(user.repos_url);

      renderResult([createCard(user, stars)]);

    } else {

      const [a, b] = await Promise.all([
        getUser(u1),
        getUser(u2)
      ]);

      const [s1, s2] = await Promise.all([
        getStars(a.repos_url),
        getStars(b.repos_url)
      ]);

      const score1 = a.followers + s1;
      const score2 = b.followers + s2;

      const c1 = createCard(a, score1);
      const c2 = createCard(b, score2);

      if (score1 > score2) {
        c1.classList.add("winner");
        c2.classList.add("loser");
      } else {
        c2.classList.add("winner");
        c1.classList.add("loser");
      }

      renderResult([c1, c2]);
    }

  } catch (err) {
    showError(err.message);
  }
}

// RENDER
function renderResult(cards) {
  const result = document.getElementById("result");
  result.innerHTML = "";
  cards.forEach(c => result.appendChild(c));
}

// CARD
function createCard(user, score) {
  const div = document.createElement("div");
  div.className = "card";

  div.innerHTML = `
    <img src="${user.avatar_url}">
    <h3>${user.name || user.login}</h3>
    <p>${user.bio || "No bio"}</p>
    <p>👥 Followers: ${user.followers}</p>
    <p>⭐ Score: ${score}</p>
  `;

  return div;
}