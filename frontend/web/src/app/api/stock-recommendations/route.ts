import { NextResponse } from "next/server";
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing OPENAI_API_KEY in env" }, { status: 500 });
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { risk, amount, horizon, sectors, regions, instruments, dividend, esg, ideasCount } = body as {
      risk?: "low" | "medium" | "high";
      amount?: number;
      horizon?: "short_term" | "long_term";
      sectors?: string[];
      regions?: string[];
      instruments?: string[];
      dividend?: boolean;
      esg?: boolean;
      ideasCount?: number;
    };

    if (!risk || typeof amount !== "number" || amount < 0 || !horizon) {
      return NextResponse.json({ error: "Required fields: risk, amount (>= 0), horizon" }, { status: 400 });
    }

    const riskText = risk === "low" ? "low" : risk === "high" ? "high" : "medium";
    const horizonText = horizon === "long_term" ? "long-term (3-5y+)" : "short-term (<=12m)";
    const sectorsList = Array.isArray(sectors) && sectors.length ? sectors.join(", ") : "No preference";
    const regionsList = Array.isArray(regions) && regions.length ? regions.join(", ") : "No preference";
    const instrumentsList = Array.isArray(instruments) && instruments.length ? instruments.join(", ") : "Stocks or ETFs";
    const ideas = Math.min(7, Math.max(3, Number.isFinite(ideasCount as number) ? (ideasCount as number) : 4));
    const dividendText = dividend ? "Yes, prefer dividend-paying options" : "No preference";
    const esgText = esg ? "Prioritize ESG/sustainability screens" : "No ESG preference";

    const userPrompt = `You are an AI assistant generating high-level stock allocation ideas. The user parameters are:
- Risk tolerance: ${riskText}
- Budget to invest: $${amount.toLocaleString()}
- Investment horizon: ${horizonText}
- Preferred sectors: ${sectorsList}
- Regions: ${regionsList}
- Instruments: ${instrumentsList}
- Dividend preference: ${dividendText}
- ESG: ${esgText}

Task:
- Provide ${ideas} diversified ${instrumentsList} ideas (tickers + names) aligned to the parameters.

STRICT OUTPUT FORMAT (this is critical):
- Return EXACTLY ${ideas} lines.
- Each line MUST be: Stock Name: Low | Medium | High
- Do NOT include numbering, bullets, markdown, code fences, commentary, explanations, allocations, or disclaimers.
- Examples:
  Apple: Medium
  Vanguard S&P 500 ETF: Low
`;

    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    async function fetchWithRetry(url: string, init: RequestInit, attempts = 3, timeoutMs = 20000): Promise<Response> {
      let lastErr: any;
      for (let i = 0; i < attempts; i++) {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeoutMs);
        try {
          const res = await fetch(url, { ...init, signal: controller.signal, cache: "no-store" });
          clearTimeout(id);
          if (res.ok) return res;
          // For 5xx, retry
          if (res.status >= 500) {
            lastErr = new Error(`OpenAI ${res.status}`);
          } else {
            return res;
          }
        } catch (e: any) {
          lastErr = e;
        }
        // backoff
        await new Promise((r) => setTimeout(r, 500 * (i + 1)));
      }
      throw lastErr || new Error("Network error");
    }

    const response = await fetchWithRetry(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          temperature: 0.7,
          messages: [
            {
              role: "system",
              content:
                "You are a helpful investment idea generator. Never provide personalized financial advice; present educational, high-level ideas only.",
            },
            { role: "user", content: userPrompt },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      const hint = response.status >= 500 ? "Service temporarily unavailable. Please retry." : "Check API key, model, or request format.";
      return NextResponse.json({ error: `OpenAI error: ${response.status}. ${hint} ${errText}` }, { status: 502 });
    }

    const data = (await response.json()) as any;
    const recommendation = data?.choices?.[0]?.message?.content?.trim();

    if (!recommendation) {
      return NextResponse.json({ error: "No content in OpenAI response" }, { status: 500 });
    }

    return NextResponse.json({ recommendation });
  } catch (e: any) {
    const msg = String(e?.message || e || "Unexpected error");
    const tlsHint = /TLS|ECONNRESET|fetch failed|abort|network/i.test(msg)
      ? "Network/TLS issue. If on VPN/proxy, try disabling temporarily or switching network."
      : "";
    return NextResponse.json({ error: `${msg}${tlsHint ? ` | ${tlsHint}` : ""}` }, { status: 502 });
  }
}
