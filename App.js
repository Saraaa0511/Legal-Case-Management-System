// Legal Case Management System — Full React App
// Replace src/App.js content with this entire file, then: npm start

import { useState, useEffect } from "react";

const API = "http://localhost:5000/api";




const C = {
  navy:"#1e3a5f",navyLight:"#2a4f7c",blue:"#2563eb",blueLight:"#eff6ff",
  teal:"#0f766e",tealLight:"#f0fdfa",amber:"#b45309",amberLight:"#fffbeb",
  red:"#dc2626",redLight:"#fef2f2",green:"#15803d",greenLight:"#f0fdf4",
  gray:"#6b7280",grayLight:"#f9fafb",border:"#e5e7eb",white:"#ffffff",
  text:"#111827",textMuted:"#6b7280",
};

const card       = { background:C.white, border:`1px solid ${C.border}`, borderRadius:10, padding:"20px 24px", marginBottom:20 };
const secTitle   = { fontSize:17, fontWeight:600, color:C.text, marginBottom:16, paddingBottom:10, borderBottom:`1px solid ${C.border}` };
const lbl        = { display:"block", fontSize:13, fontWeight:500, color:C.textMuted, marginBottom:5 };
const inp        = { width:"100%", padding:"9px 12px", border:`1px solid ${C.border}`, borderRadius:7, fontSize:14, color:C.text, background:C.white, boxSizing:"border-box", outline:"none" };
const sel        = { ...inp };
const primaryBtn = { padding:"9px 20px", background:C.navy, color:C.white, border:"none", borderRadius:7, fontSize:14, fontWeight:500, cursor:"pointer" };
const dangerBtn  = { ...primaryBtn, background:C.red, padding:"5px 12px", fontSize:12 };
const successMsg = { background:C.greenLight, color:C.green, border:`1px solid #bbf7d0`, borderRadius:7, padding:"10px 14px", fontSize:13, marginBottom:14 };
const grid2      = { display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:16 };
const TH         = { background:C.grayLight, padding:"10px 14px", fontSize:12, fontWeight:600, color:C.textMuted, textAlign:"left", textTransform:"uppercase", letterSpacing:"0.05em", borderBottom:`1px solid ${C.border}` };
const TD         = { padding:"11px 14px", fontSize:14, color:C.text, borderBottom:`1px solid ${C.border}`, verticalAlign:"middle" };

function Badge({ status }) {
  const m = { Open:{bg:C.blueLight,color:C.blue}, Closed:{bg:C.redLight,color:C.red}, Pending:{bg:C.amberLight,color:C.amber} };
  const s = m[status] || m.Pending;
  return <span style={{background:s.bg,color:s.color,border:`1px solid ${s.color}33`,borderRadius:20,padding:"3px 10px",fontSize:12,fontWeight:600}}>{status}</span>;
}

function Avatar({ name, size=34 }) {
  const initials = name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
  const colors = ["#2563eb","#0f766e","#7c3aed","#b45309","#dc2626","#0369a1"];
  return <div style={{width:size,height:size,borderRadius:"50%",background:colors[name.charCodeAt(0)%colors.length],color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.35,fontWeight:600,flexShrink:0}}>{initials}</div>;
}

function Empty({ text }) {
  return <div style={{textAlign:"center",padding:"32px 0",color:C.textMuted,fontSize:14}}>No {text} yet.</div>;
}

const CLIENTS_INIT = [
  {id:1,name:"Aashi Sharma", address:"Pune, MH",   email:"aashi@gmail.com", phone:"9876543210"},
  {id:2,name:"Riya Mehta",   address:"Mumbai, MH", email:"riya@gmail.com",  phone:"9123456780"},
  {id:3,name:"Arjun Patel",  address:"Nagpur, MH", email:"arjun@gmail.com", phone:"9988776655"},
];

const LAWYERS_INIT = [
  {id:1,name:"Mr. R. Sharma",specialization:"Criminal Law", email:"sharma@lawfirm.com",phone:"9871111111",experience:"12 yrs"},
  {id:2,name:"Ms. S. Iyer",  specialization:"Civil Law",    email:"iyer@lawfirm.com",  phone:"9872222222",experience:"8 yrs"},
  {id:3,name:"Mr. V. Desai", specialization:"Family Law",   email:"desai@lawfirm.com", phone:"9873333333",experience:"15 yrs"},
  {id:4,name:"Ms. P. Joshi", specialization:"Corporate Law",email:"joshi@lawfirm.com", phone:"9874444444",experience:"6 yrs"},
];

const CASES_INIT = [
  {id:1,type:"Criminal", filingDate:"2026-01-10",status:"Open",   clientId:1,description:"Assault — FIR filed at Pune station"},
  {id:2,type:"Civil",    filingDate:"2026-02-15",status:"Closed", clientId:2,description:"Property boundary dispute"},
  {id:3,type:"Family",   filingDate:"2026-03-01",status:"Pending",clientId:3,description:"Custody hearing for minor child"},
];

const ASSIGN_INIT = [{caseId:1,lawyerId:1},{caseId:2,lawyerId:2},{caseId:3,lawyerId:3}];

const HEARINGS_INIT = [
  {id:1,caseId:1,date:"2026-04-20",time:"10:00",location:"Pune District Court, Room 3",  judge:"Hon. D. Kulkarni",notes:"First hearing"},
  {id:2,caseId:2,date:"2026-04-25",time:"12:00",location:"Mumbai High Court, Bench 7",   judge:"Hon. S. Mehta",   notes:"Final arguments"},
  {id:3,caseId:3,date:"2026-05-01",time:"11:00",location:"Nagpur Family Court",          judge:"Hon. P. Rao",     notes:"Custody review"},
];

// ── DASHBOARD ─────────────────────────────────────────────────
function Dashboard({ clients, cases, lawyers, hearings, assignments, setPage }) {
  const today    = new Date().toISOString().split("T")[0];
  const upcoming = [...hearings].filter(h=>h.date>=today).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,3);
  const getClient  = id => clients.find(c=>c.id===id);
  const getLawyers = caseId => assignments.filter(a=>a.caseId===caseId).map(a=>lawyers.find(l=>l.id===a.lawyerId)).filter(Boolean);
  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const stats = [
    {label:"Total clients",value:clients.length,   color:C.navy,  bg:"#eef2ff"},
    {label:"Total cases",  value:cases.length,      color:C.blue,  bg:C.blueLight},
    {label:"Open cases",   value:cases.filter(c=>c.status==="Open").length,    color:C.green, bg:C.greenLight},
    {label:"Pending",      value:cases.filter(c=>c.status==="Pending").length, color:C.amber, bg:C.amberLight},
  ];

  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:20}}>
        {stats.map(s=>(
          <div key={s.label} style={{background:s.bg,border:`1px solid ${s.color}22`,borderRadius:10,padding:"16px 18px"}}>
            <div style={{fontSize:28,fontWeight:700,color:s.color}}>{s.value}</div>
            <div style={{fontSize:13,color:C.textMuted,marginTop:2}}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <div style={card}>
          <div style={secTitle}>Recent cases</div>
          {[...cases].reverse().slice(0,3).map(c=>{
            const client = getClient(c.clientId);
            const cLawyers = getLawyers(c.id);
            return (
              <div key={c.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:`1px solid ${C.border}`}}>
                <Avatar name={client?.name||"?"} size={36}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:14,fontWeight:500,color:C.text}}>{client?.name}</div>
                  <div style={{fontSize:12,color:C.textMuted}}>{c.type} · {c.filingDate}</div>
                  {cLawyers.length>0 && <div style={{fontSize:12,color:C.teal}}>{cLawyers.map(l=>l.name).join(", ")}</div>}
                </div>
                <Badge status={c.status}/>
              </div>
            );
          })}
          <button style={{...primaryBtn,marginTop:14,width:"100%",textAlign:"center"}} onClick={()=>setPage("cases")}>View all cases</button>
        </div>
        <div style={card}>
          <div style={secTitle}>Upcoming hearings</div>
          {upcoming.length===0 && <Empty text="upcoming hearings"/>}
          {upcoming.map(h=>{
            const c = cases.find(c=>c.id===h.caseId);
            const client = c ? getClient(c.clientId) : null;
            const parts = h.date.split("-");
            return (
              <div key={h.id} style={{display:"flex",gap:14,padding:"10px 0",borderBottom:`1px solid ${C.border}`}}>
                <div style={{background:C.blueLight,borderRadius:8,padding:"8px 12px",textAlign:"center",minWidth:48}}>
                  <div style={{fontSize:18,fontWeight:700,color:C.blue,lineHeight:1}}>{parts[2]}</div>
                  <div style={{fontSize:11,color:C.blue,marginTop:2}}>{MONTHS[parseInt(parts[1])-1]}</div>
                </div>
                <div>
                  <div style={{fontSize:14,fontWeight:500,color:C.text}}>{client?.name} — {c?.type}</div>
                  <div style={{fontSize:12,color:C.textMuted}}>{h.time} · {h.location}</div>
                  <div style={{fontSize:12,color:C.textMuted}}>{h.judge}</div>
                </div>
              </div>
            );
          })}
          <button style={{...primaryBtn,marginTop:14,width:"100%",textAlign:"center"}} onClick={()=>setPage("hearings")}>Manage hearings</button>
        </div>
      </div>
    </div>
  );
}

// ── CLIENTS ───────────────────────────────────────────────────
function ClientsPage({ clients, setClients, cases }) {
  const [form,setForm] = useState({name:"",address:"",email:"",phone:""});
  const [msg,setMsg]   = useState("");
  const set = e => setForm(f=>({...f,[e.target.name]:e.target.value}));
  const submit = () => {
    if (!form.name.trim()||!form.email.trim()) return alert("Name and email are required.");
    setClients(c=>[...c,{id:Date.now(),...form}]);
    setForm({name:"",address:"",email:"",phone:""});
    setMsg("Client registered."); setTimeout(()=>setMsg(""),3000);
  };
  return (
    <div>
      <div style={card}>
        <div style={secTitle}>Register new client</div>
        {msg && <div style={successMsg}>{msg}</div>}
        <div style={grid2}>
          <div><label style={lbl}>Full name *</label><input style={inp} name="name"    value={form.name}    onChange={set} placeholder="e.g. Priya Singh"/></div>
          <div><label style={lbl}>Email *</label>    <input style={inp} name="email"   value={form.email}   onChange={set} placeholder="email@example.com"/></div>
          <div><label style={lbl}>Address</label>    <input style={inp} name="address" value={form.address} onChange={set} placeholder="City, State"/></div>
          <div><label style={lbl}>Phone</label>      <input style={inp} name="phone"   value={form.phone}   onChange={set} placeholder="10-digit number"/></div>
        </div>
        <button style={primaryBtn} onClick={submit}>+ Register client</button>
      </div>
      <div style={card}>
        <div style={secTitle}>All clients ({clients.length})</div>
        {clients.length===0 && <Empty text="clients"/>}
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr><th style={TH}>Client</th><th style={TH}>Email</th><th style={TH}>Phone</th><th style={TH}>Address</th><th style={TH}>Cases</th></tr></thead>
            <tbody>{clients.map(c=>(
              <tr key={c.id}>
                <td style={TD}><div style={{display:"flex",alignItems:"center",gap:10}}><Avatar name={c.name} size={30}/><span style={{fontWeight:500}}>{c.name}</span></div></td>
                <td style={{...TD,color:C.blue}}>{c.email}</td>
                <td style={TD}>{c.phone}</td>
                <td style={TD}>{c.address}</td>
                <td style={TD}>
                  <span style={{background:C.blueLight,color:C.blue,borderRadius:20,padding:"2px 10px",fontSize:12,fontWeight:600}}>
                    {cases.filter(x=>x.clientId===c.id).length} case(s)
                  </span>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── CASES + LAWYER ASSIGNMENT ─────────────────────────────────
function CasesPage({ cases, setCases, clients, lawyers, assignments, setAssignments }) {
  const [form,setForm]   = useState({type:"Criminal",filingDate:"",clientId:"",description:""});
  const [msg,setMsg]     = useState("");
  const [aForm,setAForm] = useState({caseId:"",lawyerId:""});
  const [aMsg,setAMsg]   = useState("");
  const [filter,setFilter] = useState("All");

  const set  = e => setForm(f=>({...f,[e.target.name]:e.target.value}));
  const aSet = e => setAForm(f=>({...f,[e.target.name]:e.target.value}));

  const submit = () => {
    if (!form.filingDate||!form.clientId) return alert("Filing date and client required.");
    setCases(c=>[...c,{id:Date.now(),type:form.type,filingDate:form.filingDate,status:"Open",clientId:parseInt(form.clientId),description:form.description}]);
    setForm({type:"Criminal",filingDate:"",clientId:"",description:""});
    setMsg("Case filed."); setTimeout(()=>setMsg(""),3000);
  };

  const doAssign = () => {
    const cId=parseInt(aForm.caseId), lId=parseInt(aForm.lawyerId);
    if (!cId||!lId) return alert("Select both a case and a lawyer.");
    if (assignments.find(a=>a.caseId===cId&&a.lawyerId===lId)) return alert("Already assigned.");
    setAssignments(a=>[...a,{caseId:cId,lawyerId:lId}]);
    setAMsg("Lawyer assigned."); setTimeout(()=>setAMsg(""),2500);
  };

  const unassign = (caseId,lawyerId) =>
    setAssignments(a=>a.filter(x=>!(x.caseId===caseId&&x.lawyerId===lawyerId)));

  const updateStatus = (id,status) => setCases(c=>c.map(x=>x.id===id?{...x,status}:x));
  const getClient    = id => clients.find(c=>c.id===id);
  const getLawyers   = caseId => assignments.filter(a=>a.caseId===caseId).map(a=>lawyers.find(l=>l.id===a.lawyerId)).filter(Boolean);
  const filtered     = filter==="All" ? cases : cases.filter(c=>c.status===filter);

  return (
    <div>
      {/* File case */}
      <div style={card}>
        <div style={secTitle}>File a new case</div>
        {msg && <div style={successMsg}>{msg}</div>}
        <div style={grid2}>
          <div>
            <label style={lbl}>Case type</label>
            <select style={sel} name="type" value={form.type} onChange={set}>
              {["Criminal","Civil","Family","Corporate","Property","Labour"].map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
          <div><label style={lbl}>Filing date *</label><input style={inp} type="date" name="filingDate" value={form.filingDate} onChange={set}/></div>
          <div>
            <label style={lbl}>Client *</label>
            <select style={sel} name="clientId" value={form.clientId} onChange={set}>
              <option value="">— Select client —</option>
              {clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div><label style={lbl}>Description</label><input style={inp} name="description" value={form.description} onChange={set} placeholder="Brief case summary..."/></div>
        </div>
        <button style={primaryBtn} onClick={submit}>+ File case</button>
      </div>

      {/* Assign lawyer */}
      <div style={{...card,borderLeft:`4px solid ${C.teal}`,borderRadius:"0 10px 10px 0"}}>
        <div style={secTitle}>Assign lawyer to a case</div>
        {aMsg && <div style={successMsg}>{aMsg}</div>}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr auto",gap:12,alignItems:"flex-end"}}>
          <div>
            <label style={lbl}>Select case</label>
            <select style={sel} name="caseId" value={aForm.caseId} onChange={aSet}>
              <option value="">— Pick a case —</option>
              {cases.map(c=>{
                const cl=getClient(c.clientId);
                return <option key={c.id} value={c.id}>#{c.id} · {c.type} · {cl?.name||"Unknown"}</option>;
              })}
            </select>
          </div>
          <div>
            <label style={lbl}>Select lawyer</label>
            <select style={sel} name="lawyerId" value={aForm.lawyerId} onChange={aSet}>
              <option value="">— Pick a lawyer —</option>
              {lawyers.map(l=><option key={l.id} value={l.id}>{l.name} — {l.specialization}</option>)}
            </select>
          </div>
          <button style={{...primaryBtn,background:C.teal}} onClick={doAssign}>Assign</button>
        </div>
      </div>

      {/* Case list */}
      <div style={card}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{...secTitle,marginBottom:0,paddingBottom:0,border:"none"}}>All cases ({cases.length})</div>
          <div style={{display:"flex",gap:6}}>
            {["All","Open","Pending","Closed"].map(f=>(
              <button key={f} onClick={()=>setFilter(f)} style={{padding:"5px 14px",borderRadius:20,fontSize:13,cursor:"pointer",border:`1px solid ${f===filter?C.navy:C.border}`,background:f===filter?C.navy:C.white,color:f===filter?C.white:C.textMuted}}>{f}</button>
            ))}
          </div>
        </div>
        {filtered.length===0 && <Empty text="cases"/>}
        {filtered.map(c=>{
          const client    = getClient(c.clientId);
          const cLawyers  = getLawyers(c.id);
          return (
            <div key={c.id} style={{border:`1px solid ${C.border}`,borderRadius:8,padding:"14px 16px",marginBottom:10,display:"flex",gap:14,alignItems:"flex-start"}}>
              <Avatar name={client?.name||"?"} size={40}/>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
                  <span style={{fontWeight:600,fontSize:15}}>{client?.name||"Unknown"}</span>
                  <span style={{fontSize:12,color:C.textMuted}}>#{c.id}</span>
                  <Badge status={c.status}/>
                </div>
                <div style={{fontSize:13,color:C.textMuted,marginBottom:6}}>{c.type} · Filed {c.filingDate}</div>
                {c.description && <div style={{fontSize:13,color:C.text,marginBottom:8}}>{c.description}</div>}
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {cLawyers.map(l=>(
                    <span key={l.id} style={{background:C.tealLight,color:C.teal,border:`1px solid #99f6e4`,borderRadius:20,padding:"2px 10px 2px 12px",fontSize:12,fontWeight:500,display:"inline-flex",alignItems:"center",gap:6}}>
                      {l.name}
                      <span onClick={()=>unassign(c.id,l.id)} style={{cursor:"pointer",fontWeight:700,fontSize:14}}>×</span>
                    </span>
                  ))}
                  {cLawyers.length===0 && <span style={{fontSize:12,color:C.amber,background:C.amberLight,padding:"2px 10px",borderRadius:20}}>No lawyer assigned</span>}
                </div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:6,alignItems:"flex-end"}}>
                {c.status!=="Closed"  && <button style={{...dangerBtn}} onClick={()=>updateStatus(c.id,"Closed")}>Close</button>}
                {c.status==="Open"    && <button style={{...dangerBtn,background:C.amber}} onClick={()=>updateStatus(c.id,"Pending")}>Pending</button>}
                {c.status==="Closed"  && <button style={{...dangerBtn,background:C.green}} onClick={()=>updateStatus(c.id,"Open")}>Reopen</button>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── LAWYERS ───────────────────────────────────────────────────
function LawyersPage({ lawyers, cases, assignments }) {
  const specColor = {"Criminal Law":{bg:C.redLight,color:C.red},"Civil Law":{bg:C.blueLight,color:C.blue},"Family Law":{bg:"#fdf4ff",color:"#7c3aed"},"Corporate Law":{bg:C.amberLight,color:C.amber}};
  return (
    <div style={card}>
      <div style={secTitle}>Legal team ({lawyers.length})</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:14}}>
        {lawyers.map(l=>{
          const sc = specColor[l.specialization]||{bg:C.grayLight,color:C.gray};
          const total  = assignments.filter(a=>a.lawyerId===l.id).length;
          const active = assignments.filter(a=>a.lawyerId===l.id).map(a=>cases.find(c=>c.id===a.caseId)).filter(c=>c&&c.status!=="Closed").length;
          return (
            <div key={l.id} style={{border:`1px solid ${C.border}`,borderRadius:10,padding:16}}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                <Avatar name={l.name} size={44}/>
                <div>
                  <div style={{fontWeight:600,fontSize:15,marginBottom:4}}>{l.name}</div>
                  <span style={{...sc,borderRadius:20,padding:"2px 10px",fontSize:12,fontWeight:500}}>{l.specialization}</span>
                </div>
              </div>
              <div style={{fontSize:13,color:C.textMuted,lineHeight:1.9}}>
                <div>{l.email}</div>
                <div>{l.phone} · {l.experience} experience</div>
              </div>
              <div style={{marginTop:10,display:"flex",gap:8}}>
                <span style={{background:C.blueLight,color:C.blue,borderRadius:20,padding:"3px 10px",fontSize:12,fontWeight:600}}>{total} total</span>
                {active>0 && <span style={{background:C.greenLight,color:C.green,borderRadius:20,padding:"3px 10px",fontSize:12,fontWeight:600}}>{active} active</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── HEARINGS ──────────────────────────────────────────────────
function HearingsPage({ hearings, setHearings, cases, clients }) {
  const empty0 = {caseId:"",date:"",time:"",location:"",judge:"",notes:""};
  const [form,setForm] = useState(empty0);
  const [msg,setMsg]   = useState("");
  const set = e => setForm(f=>({...f,[e.target.name]:e.target.value}));

  const submit = () => {
    if (!form.caseId||!form.date||!form.location) return alert("Case, date, and location are required.");
    setHearings(h=>[...h,{id:Date.now(),...form,caseId:parseInt(form.caseId)}]);
    setForm(empty0);
    setMsg("Hearing scheduled."); setTimeout(()=>setMsg(""),3000);
  };

  const remove = id => { if(window.confirm("Remove this hearing?")) setHearings(h=>h.filter(x=>x.id!==id)); };

  const today = new Date().toISOString().split("T")[0];
  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const getClient = caseId => { const c=cases.find(c=>c.id===caseId); return c?clients.find(cl=>cl.id===c.clientId):null; };
  const getCase   = id => cases.find(c=>c.id===id);

  const sorted   = [...hearings].sort((a,b)=>a.date.localeCompare(b.date));
  const upcoming = sorted.filter(h=>h.date>=today);
  const past     = sorted.filter(h=>h.date<today).reverse();

  const HearingCard = ({h}) => {
    const c=getCase(h.caseId), client=getClient(h.caseId), isPast=h.date<today;
    const parts=h.date.split("-");
    return (
      <div style={{border:`1px solid ${C.border}`,borderRadius:8,padding:"14px 16px",marginBottom:10,borderLeft:`3px solid ${isPast?C.gray:C.blue}`,opacity:isPast?0.8:1}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div style={{display:"flex",gap:14}}>
            <div style={{background:isPast?C.grayLight:C.blueLight,color:isPast?C.gray:C.blue,borderRadius:8,padding:"8px 12px",textAlign:"center",minWidth:52}}>
              <div style={{fontSize:20,fontWeight:700,lineHeight:1}}>{parts[2]}</div>
              <div style={{fontSize:11}}>{MONTHS[parseInt(parts[1])-1]}</div>
            </div>
            <div>
              <div style={{fontWeight:600,fontSize:15,marginBottom:3}}>{client?.name||"Unknown"} — {c?.type||"Case"}</div>
              <div style={{fontSize:13,color:C.textMuted}}>{h.time && `${h.time} · `}{h.location}</div>
              {h.judge && <div style={{fontSize:13,color:C.textMuted}}>{h.judge}</div>}
              {h.notes && <div style={{fontSize:13,color:C.text,marginTop:4}}>{h.notes}</div>}
            </div>
          </div>
          {!isPast && <button style={dangerBtn} onClick={()=>remove(h.id)}>Remove</button>}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div style={card}>
        <div style={secTitle}>Schedule a court hearing</div>
        {msg && <div style={successMsg}>{msg}</div>}
        <div style={grid2}>
          <div>
            <label style={lbl}>Case *</label>
            <select style={sel} name="caseId" value={form.caseId} onChange={set}>
              <option value="">— Select a case —</option>
              {cases.map(c=>{
                const cl=clients.find(cl=>cl.id===c.clientId);
                return <option key={c.id} value={c.id}>#{c.id} · {c.type} · {cl?.name||"Unknown"}</option>;
              })}
            </select>
          </div>
          <div><label style={lbl}>Date *</label><input style={inp} type="date" name="date" value={form.date} onChange={set}/></div>
          <div><label style={lbl}>Time</label><input style={inp} type="time" name="time" value={form.time} onChange={set}/></div>
          <div><label style={lbl}>Court location *</label><input style={inp} name="location" value={form.location} onChange={set} placeholder="e.g. Pune District Court, Room 3"/></div>
          <div><label style={lbl}>Presiding judge</label><input style={inp} name="judge" value={form.judge} onChange={set} placeholder="e.g. Hon. D. Kulkarni"/></div>
          <div><label style={lbl}>Notes</label><input style={inp} name="notes" value={form.notes} onChange={set} placeholder="e.g. Bring original documents"/></div>
        </div>
        <button style={primaryBtn} onClick={submit}>+ Schedule hearing</button>
      </div>
      <div style={card}>
        <div style={secTitle}>Upcoming hearings ({upcoming.length})</div>
        {upcoming.length===0 && <Empty text="upcoming hearings"/>}
        {upcoming.map(h=><HearingCard key={h.id} h={h}/>)}
      </div>
      {past.length>0 && (
        <div style={card}>
          <div style={secTitle}>Past hearings ({past.length})</div>
          {past.map(h=><HearingCard key={h.id} h={h}/>)}
        </div>
      )}
    </div>
  );
}

// ── EVIDENCE ──────────────────────────────────────────────────
function EvidencePage({ cases, clients }) {
  const empty0 = {caseId:"",type:"Document",description:"",submittedBy:""};
  const [form,setForm]       = useState(empty0);
  const [evidence,setEvidence] = useState([
    {id:1,caseId:1,type:"Document",description:"FIR copy filed at Pune station",submittedBy:"Police", date:"2026-01-12"},
    {id:2,caseId:1,type:"Photo",   description:"Accident scene photographs",    submittedBy:"Client", date:"2026-01-14"},
    {id:3,caseId:2,type:"Document",description:"Property agreement papers",      submittedBy:"Lawyer", date:"2026-02-18"},
  ]);
  const [msg,setMsg] = useState("");
  const set = e => setForm(f=>({...f,[e.target.name]:e.target.value}));
  const submit = () => {
    if (!form.caseId||!form.description) return alert("Case and description required.");
    setEvidence(e=>[...e,{id:Date.now(),...form,caseId:parseInt(form.caseId),date:new Date().toISOString().split("T")[0]}]);
    setForm(empty0); setMsg("Evidence logged."); setTimeout(()=>setMsg(""),3000);
  };
  const getClient = caseId => { const c=cases.find(c=>c.id===caseId); return c?clients.find(cl=>cl.id===c.clientId):null; };
  const tColor    = {Document:C.blue,Photo:C.teal,Video:C.red,Physical:C.amber,Digital:"#7c3aed"};

  return (
    <div>
      <div style={card}>
        <div style={secTitle}>Log new evidence</div>
        {msg && <div style={successMsg}>{msg}</div>}
        <div style={grid2}>
          <div>
            <label style={lbl}>Case *</label>
            <select style={sel} name="caseId" value={form.caseId} onChange={set}>
              <option value="">— Select case —</option>
              {cases.map(c=>{const cl=clients.find(cl=>cl.id===c.clientId);return <option key={c.id} value={c.id}>#{c.id} · {c.type} · {cl?.name}</option>;})}
            </select>
          </div>
          <div>
            <label style={lbl}>Type</label>
            <select style={sel} name="type" value={form.type} onChange={set}>
              {["Document","Photo","Video","Physical","Digital"].map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
          <div><label style={lbl}>Description *</label><input style={inp} name="description" value={form.description} onChange={set} placeholder="Brief description of the evidence"/></div>
          <div><label style={lbl}>Submitted by</label><input style={inp} name="submittedBy" value={form.submittedBy} onChange={set} placeholder="e.g. Client, Police, Lawyer"/></div>
        </div>
        <button style={primaryBtn} onClick={submit}>+ Log evidence</button>
      </div>
      <div style={card}>
        <div style={secTitle}>Evidence log ({evidence.length} items)</div>
        {evidence.length===0 && <Empty text="evidence"/>}
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr><th style={TH}>Type</th><th style={TH}>Client / Case</th><th style={TH}>Description</th><th style={TH}>Submitted by</th><th style={TH}>Date</th></tr></thead>
            <tbody>{evidence.map(e=>{
              const client=getClient(e.caseId), tc=tColor[e.type]||C.gray;
              return (
                <tr key={e.id}>
                  <td style={TD}><span style={{background:tc+"18",color:tc,borderRadius:20,padding:"2px 10px",fontSize:12,fontWeight:600}}>{e.type}</span></td>
                  <td style={TD}><div style={{fontWeight:500}}>{client?.name||"Unknown"}</div><div style={{fontSize:12,color:C.textMuted}}>Case #{e.caseId}</div></td>
                  <td style={TD}>{e.description}</td>
                  <td style={TD}>{e.submittedBy||"—"}</td>
                  <td style={TD}>{e.date}</td>
                </tr>
              );
            })}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── ROOT ──────────────────────────────────────────────────────
export default function App() {
  const [page,setPage]               = useState("dashboard");
  const [clients,setClients]         = useState(CLIENTS_INIT);
  const [cases,setCases]             = useState(CASES_INIT);
  const [lawyers]                    = useState(LAWYERS_INIT);
  const [assignments,setAssignments] = useState(ASSIGN_INIT);
  const [hearings,setHearings]       = useState(HEARINGS_INIT);

  // Load all data from MySQL on first render
  useEffect(() => {
    fetch(`${API}/clients`).then(r => r.json()).then(setClients);
    fetch(`${API}/cases`).then(r => r.json()).then(setCases);
    fetch(`${API}/lawyers`).then(r => r.json()).then(lawyers);
    fetch(`${API}/assignments`).then(r => r.json()).then(setAssignments);
    fetch(`${API}/hearings`).then(r => r.json()).then(setHearings);
  }, []);

  const nav = [
    {id:"dashboard",label:"Dashboard"},
    {id:"clients",  label:"Clients"},
    {id:"cases",    label:"Cases"},
    {id:"lawyers",  label:"Lawyers"},
    {id:"hearings", label:"Hearings"},
    {id:"evidence", label:"Evidence"},
  ];

  const titles = {
    dashboard:"Dashboard",clients:"Clients",cases:"Cases & Assignments",
    lawyers:"Legal Team",hearings:"Court Hearings",evidence:"Evidence Log",
  };

  const subtitles = {
    dashboard:`${clients.length} clients · ${cases.length} cases · ${hearings.length} hearings`,
    cases:"File new cases and assign lawyers below",
    hearings:"Schedule and track all court appearances",
    evidence:"Log and manage case evidence",
    lawyers:"View lawyer profiles and active caseloads",
    clients:"Register and manage client profiles",
  };

  return (
    <div style={{display:"flex",minHeight:"100vh",background:"#f3f4f6",fontFamily:"system-ui,-apple-system,sans-serif"}}>
      {/* Sidebar */}
      <aside style={{width:220,background:C.navy,color:C.white,flexShrink:0,display:"flex",flexDirection:"column"}}>
        <div style={{padding:"22px 20px 16px"}}>
          <div style={{fontSize:17,fontWeight:700,letterSpacing:"-0.3px"}}>LegalTrack</div>
          <div style={{fontSize:11,color:"#94a3b8",marginTop:3}}>Case Management System</div>
        </div>
        <div style={{borderBottom:"1px solid #ffffff18",marginBottom:8}}/>
        <nav style={{padding:"0 10px",flex:1}}>
          {nav.map(n=>(
            <button key={n.id} onClick={()=>setPage(n.id)} style={{
              display:"block",width:"100%",textAlign:"left",
              padding:"9px 12px",marginBottom:2,borderRadius:7,border:"none",cursor:"pointer",
              fontSize:14,fontWeight:page===n.id?600:400,
              background:page===n.id?"#ffffff22":"transparent",
              color:page===n.id?C.white:"#94a3b8",
            }}>{n.label}</button>
          ))}
        </nav>
        <div style={{padding:"16px 20px",borderTop:"1px solid #ffffff18"}}>
          <div style={{fontSize:12,color:"#64748b"}}>BTech DBMS Project</div>
          <div style={{fontSize:11,color:"#475569",marginTop:2}}>Legal Case Management</div>
        </div>
      </aside>

      {/* Content */}
      <main style={{flex:1,padding:"24px 28px",overflowY:"auto"}}>
        <div style={{marginBottom:20}}>
          <h1 style={{fontSize:22,fontWeight:700,color:C.text,margin:0}}>{titles[page]}</h1>
          <p style={{fontSize:13,color:C.textMuted,margin:"4px 0 0"}}>{subtitles[page]}</p>
        </div>
        {page==="dashboard" && <Dashboard clients={clients} cases={cases} lawyers={lawyers} hearings={hearings} assignments={assignments} setPage={setPage}/>}
        {page==="clients"   && <ClientsPage clients={clients} setClients={setClients} cases={cases}/>}
        {page==="cases"     && <CasesPage cases={cases} setCases={setCases} clients={clients} lawyers={lawyers} assignments={assignments} setAssignments={setAssignments}/>}
        {page==="lawyers"   && <LawyersPage lawyers={lawyers} cases={cases} assignments={assignments}/>}
        {page==="hearings"  && <HearingsPage hearings={hearings} setHearings={setHearings} cases={cases} clients={clients}/>}
        {page==="evidence"  && <EvidencePage cases={cases} clients={clients}/>}
      </main>
    </div>
  );
}