let finalData = [];

async function checkRank() {
  finalData = [];
  document.getElementById("results").innerHTML = "Checking...";

  const keywords = document.getElementById("keywords").value
    .split("\n").filter(k => k.trim());

  const payload = {
    keywords,
    targetUrl: targetUrl.value,
    location: location.value,
    device: device.value,
    browser: browser.value
  };

  const res = await fetch("/api/rank", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  finalData = await res.json();
  renderTable(finalData);
}

function renderTable(data) {
  let html = `<table><tr>
  <th>Date</th><th>Keyword</th><th>Rank</th><th>Ranking URL</th>
  <th>Target URL</th><th>Location</th><th>Device</th></tr>`;

  data.forEach(r => {
    html += `<tr>
      <td>${r.date}</td>
      <td>${r.keyword}</td>
      <td>${r.rank}</td>
      <td>${r.rankingUrl}</td>
      <td>${r.targetUrl}</td>
      <td>${r.location}</td>
      <td>${r.device}</td>
    </tr>`;
  });

  html += "</table>";
  document.getElementById("results").innerHTML = html;
  document.getElementById("csvBtn").style.display = "block";
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
