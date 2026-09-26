const fs=require('fs'),ts=require('typescript');
const s=fs.readFileSync('src/routes/_authenticated/dashboard.tsx','utf8');
const part=s.slice(s.indexOf('function StatCard('),s.indexOf('function Overview('));
const js=ts.transpileModule(part+'\nexports.StatCard=StatCard;',{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.CommonJS}}).outputText;
const m={};new Function('require','exports',js)(require,m);
let called=0;const el=m.StatCard({label:'New leads',value:7,icon:()=>null,onClick:()=>called++});
if(el.type!=='button'||el.props.type!=='button')throw Error('Not keyboard accessible');
el.props.onClick();if(called!==1||el.props['aria-label']!=='New leads: 7. Open leads')throw Error('Navigation callback failed');
console.log('PASS: accessible stat button and click callback');
