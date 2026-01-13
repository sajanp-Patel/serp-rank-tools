export default async function handler(req, res) {
  try {
    const { keyword, targetUrl, location, device, browser } = req.body;
    const domain = targetUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");

    let rank = "Not Found";
    let rankingUrl = "";

    for (let page = 0; page < 10; page++) {
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
          device,
          page
        })
      });

      const data = await response.json();
      const organic = data.organic || [];

      for (let i = 0; i < organic.length; i++) {
        if (organic[i].link && organic[i].link.includes(domain)) {
          rank = page * 10 + i + 1;
          rankingUrl = organic[i].link;
          break;
        }
      }

      if (rank !== "Not Found") break;
    }

    res.status(200).json({
      date: new Date().toISOString().split("T")[0],
      keyword,
      location,
      rank,
      rankingUrl,
      targetUrl,
      device,
      browser
    });

  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
}
