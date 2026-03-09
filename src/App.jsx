import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const ALTOGETHER = { name: "Altogether Group", supply: 0.89, usage: 0.26, color: "#384741" };

const PROVIDERS = [
  { name: "Residential Classic", supply: 1.31, usage: 0.29, color: "#E68E8A" },
  { name: "Nectr Home Basic", supply: 1.2283, usage: 0.2871, color: "#E4C071" },
  { name: "HomeDeal Select", supply: 1.2935, usage: 0.2839, color: "#7A3B4E" },
  { name: "Kogan Energy (FIRST)", supply: 1.2271, usage: 0.2898, color: "#5B7B8A" },
  { name: "Residential Seniors Saver", supply: 1.1508, usage: 0.2952, color: "#C47B5A" },
  { name: "BOOST Residential", supply: 1.43, usage: 0.3399, color: "#F7F3EB" },
  { name: "Sumo Sunrise", supply: 1.18, usage: 0.30, color: "#A8BFA8" },
  { name: "Warm Welcome (Momentum)", supply: 1.7018, usage: 0.2728, color: "#9D9A9B" },
  { name: "The Free 3 Plan", supply: 1.155, usage: 0.3806, color: "#6A7D70" },
];

const SEASONS = [
  { key: "summer", label: "Summer", days: 90 },
  { key: "autumn", label: "Autumn", days: 91 },
  { key: "winter", label: "Winter", days: 92 },
  { key: "spring", label: "Spring", days: 92 },
];

// Each month mapped to its season and number of days
const MONTHS = [
  { label: "Jan", season: "summer", days: 31 },
  { label: "Feb", season: "summer", days: 28 },
  { label: "Mar", season: "autumn", days: 31 },
  { label: "Apr", season: "autumn", days: 30 },
  { label: "May", season: "autumn", days: 31 },
  { label: "Jun", season: "winter", days: 30 },
  { label: "Jul", season: "winter", days: 31 },
  { label: "Aug", season: "winter", days: 31 },
  { label: "Sep", season: "spring", days: 30 },
  { label: "Oct", season: "spring", days: 31 },
  { label: "Nov", season: "spring", days: 30 },
  { label: "Dec", season: "summer", days: 31 },
];

const HOUSEHOLDS = {
  "1 person": { summer: 11, autumn: 9, winter: 9.5, spring: 8.5, annual: 9.5 },
  "2 people": { summer: 16.5, autumn: 13.5, winter: 14, spring: 12.5, annual: 14 },
  "3 people": { summer: 20, autumn: 16, winter: 17, spring: 15, annual: 16.9 },
  "4 people": { summer: 25, autumn: 20, winter: 21, spring: 19, annual: 21.1 },
  "5+ people": { summer: 28, autumn: 23, winter: 24, spring: 21.5, annual: 24 },
};

function calcCost(p, kwh, days) { return p.supply * days + p.usage * kwh * days; }
function calcAnnualCost(p, hh) { return SEASONS.reduce((s, sn) => s + calcCost(p, hh[sn.key], sn.days), 0); }
const fmt = v => `$${v.toFixed(0)}`;
const fmtC = v => `$${v.toFixed(2)}`;

function ChartTooltip({ active, payload, label, providerColor }) {
  if (!active || !payload?.length) return null;
  const us = payload.find(p => p.dataKey === "altogether");
  const alt = payload.find(p => p.dataKey === "provider");
  return (
    <div className="sans" style={{ background: "#1A2736", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "14px 18px", fontSize: 13, color: "#D4CFC5", boxShadow: "0 12px 40px rgba(0,0,0,0.4)", minWidth: 200 }}>
      <div style={{ fontWeight: 700, marginBottom: 10, color: "#FFFDF5", fontSize: 14 }}>{label}</div>
      {us && <div style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 5 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 10, height: 10, borderRadius: 2, background: ALTOGETHER.color }} /><span>Altogether</span></div>
        <span style={{ fontWeight: 700, color: "#FFFDF5" }}>{fmtC(us.value)}</span>
      </div>}
      {alt && <div style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 5 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 10, height: 10, borderRadius: 2, background: providerColor }} /><span>Retailer</span></div>
        <span style={{ fontWeight: 700, color: "#FFFDF5" }}>{fmtC(alt.value)}</span>
      </div>}
      {us && alt && <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.12)", fontWeight: 700, color: "#A8BFA8", display: "flex", justifyContent: "space-between" }}>
        <span>You save</span><span>{fmtC(alt.value - us.value)}</span>
      </div>}
    </div>
  );
}

function ToggleButton({ options, value, onChange }) {
  return (
    <div style={{ display: "inline-flex", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, overflow: "hidden" }}>
      {options.map(opt => (
        <button key={opt.value} onClick={() => onChange(opt.value)} className="sans"
          style={{ padding: "6px 14px", fontSize: 12, fontWeight: value === opt.value ? 700 : 400, background: value === opt.value ? "rgba(255,255,255,0.1)" : "transparent", color: value === opt.value ? "#FFFDF5" : "#6A7D70", border: "none", cursor: "pointer", transition: "all 0.15s" }}>
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function App() {
  const [selectedHH, setSelectedHH] = useState("2 people");
  const [selectedProvider, setSelectedProvider] = useState(PROVIDERS[1].name);
  const [viewMode, setViewMode] = useState("monthly");
  const provider = PROVIDERS.find(p => p.name === selectedProvider);
  const hh = HOUSEHOLDS[selectedHH];

  const seasonData = useMemo(() => SEASONS.map(s => ({
    name: s.label,
    altogether: calcCost(ALTOGETHER, hh[s.key], s.days),
    provider: calcCost(provider, hh[s.key], s.days),
  })), [selectedHH, selectedProvider]);

  const monthlyData = useMemo(() => MONTHS.map(m => ({
    name: m.label,
    altogether: calcCost(ALTOGETHER, hh[m.season], m.days),
    provider: calcCost(provider, hh[m.season], m.days),
  })), [selectedHH, selectedProvider]);

  const chartData = viewMode === "monthly" ? monthlyData : seasonData;

  const annualAlt = calcAnnualCost(ALTOGETHER, hh);
  const annualProv = calcAnnualCost(provider, hh);
  const annualSaving = annualProv - annualAlt;

  const allHHSavings = useMemo(() =>
    Object.entries(HOUSEHOLDS).map(([size, data]) => ({
      name: size,
      saving: calcAnnualCost(provider, data) - calcAnnualCost(ALTOGETHER, data),
    }))
  , [selectedProvider]);

  return (
    <div>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, rgba(56,72,66,0.2) 0%, rgba(15,22,28,0) 60%)", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "48px 24px 40px" }}>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          <div className="sans" style={{ fontSize: 11, letterSpacing: 2.5, textTransform: "uppercase", color: "#A8BFA8", marginBottom: 10, fontWeight: 600 }}>Body Corporate Electricity Cost Analysis</div>
          <h1 style={{ fontSize: 30, fontWeight: 400, lineHeight: 1.25, margin: "0 0 12px", color: "#FFFDF5" }}>Is our embedded network saving owners money?</h1>
          <p className="sans" style={{ fontSize: 15, color: "#9D9A9B", margin: 0, lineHeight: 1.65, maxWidth: 660 }}>
            Compare your current Altogether Group rates against every fixed-rate retail plan available on Energy Made Easy for Carseldine, 4034. Select a provider and household size to explore.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 880, margin: "0 auto", padding: "32px 24px 48px" }}>

        {/* Controls */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 32 }}>
          <div>
            <div className="sans" style={{ fontSize: 11, color: "#6A7D70", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8, fontWeight: 600 }}>Compare against</div>
            <select value={selectedProvider} onChange={e => setSelectedProvider(e.target.value)}
              className="sans" style={{ width: "100%", padding: "10px 14px", fontSize: 14, background: "#1E2D3E", color: "#FFFDF5", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, cursor: "pointer", outline: "none" }}>
              {PROVIDERS.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <div className="sans" style={{ fontSize: 11, color: "#6A7D70", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8, fontWeight: 600 }}>Household size</div>
            <div style={{ display: "flex", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, overflow: "hidden" }}>
              {Object.keys(HOUSEHOLDS).map(size => (
                <button key={size} onClick={() => setSelectedHH(size)} className="sans"
                  style={{ flex: 1, padding: "10px 4px", fontSize: 12, fontWeight: selectedHH === size ? 700 : 400, background: selectedHH === size ? ALTOGETHER.color : "transparent", color: selectedHH === size ? "#FFFDF5" : "#7A8580", border: "none", cursor: "pointer", transition: "all 0.15s", borderRight: "1px solid rgba(255,255,255,0.06)", whiteSpace: "nowrap" }}>
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Metric cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 36 }}>
          <div style={{ background: "rgba(56,72,66,0.12)", border: "1px solid rgba(56,72,66,0.3)", borderRadius: 12, padding: 20 }}>
            <div className="sans" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5, color: "#A8BFA8", marginBottom: 6, fontWeight: 600 }}>Altogether / year</div>
            <div style={{ fontSize: 30, fontWeight: 300, color: "#FFFDF5" }}>{fmt(annualAlt)}</div>
            <div className="sans" style={{ fontSize: 11, color: "#6A7D70", marginTop: 4 }}>{fmt(annualAlt / 12)}/month</div>
          </div>
          <div style={{ background: `${provider.color}15`, border: `1px solid ${provider.color}40`, borderRadius: 12, padding: 20 }}>
            <div className="sans" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5, color: provider.color, marginBottom: 6, fontWeight: 600 }}>
              {provider.name.length > 22 ? provider.name.substring(0, 22) + "\u2026" : provider.name} / year
            </div>
            <div style={{ fontSize: 30, fontWeight: 300, color: "#FFFDF5" }}>{fmt(annualProv)}</div>
            <div className="sans" style={{ fontSize: 11, color: "#6A7D70", marginTop: 4 }}>{fmt(annualProv / 12)}/month</div>
          </div>
          <div style={{ background: "rgba(168,191,168,0.08)", border: "1px solid rgba(168,191,168,0.25)", borderRadius: 12, padding: 20 }}>
            <div className="sans" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5, color: "#A8BFA8", marginBottom: 6, fontWeight: 600 }}>You save with Altogether</div>
            <div style={{ fontSize: 30, fontWeight: 300, color: "#A8BFA8" }}>{fmt(annualSaving)}</div>
            <div className="sans" style={{ fontSize: 11, color: "#6A7D70", marginTop: 4 }}>{fmt(annualSaving / 12)}/month</div>
          </div>
        </div>

        {/* Cost chart with view toggle */}
        <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "28px 20px 16px", marginBottom: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 2 }}>
            <div>
              <div style={{ fontSize: 17, color: "#FFFDF5", marginBottom: 2 }}>
                {viewMode === "monthly" ? "Monthly cost" : "Quarterly cost by season"}
              </div>
              <div className="sans" style={{ fontSize: 12, color: "#5B6660", marginBottom: 24 }}>{selectedHH} household · SE Queensland average consumption</div>
            </div>
            <ToggleButton
              options={[{ label: "Monthly", value: "monthly" }, { label: "Quarterly", value: "quarterly" }]}
              value={viewMode}
              onChange={setViewMode}
            />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} barGap={viewMode === "monthly" ? 2 : 6} barCategoryGap={viewMode === "monthly" ? "12%" : "22%"}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "#9D9A9B", fontSize: viewMode === "monthly" ? 11 : 13 }} axisLine={{ stroke: "rgba(255,255,255,0.08)" }} tickLine={false} />
              <YAxis tick={{ fill: "#5B6660", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} domain={[0, "auto"]} />
              <Tooltip content={<ChartTooltip providerColor={provider.color} />} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
              <Bar dataKey="altogether" name="Altogether Group" fill={ALTOGETHER.color} radius={[5, 5, 0, 0]} />
              <Bar dataKey="provider" name={provider.name} fill={provider.color} radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="sans" style={{ display: "flex", gap: 24, justifyContent: "center", marginTop: 8, fontSize: 12, color: "#9D9A9B" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 12, height: 12, borderRadius: 3, background: ALTOGETHER.color }} />Altogether Group</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 12, height: 12, borderRadius: 3, background: provider.color }} />{provider.name}</div>
          </div>
        </div>

        {/* Savings by HH size */}
        <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "28px 20px 16px", marginBottom: 32 }}>
          <div style={{ fontSize: 17, color: "#FFFDF5", marginBottom: 2 }}>Annual saving with Altogether by household size</div>
          <div className="sans" style={{ fontSize: 12, color: "#5B6660", marginBottom: 24 }}>vs {provider.name}</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={allHHSavings} barCategoryGap="28%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "#9D9A9B", fontSize: 12 }} axisLine={{ stroke: "rgba(255,255,255,0.08)" }} tickLine={false} />
              <YAxis tick={{ fill: "#5B6660", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
              <Tooltip content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="sans" style={{ background: "#1A2736", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#D4CFC5" }}>
                    <div style={{ fontWeight: 700, color: "#FFFDF5", marginBottom: 4 }}>{label}</div>
                    <div style={{ color: "#A8BFA8", fontWeight: 700 }}>Saves ${payload[0].value.toFixed(0)}/year with Altogether</div>
                  </div>
                );
              }} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
              <Bar dataKey="saving" radius={[5, 5, 0, 0]}>
                {allHHSavings.map((entry, i) => <Cell key={i} fill={entry.name === selectedHH ? "#A8BFA8" : "rgba(168,191,168,0.3)"} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Full rate table */}
        <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "24px 20px", marginBottom: 32, overflowX: "auto" }}>
          <div style={{ fontSize: 17, color: "#FFFDF5", marginBottom: 4 }}>All plans compared</div>
          <div className="sans" style={{ fontSize: 12, color: "#5B6660", marginBottom: 18 }}>Based on {selectedHH} household · click any row to compare</div>
          <table className="sans" style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                <th style={{ textAlign: "left", padding: "8px 10px", color: "#6A7D70", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>Provider</th>
                <th style={{ textAlign: "right", padding: "8px 10px", color: "#6A7D70", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>Supply</th>
                <th style={{ textAlign: "right", padding: "8px 10px", color: "#6A7D70", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>Usage</th>
                <th style={{ textAlign: "right", padding: "8px 10px", color: "#6A7D70", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>Est. annual</th>
                <th style={{ textAlign: "right", padding: "8px 10px", color: "#6A7D70", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>vs Altogether</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(56,72,66,0.08)" }}>
                <td style={{ padding: "12px 10px", color: "#FFFDF5", fontWeight: 600 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: ALTOGETHER.color }} />
                    Altogether Group
                    <span style={{ fontSize: 9, background: "rgba(168,191,168,0.15)", color: "#A8BFA8", padding: "2px 7px", borderRadius: 4, fontWeight: 700 }}>CURRENT</span>
                  </div>
                </td>
                <td style={{ textAlign: "right", padding: "12px 10px", color: "#FFFDF5", fontWeight: 500 }}>89.00 c/day</td>
                <td style={{ textAlign: "right", padding: "12px 10px", color: "#FFFDF5", fontWeight: 500 }}>26.00 c/kWh</td>
                <td style={{ textAlign: "right", padding: "12px 10px", color: "#A8BFA8", fontWeight: 700 }}>{fmt(annualAlt)}</td>
                <td style={{ textAlign: "right", padding: "12px 10px", color: "#6A7D70" }}>{"\u2014"}</td>
              </tr>
              {PROVIDERS.map(p => {
                const pAnnual = calcAnnualCost(p, hh);
                const diff = pAnnual - annualAlt;
                const isSelected = p.name === selectedProvider;
                return (
                  <tr key={p.name} onClick={() => setSelectedProvider(p.name)} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", cursor: "pointer", background: isSelected ? `${p.color}12` : "transparent", transition: "background 0.15s" }}>
                    <td style={{ padding: "11px 10px", color: isSelected ? "#FFFDF5" : "#C0BAB0" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: p.color, opacity: isSelected ? 1 : 0.5 }} />
                        {p.name}
                      </div>
                    </td>
                    <td style={{ textAlign: "right", padding: "11px 10px", color: isSelected ? "#F7F3EB" : "#9D9A9B" }}>{(p.supply * 100).toFixed(2)} c/day</td>
                    <td style={{ textAlign: "right", padding: "11px 10px", color: isSelected ? "#F7F3EB" : "#9D9A9B" }}>{(p.usage * 100).toFixed(2)} c/kWh</td>
                    <td style={{ textAlign: "right", padding: "11px 10px", color: "#E68E8A", fontWeight: isSelected ? 700 : 500 }}>{fmt(pAnnual)}</td>
                    <td style={{ textAlign: "right", padding: "11px 10px", color: "#E68E8A", fontWeight: isSelected ? 700 : 500 }}>+{fmt(diff)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Assumptions & Caveats */}
        <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "24px 20px", marginBottom: 32 }}>
          <div style={{ fontSize: 17, color: "#FFFDF5", marginBottom: 16 }}>Assumptions and caveats</div>
          <div className="sans" style={{ fontSize: 13, color: "#9D9A9B", lineHeight: 1.75 }}>

            <div style={{ marginBottom: 16 }}>
              <div style={{ color: "#D4CFC5", fontWeight: 600, marginBottom: 4 }}>Data sources</div>
              <div>Retail plan rates sourced from Energy Made Easy (energymadeeasy.gov.au) for Carseldine, 4034 {"\u2013"} single rate plans, basic meter {"\u2013"} as at March 2026. Altogether Group rates taken from current owner billing: $0.89/day supply, $0.26/kWh usage. Consumption benchmarks derived from the AER Residential Energy Consumption Benchmarks (Frontier Economics, December 2020) for Climate Zone 2 (Brisbane), supplemented by Brisbane-specific estimates from multiple industry sources.</div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ color: "#D4CFC5", fontWeight: 600, marginBottom: 4 }}>Average daily usage by household size (kWh/day)</div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ borderCollapse: "collapse", fontSize: 12, marginTop: 8, width: "100%" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                      <th style={{ textAlign: "left", padding: "6px 10px", color: "#9D9A9B", fontWeight: 600 }}>Household</th>
                      <th style={{ textAlign: "center", padding: "6px 10px", color: "#9D9A9B", fontWeight: 600 }}>Summer</th>
                      <th style={{ textAlign: "center", padding: "6px 10px", color: "#9D9A9B", fontWeight: 600 }}>Autumn</th>
                      <th style={{ textAlign: "center", padding: "6px 10px", color: "#9D9A9B", fontWeight: 600 }}>Winter</th>
                      <th style={{ textAlign: "center", padding: "6px 10px", color: "#9D9A9B", fontWeight: 600 }}>Spring</th>
                      <th style={{ textAlign: "center", padding: "6px 10px", color: "#9D9A9B", fontWeight: 600 }}>Annual avg</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(HOUSEHOLDS).map(([size, data]) => (
                      <tr key={size} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <td style={{ padding: "6px 10px", color: "#C0BAB0" }}>{size}</td>
                        <td style={{ textAlign: "center", padding: "6px 10px", color: "#C0BAB0" }}>{data.summer}</td>
                        <td style={{ textAlign: "center", padding: "6px 10px", color: "#C0BAB0" }}>{data.autumn}</td>
                        <td style={{ textAlign: "center", padding: "6px 10px", color: "#C0BAB0" }}>{data.winter}</td>
                        <td style={{ textAlign: "center", padding: "6px 10px", color: "#C0BAB0" }}>{data.spring}</td>
                        <td style={{ textAlign: "center", padding: "6px 10px", color: "#FFFDF5", fontWeight: 600 }}>{data.annual}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ color: "#D4CFC5", fontWeight: 600, marginBottom: 4 }}>Seasonal profile</div>
              <div>Queensland{"\u2019"}s seasonal electricity pattern differs from southern states. Consumption peaks in summer (air conditioning) rather than winter. The seasonal adjustment applied is approximately +15% in summer and {"\u2212"}10% in spring relative to the annual average, with autumn and winter close to the annual figure. These are estimates based on published AER data and industry benchmarks for Climate Zone 2. Monthly costs use the seasonal kWh/day rate for that month{"\u2019"}s season, multiplied by the actual days in the month.</div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ color: "#E4C071", fontWeight: 700, marginBottom: 4 }}>{"\u26A0"} Critical: bundled vs energy-only rates</div>
              <div>The retail plan rates shown here are <strong style={{ color: "#F7F3EB" }}>bundled rates</strong> {"\u2013"} they include both energy charges and network distribution charges as offered to standard grid-connected customers. If an owner were to switch from within the embedded network, they would <strong style={{ color: "#F7F3EB" }}>not</strong> pay the retailer{"\u2019"}s bundled rate. Instead, they would receive an {"\u201C"}energy only{"\u201D"} offer from the retailer <strong style={{ color: "#F7F3EB" }}>plus</strong> continue paying network charges to the body corporate (billed by Altogether at the regulated shadow price). This means the actual cost of switching is <strong style={{ color: "#F7F3EB" }}>higher</strong> than the retail figures shown in this comparison.</div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ color: "#D4CFC5", fontWeight: 600, marginBottom: 4 }}>Additional costs of switching</div>
              <div>Owners who switch may incur: a new meter installation fee (charged by the new retailer); a brief off-supply period during meter changeover; and ongoing receipt of two separate electricity bills. The cost to opt out of the embedded network is borne by the individual owner. Exit fees in Queensland are capped at $20, but metering and connection costs are separate and vary by retailer.</div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ color: "#D4CFC5", fontWeight: 600, marginBottom: 4 }}>What this comparison excludes</div>
              <div>Government rebates (including the 2025{"\u2013"}26 cost of living rebate), solar feed-in tariffs, conditional discounts (e.g. pay-on-time, direct debit), time-of-use tariff variations, demand tariffs, and any special pricing conditions attached to individual plans. Apartment electricity consumption is typically lower than detached house benchmarks due to smaller floor areas and shared walls {"\u2013"} actual savings may therefore differ from the estimates shown.</div>
            </div>

            <div>
              <div style={{ color: "#D4CFC5", fontWeight: 600, marginBottom: 4 }}>Your rights</div>
              <div>Under the National Energy Retail Law and the Electricity Act 1994 (Qld), all embedded network customers have the right to purchase electricity from an authorised retailer of their choice, provided that retailer is willing to make an offer. This analysis is provided to help owners make informed decisions {"\u2013"} it is not financial advice. For further information, visit <a href="https://www.energymadeeasy.gov.au" style={{ color: "#A8BFA8" }}>energymadeeasy.gov.au</a> or contact the AER on 1300 585 165.</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sans" style={{ fontSize: 11, color: "#414042", lineHeight: 1.6, textAlign: "center", paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          Prepared for the body corporate committee {"\u00b7"} Data as at March 2026 {"\u00b7"} Click any row in the table to compare that provider
        </div>
      </div>
    </div>
  );
}
