/* Ципка — основні скрипти сайту */
(function () {
  "use strict";

  /* ---------- Мобільне меню ---------- */
  var nav = document.getElementById("main-nav");
  var burger = document.getElementById("burger");

  function setMenu(open) {
    nav.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Закрити меню" : "Відкрити меню");
    document.documentElement.classList.toggle("menu-open", open);
  }
  burger.addEventListener("click", function () {
    setMenu(!nav.classList.contains("is-open"));
  });
  nav.addEventListener("click", function (e) {
    if (e.target.closest("a")) setMenu(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav.classList.contains("is-open")) setMenu(false);
  });

  /* ---------- Картки смаків ---------- */
  var list = document.getElementById("flavor-list");
  var flavors = window.CYPKA_FLAVORS || [];

  function sizesOf(f) { return f.sizes && f.sizes.length ? f.sizes : [{ g: 25, protein: 15 }]; }
  function imgOf(f, size) { return "assets/img/packs/" + (size.img || f.id + ".webp"); }

  list.innerHTML = flavors.map(function (f, i) {
    var weights = sizesOf(f).map(function (s) { return s.g + " г"; }).join(" · ");
    return (
      '<li><button type="button" class="flavor-card" data-i="' + i + '" ' +
      'style="--card-bg:' + f.bg + ';--card-fg:' + f.fg + '">' +
      '<span class="flavor-crop"><img src="' + imgOf(f, sizesOf(f)[0]) + '" alt="" loading="lazy">' +
      '<span class="flavor-weights">' + weights + "</span></span>" +
      '<span class="flavor-name">' + f.name + "</span>" +
      "</button></li>"
    );
  }).join("");

  /* ---------- Модальне вікно смаку ---------- */
  var dlg = document.getElementById("flavor-dialog");
  var fdImg = document.getElementById("fd-img");
  var fdTitle = document.getElementById("fd-title");
  var fdDesc = document.getElementById("fd-desc");
  var fdSizes = document.getElementById("fd-sizes");
  var fdProtein = document.getElementById("fd-protein");
  var fdTagline = document.getElementById("fd-tagline");
  var fdComp = document.getElementById("fd-comp");
  var fdNutr = document.getElementById("fd-nutr");
  var current = null;

  // 20.4 -> "20,4"
  function num(n) { return String(n).replace(".", ","); }

  // таблиця харчової цінності, як на звороті пачки
  function nutrRows(n) {
    if (!n) return "";
    var rows = [
      ["Білки", num(n.protein) + " г"],
      ["Жири", num(n.fat) + " г"],
      ["з них насичені", num(n.satFat) + " г", true],
      ["Вуглеводи", num(n.carbs) + " г"],
      ["з них цукри", num(n.sugar) + " г", true],
      ["Сіль", num(n.salt) + " г"],
      ["Енергетична цінність", n.kj + " кДж / " + n.kcal + " ккал"]
    ];
    return rows.map(function (r) {
      return '<tr' + (r[2] ? ' class="sub"' : "") + "><th scope=\"row\">" + r[0] + "</th><td>" + r[1] + "</td></tr>";
    }).join("");
  }

  // показати вибрану вагу: фото, білок, активна кнопка
  function selectSize(idx) {
    var s = sizesOf(current)[idx];
    fdImg.src = imgOf(current, s);
    fdImg.alt = "Пачка Ципка " + current.name + ", " + s.g + " г";
    fdProtein.textContent = num(s.protein) + " г";
    [].forEach.call(fdSizes.children, function (b, i) {
      b.setAttribute("aria-checked", String(i === idx));
    });
    // без окремого фото 40 г показуємо пачку трохи більшою
    var base = sizesOf(current)[0].g;
    dlg.style.setProperty("--pack-scale", s.img ? 1 : Math.min(1, 0.82 + 0.18 * (s.g - base) / 15));
  }

  list.addEventListener("click", function (e) {
    var btn = e.target.closest(".flavor-card");
    if (!btn) return;
    current = flavors[+btn.dataset.i];
    fdTitle.textContent = current.name;
    fdDesc.textContent = current.desc;
    fdTagline.textContent = current.tagline || "";
    fdComp.textContent = current.comp || "";
    fdNutr.innerHTML = nutrRows(current.nutr);
    dlg.querySelector(".fd-more").open = false;
    fdSizes.innerHTML = sizesOf(current).map(function (s, i) {
      return '<button type="button" role="radio" data-size="' + i + '">' + s.g + " г</button>";
    }).join("");
    dlg.style.setProperty("--card-bg", current.bg);
    selectSize(0);
    if (typeof dlg.showModal === "function") dlg.showModal();
    else dlg.setAttribute("open", "");
  });

  fdSizes.addEventListener("click", function (e) {
    var b = e.target.closest("[data-size]");
    if (b) selectSize(+b.dataset.size);
  });

  dlg.addEventListener("click", function (e) {
    // закриття по кнопці, по "Замовити" або по кліку на фон
    if (e.target === dlg || e.target.closest("[data-close]")) dlg.close();
  });

  /* ---------- Активний пункт меню при скролі ---------- */
  var links = [].slice.call(nav.querySelectorAll('a[href^="#"]:not(.btn)'));
  var sections = links
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) {
          a.classList.toggle("is-active", a.getAttribute("href") === "#" + en.target.id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { io.observe(s); });
  }

  /* ---------- Форма зворотного зв'язку ---------- */
  /*
   * Поки що це демо. Щоб заявки реально надсилались:
   *  1) зареєструйтесь на formspree.io і вставте свій ендпоінт у FORM_ENDPOINT
   *  2) або зробіть свій обробник (Telegram-бот, PHP, Netlify Forms)
   */
  var FORM_ENDPOINT = ""; // напр. "https://formspree.io/f/xxxxxxx"
  var form = document.getElementById("contact-form");
  var status = document.getElementById("form-status");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = form.elements.name, contact = form.elements.contact;
    [name, contact].forEach(function (el) { el.classList.toggle("is-invalid", !el.value.trim()); });
    if (!name.value.trim() || !contact.value.trim()) {
      status.textContent = "Вкажіть ім'я та телефон або email.";
      status.className = "form-status is-error";
      return;
    }
    if (!FORM_ENDPOINT) {
      status.textContent = "Дякуємо! Це демо-форма, заявку поки не надіслано.";
      status.className = "form-status is-ok";
      form.reset();
      return;
    }
    fetch(FORM_ENDPOINT, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
      .then(function (r) {
        if (!r.ok) throw new Error();
        status.textContent = "Дякуємо! Ми зв'яжемося з вами найближчим часом.";
        status.className = "form-status is-ok";
        form.reset();
      })
      .catch(function () {
        status.textContent = "Не вдалося надіслати. Напишіть нам на email або зателефонуйте.";
        status.className = "form-status is-error";
      });
  });

  /* ---------- Рік у футері ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();
})();
