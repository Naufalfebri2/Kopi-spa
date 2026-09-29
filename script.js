/* =========================================================
   KOPI NAKO — Sistem Manajemen Shift Karyawan
   script.js — logika navigasi & interaksi seluruh sistem
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  /* =========================================================
     0. VIEW SWITCHER (Login <-> App Shell)
     ========================================================= */
  const viewLogin = document.getElementById("view-login");
  const viewApp = document.getElementById("view-app");

  function showApp() {
    viewLogin.classList.remove("active");
    viewApp.classList.add("active");
  }
  function showLogin() {
    viewApp.classList.remove("active");
    viewLogin.classList.add("active");
  }

  /* =========================================================
     1. LOGIN
     ========================================================= */
  const loginForm = document.getElementById("loginForm");
  const emailInput = document.getElementById("email");
  const passInput = document.getElementById("password");
  const emailWrap = document.getElementById("emailWrap");
  const passWrap = document.getElementById("passWrap");
  const emailError = document.getElementById("emailError");
  const passError = document.getElementById("passError");
  const togglePass = document.getElementById("togglePass");
  const submitBtn = document.getElementById("submitBtn");
  const spinner = document.getElementById("spinner");
  const submitLabel = document.getElementById("submitLabel");

  togglePass.addEventListener("click", () => {
    const isPass = passInput.type === "password";
    passInput.type = isPass ? "text" : "password";
    togglePass.textContent = isPass ? "Sembunyi" : "Lihat";
  });

  function setError(wrap, errorEl, show) {
    wrap.classList.toggle("has-error", show);
    errorEl.classList.toggle("show", show);
  }

  /* Ubah email login jadi nama tampilan & inisial avatar di topbar (simulasi, karena tidak ada database akun) */
  function applyLoggedInProfile(email) {
    const localPart = email.split("@")[0] || "Pengguna";
    const words = localPart
      .replace(/[._-]+/g, " ")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
    const displayName = words.length ? words.join(" ") : "Pengguna";
    const initials =
      words.length >= 2
        ? (words[0][0] + words[1][0]).toUpperCase()
        : displayName.slice(0, 2).toUpperCase();

    document.getElementById("profileName").textContent = displayName;
    document.getElementById("profileAvatar").textContent = initials;
    document.getElementById("profileRole").textContent = "Supervisor"; // simulasi: role belum bisa dipilih saat login
  }

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let valid = true;

    if (emailInput.value.trim() === "") {
      setError(emailWrap, emailError, true);
      valid = false;
    } else {
      setError(emailWrap, emailError, false);
    }

    if (passInput.value.trim().length < 6) {
      setError(passWrap, passError, true);
      valid = false;
    } else {
      setError(passWrap, passError, false);
    }

    if (!valid) return;

    submitBtn.disabled = true;
    spinner.classList.add("show");
    submitLabel.textContent = "Memproses...";

    try {
      localStorage.setItem(
        "kn_session",
        JSON.stringify({
          email: emailInput.value.trim(),
          loggedInAt: Date.now(),
        }),
      );
    } catch (err) {
      /* localStorage tidak tersedia, lanjut tanpa sesi */
    }

    applyLoggedInProfile(emailInput.value.trim());

    setTimeout(() => {
      submitBtn.disabled = false;
      spinner.classList.remove("show");
      submitLabel.textContent = "Masuk";
      showApp();
      switchPage("dashboard");
    }, 900);
  });

  document.getElementById("forgotLink").addEventListener("click", (e) => {
    e.preventDefault();
    alert("Silakan hubungi Supervisor Anda untuk reset kata sandi.");
  });

  /* =========================================================
     2. SIDEBAR NAV — switch antar "halaman" (Dashboard/Jadwal/Pengajuan)
     ========================================================= */
  const navLinks = document.querySelectorAll(".nav-link");
  const pageViews = document.querySelectorAll(".page-view");

  function switchPage(pageKey) {
    pageViews.forEach((p) =>
      p.classList.toggle("active", p.id === "page-" + pageKey),
    );
    navLinks.forEach((l) =>
      l.classList.toggle("active", l.dataset.page === pageKey),
    );
    closeSidebar();
  }
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      switchPage(link.dataset.page);
    });
  });

  /* Tanggal hari ini (Dashboard) */
  const todayDateEl = document.getElementById("todayDate");
  if (todayDateEl) {
    todayDateEl.textContent = new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  /* =========================================================
     3. SIDEBAR MOBILE TOGGLE
     ========================================================= */
  const sidebar = document.getElementById("sidebar");
  const sidebarOverlay = document.getElementById("sidebarOverlay");
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  function openSidebar() {
    sidebar.classList.add("open");
    sidebarOverlay.classList.add("open");
  }
  function closeSidebar() {
    sidebar.classList.remove("open");
    sidebarOverlay.classList.remove("open");
  }
  hamburgerBtn.addEventListener("click", openSidebar);
  sidebarOverlay.addEventListener("click", closeSidebar);

  /* =========================================================
     4. PROFILE DROPDOWN + LOGOUT MODAL
     ========================================================= */
  const profileTrigger = document.getElementById("profileTrigger");
  const profileDropdown = document.getElementById("profileDropdown");
  profileTrigger.addEventListener("click", (e) => {
    e.stopPropagation();
    profileDropdown.classList.toggle("open");
  });
  document.addEventListener("click", () =>
    profileDropdown.classList.remove("open"),
  );
  document.getElementById("settingsLink").addEventListener("click", (e) => {
    e.preventDefault();
    alert("Halaman Pengaturan Akun belum tersedia pada simulasi ini.");
  });

  const logoutModal = document.getElementById("logoutModal");
  document.getElementById("logoutTrigger").addEventListener("click", () => {
    profileDropdown.classList.remove("open");
    logoutModal.classList.add("open");
  });
  document
    .getElementById("cancelLogout")
    .addEventListener("click", () => logoutModal.classList.remove("open"));
  logoutModal.addEventListener("click", (e) => {
    if (e.target === logoutModal) logoutModal.classList.remove("open");
  });
  document.getElementById("confirmLogout").addEventListener("click", () => {
    try {
      localStorage.removeItem("kn_session");
    } catch (err) {}
    logoutModal.classList.remove("open");
    loginForm.reset();
    document.getElementById("profileName").textContent = "Supervisor Andini";
    document.getElementById("profileAvatar").textContent = "SP";
    document.getElementById("profileRole").textContent = "Supervisor";
    showLogin();
  });

  /* =========================================================
     5. DASHBOARD — bar chart & tabel Terima/Tolak
     ========================================================= */
  const chartData = [
    { day: "Sen", value: 3 },
    { day: "Sel", value: 5 },
    { day: "Rab", value: 2 },
    { day: "Kam", value: 7 },
    { day: "Jum", value: 4 },
    { day: "Sab", value: 8 },
    { day: "Min", value: 6 },
  ];
  const maxVal = Math.max(...chartData.map((d) => d.value));
  const chartWrap = document.getElementById("chartWrap");
  chartData.forEach((d) => {
    const col = document.createElement("div");
    col.className = "chart-bar-col";
    const bar = document.createElement("div");
    bar.className = "chart-bar";
    bar.style.height = (d.value / maxVal) * 100 + "%";
    bar.title = d.day + ": " + d.value + " pengajuan";
    const lbl = document.createElement("div");
    lbl.className = "day-lbl";
    lbl.textContent = d.day;
    col.appendChild(bar);
    col.appendChild(lbl);
    chartWrap.appendChild(col);
  });

  document.getElementById("requestTable").addEventListener("click", (e) => {
    const btn = e.target.closest(".act-btn");
    if (!btn) return;
    const row = btn.closest("tr");
    const isAccept = btn.classList.contains("accept");
    const confirmed = confirm(
      isAccept ? "Terima pengajuan ini?" : "Tolak pengajuan ini?",
    );
    if (!confirmed) return;

    const statusCell = row.querySelector(".status-cell");
    const actionCell = row.querySelector(".action-cell");
    if (isAccept) {
      statusCell.innerHTML =
        '<span class="status-dot"><span class="d approved"></span>Disetujui</span>';
      row.dataset.status = "approved";
    } else {
      statusCell.innerHTML =
        '<span class="status-dot"><span class="d rejected"></span>Ditolak</span>';
      row.dataset.status = "rejected";
    }
    actionCell.innerHTML = '<span class="done-label">Selesai</span>';
  });

  /* =========================================================
     6. JADWAL SHIFT — toggle Papan Harian / Jadwal Mingguan + weekly grid
     ========================================================= */
  const btnDaily = document.getElementById("btnDaily");
  const btnWeekly = document.getElementById("btnWeekly");
  const dailyView = document.getElementById("dailyView");
  const weeklyView = document.getElementById("weeklyView");
  btnDaily.addEventListener("click", () => {
    btnDaily.classList.add("active");
    btnWeekly.classList.remove("active");
    dailyView.classList.add("active");
    weeklyView.classList.remove("active");
  });
  btnWeekly.addEventListener("click", () => {
    btnWeekly.classList.add("active");
    btnDaily.classList.remove("active");
    weeklyView.classList.add("active");
    dailyView.classList.remove("active");
  });

  document
    .getElementById("autoScheduleBtn")
    .addEventListener("click", () =>
      alert(
        "Simulasi: sistem menyusun jadwal otomatis berdasarkan ketersediaan karyawan.",
      ),
    );
  document
    .getElementById("addShiftBtn")
    .addEventListener("click", () =>
      alert("Simulasi: form tambah shift akan muncul di sini."),
    );
  document
    .getElementById("prevDate")
    .addEventListener("click", () =>
      alert("Simulasi: menampilkan minggu sebelumnya."),
    );
  document
    .getElementById("nextDate")
    .addEventListener("click", () =>
      alert("Simulasi: menampilkan minggu berikutnya."),
    );

  const employees = [
    { init: "FN", name: "Fajar Nugroho", role: "Barista" },
    { init: "SP", name: "Salsabila Putri", role: "Kasir" },
    { init: "MR", name: "Maya Rahmawati", role: "Leader/Head" },
    { init: "DP", name: "Dewi Purnama", role: "Barista" },
    { init: "HA", name: "Hendra Aditya", role: "Kasir" },
    { init: "RR", name: "Rizky Ramadhan", role: "Barista" },
    { init: "BW", name: "Bagas Wirawan", role: "Barista" },
    { init: "NK", name: "Nadia Kusuma", role: "Kasir" },
  ];
  const shiftDefs = {
    pagi: { label: "Pagi", hrs: "09.00–15.00", cls: "pagi" },
    siang: { label: "Siang", hrs: "15.00–21.00", cls: "siang" },
    malam: { label: "Malam", hrs: "21.00–03.30", cls: "malam" },
    libur: { label: "Libur", hrs: "", cls: "libur" },
  };
  const pattern = ["pagi", "siang", "malam", "libur"];
  const weeklyBody = document.getElementById("weeklyBody");
  employees.forEach((emp, empIdx) => {
    const tr = document.createElement("tr");
    const empTd = document.createElement("td");
    empTd.className = "emp-cell";
    empTd.innerHTML = `<span class="avatar-sm">${emp.init}</span><div><div class="emp-name">${emp.name}</div><div class="emp-role">${emp.role}</div></div>`;
    tr.appendChild(empTd);
    for (let day = 0; day < 7; day++) {
      const key = pattern[(empIdx + day) % pattern.length];
      const def = shiftDefs[key];
      const td = document.createElement("td");
      td.innerHTML = `<span class="shift-cell ${def.cls}">${def.label}${def.hrs ? '<span class="hrs">' + def.hrs + "</span>" : ""}</span>`;
      tr.appendChild(td);
    }
    weeklyBody.appendChild(tr);
  });

  /* =========================================================
     7. PENGAJUAN IZIN/TUKAR SHIFT — tabel, drawer, stepper
     ========================================================= */
  const requests = [
    {
      id: 1,
      name: "Rizky Ramadhan",
      role: "Barista",
      init: "RR",
      type: "Tukar Shift",
      submitted: "20 Sep 2026",
      shiftDate: "24 Sep 2026",
      fromShift: "Pagi (09.00–15.00)",
      toShift: "Siang (15.00–21.00)",
      status: "pending",
      leaderStatus: "active",
      supervisorStatus: "waiting",
      leaderBy: "—",
      leaderAt: "—",
      supervisorBy: "—",
      supervisorAt: "—",
      note: "Ada jadwal kuliah tambahan sore ini, mohon izin tukar ke shift siang.",
    },
    {
      id: 2,
      name: "Salsabila Putri",
      role: "Kasir",
      init: "SP",
      type: "Izin",
      submitted: "20 Sep 2026",
      shiftDate: "25 Sep 2026",
      fromShift: "Pagi (09.00–15.00)",
      toShift: "—",
      status: "pending",
      leaderStatus: "done",
      supervisorStatus: "active",
      leaderBy: "Maya Rahmawati",
      leaderAt: "20 Sep, 14.10",
      supervisorBy: "—",
      supervisorAt: "—",
      note: "Ada keperluan keluarga mendadak, mohon izin tidak masuk shift.",
    },
    {
      id: 3,
      name: "Bagas Wirawan",
      role: "Barista",
      init: "BW",
      type: "Tukar Shift",
      submitted: "18 Sep 2026",
      shiftDate: "22 Sep 2026",
      fromShift: "Siang (15.00–21.00)",
      toShift: "Malam (21.00–03.30)",
      status: "approved",
      leaderStatus: "done",
      supervisorStatus: "approved",
      leaderBy: "Maya Rahmawati",
      leaderAt: "18 Sep, 10.22",
      supervisorBy: "Andini Supervisor",
      supervisorAt: "19 Sep, 09.05",
      note: "Diminta rekan untuk menutup shift malam karena berhalangan.",
    },
    {
      id: 4,
      name: "Nadia Kusuma",
      role: "Kasir",
      init: "NK",
      type: "Izin",
      submitted: "17 Sep 2026",
      shiftDate: "21 Sep 2026",
      fromShift: "Malam (21.00–03.30)",
      toShift: "—",
      status: "rejected",
      leaderStatus: "done",
      supervisorStatus: "rejected",
      leaderBy: "Maya Rahmawati",
      leaderAt: "17 Sep, 16.40",
      supervisorBy: "Andini Supervisor",
      supervisorAt: "18 Sep, 08.15",
      note: "Mengajukan izin di hari yang sama tanpa pengganti shift, tidak dapat diproses.",
    },
    {
      id: 5,
      name: "Dewi Purnama",
      role: "Barista",
      init: "DP",
      type: "Tukar Shift",
      submitted: "15 Sep 2026",
      shiftDate: "19 Sep 2026",
      fromShift: "Pagi (09.00–15.00)",
      toShift: "Siang (15.00–21.00)",
      status: "approved",
      leaderStatus: "done",
      supervisorStatus: "approved",
      leaderBy: "Maya Rahmawati",
      leaderAt: "15 Sep, 11.02",
      supervisorBy: "Andini Supervisor",
      supervisorAt: "15 Sep, 15.30",
      note: "Bertukar shift dengan Hendra Aditya atas kesepakatan bersama.",
    },
    {
      id: 6,
      name: "Hendra Aditya",
      role: "Kasir",
      init: "HA",
      type: "Tukar Shift",
      submitted: "15 Sep 2026",
      shiftDate: "19 Sep 2026",
      fromShift: "Siang (15.00–21.00)",
      toShift: "Pagi (09.00–15.00)",
      status: "approved",
      leaderStatus: "done",
      supervisorStatus: "approved",
      leaderBy: "Maya Rahmawati",
      leaderAt: "15 Sep, 11.05",
      supervisorBy: "Andini Supervisor",
      supervisorAt: "15 Sep, 15.31",
      note: "Bertukar shift dengan Dewi Purnama atas kesepakatan bersama.",
    },
    {
      id: 7,
      name: "Fajar Nugroho",
      role: "Barista",
      init: "FN",
      type: "Izin",
      submitted: "10 Sep 2026",
      shiftDate: "13 Sep 2026",
      fromShift: "Pagi (09.00–15.00)",
      toShift: "—",
      status: "rejected",
      leaderStatus: "done",
      supervisorStatus: "rejected",
      leaderBy: "Maya Rahmawati",
      leaderAt: "10 Sep, 09.40",
      supervisorBy: "Andini Supervisor",
      supervisorAt: "11 Sep, 10.00",
      note: "Alasan tidak sesuai kebijakan cuti mendadak yang berlaku.",
    },
    {
      id: 8,
      name: "Maya Rahmawati",
      role: "Leader/Head",
      init: "MR",
      type: "Izin",
      submitted: "08 Sep 2026",
      shiftDate: "12 Sep 2026",
      fromShift: "Pagi (09.00–15.00)",
      toShift: "—",
      status: "approved",
      leaderStatus: "done",
      supervisorStatus: "approved",
      leaderBy: "Maya Rahmawati (mandiri)",
      leaderAt: "08 Sep, 08.15",
      supervisorBy: "Andini Supervisor",
      supervisorAt: "08 Sep, 09.00",
      note: "Menghadiri kontrol kesehatan rutin.",
    },
  ];

  const reqTableBody = document.getElementById("reqTableBody");
  function statusLabel(s) {
    return s === "approved"
      ? "Disetujui"
      : s === "rejected"
        ? "Ditolak"
        : "Menunggu";
  }

  function renderReqTable() {
    reqTableBody.innerHTML = "";
    requests.forEach((r) => {
      const tr = document.createElement("tr");
      tr.className = "req-row";
      tr.dataset.id = r.id;
      tr.innerHTML = `
        <td><div class="emp-cell-flex"><span class="avatar-sm">${r.init}</span><div><div class="emp-name-cell">${r.name}</div><div class="emp-role-cell">${r.role}</div></div></div></td>
        <td>${r.type}</td>
        <td>${r.submitted}</td>
        <td>${r.shiftDate}</td>
        <td>${r.toShift}</td>
        <td><span class="status-dot"><span class="d ${r.status}"></span>${statusLabel(r.status)}</span></td>
        <td class="chevron">›</td>
      `;
      tr.addEventListener("click", () => openDrawer(r.id));
      reqTableBody.appendChild(tr);
    });
    document.getElementById("statTotal").textContent = requests.length;
    document.getElementById("statApproved").textContent = requests.filter(
      (r) => r.status === "approved",
    ).length;
    document.getElementById("statRejected").textContent = requests.filter(
      (r) => r.status === "rejected",
    ).length;
    document.getElementById("statPending").textContent = requests.filter(
      (r) => r.status === "pending",
    ).length;
  }
  renderReqTable();

  const drawer = document.getElementById("drawer");
  const drawerOverlay = document.getElementById("drawerOverlay");
  const drawerBody = document.getElementById("drawerBody");
  const drawerFooter = document.getElementById("drawerFooter");

  function stepDotClass(state) {
    if (state === "done" || state === "approved") return "done";
    if (state === "active") return "active";
    if (state === "rejected") return "rejected";
    return "";
  }
  function stepDotIcon(state) {
    if (state === "done" || state === "approved") return "✓";
    if (state === "rejected") return "✕";
    return "";
  }

  function openDrawer(id) {
    const r = requests.find((x) => x.id === id);
    if (!r) return;

    drawerBody.innerHTML = `
      <div class="d-emp">
        <span class="avatar-lg">${r.init}</span>
        <div><div class="d-name">${r.name}</div><div class="d-role">${r.role}</div><div class="d-time">Diajukan ${r.submitted}</div></div>
      </div>
      <div class="info-box">
        <div class="info-row"><span>Jenis Pengajuan</span><span>${r.type}</span></div>
        <div class="info-row"><span>Tanggal Shift</span><span>${r.shiftDate}</span></div>
        <div class="info-row"><span>Shift Asal</span><span>${r.fromShift}</span></div>
        <div class="info-row"><span>Shift Tujuan</span><span>${r.toShift}</span></div>
      </div>
      <div class="stepper">
        <div class="step">
          <div class="step-line"></div>
          <div class="step-dot done">✓</div>
          <div><div class="step-title">Diajukan oleh Karyawan</div><div class="step-meta">${r.name} · ${r.submitted}</div></div>
        </div>
        <div class="step">
          <div class="step-line"></div>
          <div class="step-dot ${stepDotClass(r.leaderStatus)}">${stepDotIcon(r.leaderStatus)}</div>
          <div>
            <div class="step-title">Verifikasi Leader/Head ${r.leaderStatus === "active" ? '<span class="step-badge">Berjalan</span>' : ""}</div>
            <div class="step-meta">${r.leaderStatus === "done" ? r.leaderBy + " · " + r.leaderAt : r.leaderStatus === "active" ? "Sedang diverifikasi" : "Belum dimulai"}</div>
          </div>
        </div>
        <div class="step">
          <div class="step-dot ${stepDotClass(r.supervisorStatus)}">${stepDotIcon(r.supervisorStatus)}</div>
          <div>
            <div class="step-title">Keputusan Supervisor ${r.supervisorStatus === "active" ? '<span class="step-badge">Berjalan</span>' : ""}</div>
            <div class="step-meta">${r.supervisorStatus === "approved" || r.supervisorStatus === "rejected" ? r.supervisorBy + " · " + r.supervisorAt : r.supervisorStatus === "active" ? "Menunggu keputusan" : "Menunggu verifikasi Leader/Head"}</div>
          </div>
        </div>
      </div>
      <div class="note-box"><div class="note-label">Catatan dari Karyawan</div>${r.note}</div>
    `;

    if (r.supervisorStatus === "active") {
      drawerFooter.innerHTML = `
        <button class="btn btn-outline" id="drawerReject" style="color:var(--accent-deep);border-color:var(--border);">Tolak</button>
        <button class="btn btn-dark" id="drawerApprove">Setujui</button>
      `;
      drawerFooter
        .querySelector("#drawerApprove")
        .addEventListener("click", () => decide(r.id, "approved"));
      drawerFooter
        .querySelector("#drawerReject")
        .addEventListener("click", () => decide(r.id, "rejected"));
    } else {
      drawerFooter.innerHTML = `<button class="btn btn-outline" id="drawerCloseBtn" style="flex:1;">Tutup</button>`;
      drawerFooter
        .querySelector("#drawerCloseBtn")
        .addEventListener("click", closeDrawer);
    }

    drawer.classList.add("open");
    drawerOverlay.classList.add("open");
  }

  function decide(id, decision) {
    const r = requests.find((x) => x.id === id);
    if (!r) return;
    const confirmed = confirm(
      decision === "approved"
        ? "Setujui pengajuan ini?"
        : "Tolak pengajuan ini?",
    );
    if (!confirmed) return;
    r.status = decision;
    r.supervisorStatus = decision;
    r.supervisorBy = "Andini Supervisor";
    r.supervisorAt =
      new Date().toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
      }) +
      ", " +
      new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });
    renderReqTable();
    closeDrawer();
  }

  function closeDrawer() {
    drawer.classList.remove("open");
    drawerOverlay.classList.remove("open");
  }
  document.getElementById("drawerClose").addEventListener("click", closeDrawer);
  drawerOverlay.addEventListener("click", closeDrawer);

  document.getElementById("approveAllBtn").addEventListener("click", () => {
    const pendingCount = requests.filter(
      (r) => r.status === "pending" && r.supervisorStatus === "active",
    ).length;
    if (pendingCount === 0) {
      alert("Tidak ada pengajuan yang siap disetujui saat ini.");
      return;
    }
    const confirmed = confirm(
      `Setujui ${pendingCount} pengajuan yang sedang menunggu keputusan Supervisor?`,
    );
    if (!confirmed) return;
    requests.forEach((r) => {
      if (r.status === "pending" && r.supervisorStatus === "active") {
        r.status = "approved";
        r.supervisorStatus = "approved";
        r.supervisorBy = "Andini Supervisor";
        r.supervisorAt =
          new Date().toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
          }) +
          ", " +
          new Date().toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          });
      }
    });
    renderReqTable();
  });

  /* =========================================================
     8. TOAST NOTIFIKASI (dipakai Halaman 5 & 6)
     ========================================================= */
  function showToast(message, icon) {
    icon = icon || "✓";
    const toastWrap = document.getElementById("toastWrap");
    const el = document.createElement("div");
    el.className = "toast";
    el.innerHTML = `<span class="t-ic">${icon}</span><span>${message}</span>`;
    toastWrap.appendChild(el);
    requestAnimationFrame(() => el.classList.add("show"));
    setTimeout(() => {
      el.classList.remove("show");
      setTimeout(() => el.remove(), 300);
    }, 3500);
  }

  /* =========================================================
     9. HALAMAN 5 — Form Ajukan Izin/Tukar Shift (drawer, sisi Karyawan)
     ========================================================= */
  const currentEmployeeName = "Rizky Ramadhan"; // simulasi: karyawan yang sedang login
  const currentEmpIdx = employees.findIndex(
    (e) => e.name === currentEmployeeName,
  );

  const ajukanDrawer = document.getElementById("ajukanDrawer");
  const ajukanOverlay = document.getElementById("ajukanOverlay");
  const ajukanForm = document.getElementById("ajukanForm");
  const jenisRadios = document.querySelectorAll('input[name="jenisPengajuan"]');
  const tukarFields = document.getElementById("tukarFields");
  const tglShiftInput = document.getElementById("tglShiftInput");
  const shiftInfoAuto = document.getElementById("shiftInfoAuto");
  const tukarDenganSelect = document.getElementById("tukarDenganSelect");
  const shiftTujuanSelect = document.getElementById("shiftTujuanSelect");
  const tukarDenganError = document.getElementById("tukarDenganError");
  const alasanTextarea = document.getElementById("alasanTextarea");
  const alasanCount = document.getElementById("alasanCount");
  const ajukanSubmitBtn = document.getElementById("ajukanSubmitBtn");

  /* isi dropdown "Tukar dengan Karyawan" — kecuali diri sendiri */
  employees.forEach((emp) => {
    if (emp.name === currentEmployeeName) return;
    const opt = document.createElement("option");
    opt.value = emp.name;
    opt.textContent = `${emp.name} — ${emp.role}`;
    tukarDenganSelect.appendChild(opt);
  });

  function getDayIndexMonBased(date) {
    const jsDay = date.getDay(); // 0 = Minggu
    return jsDay === 0 ? 6 : jsDay - 1; // 0 = Senin ... 6 = Minggu
  }
  function getShiftInfoForDate(dateStr, empIdx) {
    if (!dateStr) return null;
    const d = new Date(dateStr + "T00:00:00");
    const dayIdx = getDayIndexMonBased(d);
    const key = pattern[(empIdx + dayIdx) % pattern.length];
    return shiftDefs[key];
  }

  function openAjukanDrawer() {
    ajukanDrawer.classList.add("open");
    ajukanOverlay.classList.add("open");
  }
  function closeAjukanDrawer() {
    ajukanDrawer.classList.remove("open");
    ajukanOverlay.classList.remove("open");
  }
  document
    .getElementById("openAjukanBtn")
    .addEventListener("click", openAjukanDrawer);
  document
    .getElementById("ajukanClose")
    .addEventListener("click", closeAjukanDrawer);
  ajukanOverlay.addEventListener("click", closeAjukanDrawer);

  function validateAjukanForm() {
    const jenis = document.querySelector(
      'input[name="jenisPengajuan"]:checked',
    ).value;
    let valid = true;
    if (!tglShiftInput.value) valid = false;
    if (alasanTextarea.value.trim().length < 10) valid = false;

    if (jenis === "Tukar Shift") {
      if (!tukarDenganSelect.value) valid = false;
      if (!shiftTujuanSelect.value) valid = false;
      const isSelf = tukarDenganSelect.value === currentEmployeeName;
      tukarDenganError.classList.toggle("show", isSelf);
      if (isSelf) valid = false;
    } else {
      tukarDenganError.classList.remove("show");
    }

    ajukanSubmitBtn.disabled = !valid;
    return valid;
  }

  jenisRadios.forEach((r) =>
    r.addEventListener("change", () => {
      const jenis = document.querySelector(
        'input[name="jenisPengajuan"]:checked',
      ).value;
      tukarFields.classList.toggle("show", jenis === "Tukar Shift");
      validateAjukanForm();
    }),
  );

  tglShiftInput.addEventListener("change", () => {
    if (!tglShiftInput.value) {
      shiftInfoAuto.classList.remove("show");
      validateAjukanForm();
      return;
    }
    const info = getShiftInfoForDate(tglShiftInput.value, currentEmpIdx);
    shiftInfoAuto.textContent =
      info.label === "Libur"
        ? "Anda tidak terjadwal (Libur) pada tanggal ini."
        : `Shift Anda: ${info.label}, ${info.hrs}`;
    shiftInfoAuto.classList.add("show");
    validateAjukanForm();
  });

  alasanTextarea.addEventListener("input", () => {
    alasanCount.textContent = alasanTextarea.value.length + " karakter";
    validateAjukanForm();
  });
  tukarDenganSelect.addEventListener("change", validateAjukanForm);
  shiftTujuanSelect.addEventListener("change", validateAjukanForm);

  ajukanForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validateAjukanForm()) return;

    const jenis = document.querySelector(
      'input[name="jenisPengajuan"]:checked',
    ).value;
    const todayStr = new Date().toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const shiftDateStr = new Date(
      tglShiftInput.value + "T00:00:00",
    ).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const info = getShiftInfoForDate(tglShiftInput.value, currentEmpIdx);
    const newId = Math.max(...requests.map((r) => r.id)) + 1;

    requests.unshift({
      id: newId,
      name: currentEmployeeName,
      role: employees[currentEmpIdx].role,
      init: employees[currentEmpIdx].init,
      type: jenis,
      submitted: todayStr,
      shiftDate: shiftDateStr,
      fromShift: info.label + (info.hrs ? " (" + info.hrs + ")" : ""),
      toShift: jenis === "Tukar Shift" ? shiftTujuanSelect.value : "—",
      status: "pending",
      leaderStatus: "active",
      supervisorStatus: "waiting",
      leaderBy: "—",
      leaderAt: "—",
      supervisorBy: "—",
      supervisorAt: "—",
      note: alasanTextarea.value.trim(),
    });

    renderReqTable();
    closeAjukanDrawer();
    ajukanForm.reset();
    shiftInfoAuto.classList.remove("show");
    tukarFields.classList.remove("show");
    alasanCount.textContent = "0 karakter";
    ajukanSubmitBtn.disabled = true;
    showToast("Pengajuan berhasil dikirim, menunggu verifikasi Leader/Head");
  });

  /* =========================================================
     10. HALAMAN 6 — Wizard Form Tambah Karyawan (sisi Supervisor)
     ========================================================= */
  const wizardOverlay = document.getElementById("wizardOverlay");
  const wizardPanels = document.querySelectorAll(".wizard-step-panel");
  const stepNavItems = document.querySelectorAll(".step-nav-item");
  const wizardPrevBtn = document.getElementById("wizardPrevBtn");
  const wizardNextBtn = document.getElementById("wizardNextBtn");
  const wizardProgressFill = document.getElementById("wizardProgressFill");
  const wizardProgressLbl = document.getElementById("wizardProgressLbl");
  const stepLabels = {
    1: "Data Diri & Kontak",
    2: "Data Kepegawaian",
    3: "Dokumen & Konfirmasi",
  };

  let wizardStep = 1;
  let wizardMaxReached = 1;

  function generateEmpId() {
    return "KN-" + String(employees.length + 1).padStart(4, "0");
  }

  function showFieldError(id, show) {
    const el = document.getElementById(id);
    if (el) el.classList.toggle("show", show);
  }

  function validateStep1() {
    let valid = true;
    const name = document.getElementById("empName").value.trim();
    const birth = document.getElementById("empBirth").value;
    const email = document.getElementById("empEmail").value.trim();
    const phone = document.getElementById("empPhone").value.trim();
    const address = document.getElementById("empAddress").value.trim();
    showFieldError("empNameError", name === "");
    if (name === "") valid = false;
    showFieldError("empBirthError", birth === "");
    if (birth === "") valid = false;
    showFieldError("empEmailError", email === "");
    if (email === "") valid = false;
    showFieldError("empPhoneError", phone === "");
    if (phone === "") valid = false;
    showFieldError("empAddressError", address === "");
    if (address === "") valid = false;
    return valid;
  }
  function validateStep2() {
    let valid = true;
    const join = document.getElementById("empJoinDate").value;
    const position = document.getElementById("empPosition").value;
    const role = document.getElementById("empRole").value;
    const shift = document.getElementById("empShift").value;
    showFieldError("empJoinDateError", join === "");
    if (join === "") valid = false;
    showFieldError("empPositionError", position === "");
    if (position === "") valid = false;
    showFieldError("empRoleError", role === "");
    if (role === "") valid = false;
    showFieldError("empShiftError", shift === "");
    if (shift === "") valid = false;
    return valid;
  }

  function renderWizardReview() {
    const genderInput = document.querySelector('input[name="gender"]:checked');
    document.getElementById("reviewStep1").innerHTML = `
      <div class="review-row"><span>Nama Lengkap</span><span>${document.getElementById("empName").value || "—"}</span></div>
      <div class="review-row"><span>Tanggal Lahir</span><span>${document.getElementById("empBirth").value || "—"}</span></div>
      <div class="review-row"><span>Jenis Kelamin</span><span>${genderInput ? genderInput.value : "—"}</span></div>
      <div class="review-row"><span>Email</span><span>${document.getElementById("empEmail").value || "—"}</span></div>
      <div class="review-row"><span>No. Telepon</span><span>${document.getElementById("empPhone").value || "—"}</span></div>
      <div class="review-row"><span>Alamat</span><span>${document.getElementById("empAddress").value || "—"}</span></div>
    `;
    document.getElementById("reviewStep2").innerHTML = `
      <div class="review-row"><span>ID Karyawan</span><span>${document.getElementById("empIdCode").value}</span></div>
      <div class="review-row"><span>Tanggal Bergabung</span><span>${document.getElementById("empJoinDate").value || "—"}</span></div>
      <div class="review-row"><span>Jabatan</span><span>${document.getElementById("empPosition").value || "—"}</span></div>
      <div class="review-row"><span>Role Akses</span><span>${document.getElementById("empRole").value || "—"}</span></div>
      <div class="review-row"><span>Shift Default</span><span>${document.getElementById("empShift").value || "—"}</span></div>
    `;
  }

  function goToStep(step) {
    wizardStep = step;
    wizardPanels.forEach((p) =>
      p.classList.toggle("active", Number(p.dataset.panel) === step),
    );
    stepNavItems.forEach((item) => {
      const s = Number(item.dataset.step);
      item.classList.remove("active", "done");
      if (s === step) item.classList.add("active");
      else if (s < wizardMaxReached) item.classList.add("done");
    });
    wizardPrevBtn.style.display = step === 1 ? "none" : "inline-block";
    wizardNextBtn.textContent =
      step === 3 ? "Daftarkan Karyawan" : "Selanjutnya";
    wizardProgressFill.style.width = (step / 3) * 100 + "%";
    wizardProgressLbl.textContent = `Step ${step} dari 3 — ${stepLabels[step]}`;
    if (step === 3) renderWizardReview();
  }

  stepNavItems.forEach((item) => {
    item.addEventListener("click", () => {
      const s = Number(item.dataset.step);
      if (s <= wizardMaxReached) goToStep(s);
    });
  });

  wizardNextBtn.addEventListener("click", () => {
    if (wizardStep === 1 && !validateStep1()) return;
    if (wizardStep === 2 && !validateStep2()) return;
    if (wizardStep === 3) {
      submitWizard();
      return;
    }
    wizardStep += 1;
    if (wizardStep > wizardMaxReached) wizardMaxReached = wizardStep;
    goToStep(wizardStep);
  });
  wizardPrevBtn.addEventListener("click", () => goToStep(wizardStep - 1));

  document.getElementById("wizardDraftBtn").addEventListener("click", () => {
    wizardOverlay.classList.remove("open");
    showToast("Data karyawan disimpan sebagai draft.");
  });

  document.querySelectorAll(".dropzone").forEach((dz) => {
    dz.addEventListener("click", () => {
      const filled = dz.classList.toggle("filled");
      dz.querySelector(".dz-text").textContent = filled
        ? dz.dataset.label + " terpilih ✓"
        : "Klik atau seret file ke sini";
    });
  });

  function resetWizard() {
    [
      "empName",
      "empBirth",
      "empEmail",
      "empPhone",
      "empAddress",
      "empJoinDate",
      "empPosition",
      "empRole",
      "empShift",
    ].forEach((id) => {
      document.getElementById(id).value = "";
    });
    document.getElementById("jenisIzin");
    document.querySelectorAll('input[name="gender"]')[0].checked = true;
    document
      .querySelectorAll(".field-error-text")
      .forEach((el) => el.classList.remove("show"));
    document.querySelectorAll(".dropzone").forEach((dz) => {
      dz.classList.remove("filled");
      dz.querySelector(".dz-text").textContent = "Klik atau seret file ke sini";
    });
    wizardStep = 1;
    wizardMaxReached = 1;
    goToStep(1);
  }

  function submitWizard() {
    const name = document.getElementById("empName").value;
    wizardOverlay.classList.remove("open");
    showToast(`Karyawan ${name} berhasil didaftarkan ke sistem.`);
    resetWizard();
  }

  document
    .getElementById("openAddEmployeeBtn")
    .addEventListener("click", () => {
      resetWizard();
      document.getElementById("empIdCode").value = generateEmpId();
      wizardOverlay.classList.add("open");
    });
  document
    .getElementById("wizardClose")
    .addEventListener("click", () => wizardOverlay.classList.remove("open"));
  wizardOverlay.addEventListener("click", (e) => {
    if (e.target === wizardOverlay) wizardOverlay.classList.remove("open");
  });
});
