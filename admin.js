(() => {
"use strict";
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const KEY="bhawishya-site-content", LINKS="bhawishya-social-links";
const SUPABASE_URL="https://lltnosossejymzvddeee.supabase.co", SUPABASE_PUBLISHABLE_KEY="sb_publishable__mdO3XEbIwSJDnGXyqSlFg_g7TxWpSF";
const ADMIN_EMAIL="sooryavanshibhawishya@gmail.com", ADMIN_REDIRECT_URL="https://thelonelystick.vercel.app/admin";
const defaults={heroTitle:'Building my skills.<br>Bringing ideas <span class="gold-text">to life.</span>',heroLead:"I'm Bhawishya, a student developer exploring web technologies, AI-powered tools, and digital products. I learn by building — one idea, one experiment, and one project at a time.",projects:[
{title:"AstroGPT",description:"An educational Jyotisha-inspired web experience combining traditional interpretations with a modern interface and calculation-focused exploration."},
{title:"SCARLET",description:"A personal assistant concept for voice and text conversations, task management, routines, and monthly budgeting."},
{title:"PurpleDevs",description:"A digital services brand concept for websites, customized web tools, social media support, and AI solutions."},
{title:"FUZION COACHING INSTITUTE",description:"A coaching management system concept for organizing student learning, teacher workflows, parent visibility, and administration."}]};
const defaultLinks=[{label:"GitHub",url:"https://github.com/thelonelystick",type:"Code"},{label:"YouTube",url:"",type:"Video"},{label:"Instagram",url:"",type:"Social"}];
function load(key,fallback){try{return JSON.parse(localStorage.getItem(key))||structuredClone(fallback)}catch{return structuredClone(fallback)}}
let content=load(KEY,defaults), links=load(LINKS,defaultLinks);
function save(key,value){localStorage.setItem(key,JSON.stringify(value))}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function toast(message){const el=$("#toast");el.textContent=message;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),2200)}
const names={overview:["Overview","Good to see you."],homepage:["Homepage content","Shape your introduction."],projects:["Projects & domains","Keep your work up to date."],appearance:["Appearance","Set the mood."],links:["Social links","Connect your worlds."],inbox:["Contact inbox","Messages and enquiries."]};
function view(name){$$(".view").forEach(el=>el.classList.toggle("active",el.id==="view-"+name));$$(".side-link").forEach(el=>el.classList.toggle("active",el.dataset.view===name));$("#crumb").textContent=names[name][0];$("#page-title").textContent=names[name][1];$("#sidebar").classList.remove("open")}
$$(".side-link").forEach(b=>b.addEventListener("click",()=>view(b.dataset.view)));
$$("[data-go]").forEach(b=>b.addEventListener("click",()=>view(b.dataset.go)));
$("#mobile-menu").addEventListener("click",()=>$("#sidebar").classList.toggle("open"));
function renderHome(){$("#hero-title").value=content.heroTitle||defaults.heroTitle;$("#hero-lead").value=content.heroLead||defaults.heroLead}
$("#homepage-form").addEventListener("submit",e=>{e.preventDefault();content.heroTitle=$("#hero-title").value.trim();content.heroLead=$("#hero-lead").value.trim();save(KEY,content);$("#homepage-status").textContent="Saved in this browser. Open the homepage in the same browser to preview.";toast("Homepage content saved locally")});
$("#reset-homepage").addEventListener("click",()=>{content.heroTitle=defaults.heroTitle;content.heroLead=defaults.heroLead;renderHome();save(KEY,content);$("#homepage-status").textContent="Default homepage copy restored."});
function renderProjects(){$("#project-editor-list").innerHTML=content.projects.map((p,i)=>`<article class="project-edit"><div class="project-edit-head">Project ${String(i+1).padStart(2,"0")} <span>HOMEPAGE CARD</span></div><label>Card title</label><input data-title="${i}" value="${esc(p.title)}" maxlength="90" required><label>Summary</label><textarea data-description="${i}" rows="4" maxlength="500" required>${esc(p.description)}</textarea></article>`).join("");$("#project-count").textContent=String(content.projects.length).padStart(2,"0")}
$("#save-projects").addEventListener("click",()=>{const projects=content.projects.map((p,i)=>({title:$(`[data-title="${i}"]`).value.trim(),description:$(`[data-description="${i}"]`).value.trim()}));if(projects.some(p=>!p.title||!p.description)){$("#projects-status").textContent="Every project needs a title and summary.";return}content.projects=projects;save(KEY,content);$("#projects-status").textContent="Project cards saved locally. Refresh homepage to preview.";toast("Project cards saved locally")});
$("#reset-projects").addEventListener("click",()=>{content.projects=structuredClone(defaults.projects);renderProjects();save(KEY,content);$("#projects-status").textContent="Default cards restored."});
$$(".theme-card").forEach(card=>card.addEventListener("click",()=>{$$(".theme-card").forEach(c=>c.classList.toggle("selected",c===card));toast((card.dataset.themeChoice==="light"?"Lunar":"Solar")+" preview selected")}));
function renderLinks(){$("#links-list").innerHTML=links.map((l,i)=>`<div class="link-row"><input aria-label="Link label" data-label="${i}" value="${esc(l.label)}" placeholder="Label" maxlength="40"><input aria-label="Link URL" data-url="${i}" type="url" value="${esc(l.url)}" placeholder="https://example.com"><select aria-label="Category" data-type="${i}">${["Social","Code","Video","Writing","Business","Other"].map(t=>`<option ${l.type===t?"selected":""}>${t}</option>`).join("")}</select><button type="button" data-remove="${i}" aria-label="Remove link">×</button></div>`).join("");$$("[data-remove]").forEach(b=>b.addEventListener("click",()=>{links.splice(Number(b.dataset.remove),1);renderLinks()}))}
$("#add-link").addEventListener("click",()=>{links.push({label:"",url:"",type:"Other"});renderLinks()});
$("#links-form").addEventListener("submit",e=>{e.preventDefault();const rows=$$(".link-row");const next=rows.map((r,i)=>({label:$(`[data-label="${i}"]`).value.trim(),url:$(`[data-url="${i}"]`).value.trim(),type:$(`[data-type="${i}"]`).value})).filter(l=>l.label);if(next.some(l=>l.url&&!/^https?:\/\//i.test(l.url))){$("#links-status").textContent="Use a full https:// or http:// URL.";return}links=next;save(LINKS,links);$("#links-status").textContent="Links saved locally. Public display still needs to be connected.";toast("Social links saved locally")});
renderHome();renderProjects();renderLinks();
const authGate=$("#auth-gate"),adminShell=$("#admin-shell"),authStatus=$("#auth-status"),signInButton=$("#google-sign-in");
let authClient;
function showSignIn(message=""){adminShell.hidden=true;authGate.hidden=false;authStatus.textContent=message}
function showAdmin(email){authGate.hidden=true;adminShell.hidden=false;$(".owner small").textContent=email}
async function authorize(session){
const email=session?.user?.email?.trim().toLowerCase();
if(email===ADMIN_EMAIL){showAdmin(email);return}
showSignIn(session?.user?"This Google account is not authorized for this admin page.":"");
if(session?.user){
const {error}=await authClient.auth.signOut();
if(error)showSignIn(`This account is not authorized. Could not clear its session: ${error.message}`);
else showSignIn("This Google account is not authorized for this admin page.");
}
}
async function initializeAuth(){
if(!window.supabase?.createClient){showSignIn("Could not load Supabase. Check your connection and reload.");signInButton.disabled=true;return}
authClient=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);
let checkingInitialSession=true;
signInButton.addEventListener("click",async()=>{
signInButton.disabled=true;authStatus.textContent="Redirecting to Google…";
try{
const {error}=await authClient.auth.signInWithOAuth({provider:"google",options:{redirectTo:ADMIN_REDIRECT_URL}});
if(error){authStatus.textContent=`Google sign-in failed: ${error.message}`;signInButton.disabled=false}
}catch(error){authStatus.textContent=`Google sign-in failed: ${error.message}`;signInButton.disabled=false}
});
$("#sign-out").addEventListener("click",async()=>{
try{
const {error}=await authClient.auth.signOut();
if(error){showSignIn(`Sign-out failed: ${error.message}`);return}
showSignIn("Signed out.");
}catch(error){showSignIn(`Sign-out failed: ${error.message}`)}
});
authClient.auth.onAuthStateChange((event,session)=>{
if(event==="SIGNED_OUT"){showSignIn("Signed out.");return}
if(checkingInitialSession)return;
setTimeout(()=>{void authorize(session).catch(error=>showSignIn(`Could not verify your session: ${error.message}`))},0);
});
const {data,error}=await authClient.auth.getSession();
if(error){showSignIn(`Could not check your session: ${error.message}`);return}
checkingInitialSession=false;
await authorize(data.session);
}
void initializeAuth().catch(error=>showSignIn(`Could not initialize sign-in: ${error.message}`));
})();