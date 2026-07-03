// 圖例要顯示哪些隊伍（顏色定義在 styles.css）
const TEAM_NAMES = ["樂天女孩", "洋基女孩", "桃氣女孩", "其他"];

// 找不到 events.json 時的備用範例（本機直接打開檔案時會看到這些）
const FALLBACK_EVENTS = [
  { date:"2026-07-04", team:"樂天女孩", title:"主場應援", time:"17:05",
    venue:"樂天桃園棒球場", address:"桃園市中壢區領航北路一段1號",
    members:"穎樂", note:"" },
  { date:"2026-07-11", team:"桃氣女孩", title:"主場應援", time:"17:00",
    venue:"中原大學體育館", address:"桃園市中壢區中北路200號",
    members:"穎樂", note:"" },
  { date:"2026-07-18", team:"其他", title:"見面會", time:"14:00",
    venue:"三創生活園區", address:"台北市中正區市民大道三段2號",
    members:"穎樂", note:"憑票入場" }
];

let events = [];
let year, month; // month 是 0-indexed

const WEEKDAYS = ["日","一","二","三","四","五","六"];
const pad = n => String(n).padStart(2,"0");
const keyOf = (y,m,d) => `${y}-${pad(m+1)}-${pad(d)}`;

function render(){
  document.getElementById("monthLabel").textContent = `${year} 年 ${month+1} 月`;
  const grid = document.getElementById("grid");
  grid.innerHTML = "";

  const startDow = new Date(year, month, 1).getDay();
  const days = new Date(year, month+1, 0).getDate();
  const today = new Date();
  const isThisMonth = today.getFullYear()===year && today.getMonth()===month;

  for(let i=0;i<startDow;i++){
    const c=document.createElement("div");
    c.className="cell empty"; grid.appendChild(c);
  }
  for(let d=1;d<=days;d++){
    const c=document.createElement("div");
    c.className="cell"+(isThisMonth && today.getDate()===d ? " today":"");
    const num=document.createElement("div");
    num.className="num"; num.textContent=d; c.appendChild(num);

    events.filter(e=>e.date===keyOf(year,month,d)).forEach(e=>{
      const b=document.createElement("button");
      b.className="chip";
      b.dataset.team=e.team;          // 顏色交給 CSS 的 [data-team] 決定
      b.textContent=e.title;
      b.onclick=()=>openTicket(e);
      c.appendChild(b);
    });
    grid.appendChild(c);
  }
}

function openTicket(e){
  const dow=WEEKDAYS[new Date(e.date+"T00:00:00").getDay()];
  const maps="https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(e.address||e.venue);
  const rows=[
    ["時間", e.time||"未定"],
    ["地點", e.venue],
    ["地址", e.address],
    ["出勤", e.members],
    ["備註", e.note]
  ].filter(r=>r[1]);

  document.getElementById("ticket").innerHTML = `
    <div class="band" data-team="${e.team}">
      <div class="date">${e.date}（${dow}）</div>
      <div class="title">${e.title}</div>
    </div>
    <div class="tear"></div>
    <div class="body">
      ${rows.map(r=>`<div class="row"><div class="k">${r[0]}</div><div class="v">${r[1]}</div></div>`).join("")}
      <a class="mapbtn" href="${maps}" target="_blank" rel="noreferrer">📍 在 Google Maps 開啟</a>
      <button class="closebtn" onclick="closeTicket()">關閉</button>
    </div>`;
  document.getElementById("overlay").classList.add("open");
}
function closeTicket(){ document.getElementById("overlay").classList.remove("open"); }
document.getElementById("overlay").addEventListener("click", ev=>{
  if(ev.target.id==="overlay") closeTicket();
});

function renderLegend(){
  document.getElementById("legend").innerHTML = TEAM_NAMES
    .map(n=>`<span><i class="dot" data-team="${n}"></i>${n}</span>`)
    .join("");
}

function nav(dir){
  month+=dir;
  if(month<0){month=11;year--;}
  if(month>11){month=0;year++;}
  render();
}
document.getElementById("prev").onclick=()=>nav(-1);
document.getElementById("next").onclick=()=>nav(1);

// ── 載入 events.json ─────────────────────────
async function init(){
  const now=new Date();
  year=now.getFullYear(); month=now.getMonth();
  try{
    const res=await fetch("events.json?t="+Date.now()); // 避免快取
    if(!res.ok) throw new Error();
    events=await res.json();
  }catch{
    events=FALLBACK_EVENTS; // 本機直接開檔案或還沒放 events.json 時
  }
  renderLegend();
  render();
}
init();
