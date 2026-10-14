/* Swirl House website logic: menu, order drawer, WhatsApp message, admin page */
(function(){
"use strict";
var DATA=window.SWIRL_DATA;
var IMGS=window.SWIRL_IMGS;
var app=document.getElementById('app');

function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function money(n){return '₦'+Number(n||0).toLocaleString('en-NG')}
function lsGet(k,d){try{var v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}}
function lsSet(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function lsDel(k){try{localStorage.removeItem(k)}catch(e){}}
function allItems(d){var o=[];d.categories.forEach(function(c){c.items.forEach(function(i){o.push(i)})});return o}
function findItem(id){return allItems(DATA).filter(function(i){return i.id===id})[0]}
function lines(s){return String(s||'').split('\n').map(function(x){return x.trim()}).filter(Boolean)}
function clone(o){return JSON.parse(JSON.stringify(o))}
function photo(key,alt){
  var m=IMGS[key];
  if(!m||!m.u){return '<div class="ph ph-empty"><img src="'+IMGS.logo.u+'" alt=""></div>'}
  var r=m.w/m.h;
  return '<div class="ph'+((r>2||r<0.9)?' contain':'')+'"><img src="'+m.u+'" alt="'+esc(alt)+'" width="'+m.w+'" height="'+m.h+'"></div>';
}

/* ---------- customer state ---------- */
var cart=lsGet('swirl_cart',{});
var form=lsGet('swirl_form',{name:'',phone:'',mode:'delivery',address:'',pay:'cash'});
var drawerOpen=false, done=null, errs={};

function cartLines(){
  var out=[];
  Object.keys(cart).forEach(function(id){
    var it=findItem(id); var l=cart[id];
    if(it&&it.available!==false&&l.q>0){out.push({it:it,q:l.q,note:l.note||''})}
  });
  return out;
}
function total(){return cartLines().reduce(function(s,l){return s+l.it.price*l.q},0)}
function count(){return cartLines().reduce(function(s,l){return s+l.q},0)}
function saveCart(){lsSet('swirl_cart',cart)}

/* ---------- customer view ---------- */
function actHTML(it){
  if(it.available===false){return '<span class="sold">Sold out</span>'}
  var l=cart[it.id];
  if(l&&l.q>0){
    return '<div class="step"><button type="button" data-act="dec" data-id="'+it.id+'" aria-label="Remove one '+esc(it.name)+'">−</button><output>'+l.q+'</output><button type="button" data-act="inc" data-id="'+it.id+'" aria-label="Add one '+esc(it.name)+'">+</button></div>';
  }
  return '<button type="button" class="btn sm" data-act="inc" data-id="'+it.id+'">Add to order</button>';
}
function cardHTML(it){
  var ls=lines(it.desc);
  return '<article class="card">'+photo(it.img,it.name)+'<div class="body"><h3>'+esc(it.name)+'</h3>'+
    (ls.length?'<ul>'+ls.map(function(x){return '<li>'+esc(x)+'</li>'}).join('')+'</ul>':'')+
    (it.tag?'<p class="tag">'+esc(it.tag)+'</p>':'')+
    '<div class="foot"><span class="price">'+money(it.price)+'</span><div class="act" data-id="'+it.id+'">'+actHTML(it)+'</div></div></div></article>';
}
function fl(key,alt,cls){
  var m=IMGS[key]; if(!m)return '';
  return '<img class="fl '+cls+'" src="'+m.u+'" alt="'+esc(alt)+'" width="'+m.w+'" height="'+m.h+'">';
}
function packCats(){return DATA.categories.filter(function(c){return c.id!=='menu'})}
function menuCat(){return DATA.categories.filter(function(c){return c.id==='menu'})[0]}
function packHTML(){
  var h='';
  packCats().forEach(function(c){
    h+='<div class="catcard"><h3>'+esc(c.title)+'</h3>'+(c.sub?'<p class="sub">'+esc(c.sub)+'</p>':'')+(c.note?'<p class="note">'+esc(c.note)+'</p>':'')+'</div>';
    c.items.forEach(function(it){h+=cardHTML(it)});
  });
  return h;
}
function lineupHTML(){
  var m=menuCat(); if(!m)return '';
  return '<section class="lineup wrap" id="lineup"><h2 class="mega">The Lineup<span>.</span></h2>'+
    '<p class="lead"><b>'+esc(m.title)+'</b> • '+esc(m.sub||'')+'</p>'+
    '<span class="quality">Premium Quality • Fresh Daily</span>'+
    '<div class="grid">'+m.items.map(cardHTML).join('')+'</div></section>';
}
function siteHTML(){
  var d=DATA;
  return '<header class="top"><div class="wrap"><button class="brand" type="button" data-act="top" aria-label="Swirl House home"><img src="'+IMGS.logo.u+'" alt="Swirl House logo"><span><b>SWIRL HOUSE</b><small>Happiness in every swirl</small></span></button>'+
    '<nav class="nav" aria-label="Sections"><button type="button" data-act="jump" data-id="combo">The Combo</button><button type="button" data-act="jump" data-id="packages">Packages</button><button type="button" data-act="jump" data-id="lineup">The Lineup</button></nav>'+
    '<button type="button" class="btn gold" data-act="open"><span>Your order</span><span class="count" id="hcount">0</span></button></div></header>'+
    (d.banner?'<p class="banner wrap">'+esc(d.banner)+'</p>':'')+

    /* scene 1: hero */
    '<section class="scene" id="top" data-scene data-len="2"><div class="stage hero-stage"><div class="hero-grid">'+
      '<div class="hero-copy" data-scrub data-from="0" data-to="0.6">'+
        '<img class="hero-logo" src="'+IMGS.logo.u+'" alt="Swirl House" width="'+IMGS.logo.w+'" height="'+IMGS.logo.h+'">'+
        '<p class="kicker">Good Food • Great Company • Better Days ♡</p>'+
        '<h1 class="mega">Happiness<br>in every <em>swirl</em></h1>'+
        '<ul class="badges"><li><i aria-hidden="true">❀</i>Fresh<br>Ingredients</li><li><i aria-hidden="true">★</i>Great<br>Taste</li><li><i aria-hidden="true">☺</i>Student<br>Friendly</li></ul>'+
        '<div class="cta"><button type="button" class="btn gold" data-act="open">Start your order</button><button type="button" class="btn" data-act="jump" data-id="packages">See packages</button></div>'+
      '</div>'+
      '<div class="hero-art">'+fl('doubleflavor','Double flavour ice cream','a')+fl('shawarma1','Shawarma','b')+fl('singlecone','Ice cream cone','c')+
        '<img class="stampimg" src="'+IMGS.stamp.u+'" alt="Ice Cream, Shawarma, Drinks, Good Vibes" width="'+IMGS.stamp.w+'" height="'+IMGS.stamp.h+'"></div>'+
    '</div><div class="cue" aria-hidden="true"><span>Scroll</span><i></i></div></div></section>'+

    /* scene 2: the combo pulls apart */
    '<section class="scene" id="combo" data-scene data-len="2.8"><div class="stage combo-stage">'+
      '<div class="chead"><h2 class="mega sm">The Combo<span>.</span></h2><p class="script">Shawarma, ice cream and a cold drink</p></div>'+
      '<div class="xp">'+
        '<figure class="xp-item xp-cup" data-scrub data-from="0.05" data-to="0.7">'+fl('singleflavor','Swirl ice cream','')+'<figcaption><b>Ice cream</b><small>Plain or double-flavour swirl</small></figcaption></figure>'+
        '<figure class="xp-item xp-sh" data-scrub data-from="0.05" data-to="0.7">'+fl('shawarma1','Shawarma','')+'<figcaption><b>Shawarma</b><small>Fresh ingredients, wrapped hot</small></figcaption></figure>'+
        '<figure class="xp-item xp-dr" data-scrub data-from="0.05" data-to="0.7">'+fl('fanta','Fanta','')+fl('cola','Coke','')+'<figcaption><b>Drinks</b><small>Fanta or Coke</small></figcaption></figure>'+
      '</div>'+
      '<div class="ccta"><button type="button" class="btn gold" data-act="jump" data-id="packages">See the packages</button></div>'+
    '</div></section>'+

    /* scene 3: packages slide sideways */
    '<section class="scene" id="packages" data-scene data-horizontal><div class="stage pack-stage">'+
      '<div class="phead"><h2 class="mega sm">Packages<span>.</span></h2><p class="script">Good food tastes better together</p></div>'+
      '<div class="viewport"><div class="track">'+packHTML()+'</div></div>'+
      '<div class="prog" aria-hidden="true"><i></i></div>'+
    '</div></section>'+

    lineupHTML()+

    '<div class="wrap">'+
    '<div class="strip"><div><span class="lbl">Visit us at</span><p class="big">'+esc(d.location1)+'<small>'+esc(d.location2)+'</small></p></div>'+
    '<div><span class="lbl">Order now</span><p class="num">'+esc(d.display)+'</p></div>'+
    '<button type="button" class="btn gold" data-act="open">Start your order</button></div>'+
    '<ul class="values"><li>Rich Flavors</li><li>Premium Ingredients</li><li>Fresh Always</li></ul>'+
    '<div class="thanks"><p class="script">Thank you!</p><p>Come for the swirl, stay for the joy.</p></div>'+
    '<footer><div class="small"><span>Good Food • Great Company • Better Days</span><button type="button" data-act="admin">Admin</button></div></footer></div>'+
    '<div class="bar" id="bar" hidden><div class="in"><span><b id="bcount">0</b> items · <b id="btotal">₦0</b></span><button type="button" class="btn gold" data-act="open">View order</button></div></div>'+
    '<div id="layer"></div>';
}
function refreshChrome(){
  var n=count(), t=total();
  var h=document.getElementById('hcount'); if(h)h.textContent=n;
  var b=document.getElementById('bar'); if(b)b.hidden=!(n>0)||drawerOpen;
  var bc=document.getElementById('bcount'); if(bc)bc.textContent=n;
  var bt=document.getElementById('btotal'); if(bt)bt.textContent=money(t);
  var acts=document.querySelectorAll('.act');
  for(var i=0;i<acts.length;i++){var it=findItem(acts[i].getAttribute('data-id')); if(it)acts[i].innerHTML=actHTML(it)}
}

function orderText(ref){
  var d=DATA, ls=cartLines(), s='*NEW ORDER – Swirl House*\nOrder: '+ref+'\n\n';
  s+='Name: '+form.name.trim()+'\nPhone: '+form.phone.trim()+'\n';
  s+='Type: '+(form.mode==='delivery'?'Delivery':'Pickup ('+d.location1+', '+d.location2+')')+'\n';
  if(form.mode==='delivery')s+='Address: '+form.address.trim()+'\n';
  s+='Payment: '+(form.pay==='cash'?'Pay on '+(form.mode==='delivery'?'delivery':'pickup'):'Bank transfer (please send account details / I will send proof here)')+'\n\n*Items*\n';
  ls.forEach(function(l){s+=l.q+' x '+l.it.name+' – '+money(l.it.price*l.q)+'\n';if(l.note.trim())s+='   Note: '+l.note.trim()+'\n'});
  s+='\n*Total: '+money(total())+'*';
  if(form.mode==='delivery')s+='\n(Delivery fee to be confirmed)';
  return s;
}
function newRef(){
  var n=new Date(),p=function(x){return String(x).padStart(2,'0')};
  return 'SH-'+p(n.getMonth()+1)+p(n.getDate())+'-'+p(n.getHours())+p(n.getMinutes());
}
function waUrl(text){return 'https://wa.me/'+DATA.whatsapp+'?text='+encodeURIComponent(text)}

function drawerHTML(){
  var ls=cartLines();
  var head='<header><h2>Your order</h2><button type="button" class="btn sm" data-act="close">Close</button></header>';
  if(done){
    return '<div class="shade" data-act="close"></div><aside class="drawer" role="dialog" aria-label="Your order">'+head+
      '<div class="scroll"><p class="script" style="font-size:1.9rem;color:var(--gold-hi);margin:0">Almost done</p>'+
      '<p style="margin:0">WhatsApp should have opened with your order ready to send. Tap <b>Send</b> in WhatsApp to place it. The order is not placed until you send the message.</p>'+
      '<div class="box" id="donetext">'+esc(done.text)+'</div>'+
      '<p class="hint">If WhatsApp did not open, copy the message and send it to '+esc(DATA.display)+'.</p></div>'+
      '<div class="end"><a class="btn gold" href="'+waUrl(done.text)+'" target="_blank" rel="noopener">Open WhatsApp again</a>'+
      '<button type="button" class="btn" data-act="copy">Copy order message</button>'+
      '<button type="button" class="btn" data-act="neworder">Start a new order</button></div></aside>';
  }
  if(!ls.length){
    return '<div class="shade" data-act="close"></div><aside class="drawer" role="dialog" aria-label="Your order">'+head+
      '<div class="scroll"><p class="empty">Your order is empty.<br>Add combos or menu items and they will show up here.</p></div>'+
      '<div class="end"><button type="button" class="btn gold" data-act="close">Browse the menu</button></div></aside>';
  }
  var items=ls.map(function(l){
    var ph=(l.it.choice)?'Which drinks? e.g. 2 Fanta, 2 Coke':'Note (optional)';
    return '<div class="line"><div class="r"><span class="nm">'+esc(l.it.name)+'</span><span class="sum">'+money(l.it.price*l.q)+'</span></div>'+
      '<div class="r"><div class="step"><button type="button" data-act="dec" data-id="'+l.it.id+'" aria-label="Remove one">−</button><output>'+l.q+'</output><button type="button" data-act="inc" data-id="'+l.it.id+'" aria-label="Add one">+</button></div>'+
      '<button type="button" class="btn sm" data-act="rm" data-id="'+l.it.id+'">Remove</button></div>'+
      '<input type="text" data-note="'+l.it.id+'" value="'+esc(l.note)+'" placeholder="'+esc(ph)+'" aria-label="Note for '+esc(l.it.name)+'"></div>';
  }).join('');
  var bank=(DATA.bank&&form.pay==='transfer')?'<div class="box">'+esc(DATA.bank)+'</div>':'';
  var form2=
    '<div class="field"><span>Your name</span><input type="text" id="f-name" autocomplete="name" value="'+esc(form.name)+'">'+(errs.name?'<p class="err">'+errs.name+'</p>':'')+'</div>'+
    '<div class="field"><span>Phone number</span><input type="tel" id="f-phone" autocomplete="tel" inputmode="tel" value="'+esc(form.phone)+'" placeholder="0801 234 5678">'+(errs.phone?'<p class="err">'+errs.phone+'</p>':'')+'</div>'+
    '<div class="field"><span class="legend">Delivery or pickup</span><div class="seg"><label><input type="radio" name="mode" value="delivery"'+(form.mode==='delivery'?' checked':'')+'>Delivery</label><label><input type="radio" name="mode" value="pickup"'+(form.mode==='pickup'?' checked':'')+'>Pickup</label></div></div>'+
    (form.mode==='delivery'?'<div class="field"><span>Delivery address</span><textarea id="f-address" autocomplete="street-address">'+esc(form.address)+'</textarea>'+(errs.address?'<p class="err">'+errs.address+'</p>':'')+'</div>':'<p class="hint">Pickup: '+esc(DATA.location1)+', '+esc(DATA.location2)+'.</p>')+
    '<div class="field"><span class="legend">Payment</span><div class="seg"><label><input type="radio" name="pay" value="cash"'+(form.pay==='cash'?' checked':'')+'>Pay on '+(form.mode==='delivery'?'delivery':'pickup')+'</label><label><input type="radio" name="pay" value="transfer"'+(form.pay==='transfer'?' checked':'')+'>Bank transfer</label></div>'+
    (form.pay==='transfer'?(bank||'<p class="hint">Account details will be sent to you on WhatsApp.</p>'):'')+'</div>';
  return '<div class="shade" data-act="close"></div><aside class="drawer" role="dialog" aria-label="Your order">'+head+
    '<div class="scroll"><div>'+items+'</div>'+form2+'</div>'+
    '<div class="end"><div class="tot"><span>Total</span><b>'+money(total())+'</b></div>'+
    (form.mode==='delivery'?'<p class="hint">Delivery fee is confirmed on WhatsApp.</p>':'')+
    '<a class="btn gold" id="send" href="#" target="_blank" rel="noopener" data-act="send">Send order on WhatsApp</a>'+
    '<p class="hint">This opens WhatsApp with your order filled in. Tap Send there to place it.</p></div></aside>';
}
function renderLayer(){
  var l=document.getElementById('layer'); if(!l)return;
  l.innerHTML=drawerOpen?drawerHTML():'';
  document.body.style.overflow=drawerOpen?'hidden':'';
  refreshChrome();
}
function validate(){
  errs={};
  if(form.name.trim().length<2)errs.name='Enter your name.';
  if(form.phone.replace(/\D/g,'').length<7)errs.phone='Enter a phone number we can call.';
  if(form.mode==='delivery'&&form.address.trim().length<5)errs.address='Enter your delivery address.';
  return Object.keys(errs).length===0;
}
function copyText(t,btn){
  function fallback(){
    var box=document.getElementById('donetext');
    if(box&&window.getSelection){var r=document.createRange();r.selectNodeContents(box);var s=window.getSelection();s.removeAllRanges();s.addRange(r)}
    if(btn)btn.textContent='Selected – press copy'
  }
  try{navigator.clipboard.writeText(t).then(function(){if(btn)btn.textContent='Copied'},fallback)}catch(e){fallback()}
}

/* ---------- admin ---------- */
var adm={authed:false,tab:'menu',data:null,msg:'',err:'',dirty:false,confirm:null,pinMsg:''};
function sha(s){
  try{return crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)).then(function(b){return Array.prototype.map.call(new Uint8Array(b),function(x){return x.toString(16).padStart(2,'0')}).join('')})}
  catch(e){return Promise.reject(e)}
}
function startAdminData(){
  var dr=lsGet('swirl_draft',null);
  if(dr&&dr.rev===DATA.rev&&dr.data){adm.data=dr.data;adm.dirty=true}
  else{adm.data=clone(DATA);adm.dirty=false}
}
function markDirty(){adm.dirty=true;lsSet('swirl_draft',{rev:DATA.rev,data:adm.data});var s=document.getElementById('dirty');if(s){s.textContent='Unsaved changes';s.className=''}}
function photoOptions(sel){
  var names={classic:'Shawarma + Fanta',coke:'Shawarma + Coke',sweet:'Shawarma + plain ice cream',swirlcombo:'Shawarma + ice cream + Fanta',premium:'Shawarma + double ice cream + Coke',bestie:'Bestie Combo',doublefun:'Double Fun',squad:'Squad Pack',family:'Family Feast',weekendduo:'Weekend Duo',weekendsquad:'Weekend Squad',datenight:'Date Night',campus:'Campus Champion',mega:'Mega Group Pack',burger:'Burger',doubleflavor:'Double flavor cup',singleflavor:'Single flavor cup',singlecone:'Single cone',doublecone:'Double cone',shawarma1:'Shawarma (single sausage)',shawarma2:'Shawarma (double sausage)',chickbeef:'Chicken & Beef combo'};
  var o='<option value="">No photo</option>';
  Object.keys(names).forEach(function(k){o+='<option value="'+k+'"'+(sel===k?' selected':'')+'>'+esc(names[k])+'</option>'});
  return o;
}
function adminLogin(){
  return '<div class="wrap adm"><h1>Swirl House admin</h1><div class="panel" style="margin-top:16px;max-width:420px"><div class="field"><span>Admin PIN</span><input type="password" id="pin" autocomplete="current-password"></div>'+
    (adm.err?'<p class="err">'+esc(adm.err)+'</p>':'')+
    '<button type="button" class="btn gold" data-act="login">Sign in</button><button type="button" class="btn" data-act="site">Back to the site</button></div></div>';
}
function adminMenu(){
  var d=adm.data;
  return d.categories.map(function(c,ci){
    return '<div class="panel"><div class="cols"><div class="field"><span>Section title</span><input type="text" data-cat="'+ci+'" data-k="title" value="'+esc(c.title)+'"></div>'+
      '<div class="field"><span>Small line under title</span><input type="text" data-cat="'+ci+'" data-k="sub" value="'+esc(c.sub||'')+'"></div>'+
      '<div class="field"><span>Script line</span><input type="text" data-cat="'+ci+'" data-k="note" value="'+esc(c.note||'')+'"></div></div>'+
      c.items.map(function(it,ii){
        var key=ci+'-'+ii, del=adm.confirm===key;
        return '<div class="irow"><div class="cols"><div class="field"><span>Name</span><input type="text" data-it="'+key+'" data-k="name" value="'+esc(it.name)+'"></div>'+
          '<div class="field"><span>Price (₦)</span><input type="number" min="0" step="50" inputmode="numeric" data-it="'+key+'" data-k="price" value="'+esc(it.price)+'"></div>'+
          '<div class="field"><span>Photo</span><select data-it="'+key+'" data-k="img">'+photoOptions(it.img)+'</select></div></div>'+
          '<div class="field"><span>What is included (one line each)</span><textarea data-it="'+key+'" data-k="desc">'+esc(it.desc)+'</textarea></div>'+
          '<div class="field"><span>Script note on the card</span><input type="text" data-it="'+key+'" data-k="tag" value="'+esc(it.tag||'')+'"></div>'+
          '<div class="top2"><label class="chk"><input type="checkbox" data-it="'+key+'" data-k="available"'+(it.available!==false?' checked':'')+'>Available to order</label>'+
          '<button type="button" class="btn sm" data-act="delitem" data-key="'+key+'">'+(del?'Tap again to delete':'Delete item')+'</button></div></div>';
      }).join('')+
      '<button type="button" class="btn" data-act="additem" data-ci="'+ci+'">Add an item to this section</button></div>';
  }).join('');
}
function adminOrders(){
  var os=lsGet('swirl_orders',[]);
  return '<div class="panel"><h3>Orders</h3><p class="hint" style="margin:0">Every order and payment request goes to WhatsApp on '+esc(DATA.display)+'. This site does not store customer orders on a server, so the list below only shows orders started from this device.</p>'+
    '<a class="btn gold" href="https://wa.me/'+esc(DATA.whatsapp)+'" target="_blank" rel="noopener">Open WhatsApp chat</a>'+
    (os.length?'<div class="otbl">'+os.map(function(o){return '<div class="orow"><div class="h"><b>'+esc(o.ref)+'</b><span>'+money(o.total)+'</span></div><span>'+esc(o.name)+' · '+esc(o.phone)+' · '+esc(o.mode)+'</span><span class="hint">'+esc(new Date(o.at).toLocaleString('en-NG'))+'</span></div>'}).join('')+'</div><button type="button" class="btn sm" data-act="clearorders">Clear this list</button>':'<p class="empty">No orders started on this device yet.</p>')+'</div>';
}
function adminSettings(){
  var d=adm.data;
  return '<div class="panel"><h3>Contact and ordering</h3><div class="cols">'+
    '<div class="field"><span>WhatsApp number (with country code)</span><input type="text" inputmode="numeric" data-set="whatsapp" value="'+esc(d.whatsapp)+'"><p class="hint">Nigeria: 234 then the number without the leading 0.</p></div>'+
    '<div class="field"><span>Number shown on the site</span><input type="text" data-set="display" value="'+esc(d.display)+'"></div></div>'+
    '<div class="cols"><div class="field"><span>Location line 1</span><input type="text" data-set="location1" value="'+esc(d.location1)+'"></div>'+
    '<div class="field"><span>Location line 2</span><input type="text" data-set="location2" value="'+esc(d.location2)+'"></div></div>'+
    '<div class="field"><span>Announcement banner (leave empty to hide)</span><input type="text" data-set="banner" value="'+esc(d.banner)+'" placeholder="e.g. Closed on Sunday"></div>'+
    '<div class="field"><span>Bank account details shown for transfers</span><textarea data-set="bank" placeholder="Bank, account number, account name">'+esc(d.bank)+'</textarea></div></div>'+
    '<div class="panel"><h3>Change admin PIN</h3><div class="field"><span>New PIN</span><input type="password" id="newpin" autocomplete="new-password"></div>'+
    '<button type="button" class="btn" data-act="setpin">Set new PIN</button>'+(adm.pinMsg?'<p class="hint">'+esc(adm.pinMsg)+'</p>':'')+'</div>';
}
function adminHTML(){
  if(!adm.authed)return adminLogin();
  var body=adm.tab==='menu'?adminMenu():adm.tab==='orders'?adminOrders():adminSettings();
  return '<div class="wrap adm"><div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap"><h1>Swirl House admin</h1><button type="button" class="btn sm" data-act="site">View the site</button></div>'+
    '<div class="tabs" role="tablist">'+[['menu','Menu and prices'],['orders','Orders'],['settings','Settings']].map(function(t){return '<button type="button" class="tab" role="tab" aria-selected="'+(adm.tab===t[0])+'" data-act="tab" data-id="'+t[0]+'">'+t[1]+'</button>'}).join('')+'</div>'+
    body+
    '<div class="savebar"><div><b id="dirty" class="'+(adm.dirty?'':'ok')+'">'+(adm.dirty?'Unsaved changes':'No unsaved changes')+'</b><div class="hint" id="admmsg">'+esc(adm.msg)+'</div></div>'+
    '<div style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="btn sm" data-act="discard">Discard changes</button><button type="button" class="btn gold sm" data-act="publish">Download updated menu file</button></div></div></div>';
}
function downloadData(next){
  var msgEl=document.getElementById('admmsg');
  var text='/* Swirl House menu, prices and settings. Replace js/data.js with this file. */\nwindow.SWIRL_DATA = '+JSON.stringify(next,null,2)+';\n';
  try{
    var a=document.createElement('a');
    a.href=URL.createObjectURL(new Blob([text],{type:'text/javascript'}));
    a.download='data.js';document.body.appendChild(a);a.click();a.remove();
    adm.msg='data.js downloaded. Put it in the js folder of your project (replace the old one), then upload the project again.';
  }catch(e){adm.msg='This browser could not create the file.'}
  if(msgEl)msgEl.textContent=adm.msg;
}
function publish(){
  var msgEl=document.getElementById('admmsg');
  var d=adm.data;
  d.categories.forEach(function(c){c.items.forEach(function(i){i.price=Math.max(0,Math.round(Number(i.price)||0));i.name=String(i.name||'').trim()||'Untitled'})});
  d.whatsapp=String(d.whatsapp).replace(/\D/g,'');
  if(d.whatsapp.length<10){adm.msg='WhatsApp number needs the country code, for example 2349046853140.';if(msgEl)msgEl.textContent=adm.msg;return}
  var next=clone(d);next.rev=(DATA.rev||1)+1;
  /* On the Claude-hosted copy, window.SWIRL_BUILD_DOC exists and publishing updates the live page.
     In the VS Code project it does not exist, so a new data.js file is downloaded instead. */
  var build=window.SWIRL_BUILD_DOC;
  if(!(build&&window.claude&&window.claude.use)){downloadData(next);return}
  if(msgEl)msgEl.textContent='Publishing…';
  window.claude.use('artifact').then(function(art){
    if(!art){adm.msg='Publishing is only available to the site owner while signed in to Claude. Your changes are saved on this device.';if(msgEl)msgEl.textContent=adm.msg;return}
    return art.publish(build(next)).then(function(){lsDel('swirl_draft');adm.msg='Published. The site is reloading with your changes.';if(msgEl)msgEl.textContent=adm.msg},function(e){
      var c=e&&e.code;
      adm.msg=c==='conflict'?'The site was just updated somewhere else. Reload and apply your edits again.':(c==='not_granted'||c==='not_writer')?'Only the site owner can publish changes. Your edits are saved on this device.':'Could not publish ('+(c||'error')+'). Your edits are saved on this device.';
      if(msgEl)msgEl.textContent=adm.msg;
    });
  });
}

/* ---------- scroll scenes ----------
   A .scene is tall; its .stage stays pinned while you scroll through it.
   --p (0 to 1) is how far you are through the scene.
   Elements with data-scrub, data-from, data-to get --t (0 to 1, eased) for that part of the scene.
   The CSS uses --p and --t to move things. */
var Scenes=(function(){
  var list=[],bound=false,ticking=false,vh=0,hh=61;
  var rm=false;
  try{rm=window.matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){}
  function clamp(x){return x<0?0:x>1?1:x}
  function ease(x){return x*x*(3-2*x)}
  function measure(){
    vh=window.innerHeight;
    var hd=document.querySelector('.top'); hh=hd?hd.offsetHeight:61;
    document.documentElement.style.setProperty('--hh',hh+'px');
    list.forEach(function(s){
      s.sh=s.stage.offsetHeight;
      if(s.horiz){
        s.over=Math.max(0,s.track.scrollWidth-s.vp.clientWidth);
        s.el.style.height=Math.round(s.sh+s.over*0.9)+'px';
      }else{
        s.el.style.height=Math.round(s.sh*s.len)+'px';
      }
    });
  }
  function update(){
    ticking=false;
    var top=hh;
    list.forEach(function(s){
      var r=s.el.getBoundingClientRect();
      var span=r.height-s.sh;
      var p=span>0?clamp((top-r.top)/span):0;
      s.el.style.setProperty('--p',p.toFixed(4));
      if(s.horiz){
        s.track.style.transform='translate3d('+(-p*s.over).toFixed(1)+'px,0,0)';
        if(s.bar)s.bar.style.transform='scaleX('+p.toFixed(4)+')';
      }
      s.scr.forEach(function(e){
        e.el.style.setProperty('--t',ease(clamp((p-e.f)/(e.t-e.f))).toFixed(4));
      });
    });
  }
  function request(){if(!ticking){ticking=true;requestAnimationFrame(update)}}
  function onResize(){if(list.length){measure();update()}}
  function init(){
    list=[];
    var root=document.documentElement;
    root.classList.toggle('rm',rm);
    if(rm){return}
    var els=document.querySelectorAll('[data-scene]');
    for(var i=0;i<els.length;i++){
      var el=els[i];
      var s={el:el,stage:el.querySelector('.stage'),horiz:el.hasAttribute('data-horizontal'),len:parseFloat(el.getAttribute('data-len'))||2,scr:[]};
      if(s.horiz){s.track=el.querySelector('.track');s.vp=el.querySelector('.viewport');s.bar=el.querySelector('.prog i')}
      var sc=el.querySelectorAll('[data-scrub]');
      for(var j=0;j<sc.length;j++){s.scr.push({el:sc[j],f:parseFloat(sc[j].getAttribute('data-from'))||0,t:parseFloat(sc[j].getAttribute('data-to'))||1})}
      list.push(s);
    }
    if(!bound){
      bound=true;
      window.addEventListener('scroll',request,{passive:true});
      window.addEventListener('resize',onResize);
      window.addEventListener('load',onResize);
      try{if(document.fonts&&document.fonts.ready)document.fonts.ready.then(onResize)}catch(e){}
    }
    measure();update();
  }
  function stop(){list=[];document.documentElement.classList.remove('rm')}
  return {init:init,stop:stop,refresh:onResize};
})();

/* ---------- routing + render ---------- */
function route(){
  if(location.hash==='#admin'){
    if(!adm.data)startAdminData();
    Scenes.stop();
    app.innerHTML=adminHTML();
    document.body.style.overflow='';
    window.scrollTo(0,0);
  }else{
    app.innerHTML=siteHTML();
    renderLayer();
    Scenes.init();
  }
}
window.addEventListener('hashchange',route);

/* ---------- events ---------- */
document.addEventListener('click',function(e){
  var t=e.target.closest('[data-act]'); if(!t)return;
  var a=t.getAttribute('data-act'), id=t.getAttribute('data-id');
  if(a==='inc'){var l=cart[id]||(cart[id]={q:0,note:''});l.q=Math.min(99,l.q+1);saveCart();refreshChrome();if(drawerOpen){var sc=document.querySelector('.drawer .scroll');var y=sc?sc.scrollTop:0;renderLayer();sc=document.querySelector('.drawer .scroll');if(sc)sc.scrollTop=y}return}
  if(a==='dec'){var l2=cart[id];if(l2){l2.q=Math.max(0,l2.q-1);if(!l2.q)delete cart[id]}saveCart();refreshChrome();if(drawerOpen){var sc2=document.querySelector('.drawer .scroll');var y2=sc2?sc2.scrollTop:0;renderLayer();sc2=document.querySelector('.drawer .scroll');if(sc2)sc2.scrollTop=y2}return}
  if(a==='rm'){delete cart[id];saveCart();renderLayer();return}
  if(a==='open'){drawerOpen=true;renderLayer();return}
  if(a==='close'){drawerOpen=false;renderLayer();return}
  if(a==='jump'){var s=document.getElementById(id);if(s)s.scrollIntoView({behavior:'smooth',block:'start'});return}
  if(a==='top'){window.scrollTo({top:0,behavior:'smooth'});return}
  if(a==='copy'){copyText(done?done.text:'',t);return}
  if(a==='neworder'){done=null;cart={};saveCart();drawerOpen=false;renderLayer();return}
  if(a==='send'){
    if(!validate()){e.preventDefault();var sc3=document.querySelector('.drawer .scroll');var y3=sc3?sc3.scrollTop:0;renderLayer();sc3=document.querySelector('.drawer .scroll');if(sc3)sc3.scrollTop=y3;return}
    var ref=newRef(), text=orderText(ref);
    t.setAttribute('href',waUrl(text));
    var os=lsGet('swirl_orders',[]);os.unshift({ref:ref,name:form.name.trim(),phone:form.phone.trim(),mode:form.mode,total:total(),at:Date.now()});lsSet('swirl_orders',os.slice(0,100));
    done={text:text,ref:ref};
    setTimeout(function(){renderLayer()},60);
    return;
  }
  if(a==='admin'){location.hash='admin';return}
  if(a==='site'){location.hash='';history.replaceState(null,'',location.pathname+location.search);route();return}
  if(a==='login'){
    var pin=(document.getElementById('pin')||{}).value||'';
    sha(pin).then(function(h){if(h===DATA.pinHash){adm.authed=true;adm.err='';route()}else{adm.err='That PIN is not right.';route()}},function(){adm.err='This browser cannot check the PIN here.';route()});
    return;
  }
  if(a==='tab'){adm.tab=id;adm.confirm=null;route();return}
  if(a==='additem'){var c=adm.data.categories[+t.getAttribute('data-ci')];c.items.push({id:'i'+Date.now().toString(36),name:'New item',desc:'',price:0,img:'',tag:'',available:true});markDirty();route();return}
  if(a==='delitem'){var k=t.getAttribute('data-key');if(adm.confirm===k){var p=k.split('-');adm.data.categories[+p[0]].items.splice(+p[1],1);adm.confirm=null;markDirty()}else{adm.confirm=k}route();return}
  if(a==='discard'){lsDel('swirl_draft');adm.data=clone(DATA);adm.dirty=false;adm.msg='Changes discarded.';route();return}
  if(a==='publish'){publish();return}
  if(a==='clearorders'){lsDel('swirl_orders');route();return}
  if(a==='setpin'){
    var np=(document.getElementById('newpin')||{}).value||'';
    if(np.length<4){adm.pinMsg='Use at least 4 characters.';route();return}
    sha(np).then(function(h){adm.data.pinHash=h;markDirty();adm.pinMsg='New PIN ready. Press Download updated menu file to apply it.';route()});
    return;
  }
});
document.addEventListener('input',function(e){
  var t=e.target;
  if(t.hasAttribute('data-note')){var l=cart[t.getAttribute('data-note')];if(l){l.note=t.value;saveCart()}return}
  if(t.id==='f-name'){form.name=t.value;lsSet('swirl_form',form);return}
  if(t.id==='f-phone'){form.phone=t.value;lsSet('swirl_form',form);return}
  if(t.id==='f-address'){form.address=t.value;lsSet('swirl_form',form);return}
  if(!adm.data||location.hash!=='#admin')return;
  var ck=t.getAttribute('data-cat'),it=t.getAttribute('data-it'),st=t.getAttribute('data-set'),k=t.getAttribute('data-k');
  if(ck!==null){adm.data.categories[+ck][k]=t.value;markDirty()}
  else if(it!==null){var p=it.split('-'),o=adm.data.categories[+p[0]].items[+p[1]];o[k]=(t.type==='checkbox')?t.checked:(k==='price'?t.value:t.value);markDirty()}
  else if(st!==null){adm.data[st]=t.value;markDirty()}
});
document.addEventListener('change',function(e){
  var t=e.target;
  if(t.name==='mode'){form.mode=t.value;lsSet('swirl_form',form);renderLayer();return}
  if(t.name==='pay'){form.pay=t.value;lsSet('swirl_form',form);renderLayer();return}
  if(t.tagName==='SELECT'&&t.hasAttribute('data-it')){var p=t.getAttribute('data-it').split('-');adm.data.categories[+p[0]].items[+p[1]].img=t.value;markDirty()}
});
document.addEventListener('keydown',function(e){
  if(e.key==='Escape'&&drawerOpen){drawerOpen=false;renderLayer()}
  if(e.key==='Enter'&&e.target.id==='pin'){var b=document.querySelector('[data-act=login]');if(b)b.click()}
});
route();
})();
