(() => {
"use strict";
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const KEY="bhawishya-site-content", LINKS="bhawishya-social-links";
const SUPABASE_URL="https://lltnosossejymzvddeee.supabase.co", SUPABASE_PUBLISHABLE_KEY="sb_publishable__mdO3XEbIwSJDnGXyqSlFg_g7TxWpSF";
const ADMIN_EMAIL="sooryavanshibhawishya@gmail.com", ADMIN_REDIRECT_URL="https://thelonelystick.vercel.app/admin";
const defaults={heroTitle:'Building my skills.<br>Bringing ideas <span class="gold-text">to life.</span>',heroLead:"I'm Bhawishya, a student developer exploring web technologies, AI-powered tools, and digital products. I learn by building — one idea, one experiment, and one project at a time.",heroImage:"",contact:{email:"sooryavanshibhawishya@gmail.com",message:"Have a project idea, a suggestion, or an opportunity to learn and collaborate? I'd be glad to hear from you."},projects:[
{title:"AstroGPT",description:"An educational Jyotisha-inspired web experience combining traditional interpretations with a modern interface and calculation-focused exploration.",kind:"astro",meta:"WEB PROJECT · INTERACTIVE EXPERIENCE",tags:["Web Development","UI Design","Research"],url:"https://astro-gpt-rho.vercel.app"},
{title:"SCARLET",description:"A personal assistant concept for voice and text conversations, task management, routines, and monthly budgeting.",kind:"scarlet",meta:"AI CONCEPT · PRODUCTIVITY",tags:["AI Assistants","Product Thinking"]},
{title:"PurpleDevs",description:"A digital services brand concept for websites, customized web tools, social media support, and AI solutions.",kind:"purpledevs",meta:"BRAND CONCEPT · DIGITAL SERVICES",tags:["Web Services","Branding","AI Tools"]},
{title:"FUZION COACHING INSTITUTE",description:"A coaching management system concept for organizing student learning, teacher workflows, parent visibility, and administration.",kind:"fuzion",meta:"EDTECH CONCEPT · DASHBOARD",tags:["EdTech","Dashboard UX","Firebase"]}]};
const defaultLinks=[{label:"GitHub",url:"https://github.com/thelonelystick",type:"Code"},{label:"YouTube",url:"",type:"Video"},{label:"Instagram",url:"",type:"Social"}];
function load(key,fallback){try{return JSON.parse(localStorage.getItem(key))||structuredClone(fallback)}catch{return structuredClone(fallback)}}
let content=load(KEY,defaults), links=load(LINKS,defaultLinks);
if(!Array.isArray(links))links=structuredClone(defaultLinks);
function save(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true}catch(error){console.error("Could not save site settings.",error);toast("Could not save changes in this browser");return false}}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function validWebUrl(value){try{return ["http:","https:"].includes(new URL(value).protocol)}catch{return false}}
function validImageSource(value){return !value||validWebUrl(value)||/^data:image\/(?:png|jpeg|webp|gif);base64,/i.test(value)}
function toast(message){const el=$("#toast");el.textContent=message;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),2200)}
const names={overview:["Overview","Good to see you."],homepage:["Homepage content","Shape your introduction."],projects:["Projects & domains","Keep your work up to date."],contact:["Contact details","Make it easy to reach you."],appearance:["Appearance","Set the mood."],links:["Social links","Connect your worlds."],inbox:["Contact inbox","Messages and enquiries."]};
function view(name){$$(".view").forEach(el=>el.classList.toggle("active",el.id==="view-"+name));$$(".side-link").forEach(el=>el.classList.toggle("active",el.dataset.view===name));$("#crumb").textContent=names[name][0];$("#page-title").textContent=names[name][1];$("#sidebar").classList.remove("open")}
$$(".side-link").forEach(b=>b.addEventListener("click",()=>view(b.dataset.view)));
$$("[data-go]").forEach(b=>b.addEventListener("click",()=>view(b.dataset.go)));
$("#mobile-menu").addEventListener("click",()=>$("#sidebar").classList.toggle("open"));
content={...defaults,...content,contact:{...defaults.contact,...content.contact},projects:Array.isArray(content.projects)?content.projects:structuredClone(defaults.projects)};
function renderHome(){$("#hero-title").value=content.heroTitle||defaults.heroTitle;$("#hero-lead").value=content.heroLead||defaults.heroLead;$("#hero-image-url").value=content.heroImage||"";const preview=$("#hero-image-preview");preview.src=content.heroImage||"";preview.hidden=!content.heroImage}
function setHomeStatus(message){$("#homepage-status").textContent=message}
$("#homepage-form").addEventListener("submit",e=>{e.preventDefault();const image=$("#hero-image-url").value.trim();if(!validImageSource(image)){setHomeStatus("Enter a valid http(s) image URL or upload an image.");return}content.heroTitle=$("#hero-title").value.trim();content.heroLead=$("#hero-lead").value.trim();content.heroImage=image;if(save(KEY,content)){setHomeStatus("Saved in this browser. Refresh the homepage in this browser to preview.");toast("Homepage content saved locally")}});
$("#reset-homepage").addEventListener("click",()=>{content.heroTitle=defaults.heroTitle;content.heroLead=defaults.heroLead;renderHome();if(save(KEY,content))setHomeStatus("Default homepage text restored.")});
$("#clear-hero-image").addEventListener("click",()=>{$("#hero-image-url").value="";$("#hero-image-file").value="";$("#hero-image-preview").hidden=true;content.heroImage="";if(save(KEY,content))setHomeStatus("Home display image removed.")});
$("#hero-image-url").addEventListener("input",()=>{const preview=$("#hero-image-preview"),value=$("#hero-image-url").value.trim();preview.src=validImageSource(value)?value:"";preview.hidden=!value||!validImageSource(value)});
$("#hero-image-file").addEventListener("change",async event=>{
const file=event.target.files?.[0];if(!file)return;
if(!file.type.startsWith("image/")){setHomeStatus("Choose an image file.");event.target.value="";return}
try{
const dataUrl=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(new Error("Could not read the selected image."));reader.readAsDataURL(file)});
const image=await new Promise((resolve,reject)=>{const element=new Image();element.onload=()=>resolve(element);element.onerror=()=>reject(new Error("The selected file is not a readable image."));element.src=dataUrl});
const scale=Math.min(1,1200/Math.max(image.width,image.height)),canvas=document.createElement("canvas");canvas.width=Math.round(image.width*scale);canvas.height=Math.round(image.height*scale);const context=canvas.getContext("2d");if(!context)throw new Error("Could not prepare the selected image.");context.drawImage(image,0,0,canvas.width,canvas.height);const resized=canvas.toDataURL("image/jpeg",.82);$("#hero-image-url").value=resized;$("#hero-image-preview").src=resized;$("#hero-image-preview").hidden=false;setHomeStatus("Image ready. Save changes to apply it to the homepage.");event.target.value="";
}catch(error){setHomeStatus(error.message);event.target.value=""}
});
function projectDrafts(){return [...$$(".project-edit")].map((row,i)=>({title:$(`[data-title="${i}"]`,row).value.trim(),description:$(`[data-description="${i}"]`,row).value.trim(),meta:$(`[data-meta="${i}"]`,row).value.trim(),tags:$(`[data-tags="${i}"]`,row).value.split(",").map(tag=>tag.trim()).filter(Boolean),url:$(`[data-project-url="${i}"]`,row).value.trim(),image:$(`[data-project-image="${i}"]`,row).value.trim(),kind:$(`[data-kind="${i}"]`,row).value}))}
function renderProjects(){const list=$("#project-editor-list");list.innerHTML=content.projects.map((entry,i)=>{const p={...(defaults.projects[i]||{meta:"PROJECT",tags:[],kind:"custom",url:"",image:""}),...entry},tags=Array.isArray(p.tags)?p.tags.join(", "):"";return `<article class="project-edit"><div class="project-edit-head">Project ${String(i+1).padStart(2,"0")} <button type="button" class="remove-card" data-remove-card="${i}" aria-label="Remove ${esc(p.title||"project")}">Remove card ×</button></div><label for="project-title-${i}">Card title</label><input id="project-title-${i}" data-title="${i}" value="${esc(p.title)}" maxlength="90" required><label for="project-description-${i}">Summary</label><textarea id="project-description-${i}" data-description="${i}" rows="3" maxlength="500" required>${esc(p.description)}</textarea><label for="project-meta-${i}">Category (optional)</label><input id="project-meta-${i}" data-meta="${i}" value="${esc(p.meta||"")}" maxlength="80"><label for="project-tags-${i}">Tags (comma-separated)</label><input id="project-tags-${i}" data-tags="${i}" value="${esc(tags)}" maxlength="180"><label for="project-url-${i}">Project link (optional)</label><input id="project-url-${i}" data-project-url="${i}" type="text" value="${esc(p.url||"")}" placeholder="https://example.com"><label for="project-image-${i}">Card image URL (optional)</label><input id="project-image-${i}" data-project-image="${i}" type="text" value="${esc(p.image||"")}" placeholder="https://example.com/image.jpg"><input type="hidden" data-kind="${i}" value="${esc(p.kind||"custom")}"></article>`}).join("");$("#project-count").textContent=String(content.projects.length).padStart(2,"0")}
function saveProjects(projects){if(projects.some(p=>!p.title||!p.description)){$("#projects-status").textContent="Every card needs a title and summary.";return false}if(projects.some(p=>p.url&&!validWebUrl(p.url))){$("#projects-status").textContent="Project links must start with https:// or http://.";return false}if(projects.some(p=>!validImageSource(p.image))){$("#projects-status").textContent="Card image URLs must be valid http(s) URLs or image data.";return false}content.projects=projects;if(!save(KEY,content))return false;renderProjects();$("#projects-status").textContent="Cards saved in this browser. Refresh the homepage to preview.";toast("Project cards saved locally");return true}
$("#save-projects").addEventListener("click",()=>saveProjects(projectDrafts()));
$("#add-project").addEventListener("click",()=>{const drafts=projectDrafts();drafts.push({title:"New project",description:"Add a short project summary.",meta:"PROJECT",tags:[],url:"",image:"",kind:"custom"});if(saveProjects(drafts))$("#projects-status").textContent="Card added. Edit its details, then save."});
$("#project-editor-list").addEventListener("click",event=>{const button=event.target.closest("[data-remove-card]");if(!button)return;const drafts=projectDrafts();drafts.splice(Number(button.dataset.removeCard),1);saveProjects(drafts)});
$("#reset-projects").addEventListener("click",()=>{content.projects=structuredClone(defaults.projects);if(save(KEY,content)){renderProjects();$("#projects-status").textContent="Default cards restored."}});
function renderContact(){const contact={...defaults.contact,...content.contact};$("#contact-address").value=contact.email;$("#contact-copy").value=contact.message}
$("#contact-form").addEventListener("submit",event=>{event.preventDefault();content.contact={email:$("#contact-address").value.trim(),message:$("#contact-copy").value.trim()};if(save(KEY,content)){ $("#contact-status").textContent="Contact details saved in this browser.";toast("Contact details saved locally")}});
function renderLinks(){$("#links-list").innerHTML=links.map((link,i)=>`<div class="link-row"><input aria-label="Link label" data-label="${i}" value="${esc(link.label)}" placeholder="Label" maxlength="40"><input aria-label="Link URL" data-url="${i}" type="url" value="${esc(link.url)}" placeholder="https://example.com"><select aria-label="Category" data-type="${i}">${["Social","Code","Video","Writing","Business","Other"].map(type=>`<option ${link.type===type?"selected":""}>${type}</option>`).join("")}</select><button type="button" data-remove="${i}" aria-label="Remove link">×</button></div>`).join("");$$("[data-remove]").forEach(button=>button.addEventListener("click",()=>{links.splice(Number(button.dataset.remove),1);renderLinks()}))}
function setTheme(theme){const light=theme==="light";document.documentElement.dataset.adminTheme=light?"light":"dark";localStorage.setItem("bhawishya-theme",light?"light":"dark");const button=$("#admin-theme-toggle");button.textContent=light?"☼ Light theme":"☾ Dark theme";button.setAttribute("aria-label",light?"Switch to light theme":"Switch to dark theme");$$(".theme-card").forEach(card=>card.classList.toggle("selected",card.dataset.themeChoice===(light?"light":"dark")))}
setTheme(localStorage.getItem("bhawishya-theme")==="light"?"light":"dark");
$("#admin-theme-toggle").addEventListener("click",()=>setTheme(document.documentElement.dataset.adminTheme==="dark"?"light":"dark"));
$$(".theme-card").forEach(card=>card.addEventListener("click",()=>{setTheme(card.dataset.themeChoice);toast((card.dataset.themeChoice==="light"?"Lunar":"Solar")+" theme selected")}));
$("#add-link").addEventListener("click",()=>{links.push({label:"",url:"",type:"Other"});renderLinks()});
$("#links-form").addEventListener("submit",e=>{e.preventDefault();const rows=$$(".link-row");const next=rows.map((r,i)=>({label:$(`[data-label="${i}"]`).value.trim(),url:$(`[data-url="${i}"]`).value.trim(),type:$(`[data-type="${i}"]`).value})).filter(l=>l.label);if(next.some(l=>l.url&&!validWebUrl(l.url))){$("#links-status").textContent="Use a full https:// or http:// URL.";return}links=next;if(save(LINKS,links)){$("#links-status").textContent="Links saved in this browser and shown on the homepage.";toast("Social links saved locally")}});
renderHome();renderProjects();renderContact();renderLinks();
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