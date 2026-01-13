import fetch from "node-fetch";

export default async function handler(req, res) {
  const { keywords, targetUrl, location, device, browser } = req.body;
  const results = [];

  for (const keyword of keywords) {
    const response = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": process.env.SERPER_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        q: keyword,
        location,
        gl: "in",
        hl: "en",
        device
      })
    });

    const data = await response.json();
    const organic = data.organic || [];

    let rank = "Not Found";
    let rankingUrl = "";

    organic.forEach((r, i) => {
      if (r.link.includes(targetUrl.replace(/https?:\/\//, ""))) {
        rank = i + 1;
        rankingUrl = r.link;
      }
    });

    results.push({
      date: new Date().toISOString().split("T")[0],
      keyword,
      rank,
      rankingUrl,
      targetUrl,
      location,
      device,
      browser
    });
  }

  res.json(results);
}
