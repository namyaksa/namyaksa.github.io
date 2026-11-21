/* 방문자 댓글 (Firebase Firestore). 남약사님이 승인한 댓글만 보여요.
   FB_CONFIG 가 비어 있으면 아무것도 나타나지 않아요. */
(function(){
  var FB_CONFIG = {
    apiKey: "AIzaSyA-f-HbY5S78myxBH_tLD2x5iP3UH-BicU",
    authDomain: "postcsript.firebaseapp.com",
    projectId: "postcsript",
    storageBucket: "postcsript.firebasestorage.app",
    messagingSenderId: "1047308815027",
    appId: "1:1047308815027:web:8a94501d11e9733361fec6"
  };
  var OWNER_EMAIL = 'namyaksa@gmail.com';
  if(!FB_CONFIG) { window.vcBind=function(){}; return; }

  var SDK='https://www.gstatic.com/firebasejs/10.12.2/';
  var db=null, loading=null;
  function esc(t){var d=document.createElement('div');d.textContent=t;return d.innerHTML;}
  function loadJs(src){return new Promise(function(ok,no){var s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=function(){no(new Error('load'));};document.head.appendChild(s);});}
  function init(){
    if(db) return Promise.resolve(db);
    if(!loading) loading=loadJs(SDK+'firebase-app-compat.js').then(function(){return loadJs(SDK+'firebase-firestore-compat.js');}).then(function(){
      firebase.initializeApp(FB_CONFIG); db=firebase.firestore(); return db;
    });
    return loading;
  }
  function ds(c){ var d=c.ts&&c.ts.toDate?c.ts.toDate():new Date(); return d.getFullYear()+'.'+(d.getMonth()+1)+'.'+d.getDate(); }
  function ms(c){ return c.ts&&c.ts.toMillis?c.ts.toMillis():Date.now(); }
  function snapList(s){ return s.docs.map(function(d){var o=d.data();o.id=d.id;return o;}); }

  function cmHtml(c,admin,title){
    return '<div class="vc-cm"><div class="vc-h">'+esc(c.name)+' · '+ds(c)+(admin?' · <b>'+esc(title||('#'+c.post))+'</b>':'')+'</div><div class="vc-t">'+esc(c.text)+'</div>'+
      (admin?'<div class="vc-ad"><button type="button" class="vc-ok" data-id="'+c.id+'">승인</button><button type="button" class="vc-no" data-id="'+c.id+'">삭제</button></div>':'')+'</div>';
  }

  function bindWrap(w){
    var n=Number(w.dataset.n), loaded=false;
    w.innerHTML='<button type="button" class="vc-btn">💬 방문자 댓글</button><div class="vc-box" hidden></div>';
    var btn=w.querySelector('.vc-btn'), box=w.querySelector('.vc-box');
    function show(){
      var list=box.querySelector('.vc-list'); list.innerHTML='<div class="vc-note">불러오는 중...</div>';
      init().then(function(){ return db.collection('comments').where('post','==',n).where('approved','==',true).get(); }).then(function(s){
        var a=snapList(s).sort(function(x,y){return ms(x)-ms(y);});
        list.innerHTML=a.length?a.map(function(c){return cmHtml(c);}).join(''):'<div class="vc-note">아직 댓글이 없어요. 첫 댓글을 남겨 보세요.</div>';
        btn.textContent='💬 방문자 댓글'+(a.length?' ('+a.length+')':'');
      }).catch(function(){ list.innerHTML='<div class="vc-note">댓글을 불러오지 못했어요. 잠시 후 다시 눌러 주세요.</div>'; });
    }
    function build(){
      box.innerHTML='<div class="vc-list"></div>'+
        '<div class="vc-form"><input type="text" class="vc-name" maxlength="20" placeholder="이름 (20자까지)">'+
        '<input type="text" class="vc-hp" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px;" aria-hidden="true">'+
        '<textarea class="vc-text" maxlength="500" placeholder="댓글을 남겨 주세요 (500자까지)"></textarea>'+
        '<button type="button" class="vc-send">댓글 올리기</button> <span class="vc-note vc-st"></span>'+
        '<div class="vc-note">남약사가 확인한 뒤에 화면에 나타나요. 개인정보나 연락처는 적지 마세요.</div></div>';
      box.querySelector('.vc-send').addEventListener('click',function(){
        var name=box.querySelector('.vc-name').value.trim(), text=box.querySelector('.vc-text').value.trim(), st=box.querySelector('.vc-st'), sb=this;
        if(box.querySelector('.vc-hp').value) return;
        if(!name||!text){ st.textContent='이름과 내용을 모두 적어 주세요.'; return; }
        var last=0; try{last=Number(localStorage.getItem('vc_last')||0);}catch(e){}
        if(Date.now()-last<30000){ st.textContent='잠시 후에 다시 올려 주세요.'; return; }
        sb.disabled=true; st.textContent='올리는 중...';
        init().then(function(){ return db.collection('comments').add({post:n,name:name,text:text,approved:false,ts:firebase.firestore.FieldValue.serverTimestamp()}); })
          .then(function(){ try{localStorage.setItem('vc_last',String(Date.now()));}catch(e){}
            box.querySelector('.vc-text').value=''; st.textContent='✓ 올렸어요. 남약사가 확인하면 나타나요.'; })
          .catch(function(){ st.textContent='올리지 못했어요. 잠시 후 다시 시도해 주세요.'; })
          .then(function(){ sb.disabled=false; });
      });
    }
    btn.addEventListener('click',function(){
      box.hidden=!box.hidden;
      if(!box.hidden && !loaded){ loaded=true; build(); show(); }
    });
  }
  window.vcBind=function(root){ root.querySelectorAll('.vc-wrap').forEach(bindWrap); };

  // ---- 남약사님 전용: 승인 대기 댓글 관리 (Google 로그인) ----
  function titleOf(n){ var a=document.querySelectorAll('.vc-wrap[data-n="'+n+'"]'); return a.length?a[0].dataset.t:''; }
  function adminInit(){
    var head=document.querySelector('.board-head'); if(!head||document.getElementById('vcAdminBtn')) return;
    var owner=false; try{owner=!!localStorage.getItem('board_token_v1');}catch(e){}
    if(!owner && location.hash!=='#admin') return;
    var b=document.createElement('button'); b.type='button'; b.id='vcAdminBtn'; b.className='board-write'; b.style.background='#fff'; b.style.color='#0b63ad'; b.style.border='1px solid #0b63ad';
    b.textContent='💬 댓글 관리'; head.appendChild(b);
    var panel=document.createElement('div'); panel.className='board-form'; panel.hidden=true; head.parentNode.insertBefore(panel,head.nextSibling);
    function loadPending(){
      panel.innerHTML='<div class="vc-note">불러오는 중...</div>';
      db.collection('comments').where('approved','==',false).get().then(function(s){
        var a=snapList(s).sort(function(x,y){return ms(x)-ms(y);});
        panel.innerHTML='<b>승인 대기 댓글 '+a.length+'개</b>'+(a.length?'':'<div class="vc-note">대기 중인 댓글이 없어요.</div>')+a.map(function(c){return cmHtml(c,true,titleOf(c.post));}).join('');
        panel.querySelectorAll('.vc-ok').forEach(function(x){x.addEventListener('click',function(){ db.collection('comments').doc(x.dataset.id).update({approved:true}).then(loadPending).catch(function(e){alert('실패: '+e.message);}); });});
        panel.querySelectorAll('.vc-no').forEach(function(x){x.addEventListener('click',function(){ if(confirm('이 댓글을 삭제할까요?')) db.collection('comments').doc(x.dataset.id).delete().then(loadPending).catch(function(e){alert('실패: '+e.message);}); });});
      }).catch(function(e){ panel.innerHTML='<div class="vc-note">불러오지 못했어요: '+esc(e.message||'')+'</div>'; });
    }
    b.addEventListener('click',function(){
      panel.hidden=!panel.hidden; if(panel.hidden) return;
      panel.innerHTML='<div class="vc-note">로그인 중...</div>';
      init().then(function(){ return loadJs(SDK+'firebase-auth-compat.js'); }).then(function(){
        var u=firebase.auth().currentUser;
        return u?u:firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider()).then(function(r){return r.user;});
      }).then(function(u){
        if(!u||u.email!==OWNER_EMAIL){ panel.innerHTML='<div class="vc-note">남약사님 계정이 아니에요.</div>'; return; }
        loadPending();
      }).catch(function(e){ panel.innerHTML='<div class="vc-note">로그인하지 못했어요: '+esc(e.message||'')+'</div>'; });
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',adminInit); else adminInit();
})();
