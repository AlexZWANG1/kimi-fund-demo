/* ============================================================
   Persona — flat-illustration human bust per seat, so each
   workstation shows a real person sitting at the screen.
   <Persona agent={a} size={64} /> renders an SVG portrait.
   Traits are keyed off agent.id; clothing uses agent.color.
   ============================================================ */
const PERSONA={
  adviser: {skin:'#e9bd96',hair:'#2b2622',style:'side', glasses:false,beard:false,headset:true,bg:'#2a5a60'},
  pm:      {skin:'#e8b88f',hair:'#2e2a28',style:'side', glasses:true, beard:false,bg:'#234e54'},
  nvda:    {skin:'#d99e74',hair:'#1c1a19',style:'short',glasses:false,beard:false,bg:'#5e3422'},
  googl:   {skin:'#e0b48a',hair:'#3a2c24',style:'wave', glasses:true, beard:false,bg:'#3b2f57'},
  cost:    {skin:'#d6a07a',hair:'#26201c',style:'buzz', glasses:false,beard:true, bg:'#214a36'},
  jpm:     {skin:'#e6b88c',hair:'#211d1a',style:'side', glasses:false,beard:false,bg:'#214256'},
  unh:     {skin:'#e8bd95',hair:'#241c2c',style:'long', glasses:false,beard:false,bg:'#5a2727'},
  aapl:    {skin:'#dca97e',hair:'#2b211b',style:'short',glasses:true, beard:false,bg:'#28385a'},
  reviewer:{skin:'#e6b893',hair:'#2a2333',style:'bun',  glasses:true, beard:false,bg:'#3a3152'},
};

function Persona({agent,size=64,ring=true}){
  const p=PERSONA[agent.id]||{skin:'#e2b48d',hair:'#2a2420',style:'short',glasses:false,beard:false,bg:agent.color||'#34506a'};
  const cloth=agent.color;
  const clothD=shade(cloth,-14);
  const hl=shade(p.hair,18);
  const sk=p.skin, skd=shade(sk,-12);
  return(
    <svg width={size} height={size} viewBox="0 0 100 100" style={{display:'block'}}>
      <defs>
        <clipPath id={`pc-${agent.id}`}><circle cx="50" cy="50" r="50"/></clipPath>
      </defs>
      <g clipPath={`url(#pc-${agent.id})`}>
        <rect width="100" height="100" fill={p.bg}/>
        <rect width="100" height="100" fill="url(#pgrad)" opacity="0"/>
        {/* shoulders / clothing */}
        <path d="M50 66 C30 66 16 78 14 100 L86 100 C84 78 70 66 50 66 Z" fill={cloth}/>
        <path d="M50 66 C44 66 40 70 40 74 L60 74 C60 70 56 66 50 66 Z" fill={clothD}/>
        {/* collar */}
        <path d="M42 67 L50 79 L58 67 L54 65 L50 71 L46 65 Z" fill={shade(cloth,12)}/>
        {/* neck */}
        <rect x="44" y="56" width="12" height="13" rx="5" fill={skd}/>
        {/* head */}
        <ellipse cx="50" cy="44" rx="17" ry="19" fill={sk}/>
        <ellipse cx="50" cy="46" rx="17" ry="17" fill={sk}/>
        {/* ears */}
        <circle cx="33" cy="46" r="3.4" fill={sk}/>
        <circle cx="67" cy="46" r="3.4" fill={sk}/>
        {hairFor(p.style,p.hair,hl)}
        {/* brows + eyes */}
        <g fill="#2c2622">
          <ellipse cx="43" cy="45" rx="2.1" ry="2.4"/>
          <ellipse cx="57" cy="45" rx="2.1" ry="2.4"/>
        </g>
        {/* nose + mouth */}
        <path d="M50 47 L48.5 53 L51.5 53 Z" fill={skd} opacity=".5"/>
        <path d="M45.5 57 Q50 60 54.5 57" stroke={shade(sk,-26)} strokeWidth="1.6" fill="none" strokeLinecap="round"/>
        {p.beard&&<path d="M36 50 C37 64 44 70 50 70 C56 70 63 64 64 50 C60 58 54 60 50 60 C46 60 40 58 36 50 Z" fill={p.hair} opacity=".92"/>}
        {p.glasses&&<g stroke="#1d2733" strokeWidth="1.8" fill="none" opacity=".82">
          <rect x="36.5" y="41.5" width="11" height="9" rx="3"/>
          <rect x="52.5" y="41.5" width="11" height="9" rx="3"/>
          <path d="M47.5 45.5 L52.5 45.5"/>
        </g>}
        {p.headset&&<g opacity=".9"><path d="M31 46 C31 32 40 27 50 27 C60 27 69 32 69 46" stroke="#cfd6df" strokeWidth="2.4" fill="none"/><rect x="28.5" y="44" width="6" height="10" rx="3" fill="#cfd6df"/><rect x="65.5" y="44" width="6" height="10" rx="3" fill="#cfd6df"/><path d="M31.5 53 C31.5 60 38 61 42 60" stroke="#cfd6df" strokeWidth="2" fill="none"/><circle cx="43" cy="60" r="2.2" fill="#9aa6b4"/></g>}
      </g>
      {ring&&<circle cx="50" cy="50" r="49" fill="none" stroke="rgba(255,255,255,.14)" strokeWidth="2"/>}
    </svg>
  );
}
function hairFor(style,c,hl){
  switch(style){
    case 'short': return <g fill={c}><path d="M32 44 C30 26 40 21 50 21 C60 21 70 26 68 44 C66 35 60 31 50 31 C40 31 34 35 32 44 Z"/></g>;
    case 'side':  return <g fill={c}><path d="M32 45 C30 25 41 20 51 20 C62 20 69 27 68 41 C66 34 62 30 55 29 C53 33 44 33 40 31 C36 33 33 38 32 45 Z"/></g>;
    case 'buzz':  return <g fill={c} opacity=".95"><path d="M33 42 C33 27 42 23 50 23 C58 23 67 27 67 42 C63 35 58 32 50 32 C42 32 37 35 33 42 Z"/></g>;
    case 'wave':  return <g fill={c}><path d="M31 46 C29 27 41 19 51 19 C62 19 70 26 69 44 C66 38 66 32 60 31 C58 36 54 35 52 31 C49 37 43 35 41 31 C35 33 33 39 31 46 Z"/></g>;
    case 'long':  return <g fill={c}><path d="M30 52 C26 30 38 18 50 18 C62 18 74 30 70 52 C69 44 67 38 64 35 L64 60 C64 60 60 54 60 44 C56 47 44 47 40 44 L40 60 C37 54 36 44 36 35 C33 38 31 44 30 52 Z"/></g>;
    case 'bun':   return <g fill={c}><circle cx="50" cy="20" r="7"/><path d="M33 44 C31 27 40 22 50 22 C60 22 69 27 67 44 C65 35 60 31 50 31 C40 31 35 35 33 44 Z"/></g>;
    default: return null;
  }
}
function shade(hex,amt){
  const h=hex.replace('#','');const n=parseInt(h.length===3?h.split('').map(x=>x+x).join(''):h,16);
  let r=(n>>16)+amt,g=((n>>8)&255)+amt,b=(n&255)+amt;
  r=Math.max(0,Math.min(255,r));g=Math.max(0,Math.min(255,g));b=Math.max(0,Math.min(255,b));
  return '#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);
}
window.Persona=Persona;
