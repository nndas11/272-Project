"use client";

import React, { useState } from "react";

type Horizon = "short_term" | "long_term";

type FormState = {
  risk: "low" | "medium" | "high";
  amount: number;
  horizon: Horizon;
  sectors: string[];
  regions: string[];
  instruments: string[];
  dividend: boolean;
  esg: boolean;
  ideasCount: number;
};

export default function RecommendationsPage() {
  const [form, setForm] = useState<FormState>({
    risk: "medium",
    amount: 5000,
    horizon: "short_term",
    sectors: [],
    regions: [],
    instruments: ["stocks", "etfs"],
    dividend: false,
    esg: false,
    ideasCount: 4,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"simple" | "readable" | "raw">("simple");
  const [quickPicks, setQuickPicks] = useState<string[]>([]);
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  type Idea = { ticker?: string; name?: string; allocation?: number; risk?: "Low" | "Medium" | "High"; rationale?: string };
  const [ideas, setIdeas] = useState<Idea[]>([]);

  const extractQuickPicks = (text: string): string[] => {
    const lines = text.split(/\r?\n/);
    const set = new Set<string>();
    const deny = new Set(["ETF", "ETFs", "USD", "ESG", "APAC", "EU", "US", "GDP", "AI", "ROI"]);
    for (const line of lines) {
      // bullet start ticker e.g. - AAPL - Apple ... or - MSFT — ...
      let m = line.match(/^\s*[-*]\s*([A-Z]{2,6})(?=[\s—–\-:])/);
      if (m && !deny.has(m[1])) {
        set.add(m[1]);
        continue;
      }
      // ticker in parentheses e.g. Apple (AAPL)
      m = line.match(/\(([A-Z]{2,6})\)/);
      if (m && !deny.has(m[1])) {
        set.add(m[1]);
        continue;
      }
      // fallback: first standalone 2-6 uppercase token
      m = line.match(/\b([A-Z]{2,6})\b/);
      if (m && !deny.has(m[1])) {
        set.add(m[1]);
      }
      if (set.size >= 6) break;
    }
    return Array.from(set).slice(0, 6);
  };

  const getActivePreset = (): null | "conservative" | "balanced" | "aggressive" => {
    const s = form;
    if (
      s.risk === "low" &&
      s.horizon === "long_term" &&
      s.ideasCount === 4 &&
      s.instruments.includes("etfs")
    )
      return "conservative";
    if (
      s.risk === "medium" &&
      s.horizon === "long_term" &&
      s.ideasCount === 5 &&
      s.instruments.includes("stocks") && s.instruments.includes("etfs")
    )
      return "balanced";
    if (
      s.risk === "high" &&
      s.horizon === "short_term" &&
      s.ideasCount === 5 &&
      s.instruments.length === 1 && s.instruments[0] === "stocks"
    )
      return "aggressive";
    return null;
  };

  const resetDefaults = () => {
    setForm({
      risk: "medium",
      amount: 5000,
      horizon: "short_term",
      sectors: [],
      regions: [],
      instruments: ["stocks", "etfs"],
      dividend: false,
      esg: false,
      ideasCount: 4,
    });
  };

  const applyPreset = (preset: "conservative" | "balanced" | "aggressive") => {
    if (preset === "conservative") {
      setForm((s) => ({
        ...s,
        risk: "low",
        horizon: "long_term",
        amount: Math.max(1000, s.amount),
        ideasCount: 4,
        instruments: ["etfs", "stocks"],
      }));
    } else if (preset === "balanced") {
      setForm((s) => ({
        ...s,
        risk: "medium",
        horizon: "long_term",
        amount: Math.max(2500, s.amount),
        ideasCount: 5,
        instruments: ["stocks", "etfs"],
      }));
    } else {
      setForm((s) => ({
        ...s,
        risk: "high",
        horizon: "short_term",
        amount: Math.max(2500, s.amount),
        ideasCount: 5,
        instruments: ["stocks"],
      }));
    }
  };

  const renderReadable = (text: string) => {
    // Very lightweight renderer: paragraphs and lists, bold and inline code
    const lines = text.split(/\r?\n/);
    const blocks: string[] = [];
    let listBuffer: string[] = [];

    const flushList = () => {
      if (listBuffer.length) {
        const items = listBuffer
          .map((l) => l.replace(/^[-*]\s?/, "").trim())
          .map((item) => {
            let html = item;
            if (selectedTicker) {
              const re = new RegExp(`\\b${selectedTicker}\\b`, "g");
              html = html.replace(re, `<mark class=\\"rounded bg-yellow-200 px-1\\">${selectedTicker}</mark>`);
            }
            return `<li class=\"mb-1\">${html}</li>`;
          }) // keep simple
          .join("");
        blocks.push(`<ul class=\"ml-5 list-disc\">${items}</ul>`);
        listBuffer = [];
      }
    };

    for (const line of lines) {
      if (/^\s*[-*]\s+/.test(line)) {
        listBuffer.push(line);
        continue;
      }
      flushList();
      const trimmed = line.trim();
      if (!trimmed) {
        blocks.push("<div class=\"h-2\"></div>");
        continue;
      }
      // Headings: simple heuristic
      if (/^#{1,3}\s+/.test(trimmed)) {
        const level = (trimmed.match(/^#+/)![0].length);
        const content = trimmed.replace(/^#{1,3}\s+/, "");
        const Tag = level === 1 ? "h2" : level === 2 ? "h3" : "h4";
        let heading = content;
        if (selectedTicker) {
          const re = new RegExp(`\\b${selectedTicker}\\b`, "g");
          heading = heading.replace(re, `<mark class=\\"rounded bg-yellow-200 px-1\\">${selectedTicker}</mark>`);
        }
        const cls = level === 1
          ? "mt-4 text-xl font-semibold text-indigo-700 border-l-4 border-indigo-300 pl-3"
          : level === 2
          ? "mt-3 text-lg font-semibold text-fuchsia-700 border-l-4 border-fuchsia-300 pl-3"
          : "mt-2 text-base font-semibold text-rose-700 border-l-4 border-rose-300 pl-3";
        blocks.push(`<${Tag} class=\"${cls}\">${heading}</${Tag}>`);
      } else {
        // Inline bold and code
        let html = trimmed
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/`([^`]+)`/g, '<code class=\"rounded bg-gray-100 px-1\">$1</code>');
        if (selectedTicker) {
          const re = new RegExp(`\\b${selectedTicker}\\b`, "g");
          html = html.replace(re, `<mark class=\\"rounded bg-yellow-200 px-1\\">${selectedTicker}</mark>`);
        }
        blocks.push(`<p class=\"leading-6\">${html}</p>`);
      }
    }
    flushList();
    return blocks.join("");
  };

  const onSubmit = async () => {
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const res = await fetch("/api/stock-recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          risk: form.risk,
          amount: Number(form.amount || 0),
          horizon: form.horizon,
          sectors: form.sectors,
          regions: form.regions,
          instruments: form.instruments,
          dividend: form.dividend,
          esg: form.esg,
          ideasCount: form.ideasCount,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || `Request failed with ${res.status}`);
      }

      const data = (await res.json()) as { recommendation: string };
      setResult(data.recommendation);
      setQuickPicks(extractQuickPicks(data.recommendation));
      setIdeas(parseIdeas(data.recommendation));
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const parseIdeas = (text: string): Idea[] => {
    const lines = text.split(/\r?\n/);
    // 1) Strict format: "Stock Name: Low|Medium|High"
    const strict: Idea[] = [];
    for (const raw of lines) {
      const m = raw.match(/^\s*(.+?)\s*:\s*(Low|Medium|High)\s*$/i);
      if (m) {
        const name = m[1].trim();
        const riskRaw = m[2].toLowerCase();
        const risk = riskRaw === "high" ? "High" : riskRaw === "medium" ? "Medium" : "Low";
        strict.push({ name, risk });
      }
    }
    if (strict.length) return strict.slice(0, 10);

    // 2) Fallback heuristic from bullets/lines
    const out: Idea[] = [];
    for (let raw of lines) {
      const line = raw.trim();
      if (!line) continue;
      if (!/^[-*\d]/.test(line)) continue;
      const idea: Idea = {};
      // Ticker and name
      let m = line.match(/^[-*\d\.)\s]*([A-Z]{2,6})\s*[—\-:)]?\s*(.*)$/);
      if (m) {
        idea.ticker = m[1];
        idea.name = (m[2] || "").replace(/^\s*-\s*/, "").split(/[.|(|\[]/)[0].trim();
      }
      // Or Name (TICKER)
      if (!idea.ticker) {
        m = line.match(/\(([A-Z]{2,6})\)/);
        if (m) idea.ticker = m[1];
        const n = line.replace(/\(([A-Z]{2,6})\)/, "").replace(/^[-*\d\.)\s]*/, "").split(/[.|\-]/)[0].trim();
        if (n) idea.name = n;
      }
      // Allocation like 20%
      const alloc = line.match(/(\d{1,3})%/);
      if (alloc) {
        const v = Math.max(0, Math.min(100, parseInt(alloc[1], 10)));
        idea.allocation = v;
      }
      // Risk keywords
      if (/\bhigh\b/i.test(line)) idea.risk = "High";
      else if (/\bmedium\b/i.test(line)) idea.risk = "Medium";
      else if (/\blow\b/i.test(line)) idea.risk = "Low";
      // Rationale: after ticker/name separator
      const after = line.split(/[—\-:]/).slice(1).join("-").trim();
      if (after) idea.rationale = after;
      if (idea.ticker || idea.name) out.push(idea);
      if (out.length >= 7) break;
    }
    return out;
  };

  return (
    <div className="min-h-screen w-full bg-black text-gray-100">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="rounded-2xl bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-rose-600 p-1 shadow-xl">
          <div className="rounded-2xl bg-neutral-900/90 px-6 py-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-3xl font-semibold tracking-tight">
                <span className="bg-gradient-to-r from-indigo-300 via-fuchsia-300 to-rose-300 bg-clip-text text-transparent">Stock Ideas</span>
              </h1>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-neutral-800 px-2.5 py-1 text-xs font-semibold text-indigo-300">Beta</span>
                <span className="rounded-full bg-neutral-800 px-2.5 py-1 text-xs font-semibold text-emerald-300">Educational</span>
              </div>
              <div className="mt-1 text-xs text-white/80">
                Showing {form.ideasCount} ideas · Risk: {form.risk} · Horizon: {form.horizon === "short_term" ? "≤12m" : "3-5y+"}
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-300">Pick a preset or tweak a few controls, then generate a short list of stocks with simple risk labels. No fluff, just signals.</p>
          </div>
        </div>

        <div className="mt-8 space-y-6 pb-28">
          {/* Result panel on top */}
          <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900 shadow-sm">
            <div className="bg-gradient-to-r from-indigo-700 via-fuchsia-700 to-rose-700 p-4 text-white">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium">Your suggestions</h2>
                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setViewMode("simple")}
                    className={`rounded-md px-2 py-1 ${viewMode === "simple" ? "bg-white/20" : "bg-white/10 hover:bg-white/20"}`}
                  >
                    Simple
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("readable")}
                    className={`rounded-md px-2 py-1 ${viewMode === "readable" ? "bg-white/20" : "bg-white/10 hover:bg-white/20"}`}
                  >
                    Readable
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("raw")}
                    className={`rounded-md px-2 py-1 ${viewMode === "raw" ? "bg-white/20" : "bg-white/10 hover:bg-white/20"}`}
                  >
                    Raw
                  </button>
                </div>
              </div>
              {viewMode !== "simple" && quickPicks.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {quickPicks.map((tkr, idx) => {
                    const active = selectedTicker === tkr;
                    return (
                      <button
                        key={`${tkr}-${idx}`}
                        type="button"
                        onClick={() => setSelectedTicker((cur) => (cur === tkr ? null : tkr))}
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium backdrop-blur ${
                          active ? "bg-emerald-400 text-white" : "bg-white/20 text-white hover:bg-white/30"
                        }`}
                        title={active ? "Click to clear highlight" : "Highlight this ticker in the text"}
                      >
                        <span className={`inline-block h-2 w-2 rounded-full ${active ? "bg-white" : "bg-emerald-300"}`} />
                        {tkr}
                      </button>
                    );
                  })}
                  {selectedTicker && (
                    <button
                      type="button"
                      onClick={() => setSelectedTicker(null)}
                      className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-1 text-xs font-medium text-white hover:bg-white/30"
                      title="Clear highlight"
                    >
                      Clear
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="p-5">
              {!result && !loading && (
                <p className="text-sm text-gray-400">Your tailored, high-level ideas will appear here after you click Generate.</p>
              )}
              {loading && (
                <div className="animate-pulse space-y-2">
                  <div className="h-3 w-1/2 rounded bg-neutral-700" />
                  <div className="h-3 w-5/6 rounded bg-neutral-700" />
                  <div className="h-3 w-3/4 rounded bg-neutral-700" />
                </div>
              )}
              {result && (
                <div>
                  {viewMode === "simple" ? (
                    <div className="mb-1 grid gap-2">
                      {ideas.map((it, idx) => {
                        const name = it.name || it.ticker || "Idea";
                        const risk = it.risk || "";
                        const riskCls = risk === "High" ? "bg-rose-400/20 text-rose-300" : risk === "Medium" ? "bg-amber-400/20 text-amber-300" : risk === "Low" ? "bg-emerald-400/20 text-emerald-300" : "bg-neutral-700 text-neutral-300";
                        return (
                          <div key={`${name}-${idx}`} className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 shadow-sm">
                            <span className="text-sm font-medium text-gray-100">{name}</span>
                            {risk && <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${riskCls}`}>{risk} risk</span>}
                          </div>
                        );
                      })}
                      {ideas.length === 0 && (
                        <p className="text-sm text-gray-400">No items detected. Try generating again.</p>
                      )}
                    </div>
                  ) : viewMode === "raw" ? (
                    <pre className="whitespace-pre-wrap break-words text-sm leading-6 text-gray-200">{result}</pre>
                  ) : (
                    <div
                      className="prose prose-invert prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: renderReadable(result) }}
                    />
                  )}
                  {viewMode !== "simple" && (
                    <div className="mb-3 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => navigator.clipboard.writeText(result)}
                        className="rounded-md border border-neutral-800 px-3 py-1 text-xs font-medium text-gray-200 hover:bg-neutral-800"
                        title="Copy to clipboard"
                      >
                        Copy
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const blob = new Blob([result], { type: "text/plain;charset=utf-8" });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = "stock-recommendations.txt";
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                        className="rounded-md border border-neutral-800 px-3 py-1 text-xs font-medium text-gray-200 hover:bg-neutral-800"
                        title="Download as .txt"
                      >
                        Download
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Presets */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm font-medium text-gray-200">Presets</div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => applyPreset("conservative")}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold text-white hover:brightness-110 ${getActivePreset() === "conservative" ? "bg-emerald-500 ring-2 ring-emerald-300" : "bg-emerald-600"}`}
                  title="Lower risk, longer horizon"
                >
                  🛡️ Conservative
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset("balanced")}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold text-white hover:brightness-110 ${getActivePreset() === "balanced" ? "bg-indigo-500 ring-2 ring-indigo-300" : "bg-indigo-600"}`}
                  title="Balanced mix"
                >
                  ⚖️ Balanced
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset("aggressive")}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold text-white hover:brightness-110 ${getActivePreset() === "aggressive" ? "bg-rose-500 ring-2 ring-rose-300" : "bg-rose-600"}`}
                  title="Higher risk, shorter horizon"
                >
                  🚀 Aggressive
                </button>
                <button
                  type="button"
                  onClick={resetDefaults}
                  className="ml-2 rounded-full border border-neutral-700 px-3 py-1.5 text-xs font-semibold text-gray-200 hover:bg-neutral-800"
                  title="Reset to defaults"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Compact controls */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5 shadow-sm">
            <div className="-mx-2 overflow-x-auto whitespace-nowrap">
              <div className="mx-2 inline-flex min-w-full items-center gap-3 align-top">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-300">Risk 🔥</span>
                  <div className="inline-flex overflow-hidden rounded-lg border border-neutral-700">
                    {(["low", "medium", "high"] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setForm((s) => ({ ...s, risk: r }))}
                        className={`px-3 py-1.5 text-xs ${
                          form.risk === r
                            ? r === "low"
                              ? "bg-emerald-600 text-white"
                              : r === "medium"
                              ? "bg-indigo-600 text-white"
                              : "bg-rose-600 text-white"
                            : "bg-neutral-900 text-gray-200 hover:bg-neutral-800"
                        }`}
                      >
                        {r[0].toUpperCase() + r.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-300">Horizon ⏱️</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setForm((s) => ({ ...s, horizon: "short_term" }))}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                        form.horizon === "short_term" ? "bg-indigo-600 text-white" : "bg-neutral-800 text-gray-200 hover:bg-neutral-700"
                      }`}
                    >
                      ≤ 12m
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm((s) => ({ ...s, horizon: "long_term" }))}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                        form.horizon === "long_term" ? "bg-indigo-600 text-white" : "bg-neutral-800 text-gray-200 hover:bg-neutral-700"
                      }`}
                    >
                      3-5y+
                    </button>
                  </div>
                </div>

                <div className="flex min-w-[300px] flex-1 items-center gap-2">
                  <span className="text-xs font-medium text-gray-300">Amount 💵</span>
                  <input
                    type="range"
                    min={0}
                    max={100000}
                    step={500}
                    value={form.amount}
                    onChange={(e) => setForm((s) => ({ ...s, amount: Number(e.target.value) }))}
                    className="flex-1 accent-indigo-500"
                  />
                  <input
                    type="number"
                    min={0}
                    step={100}
                    value={form.amount}
                    onChange={(e) => setForm((s) => ({ ...s, amount: Math.max(0, Number(e.target.value || 0)) }))}
                    className="w-24 rounded-md border border-neutral-700 bg-neutral-900 px-2 py-1 text-right text-[10px] text-gray-200 focus:outline-none"
                  />
                </div>
              </div>
            </div>
            <div className="mt-2 text-[10px] text-gray-400">Tip: Use presets or tweak Risk, Horizon, and Amount. Advanced options are below.</div>
          </div>

          {/* Advanced options collapsible */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5 shadow-sm">
            <button
              type="button"
              onClick={() => setShowAdvanced((v) => !v)}
              className="flex w-full items-center justify-between"
            >
              <span className="text-sm font-medium text-gray-100">Advanced options</span>
              <span className="text-xs text-gray-400">{showAdvanced ? "Hide" : "Show"}</span>
            </button>
            {showAdvanced && (
              <div className="mt-4 space-y-4">
                <div>
                  <span className="text-xs font-medium text-gray-300">Sectors</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {["Technology", "Healthcare", "Financials", "Energy", "Consumer", "Industrials", "Utilities"].map((sct) => {
                      const active = form.sectors.includes(sct);
                      return (
                        <button
                          key={sct}
                          type="button"
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              sectors: active ? prev.sectors.filter((x) => x !== sct) : [...prev.sectors, sct],
                            }))
                          }
                          className={`rounded-full px-3 py-1 text-xs ${active ? "bg-fuchsia-600 text-white" : "bg-neutral-800 text-fuchsia-300 hover:bg-neutral-700"}`}
                        >
                          {sct}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <span className="text-xs font-medium text-gray-300">Regions</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {["US", "Europe", "APAC", "Emerging", "Global"].map((rg) => {
                      const active = form.regions.includes(rg);
                      return (
                        <button
                          key={rg}
                          type="button"
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              regions: active ? prev.regions.filter((x) => x !== rg) : [...prev.regions, rg],
                            }))
                          }
                          className={`rounded-full px-3 py-1 text-xs ${active ? "bg-emerald-600 text-white" : "bg-neutral-800 text-emerald-300 hover:bg-neutral-700"}`}
                        >
                          {rg}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <span className="text-xs font-medium text-gray-300">Types</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {[
                      { key: "stocks", label: "Stocks" },
                      { key: "etfs", label: "ETFs" },
                      { key: "mutual_funds", label: "Mutual Funds" },
                    ].map((opt) => {
                      const active = form.instruments.includes(opt.key);
                      return (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              instruments: active ? prev.instruments.filter((x) => x !== opt.key) : [...prev.instruments, opt.key],
                            }))
                          }
                          className={`rounded-full px-3 py-1 text-xs ${active ? "bg-indigo-600 text-white" : "bg-neutral-800 text-indigo-300 hover:bg-neutral-700"}`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900 p-4">
                    <span className="text-sm text-gray-100">Prefer dividend income?</span>
                    <button
                      type="button"
                      onClick={() => setForm((s) => ({ ...s, dividend: !s.dividend }))}
                      className={`relative h-7 w-12 rounded-full transition ${form.dividend ? "bg-emerald-600" : "bg-neutral-700"}`}
                    >
                      <span
                        className={`absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white shadow transition ${
                          form.dividend ? "left-6" : "left-1"
                        }`}
                      />
                    </button>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900 p-4">
                    <span className="text-sm text-gray-100">Prioritize ESG/sustainability?</span>
                    <button
                      type="button"
                      onClick={() => setForm((s) => ({ ...s, esg: !s.esg }))}
                      className={`relative h-7 w-12 rounded-full transition ${form.esg ? "bg-emerald-600" : "bg-neutral-700"}`}
                    >
                      <span
                        className={`absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white shadow transition ${form.esg ? "left-6" : "left-1"}`}
                      />
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-300">Ideas</span>
                    <span className="rounded-md bg-neutral-800 px-2 py-1 text-[10px] font-medium text-gray-200">{form.ideasCount}</span>
                  </div>
                  <input
                    type="range"
                    min={3}
                    max={7}
                    step={1}
                    value={form.ideasCount}
                    onChange={(e) => setForm((s) => ({ ...s, ideasCount: Number(e.target.value) }))}
                    className="mt-2 w-full accent-rose-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Sticky bottom action bar */}
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-neutral-800 bg-neutral-950/90 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
            <div className="hidden sm:flex flex-wrap items-center gap-2 text-xs text-gray-300">
              <span className="rounded-md bg-neutral-800 px-2 py-1">Risk: {form.risk}</span>
              <span className="rounded-md bg-neutral-800 px-2 py-1">Horizon: {form.horizon === "short_term" ? "≤12m" : "3-5y+"}</span>
              <span className="rounded-md bg-neutral-800 px-2 py-1">Amount: ${form.amount.toLocaleString()}</span>
              {form.sectors.length > 0 && <span className="rounded-md bg-neutral-800 px-2 py-1">Sectors: {form.sectors.join(", ")}</span>}
              {form.regions.length > 0 && <span className="rounded-md bg-neutral-800 px-2 py-1">Regions: {form.regions.join(", ")}</span>}
            </div>
            <button
              type="button"
              disabled={loading}
              onClick={onSubmit}
              className="ml-auto w-full sm:w-auto rounded-xl bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-rose-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:brightness-110 disabled:opacity-60"
            >
              {loading ? "Generating..." : "Generate my recommendations"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
