let finalData = [];

async function checkRank() {
  finalData = [];
  document.getElementById("results").innerHTML = "";
  document.getElementById("csvBtn").classList.add("hidden");

  const keywords = document.getElementById("keywords")
    .value.split("\n").map(k => k.trim()).filter(Boolean);

  document.getElementById("loader").classList.remove("hidden");
  document.getElementById("progress").innerText = "Starting...";

  const res = await fetch("/api/rank", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      keywords,
      targetUrl: targetUrl.value.trim(),
      location: location.value,
      device: device.value,
      browser: browser.value
    })
  });

  finalData = await res.json();
  renderTable(finalData);

  document.getElementById("loader").classList.add("hidden");
  document.getElementById("progress").innerText = "Completed";
  document.getElementById("csvBtn").classList.remove("hidden");
}

function renderTable(data) {
  let html = `<table><tr>
    <th>Date</th>
    <th>Keyword</th>
    <th>Rank</th>
    <th>Ranking URL</th>
    <th>Target URL</th>
    <th>Location</th>
    <th>Device</th>
  </tr>`;

  data.forEach(r => {
    html += `<tr>
      <td>${r.date}</td>
      <td>${r.keyword}</td>
      <td>${r.rank}</td>
      <td>${r.rankingUrl || "-"}</td>
      <td>${r.targetUrl}</td>
      <td>${r.location}</td>
      <td>${r.device}</td>
    </tr>`;
  });

  html += "</table>";
  document.getElementById("results").innerHTML = html;
}

function downloadCSV() {
  const csv = [
    Object.keys(finalData[0]).join(","),
    ...finalData.map(r => Object.values(r).join(","))
  ].join("\n");

  const blob = new Blob([csv]);
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "serp-rank-report.csv";
  a.click();
}
