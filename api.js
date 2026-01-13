import https from "https";

function serper(payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);

    const req = https.request(
      {
        hostname: "google.serper.dev",
        path: "/search",
        method: "POST",
        headers: {
          "X-API-KEY": process.env.SERPER_KEY,
          "Content-Type": "application/json",
          "Content-Length": data.length
        }
      },
      res => {
        let body = "";
        res.on("data", c => body += c);
        res.on("end", () => {
          try {
            resolve(JSON.parse(body));
          } catch {
            reject("Invalid JSON");
          }
        });
      }
    );

    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

export default async function handler(req, res) {
  try {
    const { keyword, targetUrl, location, device, browser } = req.body;

    const domain = targetUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");

    let rank = "Not Found";
    let rankingUrl = "";

    for (let page = 0; page < 10; page++) {
      const data = await serper({
        q: keyword,
        location,
        gl: "in",
        hl: "en",
        device,
        page
      });

      const organic = data.organic || [];
      for (let i = 0; i < organic.length; i++) {
        if (organic[i].link?.includes(domain)) {
          rank = page * 10 + i + 1;
          rankingUrl = organic[i].link;
          break;
        }
      }
      if (rank !== "Not Found") break;
    }

    res.json({
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
    res.status(500).json({ error: "SERPER API failed" });
  }
}
