import { useState, useRef, useEffect } from "react";

// ── STORAGE ──────────────────────────────────────────────────────────────────
const SK = "beauty_data";
async function load() {
  try { const r = await window.storage.get(SK); if (r?.value) return JSON.parse(r.value); } catch(_){}
  return null;
}
async function save(data) {
  try { await window.storage.set(SK, JSON.stringify(data)); } catch(_){}
}

// ── EVIDENCE-BASED STAMP REWARDS ──────────────────────────────────────────────
// Sources: AAD (American Academy of Dermatology), Journal of Investigative Dermatology,
// British Journal of Dermatology, International Journal of Cosmetic Science
const STAMP_REWARDS = [
  {
    stamp:1, icon:"💧", title:"保湿のゴールデンタイム", tag:"保湿 Basic",
    evidence:"★★★", source:"AAD / Journal of Investigative Dermatology",
    body:"入浴後3分以内の保湿が最も経皮水分蒸散量（TEWL）を抑制することが示されています。肌が湿っている状態でエモリエント剤を塗布すると閉塞効果が高まり、乾燥肌・アトピー改善に有効。",
    tip:"化粧水→乳液→クリームの順。水分を「閉じ込める」層を最後に。",
  },
  {
    stamp:2, icon:"☀️", title:"日焼け止めは最強のアンチエイジング", tag:"UV Basic",
    evidence:"★★★", source:"NEJM 2013 / AAD推奨",
    body:"2013年のNEJM掲載の4.5年追跡研究で、日焼け止め毎日使用群は非使用群に比べ皮膚老化スコアが有意に低かったことが証明されています。UVAによる光老化はシワ・たるみの主因。",
    tip:"SPF30以上・PA+++以上を毎朝。曇りの日もUVAは透過します。",
  },
  {
    stamp:3, icon:"🤲", title:"マッサージで血流促進・むくみ改善", tag:"Massage",
    evidence:"★★☆", source:"Journal of Cosmetic Dermatology 2017",
    body:"1日5分のフェイシャル・ボディマッサージが皮膚の血流を増加させ、むくみ軽減と肌のトーン改善に寄与することが報告されています。リンパドレナージュは浮腫の軽減に有効。",
    tip:"心臓に向かって「下から上・外から内」が基本。強く押しすぎると逆効果。",
  },
  {
    stamp:4, icon:"🛁", title:"入浴温度と肌バリアの関係", tag:"Bath",
    evidence:"★★★", source:"British Journal of Dermatology 2020",
    body:"40℃以上の高温浴は皮脂膜と角質細胞間脂質を溶出させ、肌バリア機能を著しく低下させます。38〜39℃の微温浴が最もバリア機能を保ちながら血行促進効果を得られます。",
    tip:"長時間浴槽に浸かりすぎも×。15〜20分を目安に。",
  },
  {
    stamp:5, icon:"🌙", title:"睡眠と肌再生の科学", tag:"Sleep",
    evidence:"★★★", source:"Clinical and Experimental Dermatology / Sleep Medicine Reviews",
    body:"睡眠中に分泌される成長ホルモンは皮膚細胞の修復・コラーゲン産生を促進します。睡眠不足（6時間未満）は皮膚バリア回復速度を有意に低下させることが複数研究で示されています。",
    tip:"7〜9時間の睡眠が推奨。就寝前のブルーライトカットも重要。",
  },
  {
    stamp:6, icon:"🥑", title:"食事と肌の科学的関係", tag:"Inner Beauty",
    evidence:"★★☆", source:"Journal of Drugs in Dermatology / Nutrients 2020",
    body:"ビタミンC（コラーゲン合成に必須）・ビタミンE（抗酸化）・オメガ3脂肪酸（バリア機能強化）の摂取が肌質改善に関与することが示されています。高GI食はニキビリスクを高める可能性があります。",
    tip:"カラフルな野菜・青魚・ナッツを意識的に。サプリより食事から優先。",
  },
  {
    stamp:7, icon:"💎", title:"レチノイド（ビタミンA誘導体）の真実", tag:"成分 Advanced",
    evidence:"★★★", source:"AAD / Archives of Dermatology",
    body:"レチノール・レチナールはFDA承認済みのアンチエイジング成分。コラーゲン産生促進・表皮ターンオーバー促進・シミ改善の効果が最も多くのRCT（ランダム化比較試験）で証明されています。",
    tip:"最初は週2〜3回・低濃度から。刺激を感じたら頻度を下げて継続。",
  },
  {
    stamp:8, icon:"💧", title:"ヒアルロン酸・セラミドの正しい理解", tag:"成分 Basic",
    evidence:"★★★", source:"International Journal of Cosmetic Science",
    body:"セラミドは角質細胞間脂質の約50%を占め、バリア機能の主役。外用セラミドの補充が乾燥肌・アトピーのバリア回復に有効であることが多数の試験で確認されています。ヒアルロン酸は真皮の保水を助けます。",
    tip:"乾燥肌にはセラミドを含む製品を。高分子より低分子ヒアルロン酸が浸透しやすい。",
  },
  {
    stamp:9, icon:"🧴", title:"角質ケア（AHA/BHA）の正しい使い方", tag:"Exfoliate",
    evidence:"★★★", source:"Journal of the American Academy of Dermatology",
    body:"グリコール酸（AHA）・サリチル酸（BHA）は過剰な角質除去・毛穴ケアに効果的であることがRCTで示されています。ただし過剰使用はバリア機能を破壊。週1〜2回が適正頻度。",
    tip:"使用後は必ず日焼け止め。敏感肌は低濃度から、刺激を感じたら中止。",
  },
  {
    stamp:10, icon:"🌿", title:"ナイアシンアミドの多機能性", tag:"成分 中級",
    evidence:"★★★", source:"Dermatologic Surgery / British Journal of Dermatology",
    body:"ナイアシンアミド（ビタミンB3）はメラニン転送阻害によるシミ改善・皮脂分泌抑制・バリア強化・抗炎症作用を持ち、複数のRCTで効果が確認されている希少な多機能成分です。",
    tip:"2〜5%濃度が最もエビデンスが豊富。刺激が少なく敏感肌にも使いやすい。",
  },
  {
    stamp:11, icon:"💦", title:"水分摂取と肌の関係", tag:"Hydration",
    evidence:"★★☆", source:"Clinical Cosmetic and Investigational Dermatology 2015",
    body:"1日2L以上の水分摂取が皮膚の水分量・弾力性を改善することが示されています。ただし既に十分な水分摂取をしている人には効果が限定的。脱水状態の改善が最も効果的。",
    tip:"1日1.5〜2Lを目安に。コーヒー・アルコールは利尿作用があるため別カウント。",
  },
  {
    stamp:12, icon:"🔬", title:"SPFと日焼け止めの正しい使用量", tag:"UV Advanced",
    evidence:"★★★", source:"Journal of Investigative Dermatology / AAD",
    body:"日焼け止めの臨床試験で使用される量は2mg/cm²（顔全体で約1g）ですが、実際の使用量は推奨の1/4〜1/2程度が多いとされています。少量塗布ではSPF効果が大幅に低下します。",
    tip:"顔には500円玉大を目安に。2〜3時間ごとの塗り直しも忘れずに。",
  },
  {
    stamp:13, icon:"🌸", title:"首・デコルテのUVケアの重要性", tag:"Anti-aging",
    evidence:"★★★", source:"Dermatologic Surgery 2016",
    body:"顔と首・デコルテのUV曝露量に差があると、年齢とともに明確な色調差・シワの差が生じることが縦断研究で示されています。顔のケアを首まで延長するだけで老化差を防げます。",
    tip:"洗顔後・日焼け止め塗布時は必ず顎下から鎖骨まで。毎日の積み重ねが大きな差に。",
  },
  {
    stamp:14, icon:"🧘", title:"ストレスと肌荒れの科学", tag:"Lifestyle",
    evidence:"★★★", source:"Archives of Dermatology / Psychosomatic Medicine",
    body:"コルチゾール（ストレスホルモン）の慢性的な上昇は皮膚バリア機能を低下させ、炎症性サイトカインを増加させます。ストレス管理が皮膚炎・ニキビ・アトピーの悪化を防ぐことが示されています。",
    tip:"瞑想・深呼吸・軽い運動がコルチゾール低下に有効。睡眠の質改善も重要。",
  },
  {
    stamp:15, icon:"🏃", title:"運動と肌の若返り効果", tag:"Exercise",
    evidence:"★★☆", source:"Journal of Applied Physiology 2014 / McMaster University研究",
    body:"マクマスター大学の研究では、定期的な有酸素運動を行う中高年の皮膚は、同年代の非運動群と比較して角質層・真皮の構造が若い人に近いことが示されました。IL-15産生が関与。",
    tip:"週3回以上・30分以上の有酸素運動が目安。激しい運動後は速やかに洗顔を。",
  },
  {
    stamp:16, icon:"🛡️", title:"肌バリア破壊サインと修復法", tag:"Barrier Advanced",
    evidence:"★★★", source:"Journal of Investigative Dermatology / AAD",
    body:"ピリピリ感・赤み・乾燥の悪化は肌バリアが壊れているサイン。この状態での新成分導入・スクラブは逆効果です。セラミド・ワセリン系のシンプルケアに戻し、2週間かけてバリアを修復することが推奨されています。",
    tip:"「スキンケアを引き算する」勇気が大切。成分数を減らしてシンプルに。",
  },
  {
    stamp:17, icon:"🌡️", title:"季節・環境変化への適応ケア", tag:"Seasonal",
    evidence:"★★☆", source:"International Journal of Cosmetic Science",
    body:"湿度が低下すると角質水分量が低下し、バリア機能が弱まります。秋冬は夏より高OIL性・高保湿のテクスチャーへの切り替えが合理的です。エアコン使用環境では年中乾燥対策が必要。",
    tip:"湿度40%以下の環境では加湿器の使用を。室内でも保湿を意識して。",
  },
  {
    stamp:18, icon:"😴", title:"枕カバーと肌の意外な関係", tag:"Lifestyle Advanced",
    evidence:"★★☆", source:"Journal of Drugs in Dermatology 2019",
    body:"コットン枕カバーはシルク/サテン素材と比較して摩擦が高く、長期的なシワ形成や肌荒れに関与する可能性が示されています。また頭皮の皮脂が肌に移ることで毛穴詰まりにも影響。",
    tip:"週2回以上の枕カバー交換が推奨。シルク/サテン素材への変更も有効。",
  },
  {
    stamp:19, icon:"🔬", title:"コラーゲンサプリの科学的評価", tag:"Supplement",
    evidence:"★★☆", source:"Journal of Drugs in Dermatology 2019 / Skin Pharmacology and Physiology",
    body:"加水分解コラーゲンペプチド（1日2.5〜10g）の経口摂取が皮膚の弾力性・水分量・シワの改善に寄与することが複数のプラセボ対照二重盲検試験で示されています。ビタミンCとの併用で効果が高まる可能性があります。",
    tip:"効果が出るまで最低4〜8週間かかります。ビタミンCを一緒に摂ると効果的。",
  },
  {
    stamp:20, icon:"👑", title:"科学的に正しい朝晩ルーティン", tag:"Complete",
    evidence:"★★★", source:"AAD公式推奨 / Journal of the American Academy of Dermatology",
    body:"【朝・AAD推奨】洗顔→抗酸化成分（ビタミンC）→保湿剤→SPF30以上の日焼け止め。【夜】洗顔→必要に応じてAHA/BHA（週1〜2回）→レチノール（週2〜3回）または保湿美容液→保湿クリーム。このシンプルな構成が最もエビデンスの厚いルーティンです。",
    tip:"多すぎる工程は肌に刺激を与えます。少ない工程を丁寧に継続するほうが効果的。",
  },
];

const BODY_ITEMS = [
  {id:"moisturize",label:"全身保湿",  icon:"💧"},
  {id:"scrub",     label:"スクラブ",  icon:"🧴"},
  {id:"massage",   label:"マッサージ",icon:"🤲"},
  {id:"bath",      label:"入浴剤バス",icon:"🛁"},
  {id:"supplement",label:"サプリ",    icon:"💊"},
  {id:"water",     label:"水分2L",    icon:"💦"},
  {id:"stretch",   label:"ストレッチ",icon:"🧘"},
  {id:"sunscreen", label:"日焼け止め",icon:"☀️"},
  {id:"dry_brush", label:"ドライブラシ",icon:"🪥"},
  {id:"oil",       label:"ボディオイル",icon:"✨"},
];
const SKIN_ITEMS = [
  {id:"cleanse",label:"洗顔",    icon:"🫧"},
  {id:"toner",  label:"化粧水",  icon:"🌿"},
  {id:"serum",  label:"美容液",  icon:"💎"},
  {id:"cream",  label:"クリーム",icon:"🍶"},
  {id:"pack",   label:"パック",  icon:"🎭"},
  {id:"spf",    label:"日焼け止め",icon:"🌞"},
];
const MOODS = ["🥰","😊","😌","😐","😩"];
const COND_LABELS = ["","最悪","悪い","普通","良い","最高"];

// Unlock thresholds for extra features
const FEATURE_UNLOCKS = {
  graph:    5,   // 肌コンディショングラフ
  calendar: 10,  // カレンダービュー
  compare:  15,  // ビフォーアフター比較
  ai:       20,  // AIスキンケア診断
};

const T = {
  bg:"#f7f4f0", bgCard:"#ffffff", bgMuted:"#f2ede8",
  border:"#e8e0d8", text:"#1a1714", sub:"#8a8078",
  accent:"#c9a89a", accent2:"#a89080", green:"#8aaa8a",
};

const INIT_LOGS = [];
const INIT_TODOS = [];

function calcStreak(logs){
  const today=new Date(); today.setHours(0,0,0,0);
  const dates=[...new Set(logs.map(l=>l.date))].sort().reverse();
  let s=0;
  for(let i=0;i<dates.length;i++){
    const d=new Date(dates[i]); d.setHours(0,0,0,0);
    if(Math.round((today-d)/86400000)===i) s++; else break;
  }
  return s;
}
function fmt(d){return new Date(d).toLocaleDateString("ja-JP",{month:"short",day:"numeric",weekday:"short"});}
function fmtShort(d){return new Date(d).toLocaleDateString("ja-JP",{month:"numeric",day:"numeric"});}

// ── POPUP ─────────────────────────────────────────────────────────────────────
function Popup({data,onClose}){
  if(!data) return null;
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(26,23,20,0.55)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:"#fff",borderRadius:24,padding:"32px 26px",textAlign:"center",maxWidth:340,width:"100%",boxShadow:"0 20px 60px rgba(0,0,0,0.15)",animation:"popIn 0.4s cubic-bezier(0.34,1.56,0.64,1)"}}>
        <div style={{width:60,height:60,borderRadius:"50%",background:T.bgMuted,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,margin:"0 auto 12px"}}>{data.icon}</div>
        <div style={{fontSize:9,letterSpacing:4,color:T.accent,textTransform:"uppercase",marginBottom:4}}>Stamp {data.stamp} Unlocked</div>
        <div style={{display:"inline-flex",alignItems:"center",gap:6,background:T.bgMuted,borderRadius:20,padding:"3px 12px",fontSize:10,color:T.sub,marginBottom:10,letterSpacing:1}}>
          <span>{data.tag}</span><span style={{color:T.accent}}>{data.evidence}</span>
        </div>
        <h2 style={{margin:"0 0 10px",fontSize:17,color:T.text,fontWeight:500,lineHeight:1.4}}>{data.title}</h2>
        <p style={{margin:"0 0 8px",fontSize:12,color:T.sub,lineHeight:1.8,textAlign:"left"}}>{data.body}</p>
        {data.tip&&<div style={{padding:"10px 12px",background:T.bgMuted,borderRadius:10,fontSize:12,color:T.accent2,lineHeight:1.6,textAlign:"left",marginBottom:12}}>💡 {data.tip}</div>}
        <div style={{fontSize:9,color:T.border,marginBottom:16,letterSpacing:1}}>出典: {data.source}</div>
        <button onClick={onClose} style={{background:T.text,color:"#fff",border:"none",borderRadius:50,padding:"12px 28px",fontSize:13,cursor:"pointer",fontFamily:"inherit",letterSpacing:2,width:"100%"}}>확인 ✓</button>
      </div>
    </div>
  );
}

// ── CONDITION GRAPH ────────────────────────────────────────────────────────────
function ConditionGraph({logs}){
  const data=[...logs].sort((a,b)=>a.date.localeCompare(b.date)).slice(-14);
  if(data.length<2) return <div style={{padding:"20px",textAlign:"center",color:T.sub,fontSize:12}}>記録が2件以上になるとグラフが表示されます</div>;
  const W=340,H=120,PAD=12;
  const vals=data.map(d=>d.condition);
  const pts=data.map((d,i)=>({
    x:PAD+(i/(data.length-1))*(W-PAD*2),
    y:H-PAD-(d.condition-1)/(5-1)*(H-PAD*2),
    d,
  }));
  const pathD=pts.map((p,i)=>i===0?`M${p.x},${p.y}`:`L${p.x},${p.y}`).join(" ");
  const fillD=`${pathD} L${pts[pts.length-1].x},${H} L${pts[0].x},${H} Z`;
  return(
    <div style={{overflowX:"auto"}}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",maxWidth:W,display:"block",margin:"0 auto"}}>
        {[1,2,3,4,5].map(v=>{
          const y=H-PAD-(v-1)/(5-1)*(H-PAD*2);
          return <g key={v}><line x1={PAD} y1={y} x2={W-PAD} y2={y} stroke={T.border} strokeWidth="0.5"/><text x={PAD-4} y={y+3} fontSize={7} fill={T.sub} textAnchor="end">{v}</text></g>;
        })}
        <path d={fillD} fill={T.accent} opacity={0.12}/>
        <path d={pathD} fill="none" stroke={T.accent} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
        {pts.map((p,i)=>(
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4" fill={T.accent} stroke="#fff" strokeWidth="1.5"/>
          </g>
        ))}
      </svg>
      <div style={{display:"flex",justifyContent:"space-between",padding:"0 12px",marginTop:4}}>
        {data.filter((_,i)=>i===0||i===data.length-1||i===Math.floor(data.length/2)).map(d=>(
          <div key={d.id} style={{fontSize:9,color:T.sub,letterSpacing:0.5}}>{fmtShort(d.date)}</div>
        ))}
      </div>
    </div>
  );
}

// ── CALENDAR VIEW ──────────────────────────────────────────────────────────────
function CalendarView({logs,onSelect}){
  const [year,setYear]=useState(new Date().getFullYear());
  const [month,setMonth]=useState(new Date().getMonth());
  const logMap=Object.fromEntries(logs.map(l=>[l.date,l]));
  const first=new Date(year,month,1).getDay();
  const days=new Date(year,month+1,0).getDate();
  const prev=()=>{if(month===0){setYear(y=>y-1);setMonth(11);}else setMonth(m=>m-1);};
  const next=()=>{if(month===11){setYear(y=>y+1);setMonth(0);}else setMonth(m=>m+1);};
  const cells=[];
  for(let i=0;i<first;i++) cells.push(null);
  for(let d=1;d<=days;d++) cells.push(d);
  const moName=`${year}年${month+1}月`;
  const dayNames=["日","月","火","水","木","金","土"];
  return(
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
        <button onClick={prev} style={{background:"none",border:"none",fontSize:18,cursor:"pointer",color:T.sub,padding:"4px 10px"}}>‹</button>
        <div style={{fontSize:13,color:T.text,letterSpacing:2}}>{moName}</div>
        <button onClick={next} style={{background:"none",border:"none",fontSize:18,cursor:"pointer",color:T.sub,padding:"4px 10px"}}>›</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:6}}>
        {dayNames.map(d=><div key={d} style={{textAlign:"center",fontSize:9,color:T.sub,letterSpacing:1,paddingBottom:4}}>{d}</div>)}
        {cells.map((d,i)=>{
          if(!d) return <div key={i}/>;
          const dateStr=`${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
          const log=logMap[dateStr];
          const isToday=dateStr===new Date().toISOString().slice(0,10);
          return(
            <button key={i} onClick={()=>log&&onSelect(log)} style={{
              aspectRatio:"1",borderRadius:10,border:`1px solid ${log?T.accent:T.border}`,
              background:log?T.bgMuted:"transparent",cursor:log?"pointer":"default",
              display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:1,
              outline:isToday?`2px solid ${T.accent}`:"none",outlineOffset:1,padding:0,
            }}>
              <span style={{fontSize:11,color:log?T.text:T.sub,fontWeight:log?500:300}}>{d}</span>
              {log&&<span style={{fontSize:10}}>{log.mood}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── BEFORE / AFTER ─────────────────────────────────────────────────────────────
function BeforeAfter({logs}){
  const withPhotos=logs.filter(l=>l.photos.length>0).sort((a,b)=>a.date.localeCompare(b.date));
  const [leftIdx,setLeftIdx]=useState(0);
  const [rightIdx,setRightIdx]=useState(Math.max(0,withPhotos.length-1));
  if(withPhotos.length<2) return(
    <div style={{padding:"24px",textAlign:"center",color:T.sub,fontSize:12,lineHeight:1.8}}>
      📸 写真付きの記録が2件以上あると<br/>ビフォーアフター比較ができます
    </div>
  );
  const left=withPhotos[leftIdx];
  const right=withPhotos[rightIdx];
  return(
    <div>
      <div style={{display:"flex",gap:8,marginBottom:12}}>
        {[{label:"Before",log:left,idx:leftIdx,setIdx:setLeftIdx},{label:"After",log:right,idx:rightIdx,setIdx:setRightIdx}].map(({label,log,idx,setIdx})=>(
          <div key={label} style={{flex:1}}>
            <div style={{fontSize:9,letterSpacing:3,color:T.sub,textTransform:"uppercase",marginBottom:6,textAlign:"center"}}>{label}</div>
            <img src={log.photos[0]} alt="" style={{width:"100%",aspectRatio:"1",objectFit:"cover",borderRadius:14,border:`1px solid ${T.border}`,display:"block"}}/>
            <div style={{fontSize:10,color:T.sub,textAlign:"center",marginTop:5,letterSpacing:0.5}}>{fmtShort(log.date)} {log.mood}</div>
            <div style={{display:"flex",justifyContent:"center",gap:4,marginTop:4}}>
              {[1,2,3,4,5].map(n=><div key={n} style={{width:6,height:6,borderRadius:"50%",background:n<=log.condition?T.accent:T.border}}/>)}
            </div>
            <select value={idx} onChange={e=>setIdx(Number(e.target.value))} style={{marginTop:6,width:"100%",fontSize:10,background:T.bgMuted,border:`1px solid ${T.border}`,borderRadius:8,padding:"5px 8px",color:T.sub,fontFamily:"inherit"}}>
              {withPhotos.map((l,i)=><option key={l.id} value={i}>{fmtShort(l.date)}</option>)}
            </select>
          </div>
        ))}
      </div>
      {left&&right&&(
        <div style={{padding:"12px 14px",background:T.bgMuted,borderRadius:12,fontSize:12,color:T.sub,lineHeight:1.7}}>
          コンディション変化: <span style={{color:right.condition>=left.condition?T.green:T.accent,fontWeight:500}}>
            {left.condition} → {right.condition} ({right.condition>=left.condition?"+":""}{right.condition-left.condition})
          </span>
        </div>
      )}
    </div>
  );
}

// ── AI DIAGNOSIS ───────────────────────────────────────────────────────────────
function AIDiagnosis({logs}){
  const [result,setResult]=useState(null);
  const [loading,setLoading]=useState(false);
  const [concern,setConcern]=useState("");

  async function diagnose(){
    setLoading(true); setResult(null);
    const recent=logs.slice(0,7);
    const avgCond=recent.length?Math.round(recent.reduce((s,l)=>s+l.condition,0)/recent.length*10)/10:"-";
    const bodyFreq={};
    recent.forEach(l=>l.body.forEach(b=>{bodyFreq[b]=(bodyFreq[b]||0)+1;}));
    const topBody=Object.entries(bodyFreq).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([k])=>BODY_ITEMS.find(x=>x.id===k)?.label||k).join("・");
    const skinFreq={};
    recent.forEach(l=>l.skin.forEach(s=>{skinFreq[s]=(skinFreq[s]||0)+1;}));
    const topSkin=Object.entries(skinFreq).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([k])=>SKIN_ITEMS.find(x=>x.id===k)?.label||k).join("・");
    const prompt=`あなたは日本皮膚科学会ガイドラインとAAD（米国皮膚科学会）推奨に基づくスキンケアの専門家です。以下のユーザーデータを分析し、エビデンスに基づいたパーソナライズされたアドバイスを日本語で提供してください。

【ユーザーデータ】
- 直近7日間の平均肌コンディション: ${avgCond}/5
- よく行うボディケア: ${topBody||"記録なし"}
- よく行うスキンケア: ${topSkin||"記録なし"}
- 継続日数: ${logs.length}日
- 現在の悩み: ${concern||"特になし"}

【回答形式】
以下の構成で300字以内で回答してください：
1. 現在の肌状態の分析（1文）
2. 最も重要な改善ポイント（2点、箇条書き）
3. 今週試してほしいこと（1つ、具体的に）
4. エビデンスの補足（出典を1つ）

科学的根拠のないアドバイスは含めないでください。`;

    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          messages:[{role:"user",content:prompt}],
        }),
      });
      const data=await res.json();
      const text=data.content?.map(b=>b.text||"").join("").trim();
      setResult(text||"診断結果を取得できませんでした。");
    }catch(e){
      setResult("エラーが発生しました。もう一度お試しください。");
    }
    setLoading(false);
  }

  return(
    <div>
      <div style={{fontSize:12,color:T.sub,lineHeight:1.7,marginBottom:14}}>
        記録データをもとにClaudeが科学的根拠に基づいたパーソナルアドバイスを生成します。
      </div>
      <div style={{marginBottom:12}}>
        <div style={{fontSize:10,letterSpacing:3,color:T.sub,textTransform:"uppercase",marginBottom:6}}>現在の悩み（任意）</div>
        <input value={concern} onChange={e=>setConcern(e.target.value)} placeholder="例: 乾燥、毛穴、くすみ..." style={{width:"100%",background:T.bgMuted,border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 12px",fontSize:13,color:T.text,fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}/>
      </div>
      <button onClick={diagnose} disabled={loading} style={{width:"100%",padding:"13px",borderRadius:12,background:loading?T.bgMuted:T.text,color:loading?T.sub:"#fff",border:"none",fontSize:13,letterSpacing:2,cursor:loading?"wait":"pointer",fontFamily:"inherit",marginBottom:14,transition:"all 0.2s"}}>
        {loading?"診断中...":"AIスキンケア診断を受ける"}
      </button>
      {loading&&<div style={{textAlign:"center",padding:"20px",color:T.sub,fontSize:12,animation:"pulse 1.5s ease infinite"}}>🔬 データを分析中...</div>}
      {result&&(
        <div style={{background:T.bgMuted,borderRadius:14,padding:"16px",animation:"fadeIn 0.3s ease"}}>
          <div style={{fontSize:9,letterSpacing:3,color:T.accent,textTransform:"uppercase",marginBottom:10}}>AI診断結果</div>
          <div style={{fontSize:13,color:T.text,lineHeight:1.85,whiteSpace:"pre-wrap"}}>{result}</div>
        </div>
      )}
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function App(){
  const [tab,setTab]=useState("home");
  const [logs,setLogs]=useState(INIT_LOGS);
  const [todos,setTodos]=useState(INIT_TODOS);
  const [goalImg,setGoalImg]=useState(null);
  const [goalText,setGoalText]=useState("나만의 피부 목표\nmy skin goal ✦");
  const [editGoal,setEditGoal]=useState(false);
  const [showAdd,setShowAdd]=useState(false);
  const [showTodoAdd,setShowTodoAdd]=useState(false);
  const [newTodoText,setNewTodoText]=useState("");
  const [newTodoType,setNewTodoType]=useState("weekly");
  const [viewLog,setViewLog]=useState(null);
  const [popup,setPopup]=useState(null);
  const [queue,setQueue]=useState([]);
  const [toast,setToast]=useState(null);
  const [openReward,setOpenReward]=useState(null);
  const [rewardSub,setRewardSub]=useState("stamps");
  const [calLog,setCalLog]=useState(null);
  const [loaded,setLoaded]=useState(false);
  const [saving,setSaving]=useState(false);
  const [newLog,setNewLog]=useState({date:new Date().toISOString().slice(0,10),photos:[],body:[],skin:[],memo:"",mood:"😊",condition:3});

  const goalRef=useRef(); const photoRef=useRef();

  // Load from storage on mount
  useEffect(()=>{
    load().then(data=>{
      if(data){
        if(data.logs) setLogs(data.logs);
        if(data.todos) setTodos(data.todos);
        if(data.goalImg) setGoalImg(data.goalImg);
        if(data.goalText) setGoalText(data.goalText);
      }
      setLoaded(true);
    });
  },[]);

  // Auto-save on data change
  useEffect(()=>{
    if(!loaded) return;
    setSaving(true);
    const t=setTimeout(()=>{ save({logs,todos,goalImg,goalText}).then(()=>setSaving(false)); },800);
    return ()=>clearTimeout(t);
  },[logs,todos,goalImg,goalText,loaded]);

  const streak=calcStreak(logs);
  const totalStamps=logs.length;
  const sorted=[...logs].sort((a,b)=>b.date.localeCompare(a.date));
  const wk=todos.filter(t=>t.type==="weekly");
  const mo=todos.filter(t=>t.type==="monthly");
  const unlockedRewards=STAMP_REWARDS.filter(r=>r.stamp<=totalStamps);
  const nextReward=STAMP_REWARDS.find(r=>r.stamp>totalStamps);

  const featureUnlocked=(key)=>totalStamps>=FEATURE_UNLOCKS[key];

  function closePopup(){if(queue.length){setPopup(queue[0]);setQueue(q=>q.slice(1));}else setPopup(null);}
  function toggleItem(cat,id){setNewLog(l=>({...l,[cat]:l[cat].includes(id)?l[cat].filter(x=>x!==id):[...l[cat],id]}));}

  function saveLog(){
    const saved={...newLog,id:Date.now()};
    const next=[saved,...logs];
    setLogs(next);
    const newRewards=STAMP_REWARDS.filter(r=>r.stamp===next.length);
    if(newRewards.length){setPopup(newRewards[0]);setQueue(newRewards.slice(1));}
    setNewLog({date:new Date().toISOString().slice(0,10),photos:[],body:[],skin:[],memo:"",mood:"😊",condition:3});
    setShowAdd(false);
  }

  if(!loaded) return(
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16,fontFamily:"'Noto Sans JP',sans-serif"}}>
      <div style={{fontSize:36}}>🌸</div>
      <div style={{fontSize:11,letterSpacing:4,color:T.sub}}>loading...</div>
    </div>
  );

  function toggleTodo(id){
    setTodos(ts=>ts.map(t=>{
      if(t.id!==id) return t;
      const n={...t,done:!t.done};
      if(n.done){setToast(`${t.text} 완료`);setTimeout(()=>setToast(null),2200);}
      return n;
    }));
  }

  const IS={width:"100%",background:T.bgMuted,border:`1px solid ${T.border}`,borderRadius:12,padding:"12px 14px",fontSize:14,color:T.text,fontFamily:"inherit",outline:"none",boxSizing:"border-box"};
  const LS={fontSize:10,letterSpacing:4,color:T.sub,textTransform:"uppercase",display:"block",marginBottom:8};

  // Feature lock overlay
  function FeatureLock({featureKey,children}){
    const needed=FEATURE_UNLOCKS[featureKey];
    const unlocked=featureUnlocked(featureKey);
    if(unlocked) return children;
    return(
      <div style={{position:"relative"}}>
        <div style={{filter:"blur(3px)",pointerEvents:"none",userSelect:"none"}}>{children}</div>
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"rgba(247,244,240,0.85)",borderRadius:16}}>
          <div style={{fontSize:28,marginBottom:8}}>🔒</div>
          <div style={{fontSize:13,color:T.text,fontWeight:500,marginBottom:4}}>Stamp {needed}で解放</div>
          <div style={{fontSize:11,color:T.sub}}>あと{needed-totalStamps}回記録しよう</div>
        </div>
      </div>
    );
  }

  return(
    <div style={{minHeight:"100vh",background:T.bg,fontFamily:"'Noto Sans JP','Apple SD Gothic Neo','Helvetica Neue',sans-serif",paddingBottom:80,color:T.text}}>
      <style>{`
        @keyframes popIn{from{transform:scale(0.8);opacity:0}to{transform:scale(1);opacity:1}}
        @keyframes slideUp{from{transform:translateY(16px);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes pulse{0%,100%{opacity:0.5}50%{opacity:1}}
        *{-webkit-tap-highlight-color:transparent;box-sizing:border-box;}
      `}</style>

      <Popup data={popup} onClose={closePopup}/>

      {toast&&<div style={{position:"fixed",bottom:96,left:"50%",transform:"translateX(-50%)",background:T.text,color:"#fff",borderRadius:50,padding:"9px 20px",fontSize:12,zIndex:80,whiteSpace:"nowrap",letterSpacing:1,animation:"popIn 0.25s ease"}}>✓ {toast}</div>}

      {/* HEADER */}
      <header style={{padding:"18px 18px 12px",background:T.bg,borderBottom:`1px solid ${T.border}`,position:"sticky",top:0,zIndex:10,display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
        <div>
          <div style={{fontSize:9,letterSpacing:5,color:T.accent,textTransform:"uppercase",marginBottom:2}}>Beauty Journal</div>
          <div style={{fontSize:21,fontWeight:300,letterSpacing:2,color:T.text}}>미용 일기</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4,paddingBottom:2}}>
          {streak>0&&<div style={{fontSize:11,color:T.sub,letterSpacing:1,display:"flex",alignItems:"center",gap:4}}><span>🔥</span>{streak}일 연속</div>}
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <div style={{fontSize:10,color:T.accent,letterSpacing:1}}>✦ {totalStamps} stamps</div>
            {saving&&<div style={{fontSize:9,color:T.border,letterSpacing:1}}>保存中…</div>}
            {!saving&&loaded&&<div style={{fontSize:9,color:T.green,letterSpacing:1}}>✓ 保存済</div>}
          </div>
        </div>
      </header>

      <div style={{maxWidth:480,margin:"0 auto",padding:"0 16px"}}>

        {/* ── HOME ── */}
        {tab==="home"&&(
          <div style={{animation:"slideUp 0.3s ease"}}>
            {/* HERO GOAL */}
            <div style={{margin:"14px 0 14px",borderRadius:20,overflow:"hidden",position:"relative",cursor:"pointer",background:T.bgMuted,border:`1px solid ${T.border}`}} onClick={()=>goalRef.current?.click()}>
              {goalImg
                ?<img src={goalImg} alt="" style={{width:"100%",height:260,objectFit:"cover",display:"block"}}/>
                :<div style={{height:210,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10}}>
                  <div style={{width:52,height:52,borderRadius:"50%",background:T.border,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>🖼</div>
                  <div style={{fontSize:11,color:T.sub,letterSpacing:2}}>목표 이미지 추가</div>
                  <div style={{fontSize:10,color:T.accent,letterSpacing:1}}>tap to add goal photo</div>
                </div>
              }
              {goalImg&&<div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,rgba(0,0,0,0) 40%,rgba(0,0,0,0.55) 100%)"}}/>}
              <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"14px 16px"}}>
                {editGoal
                  ?<textarea value={goalText} onChange={e=>setGoalText(e.target.value)} onClick={e=>e.stopPropagation()} onBlur={()=>setEditGoal(false)} autoFocus rows={2} style={{...IS,resize:"none",fontSize:13,background:"rgba(255,255,255,0.15)",border:"1px solid rgba(255,255,255,0.3)",color:"#fff"}}/>
                  :<p style={{margin:0,fontSize:13,color:goalImg?"white":T.sub,lineHeight:1.65,whiteSpace:"pre-line",fontWeight:300,textShadow:goalImg?"0 1px 8px rgba(0,0,0,0.6)":"none"}} onClick={e=>{e.stopPropagation();setEditGoal(true)}}>{goalText}</p>
                }
              </div>
              <div style={{position:"absolute",top:10,right:10,background:"rgba(255,255,255,0.88)",borderRadius:20,padding:"3px 10px",fontSize:9,color:T.sub,letterSpacing:1}}>edit</div>
              <input ref={goalRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>setGoalImg(ev.target.result);r.readAsDataURL(f);}}/>
            </div>

            {/* TODO */}
            <div style={{background:T.bgCard,borderRadius:20,border:`1px solid ${T.border}`,marginBottom:14}}>
              <div style={{padding:"16px 18px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                  <span style={{...LS,marginBottom:0}}>To Do</span>
                  <button onClick={()=>setShowTodoAdd(true)} style={{fontSize:11,padding:"5px 14px",borderRadius:20,background:"none",color:T.accent,border:`1px solid ${T.accent}`,cursor:"pointer",fontFamily:"inherit",letterSpacing:1}}>+ add</button>
                </div>
                {wk.length>0&&<>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}><span style={{fontSize:9,letterSpacing:3,color:T.accent}}>WEEKLY</span><div style={{flex:1,height:"1px",background:T.border}}/><span style={{fontSize:9,color:T.sub}}>{wk.filter(t=>t.done).length}/{wk.length}</span></div>
                  {wk.map(t=>(
                    <div key={t.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:`1px solid ${T.border}`}}>
                      <button onClick={()=>toggleTodo(t.id)} style={{width:22,height:22,borderRadius:6,flexShrink:0,border:`1.5px solid ${t.done?T.accent:T.border}`,cursor:"pointer",background:t.done?T.accent:"transparent",display:"flex",alignItems:"center",justifyContent:"center"}}>
                        {t.done&&<span style={{color:"white",fontSize:11}}>✓</span>}
                      </button>
                      <span style={{flex:1,fontSize:13,color:t.done?T.sub:T.text,textDecoration:t.done?"line-through":"none"}}>{t.text}</span>
                      <button onClick={()=>setTodos(ts=>ts.filter(x=>x.id!==t.id))} style={{background:"none",border:"none",color:T.border,cursor:"pointer",fontSize:16}}>×</button>
                    </div>
                  ))}
                </>}
                {mo.length>0&&<>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8,marginTop:wk.length?12:0}}><span style={{fontSize:9,letterSpacing:3,color:T.accent2}}>MONTHLY</span><div style={{flex:1,height:"1px",background:T.border}}/><span style={{fontSize:9,color:T.sub}}>{mo.filter(t=>t.done).length}/{mo.length}</span></div>
                  {mo.map(t=>(
                    <div key={t.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:`1px solid ${T.border}`}}>
                      <button onClick={()=>toggleTodo(t.id)} style={{width:22,height:22,borderRadius:6,flexShrink:0,border:`1.5px solid ${t.done?T.accent2:T.border}`,cursor:"pointer",background:t.done?T.accent2:"transparent",display:"flex",alignItems:"center",justifyContent:"center"}}>
                        {t.done&&<span style={{color:"white",fontSize:11}}>✓</span>}
                      </button>
                      <span style={{flex:1,fontSize:13,color:t.done?T.sub:T.text,textDecoration:t.done?"line-through":"none"}}>{t.text}</span>
                      <button onClick={()=>setTodos(ts=>ts.filter(x=>x.id!==t.id))} style={{background:"none",border:"none",color:T.border,cursor:"pointer",fontSize:16}}>×</button>
                    </div>
                  ))}
                </>}
                {todos.length===0&&<div style={{textAlign:"center",padding:"12px",color:T.sub,fontSize:12}}>할 일을 추가해보세요</div>}
              </div>
            </div>

            {/* RECENT */}
            <div style={{...LS,marginBottom:10}}>Recent</div>
            {sorted.slice(0,3).map(log=>(
              <div key={log.id} style={{background:T.bgCard,borderRadius:16,border:`1px solid ${T.border}`,padding:"13px",marginBottom:10,cursor:"pointer",display:"flex",gap:12,alignItems:"center"}} onClick={()=>{setViewLog(log);setTab("detail");}}>
                <div style={{width:52,height:52,borderRadius:12,flexShrink:0,overflow:"hidden",background:T.bgMuted,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>
                  {log.photos[0]?<img src={log.photos[0]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:"🌿"}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:11,color:T.sub,letterSpacing:1}}>{fmt(log.date)}</span><span style={{fontSize:15}}>{log.mood}</span></div>
                  <div style={{fontSize:13,color:T.text,marginTop:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{log.memo||"—"}</div>
                  <div style={{display:"flex",gap:4,marginTop:5,flexWrap:"wrap"}}>
                    {log.body.slice(0,3).map(id=>{const it=BODY_ITEMS.find(x=>x.id===id);return it?<span key={id} style={{fontSize:10,background:T.bgMuted,color:T.sub,borderRadius:20,padding:"2px 8px"}}>{it.label}</span>:null;})}
                  </div>
                </div>
              </div>
            ))}

            <button style={{width:"100%",padding:"16px",borderRadius:16,background:T.text,color:"#fff",border:"none",fontSize:13,letterSpacing:3,cursor:"pointer",fontFamily:"inherit",marginTop:4}} onClick={()=>setShowAdd(true)}>
              + 오늘의 기록
            </button>
          </div>
        )}

        {/* ── REWARDS ── */}
        {tab==="rewards"&&(
          <div style={{animation:"slideUp 0.3s ease"}}>
            {/* Sub nav */}
            <div style={{display:"flex",gap:8,margin:"16px 0 14px",background:T.bgCard,borderRadius:14,padding:4,border:`1px solid ${T.border}`}}>
              {[{id:"stamps",l:"スタンプ & アドバイス"},{id:"features",l:"解放機能"}].map(s=>(
                <button key={s.id} onClick={()=>setRewardSub(s.id)} style={{flex:1,padding:"9px",borderRadius:10,border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:11,letterSpacing:1,background:rewardSub===s.id?T.text:"transparent",color:rewardSub===s.id?"#fff":T.sub,transition:"all 0.2s"}}>{s.l}</button>
              ))}
            </div>

            {rewardSub==="stamps"&&(
              <>
                {/* Progress */}
                <div style={{marginBottom:16,padding:"20px",borderRadius:20,background:T.bgCard,border:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div>
                    <div style={{fontSize:9,letterSpacing:4,color:T.sub,textTransform:"uppercase",marginBottom:4}}>Stamps</div>
                    <div style={{fontSize:38,fontWeight:200,color:T.text,lineHeight:1}}>{totalStamps}<span style={{fontSize:14,color:T.sub}}> / {STAMP_REWARDS.length}</span></div>
                    {nextReward&&<div style={{fontSize:11,color:T.accent,marginTop:6}}>あと{nextReward.stamp-totalStamps}回で「{nextReward.title}」解放</div>}
                    {!nextReward&&<div style={{fontSize:11,color:T.green,marginTop:6}}>全アドバイスコンプリート！👑</div>}
                  </div>
                  <svg width={68} height={68} style={{transform:"rotate(-90deg)",flexShrink:0}}>
                    <circle cx={34} cy={34} r={26} fill="none" stroke={T.border} strokeWidth={4}/>
                    <circle cx={34} cy={34} r={26} fill="none" stroke={T.accent} strokeWidth={4}
                      strokeDasharray={2*Math.PI*26} strokeDashoffset={2*Math.PI*26*(1-totalStamps/STAMP_REWARDS.length)}
                      strokeLinecap="round" style={{transition:"stroke-dashoffset 0.6s ease"}}/>
                  </svg>
                </div>

                {/* Grid */}
                <div style={{...LS,marginBottom:10}}>Collection</div>
                <div style={{background:T.bgCard,borderRadius:20,border:`1px solid ${T.border}`,padding:"16px",marginBottom:18}}>
                  <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
                    {STAMP_REWARDS.map((r,i)=>{
                      const unlocked=i<totalStamps;
                      return(
                        <button key={r.stamp} onClick={()=>unlocked&&setOpenReward(openReward===r.stamp?null:r.stamp)} style={{width:44,height:44,borderRadius:11,border:`1.5px solid ${unlocked?T.accent:T.border}`,background:unlocked?T.bgMuted:"transparent",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:unlocked?"pointer":"default",padding:0}}>
                          {unlocked?<span style={{fontSize:18}}>{r.icon}</span>:<span style={{fontSize:11,color:T.border}}>·</span>}
                          <span style={{fontSize:7,color:unlocked?T.sub:"transparent",marginTop:1}}>{r.stamp}</span>
                        </button>
                      );
                    })}
                  </div>
                  {nextReward&&<div style={{marginTop:14,padding:"11px 13px",background:T.bgMuted,borderRadius:12,display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:34,height:34,borderRadius:9,border:`1.5px dashed ${T.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:T.border}}>?</div>
                    <div><div style={{fontSize:11,color:T.sub}}>次のスタンプで解放</div><div style={{fontSize:12,color:T.text,marginTop:2}}>「{nextReward.title}」· {nextReward.tag}</div></div>
                  </div>}
                </div>

                {/* Unlocked advice */}
                {unlockedRewards.length>0&&<>
                  <div style={{...LS,marginBottom:10}}>Advice <span style={{color:T.green,fontWeight:500}}>（全エビデンスベース）</span></div>
                  {[...unlockedRewards].reverse().map(r=>(
                    <div key={r.stamp} style={{background:T.bgCard,borderRadius:16,border:`1px solid ${T.border}`,marginBottom:8,overflow:"hidden",cursor:"pointer"}} onClick={()=>setOpenReward(openReward===r.stamp?null:r.stamp)}>
                      <div style={{padding:"13px 15px",display:"flex",alignItems:"center",gap:11}}>
                        <div style={{width:38,height:38,borderRadius:10,flexShrink:0,background:T.bgMuted,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17}}>{r.icon}</div>
                        <div style={{flex:1}}>
                          <div style={{fontSize:13,color:T.text}}>{r.title}</div>
                          <div style={{display:"flex",gap:6,marginTop:3,alignItems:"center"}}>
                            <span style={{fontSize:9,color:T.sub,letterSpacing:1}}>#{r.stamp} · {r.tag}</span>
                            <span style={{fontSize:9,color:T.accent}}>{r.evidence}</span>
                          </div>
                        </div>
                        <span style={{fontSize:10,color:T.sub}}>{openReward===r.stamp?"▲":"▼"}</span>
                      </div>
                      {openReward===r.stamp&&(
                        <div style={{padding:"0 15px 15px",animation:"fadeIn 0.2s ease"}}>
                          <div style={{padding:"12px 13px",background:T.bgMuted,borderRadius:11,fontSize:12,color:T.sub,lineHeight:1.8,marginBottom:8}}>{r.body}</div>
                          {r.tip&&<div style={{padding:"9px 12px",background:"#f0f8f0",borderRadius:10,fontSize:11,color:T.green,lineHeight:1.7}}>💡 {r.tip}</div>}
                          <div style={{fontSize:9,color:T.border,marginTop:8,letterSpacing:1}}>出典: {r.source}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </>}

                {/* Locked preview */}
                {totalStamps<STAMP_REWARDS.length&&<>
                  <div style={{...LS,margin:"18px 0 10px",opacity:0.5}}>Coming soon</div>
                  {STAMP_REWARDS.filter(r=>r.stamp>totalStamps).slice(0,3).map(r=>(
                    <div key={r.stamp} style={{borderRadius:14,border:`1px solid ${T.border}`,marginBottom:8,padding:"13px 15px",display:"flex",alignItems:"center",gap:11,opacity:0.4}}>
                      <div style={{width:38,height:38,borderRadius:10,border:`1.5px dashed ${T.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:T.border}}>?</div>
                      <div><div style={{fontSize:12,color:T.sub}}>Stamp {r.stamp} · {r.tag}</div><div style={{fontSize:10,color:T.border,marginTop:2,letterSpacing:1}}>locked</div></div>
                    </div>
                  ))}
                </>}
              </>
            )}

            {rewardSub==="features"&&(
              <div>
                <div style={{fontSize:11,color:T.sub,lineHeight:1.7,marginBottom:16}}>
                  記録を続けるほど強力な機能が解放されます。
                </div>

                {/* Condition Graph */}
                <div style={{background:T.bgCard,borderRadius:20,border:`1px solid ${T.border}`,marginBottom:14,overflow:"hidden"}}>
                  <div style={{padding:"16px 18px 12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div><div style={{fontSize:13,color:T.text,fontWeight:500}}>📊 肌コンディショングラフ</div><div style={{fontSize:10,color:T.sub,marginTop:2}}>Stamp {FEATURE_UNLOCKS.graph}で解放 · {featureUnlocked("graph")?"✓ 解放済み":"🔒 "+Math.max(0,FEATURE_UNLOCKS.graph-totalStamps)+"回記録で解放"}</div></div>
                  </div>
                  <div style={{padding:"0 16px 16px"}}>
                    <FeatureLock featureKey="graph"><ConditionGraph logs={logs}/></FeatureLock>
                  </div>
                </div>

                {/* Calendar */}
                <div style={{background:T.bgCard,borderRadius:20,border:`1px solid ${T.border}`,marginBottom:14,overflow:"hidden"}}>
                  <div style={{padding:"16px 18px 12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div><div style={{fontSize:13,color:T.text,fontWeight:500}}>🗓️ カレンダービュー</div><div style={{fontSize:10,color:T.sub,marginTop:2}}>Stamp {FEATURE_UNLOCKS.calendar}で解放 · {featureUnlocked("calendar")?"✓ 解放済み":"🔒 "+Math.max(0,FEATURE_UNLOCKS.calendar-totalStamps)+"回記録で解放"}</div></div>
                  </div>
                  <div style={{padding:"0 16px 16px"}}>
                    <FeatureLock featureKey="calendar">
                      <CalendarView logs={logs} onSelect={l=>{setViewLog(l);setTab("detail");}}/>
                      {calLog&&<div style={{marginTop:8,padding:"10px 12px",background:T.bgMuted,borderRadius:10,fontSize:12,color:T.sub}}>{calLog.mood} {fmt(calLog.date)} — {calLog.memo||"メモなし"}</div>}
                    </FeatureLock>
                  </div>
                </div>

                {/* Before / After */}
                <div style={{background:T.bgCard,borderRadius:20,border:`1px solid ${T.border}`,marginBottom:14,overflow:"hidden"}}>
                  <div style={{padding:"16px 18px 12px"}}>
                    <div style={{fontSize:13,color:T.text,fontWeight:500}}>📸 ビフォーアフター比較</div>
                    <div style={{fontSize:10,color:T.sub,marginTop:2}}>Stamp {FEATURE_UNLOCKS.compare}で解放 · {featureUnlocked("compare")?"✓ 解放済み":"🔒 "+Math.max(0,FEATURE_UNLOCKS.compare-totalStamps)+"回記録で解放"}</div>
                  </div>
                  <div style={{padding:"0 16px 16px"}}>
                    <FeatureLock featureKey="compare"><BeforeAfter logs={logs}/></FeatureLock>
                  </div>
                </div>

                {/* AI */}
                <div style={{background:T.bgCard,borderRadius:20,border:`1px solid ${T.border}`,marginBottom:14,overflow:"hidden"}}>
                  <div style={{padding:"16px 18px 12px"}}>
                    <div style={{fontSize:13,color:T.text,fontWeight:500}}>💬 AIスキンケア診断</div>
                    <div style={{fontSize:10,color:T.sub,marginTop:2}}>Stamp {FEATURE_UNLOCKS.ai}で解放 · {featureUnlocked("ai")?"✓ 解放済み":"🔒 "+Math.max(0,FEATURE_UNLOCKS.ai-totalStamps)+"回記録で解放"}</div>
                  </div>
                  <div style={{padding:"0 16px 16px"}}>
                    <FeatureLock featureKey="ai"><AIDiagnosis logs={logs}/></FeatureLock>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── PHOTOS ── */}
        {tab==="photos"&&(
          <div style={{animation:"slideUp 0.3s ease"}}>
            <div style={{...LS,margin:"20px 0 14px"}}>Photo Timeline</div>
            {sorted.map(log=>(
              <div key={log.id} style={{marginBottom:22}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                  <div style={{fontSize:11,color:T.sub,letterSpacing:1}}>{fmt(log.date)}</div>
                  <span style={{fontSize:14}}>{log.mood}</span>
                  <div style={{display:"flex",gap:3}}>{[1,2,3,4,5].map(n=><div key={n} style={{width:6,height:6,borderRadius:"50%",background:n<=log.condition?T.accent:T.border}}/>)}</div>
                </div>
                {log.photos.length>0
                  ?<div style={{display:"flex",gap:6}}>{log.photos.map((p,i)=><img key={i} src={p} alt="" style={{width:90,height:90,objectFit:"cover",borderRadius:12,border:`1px solid ${T.border}`}}/>)}</div>
                  :<div style={{height:68,borderRadius:12,border:`1px dashed ${T.border}`,display:"flex",alignItems:"center",justifyContent:"center",color:T.border,fontSize:11,letterSpacing:1}}>no photo</div>
                }
                <div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:8}}>{log.body.map(id=>{const it=BODY_ITEMS.find(x=>x.id===id);return it?<span key={id} style={{fontSize:10,background:T.bgMuted,color:T.sub,borderRadius:20,padding:"3px 9px"}}>{it.label}</span>:null;})}</div>
                {log.memo&&<p style={{margin:"6px 0 0",fontSize:12,color:T.sub,lineHeight:1.6}}>{log.memo}</p>}
                <div style={{height:"1px",background:T.border,marginTop:14}}/>
              </div>
            ))}
          </div>
        )}

        {/* ── DIARY ── */}
        {tab==="diary"&&(
          <div style={{animation:"slideUp 0.3s ease"}}>
            <div style={{...LS,margin:"20px 0 14px"}}>All Logs</div>
            {sorted.map(log=>(
              <div key={log.id} style={{background:T.bgCard,borderRadius:16,border:`1px solid ${T.border}`,padding:"15px",marginBottom:10,cursor:"pointer"}} onClick={()=>{setViewLog(log);setTab("detail");}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}><span style={{fontSize:11,color:T.sub,letterSpacing:1}}>{fmt(log.date)}</span><span style={{fontSize:16}}>{log.mood}</span></div>
                {log.photos.length>0&&<div style={{display:"flex",gap:5,marginBottom:10}}>{log.photos.slice(0,4).map((p,i)=><img key={i} src={p} alt="" style={{width:66,height:66,objectFit:"cover",borderRadius:10}}/>)}</div>}
                <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:8}}>
                  {log.body.slice(0,4).map(id=>{const it=BODY_ITEMS.find(x=>x.id===id);return it?<span key={id} style={{fontSize:10,background:T.bgMuted,color:T.sub,borderRadius:20,padding:"3px 9px"}}>{it.label}</span>:null;})}
                  {log.skin.slice(0,2).map(id=>{const it=SKIN_ITEMS.find(x=>x.id===id);return it?<span key={id} style={{fontSize:10,background:T.bgMuted,color:T.sub,borderRadius:20,padding:"3px 9px"}}>{it.label}</span>:null;})}
                </div>
                {log.memo&&<p style={{margin:0,fontSize:12,color:T.sub,lineHeight:1.6}}>{log.memo}</p>}
              </div>
            ))}
          </div>
        )}

        {/* ── DETAIL ── */}
        {tab==="detail"&&viewLog&&(
          <div style={{animation:"slideUp 0.3s ease"}}>
            <button onClick={()=>setTab("diary")} style={{background:"none",border:"none",color:T.sub,fontSize:11,cursor:"pointer",padding:"16px 0 10px",fontFamily:"inherit",letterSpacing:2}}>← back</button>
            <div style={{background:T.bgCard,borderRadius:20,border:`1px solid ${T.border}`,overflow:"hidden"}}>
              {viewLog.photos.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:2,padding:2}}>{viewLog.photos.map((p,i)=><img key={i} src={p} alt="" style={{flex:"1 0 calc(50% - 2px)",maxWidth:"calc(50% - 2px)",height:155,objectFit:"cover",borderRadius:8}}/>)}</div>}
              <div style={{padding:"18px"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}><span style={{fontSize:11,color:T.sub,letterSpacing:1}}>{fmt(viewLog.date)}</span><span style={{fontSize:22}}>{viewLog.mood}</span></div>
                <div style={{display:"flex",gap:4,alignItems:"center",marginBottom:14}}>
                  {[1,2,3,4,5].map(n=><div key={n} style={{width:22,height:22,borderRadius:6,background:n<=viewLog.condition?T.accent:T.bgMuted,border:`1px solid ${n<=viewLog.condition?T.accent:T.border}`}}/>)}
                  <span style={{fontSize:10,color:T.sub,marginLeft:6}}>{COND_LABELS[viewLog.condition]}</span>
                </div>
                {viewLog.body.length>0&&<div style={{marginBottom:14}}><div style={{fontSize:10,color:T.sub,letterSpacing:3,marginBottom:7}}>BODY CARE</div><div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{viewLog.body.map(id=>{const it=BODY_ITEMS.find(x=>x.id===id);return it?<span key={id} style={{fontSize:12,background:T.bgMuted,color:T.text,borderRadius:20,padding:"5px 12px"}}>{it.icon} {it.label}</span>:null;})}</div></div>}
                {viewLog.skin.length>0&&<div style={{marginBottom:14}}><div style={{fontSize:10,color:T.sub,letterSpacing:3,marginBottom:7}}>SKIN CARE</div><div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{viewLog.skin.map(id=>{const it=SKIN_ITEMS.find(x=>x.id===id);return it?<span key={id} style={{fontSize:12,background:T.bgMuted,color:T.text,borderRadius:20,padding:"5px 12px"}}>{it.icon} {it.label}</span>:null;})}</div></div>}
                {viewLog.memo&&<div style={{padding:"12px 14px",background:T.bgMuted,borderRadius:12}}><p style={{margin:0,fontSize:13,color:T.sub,lineHeight:1.75}}>{viewLog.memo}</p></div>}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* NAV */}
      <nav style={{position:"fixed",bottom:0,left:0,right:0,background:"rgba(247,244,240,0.96)",backdropFilter:"blur(12px)",borderTop:`1px solid ${T.border}`,display:"flex",justifyContent:"space-around",padding:"10px 0 10px",zIndex:20}}>
        {[{id:"home",e:"○",l:"홈"},{id:"rewards",e:"◇",l:"리워드"},{id:"photos",e:"□",l:"사진"},{id:"diary",e:"≡",l:"일기"}].map(n=>(
          <button key={n.id} onClick={()=>setTab(n.id)} style={{background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",display:"flex",flexDirection:"column",alignItems:"center",gap:4,color:tab===n.id?T.text:T.sub,minWidth:56,position:"relative"}}>
            <span style={{fontSize:15,fontWeight:tab===n.id?600:300}}>{n.e}</span>
            <span style={{fontSize:9,letterSpacing:2}}>{n.l}</span>
            {tab===n.id&&<div style={{position:"absolute",bottom:-10,width:16,height:2,borderRadius:2,background:T.accent}}/>}
          </button>
        ))}
      </nav>

      {/* ADD LOG MODAL */}
      {showAdd&&(
        <div style={{position:"fixed",inset:0,background:"rgba(26,23,20,0.45)",backdropFilter:"blur(4px)",zIndex:50,overflowY:"auto",display:"flex",alignItems:"flex-end"}}>
          <div style={{background:T.bg,borderRadius:"22px 22px 0 0",width:"100%",maxWidth:480,margin:"0 auto",padding:"22px 18px 50px",maxHeight:"93vh",overflowY:"auto",border:`1px solid ${T.border}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div><div style={{fontSize:9,letterSpacing:4,color:T.sub,textTransform:"uppercase",marginBottom:2}}>New Entry</div><h2 style={{margin:0,fontSize:18,fontWeight:300,color:T.text,letterSpacing:1}}>오늘의 기록</h2></div>
              <button onClick={()=>setShowAdd(false)} style={{background:T.bgMuted,border:"none",width:30,height:30,borderRadius:"50%",cursor:"pointer",fontSize:15,color:T.sub,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
            </div>
            <div style={{marginBottom:16}}><label style={LS}>Date</label><input type="date" value={newLog.date} onChange={e=>setNewLog(l=>({...l,date:e.target.value}))} style={{...IS,width:"auto"}}/></div>
            <div style={{marginBottom:16}}>
              <label style={LS}>Photos</label>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {newLog.photos.map((p,i)=>(
                  <div key={i} style={{position:"relative"}}><img src={p} alt="" style={{width:78,height:78,objectFit:"cover",borderRadius:12,border:`1px solid ${T.border}`}}/><button onClick={()=>setNewLog(l=>({...l,photos:l.photos.filter((_,j)=>j!==i)}))} style={{position:"absolute",top:-6,right:-6,width:20,height:20,borderRadius:"50%",background:T.text,border:"none",color:"white",fontSize:11,cursor:"pointer"}}>×</button></div>
                ))}
                <div onClick={()=>photoRef.current?.click()} style={{width:78,height:78,borderRadius:12,border:`1.5px dashed ${T.border}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",color:T.sub,fontSize:10,gap:3}}>
                  <span style={{fontSize:20}}>+</span><span style={{letterSpacing:1}}>photo</span>
                </div>
                <input ref={photoRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>setNewLog(l=>({...l,photos:[...l.photos,ev.target.result]}));r.readAsDataURL(f);}}/>
              </div>
            </div>
            <div style={{marginBottom:16}}><label style={LS}>Mood</label><div style={{display:"flex",gap:8}}>{MOODS.map(m=><button key={m} onClick={()=>setNewLog(l=>({...l,mood:m}))} style={{fontSize:23,background:newLog.mood===m?T.bgMuted:"none",border:`1.5px solid ${newLog.mood===m?T.accent:T.border}`,borderRadius:10,padding:"5px 7px",cursor:"pointer"}}>{m}</button>)}</div></div>
            <div style={{marginBottom:16}}><label style={LS}>Condition</label><div style={{display:"flex",gap:7,alignItems:"center"}}>{[1,2,3,4,5].map(n=><button key={n} onClick={()=>setNewLog(l=>({...l,condition:n}))} style={{width:34,height:34,borderRadius:8,cursor:"pointer",border:`1.5px solid ${n<=newLog.condition?T.accent:T.border}`,background:n<=newLog.condition?T.accent:"transparent",color:n<=newLog.condition?"white":T.sub,fontWeight:500,fontSize:13,fontFamily:"inherit"}}>{n}</button>)}<span style={{fontSize:11,color:T.sub,marginLeft:4}}>{COND_LABELS[newLog.condition]}</span></div></div>
            <div style={{marginBottom:16}}>
              <label style={{...LS,color:T.accent}}>Body Care</label>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{BODY_ITEMS.map(it=><button key={it.id} onClick={()=>toggleItem("body",it.id)} style={{fontSize:12,borderRadius:20,padding:"7px 12px",cursor:"pointer",fontFamily:"inherit",border:`1.5px solid ${newLog.body.includes(it.id)?T.accent:T.border}`,background:newLog.body.includes(it.id)?T.bgMuted:"transparent",color:newLog.body.includes(it.id)?T.text:T.sub}}>{it.label}</button>)}</div>
            </div>
            <div style={{marginBottom:16}}>
              <label style={LS}>Skin Care</label>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{SKIN_ITEMS.map(it=><button key={it.id} onClick={()=>toggleItem("skin",it.id)} style={{fontSize:12,borderRadius:20,padding:"7px 12px",cursor:"pointer",fontFamily:"inherit",border:`1.5px solid ${newLog.skin.includes(it.id)?T.accent2:T.border}`,background:newLog.skin.includes(it.id)?T.bgMuted:"transparent",color:newLog.skin.includes(it.id)?T.text:T.sub}}>{it.label}</button>)}</div>
            </div>
            <div style={{marginBottom:26}}><label style={LS}>Memo</label><textarea value={newLog.memo} onChange={e=>setNewLog(l=>({...l,memo:e.target.value}))} placeholder="오늘의 컨디션을 기록해요..." style={{...IS,resize:"none",lineHeight:1.7}} rows={3}/></div>
            <button style={{width:"100%",padding:"15px",borderRadius:14,background:T.text,color:"#fff",border:"none",fontSize:13,letterSpacing:3,cursor:"pointer",fontFamily:"inherit"}} onClick={saveLog}>저장하기</button>
          </div>
        </div>
      )}

      {/* ADD TODO */}
      {showTodoAdd&&(
        <div style={{position:"fixed",inset:0,background:"rgba(26,23,20,0.45)",backdropFilter:"blur(4px)",zIndex:50,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
          <div style={{background:T.bg,borderRadius:20,border:`1px solid ${T.border}`,width:"100%",maxWidth:380,padding:"26px 20px",animation:"popIn 0.3s ease"}}>
            <h3 style={{margin:"0 0 16px",fontSize:16,fontWeight:300,letterSpacing:2,color:T.text}}>Add To Do</h3>
            <div style={{display:"flex",gap:8,marginBottom:14}}>{["weekly","monthly"].map(type=><button key={type} onClick={()=>setNewTodoType(type)} style={{flex:1,padding:"10px",borderRadius:10,cursor:"pointer",fontFamily:"inherit",border:`1.5px solid ${newTodoType===type?T.accent:T.border}`,background:newTodoType===type?T.bgMuted:"transparent",color:newTodoType===type?T.text:T.sub,fontSize:12,letterSpacing:1}}>{type==="weekly"?"Weekly":"Monthly"}</button>)}</div>
            <input value={newTodoText} onChange={e=>setNewTodoText(e.target.value)} placeholder="예: 주 3회 스크럽..." style={{...IS,marginBottom:14}}/>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setShowTodoAdd(false)} style={{flex:1,padding:"12px",borderRadius:12,background:"none",border:`1px solid ${T.border}`,color:T.sub,cursor:"pointer",fontFamily:"inherit",fontSize:12,letterSpacing:1}}>cancel</button>
              <button style={{flex:2,padding:"12px",borderRadius:12,background:T.text,border:"none",color:"#fff",cursor:"pointer",fontFamily:"inherit",fontSize:12,letterSpacing:2}} onClick={()=>{if(!newTodoText.trim())return;setTodos(ts=>[...ts,{id:Date.now(),type:newTodoType,text:newTodoText.trim(),done:false}]);setNewTodoText("");setShowTodoAdd(false);}}>추가</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
