import { useEffect, useMemo, useRef, useState } from "react";
import { Anchor, ArrowUpRight, Info, MapPin, Shield, X, LocateFixed } from "lucide-react";

type Place = {
  id:string; name:string; country:string; kind:string; status:string; detail:string;
  source:string; sourceLabel:string; lat:number; lng:number; group:"india"|"partner";
};
type LeafletMap = any;
declare global { interface Window { L?: any } }
let leafletPromise:Promise<any>|null=null;
function loadLeaflet(){
 if(window.L)return Promise.resolve(window.L);
 if(!leafletPromise){
  leafletPromise=new Promise((resolve,reject)=>{
   if(!document.getElementById("raksha-leaflet-css")){
    const link=document.createElement("link");link.id="raksha-leaflet-css";link.rel="stylesheet";link.href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";document.head.appendChild(link);
   }
   const existing=document.getElementById("raksha-leaflet-js") as HTMLScriptElement|null;
   if(existing){existing.addEventListener("load",()=>resolve(window.L));existing.addEventListener("error",()=>reject(new Error("Map library failed to load")));if(window.L)resolve(window.L);return;}
   const script=document.createElement("script");script.id="raksha-leaflet-js";script.src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";script.integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";script.crossOrigin="";script.onload=()=>window.L?resolve(window.L):reject(new Error("Map library did not initialise"));script.onerror=()=>reject(new Error("Map library failed to load"));document.body.appendChild(script);
  });
 }
 return leafletPromise;
}
const places:Place[] = [
 {id:"anc",name:"Andaman & Nicobar Command",country:"Port Blair, India",kind:"Established tri-service command",status:"Established",detail:"India's only geographically organised tri-service command. Marker indicates the public city-level location, not a facility perimeter.",source:"https://www.indiannavy.nic.in/",sourceLabel:"Indian Navy",lat:11.67,lng:92.75,group:"india"},
 {id:"varsha",name:"Project Varsha / NAOB",country:"Rambilli region, Andhra Pradesh, India",kind:"Naval infrastructure programme",status:"Under development / public reporting",detail:"Public parliamentary material identifies the project in the Rambilli region. Marker is deliberately approximate and does not identify installation boundaries or layouts.",source:"https://sansad.nic.in/getFile/debatestextmk/17/X/16.12.2022.pdf?source=loksabhadocs",sourceLabel:"Lok Sabha debate, 16 Dec 2022",lat:17.55,lng:83.08,group:"india"},
 {id:"port-blair",name:"Port Blair",country:"Andaman & Nicobar Islands, India",kind:"Joint logistics / command city",status:"Established",detail:"Publicly identified city associated with the Andaman and Nicobar Command and Joint Logistics Node. This is a city-level marker.",source:"https://eparlib.sansad.in/bitstream/123456789/3019267/1/18_Defence_19.pdf",sourceLabel:"Standing Committee on Defence 2025–26",lat:11.62,lng:92.73,group:"india"},
 {id:"duqm",name:"Duqm",country:"Oman",kind:"Logistics access / defence cooperation",status:"Access arrangement / cooperation",detail:"India–Oman defence and logistics cooperation. This is not an Indian sovereign overseas base.",source:"https://www.indemb-oman.gov.in/page/india-and-oman-bilateral-relations/",sourceLabel:"Embassy of India, Oman",lat:19.66,lng:57.70,group:"partner"},
 {id:"agalega",name:"Agalega",country:"Mauritius",kind:"Bilateral air / sea infrastructure",status:"Bilateral infrastructure cooperation",detail:"India-supported airstrip and jetty infrastructure at Agalega. This is not an Indian-owned military base.",source:"https://www.pib.gov.in/Pressreleaseshare.aspx?PRID=1519147&lang=2&reg=3",sourceLabel:"PIB — bilateral agreements",lat:-10.40,lng:56.62,group:"partner"},
 {id:"sabang",name:"Sabang",country:"Indonesia",kind:"Maritime access / port cooperation",status:"Cooperation / access discussions",detail:"Publicly reported maritime cooperation and access discussions. Not represented as a permanently based Indian naval force.",source:"https://www.mea.gov.in/bilateral-documents.htm",sourceLabel:"Ministry of External Affairs",lat:5.89,lng:95.32,group:"partner"},
 {id:"seychelles",name:"Port Victoria",country:"Seychelles",kind:"Partner port / naval visits",status:"Port calls and maritime cooperation",detail:"Indian naval and Coast Guard deployments have made public port calls in Seychelles. A port call or EEZ mission is not a listening post or permanent base.",source:"https://www.pib.gov.in/PressReleasePage.aspx?PRID=2126198&lang=2&reg=48",sourceLabel:"PIB — IOS SAGAR, May 2025",lat:-4.62,lng:55.45,group:"partner"},
 {id:"bagram",name:"Bagram Air Base",country:"Afghanistan",kind:"External reference / not an Indian facility",status:"Not an Indian base",detail:"Shown only as an excluded external reference. It is not listed as an Indian overseas base.",source:"https://factcheck.afp.com/doc.afp.com.39VY2ZP",sourceLabel:"AFP Fact Check",lat:34.94,lng:69.26,group:"partner"}
];
const layers=["All locations","Indian commands","Indian infrastructure","Partner access & ports"];
const markerIcon=(L:any,group:string,active:boolean)=>L.divIcon({className:"raksha-map-marker-wrap",html:`<span class="raksha-map-marker ${group} ${active?"active":""}"></span>`,iconSize:[24,24],iconAnchor:[12,12]});
export default function TheatreAtlas(){
 const [layer,setLayer]=useState(layers[0]);const [query,setQuery]=useState("");const [selected,setSelected]=useState("anc");const [mapError,setMapError]=useState("");const [mapReady,setMapReady]=useState(false);
 const mapNode=useRef<HTMLDivElement|null>(null);const mapRef=useRef<LeafletMap|null>(null);const markerRefs=useRef<Record<string,any>>({});
 const visible=useMemo(()=>places.filter(p=>(layer==="All locations"||(layer==="Indian commands"&&p.id==="anc")||(layer==="Indian infrastructure"&&p.group==="india"&&p.id!=="anc")||(layer==="Partner access & ports"&&p.group==="partner"))&&[p.name,p.country,p.kind,p.status].join(" ").toLowerCase().includes(query.toLowerCase())),[layer,query]);
 const active=places.find(p=>p.id===selected);
 useEffect(()=>{
  let disposed=false;
  loadLeaflet().then(L=>{
   if(disposed||!mapNode.current)return;
   const mapInstance:LeafletMap=L.map(mapNode.current,{center:[5,76],zoom:4,scrollWheelZoom:true,worldCopyJump:true,zoomControl:true});
   L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:18,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',crossOrigin:true}).addTo(mapInstance);
   mapRef.current=mapInstance;setMapReady(true);
   requestAnimationFrame(()=>mapInstance.invalidateSize());
  }).catch(e=>{if(!disposed)setMapError(e instanceof Error?e.message:"Unable to load map");});
  return()=>{disposed=true;if(mapRef.current){mapRef.current.remove();mapRef.current=null;}markerRefs.current={};setMapReady(false);};
 },[]);
 useEffect(()=>{
  const map=mapRef.current;if(!map||!window.L)return;
  const L=window.L;Object.values(markerRefs.current).forEach(marker=>marker.remove());markerRefs.current={};
  visible.forEach(place=>{
   const marker=L.marker([place.lat,place.lng],{icon:markerIcon(L,place.group,place.id===selected),title:place.name,alt:place.name}).addTo(map);
   marker.bindTooltip(place.name,{direction:"top",offset:[0,-9]});
   marker.on("click",()=>setSelected(place.id));markerRefs.current[place.id]=marker;
  });
  if(visible.length>1){const bounds=L.latLngBounds(visible.map(p=>[p.lat,p.lng]));map.fitBounds(bounds.pad(.22),{maxZoom:5,animate:true});}
  else if(visible.length===1)map.setView([visible[0].lat,visible[0].lng],6,{animate:true});
 },[visible,selected,mapReady]);
 const focus=(p:Place)=>{setSelected(p.id);const map=mapRef.current;if(map)map.flyTo([p.lat,p.lng],Math.max(map.getZoom(),6),{duration:.7});};
 return <section className="page-section theatre-atlas-page">
  <div className="section-heading"><div><span className="section-kicker">GEOGRAPHY / COMMANDS / MARITIME ACCESS</span><h2>India & the Indian Ocean</h2><p>Explore established commands, publicly documented infrastructure and partner-port relationships on a live, zoomable geographic basemap.</p></div></div>
  <div className="theatre-atlas-toolbar">
   <label className="theatre-search"><MapPin size={15}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search command, place or country"/></label>
   <div className="theatre-layer-tabs">{layers.map(x=><button key={x} className={layer===x?"active":""} onClick={()=>setLayer(x)}>{x}</button>)}</div>
  </div>
  <div className="theatre-atlas-grid">
   <div className="theatre-map-card">
    <div className="theatre-map-legend"><span><i className="india-dot"/> India / command</span><span><i className="partner-dot"/> Partner / access</span><span className="map-live-indicator">LIVE BASEMAP</span></div>
    <div className="theatre-live-map" ref={mapNode} aria-label="Interactive map of India and the Indian Ocean region"/>
    {mapError&&<div className="theatre-map-error"><Info size={14}/>{mapError}. Check your internet connection and refresh this page.</div>}
    <div className="theatre-map-controls"><button onClick={()=>mapRef.current?.setView([5,76],4,{animate:true})}><LocateFixed size={14}/> Reset view</button><button onClick={()=>mapRef.current?.zoomIn()} aria-label="Zoom in">+</button><button onClick={()=>mapRef.current?.zoomOut()} aria-label="Zoom out">−</button></div>
    <p className="theatre-map-disclaimer"><Info size={13}/> Live street/terrain basemap from OpenStreetMap. Markers use public city/region locations and are not navigational or installation-level coordinates.</p>
   </div>
   <aside className="theatre-place-panel">
    <div className="theatre-place-list">{visible.map(p=><button key={p.id} className={selected===p.id?"selected":""} onClick={()=>focus(p)}><span className={p.group==="india"?"place-symbol india":"place-symbol partner"}>{p.group==="india"?<Shield size={14}/>:<Anchor size={14}/>}</span><span><strong>{p.name}</strong><small>{p.country} · {p.kind}</small></span></button>)}</div>
    {active&&<div className="theatre-place-detail"><button className="theatre-detail-close" onClick={()=>setSelected("")} aria-label="Close detail"><X size={14}/></button><span className="section-kicker">LOCATION PROFILE</span><h3>{active.name}</h3><p className="place-status">{active.status}</p><p>{active.detail}</p><a href={active.source} target="_blank" rel="noreferrer">Source: {active.sourceLabel} <ArrowUpRight size={13}/></a></div>}
   </aside>
  </div>
  <div className="theatre-status-note"><Shield size={17}/><p><strong>Theatre commands vs existing commands.</strong> India’s Andaman & Nicobar Command is an established tri-service command. Proposed Northern, Western and Maritime theatre structures must be labelled as proposals until formally notified. The map does not depict them as active commands.</p></div>
 </section>;
}
