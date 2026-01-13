let finalData = [];
let stopFlag = false;

async function startCheck() {
  stopFlag = false;
  finalData = [];
  document.getElementById("results").innerHTML = "";
  document.getElementById("csvBtn").classList.add("hidden");

  const keywords = keywordsInput();
  const locations = locationsInput();

  const totalTasks = keywords.length * locations.length;
  let completed = 0;

  document.getElementById("loader").classList.remove("hidden");

  for (const location of locations) {
    for (const keyword of keywords) {

      if (stopFlag) break;

      document.getElementById("progressText").innerText =
        `Checking: "${keyword}" (${location})`;

      const res = await fetch("/api/rank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword,
          targetUrl: targetUrl.value.trim(),
          location,
          device: device.value,
          browser: browser.value
        })
      });

      const data = await res.json();
      finalData.push(data);
      renderTable(finalData);

      completed++;
      document.getElementById("progressBar").value =
        Math.round((completed / totalTasks) * 100);
    }
  }

  document.getElementById("loader").classList.add("hidden");
  document.getElementById("progressText").innerText =
    stopFlag ? "Stopped by user" : "Completed";

  if (finalData.length) {
    document.getElementById("csvBtn").classList.remove("hidden");
  }
}

function stopCheck() {
  stopFlag = true;
}

function keywordsInput() {
  return document.getElementById("keywords")
    .value.split("\n").map(k => k.trim()).filter(Boolean);
}

function locationsInput() {
  return document.getElementById("locations")
    .value.split("\n").map(l => l.trim()).filter(Boolean);
}

function renderTable(data) {
  let html = `<table>
  <tr>
    <th>Date</th>
    <th>Keyword</th>
    <th>Location</th>
    <th>Rank</th>
    <th>Ranking URL</th>
    <th>Target URL</th>
    <th>Device</th>
  </tr>`;

  data.forEach(r => {
    html += `<tr>
      <td>${r.date}</td>
      <td>${r.keyword}</td>
      <td>${r.location}</td>
      <td>${r.rank}</td>
      <td>${r.rankingUrl || "-"}</td>
      <td>${r.targetUrl}</td>
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
