import { useMemo, useState } from "react";
import { Anchor, ArrowUpRight, Info, MapPin, Shield, Ship, X } from "lucide-react";

type Place = {
  id:string; name:string; country:string; kind:string; status:string; detail:string;
  source:string; sourceLabel:string; x:number; y:number; group:"india"|"partner";
};
const places:Place[] = [
 {id:"anc",name:"Andaman & Nicobar Command",country:"Port Blair, India",kind:"Operational tri-service command",status:"Established",detail:"India's only geographically organised tri-service command. The map marker is regional and illustrative.",source:"https://www.indiannavy.nic.in/",sourceLabel:"Indian Navy",x:77,y:57,group:"india"},
 {id:"varsha",name:"Project Varsha / NAOB",country:"Rambilli region, Andhra Pradesh, India",kind:"Naval infrastructure programme",status:"Under development / public reporting",detail:"Public parliamentary material identifies the project at Rambilli in Anakapalli district. The marker is deliberately generalised; no installation layout or precise coordinates are shown.",source:"https://sansad.nic.in/getFile/debatestextmk/17/X/16.12.2022.pdf?source=loksabhadocs",sourceLabel:"Lok Sabha debate, 16 Dec 2022",x:58,y:30,group:"india"},
 {id:"port-blair",name:"Port Blair",country:"Andaman & Nicobar Islands, India",kind:"Naval / joint logistics hub",status:"Established",detail:"Publicly identified location of the Andaman and Nicobar Command and a Joint Logistics Node.",source:"https://eparlib.sansad.in/bitstream/123456789/3019267/1/18_Defence_19.pdf",sourceLabel:"Standing Committee on Defence 2025–26",x:78,y:58,group:"india"},
 {id:"duqm",name:"Duqm",country:"Oman",kind:"Logistics access / defence cooperation",status:"Access arrangement / cooperation",detail:"India–Oman defence and logistics cooperation. Do not describe this as an Indian sovereign overseas base.",source:"https://www.indemb-oman.gov.in/page/india-and-oman-bilateral-relations/",sourceLabel:"Embassy of India, Oman",x:25,y:62,group:"partner"},
 {id:"agalega",name:"Agalega",country:"Mauritius",kind:"Air / sea infrastructure cooperation",status:"Bilateral infrastructure cooperation",detail:"India-supported airstrip and jetty infrastructure at Agalega. This is not an Indian-owned military base.",source:"https://www.pib.gov.in/Pressreleaseshare.aspx?PRID=1519147&lang=2&reg=3",sourceLabel:"PIB — bilateral agreements",x:39,y:85,group:"partner"},
 {id:"sabang",name:"Sabang",country:"Indonesia",kind:"Maritime access / port cooperation",status:"Cooperation / access discussions",detail:"Publicly reported maritime cooperation and access discussions. Not represented as a permanent Indian naval base.",source:"https://www.mea.gov.in/bilateral-documents.htm",sourceLabel:"Ministry of External Affairs",x:82,y:79,group:"partner"},
 {id:"seychelles",name:"Port Victoria",country:"Seychelles",kind:"Partner port / naval visits",status:"Port calls and maritime cooperation",detail:"Indian naval and Coast Guard deployments have made public port calls in Seychelles. A port visit or EEZ cooperation is not a listening post or permanent base.",source:"https://www.pib.gov.in/PressReleasePage.aspx?PRID=2126198&lang=2&reg=48",sourceLabel:"PIB — IOS SAGAR, May 2025",x:29,y:83,group:"partner"},
 {id:"bagram",name:"Bagram Air Base",country:"Afghanistan",kind:"External reference / not an Indian facility",status:"Not an Indian base",detail:"Bagram is not listed as an Indian overseas base. Public fact-checking found no evidence of a 2025 handover; reporting says it remained under Taliban control.",source:"https://factcheck.afp.com/doc.afp.com.39VY2ZP",sourceLabel:"AFP Fact Check",x:18,y:25,group:"partner"}
];
const layers=["All locations","Indian commands","Indian infrastructure","Partner access & ports"];
export default function TheatreAtlas(){
 const [layer,setLayer]=useState(layers[0]);const [query,setQuery]=useState("");const [selected,setSelected]=useState("anc");
 const visible=useMemo(()=>places.filter(p=>(layer==="All locations"||(layer==="Indian commands"&&p.id==="anc")||(layer==="Indian infrastructure"&&p.group==="india"&&p.id!=="anc")||(layer==="Partner access & ports"&&p.group==="partner"))&&[p.name,p.country,p.kind,p.status].join(" ").toLowerCase().includes(query.toLowerCase())),[layer,query]);
 const active=places.find(p=>p.id===selected);
 return <section className="page-section theatre-atlas-page">
  <div className="section-heading"><div><span className="section-kicker">GEOGRAPHY / COMMANDS / MARITIME ACCESS</span><h2>India & the Indian Ocean</h2><p>Explore established commands, publicly documented infrastructure and partner-port relationships. All map positions are schematic, not navigational.</p></div></div>
  <div className="theatre-atlas-toolbar">
   <label className="theatre-search"><MapPin size={15}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search command, place or country"/></label>
   <div className="theatre-layer-tabs">{layers.map(x=><button key={x} className={layer===x?"active":""} onClick={()=>setLayer(x)}>{x}</button>)}</div>
  </div>
  <div className="theatre-atlas-grid">
   <div className="theatre-map-card">
    <div className="theatre-map-legend"><span><i className="india-dot"/> India / command</span><span><i className="partner-dot"/> Partner / access</span></div>
    <svg className="theatre-schematic-map" viewBox="0 0 100 100" role="img" aria-label="Schematic map of the Indian Ocean region showing generalised public command and partner locations">
     <defs><linearGradient id="ocean" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#163c55"/><stop offset="1" stopColor="#0b2037"/></linearGradient></defs>
     <rect width="100" height="100" rx="2" fill="url(#ocean)"/>
     <g fill="#58766f" stroke="#91aa9a" strokeWidth=".35" opacity=".9">
      <path d="M42 2 L55 3 60 9 58 15 62 21 59 27 63 33 59 38 62 44 58 48 55 44 51 39 49 33 46 29 45 22 42 18 40 11Z"/>
      <path d="M43 38 L49 37 53 42 51 49 48 56 46 62 42 67 39 61 40 55 37 49 39 43Z"/>
      <path d="M70 54 L78 52 84 57 82 64 77 68 73 64Z"/>
      <path d="M7 3 L22 2 29 8 25 15 18 18 12 13Z"/>
      <path d="M1 72 L16 70 21 77 17 87 7 89Z"/>
     </g>
     <g fill="none" stroke="#78a7bd" strokeWidth=".25" strokeDasharray="1 1" opacity=".7"><path d="M0 50H100M50 0V100"/><ellipse cx="50" cy="50" rx="35" ry="45"/></g>
     <text x="47" y="17" fill="#d9e8ee" fontSize="3" textAnchor="middle">INDIA</text><text x="51" y="74" fill="#d9e8ee" fontSize="3" textAnchor="middle">INDIAN OCEAN</text><text x="14" y="49" fill="#d9e8ee" fontSize="2.5">EAST AFRICA</text><text x="83" y="17" fill="#d9e8ee" fontSize="2.5">SE ASIA</text>
     {visible.map(p=><g key={p.id} onClick={()=>setSelected(p.id)} role="button" tabIndex={0} aria-label={p.name} style={{cursor:"pointer"}} onKeyDown={e=>{if(e.key==="Enter"||e.key===" ")setSelected(p.id)}}>
       <circle cx={p.x} cy={p.y} r={selected===p.id?2.6:1.8} fill={p.group==="india"?"#63d5c6":"#ffbd72"} stroke="#f5f8fa" strokeWidth=".5"/>
       {selected===p.id&&<circle cx={p.x} cy={p.y} r="4" fill="none" stroke="#fff" strokeWidth=".35"/>}
      </g>)}
    </svg>
    <p className="theatre-map-disclaimer"><Info size={13}/> Illustrative geography only. No precise military-site coordinates, operational patterns or sensitive facility layouts.</p>
   </div>
   <aside className="theatre-place-panel">
    <div className="theatre-place-list">{visible.map(p=><button key={p.id} className={selected===p.id?"selected":""} onClick={()=>setSelected(p.id)}><span className={p.group==="india"?"place-symbol india":"place-symbol partner"}>{p.group==="india"?<Shield size={14}/>:<Anchor size={14}/>}</span><span><strong>{p.name}</strong><small>{p.country} · {p.kind}</small></span></button>)}</div>
    {active&&<div className="theatre-place-detail"><button className="theatre-detail-close" onClick={()=>setSelected("")} aria-label="Close detail"><X size={14}/></button><span className="section-kicker">LOCATION PROFILE</span><h3>{active.name}</h3><p className="place-status">{active.status}</p><p>{active.detail}</p><a href={active.source} target="_blank" rel="noreferrer">Source: {active.sourceLabel} <ArrowUpRight size={13}/></a></div>}
   </aside>
  </div>
  <div className="theatre-status-note"><Shield size={17}/><p><strong>Theatre commands vs existing commands.</strong> India’s Andaman & Nicobar Command is an established tri-service command. Proposed Northern, Western and Maritime theatre structures must be labelled as proposals until formally notified. The map does not depict them as active commands.</p></div>
 </section>;
}
