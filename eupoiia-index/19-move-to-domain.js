// A durable gate: never navigate away while queued votes could still be unsaved.
(function () {
    'use strict';
    var script=document.currentScript, api=script.dataset.api, destination=script.dataset.destination, old=script.dataset.oldPath;
    var status=document.getElementById('migration-status'), retry=document.getElementById('migration-retry'), busy=false;
    var QUEUE='eupoiia-vote-queue-v1';
    function cookie(name) { var m=document.cookie.match(new RegExp('(?:^|; )'+name+'=([A-Za-z0-9_-]+)')); return m ? m[1] : ''; }
    function queue() {
        var raw=localStorage.getItem(QUEUE), items=raw ? JSON.parse(raw) : [];
        if (!Array.isArray(items) || items.length>2000) throw new Error();
        return items;
    }
    function post(path,body) {
        var controller=new AbortController(), timer=setTimeout(function(){controller.abort();},10000);
        return fetch(api+path,{method:'POST',body:new URLSearchParams(body),signal:controller.signal,credentials:'omit',referrerPolicy:'no-referrer'})
            .then(function(r){if(!r.ok && !(path==='/votes' && r.status===409))throw new Error();return r.json();}).finally(function(){clearTimeout(timer);});
    }
    async function move() {
        if(busy)return;busy=true;retry.hidden=true;
        status.textContent='Saving your waiting votes before moving…';
        try {
            // Check storage before counting anything; preserve the old copy for recovery.
            queue();
            var token=cookie('cgi_session'), tab=sessionStorage.getItem('cgi_tab') || '', theme=localStorage.getItem('sh-theme'), me=null, fingerprint='';
            if(token) {
                me=await post('/me',{auth:token});
                var bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token));
                fingerprint=Array.from(new Uint8Array(bytes)).map(function(x){return x.toString(16).padStart(2,'0');}).join('');
            }
            while(queue().length) {
                var item=queue()[0];
                if(!item || typeof item.op!=='string' || !item.form || !/^[0-9a-f-]{36}$/i.test(item.session) ||
                    (item.owner && (!me || !me.player || me.player.handle!==item.owner)) ||
                    (!item.owner && item.credential && item.credential!==fingerprint))throw new Error();
                var body=Object.assign({},item.form,{op:item.op,session:item.session});
                if(item.owner)body.owner=item.owner;
                if(token)body.auth=token;
                var answer=await post('/votes',body);
                if(answer.status!=='saved' && !(answer.status==='refused' && answer.reason==='already_voted'))throw new Error();
                // Re-read after the request so another tab's appended votes are not overwritten.
                localStorage.setItem(QUEUE,JSON.stringify(queue().filter(function(x){return x.op!==item.op;})));
            }
            var payload={v:1,type:'eupoiia-domain',fragment:location.hash};
            if(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(tab))payload.tab=tab;
            if(['light','dark'].includes(theme))payload.theme=theme;
            if(token && me && me.player)payload.code=(await post('/auth/handoff/start',{auth:token})).code;
            var packed=btoa(String.fromCharCode.apply(null,new TextEncoder().encode(JSON.stringify(payload)))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
            if(packed.length>8192 || payload.fragment.length>4096)throw new Error();
            if(queue().length)throw new Error();
            var target=new URL(destination), suffix=location.pathname.slice(old.length);
            if(!location.pathname.startsWith(old) || suffix.startsWith('/'))throw new Error();
            target.pathname+=suffix;target.search=location.search;target.hash='handoff='+packed;
            status.textContent='Opening Eupoiia…';location.replace(target.href);
        } catch(e) {
            status.textContent='Your waiting votes are still here. Reconnect or sign in on the original site, then retry the move.';
            retry.hidden=false;busy=false;
        }
    }
    retry.addEventListener('click',move);move();
})();
