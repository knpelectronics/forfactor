import { readFile, readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';

const root = new URL('../dist/', import.meta.url);
const files = [];
async function walk(dir) { for (const item of await readdir(dir,{withFileTypes:true})) { const path=join(dir,item.name); item.isDirectory()?await walk(path):files.push(path); } }
await walk(root.pathname);
const htmlFiles=files.filter(f=>f.endsWith('.html'));
const expected=['/','/about/','/products/','/products/keenout/','/products/heela/','/products/pronovo/','/contact/','/privacy/'];
const found=new Set();const errors=[];
for(const file of htmlFiles){const html=await readFile(file,'utf8');const rel=relative(root.pathname,file);const route=rel==='index.html'?'/':`/${rel.replace(/index\.html$/,'')}`;found.add(route);if(rel!=='404.html'&&!html.includes(`rel="canonical" href="https://www.forfactor.com${route}"`))errors.push(`${route}: missing or incorrect canonical`);for(const match of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)){try{JSON.parse(match[1])}catch{errors.push(`${route}: invalid JSON-LD`)}}for(const match of html.matchAll(/href="(\/[^"]*)"/g)){const href=match[1].split('#')[0];if(!href||href.startsWith('/_astro/')||href.includes('.'))continue;const target=href==='/'?'index.html':`${href.replace(/^\//,'')}index.html`;if(!files.some(f=>relative(root.pathname,f)===target))errors.push(`${route}: broken internal link ${href}`);}}
for(const route of expected)if(!found.has(route))errors.push(`missing generated route ${route}`);
const robots=await readFile(new URL('robots.txt',root),'utf8');if(!robots.includes('https://www.forfactor.com/sitemap-index.xml'))errors.push('robots.txt: sitemap URL incorrect');
const sitemap=files.find(f=>/sitemap-0\.xml$/.test(f));if(!sitemap)errors.push('sitemap missing');else{const xml=await readFile(sitemap,'utf8');for(const route of expected)if(!xml.includes(`https://www.forfactor.com${route}`))errors.push(`sitemap missing ${route}`);}
if(errors.length){console.error(errors.join('\n'));process.exit(1)}console.log(`Validated ${htmlFiles.length} HTML files, canonical URLs, internal links, robots.txt and sitemap.`);
