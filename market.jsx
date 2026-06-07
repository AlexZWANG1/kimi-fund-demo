const{useState,useEffect,useReducer}=React;

/* ============================================================
   市场 (Market) — original market-overview surface in the
   Kimi 财富 dark design language. Quote cards + market summary
   (accordion) on the left; watchlist + prediction markets on
   the right. Not a clone of any third-party product.
   ============================================================ */

const MK_INDEX=[
  {sym:'NDX', name:'纳斯达克100', price:'21,842.60', chg:0.62, seed:11},
  {sym:'SPX', name:'标普500',     price:'5,431.20',  chg:0.21, seed:27},
  {sym:'DJI', name:'道琼斯',       price:'42,118.40', chg:0.04, seed:43},
  {sym:'VIX', name:'恐慌指数',     price:'14.20',     chg:-3.10, seed:61},
];
const MK_CRYPTO=[
  {sym:'BTC', name:'比特币',   price:'US$61,742', chg:3.46, seed:13},
  {sym:'ETH', name:'以太坊',   price:'US$1,595',  chg:5.15, seed:29},
  {sym:'SOL', name:'Solana',   price:'US$63.97',  chg:5.68, seed:47},
  {sym:'BNB', name:'BNB',      price:'US$612.4',  chg:2.10, seed:67},
];

const MK_NEWS={
  '美股':[
    {h:'科技股领涨，三大指数集体收高', src:'综合 42 个来源', body:'纳斯达克综合指数收涨 +0.62%，标普 500 上涨 +0.21%，道指基本持平。半导体板块继续领跑，市场对 AI 算力需求维持乐观；恐慌指数回落至 14.2，情绪偏暖。'},
    {h:'英伟达 Blackwell 出货追踪：云厂商资本开支续升', src:'综合 31 个来源', body:'四大云厂商 2026 资本开支指引连续上修，Blackwell 供不应求被确认为结构性而非脉冲性需求，这既支撑 NVDA 的强势，也让其组合权重逼近上限。'},
    {h:'联合健康受政策听证拖累，医疗板块承压', src:'综合 18 个来源', body:'国会证词带来的合规成本不确定性上升，UNH 单日下挫 1.1%，拖累整体医疗板块表现。'},
    {h:'美股零售数据偏强，消费韧性延续', src:'综合 22 个来源', body:'最新零售销售数据超预期，消费股获得支撑，Costco 等零售龙头表现稳健。'},
    {h:'美债收益率回落，风险偏好改善', src:'综合 15 个来源', body:'10 年期美债收益率回落至 4.18%，宽松预期升温，成长股估值获得喘息空间。'},
  ],
  '加密':[
    {h:'比特币重回 $61,000 上方，结束清算式回调', src:'综合 56 个来源', body:'比特币在短暂跌破 $60,000 后回升至 $61,668（+1.19%），此前经历约 16 亿美元的清算式抛售。预测市场对 BTC 在 6 月 7 日前守住 $56,000–$58,000 给出较高信心。'},
    {h:'以太坊小幅走高，市场趋于稳定', src:'综合 28 个来源', body:'ETH 上涨 5.15% 至 $1,595，随主流加密资产情绪回暖，链上活跃度回升。'},
    {h:'Solana 与 XRP 领涨山寨币反弹', src:'综合 19 个来源', body:'SOL 单日 +5.68%，带动山寨币板块普遍回升，资金轮动迹象明显。'},
    {h:'加密税收立法在华盛顿推进', src:'综合 12 个来源', body:'相关税收框架进入新阶段，监管确定性的提升被市场解读为中性偏暖。'},
    {h:'宏观逆风仍压制广义风险资产', src:'综合 24 个来源', body:'强美元与利率路径的不确定性继续对广义风险资产构成压力，加密市场波动率维持高位。'},
  ],
};

const MK_PRED=[
  {q:'6 月底标普 500 站上 5,500？', vol:'US$210万', extra:'+12', rows:[{k:'是',p:62,d:8.1},{k:'否',p:38,d:-8.1}]},
  {q:'美联储 7 月维持利率不变？', vol:'US$1,340万', extra:'+20', rows:[{k:'维持',p:71,d:4.2},{k:'降息 25bp',p:27,d:-3.5},{k:'降息 50bp',p:2,d:-0.7}]},
  {q:'NVDA 6 月收于 $150 上方？', vol:'US$880万', extra:'+8', rows:[{k:'是',p:55,d:-2.0},{k:'否',p:45,d:2.0}]},
];

const fmtChg=(c)=>(c>=0?'+':'')+c.toFixed(2)+'%';

function QCard({q}){
  const up=q.chg>=0;
  return(
    <div className="mk-qcard">
      <div className="mk-q-top">
        <span className="mk-q-name">{q.name}</span>
        <span className="mk-q-chg" style={{color:up?'var(--up)':'var(--dn)'}}>{up?'↗':'↘'} {fmtChg(q.chg)}</span>
      </div>
      <div className="mk-q-price">{q.sym} · {q.price}</div>
      <div className="mk-q-spark">{window.Sparkline&&<window.Sparkline data={window.spark(q.seed,up?1:-1,28)} color={up?'var(--up)':'var(--dn)'} w={244} h={42}/>}</div>
    </div>
  );
}

function NewsAcc({items}){
  const[open,setOpen]=useState(0);
  return(
    <div className="mk-acc">
      {items.map((n,i)=>(
        <div className={`mk-acc-item${open===i?' open':''}`} key={i}>
          <button className="mk-acc-head" onClick={()=>setOpen(open===i?-1:i)}>
            <span className="mk-acc-h">{n.h}</span>
            <span className="mk-acc-chev">{open===i?'▴':'▾'}</span>
          </button>
          {open===i&&<div className="mk-acc-body"><p>{n.body}</p><span className="mk-acc-src">{n.src}</span></div>}
        </div>
      ))}
    </div>
  );
}

function Watchlist2(){
  const wl=window.WATCHLIST||[];
  const[,force]=useReducer(x=>x+1,0);
  useEffect(()=>{const h=()=>force();window.addEventListener('ta-team-changed',h);return()=>window.removeEventListener('ta-team-changed',h);},[]);
  const covered=(sym)=>!!(window.TeamCfg&&window.TeamCfg.findSym&&window.TeamCfg.findSym(sym));
  const cover=(w)=>{if(window.TeamCfg)window.TeamCfg.add(w.sym,w.name);};
  return(
    <div className="mk-rail-card" data-tour="mk-watch">
      <div className="mk-rail-hd"><span className="mk-rail-t">关注列表</span><span className="mk-rail-n">覆盖即配专属分析师</span></div>
      <div className="mk-wl">
        {wl.map(w=>{
          const up=w.chg>=0;const a=(window.AGENTS||[]).find(x=>x.id===w.sym.toLowerCase());const cov=covered(w.sym);
          return(
            <div className="mk-wl-row" key={w.sym}>
              <span className="mk-wl-badge" style={{background:a?a.color:'#374151'}}>{w.sym.slice(0,2)}</span>
              <span className="mk-wl-id"><span className="mk-wl-sym">{w.sym}</span><span className="mk-wl-nm">{w.name}</span></span>
              <span className="mk-wl-num"><span className="mk-wl-px">{w.price.toFixed(2)}</span><span className="mk-wl-chg" style={{color:up?'var(--up)':'var(--dn)'}}>{fmtChg(w.chg)}</span></span>
              <button className={`mk-cover${cov?' on':''}`} onClick={()=>cover(w)} disabled={cov} title={cov?'已配专属分析师':'纳入覆盖，配一位分析师'}>{cov?'✓ 已覆盖':'+ 覆盖'}</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Predictions(){
  return(
    <div className="mk-rail-card">
      <div className="mk-rail-hd"><span className="mk-rail-t">预测市场</span></div>
      <div className="mk-pred">
        {MK_PRED.map((p,i)=>(
          <div className="mk-pred-q" key={i}>
            <div className="mk-pred-h">{p.q}</div>
            {p.rows.map((r,j)=>(
              <div className="mk-pred-row" key={j}>
                <span className="mk-pred-k">{r.k}</span>
                <span className="mk-pred-bar"><span className="mk-pred-fill" style={{width:r.p+'%'}}></span></span>
                <span className="mk-pred-p">{r.p}%</span>
                <span className="mk-pred-d" style={{color:r.d>=0?'var(--up)':'var(--dn)'}}>{r.d>=0?'↗':'↘'} {Math.abs(r.d).toFixed(1)}%</span>
              </div>
            ))}
            <div className="mk-pred-foot"><span>{p.vol} 成交量</span><span>还有 {p.extra} 个结果</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Sentiment({tab}){
  const bearish=tab==='加密';
  const bars=[6,9,7,11,8,13,10,14];
  return(
    <span className="mk-sent">
      <span className="mk-sent-bars">{bars.map((h,i)=><i key={i} style={{height:h+'px',background:i>=(bearish?4:5)?(bearish?'var(--dn)':'var(--up)'):'var(--line)'}}></i>)}</span>
      <span style={{color:bearish?'var(--dn)':'var(--up)',fontWeight:600}}>{bearish?'看跌情绪':'看涨情绪'}</span>
    </span>
  );
}

function MarketPage(){
  const[tab,setTab]=useState('美股');
  const isCr=tab==='加密';
  const quotes=isCr?MK_CRYPTO:MK_INDEX;
  const news=MK_NEWS[isCr?'加密':'美股'];
  const stamp=new Date().toLocaleString('zh-CN',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});
  return(
    <div className="wrap">
      <div className="mk-head">
        <div className="mk-tabs">
          {['美股','加密','收益','预测','关注列表'].map(t=>(
            <button key={t} className={`mk-tab${tab===t?' on':''}`} onClick={()=>setTab(t)}>{t}</button>
          ))}
        </div>
        <div className="mk-head-r">
          <Sentiment tab={isCr?'加密':'美股'}/>
          <span className="mk-stamp">{isCr?'加密货币':'美国市场'} · {stamp}</span>
        </div>
      </div>

      <div className="mk-grid">
        <div className="mk-main">
          <div className="mk-sub">{isCr?'加密行情':'指数行情'}</div>
          <div className="mk-hero" data-tour="mk-quotes">{quotes.map(q=><QCard key={q.sym} q={q}/>)}</div>

          <div className="mk-sub mk-sub-row" data-tour="mk-summary"><span>市场摘要</span><span className="mk-sub-time">更新于 2 分钟前</span></div>
          <NewsAcc items={news}/>
        </div>

        <div className="mk-rail">
          <Watchlist2/>
          <Predictions/>
        </div>
      </div>
    </div>
  );
}
window.MarketPage=MarketPage;
