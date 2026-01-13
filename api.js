import https from "https";

function callSerper(payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);

    const req = https.request(
      {
        hostname: "google.serper.dev",
        path: "/search",
        method: "POST",
        headers: {
          "X-API-KEY": process.env.SERPER_KEY || "",
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(data)
        }
      },
      res => {
        let body = "";
        res.on("data", c => body += c);
        res.on("end", () => {
          try {
            const json = JSON.parse(body);
            resolve(json);
          } catch {
            reject("SERPER RAW RESPONSE: " + body.slice(0, 200));
          }
        });
      }
    );

    req.on("error", err => reject(err.toString()));
    req.write(data);
    req.end();
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.SERPER_KEY) {
    return res.status(500).json({
      error: "SERPER_KEY missing in environment variables"
    });
  }

  try {
    const { keyword, targetUrl, location, device } = req.body || {};

    const domain = targetUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");

    let rank = "Not Found";
    let rankingUrl = "";

    for (let page = 0; page < 10; page++) {
      const data = await callSerper({
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

    return res.json({
      date: new Date().toISOString().split("T")[0],
      keyword,
      location,
      rank,
      rankingUrl,
      targetUrl
    });

  } catch (err) {
    return res.status(500).json({
      error: "SERPER ERROR",
      details: String(err)
    });
  }
}
