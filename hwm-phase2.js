// ── Fingerprint ──────────────────────────────────────────────────────────────
let fp = {};
const riskLabel = {protect:'Protect first',balanced:'Balanced',growth:'Growth-oriented'};
const patternLabel = {oversave:'Over-saver',emotional:'Emotionally-led',stability:'Stability-seeker','partner-led':'Partner-led',avoidant:'Avoidant',analytical:'Analytical'};

function loadFingerprint() {
  try {
    const raw = sessionStorage.getItem('hwm_fingerprint');
    if (raw) { fp = JSON.parse(raw); renderFPCard(false); return; }
  } catch(e){}
  fp = {};
  renderFPFallback();
}

function renderFPCard(manual) {
  const tags = [
    fp.risk ? `<span class="fp-tag">${riskLabel[fp.risk]||fp.risk}</span>` : '',
    (fp.values||[]).map(v=>`<span class="fp-tag">${v}</span>`).join(''),
    fp.pattern ? `<span class="fp-tag">${patternLabel[fp.pattern]||fp.pattern}</span>` : '',
    fp.dep ? `<span class="fp-tag">Dependents: ${fp.dep}</span>` : ''
  ].join('');
  document.getElementById('fpDisplay').innerHTML = `
    <div class="fp-card">
      <div class="fp-title">Your financial fingerprint${manual?' <span style="font-size:10px;font-weight:400;color:#bbb">(entered manually)</span>':''}</div>
      <div class="fp-insight">We'll use your fingerprint to shape the insight behind each result — not just the numbers, but what they mean for how you actually make decisions.</div>
      <div class="fp-tags">${tags}</div>
    </div>`;
}

function renderFPFallback() {
  document.getElementById('fpDisplay').innerHTML = `
    <div class="fp-fallback">
      <strong>No fingerprint found from Phase 1.</strong> That's okay — enter a few quick details below so we can personalize your results.
    </div>
    <div class="section">
      <div class="section-title">Quick fingerprint</div>
      <div style="margin-bottom:1rem">
        <div style="font-size:13px;color:#555;margin-bottom:6px">My priority right now is...</div>
        <div class="chip-group" id="fallRiskChips">
          <div class="chip" onclick="selFallChip(this,'fallrisk','protect')">Protect first</div>
          <div class="chip" onclick="selFallChip(this,'fallrisk','balanced')">Balanced</div>
          <div class="chip" onclick="selFallChip(this,'fallrisk','growth')">Growth-oriented</div>
        </div>
      </div>
      <div style="margin-bottom:1rem">
        <div style="font-size:13px;color:#555;margin-bottom:6px">When I make financial decisions, I tend to...</div>
        <div class="chip-group" id="fallPatternChips">
          <div class="chip" onclick="selFallChip(this,'fallpattern','oversave')">Over-save</div>
          <div class="chip" onclick="selFallChip(this,'fallpattern','emotional')">Decide emotionally</div>
          <div class="chip" onclick="selFallChip(this,'fallpattern','stability')">Default to stability</div>
          <div class="chip" onclick="selFallChip(this,'fallpattern','avoidant')">Avoid the numbers</div>
          <div class="chip" onclick="selFallChip(this,'fallpattern','analytical')">Run the math, then freeze</div>
        </div>
      </div>
      <div>
        <div style="font-size:13px;color:#555;margin-bottom:6px">What matters most right now?</div>
        <div class="chip-group" id="fallValueChips">
          <div class="chip" onclick="togFallVal(this,'security')">Financial security</div>
          <div class="chip" onclick="togFallVal(this,'family')">Family stability</div>
          <div class="chip" onclick="togFallVal(this,'wealth')">Long-term wealth</div>
          <div class="chip" onclick="togFallVal(this,'present')">Present quality of life</div>
          <div class="chip" onclick="togFallVal(this,'time')">Time freedom</div>
        </div>
      </div>
      <button class="calc-btn" style="margin-top:1rem" onclick="saveFallback()">Save my fingerprint</button>
    </div>`;
}

let fallRisk='', fallPattern='', fallValues=new Set();
function selFallChip(el,group,val){
  document.querySelectorAll(`#${group==='fallrisk'?'fallRisk':'fallPattern'}Chips .chip`).forEach(c=>c.classList.remove('on'));
  el.classList.add('on');
  if(group==='fallrisk') fallRisk=val;
  if(group==='fallpattern') fallPattern=val;
}
function togFallVal(el,val){
  if(el.classList.contains('on')){el.classList.remove('on');fallValues.delete(val);}
  else if(fallValues.size<3){el.classList.add('on');fallValues.add(val);}
}
function saveFallback(){
  fp={risk:fallRisk,pattern:fallPattern,values:Array.from(fallValues),dep:'',partner:''};
  try{ sessionStorage.setItem('hwm_fingerprint',JSON.stringify(fp)); }catch(e){}
  renderFPCard(true);
}

// ── Scenario selection ────────────────────────────────────────────────────────
let currentScenario = '';
const scenarioConfig = {
  buyrent: {
    title: 'Buy vs. continue renting',
    note: 'Enter your current rent and the home you\'re considering. We\'ll model the 5- and 10-year financial picture for each path.',
    fields: `
      <div class="row"><div class="f"><label>Current monthly rent ($)</label><input type="number" id="s_rent" placeholder="2500"/></div><div class="f"><label>Home purchase price ($)</label><input type="number" id="s_price" placeholder="500000"/></div></div>
      <div class="row"><div class="f"><label>Down payment ($)</label><input type="number" id="s_down" placeholder="100000"/></div><div class="f"><label>Estimated mortgage rate (%)</label><input type="number" id="s_rate" placeholder="6.8" step="0.1"/></div></div>
      <div class="row"><div class="f"><label>Annual home appreciation estimate (%)</label><input type="number" id="s_appr" placeholder="3.5" step="0.1"/><span class="hint">Historical US average ~3.5%</span></div><div class="f"><label>Annual investment return if renting (%)</label><input type="number" id="s_invret" placeholder="7" step="0.1"/><span class="hint">S&P 500 long-term avg ~7% real</span></div></div>
      <div class="row"><div class="f"><label>Estimated monthly HOA + maintenance ($)</label><input type="number" id="s_hoa" placeholder="400"/><span class="hint">Rule of thumb: 1% of home value/yr</span></div><div class="f"><label>Annual property tax rate (%)</label><input type="number" id="s_ptax" placeholder="1.1" step="0.1"/></div></div>`
  },
  retirement: {
    title: 'Pause vs. continue retirement contributions',
    note: 'We\'ll show you the compounding cost of pausing — and what it takes to catch up.',
    fields: `
      <div class="row"><div class="f"><label>Current retirement balance ($)</label><input type="number" id="s_bal" placeholder="150000"/></div><div class="f"><label>Current monthly contribution ($)</label><input type="number" id="s_contrib" placeholder="1000"/></div></div>
      <div class="row"><div class="f"><label>Employer match (% of contribution)</label><input type="number" id="s_match" placeholder="50" step="1"/><span class="hint">e.g. 50 = 50% match up to limit</span></div><div class="f"><label>How many months would you pause?</label><input type="number" id="s_pause" placeholder="12"/></div></div>
      <div class="row"><div class="f"><label>Years until retirement</label><input type="number" id="s_years" placeholder="25"/></div><div class="f"><label>Expected annual return (%)</label><input type="number" id="s_ret" placeholder="7" step="0.1"/></div></div>`
  },
  upsize: {
    title: 'Upsize vs. stay put and invest the difference',
    note: 'What does the bigger home actually cost in opportunity? We\'ll model both paths over 10 years.',
    fields: `
      <div class="row"><div class="f"><label>Current home value ($)</label><input type="number" id="s_curval" placeholder="400000"/></div><div class="f"><label>Current mortgage payment ($/mo)</label><input type="number" id="s_curpay" placeholder="1800"/></div></div>
      <div class="row"><div class="f"><label>New home price ($)</label><input type="number" id="s_newprice" placeholder="650000"/></div><div class="f"><label>Down payment on new home ($)</label><input type="number" id="s_newdown" placeholder="130000"/></div></div>
      <div class="row"><div class="f"><label>New mortgage rate (%)</label><input type="number" id="s_newrate" placeholder="6.8" step="0.1"/></div><div class="f"><label>Additional monthly costs (HOA, tax, maintenance)</label><input type="number" id="s_newextra" placeholder="600"/></div></div>
      <div class="row"><div class="f"><label>Annual home appreciation (%)</label><input type="number" id="s_appr2" placeholder="3.5" step="0.1"/></div><div class="f"><label>Annual investment return (%)</label><input type="number" id="s_invret2" placeholder="7" step="0.1"/></div></div>`
  },
  relocate: {
    title: 'Relocate vs. stay',
    note: 'Moving has real upfront costs and long-term financial implications. Let\'s model both.',
    fields: `
      <div class="row"><div class="f"><label>Current monthly housing cost ($)</label><input type="number" id="s_curhous" placeholder="2000"/></div><div class="f"><label>New city monthly housing cost ($)</label><input type="number" id="s_newhous" placeholder="2800"/></div></div>
      <div class="row"><div class="f"><label>One-time moving costs ($)</label><input type="number" id="s_movecost" placeholder="8000"/></div><div class="f"><label>Expected income change ($/mo, use negative if lower)</label><input type="number" id="s_incdiff" placeholder="500"/></div></div>
      <div class="row"><div class="f"><label>State income tax difference (% points)</label><input type="number" id="s_taxdiff" placeholder="0" step="0.1"/><span class="hint">Negative = moving to lower-tax state</span></div><div class="f"><label>Gross annual income ($)</label><input type="number" id="s_income" placeholder="120000"/></div></div>
      <div class="row single"><div class="f"><label>Years you plan to stay in new city</label><input type="number" id="s_reloyears" placeholder="5"/></div></div>`
  },
  experiences: {
    title: 'Invest now vs. lean into family experiences',
    note: 'What does redirecting investment dollars toward experiences actually cost over time? Let\'s find out.',
    fields: `
      <div class="row"><div class="f"><label>Current monthly investment amount ($)</label><input type="number" id="s_curinv" placeholder="1500"/></div><div class="f"><label>How much would you redirect to experiences ($/mo)?</label><input type="number" id="s_expamt" placeholder="800"/></div></div>
      <div class="row"><div class="f"><label>How many years would you do this?</label><input type="number" id="s_expyears" placeholder="5"/></div><div class="f"><label>Expected annual investment return (%)</label><input type="number" id="s_expret" placeholder="7" step="0.1"/></div></div>
      <div class="row single"><div class="f"><label>Years until you\'d want this money (retirement or goal)</label><input type="number" id="s_totalyears" placeholder="20"/></div></div>`
  },
  assetalloc: {
    title: 'Cash out & diversify vs. hold a concentrated asset',
    note: 'Enter the asset you\'re holding and what you\'d move into. We\'ll model both growth paths, the tax hit on cashing out, and the concentration risk you\'re carrying by staying.',
    fields: `
      <div class="row"><div class="f"><label>Current value of the asset ($)</label><input type="number" id="s_assetval" placeholder="75000"/><span class="hint">RSUs, company stock, single investment</span></div><div class="f"><label>Your cost basis ($)</label><input type="number" id="s_basis" placeholder="20000"/><span class="hint">What you paid / what was taxed at vest. Use 0 if unsure.</span></div></div>
      <div class="row"><div class="f"><label>Your estimated tax rate on gains (%)</label><input type="number" id="s_taxrate" placeholder="28" step="1"/><span class="hint">Federal + state combined. RSUs taxed as ordinary income.</span></div><div class="f"><label>Expected growth rate if you hold (%/yr)</label><input type="number" id="s_holdret" placeholder="8" step="0.1"/><span class="hint">Your honest estimate for this specific asset</span></div></div>
      <div class="row"><div class="f"><label>Expected growth rate if diversified (%/yr)</label><input type="number" id="s_divret" placeholder="7" step="0.1"/><span class="hint">S&P 500 long-term avg ~7% real</span></div><div class="f"><label>Time horizon (years)</label><input type="number" id="s_assetyears" placeholder="10"/></div></div>
      <div style="font-size:13px;color:#555;margin:1rem 0 6px">What percentage of your total investable assets does this represent?</div>
      <div class="chip-group" id="concenChips">
        <div class="chip" onclick="selConcen(this,'low')">Under 10%</div>
        <div class="chip" onclick="selConcen(this,'moderate')">10–25%</div>
        <div class="chip" onclick="selConcen(this,'high')">25–50%</div>
        <div class="chip" onclick="selConcen(this,'very-high')">Over 50%</div>
      </div>`
  },
  custom: {
    title: 'Your tradeoff',
    note: 'Describe the two options you\'re weighing, then add the monthly numbers. We\'ll reflect back the tension and run the math automatically.',
    fields: `
      <div class="row single"><div class="f"><label>Option A — what you\'re considering</label><textarea id="s_opta" placeholder="e.g. Leave my current job to consult full-time..."></textarea></div></div>
      <div class="row single"><div class="f"><label>Option B — the alternative</label><textarea id="s_optb" placeholder="e.g. Stay in my current role for another 18 months while I build clients on the side..."></textarea></div></div>
      <div style="font-size:12px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:.07em;margin:1rem 0 8px">Monthly cash flow — Option A</div>
      <div class="row"><div class="f"><label>Monthly income under Option A ($)</label><input type="number" id="s_aincome" placeholder="0"/></div><div class="f"><label>New monthly costs Option A adds ($)</label><input type="number" id="s_acosts" placeholder="0"/><span class="hint">e.g. childcare, commute, equipment</span></div></div>
      <div style="font-size:12px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:.07em;margin:1rem 0 8px">Monthly cash flow — Option B</div>
      <div class="row"><div class="f"><label>Monthly income under Option B ($)</label><input type="number" id="s_bincome" placeholder="0"/></div><div class="f"><label>New monthly costs Option B adds ($)</label><input type="number" id="s_bcosts" placeholder="0"/></div></div>
      <div style="font-size:12px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:.07em;margin:1rem 0 8px">Your baseline</div>
      <div class="row"><div class="f"><label>Current monthly savings rate ($)</label><input type="number" id="s_csavings" placeholder="2000"/></div><div class="f"><label>Years this decision affects you</label><input type="number" id="s_cyears" placeholder="5"/><span class="hint">How long before the situation changes?</span></div></div>`
  }
};

function selScenario(el, key) {
  document.querySelectorAll('.scenario-opt').forEach(o=>o.classList.remove('on'));
  el.classList.add('on');
  currentScenario = key;
  const cfg = scenarioConfig[key];
  document.getElementById('inputPanel').style.display = 'block';
  document.getElementById('inputPanelTitle').textContent = cfg.title;
  document.getElementById('inputPanelNote').textContent = cfg.note;
  document.getElementById('inputPanelFields').innerHTML = cfg.fields;
  document.getElementById('results').style.display = 'none';
  document.getElementById('inputPanel').scrollIntoView({behavior:'smooth',block:'start'});
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const v = id => parseFloat(document.getElementById(id)?.value) || 0;
const fmt = n => '$' + Math.round(n).toLocaleString();
const fmtK = n => n >= 1000 ? '$' + (Math.round(n/100)/10).toFixed(0) + 'k' : fmt(n);

function mortgagePayment(principal, annualRate, years) {
  const r = annualRate / 100 / 12;
  const n = years * 12;
  if (r === 0) return principal / n;
  return principal * (r * Math.pow(1+r,n)) / (Math.pow(1+r,n)-1);
}

// fv now takes annualRatePct as a percentage (e.g. 7 for 7%)
function fv(monthlyPmt, annualRatePct, months) {
  const mr = Math.min(annualRatePct, 50) / 100 / 12; // cap at 50% to prevent overflow
  if (mr === 0) return monthlyPmt * months;
  return monthlyPmt * (Math.pow(1+mr, months) - 1) / mr;
}

// Safe number formatter — caps display at $999T to avoid scientific notation
function fmtSafe(n) {
  if (!isFinite(n) || isNaN(n)) return '—';
  if (Math.abs(n) > 999e12) return n < 0 ? '-$999T+' : '$999T+';
  return '$' + Math.round(n).toLocaleString();
}

// ── Fingerprint-driven insight ────────────────────────────────────────────────
function getInsight(scenario, data) {
  const pattern = fp.pattern || '';
  const risk = fp.risk || '';
  const vals = fp.values || [];
  const hasFamily = vals.includes('family');
  const hasWealth = vals.includes('wealth');
  const hasSecurity = vals.includes('security');
  const hasPresent = vals.includes('present');

  const insightMap = {
    buyrent: {
      oversave: "You might already know renting is cheaper short-term — but the real question is whether keeping cash liquid is actually serving your goals or just your comfort. Look at the 10-year column before deciding.",
      emotional: "Homeownership carries a lot of emotional weight. Before you let the feeling drive the decision, look at what the math says over 10 years. The numbers don't care how the kitchen looks.",
      stability: "Owning does create stability — but it also concentrates risk in one illiquid asset. Renting and investing the difference may actually give you more financial flexibility.",
      'partner-led': "This is exactly the kind of decision to own with full information. The comparison below gives you the numbers to walk into any conversation with confidence.",
      avoidant: "This one feels big, and that's probably why it's been sitting. The numbers below are simpler than the decision feels.",
      analytical: hasSecurity ? "You can see both paths clearly. The question is whether stability or optionality matters more to you right now — the math alone won't answer that." : "You'll see the numbers clearly. The decision hinges on how you weight liquidity vs. equity — that's a values call, not a math call."
    },
    retirement: {
      oversave: "Pausing contributions when you're an over-saver can feel like the responsible move — but the compounding math hits harder than most people expect. See the catch-up cost before you decide.",
      emotional: "This decision is easy to rationalize in the moment. The 10-year cost in the results below makes the real tradeoff harder to ignore.",
      stability: "Pausing feels safe — but your future self pays a real price. We've modeled exactly what that price is.",
      'partner-led': "Retirement savings in your name matters, regardless of household income. This is worth understanding on your own terms.",
      avoidant: "The compounding cost of a pause is the thing most people don't see until it's too late to fully recover. You're seeing it now.",
      analytical: "You already know compounding favors staying in. The question is whether the short-term cash flow relief outweighs the long-term cost — here's the number."
    },
    upsize: {
      oversave: "The bigger home might be the right call — but you should know what staying put and investing the difference actually builds before you decide.",
      emotional: hasFamily ? "A bigger home for your family makes complete sense emotionally. Let's make sure it makes sense financially too." : "The bigger home might feel like the right move. The numbers below will tell you what you're trading to get there.",
      stability: "Upsizing concentrates more of your net worth in real estate. That's not necessarily wrong — but it's worth seeing what the alternative builds.",
      'partner-led': "This is often a joint decision — but you should understand the math independently so you can advocate for what's right for you.",
      avoidant: "The numbers below are the ones that make this decision a lot clearer. Take a look before you commit.",
      analytical: hasWealth ? "You'll see the 10-year wealth gap between both paths. The answer depends on how much weight you put on equity vs. liquid investment returns." : "Two paths, real numbers. The decision comes down to how you value liquidity vs. real estate equity."
    },
    relocate: {
      oversave: "The upfront cost of moving is visible. What's less obvious is how the monthly delta compounds over the years you're there.",
      emotional: "A new city can feel like a reset. Make sure the financial case supports the emotional one — or at minimum, that you can afford the gap if it doesn't.",
      stability: "Relocating introduces short-term instability even when the long-term picture is better. We've separated the two so you can see both.",
      'partner-led': "If this decision affects your household income or housing cost, it's yours to understand fully — not just review.",
      avoidant: "Moving costs feel overwhelming to model. We've done it for you.",
      analytical: "You'll see the break-even timeline clearly. Whether that timeline feels acceptable is the decision."
    },
    experiences: {
      oversave: hasFamily ? "You've been saving when you could be living. This tradeoff is worth modeling — because the answer might surprise you in both directions." : "You already save well. This is about whether you're leaving too much quality of life on the table in the process.",
      emotional: hasFamily ? "Family experiences feel urgent in a way that investing doesn't. The model below shows you exactly what that urgency costs — and lets you decide if it's worth it." : "This is an emotional decision as much as a financial one. Here's what the math looks like.",
      stability: hasPresent ? "You lean toward stability but value the present. This scenario quantifies the cost of leaning in to experiences — it may be smaller than you think." : "The opportunity cost of redirecting investment dollars is real. So is the cost of deferring the experiences. We've modeled both.",
      'partner-led': "How you spend as a family is a conversation worth owning. Here's the financial case you can bring to it.",
      avoidant: "This one often gets avoided because the cost feels abstract. We've made it concrete.",
      analytical: hasFamily ? "You can calculate the opportunity cost. What you can't calculate is whether your kids will remember the vacations. That's the real tradeoff." : "The numbers are below. The decision depends on how you weight present quality of life against future wealth."
    },
    assetalloc: {
      oversave: "Holding a concentrated asset can feel like the conservative move — but concentration is risk, not safety. Make sure staying put is an intentional decision, not a default.",
      emotional: "Company stock often carries loyalty and identity alongside the dollars. The model below separates the financial case from the emotional one — both matter, but they should be weighed separately.",
      stability: "Diversification is actually the stability play here. A concentrated position can swing hard in either direction — the diversified path trades some upside for more predictable outcomes.",
      'partner-led': "Asset allocation decisions like this one are worth owning with full clarity. The comparison below gives you everything you need to reason through it independently.",
      avoidant: "The tax hit makes this feel complicated, which is why a lot of people don't act. We've modeled it — the number is real, but so is the risk of staying concentrated.",
      analytical: hasWealth ? "You'll see the growth math clearly. The honest question is whether your hold-rate assumption is realistic for this specific asset over this specific timeframe." : "The math is below. The decision hinges on how much conviction you have in your hold-rate assumption vs. a diversified alternative."
    },
    custom: {
      oversave: "You may be undervaluing the option that creates more liquidity. Look at what each path does to your monthly cash position.",
      emotional: "Your gut brought you here — now let's give it some numbers to work with.",
      stability: "The path that feels safer may not be the one that builds more over time. We'll flag where they diverge.",
      'partner-led': "You're here doing this yourself. That matters. Use the framework below to build your own perspective before any conversation.",
      avoidant: "You framed the question. That's the hardest part.",
      analytical: "You've got the structure. We'll add the financial framing so you can move from analysis to decision."
    }
  };

  const scenarioInsights = insightMap[scenario] || {};
  return scenarioInsights[pattern] || scenarioInsights['analytical'] || "We'll use your fingerprint to frame what these numbers mean for your specific situation and decision style.";
}

let currentConcentration = '';
function selConcen(el, val) {
  document.querySelectorAll('#concenChips .chip').forEach(c=>c.classList.remove('on'));
  el.classList.add('on');
  currentConcentration = val;
}

// ── Run scenario ──────────────────────────────────────────────────────────────
function runScenario() {
  const s = currentScenario;
  let html = '';

  if (s === 'buyrent') html = runBuyRent();
  else if (s === 'retirement') html = runRetirement();
  else if (s === 'upsize') html = runUpsize();
  else if (s === 'relocate') html = runRelocate();
  else if (s === 'experiences') html = runExperiences();
  else if (s === 'assetalloc') html = runAssetAlloc();
  else if (s === 'custom') html = runCustom();

  document.getElementById('resultsInner').innerHTML = html;
  document.getElementById('results').style.display = 'block';
  document.getElementById('results').scrollIntoView({behavior:'smooth',block:'start'});
}

function insightCard(scenario, data) {
  return `<div class="insight-card">
    <div class="insight-title">Your fingerprint says</div>
    <div class="insight-text">${getInsight(scenario, data)}</div>
  </div>`;
}

function assumptions(items) {
  const id = 'assump_' + Math.random().toString(36).slice(2);
  return `<div class="assumptions">
    <div class="assumptions-header" onclick="toggleAssump('${id}')">
      <span>Assumptions used in this model</span><span id="${id}_arrow">▸</span>
    </div>
    <div class="assumptions-body" id="${id}">
      <ul>${items.map(i=>`<li>${i}</li>`).join('')}</ul>
    </div>
  </div>`;
}

function toggleAssump(id) {
  const el = document.getElementById(id);
  const arrow = document.getElementById(id+'_arrow');
  el.classList.toggle('open');
  arrow.textContent = el.classList.contains('open') ? '▾' : '▸';
}

function compareGrid(optA, optB, winnerKey) {
  const aWins = winnerKey === 'a';
  return `<div class="compare-grid">
    <div class="compare-card ${aWins?'winner':''}">
      <div class="compare-label ${aWins?'win-label':''}">${optA.label}${aWins?'<span class="badge">Stronger financially</span>':''}</div>
      ${optA.metrics.map(m=>`<div class="compare-metric"><div class="compare-metric-name">${m.name}</div><div class="compare-metric-val">${m.val}</div>${m.sub?`<div class="compare-metric-sub">${m.sub}</div>`:''}</div>`).join('')}
    </div>
    <div class="compare-card ${!aWins?'winner':''}">
      <div class="compare-label ${!aWins?'win-label':''}">${optB.label}${!aWins?'<span class="badge">Stronger financially</span>':''}</div>
      ${optB.metrics.map(m=>`<div class="compare-metric"><div class="compare-metric-name">${m.name}</div><div class="compare-metric-val">${m.val}</div>${m.sub?`<div class="compare-metric-sub">${m.sub}</div>`:''}</div>`).join('')}
    </div>
  </div>`;
}

// ── BUY VS RENT ───────────────────────────────────────────────────────────────
function runBuyRent() {
  const rent = v('s_rent');
  const price = v('s_price');
  const down = v('s_down');
  const rate = v('s_rate') || 6.8;
  const appr = (v('s_appr') || 3.5) / 100;
  const invret = (v('s_invret') || 7) / 100;
  const hoa = v('s_hoa');
  const ptax = (v('s_ptax') || 1.1) / 100;
  const loan = price - down;
  const monthly_mortgage = mortgagePayment(loan, rate, 30);
  const monthly_ptax = price * ptax / 12;
  const total_buy_monthly = monthly_mortgage + monthly_ptax + hoa;
  const monthly_diff = total_buy_monthly - rent;

  // 5 & 10 yr buy: home equity
  const equity5 = price * Math.pow(1+appr,5) - loan * (Math.pow(1+rate/100/12,5*12)-1)/(Math.pow(1+rate/100/12,30*12)-1) * loan;
  const homeVal5 = price * Math.pow(1+appr,5);
  const homeVal10 = price * Math.pow(1+appr,10);
  const loanBal5 = loan - (monthly_mortgage * 60 - loan * (Math.pow(1+rate/100/12,60)-1)/(Math.pow(1+rate/100/12,360)-1) * loan);

  // Simpler: after 5yr, home value - remaining loan balance
  function loanBalance(principal, annRate, years, paymentYears) {
    const r = annRate/100/12;
    const n = paymentYears * 12;
    const pmt = principal * (r * Math.pow(1+r,n)) / (Math.pow(1+r,n)-1);
    const months = years * 12;
    return principal * Math.pow(1+r,months) - pmt * (Math.pow(1+r,months)-1)/r;
  }

  const bal5 = loanBalance(loan, rate, 5, 30);
  const bal10 = loanBalance(loan, rate, 10, 30);
  const netEquity5 = homeVal5 - bal5 - down; // gain beyond down payment
  const netEquity10 = homeVal10 - bal10 - down;

  // Renting: invest down payment + monthly savings vs mortgage
  const rentInvDown5 = down * Math.pow(1+invret, 5);
  const rentInvDiff5 = monthly_diff > 0 ? fv(monthly_diff, invret*100_SKIP, 60) : 0;
  const rentNet5 = rentInvDown5 + rentInvDiff5 - down;

  const rentInvDown10 = down * Math.pow(1+invret, 10);
  const rentInvDiff10 = monthly_diff > 0 ? fv(monthly_diff, invret*100_SKIP, 120) : 0;
  const rentNet10 = rentInvDown10 + rentInvDiff10 - down;

  const winner5 = netEquity5 > rentNet5 ? 'a' : 'b';
  const winner10 = netEquity10 > rentNet10 ? 'a' : 'b';
  const breakevenYrs = Math.round((price * 0.04 + down * invret) / (Math.max(1, netEquity10/10 - rentNet10/10) + 0.01));

  return `
    <div style="font-size:11px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:.07em;margin-bottom:10px">Buy vs. Rent — 5 & 10 Year Comparison</div>
    ${insightCard('buyrent', {})}
    <div style="font-size:13px;color:#555;margin-bottom:8px;font-weight:600">5-year net position</div>
    ${compareGrid(
      {label:'Buying', metrics:[
        {name:'Monthly cost',val:fmt(total_buy_monthly),sub:`Mortgage + tax + HOA`},
        {name:'Net equity gain',val:fmt(netEquity5),sub:'Home appreciation minus remaining loan, beyond down payment'},
        {name:'Total cost of housing',val:fmt(total_buy_monthly*60)}
      ]},
      {label:'Renting', metrics:[
        {name:'Monthly cost',val:fmt(rent),sub:'Current rent'},
        {name:'Investment gain',val:fmt(rentNet5),sub:'Down payment invested + monthly savings invested'},
        {name:'Total cost of housing',val:fmt(rent*60)}
      ]},
      winner5
    )}
    <div style="font-size:13px;color:#555;margin-bottom:8px;font-weight:600;margin-top:1rem">10-year net position</div>
    ${compareGrid(
      {label:'Buying', metrics:[
        {name:'Home value',val:fmt(homeVal10)},
        {name:'Net equity gain',val:fmt(netEquity10),sub:'Above your down payment'},
        {name:'Equity return',val:((netEquity10/down)*100).toFixed(0)+'%',sub:'Return on down payment'}
      ]},
      {label:'Renting', metrics:[
        {name:'Portfolio value',val:fmt(down*Math.pow(1+invret,10)+rentInvDiff10)},
        {name:'Investment gain',val:fmt(rentNet10),sub:'Above your initial down payment'},
        {name:'Investment return',val:((rentNet10/down)*100).toFixed(0)+'%',sub:'Return on same capital'}
      ]},
      winner10
    )}
    <div class="data-point">
      <div class="data-point-label">Research context</div>
      <div class="data-point-text">According to Fidelity, the average homeowner's net worth is significantly higher than renters over time — but much of that gap is explained by forced savings through equity, not home price appreciation alone. In high-cost markets, renting and investing the difference has historically been competitive.</div>
    </div>
    ${insightCard('buyrent',{})}
    ${assumptions([
      `Home appreciates at ${v('s_appr')||3.5}% annually (US historical avg ~3.5%)`,
      `Investments return ${v('s_invret')||7}% annually (S&P 500 long-term real avg)`,
      `30-year fixed mortgage at ${v('s_rate')||6.8}%`,
      `Monthly HOA + maintenance: ${fmt(hoa)}`,
      `Property tax: ${v('s_ptax')||1.1}% annually`,
      'Does not include home sale transaction costs (~6%), mortgage interest tax deduction, or rental price increases over time',
      'Down payment is the same capital in both scenarios'
    ])}`;
}

// ── RETIREMENT ────────────────────────────────────────────────────────────────
function runRetirement() {
  const bal        = Math.max(0, v('s_bal'));
  const contrib    = Math.max(0, v('s_contrib'));
  const matchPct   = Math.min((v('s_match') || 0), 200) / 100;
  const pauseMonths= Math.min(Math.max(0, v('s_pause')), 120); // cap at 10 yrs
  const years      = Math.min(Math.max(1, v('s_years')), 50);  // cap at 50 yrs
  const retPct     = Math.min(Math.max(0, v('s_ret') || 7), 20); // cap at 20%
  const ret        = retPct / 100;
  const mr         = ret / 12;
  const totalMonths= years * 12;

  const effectiveContrib = contrib * (1 + matchPct);

  // Path A: continue
  const contFV = bal * Math.pow(1+ret, years) + fv(effectiveContrib, retPct, totalMonths);

  // Path B: pause then resume
  const balAfterPause = bal * Math.pow(1+mr, pauseMonths);
  const remaining     = Math.max(0, totalMonths - pauseMonths);
  const yearsAfter    = Math.max(0, years - pauseMonths/12);
  const pauseFV       = balAfterPause * Math.pow(1+ret, yearsAfter) + (remaining > 0 ? fv(effectiveContrib, retPct, remaining) : 0);

  const cost       = Math.max(0, contFV - pauseFV);
  const lostMatch  = contrib * matchPct * pauseMonths;
  const catchUpDenom = fv(1, retPct, Math.max(1, totalMonths - pauseMonths));
  const catchUpNeeded = catchUpDenom > 0 ? (cost / catchUpDenom) * (1 + matchPct) : 0;

  const winner = 'a';

  return `
    <div style="font-size:11px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:.07em;margin-bottom:10px">Pause vs. Continue Contributions</div>
    ${insightCard('retirement', {})}
    ${compareGrid(
      {label:'Continue contributing', metrics:[
        {name:'Projected balance at retirement',val:fmtSafe(contFV)},
        {name:'Monthly contribution (with match)',val:fmtSafe(effectiveContrib)},
        {name:'Employer match kept',val:fmtSafe(contrib * matchPct * 12) + '/yr'}
      ]},
      {label:`Pause ${pauseMonths} months`, metrics:[
        {name:'Projected balance at retirement',val:fmtSafe(pauseFV)},
        {name:'Cost of the pause',val:fmtSafe(cost),sub:'Lost compounding + missed match'},
        {name:'Lost employer match',val:fmtSafe(lostMatch)}
      ]},
      winner
    )}
    <div class="data-point">
      <div class="data-point-label">Research context</div>
      <div class="data-point-text">The Center for American Progress found that women face a retirement savings gap that compounds over time due to career interruptions. A ${pauseMonths}-month pause early in your savings timeline costs more than the same pause later — compounding amplifies the gap the longer money has to grow.</div>
    </div>
    <div class="insight-card">
      <div class="insight-title">To fully catch up after a ${pauseMonths}-month pause</div>
      <div class="insight-text">You'd need to contribute an extra <strong>${fmtSafe(Math.max(0, catchUpNeeded))}/month</strong> for the remainder of your savings timeline to arrive at the same place. Whether that's feasible is worth knowing before you pause.</div>
    </div>
    ${assumptions([
      `Current balance: ${fmt(bal)}`,
      `Monthly contribution: ${fmt(contrib)} + ${(matchPct*100).toFixed(0)}% employer match`,
      `Expected return: ${v('s_ret')||7}% annually`,
      `Years to retirement: ${years}`,
      'Does not account for contribution limit changes, taxes on withdrawal, or future income changes',
      'Employer match is assumed to stop during pause and resume after'
    ])}`;
}

// ── UPSIZE ────────────────────────────────────────────────────────────────────
function runUpsize() {
  const curval = v('s_curval');
  const curpay = v('s_curpay');
  const newprice = v('s_newprice');
  const newdown = v('s_newdown');
  const newrate = v('s_newrate') || 6.8;
  const newextra = v('s_newextra');
  const appr = (v('s_appr2') || 3.5) / 100;
  const invret = (v('s_invret2') || 7) / 100;
  const newloan = newprice - newdown;
  const newpmt = mortgagePayment(newloan, newrate, 30);
  const totalNewMonthly = newpmt + newextra;
  const monthlyDelta = totalNewMonthly - curpay;

  // 10yr upsize: net equity on new home (assuming sold current)
  const newVal10 = newprice * Math.pow(1+appr,10);
  function loanBalance(p, r, y, py) {
    const mr = r/100/12; const n = py*12;
    const pmt = p*(mr*Math.pow(1+mr,n))/(Math.pow(1+mr,n)-1);
    const m = y*12;
    return p*Math.pow(1+mr,m)-pmt*(Math.pow(1+mr,m)-1)/mr;
  }
  const newBal10 = loanBalance(newloan, newrate, 10, 30);
  const upsizeNet10 = newVal10 - newBal10;

  // Stay: invest down payment + monthly delta
  const stayInv10 = newdown * Math.pow(1+invret,10) + fv(monthlyDelta, invret*100, 120);
  const stayNet10 = curval * Math.pow(1+appr,10) + stayInv10;
  const upsizeFullNet = upsizeNet10;

  const winner = upsizeFullNet > stayNet10 ? 'a' : 'b';

  return `
    <div style="font-size:11px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:.07em;margin-bottom:10px">Upsize vs. Stay + Invest — 10 Year View</div>
    ${insightCard('upsize', {})}
    ${compareGrid(
      {label:'Upsize', metrics:[
        {name:'New monthly housing cost',val:fmt(totalNewMonthly)},
        {name:'Monthly increase vs. today',val:fmt(monthlyDelta)},
        {name:'New home value in 10 yrs',val:fmt(newVal10)},
        {name:'Net equity in 10 yrs',val:fmt(upsizeNet10),sub:'Value minus remaining loan'}
      ]},
      {label:'Stay + invest the difference', metrics:[
        {name:'Monthly housing cost',val:fmt(curpay),sub:'Unchanged'},
        {name:'Down payment invested (10 yr)',val:fmt(newdown*Math.pow(1+invret,10))},
        {name:'Monthly delta invested (10 yr)',val:fmt(fv(monthlyDelta, invret*100, 120))},
        {name:'Total net position',val:fmt(stayNet10),sub:'Current home equity + investments'}
      ]},
      winner
    )}
    <div class="data-point">
      <div class="data-point-label">Research context</div>
      <div class="data-point-text">McKinsey research on household wealth building found that real estate and equity markets have historically produced similar long-run returns — but real estate concentrates risk in a single illiquid asset. The choice between them often comes down to how much liquidity flexibility matters to your stage of life.</div>
    </div>
    ${assumptions([
      `New home: ${fmt(newprice)}, down: ${fmt(newdown)}, rate: ${newrate}%`,
      `Home appreciation: ${v('s_appr2')||3.5}% annually`,
      `Investment return: ${v('s_invret2')||7}% annually`,
      'Current home equity included in "stay" net position',
      'Does not include transaction costs on either home sale (~6%), maintenance cost differences, or tax implications',
      'Extra monthly costs include HOA, property tax delta, and maintenance'
    ])}`;
}

// ── RELOCATE ──────────────────────────────────────────────────────────────────
function runRelocate() {
  const curhous = v('s_curhous');
  const newhous = v('s_newhous');
  const movecost = v('s_movecost');
  const incdiff = v('s_incdiff');
  const taxdiff = (v('s_taxdiff')) / 100;
  const income = v('s_income');
  const years = v('s_reloyears') || 5;
  const monthlyDiff = newhous - curhous - incdiff + (income * taxdiff / 12);
  const totalCost = movecost + (monthlyDiff > 0 ? monthlyDiff * years * 12 : 0);
  const totalSavings = monthlyDiff < 0 ? Math.abs(monthlyDiff) * years * 12 - movecost : 0;
  const breakeven = monthlyDiff < 0 ? Math.ceil(movecost / Math.abs(monthlyDiff)) : null;
  const winner = totalSavings > 0 ? 'b' : 'a';

  return `
    <div style="font-size:11px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:.07em;margin-bottom:10px">Relocate vs. Stay — ${years}-Year View</div>
    ${insightCard('relocate', {})}
    ${compareGrid(
      {label:'Stay', metrics:[
        {name:'Monthly housing cost',val:fmt(curhous)},
        {name:'Upfront cost',val:'$0'},
        {name:`${years}-yr housing total`,val:fmt(curhous*years*12)},
        {name:'Net financial position',val:'Baseline'}
      ]},
      {label:'Relocate', metrics:[
        {name:'New monthly housing cost',val:fmt(newhous)},
        {name:'One-time moving cost',val:fmt(movecost)},
        {name:`${years}-yr all-in cost`,val:fmt(movecost + newhous*years*12)},
        {name:`Net vs. staying (${years} yrs)`,val: monthlyDiff < 0 ? `${fmt(totalSavings)} ahead` : `${fmt(totalCost)} behind`,sub: breakeven ? `Break-even: ${breakeven} months` : 'Move costs more over this period'}
      ]},
      winner
    )}
    <div class="data-point">
      <div class="data-point-label">Research context</div>
      <div class="data-point-text">Allianz research on financial transitions found that geographic moves made during career inflection points can either accelerate or erode wealth significantly depending on housing cost differentials and income changes. The break-even timeline is the number that matters most — if you're not staying long enough, the move rarely pencils out financially.</div>
    </div>
    ${breakeven ? `<div class="insight-card"><div class="insight-title">Your break-even point</div><div class="insight-text">Based on your inputs, you'd need to stay in the new city for at least <strong>${breakeven} months (${(breakeven/12).toFixed(1)} years)</strong> for the move to make financial sense. ${years*12 > breakeven ? 'Your planned timeline clears that bar.' : 'Your current timeline doesn\'t clear that bar — worth factoring into the decision.'}</div></div>` : ''}
    ${assumptions([
      `Monthly housing cost change: ${fmt(Math.abs(newhous-curhous))} ${newhous>curhous?'higher':'lower'}`,
      `Income change: ${incdiff >= 0 ? '+' : ''}${fmt(incdiff)}/mo`,
      `State tax rate difference: ${v('s_taxdiff')||0}% on ${fmt(income)} gross income`,
      `One-time moving costs: ${fmt(movecost)}`,
      `Time horizon: ${years} years`,
      'Does not include social/career network disruption costs, cost-of-living differences beyond housing, or real estate transaction costs if you own'
    ])}`;
}

// ── EXPERIENCES ───────────────────────────────────────────────────────────────
function runExperiences() {
  const curinv = v('s_curinv');
  const expamt = v('s_expamt');
  const expyears = v('s_expyears');
  const ret = (v('s_expret') || 7) / 100;
  const totalyears = v('s_totalyears');
  const redirected = Math.min(expamt, curinv);
  const remaining = curinv - redirected;
  const expMonths = expyears * 12;
  const totalMonths = totalyears * 12;

  // Full invest path
  const fullFV = fv(curinv, ret*100, totalMonths);

  // Redirect path: invest reduced amount for expyears, then full amount for remaining
  const reducedFV = fv(remaining, ret*100, expMonths);
  const reducedFVGrown = reducedFV * Math.pow(1+ret, totalyears - expyears);
  const resumeFV = fv(curinv, ret*100, (totalyears - expyears)*12);
  const redirectFV = reducedFVGrown + resumeFV;
  const cost = fullFV - redirectFV;
  const experiencesBudget = redirected * expMonths;

  const winner = 'a';

  return `
    <div style="font-size:11px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:.07em;margin-bottom:10px">Invest vs. Lean Into Experiences — ${totalyears}-Year View</div>
    ${insightCard('experiences', {})}
    ${compareGrid(
      {label:`Invest full ${fmt(curinv)}/mo`, metrics:[
        {name:'Monthly invested',val:fmt(curinv)},
        {name:'Projected portfolio',val:fmt(fullFV)},
        {name:'Experiences budget',val:'$0',sub:`Over ${expyears} years`}
      ]},
      {label:`Redirect ${fmt(redirected)}/mo to experiences`, metrics:[
        {name:'Monthly invested',val:fmt(remaining),sub:`For ${expyears} years, then back to ${fmt(curinv)}`},
        {name:'Projected portfolio',val:fmt(redirectFV)},
        {name:'Experiences budget',val:fmt(experiencesBudget),sub:`Over ${expyears} years`}
      ]},
      winner
    )}
    <div class="insight-card">
      <div class="insight-title">The real cost of the experiences path</div>
      <div class="insight-text">Redirecting ${fmt(redirected)}/month for ${expyears} years funds <strong>${fmt(experiencesBudget)} in experiences</strong> — and costs your future self approximately <strong>${fmt(cost)}</strong> in portfolio value at year ${totalyears}. Whether that tradeoff is worth it is exactly the kind of decision this tool can't make for you — but now you know the number.</div>
    </div>
    <div class="data-point">
      <div class="data-point-label">Research context</div>
      <div class="data-point-text">Research consistently shows experiential spending produces longer-lasting wellbeing than material purchases — but that finding is about relative allocation, not about stopping investment entirely. The question isn't invest vs. experience. It's how much of each, for how long.</div>
    </div>
    ${assumptions([
      `Investment return: ${v('s_expret')||7}% annually`,
      `Redirection period: ${expyears} years, then full contributions resume`,
      `Total time horizon: ${totalyears} years`,
      'Does not account for tax-advantaged account limits, inflation adjustment on contributions, or spending compounding (travel costs rising over time)',
      'Portfolio projections are pre-tax'
    ])}`;
}

// ── ASSET ALLOCATION ──────────────────────────────────────────────────────────
function runAssetAlloc() {
  const assetVal  = v('s_assetval');
  const basis     = v('s_basis');
  const taxRate   = (v('s_taxrate') || 28) / 100;
  const holdRet   = (v('s_holdret') || 8) / 100;
  const divRet    = (v('s_divret') || 7) / 100;
  const years     = v('s_assetyears') || 10;
  const concen    = currentConcentration || 'moderate';

  // Tax on cash-out
  const gain      = Math.max(0, assetVal - basis);
  const taxHit    = gain * taxRate;
  const afterTax  = assetVal - taxHit;

  // Path A: hold — grows at holdRet, no tax drag now
  const holdFV    = assetVal * Math.pow(1 + holdRet, years);

  // Path B: diversify — starts from after-tax proceeds, grows at divRet
  const divFV     = afterTax * Math.pow(1 + divRet, years);

  // Break-even: at what year does diversified path catch up?
  let breakeven = null;
  for (let y = 1; y <= 30; y++) {
    if (afterTax * Math.pow(1 + divRet, y) >= assetVal * Math.pow(1 + holdRet, y)) {
      breakeven = y;
      break;
    }
  }

  const holdWins = holdFV > divFV;

  // Concentration risk language
  const concenRisk = {
    low:       { label: 'Low concentration', text: 'Under 10% of your portfolio — this is generally within a healthy range. The decision is more about growth rate conviction than diversification urgency.' },
    moderate:  { label: 'Moderate concentration', text: '10–25% in a single asset is worth watching. If this position has grown beyond your original target allocation, that alone is a signal to revisit.' },
    high:      { label: 'High concentration', text: '25–50% in one asset means a significant drop in this position meaningfully affects your overall financial picture. Diversification isn\'t just about upside — it\'s about downside protection.' },
    'very-high': { label: 'Very high concentration', text: 'Over 50% in one asset is a significant risk concentration. Even if the growth case is strong, the downside scenario — a company event, sector downturn, or lockup — could materially set back your timeline.' }
  }[concen];

  // Fingerprint insight
  const patternInsight = {
    oversave:    `You may be holding this asset because selling feels like losing. But holding a concentrated position isn't the same as saving — it's a bet. Make sure it's an intentional one.`,
    emotional:   `Holding company stock often carries emotional weight beyond the numbers — loyalty, identity, optimism. Check whether your growth rate assumption reflects the actual company, or the company you want it to be.`,
    stability:   `Concentration feels stable until it isn't. The diversified path gives up some potential upside in exchange for the kind of stability that holds even if one company has a bad year.`,
    'partner-led': `Asset decisions like this one benefit from being owned independently. The numbers below give you a full picture to reason from — separate from any other voice in the room.`,
    avoidant:    `RSU and stock decisions often get deferred because they feel complicated. The tax hit makes people freeze. But inaction is a choice — holding is a decision, even when it doesn't feel like one.`,
    analytical:  `You can see the growth rate math clearly. The real question is whether your hold-rate assumption is honest. Most people overestimate single-stock growth vs. a diversified index over 10+ years.`
  }[fp.pattern] || `The core question here isn't just which path grows more — it's whether the concentration risk you're carrying is one you've consciously chosen.`;

  return `
    <div style="font-size:11px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:.07em;margin-bottom:10px">Cash Out &amp; Diversify vs. Hold — ${years}-Year View</div>

    ${insightCard('assetalloc', {})}

    <!-- Growth comparison -->
    <div style="font-size:13px;color:#555;margin-bottom:8px;font-weight:600">Projected value in ${years} years</div>
    ${compareGrid(
      {label: 'Hold the asset', metrics: [
        {name: 'Starting value', val: fmt(assetVal)},
        {name: 'Assumed growth rate', val: (holdRet*100).toFixed(1) + '%/yr'},
        {name: `Value in ${years} yrs`, val: fmt(holdFV)},
        {name: 'Gain', val: fmt(holdFV - assetVal)}
      ]},
      {label: 'Cash out & diversify', metrics: [
        {name: 'After-tax proceeds', val: fmt(afterTax), sub: `Tax hit on gains: ${fmt(taxHit)}`},
        {name: 'Assumed growth rate', val: (divRet*100).toFixed(1) + '%/yr'},
        {name: `Value in ${years} yrs`, val: fmt(divFV)},
        {name: 'Gain', val: fmt(divFV - afterTax)}
      ]},
      holdWins ? 'a' : 'b'
    )}

    <!-- Tax hit context -->
    <div class="insight-card">
      <div class="insight-title">The real cost of cashing out</div>
      <div class="insight-text">Selling today triggers an estimated <strong>${fmt(taxHit)}</strong> in taxes on your <strong>${fmt(gain)}</strong> gain — leaving you <strong>${fmt(afterTax)}</strong> to reinvest. That's the price of diversification. ${breakeven ? `At your assumed growth rates, the diversified portfolio <strong>${holdWins ? 'never fully catches up within 30 years' : `catches up to the hold path in approximately ${breakeven} year${breakeven===1?'':'s'}`}</strong>.` : 'At these growth rates, the hold path maintains its advantage throughout the horizon.'}</div>
    </div>

    <!-- Concentration risk -->
    <div class="data-point">
      <div class="data-point-label">Concentration risk — ${concenRisk.label}</div>
      <div class="data-point-text">${concenRisk.text}</div>
    </div>

    <!-- Fingerprint-driven primary step -->
    <div class="insight-card" style="border-color:#1a1a1a;border-width:2px">
      <div class="insight-title">Your most important next step</div>
      <div class="insight-text">${patternInsight}</div>
    </div>

    <!-- Supporting considerations -->
    <div class="assumptions">
      <div class="assumptions-header" onclick="toggleAssump('asset_consider')">
        <span>Other things worth sitting with</span><span id="asset_consider_arrow">▸</span>
      </div>
      <div class="assumptions-body" id="asset_consider">
        <p style="margin-bottom:12px;font-size:13px;color:#555;line-height:1.7"><strong>Growth rate honesty:</strong> The hold path only wins if your assumed ${(holdRet*100).toFixed(1)}% growth rate is realistic. Single stocks carry significantly more volatility than a diversified index — the upside is higher, but so is the downside.</p>
        <p style="margin-bottom:12px;font-size:13px;color:#555;line-height:1.7"><strong>Partial diversification:</strong> You don't have to choose between hold everything or sell everything. Many advisors suggest a systematic approach — selling a percentage over time to manage tax exposure while reducing concentration gradually.</p>
        <p style="margin-bottom:12px;font-size:13px;color:#555;line-height:1.7"><strong>Tax timing:</strong> If you've held the asset for under a year, gains are taxed at ordinary income rates. Over a year typically qualifies for lower long-term capital gains rates. Timing a sale around that threshold can meaningfully change your after-tax proceeds.</p>
        <p style="font-size:13px;color:#555;line-height:1.7"><strong>What this model doesn't capture:</strong> Insider trading windows, lockup periods, 10b5-1 plan requirements, or state-specific tax treatment. These are real constraints — flag them with a tax advisor before acting.</p>
      </div>
    </div>

    <div class="data-point">
      <div class="data-point-label">Research context</div>
      <div class="data-point-text">Fidelity research on concentrated stock positions found that over 10-year periods, diversified portfolios outperformed single-stock holdings more than 70% of the time — even after accounting for the tax cost of selling. The cases where holding wins tend to involve exceptional companies and high conviction held over very long horizons.</div>
    </div>

    ${assumptions([
      `Asset value: ${fmt(assetVal)}, cost basis: ${fmt(basis)}`,
      `Estimated tax rate on gains: ${(taxRate*100).toFixed(0)}%`,
      `Hold growth rate: ${(holdRet*100).toFixed(1)}%/yr — your input`,
      `Diversified growth rate: ${(divRet*100).toFixed(1)}%/yr — your input`,
      `Time horizon: ${years} years`,
      'Model assumes a single lump-sum sale today; does not model partial sales or tax-loss harvesting',
      'Does not account for dividend income, capital gains rate differences (short vs. long term), or AMT'
    ])}`;
}

// ── CUSTOM ────────────────────────────────────────────────────────────────────
function runCustom() {
  const opta = document.getElementById('s_opta')?.value || '';
  const optb = document.getElementById('s_optb')?.value || '';
  const aIncome = v('s_aincome');
  const aCosts  = v('s_acosts');
  const bIncome = v('s_bincome');
  const bCosts  = v('s_bcosts');
  const savings = v('s_csavings');
  const years   = v('s_cyears') || 5;
  const months  = years * 12;
  const ret     = 0.07;

  const aNet = aIncome - aCosts;
  const bNet = bIncome - bCosts;
  const delta = aNet - bNet; // positive = A pays more monthly
  const aSavings = Math.max(0, savings + delta);
  const bSavings = Math.max(0, savings);

  // Opportunity cost: what does the monthly delta compound to over the horizon?
  const oppCost = Math.abs(fv(Math.abs(delta), ret*100, months));
  const aWins = aNet >= bNet;

  // Reversibility signal — heuristic: if income drops >20% in option A, flag it
  const incomeDropPct = bIncome > 0 ? ((bIncome - aIncome) / bIncome) : 0;
  const reversibilityFlag = incomeDropPct > 0.2;

  // Pattern-specific primary action
  const primaryAction = {
    oversave: `You have the savings cushion to absorb some risk here. The real question is whether Option ${aWins?'A':'B'}'s monthly advantage is actually being deployed — or just sitting. Check your savings rate below.`,
    emotional: `Before you commit, name the feeling driving this. Then look at the monthly cash flow comparison. If the numbers support the feeling, you're in good shape. If they don't, that's the conversation to have first.`,
    stability: `The option with more income certainty is Option ${bIncome >= aIncome ? 'B' : 'A'}. We've shown what the certainty premium costs you monthly. Stability has real value — but now you know its price.`,
    'partner-led': `This is your decision to own with full information. The monthly comparison below is what you bring into any conversation about it.`,
    avoidant: `You named both options. That's the hard part. The numbers below are simpler than the decision feels — start with the monthly cash flow difference and work from there.`,
    analytical: `You can see the monthly delta and the compounded opportunity cost below. The math isn't what's stopping you — it's the values conflict. Name which option aligns with what matters most to you right now and move from there.`
  }[fp.pattern] || `Start with the monthly cash flow difference. That's the number that tells you whether this decision is actually a financial tradeoff or a values one.`;

  // Reflect back the core tension
  const tensionText = (() => {
    if (!opta && !optb) return "You're weighing two paths. Let's look at the financial structure of each.";
    if (aNet > bNet) return `Option A brings in more monthly cash flow, but may carry more uncertainty. Option B is the steadier path. The question is whether the ${fmt(Math.abs(delta))}/month difference is worth what you'd be giving up.`;
    if (bNet > aNet) return `Option B is the stronger monthly earner by ${fmt(Math.abs(delta))}. Option A costs you that margin — at least in the short term. Whether the upside of Option A justifies that gap is the real decision.`;
    return `Both options land at roughly the same monthly net. This means the decision is less about the money and more about what each path gives you that the numbers can't capture.`;
  })();

  // Other considerations — pattern-aware, surfaced below the primary action
  const considerations = [
    reversibilityFlag ? `<strong>Reversibility:</strong> Option A represents a significant income change. Before committing, ask: if this isn't working in 12 months, what does it cost to reverse course?` : `<strong>Reversibility:</strong> Neither option appears to represent a dramatic income shift. That gives you more room to course-correct if needed.`,
    `<strong>Savings rate impact:</strong> Option ${aWins?'A':'B'} allows you to save approximately ${fmt(Math.max(aSavings,bSavings))}/month — ${fmt(Math.abs(aSavings-bSavings))} ${aSavings>bSavings?'more':'less'} than the alternative.`,
    `<strong>Opportunity cost:</strong> The ${fmt(Math.abs(delta))}/month cash flow difference, compounded at 7% over ${years} years, equals <strong>${fmt(oppCost)}</strong>. That's the financial cost of choosing the lower-earning option — worth knowing before you decide.`,
    `<strong>What your values say:</strong> You flagged ${(fp.values||[]).join(', ')||'your priorities'} as what matters most right now. Which option actually delivers on that — not in theory, but in practice?`
  ];

  return `
    <div style="font-size:11px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:.07em;margin-bottom:10px">Your Tradeoff</div>

    <!-- Reflect back the tension -->
    <div class="fp-card" style="margin-bottom:1.25rem">
      <div class="fp-title">Here's what we heard</div>
      <div class="fp-insight">${tensionText}</div>
      ${opta ? `<div style="font-size:12px;color:#888;margin-top:10px;padding-top:10px;border-top:1px solid #e8e8e8"><strong style="color:#555">Option A:</strong> ${opta}</div>` : ''}
      ${optb ? `<div style="font-size:12px;color:#888;margin-top:6px"><strong style="color:#555">Option B:</strong> ${optb}</div>` : ''}
    </div>

    <!-- Auto-run monthly math -->
    <div style="font-size:11px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:.07em;margin-bottom:10px">Monthly cash flow comparison</div>
    ${compareGrid(
      {label:'Option A', metrics:[
        {name:'Monthly income',val:fmt(aIncome)},
        {name:'New monthly costs',val:fmt(aCosts)},
        {name:'Net monthly',val:fmt(aNet),sub: aWins ? 'Stronger monthly position' : ''}
      ]},
      {label:'Option B', metrics:[
        {name:'Monthly income',val:fmt(bIncome)},
        {name:'New monthly costs',val:fmt(bCosts)},
        {name:'Net monthly',val:fmt(bNet),sub: !aWins ? 'Stronger monthly position' : ''}
      ]},
      aWins ? 'a' : 'b'
    )}

    <!-- Compounded opportunity cost -->
    <div class="insight-card">
      <div class="insight-title">The compounded cost of that gap</div>
      <div class="insight-text">The ${fmt(Math.abs(delta))}/month difference between these options, invested at 7% over ${years} years, compounds to <strong>${fmt(oppCost)}</strong>. That's what choosing the lower-earning path costs your future self — before factoring in anything else.</div>
    </div>

    <!-- Primary action — fingerprint-driven -->
    <div class="insight-card" style="border-color:#1a1a1a;border-width:2px">
      <div class="insight-title">Your most important next step</div>
      <div class="insight-text">${primaryAction}</div>
    </div>

    <!-- Supporting considerations -->
    <div class="assumptions">
      <div class="assumptions-header" onclick="toggleAssump('custom_consider')">
        <span>Other things worth sitting with</span><span id="custom_consider_arrow">▸</span>
      </div>
      <div class="assumptions-body" id="custom_consider">
        ${considerations.map(c=>`<p style="margin-bottom:12px;font-size:13px;color:#555;line-height:1.7">${c}</p>`).join('')}
      </div>
    </div>

    <div class="disclaimer" style="margin-top:1rem">This tool is for educational purposes only and does not constitute financial advice. For a fully modeled scenario specific to your tax situation, consult a fee-only financial planner.</div>`;
}

// ── Init ──────────────────────────────────────────────────────────────────────
loadFingerprint();
