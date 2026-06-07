const{useState,useEffect,useRef}=React;

/* ============================================================
   ChatDock — the ONE unified AI-conversation surface.
   Semi-floating top-right panel: left avatar rail to switch
   seats, each conversation has 3 tabs — 闲聊 / 记忆 / 产物.
   Every "talk to AI" entry point in the app opens this via the
   window events 'ta-togglechat' and 'ta-openchat' (detail=agent).
   ============================================================ */

const ADVISER={id:'adviser',name:'Kimi 投研助手',role:'投研助手',initials:'Ki',color:'#5F9EA8',status:'live'};
const ST_DOT={live:'st-live',busy:'st-busy',idle:'st-idle'};
const ST_TX={live:'在线',busy:'忙碌',idle:'空闲'};

function seedFor(c){
  if(c.id==='adviser')return '我是 Kimi 投研助手，团队的研究我都综合好了。今天想看哪块——为什么减仓 NVDA，还是组合表现？';
  if(c.id==='pm')return `${c.name}在此。我整合了团队今天的全部观点，核心结论是减仓 NVDA 2%、其余维持。想从哪聊起？`;
  if(c.id==='reviewer')return `我是复盘官。每天收盘后我读全天记录、更新各成员记忆、维护知识库。想了解昨天的复盘还是某条长期记忆？`;
  return `你好，我是${c.name}，负责盯 ${(c.role||'').replace('分析师','').trim()}。关于今天的判断有什么想问的？`;
}
const ADV_MAP={
  nvda:'NVDA 占组合 25.5%，已触及单标的 25% 上限。半导体分析师信念 88、仍看多，但纪律不开例外——PM 计划本周减约 2% 至安全区间。',
  减仓:'减仓只针对 NVDA，因为它触顶了集中度上限。其余六只逻辑没变，维持原判。',
  表现:'今日组合 +0.44%，NVDA 是主要正贡献，UNH 拖累约 15bp，跑赢 SPY 约 0.2%，夏普 1.7。',
  团队:'你的投研团队由 7 位成员组成：基金经理 + 6 位分析师 + 复盘官。各自盯一只票，全天更新观点与信念分。',
  风险:'当前三个关注点：① NVDA 集中度触顶（处理中）② UNH 政策不确定性 ③ 半导体板块接近 30% 行业上限。',
  unh:'医疗分析师把 UNH 信念从 0.48 下调到 0.44，国会证词的政策成本尚未定价，PM 保留缓冲而非清仓。',
};
const PM_MAP={
  nvda:'NVDA 现占 25.5%，刚顶到我设的 25% 上限。半导体分析师信念 88、仍强烈看多，但纪律不开例外——本周减约 2%，腾出的现金进缓冲。',
  unh:'医疗分析师把 UNH 从 0.48 下调到 0.44。政策成本还没定价，我留缓冲、不清仓，保留政策落空时的修复期权。',
  表现:'今日净值 +0.44%，NVDA 主要正贡献，UNH 拖累约 15bp。跑赢 SPY 约 0.2%，夏普 1.7，最大回撤 -4.6%。',
  减仓:'减仓只针对 NVDA。其余六只逻辑没变，维持原判。',
  风险:'三个关注点：① NVDA 集中度触顶 ② UNH 政策不确定性 ③ 组合 β≈1.08 略高。',
};
function reply(c,msg){
  const l=msg.toLowerCase();
  if(c.id==='adviser'){for(const[k,r]of Object.entries(ADV_MAP)){if(l.includes(k.toLowerCase()))return r;}return '组合运转正常：今天减仓 NVDA 守住集中度纪律，其余维持。想细看哪一块？';}
  if(c.id==='pm'){for(const[k,r]of Object.entries(PM_MAP)){if(l.includes(k.toLowerCase()))return r;}return '今天整体判断：减仓 NVDA 守住纪律，其余维持。你可以直接问对应分析师更细的逻辑。';}
  if(c.id==='reviewer'){if(l.includes('记忆')||l.includes('知识'))return '我维护团队的长期知识库——主题、复盘、论点、词条，只增不改、可追溯。今天为半导体分析师追加了「集中度纪律」一条。';return '昨日复盘：组合 +0.34%，跑赢基准 12bp；半导体强、医疗弱。我已据此更新各成员记忆。';}
  const risk=c.memory&&c.memory.find(m=>m.k==='风险'||m.k==='警告');
  if(l.includes('风险')||l.includes('担心'))return `最主要的风险：${risk?risk.v:'估值与宏观不确定性'}`;
  if(l.includes('信念')||l.includes('依据')||l.includes('为什么'))return `信念分 ${c.conviction} 的依据：${c.memory&&c.memory[0]?c.memory[0].v:'基本面与跟踪数据'}`;
  if(l.includes('做什么')||l.includes('任务'))return `我正在 ${c.task}，有结论会第一时间汇报给 基金经理。`;
  return (c.quote||'').replace(/"/g,'')||`我维持当前判断：${(window.SHORT||{})[c.id]||''}`;
}

/* build a structured research-result card from a dispatched prompt (the 产物) */
function buildCard(msg){
  if(!/评估|复核|重新评估|分析|风险|怎么看|减仓|加仓|盯|跑一下|看一下|集中度|建议|复盘/.test(msg))return null;
  const AG=window.AGENTS||[];
  const CN={'英伟达':'NVDA','苹果':'AAPL','谷歌':'GOOGL','摩根大通':'JPM','小摩':'JPM','联合健康':'UNH','开市客':'COST','好市多':'COST'};
  let sym=null;const up=msg.toUpperCase();
  for(const s of ['NVDA','AAPL','GOOGL','COST','JPM','UNH'])if(up.includes(s)){sym=s;break;}
  if(!sym)for(const c in CN)if(msg.includes(c)){sym=CN[c];break;}
  if(!sym)sym='NVDA';
  const a=AG.find(x=>(x.role||'').toUpperCase().startsWith(sym))||AG.find(x=>x.id===sym.toLowerCase());
  const pm=AG.find(x=>x.id==='pm');if(!a)return null;
  const CONC={NVDA:'NVDA 权重 25.5% 触及单票 25% 上限，建议减仓约 2% 至 22%，腾出现金缓冲。',UNH:'政策听证尚未定价，信念 0.44 偏低，建议保留缓冲、不加仓。',AAPL:'当前低配 5.5%，供应链向好，建议小幅加仓 +1%。',GOOGL:'广告防御性强、GCP 加速，维持持有，等数据催化。',COST:'会员续费率 92.9%，护城河稳，维持持有。',JPM:'净息差扩张、拨备充足，可小幅加仓至目标权重。'};
  const ACT={NVDA:'减仓 NVDA 2% · 其余维持',UNH:'保留 UNH 缓冲 · 不加仓',AAPL:'加仓 AAPL +1%',GOOGL:'维持 GOOGL 持有',COST:'维持 COST 持有',JPM:'小幅加仓 JPM'};
  const points=[
    {who:a.name,sym,style:a.style,text:(a.persona?`（偏好：${a.persona}）`:'')+((a.memory&&a.memory[0])?a.memory[0].v:(a.quote||'').replace(/"/g,''))},
    {who:pm?pm.name:'基金经理',text:'集中度与风控纪律优先于信念分，结论已纳入今日计划。'},
  ];
  return {sym,title:`${sym} 研究结论`,conviction:(a.conviction/100)||0.6,style:a.style,conclusion:CONC[sym]||(a.quote||'').replace(/"/g,''),action:ACT[sym]||'维持持仓',points,ts:new Date().toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'})};
}

function ResultCard({card}){
  return(
    <div className="rc">
      <div className="rc-top"><span className="rc-kind">研究产物</span><span className="rc-ttl">{card.title}</span><span className="rc-conv">信念 {card.conviction.toFixed(2)}</span></div>
      <div className="rc-concl">{card.conclusion}</div>
      <div className="rc-action"><span className="rc-action-lbl">建议动作</span><span className="rc-action-v">{card.action}</span></div>
      <div className="rc-points">
        {card.points.map((p,i)=>(
          <div className="rc-pt" key={i}>
            <span className="rc-pt-who">{p.who}{p.style?` · ${p.style}`:''}</span>
            <span className="rc-pt-tx">{p.text}</span>
          </div>
        ))}
      </div>
      <div className="rc-foot">{card.ts} · 已纳入今日计划 · 引用 {card.points.length} 条观点</div>
    </div>
  );
}

const TABS=[{k:'chat',l:'对话'},{k:'memory',l:'记忆'},{k:'artifacts',l:'产物'}];
const landDoc=(id)=>id==='adviser'?null:{type:id==='reviewer'?'reflection':id==='pm'?'plan':'note',sid:id};

function ChatDock(){
  const AG=window.AGENTS||[];
  const contacts=[ADVISER,...AG];
  const byId=Object.fromEntries(contacts.map(c=>[c.id,c]));
  const[open,setOpen]=useState(false);
  const[big,setBig]=useState(false);
  const[active,setActive]=useState('adviser');
  const[tab,setTab]=useState('chat');
  const[store,setStore]=useState({});
  const[input,setInput]=useState('');
  const[typing,setTyping]=useState(false);
  const bodyRef=useRef(null);
  const[pos,setPos]=useState(null);
  const[doc,setDoc]=useState(null);
  const panelRef=useRef(null);
  const onHeadDown=(e)=>{
    if(e.target.closest('button'))return;
    const r=panelRef.current.getBoundingClientRect();
    const off={dx:e.clientX-r.left,dy:e.clientY-r.top};
    const mv=(ev)=>setPos({left:Math.max(6,Math.min(window.innerWidth-140,ev.clientX-off.dx)),top:Math.max(6,Math.min(window.innerHeight-70,ev.clientY-off.dy))});
    const up=()=>{window.removeEventListener('pointermove',mv);window.removeEventListener('pointerup',up);};
    window.addEventListener('pointermove',mv);window.addEventListener('pointerup',up);
  };

  const ensure=(id)=>setStore(s=>s[id]?s:{...s,[id]:[{role:'them',text:seedFor(byId[id]||ADVISER)}]});
  useEffect(()=>{ensure('adviser');/* eslint-disable-next-line */},[]);
  useEffect(()=>{
    const tog=()=>setOpen(o=>!o);
    const opn=(e)=>{const a=e.detail;const id=a&&a.id?a.id:'adviser';const t=a&&a.tab;setOpen(true);setActive(id);ensure(id);if(a&&a.prefill)setInput(a.prefill);if(t==='artifacts'){setTab('artifacts');setDoc(landDoc(id));}else{setTab('chat');setDoc(null);}};
    const opd=(e)=>{const{sid,type}=e.detail||{};const id=sid||'adviser';setOpen(true);setActive(id);setTab('artifacts');ensure(id);setDoc({type:type||(id==='reviewer'?'reflection':id==='pm'?'plan':'note'),sid:id});};
    window.addEventListener('ta-togglechat',tog);window.addEventListener('ta-openchat',opn);window.addEventListener('ta-opendoc',opd);
    return()=>{window.removeEventListener('ta-togglechat',tog);window.removeEventListener('ta-openchat',opn);window.removeEventListener('ta-opendoc',opd);};
    // eslint-disable-next-line
  },[]);
  useEffect(()=>{if(tab==='chat'&&bodyRef.current)bodyRef.current.scrollTop=bodyRef.current.scrollHeight;},[store,typing,active,tab]);
  useEffect(()=>{const k=e=>{if(e.key==='Escape')setOpen(false);};window.addEventListener('keydown',k);return()=>window.removeEventListener('keydown',k);},[]);

  const pick=(id)=>{setActive(id);ensure(id);setTab('chat');setDoc(null);};
  const toggleBig=()=>{setBig(b=>!b);setPos(null);};
  const send=(text)=>{
    const m=(text||input).trim();if(!m)return;const id=active;
    setInput('');setTab('chat');
    setStore(s=>({...s,[id]:[...(s[id]||[]),{role:'me',text:m}]}));setTyping(true);
    let cfg=null,card=null;
    if(id==='adviser'){
      cfg=(window.TeamCfg&&window.TeamCfg.parse)?window.TeamCfg.parse(m):null;
      if(!cfg){card=buildCard(m);if(card)window.dispatchEvent(new CustomEvent('ta-dispatch'));}
    }
    setTimeout(()=>{setTyping(false);setStore(s=>({...s,[id]:[...(s[id]||[]),cfg?{role:'them',text:cfg.reply}:card?{role:'them',card:card}:{role:'them',text:reply(byId[id],m)}]}));},850+Math.random()*650);
  };

  const ac=byId[active]||ADVISER;
  const msgs=store[active]||[];
  const qps=ac.id==='adviser'?['加一个特斯拉分析师','把 NVDA 设成纪律优先','复核今天的持仓']
    :ac.id==='pm'?['为什么减仓 NVDA？','整体风险在哪？','今日表现怎样？']
    :ac.id==='reviewer'?['昨天复盘结论？','你更新了谁的记忆？','三把写锁是什么？']
    :['为什么是这个判断？','最大风险是？','信念分从哪来？'];

  const railOrder=[ADVISER,...AG.filter(a=>a.id==='pm'),...AG.filter(a=>a.id!=='pm'&&a.id!=='reviewer'),...AG.filter(a=>a.id==='reviewer')];

  return(
    <div className={`cd-root${open?' open':''}${big?' big':''}`} style={(!big&&pos)?{left:pos.left+'px',top:pos.top+'px',right:'auto'}:null}>
      {big&&<div className="cd-backdrop" onClick={()=>setBig(false)}></div>}
      <div className="cd-panel" ref={panelRef}>
        {/* avatar rail */}
        <div className="cd-rail">
          {railOrder.map((c,i)=>(
            <React.Fragment key={c.id}>
              {(i===1||c.id==='reviewer')&&<div className="cd-rail-div"/>}
              <button className={`cd-avbtn${active===c.id?' on':''}`} onClick={()=>pick(c.id)} title={`${c.name} · ${c.role}`}>
                <span className="cd-avbtn-a">{window.Persona&&<window.Persona agent={c} size={40} ring={false}/>}<span className={`st-dot ${ST_DOT[c.status]}`}/></span>
              </button>
            </React.Fragment>
          ))}
        </div>

        {/* main */}
        <div className="cd-main">
          <div className="cd-chead cd-drag" onPointerDown={onHeadDown}>
            <div className="cd-cav">{window.Persona&&<window.Persona agent={ac} size={40} ring={false}/>}<span className={`st-dot ${ST_DOT[ac.status]}`}/></div>
            <div style={{flex:1,minWidth:0}}>
              <div className="cd-cname">{ac.name}<span className="cd-conline"><span className={`st-dot ${ST_DOT[ac.status]}`}/>{ST_TX[ac.status]}</span></div>
              <div className="cd-crole">{ac.role}{ac.conviction>0?` · 信念 ${ac.conviction}`:''}</div>
            </div>
            <button className="cd-icon" onClick={toggleBig} title={big?'收小':'全屏对话'}>{big?'⤢':'⛶'}</button>
            <button className="cd-icon" onClick={()=>setOpen(false)} title="收起">✕</button>
          </div>

          {doc?(<DocReader doc={doc} byId={byId} onBack={()=>setDoc(null)} onOpen={setDoc} onChat={()=>{const sid=doc.sid||active;setActive(sid);setDoc(null);setTab('chat');ensure(sid);}}/>):(<>
          <div className="cd-tabs">
            {TABS.map(t=><button key={t.k} className={`cd-tab${tab===t.k?' on':''}`} onClick={()=>setTab(t.k)}>{t.l}</button>)}
          </div>

          {/* CHAT */}
          {tab==='chat'&&(
            <>
              <div className="cd-msgs" ref={bodyRef}>
                {msgs.map((m,i)=>(
                  <div key={i} className={`cd-row${m.role==='me'?' me':''}`}>
                    {m.role==='them'&&<span className="cd-mav">{window.Persona&&<window.Persona agent={ac} size={26} ring={false}/>}</span>}
                    {m.card?<ResultCard card={m.card}/>:<div className={`cd-bub ${m.role==='me'?'me':'them'}`}>{m.text}</div>}
                  </div>
                ))}
                {typing&&<div className="cd-row"><span className="cd-mav">{window.Persona&&<window.Persona agent={ac} size={26} ring={false}/>}</span><div className="cd-bub them"><span className="th"><span>●</span><span>●</span><span>●</span></span></div></div>}
              </div>
              <div className="cd-foot">
                <div className="cd-qps">{qps.map(x=><button key={x} className="cd-qp" onClick={()=>send(x)}>{x}</button>)}</div>
                <div className="cd-in-row">
                  <input className="cd-in" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder={`发消息给 ${ac.name}…`}/>
                  <button className="cd-send" onClick={()=>send()}>↑</button>
                </div>
              </div>
            </>
          )}

          {/* MEMORY */}
          {tab==='memory'&&<MemoryPane ac={ac}/>}

          {/* ARTIFACTS */}
          {tab==='artifacts'&&<ArtifactsPane ac={ac} onOpen={setDoc}/>}
          </>)}
        </div>
      </div>
    </div>
  );
}

function MemoryPane({ac}){
  if(ac.id==='adviser'){
    return(<div className="cd-pane"><div className="cd-note">Kimi 投研助手 不另存记忆——它实时综合全队的研究与当日结论为你作答。点左侧任一成员可查看其长期记忆。</div></div>);
  }
  if(ac.id==='reviewer'){
    return(<div className="cd-pane">
      <div className="cd-pane-h">知识库</div>
      {(window.WIKI||[]).map((w,i)=>(
        <div className="cd-mem" key={i} style={{borderLeftColor:'var(--ppi)'}}>
          <div className="cd-mem-k" style={{color:'var(--ppi)'}}>{w.kind} · {w.date} · 被引用 {w.backlinks} 次</div>
          <div className="cd-mem-t">{w.title}</div>
          <div className="cd-mem-v">{w.body}</div>
        </div>
      ))}
    </div>);
  }
  const mem=ac.memory||[];
  return(<div className="cd-pane">
    <div className="cd-pane-h">{ac.name}的记忆 · {mem.length} 条</div>
    {mem.map((m,i)=>(
      <div className="cd-mem" key={i}>
        <div className="cd-mem-k">#{i+1} · {m.k}</div>
        <div className="cd-mem-v">{m.v}</div>
      </div>
    ))}
  </div>);
}

function ArtifactsPane({ac,onOpen}){
  const arts=(window.ARTIFACTS||{})[ac.id]||[];
  const desk=(window.DESK||{})[ac.id];
  const hist=ac.history||[];
  const dtype=ac.id==='reviewer'?'reflection':ac.id==='pm'?'plan':ac.id==='adviser'?'brief':'note';
  return(<div className="cd-pane">
    <div className="cd-pane-h">产物 · 点开看全文</div>
    {arts.map((a,i)=>(
      <button className="cd-art" key={i} onClick={()=>onOpen({type:dtype,sid:ac.id,title:a.title,meta:a.meta})}>
        <span className="cd-art-kind">{a.kind}</span>
        <span style={{flex:1,minWidth:0}}><span className="cd-art-t">{a.title}</span><span className="cd-art-m">{a.meta}</span></span>
        <span className="cd-art-chev">›</span>
      </button>
    ))}
    {desk&&desk.fills&&desk.fills.length>0&&(<>
      <div className="cd-pane-h" style={{marginTop:14}}>近期成交</div>
      <table className="cd-fills"><tbody>
        {desk.fills.map((f,i)=>(<tr key={i}><td>{f[0]}</td><td className={f[1]==='卖'?'dn':'up'}>{f[1]}</td><td>{f[2]}</td><td className="mono">{f[3]}</td></tr>))}
      </tbody></table>
    </>)}
    {hist.length>0&&(<>
      <div className="cd-pane-h" style={{marginTop:14}}>工作日志</div>
      {hist.map((h,i)=>(<div className="cd-log" key={i}><span className="cd-log-t">{h.t}</span><span><b>{h.a}</b><span className="cd-log-d">{h.d}</span></span></div>))}
    </>)}
  </div>);
}

function citeRender(t){return (t||'').split(/(\[\d\])/).map((p,i)=>/^\[\d\]$/.test(p)?React.createElement('sup',{className:'cite-mark',key:i},p):React.createElement('span',{key:i},p));}
const SYM2ID={NVDA:'nvda',GOOGL:'googl',COST:'cost',JPM:'jpm',UNH:'unh',AAPL:'aapl'};

function DocReader({doc,byId,onBack,onOpen,onChat}){
  const a=byId[doc.sid]||byId.adviser;
  const Bar=({label,sub})=>(
    <div className="cd-doc-bar">
      <button className="cd-doc-back" onClick={onBack}>‹ 返回</button>
      <span className="cd-doc-src">{label}{sub?<span className="cd-doc-sub"> · {sub}</span>:null}</span>
      <button className="cd-doc-chat" onClick={onChat}>就这条与 {a.name} 对话 →</button>
    </div>
  );
  if(doc.type==='note'){
    const nt=(window.NOTES||[]).find(n=>n.sid===doc.sid);
    const seat=(window.SEAT_META||{})[doc.sid]||{};
    const q=(window.QUOTE||{})[doc.sid];
    const d=(window.NOTE_DIR||{})[nt&&nt.dir]||{l:'',c:'mut'};
    return(<div className="cd-doc">
      <Bar label="研究笔记" sub={nt?('更新于 '+nt.time):''}/>
      <div className="cd-doc-body">
        <div className="cd-doc-persona">
          <span className="cd-doc-av">{window.Persona&&<window.Persona agent={a} size={46} ring={false}/>}</span>
          <div><div className="cd-doc-nm">{a.name} <span className="cd-doc-tk">{seat.sym} 分析师</span></div><div className="cd-doc-meta2">{a.role} · 专盯 {seat.sym}</div></div>
        </div>
        <h2 className="cd-doc-title">{seat.sym} · {(window.NOTE_KIND||{})[nt&&nt.kind]||'每日观点'}</h2>
        <div className="cd-doc-chips">
          <span className={`note-dir ${d.c}`}>{d.l}</span>
          <span className="note-conv">信念 {nt?nt.conv.toFixed(2):'—'}</span>
          <span className="note-kind">{(window.NOTE_KIND||{})[nt&&nt.kind]}</span>
          <span className="cd-doc-date">{nt?nt.time:''} · 2026-06-07</span>
        </div>
        <div className="cd-doc-sec">观点</div>
        <p className="cd-doc-p">{nt?citeRender(nt.thesis):'—'}</p>
        {nt&&nt.cites&&<div className="cd-doc-cites">{nt.cites.map(c=><div className="cd-doc-cite" key={c.n}><b>[{c.n}]</b> {c.v}</div>)}</div>}
        {q&&<><div className="cd-doc-sec">数据</div>
        <div className="cd-doc-grid">
          <div><span>最新价</span><b>${q.price} <i className={q.chg>=0?'up':'dn'}>{q.chg>=0?'+':''}{q.chg}%</i></b></div>
          <div><span>P/E</span><b>{q.pe}</b></div>
          <div><span>Beta</span><b>{q.beta}</b></div>
          <div><span>52 周</span><b>{q.w52}</b></div>
          <div><span>市值</span><b>{q.mcap}</b></div>
          <div><span>分析师目标</span><b>{q.tgt}</b></div>
        </div></>}
        <div className="cd-doc-sec">参考过的记忆</div>
        {(a.memory||[]).slice(0,3).map((m,i)=><div className="cd-mem" key={i}><div className="cd-mem-k">{m.k}</div><div className="cd-mem-v">{m.v}</div></div>)}
        <div className="cd-doc-foot">由 {a.name} 维护 · 每日更新 · 历史可追溯</div>
      </div>
    </div>);
  }
  if(doc.type==='reflection'){
    const R=window.REFLECTION||{};
    return(<div className="cd-doc">
      <Bar label="复盘" sub={'第 '+R.day+' 天'}/>
      <div className="cd-doc-body">
        <h2 className="cd-doc-title">收盘复盘 · {R.date}</h2>
        <div className="cd-doc-chips"><span className="note-conv">{R.ret}</span><span className="note-kind">{R.alpha}</span><span className="cd-doc-date">NAV {R.navNow}</span></div>
        <div className="cd-doc-sec">说明</div>
        <p className="cd-doc-p">{R.narrative}</p>
        <div className="cd-doc-sec">做对了</div>
        {(R.hits||[]).map((h,i)=><div className="cd-doc-li up" key={i}>✓ {h}</div>)}
        <div className="cd-doc-sec">可以更好</div>
        {(R.misses||[]).map((h,i)=><div className="cd-doc-li dn" key={i}>✕ {h}</div>)}
        <div className="cd-doc-sec">写入团队记忆</div>
        {(window.MEMO_WRITES||[]).map((mw,i)=>{const t=byId[mw.sid];return <div className="loop-row" key={i} onClick={()=>onOpen({type:'note',sid:mw.sid})}><span className="loop-kind">{(window.MEMO_KIND||{})[mw.kind]}</span><span className="loop-body">→ {t?t.name:mw.sid}：{mw.body}</span></div>;})}
        <div className="cd-doc-sec">沉淀的经验</div>
        {(R.wiki||[]).map((w,i)=><div className="cd-art" key={i}><span className="cd-art-kind">{w.kind}</span><span className="cd-art-t">{w.title}</span></div>)}
        <div className="cd-doc-foot">每日收盘后由复盘官整理</div>
      </div>
    </div>);
  }
  if(doc.type==='plan'){
    const P=window.PLAN||{};
    const Row=({it,tag,cls})=>{const t=byId[SYM2ID[it.sym]];return(
      <div className="cd-plan-row" onClick={()=>t&&onOpen({type:'note',sid:t.id})}>
        <span className={`note-dir ${cls}`}>{it.sym} {tag}</span>
        <span className="cd-plan-rs">{it.reason}</span>
        {it.linked&&<span className="cd-plan-link">← 依据笔记 {it.linked.join(',')}</span>}
      </div>);};
    return(<div className="cd-doc">
      <Bar label="今日计划" sub={P.status==='pending'?'待确认':P.status}/>
      <div className="cd-doc-body">
        <h2 className="cd-doc-title">今日交易计划 · {P.date}</h2>
        <div className="cd-doc-sec">说明</div>
        <p className="cd-doc-p">{P.narrative}</p>
        <div className="cd-doc-sec">操作</div>
        {(P.intents||[]).map((it,i)=><Row key={i} it={it} tag="减仓" cls="dn"/>)}
        <div className="cd-doc-sec">维持</div>
        {(P.holds||[]).map((it,i)=><Row key={i} it={it} tag="持有" cls="mut"/>)}
        <div className="cd-doc-sec">观察</div>
        {(P.watch||[]).map((it,i)=><Row key={i} it={it} tag="观察" cls="mut"/>)}
        <div className="cd-doc-foot">计划仅为交易意图 · 执行前经风控校验</div>
      </div>
    </div>);
  }
  return(<div className="cd-doc"><Bar label="文档"/><div className="cd-doc-body"><h2 className="cd-doc-title">{doc.title||'文档'}</h2><p className="cd-doc-p">{doc.meta||'内容综合自全队当日结论。'}</p></div></div>);
}

window.ChatDock=ChatDock;

/* ===== Floating advisor button — single entry (顾问 + 消息), right-middle ===== */
function AdvisorFab(){
  const open=()=>window.dispatchEvent(new CustomEvent('ta-togglechat'));
  const adviser={id:'adviser',name:'Kimi 投研助手',color:'#5F9EA8'};
  const[collapsed,setCollapsed]=useState(()=>localStorage.getItem('ta-fab')==='1');
  const toggle=(e)=>{e.stopPropagation();setCollapsed(c=>{const v=!c;localStorage.setItem('ta-fab',v?'1':'0');return v;});};
  return(
    <div className={`adv-fab-wrap${collapsed?' collapsed':''}`} data-tour="advisor">
      <button className="adv-fab-collapse" onClick={toggle} title={collapsed?'展开顾问':'收起顾问'}>{collapsed?'‹':'›'}</button>
      <button className="adv-fab" onClick={open} title="Kimi 投研助手">
        <span className="adv-fab-tx"><span className="adv-fab-t">Kimi 投研助手</span><span className="adv-fab-s">随时问</span></span>
        <span className="adv-fab-portrait">{window.Persona&&<window.Persona agent={adviser} size={48} ring={false}/>}<span className="adv-fab-dot"/></span>
      </button>
    </div>
  );
}
window.AdvisorFab=AdvisorFab;
