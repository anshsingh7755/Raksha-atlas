import fs from "node:fs/promises";
import pg from "pg";
import process from "node:process";
const { Pool } = pg;
const envText = await fs.readFile(".env", "utf8").catch(() => "");
for (const line of envText.split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
  if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, "$2");
}
const url=process.env.APPLICATION_DATABASE_URL;
if(!url) throw new Error("Set APPLICATION_DATABASE_URL in .env");
const pool=new Pool({connectionString:url});
const docs=[
{id:"overview",section:"Overview",title:"How Raksha Atlas works",summary:"The active website uses React and the Node API.",content:"Raksha Atlas is split into a browser frontend and a backend API. The frontend displays pages and sends HTTP requests. The backend validates requests, reads and updates data, runs processing services, and returns JSON.",sort_order:1},
{id:"frontend",section:"Frontend",title:"React frontend",summary:"src/ contains the active React + TypeScript + Vite website.",content:"React builds the screens and reusable UI components. TypeScript defines data shapes and catches type errors. Vite runs the local development server and builds frontend assets. Frontend code calls /api/... endpoints; it should not connect directly to PostgreSQL or contain database credentials.",sort_order:2},
{id:"backend",section:"Backend",title:"Node.js API",summary:"server/ contains the active backend.",content:"Node.js runs the API and backend processing. server/ handles HTTP routes, validation, data access, ingestion, extraction, processing, search and RAG. Business rules belong in server/, not in the Vercel adapter. The backend returns JSON responses to React.",sort_order:3},
{id:"connection",section:"Request flow",title:"How React connects to Node",summary:"Browser → React → /api request → Node API → data/services → JSON response.",content:"A visitor opens the React website in a browser. React sends an HTTP request to /api/.... In local development, Vite proxies the request to the local Node API started by npm run dev:full. In Vercel, api/[...path].mjs forwards the request to the same Node handler. Node reads or updates the relevant data and sends a JSON response. React updates the screen from that response.",sort_order:4},
{id:"deployment",section:"Deployment",title:"Local and hosted execution",summary:"Vite is used locally; the Vercel adapter exposes the Node API when deployed there.",content:"Local development: npm run dev:full starts the frontend and API together. The browser uses the Vite address and API requests are proxied to Node. Hosted deployment: the Vercel adapter in api/ forwards API requests to the Node handler. Do not assume a serverless deployment runs a permanent background worker.",sort_order:5},
{id:"folders",section:"Code map",title:"Important folders",summary:"Where to find each active and supporting part.",content:"src/: active React frontend. server/: active Node API and backend logic. api/: Vercel API adapter. ai/: supporting FastAPI document and AI service. database/: SQL schemas and database setup. scripts/: import, reconciliation and maintenance scripts. frontend/ and backend/ are migration scaffolds, not replacements for the active React/Node application unless a phase explicitly switches them.",sort_order:6}
];
const components=[
{id:"react",name:"React + Vite",responsibility:"Render the website UI and call API endpoints.",code_location:"src/",connects_to:["Node.js API via /api/..."],status:"active"},
{id:"node-api",name:"Node.js API",responsibility:"Handle requests, business logic, data access and backend processing.",code_location:"server/",connects_to:["React frontend","PostgreSQL databases","AI service"],status:"active"},
{id:"vercel-adapter",name:"Vercel adapter",responsibility:"Forward hosted API requests to the Node handler.",code_location:"api/[...path].mjs",connects_to:["Node.js API"],status:"active"},
{id:"ai-service",name:"FastAPI AI service",responsibility:"Supporting document extraction and AI tasks.",code_location:"ai/",connects_to:["Node.js API"],status:"supporting"}
];
try{
 for(const d of docs) await pool.query("INSERT INTO application_documents(id,section,title,summary,content,sort_order) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(id) DO UPDATE SET section=EXCLUDED.section,title=EXCLUDED.title,summary=EXCLUDED.summary,content=EXCLUDED.content,sort_order=EXCLUDED.sort_order,updated_at=NOW()",[d.id,d.section,d.title,d.summary,d.content,d.sort_order]);
 for(const c of components) await pool.query("INSERT INTO application_components(id,name,responsibility,code_location,connects_to,status) VALUES($1,$2,$3,$4,$5::jsonb,$6) ON CONFLICT(id) DO UPDATE SET name=EXCLUDED.name,responsibility=EXCLUDED.responsibility,code_location=EXCLUDED.code_location,connects_to=EXCLUDED.connects_to,status=EXCLUDED.status,updated_at=NOW()",[c.id,c.name,c.responsibility,c.code_location,JSON.stringify(c.connects_to),c.status]);
 process.stdout.write("Seeded application_db with concise architecture guide and component map.\n");
}finally{await pool.end();}
