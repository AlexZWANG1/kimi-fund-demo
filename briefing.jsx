const{useState,useEffect,useRef}=React;

/* ===== shared: ticker chip + signed number ===== */
function agentForSym(sym){
  const id=sym.toLowerCase();
  return (window.AGENTS||[]).find(a=>a.id===id)||null;
}
function Tk({sym,label,onChat}){
  const a=agentForSym(sym);
  if(a&&onChat){
    return <button className="tk live" onClick={()=>onChat(a)} title={`和 ${a.name} 对话`}>{label||sym}</button>;
  }
  return <span className="tk">{label||sym}</span>;
}
const Pos=({children})=><span className="pos">{children}</span>;
const Neg=({children})=><span className="neg">{children}</span>;

/* ===== DAILY BRIEFING (today's written report — the dashboard core) ===== */
function DailyBriefing({onChat,hasPortfolio=true}){
  const[t]=useState(()=>new Date());
  const h=t.getHours();
  const greet=h<5?'凌晨好':h<11?'早上好':h<13?'中午好':h<18?'下午好':'晚上好';
  const stamp=`${t.getMonth()+1}月${t.getDate()}日 ${String(t.getHours()).padStart(2,'0')}:${String(t.getMinutes()).padStart(2,'0')} · 收盘汇总`;
  const pm=(window.AGENTS||[]).find(a=>a.id==='pm');
  const[spin,setSpin]=useState(false);
  const refresh=()=>{setSpin(true);setTimeout(()=>setSpin(false),900);};

  return(
    <div className="briefing">
      <div className="br-top">
        <div style={{minWidth:0}}>
          <div className="br-greet">
            <span className="br-hi">{greet}。</span>
          </div>
          <div className="br-sub">{stamp} · Kimi 投研助手 为你整理</div>
        </div>
        <div className="br-actions">
          <button className="br-act" onClick={refresh}><span style={{display:'inline-block',transition:'transform .9s',transform:spin?'rotate(360deg)':'none'}}>↻</span> 刷新</button>
        </div>
      </div>

      {!hasPortfolio&&(
        <div className="br-connect">
          <div className="br-connect-ic">▦</div>
          <div><div className="br-connect-t">连接组合，解锁针对你持仓的分析</div><div className="br-connect-d">连上后这里会出现你的交易意图、持仓聚焦与风险提示。</div></div>
          <button className="br-connect-btn" onClick={()=>window.dispatchEvent(new CustomEvent('ta-onboard'))}>连接组合</button>
        </div>
      )}

      {/* 今日建议 — lead with the conclusion */}
      {hasPortfolio&&(<div className="br-sec" data-tour="action">
        <div className="br-sechd"><span className="lbl">今日建议</span><span className="rule"/></div>
        <div className="br-action-card" onClick={()=>window.dispatchEvent(new CustomEvent('ta-opendoc',{detail:{sid:'pm',type:'plan'}}))} style={{cursor:'pointer'}}>
          <div className="br-ac-tag"><span className="br-ac-status"></span>今日操作 · 待确认</div>
          <div className="br-ac-main">减仓 <button className="br-ac-tk" onClick={(e)=>{e.stopPropagation();const a=agentForSym('NVDA');a&&onChat&&onChat(a);}}>NVDA</button> <span className="neg">2%</span>，其余维持不动</div>
          <div className="br-ac-sub">NVDA 比重偏高、UNH 有政策风险，先减一点；减后现金留到 14%。</div>
          <div className="br-ac-foot">
            <span className="br-ac-by">
              <span className="br-ac-avs">
                {(pm?[pm]:[]).concat((window.AGENTS||[]).filter(a=>a.id==='nvda'||a.id==='unh')).map(a=>(
                  <span key={a.id} className="br-ac-av" title={a.name}>{window.Persona&&<window.Persona agent={a} size={24} ring={false}/>}</span>
                ))}
              </span>
              <span className="br-ac-bytx">基金经理与 2 位分析师提出</span>
            </span>
            <span className="br-ac-go">查看完整计划 <span className="ar">›</span></span>
          </div>
        </div>
      </div>)}

      {/* 市场速览 */}
      <div className="br-sec" data-tour="market">
        <div className="br-sechd"><span className="lbl">市场速览</span><span className="rule"/></div>
        <div className="br-title">科技股领涨，组合今日小幅跑赢基准</div>
        <div className="br-body">
          美股三大指数今日涨跌互现，纳斯达克综合指数（<Tk sym="^IXIC"/>）收涨 <Pos>+0.62%</Pos>，标普 500（<Tk sym="^GSPC"/>）微涨 <Pos>+0.21%</Pos>，道琼斯工业平均（<Tk sym="^DJI"/>）基本持平 <Pos>+0.04%</Pos>。恐慌指数（<Tk sym="VIX"/>）回落至 14.2，市场情绪偏暖。半导体板块继续领跑，英伟达（<Tk sym="NVDA" onChat={onChat}/>）单日 <Pos>+1.8%</Pos> 贡献组合主要正收益；零售与医疗承压，Costco（<Tk sym="COST" onChat={onChat}/>）回落 <Neg>-0.3%</Neg>，联合健康（<Tk sym="UNH" onChat={onChat}/>）受政策消息拖累下挫 <Neg>-1.1%</Neg>。本基金净值今日 <Pos>+0.44%</Pos>，跑赢 SPY 约 <Pos>+0.2%</Pos>。
        </div>
        <div className="br-links">
          <button className="br-link"><span className="ar">↗</span> 英伟达 Blackwell 出货追踪：四大云厂商资本开支持续上修</button>
          <button className="br-link"><span className="ar">↗</span> 联合健康政策听证排期推进，合规成本不确定性上升</button>
          <button className="br-link"><span className="ar">↗</span> 美股零售数据偏强，消费韧性延续</button>
        </div>
      </div>

      {/* 持仓聚焦 */}
      {hasPortfolio&&(<div className="br-sec">
        <div className="br-sechd"><span className="lbl">持仓聚焦</span><span className="rule"/></div>
        <div className="br-title">NVDA 集中度触顶，PM 计划减仓 2%</div>
        <div className="br-body">
          今日团队最关注的变化来自两处。其一，英伟达（<Tk sym="NVDA" onChat={onChat}/>）权重攀升至 25.5%，已触及单标的 25% 硬上限——尽管半导体分析师给出 88 的强烈看多信念，风控纪律不允许例外，基金经理计划本周减仓约 2% 至安全区间。其二，医疗分析师将联合健康（<Tk sym="UNH" onChat={onChat}/>）信念分由 0.48 下调至 0.44，国会证词带来的政策不确定性尚未完全定价，PM 选择保留缓冲而非清仓。其余持仓——谷歌（<Tk sym="GOOGL" onChat={onChat}/>）、Costco（<Tk sym="COST" onChat={onChat}/>）、摩根大通（<Tk sym="JPM" onChat={onChat}/>）、苹果（<Tk sym="AAPL" onChat={onChat}/>）——维持原判。
        </div>
      </div>)}

      {/* 热点聚焦 */}
      <div className="br-sec">
        <div className="br-sechd"><span className="lbl">热点聚焦</span><span className="rule"/></div>
        <div className="br-title">AI 算力资本开支周期进入加速期</div>
        <div className="br-body">
          今日市场主线仍是 AI 算力。四大云厂商 2026 年资本开支指引连续上修，英伟达（<Tk sym="NVDA" onChat={onChat}/>）Blackwell 出货供不应求被确认为结构性、而非脉冲性需求；这既是 <Tk sym="NVDA" onChat={onChat}/> 强势的根基，也让其权重快速逼近上限。与此同时，政策面成为另一条暗线——联合健康（<Tk sym="UNH" onChat={onChat}/>）受国会证词扰动，医疗板块整体承压。复盘官已将「集中度纪律 vs 趋势」写入长期知识库，作为后续加减仓的权衡基准。
        </div>
      </div>

      {/* 你的持仓今天 */}
      {hasPortfolio&&(<div className="br-sec" data-tour="holds">
        <div className="br-sechd"><span className="lbl">你的持仓今天</span><span className="rule"/><span style={{fontSize:12,color:'var(--faint)'}}>{(window.HOLD_TODAY||[]).length} 只</span></div>
        <div className="ht-list">
          {(window.HOLD_TODAY||[]).map((h,i)=>{
            const a=agentForSym(h.sym);const up=h.pct>=0;const th=(window.THESIS_TX||{})[h.th]||{l:'',c:'var(--faint)'};
            return(
              <button className="ht-card" key={h.sym} onClick={()=>a&&onChat(a)}>
                <span className="ht-badge" style={{background:a?a.color:'#374151'}}>{h.sym.slice(0,2)}</span>
                <span className="ht-id">
                  <span className="ht-sym">{h.sym}<span className="nm">{h.name}</span><span className="ht-th" style={{background:'transparent',color:th.c,border:'1px solid '+th.c}}>{th.l}</span></span>
                  <span className="ht-note">{h.note}</span>
                </span>
                <span className="ht-spark">{window.Sparkline&&<window.Sparkline data={window.spark(i*53+11,up?1:-1,20)} color={up?'var(--up)':'var(--dn)'} w={96} h={30}/>}</span>
                <span className="ht-num"><span className="ht-pct" style={{color:up?'var(--up)':'var(--dn)'}}>{up?'+':''}{h.pct.toFixed(1)}%</span><span className="ht-w">权重 {h.weight.toFixed(1)}%</span></span>
              </button>
            );
          })}
        </div>
      </div>)}

      {/* 风险雷达 */}
      {hasPortfolio&&(<div className="br-sec">
        <div className="br-sechd"><span className="lbl">风险雷达</span><span className="rule"/></div>
        <div className="rr-list">
          {(window.RISK_RADAR||[]).map((r,i)=>(
            <div className="rr-row" key={i}><span className="rr-dot"/><span className="rr-kind">{r.kind}</span><span className="rr-tx">{r.text}</span></div>
          ))}
        </div>
      </div>)}

      {/* 未来 5 日 */}
      <div className="br-sec">
        <div className="br-sechd"><span className="lbl">未来 5 日</span><span className="rule"/></div>
        <table className="ev-tbl">
          <thead><tr><th>日期</th><th>类型</th><th>事件</th><th>解读</th></tr></thead>
          <tbody>
            {(window.EVENTS_5D||[]).map((e,i)=>(
              <tr key={i}><td className="ev-date">{e.date}</td><td><span className="ev-type">{e.type}</span></td><td className="ev-ev">{e.event}</td><td>{e.read}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 研究室动态 */}
      <div className="br-sec">
        <div className="br-sechd"><span className="lbl">今日研究笔记</span><span className="rule"/></div>
        <div className="note-list">
          {(window.NOTES||[]).map((nt)=>{
            const a=(window.AGENTS||[]).find(x=>x.id===nt.sid);if(!a)return null;
            const d=(window.NOTE_DIR||{})[nt.dir]||{l:nt.dir,c:'mut'};
            const seat=(window.SEAT_META||{})[nt.sid]||{};
            return(
              <div className="note" key={nt.id} onClick={()=>window.dispatchEvent(new CustomEvent('ta-opendoc',{detail:{sid:nt.sid,type:'note'}}))}>
                <div className="note-av">{window.Persona&&<window.Persona agent={a} size={36} ring={false}/>}</div>
                <div className="note-main">
                  <div className="note-hd">
                    <span className="note-sym">{seat.sym}</span>
                    <span className="note-by">{a.name}</span>
                    <span className={`note-dir ${d.c}`}>{d.l}</span>
                    <span className="note-conv" title="conviction">信念 {nt.conv.toFixed(2)}</span>
                    <span className="note-kind">{(window.NOTE_KIND||{})[nt.kind]||nt.kind}</span>
                    <span className="note-time">{nt.time}</span>
                  </div>
                  <div className="note-thesis">{renderThesis(nt.thesis)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 学习回路 — reviewer writes analyst_memory after close */}
      <div className="br-sec">
        <div className="br-sechd"><span className="lbl">学习回路</span><span className="rule"/></div>
        <div className="loop-intro">收盘后，复盘官把当天的教训写进每位分析师的长期记忆——团队越用越懂你。</div>
        <div className="loop-list">
          {(window.MEMO_WRITES||[]).map((mw,i)=>{
            const a=(window.AGENTS||[]).find(x=>x.id===mw.sid);if(!a)return null;
            const seat=(window.SEAT_META||{})[mw.sid]||{};
            return(
              <div className="loop-row" key={i} onClick={()=>window.dispatchEvent(new CustomEvent('ta-opendoc',{detail:{sid:'reviewer',type:'reflection'}}))}>
                <span className="loop-av">{window.Persona&&<window.Persona agent={a} size={38} ring={false}/>}</span>
                <div className="loop-main">
                  <div className="loop-top">
                    <span className="loop-name">{a.name}</span>
                    {seat.sym&&<span className="loop-sym">{seat.sym}</span>}
                    <span className="loop-kind">{(window.MEMO_KIND||{})[mw.kind]||mw.kind}</span>
                  </div>
                  <div className="loop-body">{mw.body}</div>
                  <div className="loop-by">复盘官今日写入记忆</div>
                </div>
                <span className="loop-chev">›</span>
              </div>
            );
          })}
        </div>
        <div className="br-cta-hint" style={{marginTop:14}}>点开任意一条，看完整分析</div>
      </div>
    </div>
  );
}
function renderThesis(t){
  return (t||'').split(/(\[\d\])/).map((p,i)=>/^\[\d\]$/.test(p)?<sup className="cite-mark" key={i}>{p}</sup>:<span key={i}>{p}</span>);
}

/* ===== BIG CHAT — large centered conversation surface ===== */
const STATUS_TX={live:'已更新',busy:'待复核',idle:'无新增'};
function BigChat({agent:a,onClose,onSwitch}){
  const isPM=a.id==='pm';
  const seed=isPM
    ? `${a.name}在此。我整合了 7 位席位今天的全部观点——核心结论是减仓 NVDA 2%、其余维持。想从哪里聊起？`
    : `你好，我是${a.name}，负责盯 ${a.role.replace('分析师','').trim()}。关于今天的判断，有什么想问的？`;
  const[msgs,setMsgs]=useState([{role:'them',text:seed}]);
  const[input,setInput]=useState('');
  const[typing,setTyping]=useState(false);
  const bodyRef=useRef(null);

  useEffect(()=>{
    setMsgs([{role:'them',text:seed}]);setInput('');setTyping(false);
    // eslint-disable-next-line
  },[a.id]);
  useEffect(()=>{if(bodyRef.current)bodyRef.current.scrollTop=bodyRef.current.scrollHeight;},[msgs,typing]);
  useEffect(()=>{const k=e=>{if(e.key==='Escape')onClose();};window.addEventListener('keydown',k);return()=>window.removeEventListener('keydown',k);},[onClose]);

  const risk=a.memory&&a.memory.find(m=>m.k==='风险'||m.k==='警告');
  const pmReplies={
    nvda:'NVDA 现占 25.5%，刚好顶到我设的 25% 单标的上限。半导体分析师信念分 88、仍强烈看多，但纪律不开例外——本周减约 2% 到安全区间，腾出的现金进缓冲。',
    unh:'医疗分析师把 UNH 从 0.48 下调到 0.44。国会证词的政策成本还没定价，我选择留缓冲、不清仓——保留政策落空时的修复期权。',
    表现:'今日净值 +0.44%，NVDA 是主要正贡献，UNH 拖累约 15bp。跑赢 SPY 约 0.2%，夏普 1.7，最大回撤 -4.6%。',
    减仓:'减仓只针对 NVDA，因为它触顶了集中度上限。其余六只各自的逻辑没变，维持原判。',
    风险:'当前三个关注点：① NVDA 集中度触顶（处理中）② UNH 政策不确定性 ③ 组合 β≈1.08 略高。',
  };
  const getReply=(msg)=>{
    const l=msg.toLowerCase();
    if(isPM){
      for(const[k,r]of Object.entries(pmReplies)){if(l.includes(k.toLowerCase()))return r;}
      return '今天的整体判断是：减仓 NVDA 守住集中度纪律，其余维持。你可以点正文里的标的，直接问对应分析师更细的逻辑。';
    }
    if(l.includes('风险')||l.includes('担心'))return `最主要的风险：${risk?risk.v:'估值与宏观不确定性'}`;
    if(l.includes('信念')||l.includes('依据')||l.includes('为什么'))return `信念分 ${a.conviction} 的依据：${a.memory&&a.memory[0]?a.memory[0].v:'基本面与跟踪数据'}`;
    if(l.includes('做什么')||l.includes('任务'))return `我正在 ${a.task}，有结论会第一时间汇报给 基金经理。`;
    return (a.quote||'').replace(/"/g,'')||`我维持当前判断：${(window.SHORT||{})[a.id]||''}`;
  };
  const send=(q)=>{
    const m=(q||input).trim();if(!m)return;
    setInput('');setMsgs(p=>[...p,{role:'me',text:m}]);setTyping(true);
    setTimeout(()=>{setTyping(false);setMsgs(p=>[...p,{role:'them',text:getReply(m)}]);},900+Math.random()*700);
  };
  const qps=isPM
    ? ['为什么减仓 NVDA？','今日表现怎样？','UNH 发生了什么？','整体风险在哪？']
    : ['为什么是这个判断？','最大风险是？','信念分从哪来？','你今天在做什么？'];

  // peer rail — quickly jump between seats inside the same big chat
  const peers=(window.AGENTS||[]).filter(x=>x.id!=='reviewer');

  return(
    <div className="bc-back" onClick={onClose}>
      <div className="bc-modal" onClick={e=>e.stopPropagation()}>
        <div className="bc-hd">
          <div className="bc-av" style={{background:a.color}}>{a.initials}</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:'flex',alignItems:'center',gap:9,flexWrap:'wrap'}}>
              <span className="bc-name">{a.name}</span>
              <span className="bc-role">{a.role}</span>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:7,marginTop:3}}>
              <span className={`st-dot ${a.status==='live'?'st-live':a.status==='busy'?'st-busy':'st-idle'}`}/>
              <span style={{fontSize:12,color:'var(--faint)'}}>{STATUS_TX[a.status]}</span>
              {a.conviction>0&&<span className="mono" style={{fontSize:12,color:'var(--ac)',marginLeft:6}}>信念 {a.conviction}</span>}
            </div>
          </div>
          <button className="bc-x" onClick={onClose}>✕</button>
        </div>

        <div className="bc-stage">
          <div className="bc-body" ref={bodyRef}>
            {msgs.map((m,i)=>(
              <div key={i} className={`bc-row${m.role==='me'?' me':''}`}>
                {m.role==='them'&&<span className="bc-mav" style={{background:a.color}}>{a.initials}</span>}
                <div className={`bc-bub ${m.role==='me'?'me':'them'}`}>{m.text}</div>
              </div>
            ))}
            {typing&&(
              <div className="bc-row">
                <span className="bc-mav" style={{background:a.color}}>{a.initials}</span>
                <div className="bc-bub them"><span className="th"><span>●</span><span>●</span><span>●</span></span></div>
              </div>
            )}
          </div>

          <div className="bc-rail">
            <div className="bc-rail-h">切换席位</div>
            {peers.map(p=>(
              <button key={p.id} className={`bc-peer${p.id===a.id?' on':''}`} onClick={()=>onSwitch&&onSwitch(p)}>
                <span className="bc-peer-av" style={{background:p.color}}>{p.initials}</span>
                <span className="bc-peer-id">
                  <span className="bc-peer-nm">{p.name}</span>
                  <span className="bc-peer-rl">{p.id==='pm'?'组合经理':p.role.replace(' 分析师','')}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="bc-foot">
          <div className="bc-qps">
            {qps.map(q=><button key={q} className="bc-qp" onClick={()=>send(q)}>{q}</button>)}
          </div>
          <div className="bc-in-row">
            <input className="bc-in" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder={`问 ${a.name}…（Enter 发送 · Esc 关闭）`} autoFocus/>
            <button className="bc-send" onClick={()=>send()}>发送</button>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window,{DailyBriefing,BigChat});
