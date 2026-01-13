import fetch from "node-fetch";

export default async function handler(req, res) {
  const { keyword, location, device, browser } = req.body;

  const response = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: {
      "X-API-KEY": process.env.SERPER_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      q: keyword,
      location: location,
      gl: "in",
      hl: "en",
      device: device
    })
  });

  const data = await response.json();
  const results = data.organic || [];

  let rank = "Not Found";
  let url = "";

  if (results.length > 0) {
    rank = 1;
    url = results[0].link;
  }

  res.json({
    date: new Date().toISOString(),
    keyword,
    location,
    device,
    browser,
    rank,
    url
  });
}
