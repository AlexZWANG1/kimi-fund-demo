const{useState,useEffect,useRef}=React;

/* ============================================================
   Onboarding — one continuous, hands-on flow that spans pages:
   市场 (了解大盘 → 挑票/覆盖) → 投资 (过卡片 → 团队/人物 → 发prompt).
   Progress persists in localStorage('ta-ob-step'); each page only
   renders the steps it owns and navigates to the other page when
   the flow crosses over. Replayable via 'ta-onboard'.
   ============================================================ */

const OB_ADVISER={id:'adviser',name:'Kimi 投研助手',color:'#5F9EA8'};
const OB_URL={market:'市场.html',invest:'Fund Dashboard.html'};

function Onboarding({onDone,page}){
  const ALL=[
    {key:'hi',page:'market',center:true,title:'你好，我是 Kimi 投研助手',
     body:'我把「看盘 → 研究 → 决策」跑成一条流水线。先从今天的大盘看起，一分钟带你走一遍。',cta:'开始 →'},
    {key:'mk-quotes',page:'market',sel:'[data-tour="mk-quotes"]',title:'先看大盘',
     body:'指数与行情都在这里——这页只读，帮你快速建立今天的市场背景。'},
    {key:'mk-summary',page:'market',sel:'[data-tour="mk-summary"]',title:'市场摘要',
     body:'一段用人话写的综述：今天发生了什么、对你意味着什么。点开看细节，不用自己翻新闻。'},
    {key:'cover',page:'market',sel:'[data-tour="mk-watch"]',action:true,advanceEvent:'ta-team-changed',hint:'点任意一行的「+ 覆盖」',
     title:'挑一只票，纳入覆盖',
     body:'看到想长期跟的票？点「+ 覆盖」——我就给它配一位专属分析师，每天替你研究它。这就是「市场 → 投资」的起点。'},
    {key:'action',page:'invest',sel:'[data-tour="action"]',view:'brief',title:'到投资台了 · 今日建议',
     body:'最重要的一条永远在最上面：基金经理每天一份的操作结论与理由。'},
    {key:'rail',page:'invest',sel:'[data-tour="rail"]',view:'brief',title:'净值与表现',
     body:'右侧是你的净值曲线和今日表现，跟着团队判断实时更新。'},
    {key:'team',page:'invest',sel:'[data-tour="seg-team"]',view:'brief',action:true,hint:'点一下「投研团队」',
     title:'试试看：打开「投研团队」',
     body:'点上方的「投研团队」——你覆盖的每只票一位专属分析师；其上还有基金经理统筹、复盘官每日复盘。',
     onNext:()=>window.dispatchEvent(new CustomEvent('ta-gotab',{detail:'team'}))},
    {key:'persona',page:'invest',sel:'[data-tour="team-toggle"]',view:'team',title:'人物设定 · 一句话就能改',
     body:'切到「团队管理 · 人物设定」看每位的风格。其实你直接跟我说「把 NVDA 设成纪律优先」「加一个特斯拉分析师」就能配置——全是自然语言。'},
    {key:'dispatch',page:'invest',sel:'[data-tour="advisor"]',action:true,hint:'点「完成」，我帮你填好任务',
     title:'最后：交办，看产物',
     body:'点开右下角的我随时能对话。点「完成」——我已经把第一个任务填好了，发送就能看到团队回的「研究结论卡」。',
     onNext:()=>window.dispatchEvent(new CustomEvent('ta-openchat',{detail:{id:'adviser',prefill:'重新评估 NVDA 的集中度风险，给减仓建议'}})),
     cta:'完成 ✓'},
  ];
  const steps=ALL;
  const[i,setI]=useState(()=>{const v=parseInt(localStorage.getItem('ta-ob-step')||'0',10);return isNaN(v)?0:v;});
  const[box,setBox]=useState(null);
  const step=steps[i];
  const last=i===steps.length-1;
  const navRef=useRef(false);
  const finish=()=>{localStorage.setItem('ta-seen','1');localStorage.removeItem('ta-ob-step');onDone(true);};
  const advance=()=>{if(last)finish();else setI(v=>v+1);};
  const next=()=>{if(step&&step.onNext)step.onNext();advance();};
  const prev=()=>setI(v=>Math.max(0,v-1));

  // persist + cross-page routing + spotlight measurement (single effect, keyed on i)
  useEffect(()=>{
    localStorage.setItem('ta-ob-step',String(i));
    if(!step){finish();return;}
    if(step.page!==page){ if(!navRef.current){navRef.current=true;window.location.href=OB_URL[step.page];} return; }
    if(step.view)window.dispatchEvent(new CustomEvent('ta-gotab',{detail:step.view}));
    if(step.center){setBox(null);return;}
    const offTop=Math.max(78,Math.min(window.innerHeight*0.16,150));
    const find=()=>document.querySelector(step.sel);
    const doScroll=()=>{const el=find();if(!el)return;if(getComputedStyle(el).position==='fixed')return;const r=el.getBoundingClientRect();window.scrollTo(0,Math.max(0,window.scrollY+r.top-offTop));};
    const place=()=>{const el=find();if(!el)return;const r=el.getBoundingClientRect();setBox({left:r.left,top:r.top,width:r.width,height:r.height});};
    doScroll();place();
    const ts=[60,180,360,600,900].map(d=>setTimeout(()=>{doScroll();place();},d));
    const onResize=()=>{doScroll();place();};
    window.addEventListener('resize',onResize);
    let bound=null,done=false;const go=()=>{if(done)return;done=true;setTimeout(()=>advance(),90);};
    const onTargetClick=()=>go();
    if(step.action){const bind=()=>{const el=find();if(el&&el!==bound){if(bound)bound.removeEventListener('click',onTargetClick);bound=el;el.addEventListener('click',onTargetClick);}};bind();ts.push(setTimeout(bind,150),setTimeout(bind,450));}
    let evt=null;
    if(step.advanceEvent){evt=()=>go();window.addEventListener(step.advanceEvent,evt);}
    return()=>{ts.forEach(clearTimeout);window.removeEventListener('resize',onResize);if(bound)bound.removeEventListener('click',onTargetClick);if(evt)window.removeEventListener(step.advanceEvent,evt);};
    // eslint-disable-next-line
  },[i]);

  useEffect(()=>{
    const k=e=>{if(e.key==='Escape')finish();else if(e.key==='ArrowRight')next();else if(e.key==='ArrowLeft')prev();};
    window.addEventListener('keydown',k);return()=>window.removeEventListener('keydown',k);
    // eslint-disable-next-line
  },[i,last]);

  // not our page → render nothing (the effect above is navigating away)
  if(!step||step.page!==page)return null;

  const Av=({size})=><span className="tour2-av">{window.Persona&&<window.Persona agent={OB_ADVISER} size={size} ring={false}/>}<span className="tour2-av-dot"/></span>;

  let spotStyle=null,tipStyle=null;
  if(box){
    const pad=10,gap=24,tipW=Math.min(360,window.innerWidth-32),tipH=230;
    spotStyle={left:box.left-pad,top:box.top-pad,width:box.width+2*pad,height:box.height+2*pad};
    let top,transform='none';
    if(box.top+box.height+gap+tipH<=window.innerHeight-12){top=box.top+box.height+gap;}
    else if(box.top-gap-tipH>=12){top=box.top-gap;transform='translateY(-100%)';}
    else{top=Math.max(12,window.innerHeight-tipH-12);}
    let left=box.left;left=Math.max(16,Math.min(left,window.innerWidth-tipW-16));
    tipStyle={left,width:tipW,top,transform};
  }

  // global progress across both pages
  const total=steps.length-1;

  return(
    <div className="tour2">
      {step.center?(
        <>
          <div className="tour2-dim"/>
          <div className="tour2-card center">
            <Av size={50}/>
            <div className="tour2-title">{step.title}</div>
            <div className="tour2-body">{step.body}</div>
            <div className="tour2-foot">
              <button className="tour2-skip" onClick={finish}>跳过引导</button>
              <button className="tour2-next" onClick={next}>{step.cta||'开始 →'}</button>
            </div>
          </div>
        </>
      ):(
        <>
          {!step.action&&<div className="tour2-block" onClick={next}/>}
          {spotStyle&&<div className={`tour2-spot${step.action?' act':''}`} style={spotStyle}/>}
          {tipStyle&&(
            <div className="tour2-tip" style={tipStyle}>
              <div className="tour2-tip-top">
                <span className="tour2-who"><Av size={26}/><span>Kimi 投研助手</span></span>
                <span className="tour2-count">{i} / {total}</span>
              </div>
              <div className="tour2-title sm">{step.title}</div>
              <div className="tour2-body sm">{step.body}</div>
              {step.action&&step.hint&&<div className="tour2-hint"><span className="tour2-hint-ic">↑</span>{step.hint}</div>}
              <div className="tour2-foot">
                <button className="tour2-skip" onClick={finish}>跳过</button>
                <div className="tour2-nav">
                  {i>1&&<button className="tour2-back" onClick={prev}>上一步</button>}
                  <button className="tour2-next" onClick={next}>{step.cta||'下一步 →'}</button>
                </div>
              </div>
              <div className="tour2-dots">{steps.slice(1).map((s,k)=><span key={k} className={`tour2-d${k===i-1?' on':''}`}/>)}</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
window.Onboarding=Onboarding;

/* ===== Empty rail (no portfolio connected) ===== */
function EmptyRail(){
  return(
    <div className="rail-card empty-rail">
      <div className="er-ic">▦</div>
      <div className="er-t">还没有连接组合</div>
      <div className="er-d">连上后这里会显示你的净值、持仓与今日表现，团队也会围绕你的持仓给出分析。</div>
      <button className="er-btn" onClick={()=>window.dispatchEvent(new CustomEvent('ta-onboard'))}>连接示例组合</button>
      <button className="er-replay" onClick={()=>window.dispatchEvent(new CustomEvent('ta-onboard'))}>↻ 重新看引导</button>
    </div>
  );
}
window.EmptyRail=EmptyRail;
