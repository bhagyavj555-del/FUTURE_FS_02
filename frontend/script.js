const API ="https://FUTURE-FS-02-95jz.onrender.com/api";

// ================= REGISTER =================
async function register() {
  const email = document.getElementById("regEmail").value;
  const password = document.getElementById("regPassword").value;

  try {
    const res = await fetch(`${API}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    document.getElementById("message").innerText =
      data.message || data.error;

    if (res.ok) {
      setTimeout(() => {
        window.location = "login.html";
      }, 1000);
    }

  } catch (err) {
    document.getElementById("message").innerText = "Register failed";
  }
}


// ================= LOGIN =================
async function login() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (data.token) {
      localStorage.setItem("token", data.token);

      document.getElementById("message").innerText = "Login successful";

      setTimeout(() => {
        window.location = "dashboard.html";
      }, 1000);

    } else {
      document.getElementById("message").innerText =
        data.error || "Login failed";
    }

  } catch (err) {
    document.getElementById("message").innerText = "Login error";
  }
}


// ================= LOGOUT =================
function logout() {
  localStorage.removeItem("token");
  window.location = "login.html";
}


// ================= ADD LEAD =================
document.getElementById("leadForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const token = localStorage.getItem("token");

  if (!token) {
    alert("Please login first");
    return;
  }

  const name = document.getElementById("name").value;
  const email = document.getElementById("leadEmail").value;
  const source = document.getElementById("source").value;
  const status = document.getElementById("status").value;

  try {
    const res = await fetch(`${API}/leads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({ name, email, source, status })
    });

    if (res.ok) {
      loadLeads();
      document.getElementById("leadForm").reset();
    }

  } catch (err) {
    alert("Error adding lead");
  }
});


// ================= LOAD LEADS =================
async function loadLeads() {
  const token = localStorage.getItem("token");

  if (!token) return;

  try {
    const res = await fetch(`${API}/leads`, {
      headers: {
        "Authorization": "Bearer " + token
      }
    });

    const data = await res.json();

    const list = document.getElementById("leadsList");
    if (!list) return;

    list.innerHTML = "";

    data.forEach(lead => {
      const li = document.createElement("li");

      li.innerHTML = `
        <div class="lead">
          <b>${lead.name}</b> (${lead.email}) <br>
           Status: <b class="status-${lead.status}">${lead.status}</b><br>

          <b>Notes:</b>
          <ul>
            ${
              lead.notes && lead.notes.length > 0
                ? lead.notes.map(n => `<li>${n.text}</li>`).join("")
                : "<li>No notes</li>"
            }
          </ul>

          <button onclick="updateStatus('${lead._id}', 'new')">New</button>
          <button onclick="updateStatus('${lead._id}', 'contacted')">Contacted</button>
          <button onclick="updateStatus('${lead._id}', 'converted')">Converted</button>

          <br><br>

          <input id="note-${lead._id}" placeholder="Add note">
          <button onclick="addNote('${lead._id}')">Add Note</button>

          <br><br>

          <button onclick="deleteLead('${lead._id}')">Delete</button>
        </div>
      `;

      list.appendChild(li);
    });

    // render chart after loading
    renderChart(data);

  } catch (err) {
    console.log(err);
  }
}


// ================= UPDATE STATUS =================
async function updateStatus(id, status) {
  const token = localStorage.getItem("token");

  try {
    await fetch(`${API}/leads/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({ status })
    });

    loadLeads();

  } catch (err) {
    alert("Error updating status");
  }
}


// ================= ADD NOTE =================
async function addNote(id) {
  const token = localStorage.getItem("token");
  const text = document.getElementById(`note-${id}`).value;

  if (!text) return;

  try {
    await fetch(`${API}/leads/${id}/notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({ text })
    });

    loadLeads();

  } catch (err) {
    alert("Error adding note");
  }
}


// ================= DELETE LEAD =================
async function deleteLead(id) {
  const token = localStorage.getItem("token");

  try {
    await fetch(`${API}/leads/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": "Bearer " + token
      }
    });

    loadLeads();

  } catch (err) {
    alert("Error deleting lead");
  }
}


// ================= SIDEBAR SWITCH =================
function showSection(section) {
  const leads = document.getElementById("leadsSection");
  const analytics = document.getElementById("analyticsSection");

  if (!leads || !analytics) return;

  leads.style.display = section === "leads" ? "block" : "none";
  analytics.style.display = section === "analytics" ? "block" : "none";
}


// ================= CHART =================
let chartInstance = null;

function renderChart(leads) {
  const canvas = document.getElementById("chart");
  if (!canvas) return;

  const counts = {
    new: 0,
    contacted: 0,
    converted: 0
  };

  leads.forEach(l => counts[l.status]++);

  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(canvas, {
    type: "bar",
    data: {
      labels: ["New", "Contacted", "Converted"],
      datasets: [{
        label: "Leads",
        data: [counts.new, counts.contacted, counts.converted]
      }]
    }
  });
}
