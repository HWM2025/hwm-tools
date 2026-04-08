var expDefaults = {
  essential:[{l:'Rent / mortgage'},{l:'Groceries'},{l:'Utilities'},{l:'Insurance (health, auto, home)'},{l:'Minimum debt payments'},{l:'Childcare / school'}],
  flex:[{l:'Dining out'},{l:'Subscriptions'},{l:'Personal care'},{l:'Clothing'},{l:'Entertainment'}],
  lifestyle:[{l:'Travel / vacations'},{l:'Fitness / wellness'},{l:'Home goods / decor'},{l:'Gifts'},{l:'Other'}]
};

function renderExpenses(){
  ['essential','flex','lifestyle'].forEach(function(tier){
    var el=document.getElementById(tier+'Exp');
    el.innerHTML='';
    expDefaults[tier].forEach(function(item){
      var d=document.createElement('div');
      d.style.cssText='display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:8px';
      d.innerHTML='<div class="f" style="grid-column:1/3"><label>'+item.l+'</label><input type="number" class="exp-'+tier+'" placeholder="$ 0"/></div>';
      el.appendChild(d);
    });
    var btn=document.createElement('span');
    btn.className='add-row';
    btn.textContent='+ Add expense';
    btn.onclick=function(){ addExp(tier); };
    el.appendChild(btn);
  });
}

function addExp(tier){
  var el=document.getElementById(tier+'Exp');
  var btn=el.lastChild;
  var d=document.createElement('div');
  d.style.cssText='display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:8px';
  d.innerHTML='<div class="f"><label>Description</label><input type="text" placeholder="Label" style="height:38px;padding:0 11px;border:1px solid #ddd;border-radius:8px;font-size:14px;color:#1a1a1a;width:100%;background:#fafafa"/></div><div class="f"><label>Amount</label><input type="number" class="exp-'+tier+'" placeholder="$ 0"/></div>';
  el.insertBefore(d,btn);
}

var oneTimeItems=[];
function addOneTime(){
  oneTimeItems.push({label:'',amount:0});
  renderOneTime();
}
function renderOneTime(){
  var el=document.getElementById('oneTimeList');
  el.innerHTML='';
  for(var i=0;i<oneTimeItems.length;i++){
    var d=document.createElement('div');
    d.style.cssText='display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:8px';

    var descWrap=document.createElement('div');
    descWrap.className='f';
    var descLabel=document.createElement('label');
    descLabel.textContent='Description';
    var descInput=document.createElement('input');
    descInput.type='text';
    descInput.placeholder='e.g. Severance lump sum';
    descInput.style.cssText='height:38px;padding:0 11px;border:1px solid #ddd;border-radius:8px;font-size:14px;color:#1a1a1a;width:100%;background:#fafafa';
    (function(idx){ descInput.oninput=function(){ oneTimeItems[idx].label=this.value; }; })(i);
    descWrap.appendChild(descLabel);
    descWrap.appendChild(descInput);

    var amtWrap=document.createElement('div');
    amtWrap.className='f';
    var amtLabel=document.createElement('label');
    amtLabel.textContent='Amount';
    var amtInput=document.createElement('input');
    amtInput.type='number';
    amtInput.placeholder='$ 0';
    (function(idx){ amtInput.oninput=function(){ oneTimeItems[idx].amount=parseFloat(this.value)||0; }; })(i);
    amtWrap.appendChild(amtLabel);
    amtWrap.appendChild(amtInput);

    d.appendChild(descWrap);
    d.appendChild(amtWrap);
    el.appendChild(d);
  }
}

var selValues=[];
var selectedPattern='',selRisk='',selDep='',selPartner='',selNeed='';

function selChip(el,group,val){
  var chips=document.querySelectorAll('#'+group+'Chips .chip');
  for(var c=0;c<chips.length;c++) chips[c].classList.remove('on');
  el.classList.add('on');
  if(group==='risk') selRisk=val;
  if(group==='dep') selDep=val;
  if(group==='partner') selPartner=val;
  if(group==='need') selNeed=val;
}

function togVal(el,val){
  if(el.classList.contains('on')){
    el.classList.remove('on');
    var idx=selValues.indexOf(val);
    if(idx>-1) selValues.splice(idx,1);
  } else if(selValues.length<3){
    el.classList.add('on');
    selValues.push(val);
  }
}

function selPatternFn(el,val){
  var opts=document.querySelectorAll('.pattern-opt');
  for(var o=0;o<opts.length;o++) opts[o].classList.remove('on');
  el.classList.add('on');
  selectedPattern=val;
}

function getExp(tier){
  var inputs=document.querySelectorAll('.exp-'+tier);
  var sum=0;
  for(var i=0;i<inputs.length;i++) sum+=parseFloat(inputs[i].value)||0;
  return sum;
}

var leversState={liquid:true,rsus:true,options:true,other:true};

function calcRunway(totalAssets,sevMonthly,sevMonthsLeft,otherIncome,burn){
  var assets=totalAssets,months=0;
  for(var m=0;m<600;m++){
    var income=otherIncome+(m<sevMonthsLeft?sevMonthly:0);
    var net=burn-income;
    if(net<=0){months=24;break;}
    assets-=net;
    if(assets<=0){months=m+1;break;}
    months=m+1;
    if(months>=24){months=24;break;}
  }
  return months;
}

function getLiquidTotal(assets){
  return (leversState.liquid?assets.liquid:0)+
         (leversState.rsus?assets.rsus:0)+
         (leversState.options?assets.options:0)+
         (leversState.other?assets.other:0);
}

var insightMap={
  oversave:{security:"Your instinct to protect is valid — but we'll also show you what keeping too much in cash actually costs over time.",family:"You're holding on tight for your family. We'll help you see where that's working and where it might be working against you.",wealth:"You have the wealth-building mindset but may be under-deploying capital. We'll surface those gaps.",present:"You value today but aren't spending it. We'll help you see when that caution is actually costing you quality of life.",time:"Your time is valuable — and so is your capital. We'll show you where the money is sitting idle.",independence:"You're protecting yourself, which is smart. We'll make sure that protection is actually doing what you think it is."},
  emotional:{security:"Your gut wants security — let's check the numbers against that instinct.",family:"Family comes first for you. We'll help you see if the decisions that feel right for them actually are.",wealth:"You're thinking long term. We'll show you when your instincts align with the math and when they diverge.",present:"You lead with the present. We'll show you the long-term picture first so you can decide with full information.",time:"You value flexibility. We'll flag when emotional decisions are quietly costing you options down the road.",independence:"You value standing on your own. We'll help you make sure your decisions actually reflect that."},
  stability:{security:"Stability and security align — we'll show you where playing it safe is protecting you and where it's holding you back.",family:"Stability for your family is a real priority. We'll surface the cost of the conservative choice alongside the risk of the aggressive one.",wealth:"You want long-term wealth but default to safe bets. We'll show you exactly what that conservatism costs over time.",present:"You want to enjoy now but hedge toward safety. We'll help you find where the balance actually sits.",time:"Stability often means sacrificing flexibility. We'll make that tradeoff visible.",independence:"Playing it safe can sometimes quietly create dependency. We'll flag when that's happening."},
  'partner-led':{security:"You're here, which means you're ready to own this. We'll give you the full picture so you can walk into any conversation informed.",family:"Your family's financial picture affects you too. We'll make sure you see it clearly.",wealth:"Building long-term wealth starts with understanding where you stand. Let's get you there.",present:"Your quality of life depends on financial clarity. We'll build that for you.",time:"Your time is yours. So is your financial picture. Let's look at it together.",independence:"This is exactly the right move toward independence. We'll build your confidence from your real numbers."},
  avoidant:{security:"You're here, and that matters. We'll show you the numbers plainly — no jargon, no overwhelm.",family:"Looking at the numbers is the most protective thing you can do for your family. We'll make it simple.",wealth:"The hardest part is looking. You're already doing it.",present:"Avoiding the numbers doesn't protect your quality of life — it limits it. Let's change that.",time:"Time is the one asset you can't recover. Let's not lose more of it to avoidance.",independence:"Real independence starts with knowing your number. You're about to know yours."},
  analytical:{security:"You can run the math. We'll help you make peace with the answer even when it's complicated.",family:"The numbers and the values don't always agree. We'll show you where they diverge and let you decide.",wealth:"You're built for this. We'll give you the data and the framework to act on it.",present:"You can see the tradeoff. We'll help you choose without the guilt.",time:"You've got the analysis. We'll help you move from knowing to deciding.",independence:"You own the numbers. We'll help you own the decision."}
};

var needMap={
  validated:"We'll lead with what your data confirms.",
  challenged:"We'll surface what your pattern might be quietly costing you.",
  equipped:"We'll give you concrete numbers you can bring into a real conversation.",
  reassured:"We'll show you where you're stronger than you think."
};

var riskLabel={protect:'Protect first',balanced:'Balanced',growth:'Growth-oriented'};
var patternLabel={oversave:'Over-saver',emotional:'Emotionally-led',stability:'Stability-seeker','partner-led':'Partner-led',avoidant:'Avoidant',analytical:'Analytical'};

function calculate(){
  var checking=parseFloat(document.getElementById('checking').value)||0;
  var emergency=parseFloat(document.getElementById('emergency').value)||0;
  var oneTimeTotal=0;
  for(var oi=0;oi<oneTimeItems.length;oi++) oneTimeTotal+=oneTimeItems[oi].amount;
  var rsus=parseFloat(document.getElementById('rsus').value)||0;
  var options=parseFloat(document.getElementById('options').value)||0;
  var otherAssets=parseFloat(document.getElementById('otherAssets').value)||0;
  var sevMonthly=parseFloat(document.getElementById('sevMonthly').value)||0;
  var sevMonths=parseFloat(document.getElementById('sevMonths').value)||0;
  var otherIncome=parseFloat(document.getElementById('otherIncome').value)||0;
  var essential=getExp('essential');
  var flex=getExp('flex');
  var lifestyle=getExp('lifestyle');
  var assets={liquid:checking+emergency+oneTimeTotal,rsus:rsus,options:options,other:otherAssets};

  function updateRunway(){
    var total=getLiquidTotal(assets);
    var r1=calcRunway(total,sevMonthly,sevMonths,otherIncome,essential);
    var r2=calcRunway(total,sevMonthly,sevMonths,otherIncome,essential+flex);
    var r3=calcRunway(total,sevMonthly,sevMonths,otherIncome,essential+flex+lifestyle);
    document.getElementById('r1').textContent=r1>=24?'24+ mo':r1+' mo';
    document.getElementById('r2').textContent=r2>=24?'24+ mo':r2+' mo';
    document.getElementById('r3').textContent=r3>=24?'24+ mo':r3+' mo';
    window._runwayData={r1:r1,r2:r2,r3:r3,essential:essential,flex:flex,lifestyle:lifestyle};
    var toggleLabels=document.querySelectorAll('.toggle-label');
    var keys=['liquid','rsus','options','other'];
    for(var ti=0;ti<toggleLabels.length;ti++){
      if(keys[ti]) toggleLabels[ti].textContent=leversState[keys[ti]]?'Included in runway':'Not included';
    }
  }

  function renderLevers(){
    var el=document.getElementById('leverCards');
    el.innerHTML='';
    var detailLiquid='Savings: $'+checking.toLocaleString()+' · Emergency fund: $'+emergency.toLocaleString()+(oneTimeTotal>0?' · One-time payments: $'+oneTimeTotal.toLocaleString():'');
    var allLevers=[
      {key:'liquid',name:'Liquid assets',amount:assets.liquid,detail:detailLiquid},
      {key:'rsus',name:'Vested RSUs',amount:rsus,detail:'Subject to tax at ordinary income rates. Timing this decision has real tax implications — consult a tax advisor.'},
      {key:'options',name:'Stock options',amount:options,detail:'Exercise cost and tax treatment vary. Flag this one for your advisor before pulling the lever.'},
      {key:'other',name:'Other investable assets',amount:otherAssets,detail:'Brokerage or non-retirement investments. Selling may trigger capital gains tax.'}
    ];
    var levers=[];
    for(var li=0;li<allLevers.length;li++){ if(allLevers[li].amount>0) levers.push(allLevers[li]); }

    for(var lv=0;lv<levers.length;lv++){
      var lever=levers[lv];
      var card=document.createElement('div');
      card.className='lever-card';

      var header=document.createElement('div');
      header.className='lever-header';
      var nameSpan=document.createElement('span');
      nameSpan.className='lever-name';
      nameSpan.textContent=lever.name;
      var amtSpan=document.createElement('span');
      amtSpan.className='lever-amt';
      amtSpan.textContent='$'+lever.amount.toLocaleString();
      header.appendChild(nameSpan);
      header.appendChild(amtSpan);

      var detail=document.createElement('div');
      detail.className='lever-detail';
      detail.textContent=lever.detail;

      var toggleRow=document.createElement('div');
      toggleRow.className='toggle-row';
      var toggleLabel=document.createElement('label');
      toggleLabel.className='toggle';
      var checkbox=document.createElement('input');
      checkbox.type='checkbox';
      checkbox.checked=leversState[lever.key];
      (function(key){ checkbox.onchange=function(){ leversState[key]=this.checked; updateRunway(); }; })(lever.key);
      var slider=document.createElement('span');
      slider.className='tslider';
      toggleLabel.appendChild(checkbox);
      toggleLabel.appendChild(slider);
      var toggleLbl=document.createElement('span');
      toggleLbl.className='toggle-label';
      toggleLbl.textContent=leversState[lever.key]?'Included in runway':'Not included';
      toggleRow.appendChild(toggleLabel);
      toggleRow.appendChild(toggleLbl);

      card.appendChild(header);
      card.appendChild(detail);
      card.appendChild(toggleRow);
      el.appendChild(card);
    }
    window.updateRunway=updateRunway;
  }

  var primaryVal=selValues.length>0?selValues[0]:'security';
  var insight=selectedPattern&&insightMap[selectedPattern]?(insightMap[selectedPattern][primaryVal]||'Your profile is set. We\'ll use it to shape every result in the tradeoff tool.'):'Complete the fingerprint above to personalize your results.';
  var needInsight=selNeed&&needMap[selNeed]?needMap[selNeed]:'';
  var partnerNote=selPartner==='no'?'As the sole earner, every lever matters more — we\'ll weight your results accordingly.':(selPartner==='yes-high'?'With a strong partner income, you may have more flexibility than you think — we\'ll show you where.':'');

  var fpHTML='<div class="fp-title">Your financial fingerprint</div>';
  fpHTML+='<div class="fp-insight">'+insight+'</div>';
  if(needInsight) fpHTML+='<div class="fp-sub">'+needInsight+'</div>';
  if(partnerNote) fpHTML+='<div class="fp-sub">'+partnerNote+'</div>';
  fpHTML+='<div class="fp-tags">';
  if(selRisk) fpHTML+='<span class="fp-tag">'+(riskLabel[selRisk]||selRisk)+'</span>';
  for(var vi=0;vi<selValues.length;vi++) fpHTML+='<span class="fp-tag">'+selValues[vi]+'</span>';
  if(selectedPattern) fpHTML+='<span class="fp-tag">'+(patternLabel[selectedPattern]||selectedPattern)+'</span>';
  if(selDep) fpHTML+='<span class="fp-tag">Dependents: '+selDep+'</span>';
  fpHTML+='</div>';
  document.getElementById('fpCard').innerHTML=fpHTML;

  window._fingerprint={risk:selRisk,values:selValues.slice(),pattern:selectedPattern,dep:selDep,partner:selPartner,need:selNeed};

  try{
    localStorage.setItem('hwm_fingerprint',JSON.stringify(window._fingerprint));
    localStorage.setItem('hwm_runway',JSON.stringify({
      r1:calcRunway(getLiquidTotal(assets),sevMonthly,sevMonths,otherIncome,essential),
      r2:calcRunway(getLiquidTotal(assets),sevMonthly,sevMonths,otherIncome,essential+flex),
      r3:calcRunway(getLiquidTotal(assets),sevMonthly,sevMonths,otherIncome,essential+flex+lifestyle)
    }));
  } catch(e){}

  renderLevers();
  updateRunway();
  document.getElementById('results').style.display='block';
  document.getElementById('results').scrollIntoView({behavior:'smooth',block:'start'});
}

renderExpenses();
renderOneTime();
