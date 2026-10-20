/* menu on phones, and the forms. Until the sign-up database is set up (SIGNUP_URL), forms open an email instead. */
var SIGNUP_URL=''; /* e.g. your Supabase REST URL for the beta_signups table */ var SIGNUP_KEY=''; var CONTACT_EMAIL='info@clearpath360.co.uk';
document.addEventListener('DOMContentLoaded', function(){
  var b=document.querySelector('.burger'), m=document.querySelector('nav.menu'); if(b&&m) b.onclick=function(){ m.classList.toggle('open'); };
  var here=location.pathname.split('/').pop()||'index.html'; document.querySelectorAll('nav.menu a').forEach(function(a){ if(a.getAttribute('href')===here) a.classList.add('on'); });
  document.querySelectorAll('form.f').forEach(function(f){ f.addEventListener('submit', function(e){ e.preventDefault(); var d={}; new FormData(f).forEach(function(v,k){ d[k]=v; }); d.form=f.dataset.form||'form'; d.sent=new Date().toISOString();
    if(SIGNUP_URL){ fetch(SIGNUP_URL, {method:'POST', headers:{'Content-Type':'application/json','apikey':SIGNUP_KEY,'Authorization':'Bearer '+SIGNUP_KEY,'Prefer':'return=minimal'}, body:JSON.stringify(d)}).then(function(){ f.classList.add('sent'); f.reset(); }).catch(function(){ alert('Could not send it. Please email '+CONTACT_EMAIL); }); }
    else { var body=Object.keys(d).map(function(k){ return k+': '+d[k]; }).join('\n'); location.href='mailto:'+CONTACT_EMAIL+'?subject='+encodeURIComponent('Scan Bench '+d.form)+'&body='+encodeURIComponent(body); f.classList.add('sent'); } }); });
});
