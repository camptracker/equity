import { useState, useCallback } from 'react'

const PASSWORD = 'oreo'

function PasswordGate({ onUnlock }) {
  const [pw, setPw] = useState('')
  const [error, setError] = useState(false)
  const submit = (e) => {
    e.preventDefault()
    if (pw === PASSWORD) {
      sessionStorage.setItem('eq_auth', '1')
      onUnlock()
    } else {
      setError(true)
      setPw('')
    }
  }
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'var(--bg)' }}>
      <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:16 }}>
        <div style={{ fontSize:32, fontWeight:700, marginBottom:8 }}>🔒</div>
        <input
          type="password"
          value={pw}
          onChange={e => { setPw(e.target.value); setError(false) }}
          placeholder="Password"
          autoFocus
          style={{
            background:'var(--surface)', border:`1px solid ${error ? 'var(--red)' : 'var(--border)'}`,
            borderRadius:12, padding:'12px 20px', fontSize:16, color:'var(--text)', outline:'none',
            width:240, textAlign:'center', fontFamily:'Inter, sans-serif'
          }}
        />
        <button type="submit" style={{
          background:'var(--green)', color:'#000', border:'none', borderRadius:12,
          padding:'10px 32px', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'Inter, sans-serif'
        }}>Enter</button>
        {error && <div style={{ color:'var(--red)', fontSize:13 }}>Wrong password</div>}
      </form>
    </div>
  )
}

const fmt = (n) => n.toLocaleString('en-US', { style:'currency', currency:'USD', maximumFractionDigits:0 })
const fmtFull = (n) => n.toLocaleString('en-US', { style:'currency', currency:'USD', maximumFractionDigits:0 })

// Tax rates (California 2026 top marginal)
const TAX = {
  shortTerm: { federal: 0.37, state: 0.133, fica: 0.0235, niit: 0 }, // FICA = Medicare only at high income
  longTerm: { federal: 0.20, state: 0.133, fica: 0, niit: 0.038 },
}
const totalRate = (t) => t.federal + t.state + t.fica + t.niit

// $7.23B valuation at $26.528/share → ~272,574,879 shares outstanding
const SHARES_OUTSTANDING = 7_230_000_000 / 26.528

const DEFAULTS = {
  options: 46040, strike: 3.967,
  common: 24770,
  rsus: 20200,
  fmv: 23.71,
}

function TaxInfoModal({ onClose }) {
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100, padding:16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background:'var(--surface)', borderRadius:16, padding:'24px 28px', maxWidth:560, width:'100%', maxHeight:'80vh', overflowY:'auto', border:'1px solid var(--border)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <div style={{ fontSize:18, fontWeight:700 }}>📐 How Tax Is Calculated</div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--text-dim)', fontSize:20, cursor:'pointer' }}>✕</button>
        </div>

        <div style={{ fontSize:13, lineHeight:1.7, color:'var(--text-dim)' }}>
          <div style={{ fontWeight:600, color:'var(--text)', fontSize:14, marginBottom:8 }}>🔶 Options (Unexercised — 46,040 shares)</div>
          <p><b>Value</b> = (Share Price − Strike Price of $3.967) × 46,040</p>
          <p><b>Short-term scenario</b> (exercise & sell same day):</p>
          <ul style={{ paddingLeft:20, margin:'4px 0 12px' }}>
            <li>Taxed as ordinary income</li>
            <li>Federal: 37% (top marginal bracket)</li>
            <li>California: 13.3% (top state bracket)</li>
            <li>FICA/Medicare: 2.35% (Additional Medicare Tax)</li>
            <li><b>Total: 52.65%</b></li>
          </ul>
          <p><b>Long-term scenario</b> (hold &gt;1 year after exercise):</p>
          <ul style={{ paddingLeft:20, margin:'4px 0 12px' }}>
            <li>Taxed as long-term capital gains</li>
            <li>Federal: 20% (top LTCG rate)</li>
            <li>California: 13.3% (CA taxes capital gains as ordinary income)</li>
            <li>NIIT: 3.8% (Net Investment Income Tax)</li>
            <li><b>Total: 37.1%</b></li>
          </ul>

          <div style={{ fontWeight:600, color:'var(--text)', fontSize:14, marginBottom:8, marginTop:16 }}>🟣 Common Stock (Exercised — 24,770 shares)</div>
          <p><b>Value</b> = Share Price × 24,770</p>
          <p>Already exercised and held &gt;1 year → Long-term capital gains:</p>
          <ul style={{ paddingLeft:20, margin:'4px 0 12px' }}>
            <li>Federal: 20% + California: 13.3% + NIIT: 3.8%</li>
            <li><b>Total: 37.1%</b></li>
          </ul>
          <p style={{ fontSize:12, color:'var(--text-dim)' }}>Note: Tax is on gain above your cost basis. This calculator assumes full value is taxable for simplicity.</p>

          <div style={{ fontWeight:600, color:'var(--text)', fontSize:14, marginBottom:8, marginTop:16 }}>🟠 RSUs (20,200 shares)</div>
          <p><b>Value</b> = Share Price × 20,200</p>
          <p>RSUs are taxed as ordinary income upon vesting:</p>
          <ul style={{ paddingLeft:20, margin:'4px 0 12px' }}>
            <li>Federal: 37% + California: 13.3% + FICA/Medicare: 2.35%</li>
            <li><b>Total: 52.65%</b></li>
          </ul>

          <div style={{ fontWeight:600, color:'var(--text)', fontSize:14, marginBottom:8, marginTop:16 }}>⚠️ Important Notes</div>
          <ul style={{ paddingLeft:20, margin:'4px 0' }}>
            <li>Rates use 2026 top marginal brackets (CA doesn't have preferential LTCG rates)</li>
            <li>Actual tax depends on total income, deductions, and AMT exposure</li>
            <li>Options may trigger AMT (Alternative Minimum Tax) if exercised but not sold</li>
            <li>These are estimates — consult a CPA for your specific situation</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

function Calculator() {
  const [price, setPrice] = useState(DEFAULTS.fmv)
  const [d, setD] = useState(DEFAULTS)
  const [showInfo, setShowInfo] = useState(false)

  const optGross = Math.max(0, price - d.strike) * d.options
  const comGross = price * d.common
  const rsuGross = price * d.rsus
  const totalGross = optGross + comGross + rsuGross

  const optTaxST = optGross * totalRate(TAX.shortTerm)
  const optTaxLT = optGross * totalRate(TAX.longTerm)
  const comTax = comGross * totalRate(TAX.longTerm)
  const rsuTax = rsuGross * totalRate(TAX.shortTerm)

  const totalTaxST = optTaxST + comTax + rsuTax
  const totalTaxLT = optTaxLT + comTax + rsuTax

  const Section = ({ title, icon, children }) => (
    <div style={{ background:'var(--surface)', borderRadius:16, padding:'16px 20px', border:'1px solid var(--border)' }}>
      <div style={{ fontSize:13, fontWeight:600, color:'var(--text-dim)', marginBottom:10, textTransform:'uppercase', letterSpacing:1 }}>
        {icon} {title}
      </div>
      {children}
    </div>
  )

  const Row = ({ label, gross, tax, color }) => (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 0', borderBottom:'1px solid var(--border)' }}>
      <span style={{ fontSize:14, color:'var(--text-dim)' }}>{label}</span>
      <div style={{ textAlign:'right' }}>
        <span style={{ fontSize:16, fontWeight:600, color }}>{fmt(gross)}</span>
        <span style={{ fontSize:12, color:'var(--text-dim)', marginLeft:8 }}>tax: {fmt(tax)}</span>
        <span style={{ fontSize:12, color:'var(--green)', marginLeft:8 }}>net: {fmt(gross - tax)}</span>
      </div>
    </div>
  )

  const TaxRow = ({ label, rates }) => (
    <div style={{ display:'flex', justifyContent:'space-between', padding:'4px 0', fontSize:13 }}>
      <span style={{ color:'var(--text-dim)' }}>{label}</span>
      <span>Fed {(rates.federal*100).toFixed(0)}% + CA {(rates.state*100).toFixed(1)}% + {rates.fica > 0 ? `FICA ${(rates.fica*100).toFixed(1)}%` : `NIIT ${(rates.niit*100).toFixed(1)}%`} = <b>{(totalRate(rates)*100).toFixed(1)}%</b></span>
    </div>
  )

  return (
    <div style={{ maxWidth:720, margin:'0 auto', padding:'20px 16px' }}>
      {/* Header */}
      <div style={{ textAlign:'center', marginBottom:8 }}>
        <div style={{ fontSize:13, color:'var(--text-dim)', fontWeight:500, letterSpacing:2, textTransform:'uppercase' }}>Total Package Value</div>
        <div style={{ fontSize:56, fontWeight:800, color:'var(--green)', lineHeight:1.1, marginTop:4 }}>{fmtFull(totalGross)}</div>
        <div style={{ fontSize:14, color:'var(--text-dim)', marginTop:4 }}>
          at <b style={{ color:'var(--text)' }}>${price.toFixed(2)}</b>/share
        </div>
        <div style={{ fontSize:13, color:'var(--text-dim)', marginTop:4 }}>
          Company Valuation: <b style={{ color:'var(--text)' }}>${(price * SHARES_OUTSTANDING / 1e9).toFixed(2)}B</b>
        </div>
      </div>

      {/* Slider */}
      <div style={{ margin:'16px 0 24px', padding:'0 4px' }}>
        <input
          type="range" min="0" max="200" step="0.5" value={price}
          onChange={e => setPrice(+e.target.value)}
          style={{ width:'100%', height:8, accentColor:'var(--green)', cursor:'pointer' }}
        />
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'var(--text-dim)' }}>
          <span>$0</span><span>$50</span><span>$100</span><span>$150</span><span>$200</span>
        </div>
      </div>

      {/* Breakdown */}
      <Section title="Equity Breakdown" icon="📊">
        <Row label={`Options (${d.options.toLocaleString()} × $${d.strike})`} gross={optGross} tax={optTaxST} color="var(--blue)" />
        <Row label={`Common Stock (${d.common.toLocaleString()} shares)`} gross={comGross} tax={comTax} color="var(--purple)" />
        <Row label={`RSUs (${d.rsus.toLocaleString()} shares)`} gross={rsuGross} tax={rsuTax} color="var(--orange)" />
      </Section>

      <div style={{ height:12 }} />

      {/* Tax */}
      {showInfo && <TaxInfoModal onClose={() => setShowInfo(false)} />}
      <div style={{ position:'relative' }}>
      <Section title="Tax Summary (California 2026)" icon="🏛️">
        <button onClick={() => setShowInfo(true)} style={{
          position:'absolute', top:14, right:16, background:'var(--border)', border:'none',
          borderRadius:'50%', width:26, height:26, fontSize:14, cursor:'pointer', color:'var(--text)',
          display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700
        }}>ⓘ</button>
        <TaxRow label="Options / RSUs (short-term)" rates={TAX.shortTerm} />
        <TaxRow label="Common / Options held >1yr (LTCG)" rates={TAX.longTerm} />
        <div style={{ borderTop:'1px solid var(--border)', marginTop:12, paddingTop:12 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
            <span style={{ fontWeight:600 }}>Scenario: Options as Short-Term</span>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:14 }}>
            <span style={{ color:'var(--text-dim)' }}>Gross</span><span>{fmt(totalGross)}</span>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:14 }}>
            <span style={{ color:'var(--red)' }}>Est. Tax</span><span style={{ color:'var(--red)' }}>−{fmt(totalTaxST)}</span>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:18, fontWeight:700, marginTop:4, paddingTop:8, borderTop:'1px solid var(--border)' }}>
            <span style={{ color:'var(--green)' }}>Net</span><span style={{ color:'var(--green)' }}>{fmt(totalGross - totalTaxST)}</span>
          </div>

          <div style={{ display:'flex', justifyContent:'space-between', marginTop:16, marginBottom:4 }}>
            <span style={{ fontWeight:600 }}>Scenario: Options as Long-Term</span>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:14 }}>
            <span style={{ color:'var(--text-dim)' }}>Gross</span><span>{fmt(totalGross)}</span>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:14 }}>
            <span style={{ color:'var(--red)' }}>Est. Tax</span><span style={{ color:'var(--red)' }}>−{fmt(totalTaxLT)}</span>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:18, fontWeight:700, marginTop:4, paddingTop:8, borderTop:'1px solid var(--border)' }}>
            <span style={{ color:'var(--green)' }}>Net</span><span style={{ color:'var(--green)' }}>{fmt(totalGross - totalTaxLT)}</span>
          </div>
        </div>
      </Section>
      </div>

      <div style={{ textAlign:'center', fontSize:11, color:'var(--text-dim)', marginTop:16, opacity:0.5 }}>
        Estimates only. Consult a tax professional.
      </div>
    </div>
  )
}

// ─── Financial Plan Tab ───

function PlanTab() {
  const [open, setOpen] = useState(null)
  const toggle = (i) => setOpen(open === i ? null : i)

  const s = {
    card: { background:'var(--surface)', borderRadius:16, padding:'20px', border:'1px solid var(--border)', marginBottom:12 },
    h2: { fontSize:18, fontWeight:700, marginBottom:12 },
    h3: { fontSize:15, fontWeight:700, marginBottom:8, marginTop:16 },
    p: { fontSize:13, lineHeight:1.7, color:'var(--text-dim)', marginBottom:8 },
    ul: { fontSize:13, lineHeight:1.8, color:'var(--text-dim)', paddingLeft:20, marginBottom:12 },
    badge: (color) => ({ display:'inline-block', fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:20, background:color, color:'#000', marginRight:8 }),
    risk: { fontSize:12, padding:'10px 14px', background:'rgba(255,107,107,0.1)', borderRadius:10, border:'1px solid rgba(255,107,107,0.2)', marginTop:8, marginBottom:8 },
    action: { fontSize:12, padding:'10px 14px', background:'rgba(0,230,118,0.08)', borderRadius:10, border:'1px solid rgba(0,230,118,0.2)', marginTop:8, marginBottom:8 },
    scenarioHeader: (isOpen) => ({
      display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer',
      padding:'16px 20px', background:'var(--surface)', borderRadius:isOpen ? '16px 16px 0 0' : 16,
      border:'1px solid var(--border)', userSelect:'none'
    }),
    scenarioBody: { padding:'0 20px 20px', background:'var(--surface)', borderRadius:'0 0 16px 16px',
      borderLeft:'1px solid var(--border)', borderRight:'1px solid var(--border)', borderBottom:'1px solid var(--border)' },
  }

  const scenarios = [
    {
      title: '📉 Scenario 1: Flat ($20–$30)',
      subtitle: 'Company stays pre-IPO, no liquidity event',
      color: 'var(--orange)',
      content: () => (
        <>
          <div style={s.card}>
            <div style={s.h3}>💰 Your Equity (Paper Value)</div>
            <table style={{ width:'100%', fontSize:13, borderCollapse:'collapse' }}>
              <thead><tr style={{ borderBottom:'1px solid var(--border)' }}>
                <th style={{ textAlign:'left', padding:'6px 0', color:'var(--text-dim)' }}>Asset</th>
                <th style={{ textAlign:'right', padding:'6px 0', color:'var(--text-dim)' }}>@ $20</th>
                <th style={{ textAlign:'right', padding:'6px 0', color:'var(--text-dim)' }}>@ $30</th>
              </tr></thead>
              <tbody>
                <tr><td style={{ padding:'6px 0' }}>NSO Options (46,040)</td><td style={{ textAlign:'right' }}>{fmt(16.033*46040)}</td><td style={{ textAlign:'right' }}>{fmt(26.033*46040)}</td></tr>
                <tr><td style={{ padding:'6px 0' }}>Common Stock (24,770)</td><td style={{ textAlign:'right' }}>{fmt(20*24770)}</td><td style={{ textAlign:'right' }}>{fmt(30*24770)}</td></tr>
                <tr><td style={{ padding:'6px 0' }}>RSUs (20,200)</td><td style={{ textAlign:'right' }}>{fmt(20*20200)}</td><td style={{ textAlign:'right' }}>{fmt(30*20200)}</td></tr>
                <tr style={{ borderTop:'2px solid var(--border)', fontWeight:700 }}><td style={{ padding:'8px 0' }}>Total Gross</td><td style={{ textAlign:'right', color:'var(--green)' }}>{fmt(16.033*46040+20*24770+20*20200)}</td><td style={{ textAlign:'right', color:'var(--green)' }}>{fmt(26.033*46040+30*24770+30*20200)}</td></tr>
              </tbody>
            </table>
          </div>

          <div style={s.h3}>🎯 Action Plan</div>
          <div style={s.action}>
            <b>DO NOT exercise options.</b> NSOs = the spread is taxed as ordinary income (52.65%) at exercise regardless. You'd owe taxes on illiquid shares you can't sell. Keep your $200K in savings.
          </div>
          <ul style={s.ul}>
            <li><b>RSUs:</b> Sell as they vest (auto-taxed, no choice). Bank the after-tax cash.</li>
            <li><b>Common stock:</b> Hold — already LTCG, best tax rate. No rush since no liquidity anyway.</li>
            <li><b>Options:</b> Wait for a liquidity event. Do NOT early exercise NSOs.</li>
            <li><b>Savings ($200K):</b> Keep in HYSA at 4-5%. This is your safety net.</li>
            <li><b>Salary ($265K):</b> Max 401K ($23K), backdoor Roth ($7K), HSA if eligible. Save $3-4K/month extra.</li>
            <li><b>Zany's loans:</b> Stay on IDR, minimum payments. PSLF clock keeps ticking.</li>
          </ul>

          <div style={s.h3}>⚠️ Risks</div>
          <div style={s.risk}>
            <ul style={{ ...s.ul, color:'var(--red)', marginBottom:0 }}>
              <li><b>Liquidity risk:</b> Pre-IPO stock = paper money. Could be years before you can sell.</li>
              <li><b>Down-round risk:</b> Company could raise at lower valuation, diluting your shares.</li>
              <li><b>409A risk:</b> FMV could drop, making options less valuable.</li>
              <li><b>Concentration risk:</b> ~$2M in one private company with $0 diversification.</li>
              <li><b>Rent burn:</b> $84K/year in rent with no equity building. 2-3 years = $168-252K gone.</li>
            </ul>
          </div>

          <div style={s.h3}>🏠 Life Decisions</div>
          <ul style={s.ul}>
            <li><b>Housing:</b> Consider moving somewhere cheaper if remote-friendly. $7K/month rent is brutal on a single income when equity is illiquid.</li>
            <li><b>Wedding (Oct 2026):</b> Budget from salary + savings. Don't count on equity.</li>
            <li><b>Emergency fund:</b> Keep 6 months ($42K minimum) untouched.</li>
          </ul>
        </>
      )
    },
    {
      title: '📈 Scenario 2: IPO at $45–$60',
      subtitle: 'Successful IPO, stock doubles or triples',
      color: 'var(--green)',
      content: () => (
        <>
          <div style={s.card}>
            <div style={s.h3}>💰 Net After Tax (Cashless Exercise)</div>
            <p style={s.p}>NSOs: Spread taxed at 52.65% (ordinary income). Common: 37.1% (LTCG). RSUs: 52.65% at vest.</p>
            <table style={{ width:'100%', fontSize:13, borderCollapse:'collapse' }}>
              <thead><tr style={{ borderBottom:'1px solid var(--border)' }}>
                <th style={{ textAlign:'left', padding:'6px 0', color:'var(--text-dim)' }}>Asset</th>
                <th style={{ textAlign:'right', padding:'6px 0', color:'var(--text-dim)' }}>@ $45</th>
                <th style={{ textAlign:'right', padding:'6px 0', color:'var(--text-dim)' }}>@ $60</th>
              </tr></thead>
              <tbody>
                <tr><td style={{ padding:'6px 0' }}>NSO Options (net)</td><td style={{ textAlign:'right' }}>{fmt(41.033*46040*(1-0.5265))}</td><td style={{ textAlign:'right' }}>{fmt(56.033*46040*(1-0.5265))}</td></tr>
                <tr><td style={{ padding:'6px 0' }}>Common Stock (net)</td><td style={{ textAlign:'right' }}>{fmt(45*24770*(1-0.371))}</td><td style={{ textAlign:'right' }}>{fmt(60*24770*(1-0.371))}</td></tr>
                <tr><td style={{ padding:'6px 0' }}>RSUs (net)</td><td style={{ textAlign:'right' }}>{fmt(45*20200*(1-0.5265))}</td><td style={{ textAlign:'right' }}>{fmt(60*20200*(1-0.5265))}</td></tr>
                <tr style={{ borderTop:'2px solid var(--border)', fontWeight:700 }}><td style={{ padding:'8px 0' }}>Total Net</td>
                  <td style={{ textAlign:'right', color:'var(--green)' }}>{fmt(41.033*46040*(1-0.5265)+45*24770*(1-0.371)+45*20200*(1-0.5265))}</td>
                  <td style={{ textAlign:'right', color:'var(--green)' }}>{fmt(56.033*46040*(1-0.5265)+60*24770*(1-0.371)+60*20200*(1-0.5265))}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={s.h3}>🎯 Action Plan: Sell 50% in Tranches</div>
          <div style={s.action}>
            <b>Don't sell everything at once.</b> Sell in 2-3 tranches over 6-12 months post-IPO (after lockup expires, typically 90-180 days).
          </div>

          <div style={s.card}>
            <div style={{ fontSize:13, fontWeight:600, marginBottom:8 }}>Recommended Sell Schedule</div>
            <table style={{ width:'100%', fontSize:12, borderCollapse:'collapse' }}>
              <thead><tr style={{ borderBottom:'1px solid var(--border)' }}>
                <th style={{ textAlign:'left', padding:'6px 0', color:'var(--text-dim)' }}>When</th>
                <th style={{ textAlign:'left', padding:'6px 0', color:'var(--text-dim)' }}>What</th>
                <th style={{ textAlign:'left', padding:'6px 0', color:'var(--text-dim)' }}>Why</th>
              </tr></thead>
              <tbody style={{ color:'var(--text-dim)' }}>
                <tr><td style={{ padding:'6px 0' }}>Lockup expiry</td><td>All RSUs + 30% options</td><td>RSUs already taxed at vest. Lock in gains.</td></tr>
                <tr><td style={{ padding:'6px 0' }}>+3 months</td><td>30% common stock</td><td>Best tax rate (LTCG). Use for house down payment.</td></tr>
                <tr><td style={{ padding:'6px 0' }}>+6 months</td><td>20% more options</td><td>If stock holds or rises, take more off table.</td></tr>
                <tr><td style={{ padding:'6px 0' }}>Hold</td><td>50% remaining</td><td>Let winners run. You're 33, you can afford risk.</td></tr>
              </tbody>
            </table>
          </div>

          <div style={s.h3}>💵 What To Do With ~$1M–$1.5M Net</div>
          <div style={s.card}>
            <table style={{ width:'100%', fontSize:13, borderCollapse:'collapse' }}>
              <tbody>
                <tr style={{ borderBottom:'1px solid var(--border)' }}><td style={{ padding:'8px 0' }}>🏠 <b>House down payment</b></td><td style={{ textAlign:'right' }}>$300K</td><td style={{ textAlign:'right', color:'var(--text-dim)', fontSize:12 }}>Stop burning $84K/yr in rent. Build real equity.</td></tr>
                <tr style={{ borderBottom:'1px solid var(--border)' }}><td style={{ padding:'8px 0' }}>💍 <b>Wedding + emergency fund</b></td><td style={{ textAlign:'right' }}>$100K</td><td style={{ textAlign:'right', color:'var(--text-dim)', fontSize:12 }}>Oct 2026 wedding. 6-month buffer.</td></tr>
                <tr style={{ borderBottom:'1px solid var(--border)' }}><td style={{ padding:'8px 0' }}>📈 <b>Index funds (VTI/VXUS)</b></td><td style={{ textAlign:'right' }}>$400K</td><td style={{ textAlign:'right', color:'var(--text-dim)', fontSize:12 }}>Diversify. 60/40 US/international.</td></tr>
                <tr style={{ borderBottom:'1px solid var(--border)' }}><td style={{ padding:'8px 0' }}>🏦 <b>Tax-advantaged accounts</b></td><td style={{ textAlign:'right' }}>$50K</td><td style={{ textAlign:'right', color:'var(--text-dim)', fontSize:12 }}>Max 401K + Roth + HSA for both of you.</td></tr>
                <tr><td style={{ padding:'8px 0' }}>💰 <b>HYSA buffer</b></td><td style={{ textAlign:'right' }}>$150K</td><td style={{ textAlign:'right', color:'var(--text-dim)', fontSize:12 }}>Sleep-at-night money. 4-5% risk free.</td></tr>
              </tbody>
            </table>
          </div>

          <div style={s.h3}>⚠️ Risks</div>
          <div style={s.risk}>
            <ul style={{ ...s.ul, color:'var(--red)', marginBottom:0 }}>
              <li><b>IPO lockup:</b> Can't sell for 90-180 days. Stock could drop before you can exit.</li>
              <li><b>Post-IPO crash:</b> Many tech IPOs drop 30-50% in first year.</li>
              <li><b>Tax timing:</b> RSUs taxed at vest price — if stock drops after, you paid tax on gains you lost.</li>
              <li><b>FOMO risk:</b> Don't hold 100% waiting for higher. Take profits.</li>
            </ul>
          </div>

          <div style={s.h3}>🚫 Do NOT</div>
          <ul style={s.ul}>
            <li><b>Pay off Zany's $240K loans.</b> PSLF = tax-free forgiveness. Paying is literally burning money.</li>
            <li><b>Buy a luxury car.</b> Depreciating asset. You're building wealth, not spending it.</li>
            <li><b>Quit your job immediately.</b> Wait 12+ months post-IPO to see if stock holds.</li>
          </ul>
        </>
      )
    },
    {
      title: '🚀 Scenario 3: Moon $100–$150+',
      subtitle: 'Massive IPO, 5-7x from current FMV',
      color: '#ab47bc',
      content: () => (
        <>
          <div style={s.card}>
            <div style={s.h3}>💰 Net After Tax</div>
            <table style={{ width:'100%', fontSize:13, borderCollapse:'collapse' }}>
              <thead><tr style={{ borderBottom:'1px solid var(--border)' }}>
                <th style={{ textAlign:'left', padding:'6px 0', color:'var(--text-dim)' }}>Asset</th>
                <th style={{ textAlign:'right', padding:'6px 0', color:'var(--text-dim)' }}>@ $100</th>
                <th style={{ textAlign:'right', padding:'6px 0', color:'var(--text-dim)' }}>@ $150</th>
              </tr></thead>
              <tbody>
                <tr><td style={{ padding:'6px 0' }}>NSO Options (net)</td><td style={{ textAlign:'right' }}>{fmt(96.033*46040*(1-0.5265))}</td><td style={{ textAlign:'right' }}>{fmt(146.033*46040*(1-0.5265))}</td></tr>
                <tr><td style={{ padding:'6px 0' }}>Common Stock (net)</td><td style={{ textAlign:'right' }}>{fmt(100*24770*(1-0.371))}</td><td style={{ textAlign:'right' }}>{fmt(150*24770*(1-0.371))}</td></tr>
                <tr><td style={{ padding:'6px 0' }}>RSUs (net)</td><td style={{ textAlign:'right' }}>{fmt(100*20200*(1-0.5265))}</td><td style={{ textAlign:'right' }}>{fmt(150*20200*(1-0.5265))}</td></tr>
                <tr style={{ borderTop:'2px solid var(--border)', fontWeight:700 }}><td style={{ padding:'8px 0' }}>Total Net</td>
                  <td style={{ textAlign:'right', color:'var(--green)' }}>{fmt(96.033*46040*(1-0.5265)+100*24770*(1-0.371)+100*20200*(1-0.5265))}</td>
                  <td style={{ textAlign:'right', color:'var(--green)' }}>{fmt(146.033*46040*(1-0.5265)+150*24770*(1-0.371)+150*20200*(1-0.5265))}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={s.h3}>🎯 Action Plan: Sell 70-80%. This Is Generational.</div>
          <div style={s.action}>
            <b>This is life-changing money. Protect it aggressively.</b> Concentration in one stock has destroyed more wealth than any bear market. Enron, WeWork, Theranos — employees who held lost everything.
          </div>

          <div style={s.card}>
            <div style={{ fontSize:13, fontWeight:600, marginBottom:8 }}>Sell Schedule</div>
            <table style={{ width:'100%', fontSize:12, borderCollapse:'collapse' }}>
              <tbody style={{ color:'var(--text-dim)' }}>
                <tr style={{ borderBottom:'1px solid var(--border)' }}><td style={{ padding:'6px 0' }}>Lockup expiry</td><td>All RSUs + 50% options</td><td>Lock in the bag immediately.</td></tr>
                <tr style={{ borderBottom:'1px solid var(--border)' }}><td style={{ padding:'6px 0' }}>+2 months</td><td>60% common stock</td><td>LTCG rate. Big chunk for house + investments.</td></tr>
                <tr style={{ borderBottom:'1px solid var(--border)' }}><td style={{ padding:'6px 0' }}>+4 months</td><td>Remaining options</td><td>Don't get greedy. Take the win.</td></tr>
                <tr><td style={{ padding:'6px 0' }}>Hold forever</td><td>20-30% common</td><td>Moon bag. Already LTCG. Let it ride.</td></tr>
              </tbody>
            </table>
          </div>

          <div style={s.h3}>💵 What To Do With $4M–$7M Net</div>
          <div style={s.card}>
            <table style={{ width:'100%', fontSize:13, borderCollapse:'collapse' }}>
              <tbody>
                <tr style={{ borderBottom:'1px solid var(--border)' }}><td style={{ padding:'8px 0' }}>🏠 <b>Buy a home (cash or 50% down)</b></td><td style={{ textAlign:'right' }}>$1.5–2M</td><td style={{ textAlign:'right', color:'var(--text-dim)', fontSize:12 }}>No mortgage = ultimate freedom. Bay Area house with a yard for the Lab 🐕</td></tr>
                <tr style={{ borderBottom:'1px solid var(--border)' }}><td style={{ padding:'8px 0' }}>📈 <b>Index funds</b></td><td style={{ textAlign:'right' }}>$2M</td><td style={{ textAlign:'right', color:'var(--text-dim)', fontSize:12 }}>~$160K/yr passive at 8%. Financial independence.</td></tr>
                <tr style={{ borderBottom:'1px solid var(--border)' }}><td style={{ padding:'8px 0' }}>🏘️ <b>Rental property</b></td><td style={{ textAlign:'right' }}>$500K</td><td style={{ textAlign:'right', color:'var(--text-dim)', fontSize:12 }}>Passive income + tax benefits (depreciation).</td></tr>
                <tr style={{ borderBottom:'1px solid var(--border)' }}><td style={{ padding:'8px 0' }}>🏦 <b>Tax-advantaged + 529</b></td><td style={{ textAlign:'right' }}>$500K</td><td style={{ textAlign:'right', color:'var(--text-dim)', fontSize:12 }}>Max everything. 529 if kids are planned.</td></tr>
                <tr style={{ borderBottom:'1px solid var(--border)' }}><td style={{ padding:'8px 0' }}>🎉 <b>Fun money</b></td><td style={{ textAlign:'right' }}>$200K</td><td style={{ textAlign:'right', color:'var(--text-dim)', fontSize:12 }}>You earned it. Travel, car, experiences.</td></tr>
                <tr><td style={{ padding:'8px 0' }}>💰 <b>T-bills + HYSA</b></td><td style={{ textAlign:'right' }}>$500K–1M</td><td style={{ textAlign:'right', color:'var(--text-dim)', fontSize:12 }}>Sleep-at-night cash. 2+ years of expenses.</td></tr>
              </tbody>
            </table>
          </div>

          <div style={s.h3}>👩‍⚕️ Zany's Situation</div>
          <div style={s.card}>
            <p style={s.p}>At this level, you could pay off her $240K tomorrow and not blink. <b>But should you?</b></p>
            <ul style={s.ul}>
              <li><b>If she loves healthcare:</b> Keep PSLF. $240K forgiven tax-free in 10 years. Invest the $240K instead → worth ~$520K in 10 years at 8%.</li>
              <li><b>If she's burning out:</b> Pay it off. Give her freedom to switch careers, go part-time, or take a break. Your $5M+ portfolio can handle it. Her happiness &gt; $240K optimization.</li>
              <li><b>The question to ask her:</b> "If the loans didn't exist, would you still want this job?"</li>
            </ul>
          </div>

          <div style={s.h3}>⚠️ Risks</div>
          <div style={s.risk}>
            <ul style={{ ...s.ul, color:'var(--red)', marginBottom:0 }}>
              <li><b>Lifestyle inflation:</b> #1 wealth killer. Keep living on your salary. Invest the windfall.</li>
              <li><b>Tax bill shock:</b> At $100/share, you'd owe ~$2.5M in taxes. Set aside cash BEFORE spending.</li>
              <li><b>"Friends" and family:</b> Money changes relationships. Be private about your windfall.</li>
              <li><b>Holding too long:</b> Greed kills. "I'll sell at $200" → stock drops to $40. Take the win.</li>
            </ul>
          </div>

          <div style={s.h3}>🤝 Hire Professionals</div>
          <ul style={s.ul}>
            <li><b>Fee-only fiduciary financial advisor</b> (not commission-based). Look for CFP designation.</li>
            <li><b>CPA specializing in equity comp</b> — tax strategy at this level saves $200K+.</li>
            <li><b>Estate planning attorney</b> — trusts, wills, beneficiary designations.</li>
          </ul>
        </>
      )
    }
  ]

  return (
    <div style={{ maxWidth:720, margin:'0 auto', padding:'20px 16px' }}>
      <div style={{ textAlign:'center', marginBottom:24 }}>
        <div style={{ fontSize:28, fontWeight:800 }}>📋 Financial Plan</div>
        <p style={{ fontSize:13, color:'var(--text-dim)', marginTop:8 }}>
          33yo · $265K salary · $200K savings · NSO options (pre-IPO) · CA resident
        </p>
      </div>

      {/* Snapshot */}
      <div style={{ background:'var(--surface)', borderRadius:16, padding:'16px 20px', border:'1px solid var(--border)', marginBottom:16 }}>
        <div style={{ fontSize:13, fontWeight:600, color:'var(--text-dim)', marginBottom:10, textTransform:'uppercase', letterSpacing:1 }}>📊 Your Snapshot</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, fontSize:13 }}>
          <div>Salary: <b>$265K/yr</b></div>
          <div>Your Savings: <b>$200K</b></div>
          <div>Rent: <b>$7K/mo ($84K/yr)</b></div>
          <div>Her Savings: <b>$60K</b></div>
          <div>Her Debt: <b style={{ color:'var(--red)' }}>$240K</b> <span style={{ fontSize:11, color:'var(--text-dim)' }}>(PSLF eligible)</span></div>
          <div>Options: <b>NSO</b> <span style={{ fontSize:11, color:'var(--text-dim)' }}>(pre-IPO)</span></div>
        </div>
      </div>

      {/* Key Rules */}
      <div style={{ background:'var(--surface)', borderRadius:16, padding:'16px 20px', border:'1px solid var(--border)', marginBottom:16 }}>
        <div style={{ fontSize:13, fontWeight:600, color:'var(--text-dim)', marginBottom:10, textTransform:'uppercase', letterSpacing:1 }}>🔑 Universal Rules</div>
        <ul style={{ fontSize:13, lineHeight:1.8, color:'var(--text-dim)', paddingLeft:20, marginBottom:0 }}>
          <li><b>NSOs:</b> Spread always taxed as ordinary income (52.65%). No benefit to early exercise.</li>
          <li><b>Don't sell all at once.</b> Sell in tranches to average exit price.</li>
          <li><b>Don't pay Zany's $240K loans</b> unless she wants out of healthcare. PSLF = free money.</li>
          <li><b>Common stock is your best tax asset</b> (LTCG 37.1%). Sell last.</li>
          <li><b>Max tax-advantaged accounts every year</b> — 401K + Roth + HSA.</li>
          <li><b>Keep 6 months expenses liquid</b> ($42K minimum).</li>
        </ul>
      </div>

      {/* Scenarios */}
      <div style={{ fontSize:13, fontWeight:600, color:'var(--text-dim)', marginBottom:10, textTransform:'uppercase', letterSpacing:1 }}>📈 Scenarios (tap to expand)</div>
      {scenarios.map((sc, i) => (
        <div key={i} style={{ marginBottom:8 }}>
          <div style={s.scenarioHeader(open === i)} onClick={() => toggle(i)}>
            <div>
              <div style={{ fontSize:16, fontWeight:700 }}>{sc.title}</div>
              <div style={{ fontSize:12, color:'var(--text-dim)', marginTop:2 }}>{sc.subtitle}</div>
            </div>
            <div style={{ fontSize:20, color:'var(--text-dim)' }}>{open === i ? '▾' : '▸'}</div>
          </div>
          {open === i && <div style={s.scenarioBody}>{sc.content()}</div>}
        </div>
      ))}

      <div style={{ textAlign:'center', fontSize:11, color:'var(--text-dim)', marginTop:16, opacity:0.5 }}>
        Not financial advice. Consult a fee-only fiduciary advisor and CPA.
      </div>
    </div>
  )
}

// ─── Main App ───

export default function App() {
  const [auth, setAuth] = useState(sessionStorage.getItem('eq_auth') === '1')
  const [tab, setTab] = useState('calculator')
  if (!auth) return <PasswordGate onUnlock={() => setAuth(true)} />

  const tabStyle = (t) => ({
    flex:1, padding:'10px', border:'none', fontSize:13, fontWeight:600, cursor:'pointer',
    background: tab === t ? 'var(--green)' : 'var(--surface)',
    color: tab === t ? '#000' : 'var(--text-dim)',
    borderRadius: t === 'calculator' ? '12px 0 0 12px' : '0 12px 12px 0',
    fontFamily:'Inter, sans-serif'
  })

  return (
    <div>
      <div style={{ maxWidth:720, margin:'0 auto', padding:'16px 16px 0' }}>
        <div style={{ display:'flex', marginBottom:8 }}>
          <button style={tabStyle('calculator')} onClick={() => setTab('calculator')}>💰 Calculator</button>
          <button style={tabStyle('plan')} onClick={() => setTab('plan')}>📋 Plan</button>
        </div>
      </div>
      {tab === 'calculator' ? <Calculator /> : <PlanTab />}
    </div>
  )
}
