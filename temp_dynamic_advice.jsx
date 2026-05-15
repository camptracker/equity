function DynamicAdvice({ price, optGross, comGross, rsuGross, totalGross, totalTaxST, ltcgOptions, ltcgCommon, ltcgRSUs, d }) {
  const netTotal = totalGross - totalTaxST
  const stRate = 0.5265
  const ltRate = 0.371

  // Helper to calculate tier-based sell amounts with LTCG split
  const calcTierSplit = (total, tierSellPct, ltcgSliderValue) => {
    const tierSellCount = Math.round(total * tierSellPct)
    const tierHoldCount = total - tierSellCount
    const ltcgRatio = total > 0 ? ltcgSliderValue / total : 0
    const soldAtLTCG = Math.round(tierSellCount * ltcgRatio)
    const soldAtST = tierSellCount - soldAtLTCG
    return { tierSellCount, tierHoldCount, soldAtLTCG, soldAtST }
  }

  const getAdvice = () => {
    const optSpread = Math.max(0, price - d.strike)
    
    // Tier sell percentages
    // Underwater (<$5): Options 0%, Common 0%, RSUs 100%
    // Conservative ($5-25): Options 20%, Common 0%, RSUs 100%
    // Tranches ($25-50): Options 40%, Common 30%, RSUs 100%
    // Major ($50-100): Options 70%, Common 50%, RSUs 100%
    // Generational ($100+): Options 90%, Common 70%, RSUs 100%
    
    if (price < 5) {
      const optSplit = calcTierSplit(d.options, 0, ltcgOptions)
      const comSplit = calcTierSplit(d.common, 0, ltcgCommon)
      const rsuSplit = calcTierSplit(d.rsus, 1.0, ltcgRSUs)
      
      const liquidateRows = []
      liquidateRows.push({ 
        action: `Options — Don't exercise (hold all ${d.options.toLocaleString()})`, 
        advice: 'Not worth exercising near/below strike. Wait for liquidity event.' 
      })
      liquidateRows.push({ 
        action: `Common Stock — Hold (${d.common.toLocaleString()} shares)`, 
        advice: `Worth ${fmt(price*d.common)} gross — hold unless emergency.` 
      })
      
      const rsuNetST = rsuSplit.soldAtST * price * (1 - stRate)
      const rsuNetLT = rsuSplit.soldAtLTCG * price * (1 - ltRate)
      let rsuParts = []
      if (rsuSplit.soldAtST > 0) rsuParts.push(`${rsuSplit.soldAtST.toLocaleString()} @ vest (ST) → net ${fmt(rsuNetST)}`)
      if (rsuSplit.soldAtLTCG > 0) rsuParts.push(`${rsuSplit.soldAtLTCG.toLocaleString()} held post-vest (LTCG) → net ${fmt(rsuNetLT)}`)
      liquidateRows.push({ 
        action: `RSUs — Sell 100% (${rsuSplit.tierSellCount.toLocaleString()})${rsuParts.length ? '\n  • ' + rsuParts.join('\n  • ') : ''}`, 
        advice: 'Sell as they vest to cover taxes.' 
      })
      
      return {
        emoji: '🔴', label: 'UNDERWATER', color: 'var(--red)',
        summary: 'Your options are near or below strike ($3.97). Equity has minimal value.',
        liquidate: liquidateRows,
        money: [
          { dest: 'Emergency fund', amount: 'Priority #1', why: 'Low equity value means your salary and savings are everything.' },
          { dest: 'Max 401K + Roth', amount: '$30K/yr', why: 'Tax-advantaged growth is your best wealth builder right now.' },
          { dest: 'HYSA', amount: 'Keep $200K liquid', why: 'Don\'t invest savings when equity is uncertain.' },
        ],
        risk: 'Company may not recover. Don\'t make financial plans based on equity at this price.',
        tierSellShares: rsuSplit.tierSellCount,
        tierSellNet: rsuNetST + rsuNetLT
      }
    }

    if (price < 25) {
      const optSplit = calcTierSplit(d.options, 0.20, ltcgOptions)
      const comSplit = calcTierSplit(d.common, 0, ltcgCommon)
      const rsuSplit = calcTierSplit(d.rsus, 1.0, ltcgRSUs)
      
      const liquidateRows = []
      
      // Options
      const optNetCashless = optSplit.soldAtST * optSpread * (1 - stRate)
      const optNetHeld = optSplit.soldAtLTCG * optSpread * (1 - ltRate)
      let optParts = []
      if (optSplit.soldAtST > 0) optParts.push(`${optSplit.soldAtST.toLocaleString()} cashless (ST 52.65%) → net ${fmt(optNetCashless)}`)
      if (optSplit.soldAtLTCG > 0) optParts.push(`${optSplit.soldAtLTCG.toLocaleString()} exercise & hold (LTCG 37.1%) → net ${fmt(optNetHeld)}`)
      if (optSplit.tierHoldCount > 0) optParts.push(`Hold 80% (${optSplit.tierHoldCount.toLocaleString()}) for upside`)
      liquidateRows.push({ 
        action: `Options — Sell 20% (${optSplit.tierSellCount.toLocaleString()})${optParts.length ? '\n  • ' + optParts.join('\n  • ') : ''}`, 
        advice: 'Diversify gradually. Cashless = instant liquidity, exercise & hold = tax savings + upside.' 
      })
      
      // Common
      liquidateRows.push({ 
        action: `Common Stock — Hold 100% (${d.common.toLocaleString()} shares)`, 
        advice: `Best tax treatment (LTCG 37.1%). Save for major purchase (house).` 
      })
      
      // RSUs
      const rsuNetST = rsuSplit.soldAtST * price * (1 - stRate)
      const rsuNetLT = rsuSplit.soldAtLTCG * price * (1 - ltRate)
      let rsuParts = []
      if (rsuSplit.soldAtST > 0) rsuParts.push(`${rsuSplit.soldAtST.toLocaleString()} @ vest (ST) → net ${fmt(rsuNetST)}`)
      if (rsuSplit.soldAtLTCG > 0) rsuParts.push(`${rsuSplit.soldAtLTCG.toLocaleString()} held post-vest (LTCG) → net ${fmt(rsuNetLT)}`)
      liquidateRows.push({ 
        action: `RSUs — Sell 100% (${rsuSplit.tierSellCount.toLocaleString()})${rsuParts.length ? '\n  • ' + rsuParts.join('\n  • ') : ''}`, 
        advice: 'No tax advantage to holding. Sell at vest unless modeling long-term hold.' 
      })
      
      return {
        emoji: '🟡', label: 'CONSERVATIVE START', color: 'var(--orange)',
        summary: `Near current FMV. Total: ${fmt(totalGross)} gross → ~${fmt(netTotal)} net. Start selling selectively.`,
        liquidate: liquidateRows,
        money: [
          { dest: '🏦 Max retirement accounts', amount: '$30K/yr', why: '401K ($23K) + Roth ($7K). Best risk-free move at any price.' },
          { dest: '📈 Index funds (VTI/VXUS)', amount: fmt(rsuNetST + rsuNetLT + optNetCashless + optNetHeld), why: 'RSU + options cash → diversify away from single-stock concentration.' },
          { dest: '💰 HYSA (savings)', amount: '$200K', why: 'Keep your cash buffer intact. Still your safety net.' },
          { dest: '🏠 House fund (building)', amount: 'Start saving', why: 'At $7K/month rent, start earmarking for a down payment. Not yet enough for a big move.' },
        ],
        risk: 'Stock could go lower — selling some now locks in gains. But don\'t over-sell at the floor. Keep upside via sliders.',
        tierSellShares: optSplit.tierSellCount + rsuSplit.tierSellCount,
        tierSellNet: optNetCashless + optNetHeld + rsuNetST + rsuNetLT
      }
    }

    if (price < 50) {
      const optSplit = calcTierSplit(d.options, 0.40, ltcgOptions)
      const comSplit = calcTierSplit(d.common, 0.30, ltcgCommon)
      const rsuSplit = calcTierSplit(d.rsus, 1.0, ltcgRSUs)
      
      const liquidateRows = []
      
      // Options
      const optNetCashless = optSplit.soldAtST * optSpread * (1 - stRate)
      const optNetHeld = optSplit.soldAtLTCG * optSpread * (1 - ltRate)
      let optParts = []
      if (optSplit.soldAtST > 0) optParts.push(`${optSplit.soldAtST.toLocaleString()} cashless (ST 52.65%) → net ${fmt(optNetCashless)}`)
      if (optSplit.soldAtLTCG > 0) optParts.push(`${optSplit.soldAtLTCG.toLocaleString()} exercise & hold (LTCG 37.1%) → net ${fmt(optNetHeld)}`)
      if (optSplit.tierHoldCount > 0) optParts.push(`Hold 60% (${optSplit.tierHoldCount.toLocaleString()}) for upside`)
      liquidateRows.push({ 
        action: `Options — Sell 40% (${optSplit.tierSellCount.toLocaleString()})${optParts.length ? '\n  • ' + optParts.join('\n  • ') : ''}`, 
        advice: 'Solid upside territory. Balance immediate liquidity with tax-efficient holds.' 
      })
      
      // Common
      const comNetLT = comSplit.soldAtLTCG * price * (1 - ltRate)
      const comNetST = comSplit.soldAtST * price * (1 - stRate)
      let comParts = []
      if (comSplit.soldAtLTCG > 0) comParts.push(`${comSplit.soldAtLTCG.toLocaleString()} @ LTCG → net ${fmt(comNetLT)}`)
      if (comSplit.soldAtST > 0) comParts.push(`${comSplit.soldAtST.toLocaleString()} @ ST → net ${fmt(comNetST)}`)
      if (comSplit.tierHoldCount > 0) comParts.push(`Hold 70% (${comSplit.tierHoldCount.toLocaleString()})`)
      liquidateRows.push({ 
        action: `Common Stock — Sell 30% (${comSplit.tierSellCount.toLocaleString()})${comParts.length ? '\n  • ' + comParts.join('\n  • ') : ''}`, 
        advice: `Prime asset for house down payment. Best tax rate (37.1%).` 
      })
      
      // RSUs
      const rsuNetST = rsuSplit.soldAtST * price * (1 - stRate)
      const rsuNetLT = rsuSplit.soldAtLTCG * price * (1 - ltRate)
      let rsuParts = []
      if (rsuSplit.soldAtST > 0) rsuParts.push(`${rsuSplit.soldAtST.toLocaleString()} @ vest (ST) → net ${fmt(rsuNetST)}`)
      if (rsuSplit.soldAtLTCG > 0) rsuParts.push(`${rsuSplit.soldAtLTCG.toLocaleString()} held post-vest (LTCG) → net ${fmt(rsuNetLT)}`)
      liquidateRows.push({ 
        action: `RSUs — Sell 100% (${rsuSplit.tierSellCount.toLocaleString()})${rsuParts.length ? '\n  • ' + rsuParts.join('\n  • ') : ''}`, 
        advice: 'Sell at vest unless holding for LTCG conversion experiment.' 
      })
      
      const totalHold = optSplit.tierHoldCount + comSplit.tierHoldCount + rsuSplit.tierHoldCount
      const totalShares = d.options + d.common + d.rsus
      const holdPct = ((totalHold / totalShares) * 100).toFixed(0)
      
      return {
        emoji: '🟢', label: 'SELL IN TRANCHES', color: 'var(--green)',
        summary: `Solid value at ${fmt(totalGross)} gross → ~${fmt(netTotal)} net. Time to start taking profits. (Holding ${holdPct}% of total shares)`,
        liquidate: liquidateRows,
        money: [
          { dest: '🏠 House down payment', amount: fmt(Math.min(netTotal * 0.3, 400000)), why: 'Stop paying $84K/yr rent. Use LTCG common stock for best tax efficiency.' },
          { dest: '📈 Index funds (VTI/VXUS)', amount: fmt(netTotal * 0.3), why: 'Diversify immediately. 60/40 US/international.' },
          { dest: '💍 Wedding + emergency', amount: '$100K', why: 'Oct 2026 wedding. Keep 6 months expenses liquid.' },
          { dest: '🏦 401K + Roth + HSA', amount: '$30-50K/yr', why: 'Max everything for both of you.' },
          { dest: '💰 HYSA buffer', amount: fmt(Math.min(netTotal * 0.15, 200000)), why: 'Sleep-at-night cash at 4-5%.' },
        ],
        risk: 'Don\'t get greedy waiting for higher. A bird in hand. Post-IPO lockup could trap you if stock drops.',
        tierSellShares: optSplit.tierSellCount + comSplit.tierSellCount + rsuSplit.tierSellCount,
        tierSellNet: optNetCashless + optNetHeld + comNetLT + comNetST + rsuNetST + rsuNetLT
      }
    }

    if (price < 100) {
      const optSplit = calcTierSplit(d.options, 0.70, ltcgOptions)
      const comSplit = calcTierSplit(d.common, 0.50, ltcgCommon)
      const rsuSplit = calcTierSplit(d.rsus, 1.0, ltcgRSUs)
      
      const liquidateRows = []
      
      // Options
      const optNetCashless = optSplit.soldAtST * optSpread * (1 - stRate)
      const optNetHeld = optSplit.soldAtLTCG * optSpread * (1 - ltRate)
      let optParts = []
      if (optSplit.soldAtST > 0) optParts.push(`${optSplit.soldAtST.toLocaleString()} cashless (ST 52.65%) → net ${fmt(optNetCashless)}`)
      if (optSplit.soldAtLTCG > 0) optParts.push(`${optSplit.soldAtLTCG.toLocaleString()} exercise & hold (LTCG 37.1%) → net ${fmt(optNetHeld)}`)
      if (optSplit.tierHoldCount > 0) optParts.push(`Hold 30% (${optSplit.tierHoldCount.toLocaleString()}) for upside`)
      liquidateRows.push({ 
        action: `Options — Sell 70% (${optSplit.tierSellCount.toLocaleString()})${optParts.length ? '\n  • ' + optParts.join('\n  • ') : ''}`, 
        advice: 'Life-changing money. Take most profits now, keep small moon bag.' 
      })
      
      // Common
      const comNetLT = comSplit.soldAtLTCG * price * (1 - ltRate)
      const comNetST = comSplit.soldAtST * price * (1 - stRate)
      let comParts = []
      if (comSplit.soldAtLTCG > 0) comParts.push(`${comSplit.soldAtLTCG.toLocaleString()} @ LTCG → net ${fmt(comNetLT)}`)
      if (comSplit.soldAtST > 0) comParts.push(`${comSplit.soldAtST.toLocaleString()} @ ST → net ${fmt(comNetST)}`)
      if (comSplit.tierHoldCount > 0) comParts.push(`Hold 50% (${comSplit.tierHoldCount.toLocaleString()})`)
      liquidateRows.push({ 
        action: `Common Stock — Sell 50% (${comSplit.tierSellCount.toLocaleString()})${comParts.length ? '\n  • ' + comParts.join('\n  • ') : ''}`, 
        advice: `Diversify aggressively. Enron risk is real.` 
      })
      
      // RSUs
      const rsuNetST = rsuSplit.soldAtST * price * (1 - stRate)
      const rsuNetLT = rsuSplit.soldAtLTCG * price * (1 - ltRate)
      let rsuParts = []
      if (rsuSplit.soldAtST > 0) rsuParts.push(`${rsuSplit.soldAtST.toLocaleString()} @ vest (ST) → net ${fmt(rsuNetST)}`)
      if (rsuSplit.soldAtLTCG > 0) rsuParts.push(`${rsuSplit.soldAtLTCG.toLocaleString()} held post-vest (LTCG) → net ${fmt(rsuNetLT)}`)
      liquidateRows.push({ 
        action: `RSUs — Sell 100% (${rsuSplit.tierSellCount.toLocaleString()})${rsuParts.length ? '\n  • ' + rsuParts.join('\n  • ') : ''}`, 
        advice: 'Sell at vest. Don\'t hold single-stock concentration at this wealth level.' 
      })
      
      const totalHold = optSplit.tierHoldCount + comSplit.tierHoldCount + rsuSplit.tierHoldCount
      const totalShares = d.options + d.common + d.rsus
      const holdPct = ((totalHold / totalShares) * 100).toFixed(0)
      
      return {
        emoji: '🔥', label: 'TAKE MAJOR PROFITS', color: '#ff9800',
        summary: `Life-changing money: ${fmt(totalGross)} gross → ~${fmt(netTotal)} net. Sell majority. (Holding ${holdPct}% of total shares)`,
        liquidate: liquidateRows,
        money: [
          { dest: '🏠 Buy a home', amount: fmt(Math.min(netTotal * 0.25, 600000)), why: 'Big down payment or buy outright. End the $7K/month rent.' },
          { dest: '📈 Index funds', amount: fmt(netTotal * 0.35), why: `${fmt(netTotal * 0.35)} at 8% = ~${fmt(netTotal * 0.35 * 0.08)}/yr passive income.` },
          { dest: '🏘️ Rental property', amount: fmt(Math.min(netTotal * 0.1, 500000)), why: 'Passive income + depreciation tax benefits.' },
          { dest: '🏦 Tax-advantaged', amount: '$50K/yr', why: 'Max 401K, Roth, HSA, consider 529 if kids planned.' },
          { dest: '💰 T-bills + HYSA', amount: fmt(netTotal * 0.15), why: '1-2 years of expenses in risk-free assets.' },
          { dest: '🎉 Enjoy life', amount: fmt(netTotal * 0.05), why: 'You earned it. Travel, experiences, upgrade the Lab\'s life 🐕' },
        ],
        risk: 'Concentration risk is real. Enron, WeWork employees held and lost everything. Diversify aggressively. Set aside tax cash FIRST.',
        tierSellShares: optSplit.tierSellCount + comSplit.tierSellCount + rsuSplit.tierSellCount,
        tierSellNet: optNetCashless + optNetHeld + comNetLT + comNetST + rsuNetST + rsuNetLT
      }
    }

    // $100+ - GENERATIONAL WEALTH
    const optSplit = calcTierSplit(d.options, 0.90, ltcgOptions)
    const comSplit = calcTierSplit(d.common, 0.70, ltcgCommon)
    const rsuSplit = calcTierSplit(d.rsus, 1.0, ltcgRSUs)
    
    const liquidateRows = []
    
    // Options
    const optNetCashless = optSplit.soldAtST * optSpread * (1 - stRate)
    const optNetHeld = optSplit.soldAtLTCG * optSpread * (1 - ltRate)
    let optParts = []
    if (optSplit.soldAtST > 0) optParts.push(`${optSplit.soldAtST.toLocaleString()} cashless (ST 52.65%) → net ${fmt(optNetCashless)}`)
    if (optSplit.soldAtLTCG > 0) optParts.push(`${optSplit.soldAtLTCG.toLocaleString()} exercise & hold (LTCG 37.1%) → net ${fmt(optNetHeld)}`)
    if (optSplit.tierHoldCount > 0) optParts.push(`Hold 10% (${optSplit.tierHoldCount.toLocaleString()}) for upside`)
    liquidateRows.push({ 
      action: `Options — Sell 90% (${optSplit.tierSellCount.toLocaleString()})${optParts.length ? '\n  • ' + optParts.join('\n  • ') : ''}`, 
      advice: 'Generational outcome. Sell vast majority now. Keep tiny moon bag.' 
    })
    
    // Common
    const comNetLT = comSplit.soldAtLTCG * price * (1 - ltRate)
    const comNetST = comSplit.soldAtST * price * (1 - stRate)
    let comParts = []
    if (comSplit.soldAtLTCG > 0) comParts.push(`${comSplit.soldAtLTCG.toLocaleString()} @ LTCG → net ${fmt(comNetLT)}`)
    if (comSplit.soldAtST > 0) comParts.push(`${comSplit.soldAtST.toLocaleString()} @ ST → net ${fmt(comNetST)}`)
    if (comSplit.tierHoldCount > 0) comParts.push(`Hold 30% (${comSplit.tierHoldCount.toLocaleString()})`)
    liquidateRows.push({ 
      action: `Common Stock — Sell 70% (${comSplit.tierSellCount.toLocaleString()})${comParts.length ? '\n  • ' + comParts.join('\n  • ') : ''}`, 
      advice: `Sell most. You already won.` 
    })
    
    // RSUs
    const rsuNetST = rsuSplit.soldAtST * price * (1 - stRate)
    const rsuNetLT = rsuSplit.soldAtLTCG * price * (1 - ltRate)
    let rsuParts = []
    if (rsuSplit.soldAtST > 0) rsuParts.push(`${rsuSplit.soldAtST.toLocaleString()} @ vest (ST) → net ${fmt(rsuNetST)}`)
    if (rsuSplit.soldAtLTCG > 0) rsuParts.push(`${rsuSplit.soldAtLTCG.toLocaleString()} held post-vest (LTCG) → net ${fmt(rsuNetLT)}`)
    liquidateRows.push({ 
      action: `RSUs — Sell 100% (${rsuSplit.tierSellCount.toLocaleString()})${rsuParts.length ? '\n  • ' + rsuParts.join('\n  • ') : ''}`, 
      advice: 'Sell immediately. Never hold single-stock at this wealth.' 
    })
    
    const totalHold = optSplit.tierHoldCount + comSplit.tierHoldCount + rsuSplit.tierHoldCount
    const totalShares = d.options + d.common + d.rsus
    const holdPct = ((totalHold / totalShares) * 100).toFixed(0)
    
    return {
      emoji: '🚀', label: 'GENERATIONAL WEALTH', color: '#ab47bc',
      summary: `${fmt(totalGross)} gross → ~${fmt(netTotal)} net. This changes your family tree. (Holding ${holdPct}% of total shares)`,
      liquidate: liquidateRows,
      money: [
        { dest: '🏠 Dream home (cash)', amount: fmt(Math.min(netTotal * 0.25, 2000000)), why: 'No mortgage. Ultimate financial freedom. Yard for the Lab.' },
        { dest: '📈 Index funds', amount: fmt(netTotal * 0.3), why: `Generates ~${fmt(netTotal * 0.3 * 0.08)}/yr. Could replace your salary.` },
        { dest: '🏘️ Real estate', amount: fmt(Math.min(netTotal * 0.1, 750000)), why: 'Rental income + tax shelter via depreciation.' },
        { dest: '🏦 Tax-advantaged + 529', amount: '$500K', why: 'Max everything. 529 for future kids. Mega backdoor Roth if available.' },
        { dest: '💰 T-bills + HYSA', amount: fmt(Math.min(netTotal * 0.15, 1500000)), why: '2-3 years expenses. Risk-free. Sleep well.' },
        { dest: '🎉 Fun money', amount: fmt(netTotal * 0.05), why: 'Travel the world. Dream wedding. New car. You only live once.' },
        { dest: '👩‍⚕️ Zany\'s freedom', amount: '$240K (optional)', why: 'If she\'s burning out: pay loans, give her freedom. If she loves it: keep PSLF, invest this instead.' },
        { dest: '🤝 Hire professionals', amount: '$10-20K/yr', why: 'Fee-only CFP + equity-comp CPA + estate attorney. Saves $200K+ in tax strategy.' },
      ],
      risk: 'Lifestyle inflation is the #1 wealth killer. Keep living on salary. Tax bill will be massive — set aside cash before spending. Stay private about your windfall.',
      tierSellShares: optSplit.tierSellCount + comSplit.tierSellCount + rsuSplit.tierSellCount,
      tierSellNet: optNetCashless + optNetHeld + comNetLT + comNetST + rsuNetST + rsuNetLT
    }
  }

  const advice = getAdvice()

  return (
    <div style={{ background:'var(--surface)', borderRadius:16, padding:'16px 20px', border:'1px solid var(--border)' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        <div style={{ fontSize:13, fontWeight:600, color:'var(--text-dim)', textTransform:'uppercase', letterSpacing:1 }}>
          🎯 Strategy at ${price.toFixed(0)}/share
        </div>
        <span style={{ fontSize:12, fontWeight:700, padding:'3px 12px', borderRadius:20, background:advice.color, color:'#000' }}>
          {advice.emoji} {advice.label}
        </span>
      </div>

      <p style={{ fontSize:13, color:'var(--text-dim)', lineHeight:1.6, marginBottom:14 }}>{advice.summary}</p>

      {/* Liquidation */}
      <div style={{ fontSize:13, fontWeight:700, marginBottom:8 }}>💧 How to Liquidate</div>
      {advice.liquidate.map((l, i) => (
        <div key={i} style={{ padding:'8px 12px', background:'rgba(255,255,255,0.03)', borderRadius:10, marginBottom:6, border:'1px solid var(--border)' }}>
          <div style={{ fontWeight:600, fontSize:12, color:advice.color, marginBottom:2, whiteSpace:'pre-line' }}>{l.action}</div>
          <div style={{ fontSize:12, color:'var(--text-dim)', lineHeight:1.5 }}>{l.advice}</div>
        </div>
      ))}

      {/* Total Liquidation Summary */}
      {advice.tierSellShares > 0 && (
        <div style={{ margin:'12px 0', padding:'12px 16px', background:'rgba(0,230,118,0.08)', borderRadius:12, border:'1px solid rgba(0,230,118,0.2)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:'var(--green)' }}>📊 Total Liquidation (Based on Tier + LTCG Sliders)</div>
              <div style={{ fontSize:12, color:'var(--text-dim)', marginTop:2 }}>{advice.tierSellShares.toLocaleString()} shares sold/exercised</div>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:18, fontWeight:700, color:'var(--green)' }}>{fmt(advice.tierSellNet)}</div>
              <div style={{ fontSize:11, color:'var(--text-dim)' }}>est. net after tax</div>
            </div>
          </div>
        </div>
      )}

      {/* Where to put money */}
      <div style={{ fontSize:13, fontWeight:700, marginTop:14, marginBottom:8 }}>💵 Where to Put the Money</div>
      {advice.money.map((m, i) => (
        <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', padding:'8px 0', borderBottom: i < advice.money.length-1 ? '1px solid var(--border)' : 'none' }}>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13, fontWeight:600 }}>{m.dest}</div>
            <div style={{ fontSize:11, color:'var(--text-dim)', marginTop:2 }}>{m.why}</div>
          </div>
          <div style={{ fontSize:13, fontWeight:700, color:'var(--green)', marginLeft:12, whiteSpace:'nowrap' }}>{m.amount}</div>
        </div>
      ))}

      {/* Risk */}
      <div style={{ marginTop:14, padding:'10px 14px', background:'rgba(255,107,107,0.08)', borderRadius:10, border:'1px solid rgba(255,107,107,0.15)' }}>
        <div style={{ fontSize:12, fontWeight:700, color:'var(--red)', marginBottom:4 }}>⚠️ Key Risk</div>
        <div style={{ fontSize:12, color:'var(--text-dim)', lineHeight:1.6 }}>{advice.risk}</div>
      </div>
    </div>
  )
}
