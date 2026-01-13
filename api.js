import https from "https";

function serperRequest(payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);

    const options = {
      hostname: "google.serper.dev",
      path: "/search",
      method: "POST",
      headers: {
        "X-API-KEY": process.env.SERPER_KEY,
        "Content-Type": "application/json",
        "Content-Length": data.length
      }
    };

    const req = https.request(options, res => {
      let body = "";
      res.on("data", chunk => body += chunk);
      res.on("end", () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject("Invalid JSON from Serper");
        }
      });
    });

    req.on("error", err => reject(err));
    req.write(data);
    req.end();
  });
}

export default async function handler(req, res) {
  try {
    const { keyword, targetUrl, location, device, browser } = req.body;

    const domain = targetUrl
      .replace(/^https?:\/\//, "")
      .replace(/\/$/, "");

    let rank = "Not Found";
    let rankingUrl = "";

    for (let page = 0; page < 10; page++) {
      const response = await serperRequest({
        q: keyword,
        location,
        gl: "in",
        hl: "en",
        device,
        page
      });

      const organic = response.organic || [];

      for (let i = 0; i < organic.length; i++) {
        if (organic[i].link && organic[i].link.includes(domain)) {
          rank = page * 10 + i + 1;
          rankingUrl = organic[i].link;
          break;
        }
      }

      if (rank !== "Not Found") break;
    }

    return res.status(200).json({
      date: new Date().toISOString().split("T")[0],
      keyword,
      location,
      rank,
      rankingUrl,
      targetUrl,
      device,
      browser
    });

  } catch (error) {
    return res.status(500).json({
      error: "SERP API failed",
      details: error.toString()
    });
  }
}
