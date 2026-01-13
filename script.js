let finalData = [];
let stopFlag = false;

function stopCheck() {
  stopFlag = true;
}

function getLines(id) {
  return document.getElementById(id).value
    .split("\n").map(v => v.trim()).filter(Boolean);
}

async function startCheck() {
  stopFlag = false;
  finalData = [];
  results.innerHTML = "";
  csvBtn.classList.add("hidden");

  const keywords = getLines("keywords");
  const locations = getLines("locations");

  const total = keywords.length * locations.length;
  let done = 0;

  loader.classList.remove("hidden");

  for (const location of locations) {
    for (const keyword of keywords) {

      if (stopFlag) break;

      progressText.innerText = `Checking "${keyword}" (${location})`;

      const res = await fetch("/api/rank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword,
          targetUrl: targetUrl.value,
          location,
          device: device.value
        })
      });

      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        progressText.innerText = "API returned invalid response";
        loader.classList.add("hidden");
        return;
      }

      if (data.error) {
        progressText.innerText = data.error;
        loader.classList.add("hidden");
        return;
      }

      finalData.push(data);
      renderTable(finalData);

      done++;
      progressBar.value = Math.round((done / total) * 100);
    }
  }

  loader.classList.add("hidden");
  progressText.innerText = stopFlag ? "Stopped" : "Completed";
  csvBtn.classList.remove("hidden");
}

function renderTable(data) {
  let html = `<table>
    <tr>
      <th>Date</th><th>Keyword</th><th>Location</th>
      <th>Rank</th><th>Ranking URL</th><th>Target URL</th>
    </tr>`;

  data.forEach(r => {
    html += `<tr>
      <td>${r.date}</td>
      <td>${r.keyword}</td>
      <td>${r.location}</td>
      <td>${r.rank}</td>
      <td>${r.rankingUrl || "-"}</td>
      <td>${r.targetUrl}</td>
    </tr>`;
  });

  html += "</table>";
  results.innerHTML = html;
}

function downloadCSV() {
  const csv = [
    Object.keys(finalData[0]).join(","),
    ...finalData.map(r => Object.values(r).join(","))
  ].join("\n");

  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv]));
  a.download = "serp-rank-report.csv";
  a.click();
}
