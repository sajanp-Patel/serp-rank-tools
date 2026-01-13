export default async function handler(req, res) {
  try {
    const { keywords, targetUrl, location, device, browser } = req.body;
    const cleanDomain = targetUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
    const results = [];

    for (const keyword of keywords) {
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
          if (organic[i].link && organic[i].link.includes(cleanDomain)) {
            rank = page * 10 + i + 1;
            rankingUrl = organic[i].link;
            break;
          }
        }

        if (rank !== "Not Found") break;
      }

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

    res.status(200).json(results);

  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
}
