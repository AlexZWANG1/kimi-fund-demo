/* ====== DATA ====== */
// Holdings with dayPnl for contribution calculation
window.HOLDINGS=[
  {sym:'NVDA',name:'英伟达',sector:'半导体',weight:25.5,dayPct:1.8,dayPnl:4965},
  {sym:'GOOGL',name:'谷歌',sector:'互联网',weight:16.4,dayPct:0.4,dayPnl:710},
  {sym:'COST',name:'Costco',sector:'零售',weight:14.9,dayPct:-0.3,dayPnl:-484},
  {sym:'JPM',name:'摩根大通',sector:'银行',weight:12.8,dayPct:0.6,dayPnl:831},
  {sym:'UNH',name:'联合健康',sector:'医疗',weight:11.0,dayPct:-1.1,dayPnl:-1309},
  {sym:'AAPL',name:'苹果',sector:'科技',weight:5.5,dayPct:0.2,dayPnl:119},
];

window.AGENTS=[
  {id:'pm',name:'基金经理',role:'组合经理',initials:'LF',color:'#1C7682',dir:'live',status:'live',
   task:'整合 6 位分析师观点，制定今日交易计划',
   quote:'"今天 NVDA 集中度碰到 25% 上限，必须减一点。"',conviction:85,
   memory:[{k:'规则',v:'单标的权重硬上限 25%，不例外'},{k:'教训',v:'上次过早减仓 COST 错过 8% 涨幅，等信号更明确再动'},{k:'观察',v:'半导体占组合 25.5%，集中风险在上升'},{k:'计划',v:'本周减仓 NVDA 至 22%，补充现金缓冲'}],
   history:[{t:'08:45',a:'发布今日计划',d:'减仓 NVDA 2%，维持其余持仓'},{t:'07:30',a:'主持晨会',d:'综合 6 位分析师观点，共识偏多'},{t:'昨日',a:'批准加仓 COST',d:'消费分析师汇报护城河加固，批准至 14.9%'}]},
  {id:'nvda',name:'半导体分析师',role:'NVDA 分析师',initials:'SB',color:'#C2410C',dir:'b',status:'live',
   task:'评估 Blackwell GPU 出货数据及需求弹性',
   quote:'"Blackwell 供不应求，需求没有放缓，但估值消化需要时间。"',conviction:88,
   memory:[{k:'核心',v:'Blackwell 出货超预期，数据中心需求强劲'},{k:'警告',v:'集中度 25.5% 超过 PM 划定上限，需减仓'},{k:'周期',v:'AI 算力投资周期刚进入加速阶段，中期看好'}],
   history:[{t:'07:32',a:'发布观点',d:'强烈看多，但提示集中度风险'},{t:'昨日',a:'草根调研',d:'CSP 资本支出追踪，上调出货预期'}]},
  {id:'googl',name:'互联网分析师',role:'GOOGL 分析师',initials:'LC',color:'#7C3AED',dir:'h',status:'idle',
   task:'准备 Q2 广告收入与 GCP 增速分析报告',
   quote:'"搜索广告防御性强，GCP 加速才是真正的催化剂。"',conviction:71,
   memory:[{k:'驱动',v:'GCP 增速加快，云业务成为第二引擎'},{k:'风险',v:'AI 搜索替代威胁，长期不确定性上升'},{k:'观点',v:'短期广告韧性强，维持持有'}],
   history:[{t:'07:32',a:'发布观点',d:'维持持有，等待 GCP 数据催化'},{t:'5天前',a:'行业扫描',d:'数字广告市场格局分析'}]},
  {id:'cost',name:'消费分析师',role:'COST 分析师',initials:'ZC',color:'#166534',dir:'b',status:'live',
   task:'跟踪 Costco 月度会员续费率数据',
   quote:'"会员续费率 92.9%，这在零售业是奇迹。"',conviction:78,
   memory:[{k:'核心',v:'会员续费率 92.9%，护城河极强'},{k:'风险',v:'估值偏贵 P/E 55x，依赖续费增长支撑'},{k:'信号',v:'本月会员数据超预期，可考虑加仓'}],
   history:[{t:'07:32',a:'发布观点',d:'持有，估值偏高但护城河值溢价'},{t:'3天前',a:'月度深度',d:'会员数据复盘，上调长期评级'}]},
  {id:'jpm',name:'银行分析师',role:'JPM 分析师',initials:'MH',color:'#0284C7',dir:'h',status:'live',
   task:'追踪美联储利率决议对银行板块影响',
   quote:'"高利率对 JPM 是双刃剑，净息差扩大但贷款需求受压。"',conviction:74,
   memory:[{k:'宏观',v:'高利率延续，银行净息差保持扩张'},{k:'风险',v:'商业房地产贷款风险是潜在隐患'},{k:'观点',v:'JPM 拨备充足，短期持有无忧'}],
   history:[{t:'07:33',a:'发布观点',d:'维持持有，关注 Q2 净息差数据'},{t:'2天前',a:'利率分析',d:'美联储声明解读，调整预期'}]},
  {id:'unh',name:'医疗分析师',role:'UNH 分析师',initials:'HY',color:'#B91C1C',dir:'s',status:'busy',
   task:'评估 UNH 政策监管事件的影响范围',
   quote:'"政策风险还没完全消化，信念分从 0.48 下调到 0.44。"',conviction:44,
   memory:[{k:'事件',v:'国会证词影响合规成本，不确定性上升'},{k:'信念',v:'从 0.48 下调到 0.44，事件尚未完全定价'},{k:'策略',v:'建议 PM 保留政策风险缓冲，不加仓'}],
   history:[{t:'12:14',a:'发送政策预警',d:'政策事件触发，信念分下调'},{t:'08:47',a:'监管追踪',d:'国会相关法案进展分析'}]},
  {id:'aapl',name:'科技分析师',role:'AAPL 分析师',initials:'MZ',color:'#2563EB',dir:'h',status:'busy',
   task:'分析苹果 iPhone 16 供应链与财报节奏',
   quote:'"iPhone 供应链数据不错，但估值已经不便宜了。"',conviction:62,
   memory:[{k:'数据',v:'iPhone 16 供货量高于预期，Q4 有望超预期'},{k:'风险',v:'服务收入增速放缓，是长期隐患'},{k:'位置',v:'当前仓位 5.5%，处于低配区间'}],
   history:[{t:'07:33',a:'发布观点',d:'小幅加仓信号，建议 +1%'},{t:'昨日',a:'更新分析',d:'供应链调研，上调短期预期'}]},
];

/* contributed views (one-line opinion each agent fed into today's decision) */
window.VIEWS={
  pm:'读 6 份观点 → 减仓 NVDA 2%，其余维持',
  nvda:'Blackwell 供不应求，但集中度已超 25% 上限',
  googl:'GCP 加速、搜索广告防御强，维持持有',
  cost:'会员续费率 92.9%，护城河稳，维持',
  jpm:'净息差扩张、拨备充足，小幅加',
  unh:'政策听证排期，信念 0.48→0.44，建议减',
  aapl:'iPhone 供应链向好但估值偏贵，+1%',
  reviewer:'今晚 16:30 读全天 → 更新各分析师记忆',
};
window.MEET={pm:'08:45',nvda:'07:32',googl:'07:32',cost:'07:32',jpm:'07:33',unh:'12:14',aapl:'07:33',reviewer:'16:30'};
/* 复盘官 long-term knowledge base — what it has read & written over time */
window.WIKI=[
  {kind:'主题',title:'AI 算力资本开支周期',date:'更新 6/04',backlinks:7,body:'四大云厂商 2026 capex 指引上修，Blackwell 供不应求是结构性而非脉冲。已写入半导体分析师长期记忆，作为「集中度纪律 vs 趋势」的权衡基准。'},
  {kind:'复盘',title:'COST 过早减仓 · 教训',date:'更新 6/02',backlinks:4,body:'5/28 在 850 减仓 COST，随后两周 +8%。归因：把「估值偏贵」误当卖出信号。已标注为教训，写入消费分析师记忆——护城河股的估值溢价需更高证伪门槛。'},
  {kind:'论点',title:'UNH 政策风险 · 跟踪中',date:'更新 6/05',backlinks:3,body:'国会听证排期推进，赔付率+政策双变量未定价。医疗分析师信念 0.48→0.44。保留政策落空的修复期权，未清仓。'},
  {kind:'词条',title:'三把写锁 · 记忆只增不改',date:'更新 5/20',backlinks:11,body:'分析师只写自己的票；PM 只产出意图不下单；复盘官是唯一能写跨票记忆的角色，且记忆只增不改，可追溯。'},
];
window.REFLECTIONS=[
  {date:'2026-06-04 周四',ret:'+0.34%',note:'组合跑赢基准 12bp。半导体延续强势贡献主要正收益，医疗(UNH)拖累约 15bp。给半导体分析师追加一条「集中度纪律」长期记忆。'},
  {date:'2026-06-03 周三',ret:'-0.12%',note:'宏观扰动日，整体微跌但回撤优于基准。无交易，各分析师维持判断。'},
];
/* reviewer — learns from the day & writes memory; sits at the bottom of the timeline */
window.AGENTS.push({
  id:'reviewer',name:'复盘官',role:'学习 · 写记忆',initials:'RV',color:'#8B6BD6',dir:'h',status:'busy',
  task:'收盘后读全天 → 写复盘、更新分析师记忆、整理知识库',
  quote:'"昨日范本：半导体延续强势贡献主要正收益，医疗拖累。"',conviction:0,
  memory:[{k:'写锁',v:'唯一能写跨票记忆的角色，记忆只增不改'},{k:'昨日复盘',v:'组合 +0.34%，跑赢基准 12bp；半导体强、医疗弱'},{k:'更新',v:'已为半导体分析师追加「集中度纪律」一条长期记忆'}],
  history:[{t:'昨 16:30',a:'写当日复盘',d:'更新 6 位分析师记忆 + 2 条知识库'},{t:'前日',a:'纠偏记忆',d:'标注 COST 过早减仓为「教训」'}]
});

/* muted avatar palette + short status phrases (de-AI copy) */
(function(){var M={pm:'#4D8D96',nvda:'#A76545',googl:'#66548F',cost:'#3F7B58',jpm:'#3F7FA7',unh:'#A84A4A',aapl:'#57708F',reviewer:'#6E5A92'};window.AGENTS.forEach(function(a){if(M[a.id])a.color=M[a.id];});})();
window.SHORT={pm:'NVDA -2% · 其余维持',nvda:'供需强 · 权重触顶',googl:'广告稳 · 防御持有',cost:'续费率高 · 维持',jpm:'净息差扩张 · 小幅加',unh:'政策风险上升 · 建议减',aapl:'供应链向好 · 小幅加'};
window.DESK={
  pm:{call:'维持',hz:'1d',pos:'6 只 + 现金 14%',avg:'—',mv:'$1.09M',pnl:'+$86.7k',guard:['单票 ≤ 25%','现金 ≥ 10%','只产意图·不下单'],fills:[['06-05','卖','NVDA 1.0','$142.1'],['06-04','买','COST 4.0','$961.8']]},
  nvda:{call:'看多',hz:'21d',pos:'权重 25.5%',avg:'$118.4',mv:'$277k',pnl:'+$92.0k',guard:['集中度触顶 → 控仓','>28% 强制削减','需求转弱即减'],fills:[['05-29','买','120','$132.1'],['05-21','买','80','$121.4']]},
  googl:{call:'持有',hz:'21d',pos:'权重 16.4%',avg:'$151.2',mv:'$178k',pnl:'+$28k',guard:['GCP 加速才加','AI 搜索替代为风险','广告转弱即减'],fills:[['05-15','买','60','$149.0']]},
  cost:{call:'看多',hz:'30d',pos:'权重 14.9%',avg:'$905.3',mv:'$161k',pnl:'+$19k',guard:['续费率 <90% 即减','P/E >60x 不追','会员数超预期可加'],fills:[['06-04','买','4','$961.8'],['05-30','买','3','$948.2']]},
  jpm:{call:'持有',hz:'30d',pos:'权重 12.8%',avg:'$198.4',mv:'$139k',pnl:'+$13k',guard:['净息差转向即减','拨备足·短期无忧','商业地产贷款盯风险'],fills:[['05-18','买','40','$192.0']]},
  unh:{call:'看空',hz:'14d',pos:'权重 11.0%',avg:'$512.7',mv:'$119k',pnl:'-$3.2k',guard:['信念 0.48→0.44','政策未定价·不加','听证落空可修复'],fills:[['06-05','卖','2','$498.9']]},
  aapl:{call:'持有',hz:'21d',pos:'权重 5.5%',avg:'$214.0',mv:'$59k',pnl:'+$4k',guard:['供应链向好·小幅加','服务收入放缓为隐患','低配·可加至 7%'],fills:[['05-22','买','30','$208.1']]},
};
window.FLOW_NODES=[
  {id:'news',label:'晨报',sub:'信息入口',x:68,y:200,color:'#636360',r:22},
  {id:'aapl',label:'AAPL',sub:'科技分析师',x:218,y:58,color:'#2563EB',r:16},
  {id:'cost',label:'COST',sub:'消费分析师',x:218,y:116,color:'#166534',r:16},
  {id:'googl',label:'GOOGL',sub:'互联网分析师',x:218,y:174,color:'#7C3AED',r:16},
  {id:'jpm',label:'JPM',sub:'银行分析师',x:218,y:232,color:'#0284C7',r:16},
  {id:'nvda',label:'NVDA',sub:'半导体分析师',x:218,y:290,color:'#C2410C',r:16},
  {id:'unh',label:'UNH',sub:'医疗分析师',x:218,y:348,color:'#B91C1C',r:16},
  {id:'pm',label:'PM',sub:'基金经理',x:408,y:203,color:'#1C7682',r:25},
  {id:'risk',label:'风控',sub:'确定性',x:555,y:136,color:'#B5740E',r:16},
  {id:'exec',label:'执行',sub:'成交',x:555,y:270,color:'#1A8E54',r:16},
];
window.FLOW_EDGES=[
  {from:'news',to:'aapl'},{from:'news',to:'cost'},{from:'news',to:'googl'},
  {from:'news',to:'jpm'},{from:'news',to:'nvda'},{from:'news',to:'unh'},
  {from:'aapl',to:'pm'},{from:'cost',to:'pm'},{from:'googl',to:'pm'},
  {from:'jpm',to:'pm'},{from:'nvda',to:'pm'},{from:'unh',to:'pm'},
  {from:'pm',to:'risk'},{from:'pm',to:'exec'},{from:'risk',to:'exec'},
];
window.FLOW_MESSAGES=[
  {from:'news',to:'aapl',text:'苹果供应链数据落地',color:'#2563EB'},
  {from:'news',to:'nvda',text:'半导体板块今晨 +2.1%',color:'#C2410C'},
  {from:'news',to:'unh',text:'国会证词，请关注',color:'#B91C1C'},
  {from:'news',to:'cost',text:'零售数据偏强',color:'#166534'},
  {from:'news',to:'jpm',text:'利率预期小幅调整',color:'#0284C7'},
  {from:'news',to:'googl',text:'AI 广告支出上调',color:'#7C3AED'},
  {from:'aapl',to:'pm',text:'小幅加仓信号 +1%',color:'#2563EB'},
  {from:'cost',to:'pm',text:'护城河稳固，维持持有',color:'#166534'},
  {from:'nvda',to:'pm',text:'强烈看多，集中度超限！',color:'#C2410C'},
  {from:'unh',to:'pm',text:'信念 0.48→0.44 下调',color:'#B91C1C'},
  {from:'googl',to:'pm',text:'GCP 加速，维持持有',color:'#7C3AED'},
  {from:'jpm',to:'pm',text:'净息差扩张，小幅加仓',color:'#0284C7'},
  {from:'pm',to:'risk',text:'提议减仓 NVDA 2%',color:'#1C7682'},
  {from:'risk',to:'pm',text:'风控通过，确定性验证 ✓',color:'#B5740E'},
  {from:'pm',to:'exec',text:'执行：卖出 NVDA $142',color:'#1A8E54'},
];
window.NAV_DATA=(()=>{const d=[];let v=1000000;for(let i=0;i<90;i++){const t=i/89;v+=Math.sin(t*9.4)*(t>.5?-700:1100)+(86420/89)+((Math.random()-.46)*4800);d.push(Math.max(v,940000));}d[89]=1086420;return d;})();
window.BENCH_DATA=(()=>{const d=[];let v=1000000;for(let i=0;i<90;i++){v=1000000*(1+0.052*(i/89))*(1+(Math.random()-.5)*.005);d.push(Math.round(v));}return d;})();

/* ====== Dashboard overview data ====== */
// deterministic-ish sparkline generator (seeded)
window.spark=function(seed,trend,n){n=n||24;const d=[];let v=50,s=seed;for(let i=0;i<n;i++){s=(s*9301+49297)%233280;const r=s/233280;v+=trend*0.6+(r-0.5)*7;d.push(v);}return d;};

// today's holdings narrative + mini line
window.HOLD_TODAY=[
  {sym:'NVDA',name:'英伟达',pct:1.8,price:142.10,weight:25.5,note:'Blackwell 供不应求延续，板块领涨；权重已触及 25% 上限。',th:'intact'},
  {sym:'JPM',name:'摩根大通',pct:0.6,price:198.40,weight:12.8,note:'净息差扩张、拨备充足，银行板块小幅走强。',th:'intact'},
  {sym:'GOOGL',name:'谷歌',pct:0.4,price:151.20,weight:16.4,note:'搜索广告防御性强，GCP 增速是后续催化。',th:'intact'},
  {sym:'COST',name:'Costco',pct:-0.3,price:961.80,weight:14.9,note:'估值偏贵小幅回落，会员续费率 92.9% 护城河仍稳。',th:'drift'},
  {sym:'UNH',name:'联合健康',pct:-1.1,price:498.90,weight:11.0,note:'国会证词带来政策不确定性，信念分下调，逻辑承压。',th:'broken'},
  {sym:'AAPL',name:'苹果',pct:0.2,price:214.00,weight:5.5,note:'iPhone 供应链向好但估值偏贵，低配区间。',th:'intact'},
];
window.THESIS_TX={intact:{l:'逻辑完好',c:'var(--up)'},drift:{l:'逻辑漂移',c:'var(--wn)'},broken:{l:'逻辑承压',c:'var(--dn)'}};

// risk radar (mandate proximity)
window.RISK_RADAR=[
  {kind:'集中度',text:'英伟达 NVDA 单标的 25.5% — 已触及 25% 单票上限'},
  {kind:'板块',text:'半导体板块 25.5% — 接近 30% 行业上限'},
  {kind:'事件',text:'联合健康 UNH 政策听证未定价 — 保留缓冲'},
];

// next 5 days catalysts
window.EVENTS_5D=[
  {date:'SAT 06',type:'宏观',event:'美国非农就业 (5月)',read:'强 (>225k) → 就业偏紧、降息推迟，利好银行；弱 (<125k) → 降息路径陡峭，利好久期与黄金。'},
  {date:'MON 08',type:'持仓',event:'NVDA 减仓窗口',read:'PM 计划本周减仓约 2% 至 23%，守住集中度上限。'},
  {date:'WED 10',type:'宏观',event:'美国 CPI (5月)',read:'通胀超预期将压制科技估值；回落则利好成长股延续反弹。'},
];

// watchlist (non-held candidates)
window.WATCHLIST=[
  {sym:'AMZN',name:'亚马逊',price:246.03,chg:-3.06},
  {sym:'COIN',name:'Coinbase',price:152.40,chg:-7.15},
  {sym:'PLTR',name:'Palantir',price:135.53,chg:-4.35},
  {sym:'SMCI',name:'超微电脑',price:41.64,chg:-11.22},
  {sym:'NFLX',name:'奈飞',price:82.18,chg:0.76},
  {sym:'BABA',name:'阿里巴巴',price:121.06,chg:-3.88},
  {sym:'AMD',name:'超威半导',price:178.40,chg:2.14},
];

// research lab activity feed
window.LAB_FEED=[
  {t:'16:30',id:'reviewer',a:'写当日复盘',d:'组合 +0.44%，跑赢基准 12bp；为半导体分析师追加「集中度纪律」记忆。'},
  {t:'12:14',id:'unh',a:'发送政策预警',d:'国会证词触发，UNH 信念分 0.48 → 0.44。'},
  {t:'08:45',id:'pm',a:'发布今日计划',d:'减仓 NVDA 2%，其余维持，现金缓冲提至 14%。'},
  {t:'07:33',id:'aapl',a:'发布观点',d:'iPhone 供应链向好，建议小幅加仓 +1%。'},
  {t:'07:32',id:'nvda',a:'发布观点',d:'强烈看多，但提示集中度已超 25% 上限。'},
];

// pending proposals (top banners)
window.PROPOSALS={
  lessons:{n:3,title:'lessons.md 提议待审',body:'复盘官回顾了过去一周的工作，写了一份新的经验文件草稿。'},
  pm:{n:8,title:'PM 建议待处理',body:'基金经理综合团队观点，给出 8 条待你确认的配置建议。'},
};

// artifacts each seat has produced (产物 tab)
window.ARTIFACTS={
  pm:[{kind:'决策',title:'今日交易计划',meta:'08:45 · 减仓 NVDA 2% · 其余维持'},{kind:'纪要',title:'晨会共识汇总',meta:'07:50 · 综合 6 席位观点'}],
  nvda:[{kind:'报告',title:'Blackwell 出货追踪',meta:'昨日 · 上调出货预期'},{kind:'信号',title:'集中度超限预警',meta:'07:32 · 权重 25.5% 触顶'}],
  googl:[{kind:'报告',title:'Q2 广告收入 & GCP 增速',meta:'5 天前'},{kind:'扫描',title:'数字广告市场格局',meta:'5 天前'}],
  cost:[{kind:'深度',title:'会员续费率月度复盘',meta:'3 天前 · 续费率 92.9%'}],
  jpm:[{kind:'分析',title:'美联储利率对银行影响',meta:'2 天前'}],
  unh:[{kind:'预警',title:'政策听证跟踪',meta:'12:14 · 信念 0.48→0.44'},{kind:'笔记',title:'国会相关法案进展',meta:'08:47'}],
  aapl:[{kind:'分析',title:'iPhone 16 供应链调研',meta:'昨日 · +1% 加仓建议'}],
  reviewer:[{kind:'复盘',title:'当日收盘复盘',meta:'昨 16:30 · 组合 +0.34%'},{kind:'词条',title:'三把写锁 · 记忆只增不改',meta:'被引用 11 次'}],
  adviser:[{kind:'简报',title:'今日团队结论',meta:'NVDA -2% · 其余维持'},{kind:'摘要',title:'组合表现日报',meta:'今日 +0.44% · 跑赢 SPY 0.2%'}],
};

// per-seat humanized metadata (for 同事 cards)
window.SEAT_META={
  pm:{sym:'组合',dirl:'统筹',model:'kimi-k2',skills:['组合构建','风险纪律','跨席位整合'],desc:'整合 6 位分析师观点，制定每日交易计划，守住集中度与现金纪律。'},
  nvda:{sym:'NVDA',dirl:'看多',model:'kimi-k2',skills:['半导体','出货追踪','算力周期'],desc:'盯英伟达 Blackwell 出货与需求弹性，跟踪 AI 算力资本开支周期。'},
  googl:{sym:'GOOGL',dirl:'持有',model:'kimi-k2',skills:['数字广告','云计算','搜索'],desc:'覆盖谷歌搜索广告防御性与 GCP 增速，评估 AI 搜索替代风险。'},
  cost:{sym:'COST',dirl:'看多',model:'kimi-k2',skills:['零售','会员经济','护城河'],desc:'跟踪 Costco 月度会员续费率与估值，评估护城河溢价的合理性。'},
  jpm:{sym:'JPM',dirl:'持有',model:'kimi-k2',skills:['银行','利率','宏观'],desc:'追踪美联储利率对净息差与贷款需求的双向影响，监测信贷风险。'},
  unh:{sym:'UNH',dirl:'看空',model:'kimi-k2',skills:['医疗','政策监管','合规'],desc:'评估联合健康的政策监管事件影响范围，动态调整信念分。'},
  aapl:{sym:'AAPL',dirl:'持有',model:'kimi-k2',skills:['消费电子','供应链','服务收入'],desc:'分析苹果 iPhone 供应链与财报节奏，判断加减仓时机。'},
  reviewer:{sym:'知识库',dirl:'学习',model:'kimi-k2',skills:['复盘','记忆写锁','知识沉淀'],desc:'收盘后读全天记录，写复盘、更新各席位记忆、维护团队知识库。'},
};

/* ===== research_notes — the real backend model =====
   one persistent analyst per ticker; each daily run appends a note with
   kind / direction / conviction(0-1) / thesis(with cited data points). */
window.NOTE_KIND={daily_take:'每日观点',deep_dive:'深度研究',event_response:'事件响应'};
window.NOTE_DIR={
  bullish:{l:'看多',c:'up'},bearish:{l:'看空',c:'dn'},hold:{l:'持有',c:'mut'},
  add:{l:'加仓',c:'up'},cut:{l:'减仓',c:'dn'}
};
window.NOTES=[
  {id:42,time:'07:32',sid:'nvda',kind:'daily_take',dir:'bullish',conv:0.88,
   thesis:'Blackwell 供不应求被确认为结构性需求而非脉冲[1]；但组合权重已升至 25.5%[2]，触及 25% 单票上限——控仓不改基本面强势。',
   cites:[{n:1,v:'四大 CSP 2026 capex 指引连续上修'},{n:2,v:'NVDA 权重 25.5% · 单票上限 25%'}]},
  {id:41,time:'12:14',sid:'unh',kind:'event_response',dir:'bearish',conv:0.44,
   thesis:'国会证词推升合规成本不确定性[1]；信念由 0.48 下调至 0.44[2]，事件尚未定价，建议 PM 保留政策缓冲而非清仓。',
   cites:[{n:1,v:'参议院听证 — 医保定价审查排期'},{n:2,v:'信念 0.48 → 0.44'}]},
  {id:40,time:'07:33',sid:'aapl',kind:'deep_dive',dir:'add',conv:0.62,
   thesis:'iPhone 16 供应链出货高于预期[1]；服务收入增速放缓[2]是长期隐忧，当前仓位 5.5% 处低配，建议 +1%。',
   cites:[{n:1,v:'立讯/富士康 6 月排产 +9% MoM'},{n:2,v:'服务收入增速 12% → 9%'}]},
  {id:39,time:'07:32',sid:'cost',kind:'daily_take',dir:'hold',conv:0.78,
   thesis:'会员续费率 92.9%[1]，护城河领先指标稳健；但 P/E 55x[2]估值偏贵，维持持有不追高。',
   cites:[{n:1,v:'北美续费率 92.9% · 环比 +0.1pp'},{n:2,v:'P/E 55x · 5 年均值 38x'}]},
  {id:38,time:'07:33',sid:'jpm',kind:'daily_take',dir:'add',conv:0.74,
   thesis:'高利率延续，净息差保持扩张[1]；拨备覆盖充足[2]，商业地产敞口可控，小幅加仓。',
   cites:[{n:1,v:'NIM 2.74% · 环比 +6bp'},{n:2,v:'拨备覆盖率 1.8%'}]},
  {id:37,time:'07:32',sid:'googl',kind:'daily_take',dir:'hold',conv:0.71,
   thesis:'搜索广告防御性强[1]；GCP 增速[2]才是真正催化，AI 搜索替代是长期变量，维持持有等数据。',
   cites:[{n:1,v:'搜索广告 YoY +11%'},{n:2,v:'GCP 增速 28% · 加速中'}]},
];
/* reviewer's analyst_memory writes today — the learning loop (only reviewer writes cross-analyst) */
window.MEMO_KIND={thesis:'论点',lesson:'教训',model_assumption:'模型假设',mistake:'失误',context:'背景'};
window.MEMO_WRITES=[
  {sid:'nvda',kind:'lesson',body:'集中度纪律优先于信念分——触顶即控仓，不因高信念例外。'},
  {sid:'unh',kind:'context',body:'国会证词为政策事件窗口，合规成本尚未定价，保留缓冲。'},
  {sid:'cost',kind:'thesis',body:'会员续费率是护城河的领先指标，续费 >92% 时维持持有。'},
];

/* yahoo_finance-style quote+fundamentals fed to each analyst (data source) */
window.QUOTE={
  nvda:{price:142.10,chg:1.8,pe:48.2,beta:1.72,w52:'$86 – $153',mcap:'$3.5T',tgt:'$165'},
  googl:{price:151.20,chg:0.4,pe:23.1,beta:1.03,w52:'$120 – $178',mcap:'$1.9T',tgt:'$170'},
  cost:{price:961.80,chg:-0.3,pe:55.0,beta:0.79,w52:'$680 – $1010',mcap:'$426B',tgt:'$990'},
  jpm:{price:198.40,chg:0.6,pe:12.1,beta:1.08,w52:'$160 – $210',mcap:'$566B',tgt:'$215'},
  unh:{price:498.90,chg:-1.1,pe:14.6,beta:0.61,w52:'$436 – $611',mcap:'$458B',tgt:'$540'},
  aapl:{price:214.00,chg:0.2,pe:32.4,beta:1.21,w52:'$164 – $237',mcap:'$3.3T',tgt:'$230'},
};
/* reviewer reflection document (one per close) */
window.REFLECTION={
  date:'2026-06-07', day:7, navNow:'$1,086,420', navPrev:'$1,081,679', ret:'+0.44%', alpha:'+0.20% vs SPY',
  narrative:'第 7 天。组合净值 $1,086,420，较前日 +0.44%，跑赢 SPY 约 20bp。涨幅主要来自半导体——英伟达单日 +1.8% 贡献了今日大部分正收益；医疗板块拖累，联合健康 −1.1%。零行动日的纪律执行良好：尽管半导体分析师对 NVDA 维持 0.88 的强信念，集中度已触及 25% 单票上限，按计划控仓而非加码，这是今天最重要的一笔"不操作"。',
  hits:['NVDA 减仓纪律落地：权重触顶即控仓，没有因高信念破例。','JPM 小幅加仓吃到净息差扩张，方向正确。'],
  misses:['UNH 政策预警可能偏早，信念下调后当日仍跌 1.1%，时点把握待复盘。'],
  wiki:[{kind:'theme',title:'集中度纪律 vs 趋势信念'},{kind:'postmortem',title:'COST 过早减仓 · 教训复盘'}],
};
/* PM daily plan document — intents carry linked_note_ids back to analyst notes */
window.PLAN={
  date:'2026-06-07', status:'pending',
  narrative:'综合 6 位分析师今日笔记与当前持仓：半导体仍是组合 alpha 主引擎，但 NVDA 集中度已触顶，必须控仓守住纪律；UNH 政策风险上升，保留缓冲；其余维持。今日仅一笔减仓意图，现金缓冲提升至 14%。',
  intents:[{sym:'NVDA',side:'cut',qty:'≈2%',reason:'集中度 25.5% 触及单票上限',linked:[42]}],
  holds:[{sym:'GOOGL',reason:'广告防御 + GCP 催化，持有',linked:[37]},{sym:'COST',reason:'续费率护城河，持有',linked:[39]},{sym:'JPM',reason:'净息差扩张，小幅加',linked:[38]},{sym:'AAPL',reason:'低配，+1% 加仓信号',linked:[40]}],
  watch:[{sym:'UNH',reason:'政策听证未定价，观察',linked:[41]}],
};

/* apply user customizations (renames + added analysts) from 团队管理 */
(function(){try{
  const names=JSON.parse(localStorage.getItem('ta-names')||'{}');
  (window.AGENTS||[]).forEach(a=>{if(names[a.id])a.name=names[a.id];});
  const added=JSON.parse(localStorage.getItem('ta-added')||'[]');
  added.forEach(a=>{if(!(window.AGENTS||[]).some(x=>x.id===a.id)){const seat=a._seat;const c=Object.assign({},a);delete c._seat;window.AGENTS.push(c);if(seat)window.SEAT_META[c.id]=seat;}});
}catch(e){}})();

/* ====== Analyst persona / style — configurable by natural language via Kimi ====== */
window.TeamCfg=(function(){
  const STYLES={'激进':'敢加敢减，重趋势、容忍波动','均衡':'攻守平衡，按基本面与估值权衡','保守':'重安全边际，宁可错过不愿做错','纪律优先':'严守仓位与风控规则，不开例外'};
  const STYLE_SEED={pm:'纪律优先',nvda:'激进',googl:'均衡',cost:'保守',jpm:'均衡',unh:'纪律优先',aapl:'均衡'};
  const SYMNAME={TSLA:'特斯拉',MSFT:'微软',AMZN:'亚马逊',META:'Meta',NFLX:'奈飞',AMD:'AMD',COIN:'Coinbase',PLTR:'Palantir',BABA:'阿里巴巴',KO:'可口可乐',DIS:'迪士尼',ORCL:'甲骨文',AVGO:'博通',CRM:'Salesforce',SMCI:'超微电脑'};
  const CN={'特斯拉':'TSLA','微软':'MSFT','亚马逊':'AMZN','奈飞':'NFLX','网飞':'NFLX','阿里巴巴':'BABA','阿里':'BABA','可口可乐':'KO','迪士尼':'DIS','甲骨文':'ORCL','博通':'AVGO','超微':'SMCI','英伟达':'NVDA','苹果':'AAPL','谷歌':'GOOGL','摩根大通':'JPM','小摩':'JPM','联合健康':'UNH','开市客':'COST','好市多':'COST'};
  const STYLE_KW=[['激进','激进'],['进取','激进'],['大胆','激进'],['均衡','均衡'],['平衡','均衡'],['稳健','保守'],['保守','保守'],['谨慎','保守'],['纪律','纪律优先'],['风控','纪律优先']];

  function load(){try{return JSON.parse(localStorage.getItem('ta-styles')||'{}');}catch(e){return {};}}
  function save(){const o={};(window.AGENTS||[]).forEach(a=>{if(a.style)o[a.id]=a.style;if(a.persona)o['note_'+a.id]=a.persona;});try{localStorage.setItem('ta-styles',JSON.stringify(o));}catch(e){}}
  const saved=load();
  (window.AGENTS||[]).forEach(a=>{a.style=saved[a.id]||a.style||STYLE_SEED[a.id]||'均衡';if(saved['note_'+a.id])a.persona=saved['note_'+a.id];});

  function persistAdded(){try{const add=(window.AGENTS||[]).filter(x=>x.custom).map(x=>({...x,_seat:(window.SEAT_META||{})[x.id]}));localStorage.setItem('ta-added',JSON.stringify(add));}catch(e){}}
  function changed(){save();window.dispatchEvent(new CustomEvent('ta-team-changed'));}
  function symOf(a){const m=(window.SEAT_META||{})[a.id];return (m&&m.sym)||(a.role||'').replace('分析师','').trim().toUpperCase();}
  function findSym(sym){sym=(sym||'').toUpperCase();return (window.AGENTS||[]).find(a=>a.id!=='pm'&&a.id!=='reviewer'&&symOf(a)===sym);}

  function setStyle(sym,style){const a=findSym(sym);if(a){a.style=style;changed();}return a;}
  function setPersona(sym,text){const a=findSym(sym);if(a){a.persona=text;changed();}return a;}
  function add(sym,name,style){
    sym=(sym||'').toUpperCase();if(!sym)return null;const ex=findSym(sym);if(ex)return ex;
    name=name||SYMNAME[sym]||sym;
    const palette=['#0F766E','#7C3AED','#C2410C','#2563EB','#B91C1C','#166534','#0284C7','#9333EA'];
    const id='cust_'+sym+'_'+Date.now();
    const a={id,name:name+' 分析师',role:sym+' 分析师',initials:sym.slice(0,2),color:palette[(window.AGENTS||[]).length%palette.length],dir:'h',status:'idle',task:'首次覆盖 '+sym+'，正在建立研究框架',quote:'',conviction:0,memory:[],history:[],custom:true,style:style||'均衡'};
    window.SEAT_META=window.SEAT_META||{};
    window.SEAT_META[id]={sym,dirl:'持有',model:'kimi-k2',skills:['基本面','跟踪'],desc:'新加入团队，刚开始覆盖 '+sym+'。'};
    window.AGENTS.push(a);persistAdded();changed();return a;
  }
  function remove(sym){const a=findSym(sym);if(a&&a.custom){const i=window.AGENTS.indexOf(a);if(i>=0)window.AGENTS.splice(i,1);persistAdded();changed();return true;}return false;}

  function detectSym(msg){const up=(msg||'').toUpperCase();const all=Object.keys(SYMNAME).concat(['NVDA','AAPL','GOOGL','COST','JPM','UNH']);for(const s of all){if(up.includes(s))return s;}for(const c in CN){if(msg.includes(c))return CN[c];}return null;}
  function detectStyle(msg){for(const x of STYLE_KW){if(msg.includes(x[0]))return x[1];}return null;}

  function parse(msg){
    if(!msg)return null;
    const sym=detectSym(msg), style=detectStyle(msg);
    const rm=/(去掉|移除|取消|撤掉|不看|裁掉|下岗|删掉)/.test(msg);
    const addWord=/(加|新增|增加|覆盖|招|配个?|跟一?下|盯一?下|关注|加入|新招)/.test(msg);
    if(rm&&sym){const a=findSym(sym);if(a&&a.custom){remove(sym);return{reply:`好，已撤掉 ${sym} 的覆盖——对应分析师下岗，明天起不再为它跑研究。`};}if(a){return{reply:`${sym} 是组合核心持仓，建议保留覆盖。需要的话我可以把它的分析师调成「纪律优先」，盯紧风险。`};}return{reply:`目前没在覆盖 ${sym}，无需移除。`};}
    if(sym&&!findSym(sym)&&(addWord||!style)){const nm=SYMNAME[sym]||sym;add(sym,nm,style);return{reply:`已为 ${nm}（${sym}）配了一位专属分析师${style?`，风格「${style}」`:'，风格默认「均衡」'}，明早 07:30 起每天替你研究它。要给他更具体的偏好吗？比如「让 ${sym} 分析师重点盯产能」。`};}
    if(sym&&style&&findSym(sym)){setStyle(sym,style);return{reply:`好，${sym} 分析师已设为「${style}」——${STYLES[style]}。他之后的研究与建议都按这个口径来。`};}
    if(sym&&findSym(sym)&&/(让|偏好|重点|多看|盯住|关注|改成|要他)/.test(msg)&&!style){const note=msg.replace(/^.*?分析师/,'').replace(/^(让|改成|偏好|重点|多看|盯住|关注|要他)/,'').trim()||msg.trim();setPersona(sym,note);return{reply:`记下了——${sym} 分析师之后会按「${note}」的偏好来研究。`};}
    if(style&&!sym){return{reply:`想把哪位分析师设成「${style}」？给我标的就行，比如「把 NVDA 设成${style}」。`};}
    if(addWord&&!sym){return{reply:`想覆盖哪只票？给我代码或名字，比如「加一个特斯拉分析师，风格激进」，我就配一位专属分析师。`};}
    return null;
  }
  return {STYLES,STYLE_SEED,setStyle,setPersona,add,remove,parse,symOf,findSym};
})();
