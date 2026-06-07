const{useState,useEffect,useRef,useReducer}=React;
const DIR_MAP={b:{c:'dir-b',l:'看多'},h:{c:'dir-h',l:'持有'},s:{c:'dir-s',l:'看空'}};
const CYCLE=['已更新','更新中','待复核','待复盘','无新增'];
const ST_PHASE={live:'工作中',busy:'待复核',idle:'空闲'};

/* 团队管理 — manage the research team: rename, add analysts, enter a member */
function TeamManage({onSelect}){
  const ags=window.AGENTS, META=window.SEAT_META||{};
  const[,force]=useReducer(x=>x+1,0);
  useEffect(()=>{const h=()=>force();window.addEventListener('ta-team-changed',h);return()=>window.removeEventListener('ta-team-changed',h);},[]);
  const[editing,setEditing]=useState(null);
  const[draft,setDraft]=useState('');
  const[adding,setAdding]=useState(false);
  const[nName,setNName]=useState('');
  const[nSym,setNSym]=useState('');

  const persistNames=()=>{const o={};ags.forEach(a=>{if(a.name)o[a.id]=a.name;});localStorage.setItem('ta-names',JSON.stringify(o));};
  const persistAdded=()=>{const add=ags.filter(a=>a.custom).map(a=>({...a,_seat:window.SEAT_META[a.id]}));localStorage.setItem('ta-added',JSON.stringify(add));};
  const commitRename=(a)=>{const v=draft.trim();if(v){a.name=v;persistNames();}setEditing(null);force();};
  const addMember=()=>{
    const sym=(nSym.trim().toUpperCase())||'NEW';
    const name=nName.trim()||(sym+' 分析师');
    const palette=['#0F766E','#7C3AED','#C2410C','#2563EB','#B91C1C','#166534','#0284C7'];
    const id='cust_'+Date.now();
    const a={id,name,role:sym+' 分析师',initials:sym.slice(0,2),color:palette[ags.length%palette.length],dir:'h',status:'idle',task:'待分配研究任务',quote:'',conviction:0,memory:[],history:[],custom:true};
    window.SEAT_META[id]={sym,dirl:'持有',model:'kimi-k2',skills:['基本面','跟踪'],desc:'新加入团队，等待分配标的与首次研究任务。'};
    ags.push(a);persistAdded();setAdding(false);setNName('');setNSym('');force();
  };
  const remove=(a)=>{const i=ags.indexOf(a);if(i>=0){ags.splice(i,1);persistAdded();force();}};

  const pm=ags.find(a=>a.id==='pm');
  const analysts=ags.filter(a=>a.id!=='pm'&&a.id!=='reviewer');
  const rev=ags.find(a=>a.id==='reviewer');

  const Row=({a})=>{
    const m=META[a.id]||{};
    const isEd=editing===a.id;
    return(
      <div className="tm-row" style={{'--cc':a.color}}>
        <span className="tm-av">{window.Persona?<window.Persona agent={a} size={44} ring={false}/>:a.initials}</span>
        <div className="tm-main">
          {isEd?(
            <div className="tm-edit">
              <input className="tm-input" value={draft} autoFocus onChange={e=>setDraft(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')commitRename(a);if(e.key==='Escape')setEditing(null);}}/>
              <button className="tm-btn primary" onClick={()=>commitRename(a)}>保存</button>
              <button className="tm-btn ghost" onClick={()=>setEditing(null)}>取消</button>
            </div>
          ):(
            <div className="tm-nm-row">
              <span className="tm-nm">{a.name}</span>
              {m.sym&&<span className="tm-sym">{m.sym}</span>}
              {a.style&&<span className="tm-style">{a.style}</span>}
              <button className="tm-rename" title="重命名" onClick={()=>{setEditing(a.id);setDraft(a.name);}}>✎</button>
            </div>
          )}
          <div className="tm-sub">{a.persona?`偏好：${a.persona}`:(m.model||'kimi-k2')}{a.conviction>0?` · 信念 ${a.conviction}`:''}{a.custom?' · 新加入':''}</div>
        </div>
        <span className={`tm-status ${a.status}`}>{ST_PHASE[a.status]||'在岗'}</span>
        <button className="tm-enter" onClick={()=>onSelect(a)}>进入 ›</button>
        {a.custom&&<button className="tm-del" title="移除" onClick={()=>remove(a)}>✕</button>}
      </div>
    );
  };

  return(
    <div className="tm-wrap">
      <div className="tm-hd">
        <div>
          <div className="tm-title">管理你的投研团队</div>
          <div className="tm-desc">重命名成员、查看分工，或添加新的分析师覆盖更多标的。点「进入」查看该成员的研究与对话。</div>
        </div>
        <button className="tm-add-btn" onClick={()=>setAdding(v=>!v)}>＋ 添加分析师</button>
      </div>
      {adding&&(
        <div className="tm-addform">
          <input className="tm-input" placeholder="标的代码，如 TSLA" value={nSym} onChange={e=>setNSym(e.target.value)}/>
          <input className="tm-input" placeholder="名称（留空＝自动）" value={nName} onChange={e=>setNName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addMember()}/>
          <button className="tm-btn primary" onClick={addMember}>添加</button>
          <button className="tm-btn ghost" onClick={()=>setAdding(false)}>取消</button>
        </div>
      )}
      <div className="tm-group-label">组合经理</div>
      <div className="tm-list">{pm&&<Row a={pm}/>}</div>
      <div className="tm-group-label">分析师 · {analysts.length}</div>
      <div className="tm-list">{analysts.map(a=><Row key={a.id} a={a}/>)}</div>
      <div className="tm-group-label">复盘</div>
      <div className="tm-list">{rev&&<Row a={rev}/>}</div>
    </div>
  );
}

function KnowledgeGraph({wiki,onOpen}){
  const cx=300,cy=126,R=88;
  const nodes=wiki.map((w,i)=>{const ang=-Math.PI/2+i/wiki.length*Math.PI*2;return{...w,x:cx+Math.cos(ang)*R,y:cy+Math.sin(ang)*R};});
  return(
    <div className="kg-wrap">
      <svg viewBox="0 0 600 252" className="kg-svg">
        {nodes.map((n,i)=><line key={'s'+i} x1={cx} y1={cy} x2={n.x} y2={n.y} stroke="var(--line)" strokeWidth="1"/>)}
        {nodes.map((n,i)=>{const m=nodes[(i+1)%nodes.length];return <line key={'c'+i} x1={n.x} y1={n.y} x2={m.x} y2={m.y} stroke="var(--line-s)" strokeWidth=".75" strokeDasharray="3 4" opacity=".6"/>;})}
        <g onClick={onOpen} style={{cursor:'pointer'}}>
          <circle cx={cx} cy={cy} r="32" fill="rgba(99,102,241,.18)" stroke="#6366f1" strokeWidth="1.5"/>
          <text x={cx} y={cy-1} textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#a5b4fc">知识库</text>
          <text x={cx} y={cy+12} textAnchor="middle" fontSize="8" fill="var(--faint)">复盘官写</text>
        </g>
        {nodes.map((n,i)=>(
          <g key={'n'+i} onClick={onOpen} style={{cursor:'pointer'}}>
            <circle cx={n.x} cy={n.y} r="7" fill="var(--ac)" stroke="var(--paper)" strokeWidth="2"/>
            <text x={n.x} y={n.y<cy?n.y-13:n.y+18} textAnchor="middle" fontSize="10" fontWeight="600" fill="var(--soft)">{n.kind}·{n.backlinks}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function CompanyArchive({onSelect}){
  const ags=window.AGENTS, WIKI=window.WIKI;
  const[open,setOpen]=useState(false);
  const rev=ags.find(a=>a.id==='reviewer');
  const logs=ags.flatMap(a=>a.history.map(h=>({t:h.t,action:h.a,detail:h.d,agent:a})));
  return(
    <>
      <div className="arch-sec">
        <div className="kb-hd">
          <button className="kb-persona" onClick={()=>onSelect(rev)}>
            <span className="kb-av" style={{background:rev.color}}>{rev.initials}</span>
            <span style={{minWidth:0}}>
              <span className="kb-name">复盘官<span className="kb-chev">查看研究档案 ›</span></span>
              <span className="kb-line">研究档案 · 今日新增 {WIKI.length} 条长期记录</span>
            </span>
          </button>
          <button className="arch-toggle" onClick={()=>setOpen(o=>!o)}>{open?'收起':'查看关系'} <span className={`nb-arr${open?' up':''}`}/></button>
        </div>
        {open&&<KnowledgeGraph wiki={WIKI} onOpen={()=>onSelect(rev)}/>}
        <div className="wiki-cards">
          {WIKI.map((w,i)=>(
            <div className="wiki-card" key={i} onClick={()=>onSelect(rev)}>
              <div className="wiki-title">{w.title}</div>
              <div className="wiki-cardmeta">{w.kind} · {w.date} · 引用 {w.backlinks} 次</div>
            </div>
          ))}
        </div>
      </div>

      <div className="arch-sec">
        <div className="arch-title" style={{marginBottom:4}}>公司历史 · 全员工作记录</div>
        <div className="arch-sub" style={{marginBottom:12}}>每位成员过往的研究与操作 · 点击查看</div>
        <div className="log-list">
          {logs.map((l,i)=>(
            <div className="log-row" key={i} onClick={()=>onSelect(l.agent)}>
              <span className="log-t">{l.t}</span>
              <span className="log-av" style={{background:l.agent.color}}>{l.agent.initials}</span>
              <div style={{flex:1,minWidth:0}}>
                <div className="log-a">{l.agent.name} <span style={{color:'var(--faint)',fontWeight:400}}>· {l.action}</span></div>
                <div className="log-d">{l.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

window.TeamOffice=TeamManage;
window.CompanyArchive=CompanyArchive;

/* ===== Collab replay (showpiece) — watch info pass between seats ===== */
const CR=[
  {from:'nvda',to:'pm',text:'NVDA 集中度触顶，建议控仓'},
  {from:'unh',to:'pm',text:'UNH 政策风险，信念 0.48→0.44'},
  {from:'pm',to:'nvda',text:'减仓 2%，守住 25% 上限'},
  {from:'cost',to:'pm',text:'COST 续费率 92.9%，维持'},
  {from:'aapl',to:'pm',text:'AAPL 供应链向好，+1%'},
  {from:'pm',to:'aapl',text:'暂不加仓，保留观察'},
  {from:'googl',to:'pm',text:'GCP 加速，维持持有'},
  {from:'jpm',to:'pm',text:'JPM 净息差扩张，小幅加'},
];
function CollabReplay(){
  const ags=window.AGENTS;
  const order=['nvda','googl','cost','pm','jpm','unh','aapl'];
  const byId=Object.fromEntries(ags.map(a=>[a.id,a]));
  const xOf=id=>{const i=order.indexOf(id);return 7+i*(86/(order.length-1));};
  const[i,setI]=useState(0);
  const[arr,setArr]=useState(false);
  const[play,setPlay]=useState(true);
  const m=CR[i];
  useEffect(()=>{
    setArr(false);
    const t=setTimeout(()=>setArr(true),120);
    return()=>clearTimeout(t);
  },[i]);
  useEffect(()=>{
    if(!play)return;
    const iv=setInterval(()=>setI(p=>(p+1)%CR.length),2600);
    return()=>clearInterval(iv);
  },[play]);
  const sender=byId[m.from],receiver=byId[m.to];
  return(
    <div className="cr-sec">
      <div className="arch-hd" style={{cursor:'default'}}>
        <div>
          <div className="arch-title">今日协作回放</div>
          <div className="arch-sub">看信息如何在席位之间传递 · 共 {CR.length} 步</div>
        </div>
        <button className="cr-play" onClick={()=>setPlay(p=>!p)}>{play?'⏸ 暂停':'▶ 播放'}</button>
      </div>
      <div className="cr-stage">
        <div className="cr-track"/>
        <div className="cr-pill" style={{left:(arr?xOf(m.to):xOf(m.from))+'%',borderColor:sender.color+'66'}}>{m.text}</div>
        {order.map(id=>{
          const a=byId[id],active=id===m.from||id===m.to;
          return(
            <div key={id} className={`cr-av${active?'':' dim'}`} style={{left:xOf(id)+'%'}}>
              <div className="a" style={{background:a.color}}>{a.initials}
                {id===m.to&&arr&&<span className="cr-ring" style={{borderColor:a.color}}/>}
              </div>
              <div className="nm">{a.name}</div>
            </div>
          );
        })}
      </div>
      <div className="cr-cap">
        <span style={{color:sender.color,fontWeight:600}}>{sender.name}</span>
        <span style={{color:'var(--faint)'}}>→</span>
        <span style={{color:receiver.color,fontWeight:600}}>{receiver.name}</span>
        <span style={{color:'var(--soft)'}}>· {m.text}</span>
      </div>
    </div>
  );
}
window.CollabReplay=CollabReplay;
