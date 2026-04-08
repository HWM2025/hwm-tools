var fp = {};
var riskLabel = {protect:'Protect first',balanced:'Balanced',growth:'Growth-oriented'};
var patternLabel = {oversave:'Over-saver',emotional:'Emotionally-led',stability:'Stability-seeker','partner-led':'Partner-led',avoidant:'Avoidant',analytical:'Analytical'};

function loadFingerprint() {
  try {
    var raw = sessionStorage.getItem('hwm_fingerprint');
    if (raw) { fp = JSON.parse(raw); renderFPCard(false); return; }
  } catch(e){}
  fp = {};
  renderFPFallback();
}

function renderFPCard(manual) {
  var tags = '';
  if (fp.risk) tags += '<span class="fp-tag">' + (riskLabel[fp.risk] || fp.risk) + '</span>';
  var vals = fp.values || [];
  for (var i = 0; i < vals.length; i++) tags += '<span class="fp-tag">' + vals[i] + '</span>';
  if (fp.pattern) tags += '<span class="fp-tag">' + (patternLabel[fp.pattern] || fp.pattern) + '</span>';
  if (fp.dep) tags += '<span class="fp-tag">Dependents: ' + fp.dep + '</span>';
  var manualNote = manual ? ' <span style="font-size:10px;font-weight:400;color:#bbb">(entered manually)</span>' : '';
  document.getElementById('te-fpDisplay').innerHTML =
    '<div class="fp-card">' +
      '<div class="fp-title">Your financial fingerprint' + manualNote + '</div>' +
      '<div class="fp-insight">We will use your fingerprint to shape the insight behind each result — not just the numbers, but what they mean for how you actually make decisions.</div>' +
      '<div class="fp-tags">' + tags + '</div>' +
    '</div>';
}

function renderFPFallback() {
  document.getElementById('te-fpDisplay').innerHTML =
    '<div class="fp-fallback"><strong>No fingerprint found from Phase 1.</strong> That is okay — enter a few quick details below so we can personalize your results.</div>' +
    '<div class="section">' +
      '<div class="section-title">Quick fingerprint</div>' +
      '<div style="margin-bottom:1rem">' +
        '<div style="font-size:13px;color:#555;margin-bottom:6px">My priority right now is...</div>' +
        '<div class="chip-group" id="fallRiskChips">' +
          '<div class="chip" onclick="selFallChip(this,\'fallrisk\',\'protect\')">Protect first</div>' +
          '<div class="chip" onclick="selFallChip(this,\'fallrisk\',\'balanced\')">Balanced</div>' +
          '<div class="chip" onclick="selFallChip(this,\'fallrisk\',\'growth\')">Growth-oriented</div>' +
        '</div>' +
      '</div>' +
      '<div style="margin-bottom:1rem">' +
        '<div style="font-size:13px;color:#555;margin-bottom:6px">When I make financial decisions, I tend to...</div>' +
        '<div class="chip-group" id="fallPatternChips">' +
          '<div class="chip" onclick="selFallChip(this,\'fallpattern\',\'oversave\')">Over-save</div>' +
          '<div class="chip" onclick="selFallChip(this,\'fallpattern\',\'emotional\')">Decide emotionally</div>' +
          '<div class="chip" onclick="selFallChip(this,\'fallpattern\',\'stability\')">Default to stability</div>' +
          '<div class="chip" onclick="selFallChip(this,\'fallpattern\',\'avoidant\')">Avoid the numbers</div>' +
          '<div class="chip" onclick="selFallChip(this,\'fallpattern\',\'analytical\')">Run the math, then freeze</div>' +
        '</div>' +
      '</div>' +
      '<div>' +
        '<div style="font-size:13px;color:#555;margin-bottom:6px">What matters most right now?</div>' +
        '<div class="chip-group" id="fallValueChips">' +
          '<div class="chip" onclick="togFallVal(this,\'security\')">Financial security</div>' +
          '<div class="chip" onclick="togFallVal(this,\'family\')">Family stability</div>' +
          '<div class="chip" onclick="togFallVal(this,\'wealth\')">Long-term wealth</div>' +
          '<div class="chip" onclick="togFallVal(this,\'present\')">Present quality of life</div>' +
          '<div class="chip" onclick="togFallVal(this,\'time\')">Time freedom</div>' +
        '</div>' +
      '</div>' +
      '<button class="calc-btn" style="margin-top:1rem" onclick="saveFallback()">Save my fingerprint</button>' +
    '</div>';
}

var fallRisk = '', fallPattern = '', fallValues = [];
function selFallChip(el, group, val) {
  var groupId = group === 'fallrisk' ? 'fallRiskChips' : 'fallPatternChips';
  var chips = document.querySelectorAll('#' + groupId + ' .chip');
  for (var c = 0; c < chips.length; c++) chips[c].classList.remove('on');
  el.classList.add('on');
  if (group === 'fallrisk') fallRisk = val;
  if (group === 'fallpattern') fallPattern = val;
}
function togFallVal(el, val) {
  if (el.classList.contains('on')) {
    el.classList.remove('on');
    var idx = fallValues.indexOf(val);
    if (idx > -1) fallValues.splice(idx, 1);
  } else if (fallValues.length < 3) {
    el.classList.add('on');
    fallValues.push(val);
  }
}
function saveFallback() {
  fp = {risk:fallRisk, pattern:fallPattern, values:fallValues.slice(), dep:'', partner:''};
  try { sessionStorage.setItem('hwm_fingerprint', JSON.stringify(fp)); } catch(e){}
  renderFPCard(true);
}

var currentScenario = '';
var scenarioTitles = {
  buyrent:'Buy vs. continue renting',
  retirement:'Pause vs. continue retirement contributions',
  upsize:'Upsize vs. stay put and invest the difference',
  relocate:'Relocate vs. stay',
  experiences:'Invest now vs. lean into family experiences',
  assetalloc:'Cash out and diversify vs. hold a concentrated asset',
  custom:'Your tradeoff'
};
var scenarioNotes = {
  buyrent:'Enter your current rent and the home you are considering. We will model the 5- and 10-year financial picture for each path.',
  retirement:'We will show you the compounding cost of pausing — and what it takes to catch up.',
  upsize:'What does the bigger home actually cost in opportunity? We will model both paths over 10 years.',
  relocate:'Moving has real upfront costs and long-term financial implications. Let us model both.',
  experiences:'What does redirecting investment dollars toward experiences actually cost over time? Let us find out.',
  assetalloc:'Enter the asset you are holding and what you would move into. We will model both growth paths, the tax hit on cashing out, and the concentration risk you are carrying by staying.',
  custom:'Describe the two options you are weighing, then add the monthly numbers. We will reflect back the tension and run the math automatically.'
};
var scenarioFields = {
  buyrent:
    '<div class="row"><div class="f"><label>Current monthly rent ($)</label><input type="number" id="s_rent" placeholder="2500"/></div><div class="f"><label>Home purchase price ($)</label><input type="number" id="s_price" placeholder="500000"/></div></div>' +
    '<div class="row"><div class="f"><label>Down payment ($)</label><input type="number" id="s_down" placeholder="100000"/></div><div class="f"><label>Estimated mortgage rate (%)</label><input type="number" id="s_rate" placeholder="6.8" step="0.1"/></div></div>' +
    '<div class="row"><div class="f"><label>Annual home appreciation estimate (%)</label><input type="number" id="s_appr" placeholder="3.5" step="0.1"/><span class="hint">Historical US average ~3.5%</span></div><div class="f"><label>Annual investment return if renting (%)</label><input type="number" id="s_invret" placeholder="7" step="0.1"/><span class="hint">S&P 500 long-term avg ~7% real</span></div></div>' +
    '<div class="row"><div class="f"><label>Estimated monthly HOA + maintenance ($)</label><input type="number" id="s_hoa" placeholder="400"/><span class="hint">Rule of thumb: 1% of home value/yr</span></div><div class="f"><label>Annual property tax rate (%)</label><input type="number" id="s_ptax" placeholder="1.1" step="0.1"/></div></div>',
  retirement:
    '<div class="row"><div class="f"><label>Current retirement balance ($)</label><input type="number" id="s_bal" placeholder="150000"/></div><div class="f"><label>Current monthly contribution ($)</label><input type="number" id="s_contrib" placeholder="1000"/></div></div>' +
    '<div class="row"><div class="f"><label>Employer match (% of contribution)</label><input type="number" id="s_match" placeholder="50" step="1"/><span class="hint">e.g. 50 = 50% match up to limit</span></div><div class="f"><label>How many months would you pause?</label><input type="number" id="s_pause" placeholder="12"/></div></div>' +
    '<div class="row"><div class="f"><label>Years until retirement</label><input type="number" id="s_years" placeholder="25"/></div><div class="f"><label>Expected annual return (%)</label><input type="number" id="s_ret" placeholder="7" step="0.1"/></div></div>',
  upsize:
    '<div class="row"><div class="f"><label>Current home value ($)</label><input type="number" id="s_curval" placeholder="400000"/></div><div class="f"><label>Current mortgage payment ($/mo)</label><input type="number" id="s_curpay" placeholder="1800"/></div></div>' +
    '<div class="row"><div class="f"><label>New home price ($)</label><input type="number" id="s_newprice" placeholder="650000"/></div><div class="f"><label>Down payment on new home ($)</label><input type="number" id="s_newdown" placeholder="130000"/></div></div>' +
    '<div class="row"><div class="f"><label>New mortgage rate (%)</label><input type="number" id="s_newrate" placeholder="6.8" step="0.1"/></div><div class="f"><label>Additional monthly costs (HOA, tax, maintenance)</label><input type="number" id="s_newextra" placeholder="600"/></div></div>' +
    '<div class="row"><div class="f"><label>Annual home appreciation (%)</label><input type="number" id="s_appr2" placeholder="3.5" step="0.1"/></div><div class="f"><label>Annual investment return (%)</label><input type="number" id="s_invret2" placeholder="7" step="0.1"/></div></div>',
  relocate:
    '<div class="row"><div class="f"><label>Current monthly housing cost ($)</label><input type="number" id="s_curhous" placeholder="2000"/></div><div class="f"><label>New city monthly housing cost ($)</label><input type="number" id="s_newhous" placeholder="2800"/></div></div>' +
    '<div class="row"><div class="f"><label>One-time moving costs ($)</label><input type="number" id="s_movecost" placeholder="8000"/></div><div class="f"><label>Expected income change ($/mo, negative if lower)</label><input type="number" id="s_incdiff" placeholder="500"/></div></div>' +
    '<div class="row"><div class="f"><label>State income tax difference (% points)</label><input type="number" id="s_taxdiff" placeholder="0" step="0.1"/><span class="hint">Negative = moving to lower-tax state</span></div><div class="f"><label>Gross annual income ($)</label><input type="number" id="s_income" placeholder="120000"/></div></div>' +
    '<div class="row single"><div class="f"><label>Years you plan to stay in new city</label><input type="number" id="s_reloyears" placeholder="5"/></div></div>',
  experiences:
    '<div class="row"><div class="f"><label>Current monthly investment amount ($)</label><input type="number" id="s_curinv" placeholder="1500"/></div><div class="f"><label>How much would you redirect to experiences ($/mo)?</label><input type="number" id="s_expamt" placeholder="800"/></div></div>' +
    '<div class="row"><div class="f"><label>How many years would you do this?</label><input type="number" id="s_expyears" placeholder="5"/></div><div class="f"><label>Expected annual investment return (%)</label><input type="number" id="s_expret" placeholder="7" step="0.1"/></div></div>' +
    '<div class="row single"><div class="f"><label>Years until you would want this money (retirement or goal)</label><input type="number" id="s_totalyears" placeholder="20"/></div></div>',
  assetalloc:
    '<div class="row"><div class="f"><label>Current value of the asset ($)</label><input type="number" id="s_assetval" placeholder="75000"/><span class="hint">RSUs, company stock, single investment</span></div><div class="f"><label>Your cost basis ($)</label><input type="number" id="s_basis" placeholder="20000"/><span class="hint">What you paid / what was taxed at vest. Use 0 if unsure.</span></div></div>' +
    '<div class="row"><div class="f"><label>Your estimated tax rate on gains (%)</label><input type="number" id="s_taxrate" placeholder="28" step="1"/><span class="hint">Federal + state combined. RSUs taxed as ordinary income.</span></div><div class="f"><label>Expected growth rate if you hold (%/yr)</label><input type="number" id="s_holdret" placeholder="8" step="0.1"/><span class="hint">Your honest estimate for this specific asset</span></div></div>' +
    '<div class="row"><div class="f"><label>Expected growth rate if diversified (%/yr)</label><input type="number" id="s_divret" placeholder="7" step="0.1"/><span class="hint">S&P 500 long-term avg ~7% real</span></div><div class="f"><label>Time horizon (years)</label><input type="number" id="s_assetyears" placeholder="10"/></div></div>' +
    '<div style="font-size:13px;color:#555;margin:1rem 0 6px">What percentage of your total investable assets does this represent?</div>' +
    '<div class="chip-group" id="concenChips">' +
      '<div class="chip" onclick="selConcen(this,\'low\')">Under 10%</div>' +
      '<div class="chip" onclick="selConcen(this,\'moderate\')">10-25%</div>' +
      '<div class="chip" onclick="selConcen(this,\'high\')">25-50%</div>' +
      '<div class="chip" onclick="selConcen(this,\'very-high\')">Over 50%</div>' +
    '</div>',
  custom:
    '<div class="row single"><div class="f"><label>Option A — what you are considering</label><textarea id="s_opta" placeholder="e.g. Leave my current job to consult full-time..."></textarea></div></div>' +
    '<div class="row single"><div class="f"><label>Option B — the alternative</label><textarea id="s_optb" placeholder="e.g. Stay in my current role for another 18 months while I build clients on the side..."></textarea></div></div>' +
    '<div style="font-size:12px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:.07em;margin:1rem 0 8px">Monthly cash flow — Option A</div>' +
    '<div class="row"><div class="f"><label>Monthly income under Option A ($)</label><input type="number" id="s_aincome" placeholder="0"/></div><div class="f"><label>New monthly costs Option A adds ($)</label><input type="number" id="s_acosts" placeholder="0"/><span class="hint">e.g. childcare, commute, equipment</span></div></div>' +
    '<div style="font-size:12px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:.07em;margin:1rem 0 8px">Monthly cash flow — Option B</div>' +
    '<div class="row"><div class="f"><label>Monthly income under Option B ($)</label><input type="number" id="s_bincome" placeholder="0"/></div><div class="f"><label>New monthly costs Option B adds ($)</label><input type="number" id="s_bcosts" placeholder="0"/></div></div>' +
    '<div style="font-size:12px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:.07em;margin:1rem 0 8px">Your baseline</div>' +
    '<div class="row"><div class="f"><label>Current monthly savings rate ($)</label><input type="number" id="s_csavings" placeholder="2000"/></div><div class="f"><label>Years this decision affects you</label><input type="number" id="s_cyears" placeholder="5"/><span class="hint">How long before the situation changes?</span></div></div>'
};

function selScenario(el, key) {
  var opts = document.querySelectorAll('.scenario-opt');
  for (var o = 0; o < opts.length; o++) opts[o].classList.remove('on');
  el.classList.add('on');
  currentScenario = key;
  document.getElementById('te-inputPanel').style.display = 'block';
  document.getElementById('te-inputPanelTitle').textContent = scenarioTitles[key] || 'Your numbers';
  document.getElementById('te-inputPanelNote').textContent = scenarioNotes[key] || '';
  document.getElementById('te-inputPanelFields').innerHTML = scenarioFields[key] || '';
  document.getElementById('te-results').style.display = 'none';
  document.getElementById('te-inputPanel').scrollIntoView({behavior:'smooth', block:'start'});
}

function v(id) { var el = document.getElementById(id); return el ? (parseFloat(el.value) || 0) : 0; }
function fmt(n) { return '$' + Math.round(n).toLocaleString(); }

function mortgagePayment(principal, annualRate, years) {
  var r = annualRate / 100 / 12; var n = years * 12;
  if (r === 0) return principal / n;
  return principal * (r * Math.pow(1+r,n)) / (Math.pow(1+r,n)-1);
}
function fvFn(pmt, r, n) {
  var mr = r/12; if (mr === 0) return pmt * n;
  return pmt * (Math.pow(1+mr,n)-1)/mr;
}
function loanBal(principal, annRate, years, paymentYears) {
  var r = annRate/100/12; var n = paymentYears*12;
  var pmt = principal*(r*Math.pow(1+r,n))/(Math.pow(1+r,n)-1);
  var m = years*12;
  return principal*Math.pow(1+r,m)-pmt*(Math.pow(1+r,m)-1)/r;
}

function getInsight(scenario) {
  var pattern = fp.pattern || '';
  var vals = fp.values || [];
  var hasFamily = vals.indexOf('family') > -1;
  var hasWealth = vals.indexOf('wealth') > -1;
  var hasSecurity = vals.indexOf('security') > -1;
  var hasPresent = vals.indexOf('present') > -1;
  var maps = {
    buyrent:{oversave:"You might already know renting is cheaper short-term — but the real question is whether keeping cash liquid is actually serving your goals or just your comfort. Look at the 10-year column before deciding.",emotional:"Homeownership carries a lot of emotional weight. Before you let the feeling drive the decision, look at what the math says over 10 years. The numbers do not care how the kitchen looks.",stability:"Owning does create stability — but it also concentrates risk in one illiquid asset. Renting and investing the difference may actually give you more financial flexibility.",'partner-led':"This is exactly the kind of decision to own with full information. The comparison below gives you the numbers to walk into any conversation with confidence.",avoidant:"This one feels big, and that is probably why it has been sitting. The numbers below are simpler than the decision feels.",analytical:hasSecurity?"You can see both paths clearly. The question is whether stability or optionality matters more to you right now — the math alone will not answer that.":"You will see the numbers clearly. The decision hinges on how you weight liquidity vs. equity — that is a values call, not a math call."},
    retirement:{oversave:"Pausing contributions when you are an over-saver can feel like the responsible move — but the compounding math hits harder than most people expect. See the catch-up cost before you decide.",emotional:"This decision is easy to rationalize in the moment. The 10-year cost in the results below makes the real tradeoff harder to ignore.",stability:"Pausing feels safe — but your future self pays a real price. We have modeled exactly what that price is.",'partner-led':"Retirement savings in your name matters, regardless of household income. This is worth understanding on your own terms.",avoidant:"The compounding cost of a pause is the thing most people do not see until it is too late to fully recover. You are seeing it now.",analytical:"You already know compounding favors staying in. The question is whether the short-term cash flow relief outweighs the long-term cost — here is the number."},
    upsize:{oversave:"The bigger home might be the right call — but you should know what staying put and investing the difference actually builds before you decide.",emotional:hasFamily?"A bigger home for your family makes complete sense emotionally. Let us make sure it makes sense financially too.":"The bigger home might feel like the right move. The numbers below will tell you what you are trading to get there.",stability:"Upsizing concentrates more of your net worth in real estate. That is not necessarily wrong — but it is worth seeing what the alternative builds.",'partner-led':"This is often a joint decision — but you should understand the math independently so you can advocate for what is right for you.",avoidant:"The numbers below are the ones that make this decision a lot clearer. Take a look before you commit.",analytical:hasWealth?"You will see the 10-year wealth gap between both paths. The answer depends on how much weight you put on equity vs. liquid investment returns.":"Two paths, real numbers. The decision comes down to how you value liquidity vs. real estate equity."},
    relocate:{oversave:"The upfront cost of moving is visible. What is less obvious is how the monthly delta compounds over the years you are there.",emotional:"A new city can feel like a reset. Make sure the financial case supports the emotional one — or at minimum, that you can afford the gap if it does not.",stability:"Relocating introduces short-term instability even when the long-term picture is better. We have separated the two so you can see both.",'partner-led':"If this decision affects your household income or housing cost, it is yours to understand fully — not just review.",avoidant:"Moving costs feel overwhelming to model. We have done it for you.",analytical:"You will see the break-even timeline clearly. Whether that timeline feels acceptable is the decision."},
    experiences:{oversave:hasFamily?"You have been saving when you could be living. This tradeoff is worth modeling — because the answer might surprise you in both directions.":"You already save well. This is about whether you are leaving too much quality of life on the table in the process.",emotional:hasFamily?"Family experiences feel urgent in a way that investing does not. The model below shows you exactly what that urgency costs — and lets you decide if it is worth it.":"This is an emotional decision as much as a financial one. Here is what the math looks like.",stability:hasPresent?"You lean toward stability but value the present. This scenario quantifies the cost of leaning into experiences — it may be smaller than you think.":"The opportunity cost of redirecting investment dollars is real. So is the cost of deferring the experiences. We have modeled both.",'partner-led':"How you spend as a family is a conversation worth owning. Here is the financial case you can bring to it.",avoidant:"This one often gets avoided because the cost feels abstract. We have made it concrete.",analytical:hasFamily?"You can calculate the opportunity cost. What you cannot calculate is whether your kids will remember the vacations. That is the real tradeoff.":"The numbers are below. The decision depends on how you weight present quality of life against future wealth."},
    assetalloc:{oversave:"Holding a concentrated asset can feel like the conservative move — but concentration is risk, not safety. Make sure staying put is an intentional decision, not a default.",emotional:"Company stock often carries loyalty and identity alongside the dollars. The model below separates the financial case from the emotional one — both matter, but they should be weighed separately.",stability:"Diversification is actually the stability play here. A concentrated position can swing hard in either direction — the diversified path trades some upside for more predictable outcomes.",'partner-led':"Asset allocation decisions like this one are worth owning with full clarity. The comparison below gives you everything you need to reason through it independently.",avoidant:"The tax hit makes this feel complicated, which is why a lot of people do not act. We have modeled it — the number is real, but so is the risk of staying concentrated.",analytical:hasWealth?"You will see the growth math clearly. The honest question is whether your hold-rate assumption is realistic for this specific asset over this specific timeframe.":"The math is below. The decision hinges on how much conviction you have in your hold-rate assumption vs. a diversified alternative."},
    custom:{oversave:"You may be undervaluing the option that creates more liquidity. Look at what each path does to your monthly cash position.",emotional:"Your gut brought you here — now let us give it some numbers to work with.",stability:"The path that feels safer may not be the one that builds more over time. We will flag where they diverge.",'partner-led':"You are here doing this yourself. That matters. Use the framework below to build your own perspective before any conversation.",avoidant:"You framed the question. That is the hardest part.",analytical:"You have got the structure. We will add the financial framing so you can move from analysis to decision."}
  };
  var sm = maps[scenario] || {};
  return sm[pattern] || sm['analytical'] || "We will use your fingerprint to frame what these numbers mean for your specific situation and decision style.";
}

var currentConcentration = '';
function selConcen(el, val) {
  var chips = document.querySelectorAll('#concenChips .chip');
  for (var c = 0; c < chips.length; c++) chips[c].classList.remove('on');
  el.classList.add('on');
  currentConcentration = val;
}

function runScenario() {
  var s = currentScenario;
  var html = '';
  if (s === 'buyrent') html = runBuyRent();
  else if (s === 'retirement') html = runRetirement();
  else if (s === 'upsize') html = runUpsize();
  else if (s === 'relocate') html = runRelocate();
  else if (s === 'experiences') html = runExperiences();
  else if (s === 'assetalloc') html = runAssetAlloc();
  else if (s === 'custom') html = runCustom();
  document.getElementById('te-resultsInner').innerHTML = html;
  document.getElementById('te-results').style.display = 'block';
  document.getElementById('te-results').scrollIntoView({behavior:'smooth', block:'start'});
}

function insightCard(scenario) {
  return '<div class="insight-card"><div class="insight-title">Your fingerprint says</div><div class="insight-text">' + getInsight(scenario) + '</div></div>';
}

var assumpCounter = 0;
function assumptionsBlock(items) {
  assumpCounter++;
  var id = 'assump_' + assumpCounter;
  var li = '';
  for (var i = 0; i < items.length; i++) li += '<li>' + items[i] + '</li>';
  return '<div class="assumptions"><div class="assumptions-header" onclick="toggleAssump(\'' + id + '\')"><span>Assumptions used in this model</span><span id="' + id + '_arrow">&#9658;</span></div><div class="assumptions-body" id="' + id + '"><ul>' + li + '</ul></div></div>';
}
function toggleAssump(id) {
  var el = document.getElementById(id); var arrow = document.getElementById(id+'_arrow');
  el.classList.toggle('open');
  arrow.innerHTML = el.classList.contains('open') ? '&#9660;' : '&#9658;';
}

function compareGrid(optA, optB, winnerKey) {
  var aWins = winnerKey === 'a';
  var am = '', bm = '';
  for (var i = 0; i < optA.metrics.length; i++) { var m = optA.metrics[i]; am += '<div class="compare-metric"><div class="compare-metric-name">'+m.name+'</div><div class="compare-metric-val">'+m.val+'</div>'+(m.sub?'<div class="compare-metric-sub">'+m.sub+'</div>':'')+'</div>'; }
  for (var j = 0; j < optB.metrics.length; j++) { var n = optB.metrics[j]; bm += '<div class="compare-metric"><div class="compare-metric-name">'+n.name+'</div><div class="compare-metric-val">'+n.val+'</div>'+(n.sub?'<div class="compare-metric-sub">'+n.sub+'</div>':'')+'</div>'; }
  return '<div class="compare-grid"><div class="compare-card '+(aWins?'winner':'')+'"><div class="compare-label '+(aWins?'win-label':'')+'">'+optA.label+(aWins?'<span class="badge">Stronger financially</span>':'')+'</div>'+am+'</div><div class="compare-card '+(!aWins?'winner':'')+'"><div class="compare-label '+(!aWins?'win-label':'')+'">'+optB.label+(!aWins?'<span class="badge">Stronger financially</span>':'')+'</div>'+bm+'</div></div>';
}

function runBuyRent() {
  var rent=v('s_rent'),price=v('s_price'),down=v('s_down'),rate=v('s_rate')||6.8,appr=(v('s_appr')||3.5)/100,invret=(v('s_invret')||7)/100,hoa=v('s_hoa'),ptax=(v('s_ptax')||1.1)/100;
  var loan=price-down,mp=mortgagePayment(loan,rate,30),tbm=mp+(price*ptax/12)+hoa,md=tbm-rent;
  var hv5=price*Math.pow(1+appr,5),hv10=price*Math.pow(1+appr,10);
  var b5=loanBal(loan,rate,5,30),b10=loanBal(loan,rate,10,30);
  var ne5=hv5-b5-down,ne10=hv10-b10-down;
  var rd5=down*Math.pow(1+invret,5)+(md>0?fvFn(md,invret*100,60):0)-down;
  var rdd10=md>0?fvFn(md,invret*100,120):0;
  var rd10=down*Math.pow(1+invret,10)+rdd10-down;
  return '<div style="font-size:11px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:.07em;margin-bottom:10px">Buy vs. Rent</div>'+insightCard('buyrent')+
    '<div style="font-size:13px;color:#555;margin-bottom:8px;font-weight:600">5-year net position</div>'+
    compareGrid({label:'Buying',metrics:[{name:'Monthly cost',val:fmt(tbm),sub:'Mortgage + tax + HOA'},{name:'Net equity gain',val:fmt(ne5),sub:'Beyond down payment'},{name:'Total housing cost',val:fmt(tbm*60)}]},{label:'Renting',metrics:[{name:'Monthly cost',val:fmt(rent)},{name:'Investment gain',val:fmt(rd5),sub:'Down payment invested + savings'},{name:'Total housing cost',val:fmt(rent*60)}]},ne5>rd5?'a':'b')+
    '<div style="font-size:13px;color:#555;margin-bottom:8px;font-weight:600;margin-top:1rem">10-year net position</div>'+
    compareGrid({label:'Buying',metrics:[{name:'Home value',val:fmt(hv10)},{name:'Net equity gain',val:fmt(ne10),sub:'Above down payment'},{name:'Equity return',val:((ne10/down)*100).toFixed(0)+'%'}]},{label:'Renting',metrics:[{name:'Portfolio value',val:fmt(down*Math.pow(1+invret,10)+rdd10)},{name:'Investment gain',val:fmt(rd10),sub:'Above initial down payment'},{name:'Investment return',val:((rd10/down)*100).toFixed(0)+'%'}]},ne10>rd10?'a':'b')+
    '<div class="data-point"><div class="data-point-label">Research context</div><div class="data-point-text">According to Fidelity, the average homeowner net worth is significantly higher than renters over time — but much of that gap is explained by forced savings through equity, not home price appreciation alone. In high-cost markets, renting and investing the difference has historically been competitive.</div></div>'+
    assumptionsBlock(['Home appreciates at '+(v('s_appr')||3.5)+'% annually','Investments return '+(v('s_invret')||7)+'% annually','30-year fixed mortgage at '+(v('s_rate')||6.8)+'%','Monthly HOA + maintenance: '+fmt(hoa),'Property tax: '+(v('s_ptax')||1.1)+'% annually','Does not include home sale transaction costs (~6%), mortgage interest tax deduction, or rental price increases','Down payment is the same capital in both scenarios']);
}

function runRetirement() {
  var bal=v('s_bal'),contrib=v('s_contrib'),matchPct=(v('s_match')||0)/100,pauseMonths=v('s_pause'),years=v('s_years'),ret=(v('s_ret')||7)/100,mr=ret/12,totalMonths=years*12;
  var ec=contrib*(1+matchPct);
  var contFV=bal*Math.pow(1+ret,years)+fvFn(ec,ret*100,totalMonths);
  var bap=bal*Math.pow(1+mr,pauseMonths),rem=totalMonths-pauseMonths;
  var pauseFV=bap*Math.pow(1+ret,(years-pauseMonths/12))+(rem>0?fvFn(ec,ret*100,rem):0);
  var cost=contFV-pauseFV,lm=contrib*matchPct*pauseMonths;
  var catchUp=cost/fvFn(1,ret*100,totalMonths-pauseMonths)*(1+matchPct);
  return '<div style="font-size:11px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:.07em;margin-bottom:10px">Pause vs. Continue Contributions</div>'+insightCard('retirement')+
    compareGrid({label:'Continue contributing',metrics:[{name:'Projected balance at retirement',val:fmt(contFV)},{name:'Monthly contribution (with match)',val:fmt(ec)},{name:'Employer match kept',val:fmt(contrib*matchPct*12)+'/yr'}]},{label:'Pause '+pauseMonths+' months',metrics:[{name:'Projected balance at retirement',val:fmt(pauseFV)},{name:'Cost of the pause',val:fmt(cost),sub:'Lost compounding + missed match'},{name:'Lost employer match',val:fmt(lm)}]},'a')+
    '<div class="data-point"><div class="data-point-label">Research context</div><div class="data-point-text">The Center for American Progress found that women face a retirement savings gap that compounds over time due to career interruptions. A '+pauseMonths+'-month pause early in your savings timeline costs more than the same pause later — compounding amplifies the gap the longer money has to grow.</div></div>'+
    '<div class="insight-card"><div class="insight-title">To fully catch up after a '+pauseMonths+'-month pause</div><div class="insight-text">You would need to contribute an extra <strong>'+fmt(Math.max(0,catchUp))+'/month</strong> for the remainder of your savings timeline to arrive at the same place.</div></div>'+
    assumptionsBlock(['Current balance: '+fmt(bal),'Monthly contribution: '+fmt(contrib)+' + '+(matchPct*100).toFixed(0)+'% employer match','Expected return: '+(v('s_ret')||7)+'% annually','Years to retirement: '+years,'Does not account for contribution limit changes, taxes on withdrawal, or future income changes','Employer match assumed to stop during pause and resume after']);
}

function runUpsize() {
  var curval=v('s_curval'),curpay=v('s_curpay'),newprice=v('s_newprice'),newdown=v('s_newdown'),newrate=v('s_newrate')||6.8,newextra=v('s_newextra'),appr=(v('s_appr2')||3.5)/100,invret=(v('s_invret2')||7)/100;
  var newloan=newprice-newdown,newpmt=mortgagePayment(newloan,newrate,30),tnm=newpmt+newextra,md=tnm-curpay;
  var nv10=newprice*Math.pow(1+appr,10),nb10=loanBal(newloan,newrate,10,30),un10=nv10-nb10;
  var si10=newdown*Math.pow(1+invret,10)+fvFn(md,invret*100,120),sn10=curval*Math.pow(1+appr,10)+si10;
  return '<div style="font-size:11px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:.07em;margin-bottom:10px">Upsize vs. Stay + Invest — 10 Year View</div>'+insightCard('upsize')+
    compareGrid({label:'Upsize',metrics:[{name:'New monthly housing cost',val:fmt(tnm)},{name:'Monthly increase vs. today',val:fmt(md)},{name:'New home value in 10 yrs',val:fmt(nv10)},{name:'Net equity in 10 yrs',val:fmt(un10),sub:'Value minus remaining loan'}]},{label:'Stay + invest the difference',metrics:[{name:'Monthly housing cost',val:fmt(curpay),sub:'Unchanged'},{name:'Down payment invested (10 yr)',val:fmt(newdown*Math.pow(1+invret,10))},{name:'Monthly delta invested (10 yr)',val:fmt(fvFn(md,invret*100,120))},{name:'Total net position',val:fmt(sn10),sub:'Current home equity + investments'}]},un10>sn10?'a':'b')+
    '<div class="data-point"><div class="data-point-label">Research context</div><div class="data-point-text">McKinsey research on household wealth building found that real estate and equity markets have historically produced similar long-run returns — but real estate concentrates risk in a single illiquid asset. The choice between them often comes down to how much liquidity flexibility matters to your stage of life.</div></div>'+
    assumptionsBlock(['New home: '+fmt(newprice)+', down: '+fmt(newdown)+', rate: '+newrate+'%','Home appreciation: '+(v('s_appr2')||3.5)+'% annually','Investment return: '+(v('s_invret2')||7)+'% annually','Current home equity included in stay net position','Does not include transaction costs on either home sale (~6%), maintenance cost differences, or tax implications']);
}

function runRelocate() {
  var curhous=v('s_curhous'),newhous=v('s_newhous'),movecost=v('s_movecost'),incdiff=v('s_incdiff'),taxdiff=v('s_taxdiff')/100,income=v('s_income'),years=v('s_reloyears')||5;
  var md=newhous-curhous-incdiff+(income*taxdiff/12);
  var ts=md<0?Math.abs(md)*years*12-movecost:0;
  var be=md<0?Math.ceil(movecost/Math.abs(md)):null;
  var netLabel=md<0?fmt(ts)+' ahead':fmt(movecost+(md>0?md*years*12:0))+' behind';
  var netSub=be?'Break-even: '+be+' months':'Move costs more over this period';
  var beHtml='';
  if(be){var clears=years*12>be?'Your planned timeline clears that bar.':'Your current timeline does not clear that bar — worth factoring into the decision.';beHtml='<div class="insight-card"><div class="insight-title">Your break-even point</div><div class="insight-text">Based on your inputs, you would need to stay in the new city for at least <strong>'+be+' months ('+((be/12).toFixed(1))+' years)</strong> for the move to make financial sense. '+clears+'</div></div>';}
  return '<div style="font-size:11px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:.07em;margin-bottom:10px">Relocate vs. Stay — '+years+'-Year View</div>'+insightCard('relocate')+
    compareGrid({label:'Stay',metrics:[{name:'Monthly housing cost',val:fmt(curhous)},{name:'Upfront cost',val:'$0'},{name:years+'-yr housing total',val:fmt(curhous*years*12)},{name:'Net financial position',val:'Baseline'}]},{label:'Relocate',metrics:[{name:'New monthly housing cost',val:fmt(newhous)},{name:'One-time moving cost',val:fmt(movecost)},{name:years+'-yr all-in cost',val:fmt(movecost+newhous*years*12)},{name:'Net vs. staying ('+years+' yrs)',val:netLabel,sub:netSub}]},ts>0?'b':'a')+
    '<div class="data-point"><div class="data-point-label">Research context</div><div class="data-point-text">Allianz research on financial transitions found that geographic moves made during career inflection points can either accelerate or erode wealth significantly depending on housing cost differentials and income changes. The break-even timeline is the number that matters most.</div></div>'+beHtml+
    assumptionsBlock(['Monthly housing cost change: '+fmt(Math.abs(newhous-curhous))+' '+(newhous>curhous?'higher':'lower'),'Income change: '+(incdiff>=0?'+':'')+fmt(incdiff)+'/mo','State tax rate difference: '+(v('s_taxdiff')||0)+'% on '+fmt(income)+' gross income','One-time moving costs: '+fmt(movecost),'Time horizon: '+years+' years','Does not include cost-of-living differences beyond housing or real estate transaction costs if you own']);
}

function runExperiences() {
  var curinv=v('s_curinv'),expamt=v('s_expamt'),expyears=v('s_expyears'),ret=(v('s_expret')||7)/100,totalyears=v('s_totalyears');
  var redirected=Math.min(expamt,curinv),remaining=curinv-redirected,expMonths=expyears*12,totalMonths=totalyears*12;
  var fullFV=fvFn(curinv,ret*100,totalMonths);
  var rFV=fvFn(remaining,ret*100,expMonths)*Math.pow(1+ret,totalyears-expyears)+fvFn(curinv,ret*100,(totalyears-expyears)*12);
  var cost=fullFV-rFV,budget=redirected*expMonths;
  return '<div style="font-size:11px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:.07em;margin-bottom:10px">Invest vs. Lean Into Experiences — '+totalyears+'-Year View</div>'+insightCard('experiences')+
    compareGrid({label:'Invest full '+fmt(curinv)+'/mo',metrics:[{name:'Monthly invested',val:fmt(curinv)},{name:'Projected portfolio',val:fmt(fullFV)},{name:'Experiences budget',val:'$0',sub:'Over '+expyears+' years'}]},{label:'Redirect '+fmt(redirected)+'/mo to experiences',metrics:[{name:'Monthly invested',val:fmt(remaining),sub:'For '+expyears+' years, then back to '+fmt(curinv)},{name:'Projected portfolio',val:fmt(rFV)},{name:'Experiences budget',val:fmt(budget),sub:'Over '+expyears+' years'}]},'a')+
    '<div class="insight-card"><div class="insight-title">The real cost of the experiences path</div><div class="insight-text">Redirecting '+fmt(redirected)+'/month for '+expyears+' years funds <strong>'+fmt(budget)+' in experiences</strong> — and costs your future self approximately <strong>'+fmt(cost)+'</strong> in portfolio value at year '+totalyears+'. Whether that tradeoff is worth it is exactly the kind of decision this tool cannot make for you — but now you know the number.</div></div>'+
    '<div class="data-point"><div class="data-point-label">Research context</div><div class="data-point-text">Research consistently shows experiential spending produces longer-lasting wellbeing than material purchases — but that finding is about relative allocation, not about stopping investment entirely. The question is how much of each, for how long.</div></div>'+
    assumptionsBlock(['Investment return: '+(v('s_expret')||7)+'% annually','Redirection period: '+expyears+' years, then full contributions resume','Total time horizon: '+totalyears+' years','Does not account for tax-advantaged account limits or inflation adjustment on contributions','Portfolio projections are pre-tax']);
}

function runAssetAlloc() {
  var assetVal=v('s_assetval'),basis=v('s_basis'),taxRate=(v('s_taxrate')||28)/100,holdRet=(v('s_holdret')||8)/100,divRet=(v('s_divret')||7)/100,years=v('s_assetyears')||10;
  var concen=currentConcentration||'moderate';
  var gain=Math.max(0,assetVal-basis),taxHit=gain*taxRate,afterTax=assetVal-taxHit;
  var holdFV=assetVal*Math.pow(1+holdRet,years),divFV=afterTax*Math.pow(1+divRet,years);
  var breakeven=null;
  for(var y=1;y<=30;y++){if(afterTax*Math.pow(1+divRet,y)>=assetVal*Math.pow(1+holdRet,y)){breakeven=y;break;}}
  var holdWins=holdFV>divFV;
  var cmap={low:{label:'Low concentration',text:'Under 10% of your portfolio — generally within a healthy range. The decision is more about growth rate conviction than diversification urgency.'},moderate:{label:'Moderate concentration',text:'10-25% in a single asset is worth watching. If this position has grown beyond your original target allocation, that alone is a signal to revisit.'},high:{label:'High concentration',text:'25-50% in one asset means a significant drop in this position meaningfully affects your overall financial picture. Diversification is about downside protection, not just upside.'},'very-high':{label:'Very high concentration',text:'Over 50% in one asset is a significant risk concentration. Even if the growth case is strong, a company event, sector downturn, or lockup could materially set back your timeline.'}};
  var cr=cmap[concen]||cmap['moderate'];
  var pi={oversave:'You may be holding this asset because selling feels like losing. But holding a concentrated position is not the same as saving — it is a bet. Make sure it is an intentional one.',emotional:'Holding company stock often carries emotional weight beyond the numbers — loyalty, identity, optimism. Check whether your growth rate assumption reflects the actual company, or the company you want it to be.',stability:'Concentration feels stable until it is not. The diversified path gives up some potential upside in exchange for the kind of stability that holds even if one company has a bad year.','partner-led':'Asset decisions like this one benefit from being owned independently. The numbers below give you a full picture to reason from — separate from any other voice in the room.',avoidant:'RSU and stock decisions often get deferred because they feel complicated. The tax hit makes people freeze. But inaction is a choice — holding is a decision, even when it does not feel like one.',analytical:'You can see the growth rate math clearly. The real question is whether your hold-rate assumption is honest. Most people overestimate single-stock growth vs. a diversified index over 10+ years.'};
  var patternInsight=pi[fp.pattern]||'The core question here is not just which path grows more — it is whether the concentration risk you are carrying is one you have consciously chosen.';
  var beText=breakeven?(holdWins?'At your assumed growth rates, the diversified portfolio never fully catches up within 30 years.':'At your assumed growth rates, the diversified portfolio catches up to the hold path in approximately '+breakeven+' year'+(breakeven===1?'':'s')+'.'):'At these growth rates, the hold path maintains its advantage throughout the horizon.';
  var cid='asset_consider_'+(++assumpCounter);
  var considerHtml='<div class="assumptions"><div class="assumptions-header" onclick="toggleAssump(\''+cid+'\')"><span>Other things worth sitting with</span><span id="'+cid+'_arrow">&#9658;</span></div><div class="assumptions-body" id="'+cid+'"><p style="margin-bottom:12px;font-size:13px;color:#555;line-height:1.7"><strong>Growth rate honesty:</strong> The hold path only wins if your assumed '+(holdRet*100).toFixed(1)+'% growth rate is realistic. Single stocks carry significantly more volatility than a diversified index.</p><p style="margin-bottom:12px;font-size:13px;color:#555;line-height:1.7"><strong>Partial diversification:</strong> You do not have to choose between hold everything or sell everything. Many advisors suggest selling a percentage over time to manage tax exposure while reducing concentration gradually.</p><p style="margin-bottom:12px;font-size:13px;color:#555;line-height:1.7"><strong>Tax timing:</strong> If you have held the asset for under a year, gains are taxed at ordinary income rates. Over a year typically qualifies for lower long-term capital gains rates.</p><p style="font-size:13px;color:#555;line-height:1.7"><strong>What this model does not capture:</strong> Insider trading windows, lockup periods, 10b5-1 plan requirements, or state-specific tax treatment. Flag these with a tax advisor before acting.</p></div></div>';
  return '<div style="font-size:11px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:.07em;margin-bottom:10px">Cash Out &amp; Diversify vs. Hold — '+years+'-Year View</div>'+insightCard('assetalloc')+
    '<div style="font-size:13px;color:#555;margin-bottom:8px;font-weight:600">Projected value in '+years+' years</div>'+
    compareGrid({label:'Hold the asset',metrics:[{name:'Starting value',val:fmt(assetVal)},{name:'Assumed growth rate',val:(holdRet*100).toFixed(1)+'%/yr'},{name:'Value in '+years+' yrs',val:fmt(holdFV)},{name:'Gain',val:fmt(holdFV-assetVal)}]},{label:'Cash out and diversify',metrics:[{name:'After-tax proceeds',val:fmt(afterTax),sub:'Tax hit on gains: '+fmt(taxHit)},{name:'Assumed growth rate',val:(divRet*100).toFixed(1)+'%/yr'},{name:'Value in '+years+' yrs',val:fmt(divFV)},{name:'Gain',val:fmt(divFV-afterTax)}]},holdWins?'a':'b')+
    '<div class="insight-card"><div class="insight-title">The real cost of cashing out</div><div class="insight-text">Selling today triggers an estimated <strong>'+fmt(taxHit)+'</strong> in taxes on your <strong>'+fmt(gain)+'</strong> gain — leaving you <strong>'+fmt(afterTax)+'</strong> to reinvest. '+beText+'</div></div>'+
    '<div class="data-point"><div class="data-point-label">Concentration risk — '+cr.label+'</div><div class="data-point-text">'+cr.text+'</div></div>'+
    '<div class="insight-card" style="border-color:#1a1a1a;border-width:2px"><div class="insight-title">Your most important next step</div><div class="insight-text">'+patternInsight+'</div></div>'+
    considerHtml+
    '<div class="data-point"><div class="data-point-label">Research context</div><div class="data-point-text">Fidelity research on concentrated stock positions found that over 10-year periods, diversified portfolios outperformed single-stock holdings more than 70% of the time — even after accounting for the tax cost of selling.</div></div>'+
    assumptionsBlock(['Asset value: '+fmt(assetVal)+', cost basis: '+fmt(basis),'Estimated tax rate on gains: '+(taxRate*100).toFixed(0)+'%','Hold growth rate: '+(holdRet*100).toFixed(1)+'%/yr','Diversified growth rate: '+(divRet*100).toFixed(1)+'%/yr','Time horizon: '+years+' years','Model assumes a single lump-sum sale today; does not model partial sales or tax-loss harvesting','Does not account for dividend income, capital gains rate differences, or AMT']);
}

function runCustom() {
  var optaEl=document.getElementById('s_opta'),optbEl=document.getElementById('s_optb');
  var opta=optaEl?optaEl.value:'',optb=optbEl?optbEl.value:'';
  var aIncome=v('s_aincome'),aCosts=v('s_acosts'),bIncome=v('s_bincome'),bCosts=v('s_bcosts'),savings=v('s_csavings'),years=v('s_cyears')||5;
  var aNet=aIncome-aCosts,bNet=bIncome-bCosts,delta=aNet-bNet,months=years*12;
  var oppCost=Math.abs(fvFn(Math.abs(delta),0.07*100,months));
  var aWins=aNet>=bNet,aSavings=Math.max(0,savings+delta),bSavings=Math.max(0,savings);
  var incDropPct=bIncome>0?(bIncome-aIncome)/bIncome:0,revFlag=incDropPct>0.2;
  var pas={oversave:'You have the savings cushion to absorb some risk here. The real question is whether Option '+(aWins?'A':'B')+' monthly advantage is actually being deployed — or just sitting.',emotional:'Before you commit, name the feeling driving this. Then look at the monthly cash flow comparison. If the numbers support the feeling, you are in good shape.',stability:'The option with more income certainty is Option '+(bIncome>=aIncome?'B':'A')+'. We have shown what the certainty premium costs you monthly. Stability has real value — but now you know its price.','partner-led':'This is your decision to own with full information. The monthly comparison below is what you bring into any conversation about it.',avoidant:'You named both options. That is the hard part. The numbers below are simpler than the decision feels — start with the monthly cash flow difference.',analytical:'You can see the monthly delta and the compounded opportunity cost below. The math is not what is stopping you — it is the values conflict. Name which option aligns with what matters most to you right now.'};
  var primaryAction=pas[fp.pattern]||'Start with the monthly cash flow difference. That is the number that tells you whether this decision is actually a financial tradeoff or a values one.';
  var tensionText;
  if(!opta&&!optb) tensionText='You are weighing two paths. Let us look at the financial structure of each.';
  else if(aNet>bNet) tensionText='Option A brings in more monthly cash flow, but may carry more uncertainty. Option B is the steadier path. The question is whether the '+fmt(Math.abs(delta))+'/month difference is worth what you would be giving up.';
  else if(bNet>aNet) tensionText='Option B is the stronger monthly earner by '+fmt(Math.abs(delta))+'. Option A costs you that margin — at least in the short term. Whether the upside of Option A justifies that gap is the real decision.';
  else tensionText='Both options land at roughly the same monthly net. This means the decision is less about the money and more about what each path gives you that the numbers cannot capture.';
  var vals=fp.values||[];
  var cid='custom_consider_'+(++assumpCounter);
  var considerHtml='<div class="assumptions"><div class="assumptions-header" onclick="toggleAssump(\''+cid+'\')"><span>Other things worth sitting with</span><span id="'+cid+'_arrow">&#9658;</span></div><div class="assumptions-body" id="'+cid+'">'+'<p style="margin-bottom:12px;font-size:13px;color:#555;line-height:1.7"><strong>Reversibility:</strong> '+(revFlag?'Option A represents a significant income change. Before committing, ask: if this is not working in 12 months, what does it cost to reverse course?':'Neither option appears to represent a dramatic income shift. That gives you more room to course-correct if needed.')+'</p>'+'<p style="margin-bottom:12px;font-size:13px;color:#555;line-height:1.7"><strong>Savings rate impact:</strong> Option '+(aWins?'A':'B')+' allows you to save approximately '+fmt(Math.max(aSavings,bSavings))+'/month — '+fmt(Math.abs(aSavings-bSavings))+' '+(aSavings>bSavings?'more':'less')+' than the alternative.</p>'+'<p style="margin-bottom:12px;font-size:13px;color:#555;line-height:1.7"><strong>Opportunity cost:</strong> The '+fmt(Math.abs(delta))+'/month cash flow difference, compounded at 7% over '+years+' years, equals <strong>'+fmt(oppCost)+'</strong>.</p>'+'<p style="font-size:13px;color:#555;line-height:1.7"><strong>What your values say:</strong> You flagged '+(vals.length>0?vals.join(', '):'your priorities')+' as what matters most right now. Which option actually delivers on that?</p>'+'</div></div>';
  return '<div style="font-size:11px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:.07em;margin-bottom:10px">Your Tradeoff</div>'+
    '<div class="fp-card" style="margin-bottom:1.25rem"><div class="fp-title">Here is what we heard</div><div class="fp-insight">'+tensionText+'</div>'+(opta?'<div style="font-size:12px;color:#888;margin-top:10px;padding-top:10px;border-top:1px solid #e8e8e8"><strong style="color:#555">Option A:</strong> '+opta+'</div>':'')+(optb?'<div style="font-size:12px;color:#888;margin-top:6px"><strong style="color:#555">Option B:</strong> '+optb+'</div>':'')+'</div>'+
    '<div style="font-size:11px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:.07em;margin-bottom:10px">Monthly cash flow comparison</div>'+
    compareGrid({label:'Option A',metrics:[{name:'Monthly income',val:fmt(aIncome)},{name:'New monthly costs',val:fmt(aCosts)},{name:'Net monthly',val:fmt(aNet),sub:aWins?'Stronger monthly position':''}]},{label:'Option B',metrics:[{name:'Monthly income',val:fmt(bIncome)},{name:'New monthly costs',val:fmt(bCosts)},{name:'Net monthly',val:fmt(bNet),sub:!aWins?'Stronger monthly position':''}]},aWins?'a':'b')+
    '<div class="insight-card"><div class="insight-title">The compounded cost of that gap</div><div class="insight-text">The '+fmt(Math.abs(delta))+'/month difference, invested at 7% over '+years+' years, compounds to <strong>'+fmt(oppCost)+'</strong>. That is what choosing the lower-earning path costs your future self.</div></div>'+
    '<div class="insight-card" style="border-color:#1a1a1a;border-width:2px"><div class="insight-title">Your most important next step</div><div class="insight-text">'+primaryAction+'</div></div>'+
    considerHtml;
}

loadFingerprint();
