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

export default function App() {
  const [auth, setAuth] = useState(sessionStorage.getItem('eq_auth') === '1')
  if (!auth) return <PasswordGate onUnlock={() => setAuth(true)} />
  return <Calculator />
}
