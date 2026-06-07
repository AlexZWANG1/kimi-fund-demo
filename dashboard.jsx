const{useState,useEffect,useRef}=React;

/* ===== Sparkline (shared) ===== */
function Sparkline({data,color,w=96,h=30,fill=true}){
  if(!data||!data.length)return null;
  const mn=Math.min(...data),mx=Math.max(...data),sp=(mx-mn)||1;
  const X=i=>(i/(data.length-1))*w;
  const Y=v=>h-2-((v-mn)/sp)*(h-4);
  const line=data.map((v,i)=>(i?'L':'M')+X(i).toFixed(1)+' '+Y(v).toFixed(1)).join(' ');
  const area=line+` L ${w} ${h} L 0 ${h} Z`;
  const id='sg'+Math.random().toString(36).slice(2,7);
  return(
    <svg width={w} height={h} style={{display:'block',overflow:'visible'}}>
      {fill&&<defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={color} stopOpacity="0.16"/><stop offset="100%" stopColor={color} stopOpacity="0"/>
      </linearGradient></defs>}
      {fill&&<path d={area} fill={`url(#${id})`}/>}
      <path d={line} fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round"/>
    </svg>
  );
}
window.Sparkline=Sparkline;

/* ===== Proposal banners ===== */
function ProposalBanners({onLessons,onPm}){
  const P=window.PROPOSALS;
  return(
    <div>
      <div className="pbanner accent">
        <div className="pb-ic">📄</div>
        <div className="pb-tx"><b>{P.lessons.n} 条 {P.lessons.title}</b> — {P.lessons.body}</div>
        <button className="pb-btn" onClick={onLessons}>查看</button>
      </div>
      <button className="pb-ghost" onClick={onPm}>
        <span className="chev">›</span> {P.pm.n} 条 {P.pm.title}
        <span className="later">◷ 稍后再看</span>
      </button>
    </div>
  );
}
window.ProposalBanners=ProposalBanners;

/* ===== Right rail: performance card ===== */
const PR_RANGES=[{k:'1M',n:22},{k:'3M',n:66},{k:'6M',n:90},{k:'1Y',n:90}];
function PerfCard(){
  const[r,setR]=useState('6M');
  const nd=window.NAV_DATA,bd=window.BENCH_DATA;
  const n=PR_RANGES.find(x=>x.k===r).n;
  const s=nd.slice(-n),b=bd.slice(-n);
  const ret=(s[s.length-1]-s[0])/s[0]*100;
  const bret=(b[b.length-1]-b[0])/b[0]*100;
  const alpha=ret-bret;
  const up=ret>=0;
  return(
    <div className="rail-card" data-tour="rail">
      <div className="rc-hd">
        <div className="rc-title"><span className="ic">▦</span>组合表现</div>
        <div style={{display:'flex',alignItems:'center',gap:6}}>
          <div className="rc-tabs">{PR_RANGES.map(x=><button key={x.k} className={`rc-tab${r===x.k?' on':''}`} onClick={()=>setR(x.k)}>{x.k}</button>)}</div>
          <span className="rc-sel">SPY ▾</span>
        </div>
      </div>
      <div className="perf-big">
        <span className={`perf-pct ${up?'up':'dn'}`}>{up?'+':''}{ret.toFixed(2)}%</span>
        <span className="perf-alpha" style={{background:alpha>=0?'var(--ups)':'var(--dns)',color:alpha>=0?'var(--up)':'var(--dn)'}}>α {alpha>=0?'+':''}{alpha.toFixed(2)}%</span>
      </div>
      <div className="perf-sub">组合 · vs SPY {alpha>=0?'+':''}{alpha.toFixed(2)}%</div>
      <div className="perf-chart"><Sparkline data={s} color={up?'var(--up)':'var(--dn)'} w={304} h={92}/></div>
      <div className="perf-stats">
        <div className="perf-stat"><div className="k">现值</div><div className="v">$1.09M</div></div>
        <div className="perf-stat"><div className="k">今日</div><div className="v" style={{color:'var(--up)'}}>+0.44%</div></div>
        <div className="perf-stat"><div className="k">自成立</div><div className="v" style={{color:'var(--up)'}}>+8.64%</div></div>
        <div className="perf-stat"><div className="k">最大回撤</div><div className="v" style={{color:'var(--dn)'}}>-4.6%</div></div>
      </div>
    </div>
  );
}
window.PerfCard=PerfCard;

/* ===== Right rail: NAV value card ===== */
function NavValueCard(){
  return(
    <div className="rail-card">
      <div className="rc-hd"><div className="rc-title">组合</div><span className="live-dot"/></div>
      <div className="navval">$1,086,420</div>
      <div className="navval-day" style={{color:'var(--up)'}}>+$4,741 （+0.44%） 今日</div>
      <div className="navval-split">
        <div><div className="k">总收益</div><div className="v" style={{color:'var(--up)'}}>+8.64%</div></div>
        <div><div className="k">现金缓冲</div><div className="v">14.0%</div></div>
      </div>
    </div>
  );
}
window.NavValueCard=NavValueCard;

/* ===== Right rail: watchlist ===== */
const WL_COLOR={AMZN:'#374151',COIN:'#1652F0',PLTR:'#1F2937',SMCI:'#0F766E',NFLX:'#B91C1C',BABA:'#C2410C',AMD:'#166534'};
function Watchlist(){
  const wl=window.WATCHLIST;
  return(
    <div className="rail-card">
      <div className="rc-hd"><div className="rc-title"><span className="ic">☆</span>自选</div><span style={{fontSize:11,color:'var(--faint)'}}>{wl.length}</span></div>
      <div>
        {wl.map((x,i)=>{
          const up=x.chg>=0;
          return(
            <div className="watch-row" key={x.sym}>
              <span className="watch-logo" style={{background:WL_COLOR[x.sym]||'#374151'}}>{x.sym.slice(0,2)}</span>
              <span className="watch-id"><div className="watch-sym">{x.sym}</div><div className="watch-nm">{x.name}</div></span>
              <span className="watch-spark"><Sparkline data={window.spark(i*37+5,x.chg>=0?1:-1,18)} color={up?'var(--up)':'var(--dn)'} w={60} h={24} fill={false}/></span>
              <span className="watch-num"><div className="watch-px">{x.price.toFixed(2)}</div><div className="watch-chg" style={{color:up?'var(--up)':'var(--dn)'}}>{up?'+':''}{x.chg.toFixed(2)}%</div></span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
window.Watchlist=Watchlist;

/* ===== Bottom command bar (replaces floating advisor) ===== */
const CMD_MODES=[{k:'chat',l:'聊天',ic:'◇'},{k:'research',l:'主观研究',ic:'◎'},{k:'quant',l:'量化策略',ic:'⌗'},{k:'screen',l:'选股器',ic:'▽'}];
function CommandBar(){
  const[mode,setMode]=useState('chat');
  const[input,setInput]=useState('');
  const[open,setOpen]=useState(false);
  const[msgs,setMsgs]=useState([]);
  const[typing,setTyping]=useState(false);
  const ref=useRef(null);
  const REPLIES={
    nvda:'NVDA 现占 25.5%，已触及单标的 25% 上限。半导体分析师信念分 88、仍看多，但纪律不开例外——PM 计划本周减约 2% 至安全区间。',
    表现:'今日组合 +0.44%，NVDA 是主要正贡献，UNH 拖累约 15bp，跑赢 SPY 约 0.2%，夏普 1.7。',
    unh:'医疗分析师把 UNH 信念分从 0.48 下调到 0.44，国会证词的政策成本尚未定价，PM 保留缓冲而非清仓。',
    风险:'当前三个关注点：① NVDA 集中度触顶（处理中）② UNH 政策不确定性 ③ 半导体板块接近 30% 行业上限。',
    量化:'量化策略模式：可基于动量 / 低波 / 质量因子回测一篮子标的。告诉我因子和股票池，我来生成回测。',
    选股:'选股器模式：按市值、估值、增速、动量等条件筛选。例如「市值>500亿、PEG<1.5、近一月动量为正」。',
  };
  const reply=(m)=>{const l=m.toLowerCase();for(const[k,r]of Object.entries(REPLIES)){if(l.includes(k.toLowerCase()))return r;}
    if(mode==='quant')return '已收到。请提供因子（动量/低波/质量…）与股票池，我会生成回测曲线与绩效摘要。';
    if(mode==='screen')return '已收到筛选意图。给我具体条件（市值 / 估值 / 增速 / 动量），我来返回符合的标的清单。';
    return '根据团队综合分析，组合运转正常：减仓 NVDA 守住集中度纪律，其余维持。想深入哪一块？';};
  const send=(q)=>{const m=(q||input).trim();if(!m)return;setOpen(true);setInput('');setMsgs(p=>[...p,{role:'me',text:m}]);setTyping(true);
    setTimeout(()=>{setTyping(false);setMsgs(p=>[...p,{role:'them',text:reply(m)}]);},900+Math.random()*600);};
  useEffect(()=>{if(open&&ref.current)ref.current.scrollTop=ref.current.scrollHeight;},[msgs,typing,open]);
  return(
    <div className="cmd-w">
      <div className="cmd-panel">
        <div className={`cmd-msgs${open&&msgs.length?' open':''}`} ref={ref}>
          {msgs.map((m,i)=>(
            <div key={i} className={`cmd-msg ${m.role==='me'?'me':''}`}>
              <span className="cmd-mav" style={{background:m.role==='me'?'var(--s3)':'var(--acs)',color:m.role==='me'?'var(--soft)':'var(--aci)'}}>{m.role==='me'?'我':'✦'}</span>
              <div className={`cmd-bub ${m.role==='me'?'me':'them'}`}>{m.text}</div>
            </div>
          ))}
          {typing&&<div className="cmd-msg"><span className="cmd-mav" style={{background:'var(--acs)',color:'var(--aci)'}}>✦</span><div className="cmd-bub them"><span className="th"><span>●</span><span>●</span><span>●</span></span></div></div>}
        </div>
        <div className="cmd-modes">
          <span className="cmd-mlabel">⚙ 模式</span>
          {CMD_MODES.map(m=><button key={m.k} className={`cmd-mode${mode===m.k?' on':''}`} onClick={()=>setMode(m.k)}>{m.ic} {m.l}</button>)}
        </div>
        <div className="cmd-in-row">
          <input className="cmd-in" value={input} onChange={e=>setInput(e.target.value)} onFocus={()=>msgs.length&&setOpen(true)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder="问任何问题 — 行情、持仓、生成一个量化策略，或筛选一组标的…"/>
          <button className={`cmd-send${input.trim()?'':' idle'}`} onClick={()=>send()}>↑</button>
        </div>
      </div>
    </div>
  );
}
window.CommandBar=CommandBar;
