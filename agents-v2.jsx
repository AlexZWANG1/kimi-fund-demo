const{useState,useEffect,useRef}=React;
const pct=(v,d=2)=>(v>=0?'+':'')+v.toFixed(d)+'%';

/* ===== ONBOARDING ===== */
function Onboarding({onDone}){
  const[step,setStep]=useState(0);
  const steps=[
    {icon:'👋',title:'欢迎回来，Kimi',body:'你的 AI 投资团队已全员就位，正在为你工作。这里是你的基金指挥台。',sub:'8 位 AI 成员 · 全天候运转 · 实时分析',cta:'认识团队 →'},
    {icon:'🧠',title:'每位 AI 都有独立记忆',body:'点击任意团队成员，查看他们的研究记忆、历史操作，并直接和他们对话。',sub:'记忆 · 历史 · 专属对话',cta:'了解动态 →'},
    {icon:'💬',title:'随时问你的基金顾问',body:'底部悬浮窗是你的专属顾问——想知道为什么减仓 NVDA？直接问就行。',sub:'顾问综合整个团队信息为你答疑',cta:'进入指挥台 →'},
  ];
  const s=steps[step];
  return(
    <div className="ob-ov">
      <div className="ob-card">
        <div style={{display:'flex',gap:5,justifyContent:'center',marginBottom:26}}>
          {steps.map((_,i)=>(
            <div key={i} style={{width:i===step?18:6,height:6,borderRadius:9,background:i===step?'var(--ac)':'var(--line)',transition:'all .3s'}}/>
          ))}
        </div>
        <div style={{fontSize:46,marginBottom:14}}>{s.icon}</div>
        <h2 style={{fontFamily:'var(--fd)',fontSize:22,fontWeight:560,marginBottom:10,letterSpacing:'-.02em',color:'var(--ink)'}}>{s.title}</h2>
        <p style={{fontSize:14,color:'var(--soft)',lineHeight:1.7,marginBottom:8}}>{s.body}</p>
        <p style={{fontSize:12,color:'var(--faint)',marginBottom:26}}>{s.sub}</p>
        {step===1&&(
          <div style={{display:'flex',gap:7,justifyContent:'center',marginBottom:22,flexWrap:'wrap'}}>
            {window.AGENTS.map((a,i)=>(
              <div key={a.id} style={{width:38,height:38,borderRadius:9,background:a.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11.5,fontWeight:700,color:'#fff',animation:`scin .35s ${i*.07}s backwards`}}>
                {a.initials}
              </div>
            ))}
          </div>
        )}
        <button className="ob-cta" onClick={()=>step<steps.length-1?setStep(s=>s+1):onDone()}>{s.cta}</button>
        {step>0&&<button onClick={()=>setStep(s=>s-1)} style={{marginTop:10,background:'none',border:'none',color:'var(--faint)',fontSize:12.5,cursor:'pointer',display:'block',width:'100%',fontFamily:'inherit'}}>← 返回</button>}
      </div>
    </div>
  );
}

/* ===== TOPBAR ===== */
function TopBar({onAdvisor,page}){
  const[t,setT]=useState(new Date());
  useEffect(()=>{const id=setInterval(()=>setT(new Date()),30000);return()=>clearInterval(id);},[]);
  return(
    <div className="topbar">
      <div className="brandline">
        <a className="brand-mark" href="Fund Dashboard.html">
          <span className="kimi-k">k</span>
          <span className="kimi-wm">kimi</span>
        </a>
        <nav className="topnav">
          <a className={`topnav-a${page==='market'?' on':''}`} href="市场.html">市场</a>
          <a className={`topnav-a${page==='dash'?' on':''}`} href="Fund Dashboard.html">投资</a>
        </nav>
      </div>
      <div className="topbar-r">
        <button className="tb-guide" onClick={()=>window.dispatchEvent(new CustomEvent('ta-onboard'))}>导览</button>
        <span className="clock">
          <span className="live-dot"></span>
          {t.toLocaleDateString('zh-CN',{month:'2-digit',day:'2-digit'})} · {t.toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'})} · 美股交易中
        </span>
      </div>
    </div>
  );
}

/* ===== NAV CHART (with hover/drag scrub) ===== */
function NavChart({series,bench,height=90,onHover}){
  const ref=useRef(null);
  const[w,setW]=useState(250);
  const[hi,setHi]=useState(null);
  useEffect(()=>{
    if(!ref.current)return;
    const ro=new ResizeObserver(e=>setW(e[0].contentRect.width));
    ro.observe(ref.current);
    return()=>ro.disconnect();
  },[]);
  const pad={t:8,r:2,b:2,l:2};
  const data=series;
  const bdata=bench||null;
  const all=bdata?data.concat(bdata):data;
  const mn=Math.min(...all),mx=Math.max(...all),span=(mx-mn)||1;
  const iw=w-pad.l-pad.r,ih=height-pad.t-pad.b;
  const X=(i)=>pad.l+(i/(data.length-1))*iw;
  const Y=(v)=>pad.t+(1-(v-mn)/span)*ih;
  const line=(arr)=>arr.map((v,i)=>(i?'L':'M')+X(i).toFixed(1)+' '+Y(v).toFixed(1)).join(' ');
  const area=line(data)+` L ${X(data.length-1).toFixed(1)} ${height} L ${X(0).toFixed(1)} ${height} Z`;
  const at=(clientX)=>{
    const r=ref.current.getBoundingClientRect();
    let i=Math.round((clientX-r.left-pad.l)/iw*(data.length-1));
    i=Math.max(0,Math.min(data.length-1,i));
    setHi(i); onHover&&onHover(i);
  };
  const leave=()=>{setHi(null);onHover&&onHover(null);};
  const ci=hi==null?data.length-1:hi;
  const cx=X(ci),cy=Y(data[ci]);
  return(
    <div ref={ref} style={{width:'100%',position:'relative'}}>
      <svg width="100%" height={height} style={{display:'block',overflow:'visible',cursor:'crosshair',touchAction:'none'}}
        onMouseMove={e=>at(e.clientX)} onMouseLeave={leave}
        onTouchStart={e=>at(e.touches[0].clientX)} onTouchMove={e=>at(e.touches[0].clientX)} onTouchEnd={leave}>
        <defs><linearGradient id="nfg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--up)" stopOpacity="0.08"/>
          <stop offset="100%" stopColor="var(--up)" stopOpacity="0"/>
        </linearGradient></defs>
        <path d={area} fill="url(#nfg)"/>
        {bdata&&<path d={line(bdata)} fill="none" stroke="#59616C" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.7"/>}
        <path d={line(data)} fill="none" stroke="var(--up)" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round"/>
        {hi!=null&&<line x1={cx} y1={pad.t} x2={cx} y2={height} stroke="var(--soft)" strokeWidth="1" strokeDasharray="3 3" opacity=".55"/>}
        <circle cx={cx} cy={cy} r={hi!=null?4.5:3.5} fill="var(--up)" stroke="var(--paper)" strokeWidth={hi!=null?2:0}/>
      </svg>
    </div>
  );
}

/* ===== NAV BAR (returns-focused) ===== */
const RANGES=[{k:'1M',l:'近 1 月',n:22},{k:'3M',l:'近 3 月',n:66},{k:'ALL',l:'全部',n:90}];
function NavBar(){
  const[range,setRange]=useState('ALL');
  const[open,setOpen]=useState(false);
  const[hi,setHi]=useState(null);
  const nd=window.NAV_DATA,bd=window.BENCH_DATA;
  const rg=RANGES.find(r=>r.k===range);
  const series=range==='ALL'?nd:nd.slice(-rg.n);
  const bench=range==='ALL'?bd:bd.slice(-rg.n);
  const holdings=window.HOLDINGS;
  const totalDayPnl=4741;
  const maxAbs=Math.max(...holdings.map(h=>Math.abs(h.dayPnl)),1);
  const first=series[0];
  const ci=hi==null?series.length-1:hi;
  const cur=series[ci];
  const ret=(cur-first)/first*100;
  const pnl=cur-first;
  const up=ret>=0;
  const money=n=>(n>=0?'+':'-')+'$'+Math.abs(Math.round(n)).toLocaleString('en-US');
  const navAt='$'+Math.round(cur).toLocaleString('en-US');
  const scrubbing=hi!=null;
  return(
    <div className="nav-hero">
      <div className="nh-top">
        <div>
          <div className="nb-ey">{scrubbing?'区间收益 · 拖动查看':`收益 · ${rg.l}`}</div>
          <div style={{display:'flex',alignItems:'baseline',gap:14,marginTop:8,flexWrap:'wrap'}}>
            <div className={`nh-num ${up?'up':'dn'}`}>{up?'+':''}{ret.toFixed(2)}<span className="nh-pctsym">%</span></div>
            <span className={`dchip ${up?'pos':'neg'}`}>{money(pnl)}</span>
          </div>
          <div className="nh-quick">
            <span>今日 <b className="up">+0.44%</b></span>
            <span>跑赢 SPY <b className="up">+2.1%</b></span>
            <span>夏普 <b>1.7</b></span>
            <span>最大回撤 <b className="dn">-4.6%</b></span>
          </div>
        </div>
        <div className="rtabs" style={{marginBottom:0,marginTop:4}}>
          {RANGES.map(r=>(
            <button key={r.k} className={`rtab${range===r.k?' on':''}`} onClick={()=>{setRange(r.k);setHi(null);}}>{r.l}</button>
          ))}
        </div>
      </div>
      <div className="nh-chart"><NavChart series={series} bench={bench} height={132} onHover={setHi}/></div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:12}}>
        <button className="nb-toggle" onClick={()=>setOpen(o=>!o)}>
          {open?'收起详情':'查看详情'}
          <span className={`nb-arr${open?' up':''}`}/>
        </button>
        <div className="nh-legend">
          <span><i className="lg-fund"/>本基金</span>
          <span><i className="lg-bench"/>SPY 基准</span>
        </div>
      </div>
      {open&&(
        <div className="nh-detail" style={{flexDirection:'column',gap:18}}>
          <div className="nh-stats">
            {[{k:'今日',v:'+0.44%',c:'var(--up)'},{k:'自成立',v:'+8.64%',c:'var(--up)'},{k:'跑赢 SPY',v:'+2.1%',c:'var(--up)'},{k:'夏普',v:'1.7'},{k:'波动率',v:'14.2%'},{k:'最大回撤',v:'-4.6%',c:'var(--dn)'}].map(s=>(
              <div className="nh-stat" key={s.k}><div className="k">{s.k}</div><div className="v" style={s.c?{color:s.c}:{}}>{s.v}</div></div>
            ))}
          </div>
          <div style={{width:'100%'}}>
            <div className="nb-ch"><span>持仓贡献</span><span>权重</span><span>今日涨跌</span><span>今日贡献</span></div>
            {holdings.map(h=>{
              const contrib=h.dayPnl/totalDayPnl*100;
              const barW=Math.abs(h.dayPnl)/maxAbs*100;
              const pos=contrib>=0;
              return(
                <div className="nb-cr" key={h.sym}>
                  <span className="nb-sym">{h.sym}<span className="nb-sn">{h.name}</span></span>
                  <span className="nb-w">{h.weight.toFixed(1)}%</span>
                  <span className={`nb-dp ${h.dayPct>=0?'up':'dn'}`}>{pct(h.dayPct,1)}</span>
                  <span className="nb-bar">
                    <span className="nb-bt"><i className={pos?'p':'n'} style={{width:barW+'%'}}/></span>
                    <span className={`nb-bp ${pos?'up':'dn'}`}>{pos?'+':''}{contrib.toFixed(0)}%</span>
                  </span>
                </div>
              );
            })}
            <div className="nb-cr cash">
              <span className="nb-sym">现金<span className="nb-sn">Cash</span></span>
              <span className="nb-w">14.0%</span>
              <span className="nb-dp faint">—</span>
              <span className="nb-bar"><span className="nb-bt"/><span className="nb-bp faint">—</span></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===== AGENT CARD ===== */
const DIR_MAP={b:{cls:'dir-b',label:'看多'},h:{cls:'dir-h',label:'持有'},s:{cls:'dir-s',label:'看空'},live:{cls:'dir-b',label:'运作中'}};
const STATUS_DOT={live:'st-live',busy:'st-busy',idle:'st-idle'};
const STATUS_LABEL={live:'已更新',busy:'待复核',idle:'无新增'};

function AgentCard({agent:a,onClick,isSelected}){
  const dir=DIR_MAP[a.dir]||{cls:'dir-h',label:'持有'};
  return(
    <div className={`ag-card${isSelected?' sel':''}`} onClick={()=>onClick(a)}>
      <div className="ag-hd">
        <div className="ag-av" style={{background:a.color}}>{a.initials}</div>
        <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:5}}>
          <div className={`st-dot ${STATUS_DOT[a.status]}`}/>
          <span className={`dir-tag ${dir.cls}`}>{dir.label}</span>
        </div>
      </div>
      <div className="ag-name">{a.name}</div>
      <div className="ag-role">{a.role}</div>
      <div className="ag-task">{a.task}</div>
      <div className="conv-line">
        <div className="conv-bar"><div className="conv-fill" style={{width:`${a.conviction}%`}}/></div>
        <span className="conv-txt">{a.conviction}</span>
      </div>
      <div className="ag-q">{a.quote}</div>
    </div>
  );
}

function TeamSection({onSelect,selected}){
  const[open,setOpen]=useState(false);
  const ags=window.AGENTS;
  return(
    <div className="team-wrap">
      <div className="team-hd" onClick={()=>setOpen(o=>!o)}>
        <div className="team-hd-l">
          <div className="team-stack">
            {ags.slice(0,5).map(a=><div key={a.id} className="ts-av" style={{background:a.color}}>{a.initials}</div>)}
          </div>
          <div>
            <div style={{fontSize:13.5,fontWeight:600,color:'var(--ink)'}}>AI 投资团队</div>
            <div style={{fontSize:11.5,color:'var(--faint)',marginTop:1}}>{ags.length} 位成员 · 1 组合经理 + 6 分析师</div>
          </div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <span style={{fontSize:11.5,color:'var(--soft)'}}>{open?'收起':'查看团队'}</span>
          <span className={`nb-arr${open?' up':''}`}/>
        </div>
      </div>
      {open&&(
        <div className="team-rows">
          {ags.map(a=>{
            const dir=DIR_MAP[a.dir]||{cls:'dir-h',label:'持有'};
            return(
              <button className="tr" key={a.id} onClick={()=>onSelect(a)} style={selected?.id===a.id?{background:'var(--s2)'}:{}}>
                <div className="tr-av" style={{background:a.color}}>
                  {a.initials}
                  <span className={`st-dot ${STATUS_DOT[a.status]}`} style={{position:'absolute',bottom:-2,right:-2,border:'2px solid var(--surface)'}}/>
                </div>
                <div className="tr-id">
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <span className="tr-name">{a.name}</span>
                    <span style={{fontSize:11,color:'var(--faint)'}}>{a.role}</span>
                  </div>
                  <div className="tr-task">{a.task}</div>
                </div>
                <span className={`dir-tag ${dir.cls}`}>{dir.label}</span>
                <span className="tr-conv">信念 {a.conviction}</span>
                <span className="tr-arrow">›</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ===== AGENT DRAWER ===== */
function AgentDrawer({agent:a,onClose}){
  const[tab,setTab]=useState('chat');
  const[memOpen,setMemOpen]=useState(null);
  const[input,setInput]=useState('');
  const[msgs,setMsgs]=useState([{role:'agent',text:`你好，我是${a.name}。${a.role.slice(0,20)}专注的分析师。有什么想了解的吗？`}]);
  const[typing,setTyping]=useState(false);
  const chatRef=useRef(null);
  const replies=[
    ()=>`信念分 ${a.conviction} 的依据：${a.memory[0]?.v}`,
    ()=>`最主要的风险是：${a.memory.find(m=>m.k==='风险'||m.k==='警告')?.v||'估值压力和宏观不确定性'}`,
    ()=>`我正在 ${a.task}，结果会第一时间向 基金经理汇报。`,
    ()=>a.quote.replace(/"/g,''),
  ];
  const send=(msg)=>{
    const m=(msg||input).trim();if(!m)return;
    setInput('');setMsgs(p=>[...p,{role:'user',text:m}]);setTyping(true);
    setTimeout(()=>{setTyping(false);setMsgs(p=>[...p,{role:'agent',text:replies[Math.floor(Math.random()*replies.length)]()}]);},1100+Math.random()*700);
  };
  useEffect(()=>{if(chatRef.current)chatRef.current.scrollTop=chatRef.current.scrollHeight;},[msgs,typing]);
  return(
    <>
      <div className="drw-back" onClick={onClose}/>
      <div className="drw open">
        <div className="drw-hd">
          <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between'}}>
            <div style={{display:'flex',alignItems:'center',gap:13}}>
              <div style={{width:50,height:50,borderRadius:13,background:a.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,fontWeight:700,color:'#fff',flexShrink:0}}>{a.initials}</div>
              <div>
                <div style={{fontFamily:'var(--fd)',fontSize:18,fontWeight:560,color:'var(--ink)'}}>{a.name}</div>
                <div style={{fontSize:12,color:'var(--soft)',marginTop:2}}>{a.role}</div>
                <div style={{display:'flex',alignItems:'center',gap:6,marginTop:5}}>
                  <div className={`st-dot ${STATUS_DOT[a.status]}`}/>
                  <span style={{fontSize:11,color:'var(--faint)'}}>{STATUS_LABEL[a.status]}</span>
                  <span className="mono" style={{fontSize:11,color:'var(--ac)',marginLeft:8}}>信念 {a.conviction}</span>
                </div>
              </div>
            </div>
            <button onClick={onClose} style={{width:26,height:26,borderRadius:7,background:'var(--s2)',border:'1px solid var(--line)',color:'var(--soft)',cursor:'pointer',fontSize:13,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>✕</button>
          </div>
        </div>
        <div className="drw-tabs">
          {(a.id==='reviewer'?[{id:'chat',l:'💬 对话'},{id:'memory',l:'📚 知识库'},{id:'history',l:'🗂 收盘复盘'}]:[{id:'chat',l:'💬 对话'},{id:'overview',l:'🪪 概览'},{id:'memory',l:'🧠 记忆'},{id:'audit',l:'📑 审计'}]).map(t=>(
            <button key={t.id} className={`dtab${tab===t.id?' on':''}`} onClick={()=>setTab(t.id)}>{t.l}</button>
          ))}
        </div>
        <div className="drw-body" ref={tab==='chat'?chatRef:null}>
          {tab==='overview'&&a.id!=='reviewer'&&(()=>{const d=window.DESK[a.id]||{};return(
            <div>
              <div className="desk-card">
                <div className="desk-row"><span>持仓</span><b>{d.pos}</b></div>
                <div className="desk-row"><span>成本 / 市值</span><b>{d.avg} · {d.mv}</b></div>
                <div className="desk-row"><span>浮动盈亏</span><b className={(d.pnl||'').startsWith('-')?'dn':'up'}>{d.pnl}</b></div>
                <div className="desk-row"><span>当前判断</span><b>{d.call} · 信念 {a.conviction} · {d.hz}</b></div>
              </div>
              <div className="desk-sub">当前观点</div>
              <div className="desk-thesis">{window.SHORT[a.id]}</div>
              <div className="desk-sub">护栏 Guardrails</div>
              {(d.guard||[]).map((g,i)=>(<div key={i} className="guard-row"><span className="guard-dot"/>{g}</div>))}
              <div className="desk-sub">最近动作</div>
              {a.history.slice(0,2).map((h,i)=>(<div key={i} className="hist-row"><div className="hist-t">{h.t}</div><div><div className="hist-a">{h.a}</div><div className="hist-d">{h.d}</div></div></div>))}
            </div>
          );})()}
          {tab==='audit'&&a.id!=='reviewer'&&(()=>{const d=window.DESK[a.id]||{};return(
            <div>
              <div className="desk-sub">近期成交 Fills</div>
              <table className="fills-tbl"><tbody>
                {(d.fills||[]).map((f,i)=>(<tr key={i}><td>{f[0]}</td><td className={f[1]==='卖'?'dn':'up'}>{f[1]}</td><td>{f[2]}</td><td className="mono">{f[3]}</td></tr>))}
              </tbody></table>
              <div className="desk-sub">引用关系 Backlinks</div>
              <div className="desk-faint">暂无其他档案引用本席位</div>
              <div className="desk-sub">数据来源</div>
              <div className="desk-faint">SQLite 存档 · 只读视图 · 无实盘执行</div>
            </div>
          );})()}
          {tab==='memory'&&a.id==='reviewer'&&(
            <div>
              <div style={{fontSize:11.5,color:'var(--faint)',marginBottom:13}}>复盘官读过、并写进知识库的长期资产 · 只增不改，可追溯</div>
              {window.WIKI.map((w,i)=>(
                <div key={i} className="wiki-item">
                  <div className="wiki-top">
                    <span className="wiki-kind">{w.kind}</span>
                    <span className="wiki-title">{w.title}</span>
                  </div>
                  <div className="wiki-body">{w.body}</div>
                  <div className="wiki-meta"><span>{w.date}</span><span>被引用 {w.backlinks} 次</span></div>
                </div>
              ))}
            </div>
          )}
          {tab==='memory'&&a.id!=='reviewer'&&(
            <div>
              <div className="desk-sub">记忆 · {a.memory.length} 条 · 只增不改</div>
              {a.memory.map((m,i)=>(
                <div key={i} className={'mem-item'+(memOpen===i?' open':'')} onClick={()=>setMemOpen(memOpen===i?null:i)}>
                  <div className="mem-foldhd"><span className="mem-k">#{i+1} · {m.k}</span><span className="nb-arr" style={{transform:memOpen===i?'rotate(-135deg)':'rotate(45deg)',borderColor:'var(--faint)'}}/></div>
                  <div className="mem-v">{m.v}</div>
                </div>
              ))}
            </div>
          )}
          {tab==='history'&&a.id==='reviewer'&&(
            <div>
              <div style={{fontSize:11.5,color:'var(--faint)',marginBottom:13}}>每日收盘复盘归档</div>
              {window.REFLECTIONS.map((r,i)=>(
                <div key={i} className="refl-item">
                  <div className="refl-top"><span className="refl-date">{r.date}</span><span className={`mono ${r.ret.startsWith('-')?'dn':'up'}`} style={{fontSize:12.5}}>{r.ret}</span></div>
                  <div className="refl-note">{r.note}</div>
                </div>
              ))}
            </div>
          )}
          {tab==='history'&&a.id!=='reviewer'&&(
            <div>
              <div style={{fontSize:11.5,color:'var(--faint)',marginBottom:13}}>近期操作与汇报记录</div>
              {a.history.map((h,i)=>(
                <div key={i} className="hist-row">
                  <div className="hist-t">{h.t}</div>
                  <div><div className="hist-a">{h.a}</div><div className="hist-d">{h.d}</div></div>
                </div>
              ))}
            </div>
          )}
          {tab==='chat'&&(
            <div>
              <div style={{display:'flex',flexDirection:'column',gap:0,marginBottom:14}}>
                {msgs.map((m,i)=>(
                  <div key={i} style={{display:'flex',flexDirection:'column',alignItems:m.role==='agent'?'flex-start':'flex-end',marginBottom:8}}>
                    <div className="cb-lbl" style={{color:m.role==='agent'?'var(--ac)':'var(--faint)'}}>{m.role==='agent'?a.name:'你'}</div>
                    <div className={m.role==='agent'?'cb-a':'cb-u'}>{m.text}</div>
                  </div>
                ))}
                {typing&&(
                  <div style={{display:'flex',flexDirection:'column',alignItems:'flex-start',marginBottom:8}}>
                    <div className="cb-lbl" style={{color:'var(--ac)'}}>{a.name}</div>
                    <div className="cb-a"><span className="th"><span>●</span><span>●</span><span>●</span></span></div>
                  </div>
                )}
              </div>
              <div className="qps">
                {['为什么持有？','最大风险是？','信念分从哪来？'].map(q=>(
                  <button key={q} className="qp" onClick={()=>send(q)}>{q}</button>
                ))}
              </div>
              <div className="ci-row">
                <input className="ci" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder={`问 ${a.name}…`}/>
                <button className="cs" onClick={()=>send()}>→</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ===== FLOW SECTION ===== */
const LOOP_STEPS=[
  {l:'晨扫',state:'done'},{l:'6分析师',state:'done'},{l:'PM决策',state:'live'},
  {l:'风控',state:'todo'},{l:'成交',state:'todo'},
];

function FlowSection(){
  const canvasRef=useRef(null);
  const containerRef=useRef(null);
  const INIT_LOG=[
    {id:-4,from:'晨报',to:'NVDA',text:'半导体板块今晨 +2.1%',color:'#C2410C',time:'07:31'},
    {id:-3,from:'晨报',to:'UNH',text:'国会证词，请关注',color:'#B91C1C',time:'07:30'},
    {id:-2,from:'NVDA',to:'PM',text:'强烈看多，集中度超限！',color:'#C2410C',time:'07:32'},
    {id:-1,from:'UNH',to:'PM',text:'信念 0.48→0.44 下调',color:'#B91C1C',time:'07:32'},
  ];
  const[logItems,setLogItems]=useState(INIT_LOG);

  useEffect(()=>{
    const canvas=canvasRef.current,container=containerRef.current;
    if(!canvas)return;
    const CW=container?Math.min(container.clientWidth,1050):750;
    const W=CW,H=390,SX=W/590;
    const dpr=Math.min(window.devicePixelRatio||1,2);
    canvas.width=W*dpr;canvas.height=H*dpr;
    canvas.style.width=W+'px';canvas.style.height=H+'px';
    const ctx=canvas.getContext('2d');ctx.scale(dpr,dpr);
    const nodes=window.FLOW_NODES,edges=window.FLOW_EDGES,messages=window.FLOW_MESSAGES;
    const nm=Object.fromEntries(nodes.map(n=>[n.id,n]));
    function sx(x){return x*SX;}
    function bez(p0,p1,p2,p3,t){const mt=1-t;return mt*mt*mt*p0+3*mt*mt*t*p1+3*mt*t*t*p2+t*t*t*p3;}
    function ep(fid,tid){const f=nm[fid],tn=nm[tid],fx=sx(f.x),tx=sx(tn.x),dx=tx-fx;return{f:{...f,x:fx},tn:{...tn,x:tx},cx1:fx+dx*.5,cy1:f.y,cx2:fx+dx*.5,cy2:tn.y};}
    function gpos(fid,tid,t){const{f,tn,cx1,cy1,cx2,cy2}=ep(fid,tid);return{x:bez(f.x,cx1,cx2,tn.x,t),y:bez(f.y,cy1,cy2,tn.y,t)};}
    function rr(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath();}
    function hexRgb(hex){return{r:parseInt(hex.slice(1,3),16),g:parseInt(hex.slice(3,5),16),b:parseInt(hex.slice(5,7),16)};}
    const state={particles:[],msgIdx:0,activeEdges:new Set()};
    function spawn(){
      const msg=messages[state.msgIdx++%messages.length];
      const id=Date.now()+Math.random(),dur=1500+Math.random()*700;
      state.particles.push({id,...msg,startTime:Date.now(),dur});
      state.activeEdges.add(`${msg.from}-${msg.to}`);
      setTimeout(()=>state.activeEdges.delete(`${msg.from}-${msg.to}`),dur+400);
      setLogItems(prev=>[{id,from:nm[msg.from]?.label,to:nm[msg.to]?.label,text:msg.text,color:msg.color,time:new Date().toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'})},...prev.slice(0,3)]);
    }
    const si=setInterval(spawn,2100);spawn();setTimeout(()=>spawn(),800);setTimeout(()=>spawn(),1600);
    let raf;
    function draw(){
      ctx.clearRect(0,0,W,H);
      // subtle grid
      ctx.strokeStyle='rgba(255,255,255,.018)';ctx.lineWidth=.5;
      for(let x=0;x<W;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
      for(let y=0;y<H;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
      const now=Date.now();
      state.particles=state.particles.filter(p=>now-p.startTime<p.dur+600);
      // edges
      edges.forEach(e=>{
        const p=ep(e.from,e.to),lit=state.activeEdges.has(`${e.from}-${e.to}`),tcol=nm[e.to]?.color||'#888';
        ctx.beginPath();ctx.moveTo(p.f.x,p.f.y);ctx.bezierCurveTo(p.cx1,p.cy1,p.cx2,p.cy2,p.tn.x,p.tn.y);
        if(lit){ctx.strokeStyle=tcol+'99';ctx.lineWidth=1.8;ctx.shadowColor=tcol;ctx.shadowBlur=6;}
        else{ctx.strokeStyle='rgba(255,255,255,.07)';ctx.lineWidth=.8;ctx.shadowBlur=0;}
        ctx.stroke();ctx.shadowBlur=0;
      });
      // nodes
      nodes.forEach(n=>{
        const nx=sx(n.x),ny=n.y;
        ctx.beginPath();ctx.arc(nx,ny,n.r+8,0,Math.PI*2);ctx.fillStyle=n.color+'10';ctx.fill();
        ctx.beginPath();ctx.arc(nx,ny,n.r,0,Math.PI*2);ctx.fillStyle=n.color+'25';ctx.fill();
        ctx.strokeStyle=n.color+'99';ctx.lineWidth=1.5;ctx.shadowColor=n.color;ctx.shadowBlur=10;ctx.stroke();ctx.shadowBlur=0;
        ctx.font=`600 10.5px 'IBM Plex Mono',monospace`;ctx.fillStyle=n.color;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(n.label,nx,ny);
        ctx.font=`400 8.5px Inter,sans-serif`;ctx.fillStyle='rgba(255,255,255,.32)';ctx.fillText(n.sub,nx,ny+n.r+13);
      });
      // particles
      state.particles.forEach(p=>{
        const el=now-p.startTime,t=Math.min(el/p.dur,1),op=Math.min(t*5,1)*Math.min((1-t)*5,1);
        if(op<.04)return;
        const pos=gpos(p.from,p.to,t),rgb=hexRgb(p.color);
        ctx.beginPath();ctx.arc(pos.x,pos.y,10,0,Math.PI*2);ctx.fillStyle=`rgba(${rgb.r},${rgb.g},${rgb.b},${op*.18})`;ctx.fill();
        ctx.beginPath();ctx.arc(pos.x,pos.y,4,0,Math.PI*2);ctx.fillStyle=p.color;ctx.shadowColor=p.color;ctx.shadowBlur=14;ctx.globalAlpha=op;ctx.fill();ctx.globalAlpha=1;ctx.shadowBlur=0;
        if(t>.3&&t<.7){
          const txt=p.text.length>16?p.text.slice(0,16)+'…':p.text;
          ctx.font=`400 9px Inter,sans-serif`;const tw=ctx.measureText(txt).width;
          const bw=tw+16,bh=18;let bx=pos.x+9,by=pos.y-bh-4;
          if(bx+bw>W-6)bx=pos.x-bw-9;if(by<3)by=pos.y+8;
          ctx.save();ctx.globalAlpha=Math.min(op*2.2,.9);ctx.shadowBlur=0;
          rr(bx,by,bw,bh,4);ctx.fillStyle='#0c0e14';ctx.fill();ctx.strokeStyle=`rgba(${rgb.r},${rgb.g},${rgb.b},.4)`;ctx.lineWidth=.75;ctx.stroke();
          ctx.fillStyle=p.color;ctx.textAlign='left';ctx.textBaseline='middle';ctx.fillText(txt,bx+8,by+bh/2);ctx.restore();
        }
      });
      raf=requestAnimationFrame(draw);
    }
    draw();
    return()=>{clearInterval(si);cancelAnimationFrame(raf);};
  },[]);

  return(
    <div className="flow-sec">
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between'}}>
        <div>
          <div style={{fontFamily:'var(--fd)',fontSize:16,fontWeight:560,color:'var(--ink)'}}>团队协作实时流</div>
          <div style={{fontSize:12,color:'var(--faint)',marginTop:3}}>看团队如何传递信息、协同决策</div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:6,fontSize:12,color:'var(--soft)',flexShrink:0}}>
          <span className="live-dot"/>实时运转中
        </div>
      </div>
      {/* Step progress */}
      <div className="lb-steps">
        {LOOP_STEPS.map((s,i)=>(
          <div key={i} className={`lb-step ${s.state}`}>
            <div style={{display:'flex',alignItems:'center',gap:6}}>
              <div className="lb-mark">{s.state==='done'?'✓':s.state==='live'?'●':i+1}</div>
              <span className="lb-n">{s.l}</span>
            </div>
            <div className="lb-bar"><i/></div>
          </div>
        ))}
      </div>
      {/* Canvas */}
      <div ref={containerRef} className="flow-canvas-w">
        <canvas ref={canvasRef}/>
      </div>
      {/* Message feed */}
      <div style={{marginTop:12}}>
        <div style={{fontSize:9.5,textTransform:'uppercase',letterSpacing:'.09em',color:'var(--faint)',marginBottom:9,display:'flex',alignItems:'center',gap:5}}>
          <span className="live-dot" style={{width:5,height:5}}/>实时消息流
        </div>
        <div className="msg-grid">
          {logItems.slice(0,4).map(item=>(
            <div key={item.id} className="msg-chip" style={{borderLeftColor:item.color}}>
              <div style={{display:'flex',alignItems:'center',gap:5,marginBottom:3,fontSize:10}}>
                <span style={{color:item.color,fontWeight:700}}>{item.from}</span>
                <span style={{color:'var(--faint)'}}>→</span>
                <span style={{color:'var(--soft)',fontWeight:600}}>{item.to}</span>
                <span style={{marginLeft:'auto',fontFamily:'var(--fm)',color:'var(--faint)',fontSize:9.5}}>{item.time}</span>
              </div>
              <div style={{fontSize:12,color:'var(--ink)',lineHeight:1.4}}>{item.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ===== ADVISOR FLOAT ===== */
function AdvisorFloat({open,onToggle}){
  const[input,setInput]=useState('');
  const[msgs,setMsgs]=useState([{role:'adv',text:'你好！我是你的专属基金顾问。想了解今日发生了什么？或者为什么减仓了 NVDA？直接问我。'}]);
  const[typing,setTyping]=useState(false);
  const msgsRef=useRef(null);
  const REPLIES={
    nvda:'NVDA 目前占组合 25.5%，已触及 PM 设定的单标的 25% 上限。半导体分析师虽然信念分很高（88），但风控规则不能例外。基金经理今日计划减仓约 2%，降到安全区间。',
    表现:'今日组合整体上涨 +0.44%，NVDA（贡献 +105%）是主要驱动，UNH 因政策事件拖累约 28%。整体跑赢 SPY 约 0.2%，夏普比率 1.7。',
    团队:'你的 AI 投资团队由 7 位成员组成：基金经理 + 6 位专业分析师，各自专注一只标的，全天候更新分析和信念分。PM 每天整合所有观点后做最终配置决策。',
    风险:'当前主要风险：① NVDA 集中度超限（处理中）② UNH 政策事件不确定性 ③ 整体 β=1.08 略偏高。好消息是夏普比率 1.7，最大回撤仅 -4.6%。',
    unh:'医疗分析师将 UNH 信念分从 0.48 下调到了 0.44。原因是国会出现了与 UNH 相关的证词，潜在影响合规成本。PM 选择观望而非清仓。',
  };
  const getReply=(msg)=>{const l=msg.toLowerCase();for(const[k,r]of Object.entries(REPLIES)){if(l.includes(k))return r;}return `根据当前团队综合分析，组合运转正常。NVDA 集中度正在处理中，UNH 政策事件 PM 正在密切关注。你还想了解哪方面？`;};
  const send=()=>{if(!input.trim())return;const msg=input;setInput('');setMsgs(p=>[...p,{role:'user',text:msg}]);setTyping(true);setTimeout(()=>{setTyping(false);setMsgs(p=>[...p,{role:'adv',text:getReply(msg)}]);},1300+Math.random()*600);};
  useEffect(()=>{if(open&&msgsRef.current)msgsRef.current.scrollTop=msgsRef.current.scrollHeight;},[msgs,open,typing]);
  return(
    <div className="adv-w">
      <div className={`adv-panel${open?' open':''}`}>
        <div ref={msgsRef} className="adv-msgs">
          {msgs.map((m,i)=>(
            <div key={i} style={{display:'flex',gap:8,alignItems:'flex-start'}}>
              {m.role==='adv'&&<div className="adv-av">顾</div>}
              <div style={{flex:1}}>
                <div style={{fontSize:10,color:m.role==='adv'?'var(--aci)':'var(--faint)',marginBottom:3}}>{m.role==='adv'?'基金顾问':'你'}</div>
                <div style={{background:m.role==='adv'?'var(--inset)':'var(--acs)',padding:'8px 12px',borderRadius:10,fontSize:13,color:'var(--ink)',lineHeight:1.62,border:m.role==='adv'?'1px solid var(--line)':'none'}}>{m.text}</div>
              </div>
              {m.role==='user'&&<div style={{width:24,height:24,borderRadius:7,background:'var(--s2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,color:'var(--soft)',flexShrink:0,marginTop:18}}>我</div>}
            </div>
          ))}
          {typing&&(
            <div style={{display:'flex',gap:8,alignItems:'flex-start'}}>
              <div className="adv-av">顾</div>
              <div style={{background:'var(--inset)',padding:'9px 13px',borderRadius:10,border:'1px solid var(--line)'}}>
                <span className="th"><span>●</span><span>●</span><span>●</span></span>
              </div>
            </div>
          )}
        </div>
        <div style={{padding:'7px 15px 5px',display:'flex',gap:6,flexWrap:'wrap',borderTop:'1px solid var(--line)'}}>
          {['为什么减仓 NVDA？','今日表现怎样？','UNH 发生了什么？'].map(q=>(
            <button key={q} onClick={()=>setInput(q)} style={{padding:'3px 9px',background:'var(--s2)',border:'1px solid var(--line)',borderRadius:6,fontSize:11,color:'var(--soft)',cursor:'pointer',fontFamily:'inherit'}}>
              {q}
            </button>
          ))}
        </div>
        <div className="adv-ir">
          <input className="adv-in" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder="问你的基金顾问任何问题……"/>
          <button className="adv-snd" onClick={send}>发送</button>
        </div>
      </div>
      <div className="adv-bar" onClick={onToggle}>
        <div className="adv-av">顾</div>
        <div style={{flex:1}}>
          <div style={{fontSize:13,fontWeight:600,color:'var(--ink)'}}>问问基金顾问</div>
        </div>
        <div style={{color:'var(--faint)',fontSize:12,marginLeft:'auto'}}>{open?'▼':'▲'}</div>
      </div>
    </div>
  );
}

Object.assign(window,{Onboarding,TopBar,NavBar,TeamSection,AgentDrawer,FlowSection,AdvisorFloat});
