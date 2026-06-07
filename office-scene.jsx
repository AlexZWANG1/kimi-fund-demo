const{useState,useEffect,useRef}=React;

/* ============================================================
   投研办公室 — virtual office of monitor workstations.
   Each seat is a real computer monitor (screen + stand) on a
   desk; the screen shows what that seat is working on. Tasks are
   dispatched by talking to the Advisor (floating button) — the
   office listens for 'ta-dispatch' and animates the collaboration,
   streaming into the ambient 今日动态 activity log.
   ============================================================ */

function buildScript(){
  const L=(id,phase,text,kind,scr)=>({id,phase,text,kind,scr});
  return [
    L('pm','split','基金经理 · 把指令拆解为 3 项研究任务','dispatch','拆解任务 → 分派 3 个席位'),
    L('nvda','work','半导体分析师 · 检索 Blackwell 出货数据…','work','> 拉取 NVDA 出货 / 集中度'),
    L('cost','work','消费分析师 · 拉取月度会员续费率…','work','> 拉取 COST 续费率'),
    L('unh','work','医疗分析师 · 解析国会证词影响…','work','> 解析 UNH 政策风险'),
    L('nvda','done','半导体分析师 · 集中度 25.5% 触顶，建议减仓','reply','✓ 触顶 25.5% → 建议减仓'),
    L('cost','done','消费分析师 · 续费率 92.9%，维持持有','reply','✓ 续费率 92.9% → 维持'),
    L('unh','done','医疗分析师 · 信念 0.48→0.44，保留缓冲','reply','✓ 信念下调 → 保留缓冲'),
    L('pm','synth','基金经理 · 汇总 → 交易意图：NVDA −2%，其余维持','result','汇总 → NVDA −2% · 其余维持'),
    L('reviewer','log','复盘官 · 写入知识库「集中度纪律」','memory','写入知识库 +1'),
  ];
}
const LOG_DOT={dispatch:'var(--ac)',work:'var(--wn)',reply:'var(--up)',result:'var(--ac)',memory:'var(--ppi)'};
function clock(){const d=new Date();return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;}
function miniPath(seed,trend){const d=window.spark?window.spark(seed,trend,22):[];if(!d.length)return'';const mn=Math.min(...d),mx=Math.max(...d),sp=(mx-mn)||1;return d.map((v,i)=>(i?'L':'M')+(i/(d.length-1)*100).toFixed(1)+' '+(25-((v-mn)/sp)*22).toFixed(1)).join(' ');}
function miniArea(seed,trend){const p=miniPath(seed,trend);return p?p+' L 100 28 L 0 28 Z':'';}

function OfficeFloor({onChat}){
  const ags=window.AGENTS, META=window.SEAT_META||{}, SHORT=window.SHORT||{};
  const byId=Object.fromEntries(ags.map(a=>[a.id,a]));
  const pm=byId.pm, reviewer=byId.reviewer;
  const analysts=ags.filter(a=>a.id!=='pm'&&a.id!=='reviewer');
  const script=useRef(buildScript()).current;

  const baseState=()=>{const s={};ags.forEach(a=>s[a.id]=a.status==='idle'?'lounge':'desk');return s;};
  const baseScreen=()=>{const s={};ags.forEach(a=>s[a.id]=SHORT[a.id]||(META[a.id]||{}).desc||'待命');return s;};
  const[seat,setSeat]=useState(baseState);
  const[screen,setScreen]=useState(baseScreen);
  const[log,setLog]=useState([
    {id:'reviewer',kind:'memory',text:'复盘官 · 收盘复盘：组合 +0.34%，跑赢基准 12bp',t:'昨 16:30'},
    {id:'pm',kind:'result',text:'基金经理 · 今日计划：减仓 NVDA 2%，其余维持',t:'08:45'},
  ]);
  const[running,setRunning]=useState(false);
  const stepRef=useRef(0); const timer=useRef(null); const logRef=useRef(null);

  useEffect(()=>()=>clearTimeout(timer.current),[]);
  useEffect(()=>{if(logRef.current)logRef.current.scrollTop=0;},[log]);

  const tick=()=>{
    const i=stepRef.current;
    if(i>=script.length){
      setRunning(false);
      setSeat(s=>{const n={...s};ags.forEach(a=>{if(n[a.id]==='working'||n[a.id]==='active')n[a.id]=a.status==='idle'?'lounge':'desk';});return n;});
      return;
    }
    const ev=script[i];
    setLog(p=>[{...ev,t:clock()},...p].slice(0,30));
    setSeat(s=>{const n={...s};
      if(ev.phase==='work'){n[ev.id]='working';}
      else if(ev.phase==='done'){n[ev.id]='done';}
      else if(ev.phase==='split'||ev.phase==='synth'){n.pm='active';}
      else if(ev.phase==='log'){n[ev.id]='active';}
      return n;});
    if(ev.scr)setScreen(s=>({...s,[ev.id]:ev.scr}));
    stepRef.current++;
    timer.current=setTimeout(tick,ev.phase==='work'?1000:1350);
  };
  const run=()=>{clearTimeout(timer.current);stepRef.current=0;setScreen(baseScreen());setRunning(true);setTimeout(()=>{stepRef.current=0;tick();},50);};

  // advisor dispatches tasks here
  useEffect(()=>{
    const h=()=>run();
    window.addEventListener('ta-dispatch',h);
    return()=>window.removeEventListener('ta-dispatch',h);
    // eslint-disable-next-line
  },[]);

  const Workstation=({a,featured})=>{
    const m=META[a.id]||{}; const st=seat[a.id];
    const working=st==='working', done=st==='done', active=st==='active';
    const appName=a.id==='pm'?'PortfolioOS':a.id==='reviewer'?'Reviewer':`${m.sym} 终端`;
    const scrText=screen[a.id];
    const q=(window.QUOTE||{})[a.id];
    const up=a.dir==='b', dn=a.dir==='s';
    const cc=dn?'#e0735f':up?'#5fb98c':'#5f9ea8';
    const trend=dn?-1:up?1:0.25;
    const seed=a.id.split('').reduce((s,c)=>s+c.charCodeAt(0),0);
    return(
      <div className={`ws${featured?' ws-pm':''}${working?' working':''}${done?' done':''}${active?' active':''}`}
           style={{'--cc':a.color}} onClick={()=>onChat(a)}>
        <div className="ws-monitor">
          <div className="ws-screen">
            <div className="ws-scrbar"><i/><i/><i/><span className="ws-app">{appName}</span>{(working||active)&&<span className="ws-run">live</span>}</div>
            <div className="ws-scrbody">
              <div className="ws-scr-top">
                <span className="ws-scr-tk">{a.id==='pm'?'组合':a.id==='reviewer'?'知识库':m.sym}</span>
                {q
                  ? <span className={`ws-scr-px ${q.chg>=0?'up':'dn'}`}>${q.price} <i>{q.chg>=0?'+':''}{q.chg}%</i></span>
                  : <span className={`ws-scr-px ${a.id==='reviewer'?'mut':'up'}`}>{a.id==='pm'?'+0.44%':'EOD'}</span>}
              </div>
              <svg className="ws-scr-chart" viewBox="0 0 100 28" preserveAspectRatio="none">
                <path d={miniArea(seed,trend)} fill={cc} fillOpacity=".12"/>
                <path d={miniPath(seed,trend)} fill="none" stroke={cc} strokeWidth="1.4" vectorEffect="non-scaling-stroke" strokeLinejoin="round"/>
              </svg>
              <div className="ws-scr-status">{scrText}{(working||active)&&<span className="ws-cur"/>}</div>
            </div>
          </div>
          <div className="ws-neck"/>
          <div className="ws-base"/>
        </div>
        <div className="ws-person">
          <window.Persona agent={a} size={featured?64:58}/>
          <span className={`ws-led ${working?'w':done?'d':active?'a':'r'}`}/>
        </div>
        <div className="ws-desk">
          <div className="ws-id">
            <div className="ws-nm">{a.name}</div>
            <div className="ws-rl">{a.id==='pm'?'组合经理 · 编排':a.id==='reviewer'?'复盘官':m.sym+' · '+(m.dirl||'')}</div>
          </div>
          <button className="ws-chat" onClick={e=>{e.stopPropagation();onChat(a);}}>查看</button>
        </div>
      </div>
    );
  };

  const loungeSeats=ags.filter(a=>seat[a.id]==='lounge'&&a.id!=='reviewer');

  return(
    <div className="office2">
      <div className="of2-head">
        <div className="of2-hl">
          <span className={`of2-online${running?' on':''}`}><span className="of2-dot"/>{running?'协作中':'在线'}</span>
          <span className="of2-meta">通过 Kimi 投研助手 下发任务</span>
        </div>
        <button className="of2-replay" onClick={run} disabled={running}>{running?'运转中…':'▶ 模拟一次协作'}</button>
      </div>

      <div className="of2-floor">
        <Workstation a={pm} featured/>
        <div className="ws-grid">{analysts.map(a=><Workstation key={a.id} a={a}/>)}</div>

        <div className="lounge2">
          <span className="lounge2-hd"><span className="lounge2-ic">☕</span>休息区</span>
          <div className="lounge2-row">
            {loungeSeats.length===0&&<span className="lounge2-empty">分析师均在岗</span>}
            {loungeSeats.map(a=><button key={a.id} className="lounge2-av" onClick={()=>onChat(a)} title={`${a.name} · 空闲`}><window.Persona agent={a} size={32} ring={false}/></button>)}
            <span className="lounge2-div"/>
            <button className="lounge2-av rev" onClick={()=>onChat(reviewer)} title="复盘官 · 收盘后工作"><window.Persona agent={reviewer} size={32} ring={false}/></button>
            <span className="lounge2-revtx">复盘官 · 收盘后上岗</span>
          </div>
        </div>
      </div>

      <div className="of2-activity">
        <div className="of2-act-hd">今日动态 · 协作记录</div>
        <div className="of2-feed" ref={logRef}>
          {log.map((l,i)=>{const a=byId[l.id];return(
            <div className={`of2-line${i===0&&running?' fresh':''}`} key={log.length-i}>
              <span className="of2-t">{l.t}</span>
              <span className="of2-ld" style={{background:LOG_DOT[l.kind]||'var(--faint)'}}/>
              <span className="of2-la" style={{background:a?a.color:'#555'}}>{a?a.initials:'·'}</span>
              <span className="of2-tx">{l.text}</span>
            </div>
          );})}
        </div>
      </div>
    </div>
  );
}

window.OfficeFloor=OfficeFloor;
