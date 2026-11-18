// Every page of the section runs this script; #game's data-mode says which page it is:
// - infinite: matchups as a feed of cards, one at a time. A card has two halves and its own buttons: swipe
//   left (or ←, or the left button) votes for the left one, right for the right one, up (or ↓, or Skip)
//   skips, and Draw (or = or space) is a tie. The next two are loaded ahead, and their tickets are kept in
//   localStorage, so the same pairs come back after a visit to the leaderboard.
// - daily: the Daily 10, the same cards with a progress bar, then the result in a modal.
// - pair: a shared card first, then the Daily 10 it came from, or infinite mode.
// - board, players, result: the tables, and a shared Daily 10 result.
// Players sign in with X or Bluesky. The only lasting cookie is the sign-in session (cgi_session, set here, first-party),
// sent as X-Auth. A signed-out tab has a per-tab id (sessionStorage, no cookie), sent as X-Session, so its
// votes can join the account when it signs in.
(function () {
    'use strict';
    var game = document.getElementById('game');
    var api = game.dataset.api;
    var mode = game.dataset.mode;
    var query = new URLSearchParams(location.search);
    var day = query.get('d') || query.get('daily') || '';

    var home = game.dataset.home;
    function cookie(name, value, seconds) {
        document.cookie = name + '=' + value + '; Path=' + home + '; Max-Age=' + seconds + '; SameSite=Lax' +
            (location.protocol === 'https:' ? '; Secure' : '');
    }
    cookie('cgi_player', '', 0);  // the old anonymous cookie: gone
    function sessionToken() {
        var found = document.cookie.match(/(?:^|; )cgi_session=([A-Za-z0-9_-]+)/);
        return found ? found[1] : '';
    }
    var tab = (function () {
        var id = null;
        try { id = sessionStorage.getItem('cgi_tab'); } catch (e) { /* no storage: an id for this page only */ }
        if (!id) { id = crypto.randomUUID(); try { sessionStorage.setItem('cgi_tab', id); } catch (e) { /* kept in memory */ } }
        return id;
    })();

    function offline() {
        return '<p class="note">Couldn\'t reach the server. Reload the page to try again.</p>';
    }

    // Every request gives up after 10 s, so a hung connection can't freeze the page.
    function send(path, options) {
        var controller = new AbortController();
        var timer = setTimeout(function () { controller.abort(); }, 10000);
        options = Object.assign({ signal: controller.signal }, options);
        var who = { 'X-Session': tab };
        if (sessionToken()) who['X-Auth'] = sessionToken();
        options.headers = Object.assign(who, options.headers);
        return fetch(api + path, options).finally(function () { clearTimeout(timer); });
    }

    function get(path) {
        return send(path).then(function (response) {
            if (!response.ok && response.status !== 400 && response.status !== 429) throw new Error(response.status);
            return response.text();
        });
    }

    // Share a link: the phone's share sheet where there is one, else copy it; if neither works (some
    // browsers refuse once the tap is a few moments old), show the link to select by hand.
    function shareLink(form, where) {
        var url;
        function copy() {
            return navigator.clipboard.writeText(url)
                .then(function () { where.textContent = 'Link copied'; })
                .catch(function () { where.textContent = url; });
        }
        return send('/share', { method: 'POST', body: new URLSearchParams(form) })
            .then(function (response) {
                if (!response.ok) throw new Error(response.status);
                return response.json();
            })
            .then(function (answer) {
                url = answer.url;
                if (!navigator.share) return copy();
                return navigator.share({ url: url }).catch(function (error) {
                    if (error && error.name !== 'AbortError') return copy();  // a cancelled sheet is not an error
                });
            })
            .catch(function () { where.textContent = 'Couldn\'t make a link'; });
    }

    // Signing in: X sends the visitor back with ?login=<one-time code>; trade it for a session token, keep the
    // token in our own cookie, and drop the code from the address bar.
    var account = document.querySelector('.account');
    function signInLink(provider) {
        return api + '/auth/' + provider + '/start?session=' + encodeURIComponent(tab) + '&return=' + encodeURIComponent(location.href.split('?')[0] + location.search.replace(/[?&]login=[^&]*/, ''));
    }
    function showAccount(me) {
        if (!account) return;
        account.innerHTML = '';
        if (me.player) {
            var img = document.createElement('img');
            img.src = me.player.avatar; img.alt = ''; img.className = 'avatar'; img.referrerPolicy = 'no-referrer';
            var who = document.createElement('span');
            who.textContent = '@' + me.player.username;
            var out = document.createElement('button');
            out.type = 'button'; out.className = 'sign-out'; out.textContent = 'Sign out';
            account.append(img, who, out);
        } else if (me.sign_in && me.sign_in.length) {  // one link per provider that is on
            account.append('Sign in with ');
            me.sign_in.forEach(function (p, i) {
                var link = document.createElement('a');
                link.href = signInLink(p.name); link.textContent = p.label;
                account.append(i ? ' or ' : '', link);
            });
        }
        account.hidden = !account.childNodes.length;
    }
    function loginFailure(message) {
        if (!account) return;
        var failed = document.createElement('p');
        failed.className = 'note'; failed.setAttribute('role', 'status');
        failed.textContent = message;
        account.insertAdjacentElement('afterend', failed);
    }
    if (query.get('login') === 'failed') loginFailure("Bluesky sign-in didn't finish. Try again.");
    var authenticated = (function () {
        var code = query.get('login');
        if (!code) return Promise.resolve();
        query.delete('login');
        history.replaceState(null, '', location.pathname + (query.toString() ? '?' + query : '') + location.hash);
        if (code === 'failed') return Promise.resolve();
        return send('/auth/login', { method: 'POST', body: new URLSearchParams({ code: code }) })
            .then(function (r) { if (!r.ok) throw new Error('login'); return r.json(); })
            .then(function (answer) { cookie('cgi_session', answer.token, 30 * 24 * 3600); })
            .catch(function () { loginFailure("Sign-in didn't finish. Try again."); });
    })();
    authenticated.then(function () {
        return get('/me').then(function (text) { showAccount(JSON.parse(text)); }, function () {});
    });
    document.addEventListener('click', function (event) {
        if (event.target.closest('.sign-out')) {
            send('/auth/logout', { method: 'POST' }).finally(function () { cookie('cgi_session', '', 0); location.reload(); });
        }
        var prompt = event.target.closest('[data-sign-in]');
        if (prompt) { event.preventDefault(); location.href = signInLink(prompt.dataset.signIn); }
    });

    if (mode === 'board') {  // the People & groups table, or one contender's matches (?c=<id>)
        get(query.get('c') ? '/contender?c=' + encodeURIComponent(query.get('c')) : '/leaderboard?page=' + encodeURIComponent(query.get('page') || '1'))
            .then(function (html) { game.innerHTML = html; }, function () { game.innerHTML = offline(); });
        return;
    }
    if (mode === 'result') {  // a shared Daily 10 result: that player's live score, title and rank
        authenticated.then(function () { return get('/result?day=' + encodeURIComponent(day) + '&p=' + encodeURIComponent(query.get('p') || ''))
; }).then(function (html) { game.innerHTML = html; }, function () { game.innerHTML = offline(); });
        return;
    }
    if (mode === 'players') {  // the Players table: Today or All time
        var box = game.querySelector('.board-box');
        var showBoard = function (which) {
            game.querySelectorAll('[data-board]').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.board === which); });
            get('/players?board=' + which + '&page=' + encodeURIComponent(query.get('page') || '1') + '&day=' + encodeURIComponent(query.get('day') || '')).then(function (html) { box.innerHTML = html; }, function () { box.innerHTML = offline(); });
        };
        game.querySelectorAll('[data-board]').forEach(function (b) { b.addEventListener('click', function () { query.set('board', b.dataset.board); query.delete('page'); history.pushState(null, '', '?' + query); showBoard(b.dataset.board); }); });
        window.addEventListener('popstate', function () { query = new URLSearchParams(location.search); showBoard(query.get('board') === 'all' ? 'all' : 'today'); });
        authenticated.then(function () { showBoard(query.get('board') === 'all' ? 'all' : 'today'); });
        return;
    }

    var deck = game.querySelector('.deck');
    var result = game.querySelector('.result');
    var modal = document.querySelector('.modal');
    var progress = game.querySelector('.progress');
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var KEEP = 'common-good-deck', HINTED = 'common-good-hinted';
    var busy = false;  // one vote at a time: a fast double gesture can't spend two tickets

    // localStorage can be missing or throw (a private window): then the page simply draws new pairs.
    function remember(key, value) { try { window.localStorage.setItem(key, value); } catch (e) { /* not kept */ } }
    function recall(key) { try { return window.localStorage.getItem(key); } catch (e) { return null; } }

    function cards() { return Array.prototype.slice.call(deck.querySelectorAll('.card:not(.leaving)')); }
    function top() { return cards()[0] || null; }
    function keepDeck() {  // only infinite mode keeps its queue; a Daily 10 is kept by the service
        if (mode === 'infinite') remember(KEEP, cards().map(function (card) { return card.dataset.token; }).join(','));
    }

    function showProgress(done) {
        progress.hidden = false;
        progress.querySelector('span').style.width = (done * 10) + '%';
        progress.querySelector('.progress-label').textContent = done + ' / 10 done';
    }

    // The finished Daily 10, in a modal. Closing it goes on to infinite mode.
    function showResult(card) {
        modal.querySelector('.modal-body').innerHTML = '';
        modal.querySelector('.modal-body').appendChild(card);
        modal.hidden = false;
        modal.querySelector('.modal-close').focus();
        showProgress(10);
        if (!top()) deck.innerHTML = '<p class="note">Done for today.</p>';
    }

    // Add the cards in a fragment to the back of the deck, and show what it says was counted or refused, the
    // Daily 10's progress, or its result.
    function take(html) {
        var box = document.createElement('div');
        box.innerHTML = html;
        box.querySelectorAll('.card').forEach(function (card) { deck.appendChild(card); });
        var message = box.querySelector('.note:not(.result-card .note)');
        var slow = box.querySelector('[data-slow]');
        var now = box.querySelector('.progress-now');
        var finished = box.querySelector('[data-finished]');
        if (message && !message.closest('.card')) result.innerHTML = message.innerHTML;
        if (now) { mode = 'daily'; day = now.dataset.day; showProgress(Number(now.dataset.done)); }
        if (finished) { mode = 'daily'; day = finished.dataset.day; showResult(finished); return; }
        if (!top()) deck.innerHTML = slow ? slow.outerHTML : offline();
        keepDeck();
    }

    function dropBallot(card, side) {  // the ballot on that side's button drops into its box
        var button = card && card.querySelector('[data-choice="' + side + '"]');
        if (reduced || !button) return;
        button.classList.remove('drop');
        void button.offsetWidth;  // restart the animation
        button.classList.add('drop');
    }

    // Vote 'a', 'b' or 'tie', or 'skip', on the top card (and only if `card`, when given, is still the top
    // one). Returns false if nothing was sent.
    function choose(choice, card) {
        card = card || top();
        if (!card || card !== top() || busy) return false;
        busy = true;
        var body = new URLSearchParams({ matchup: card.dataset.token });
        if (choice !== 'skip') body.set('choice', choice === 'tie' ? 'tie' : card.querySelector('.half-' + choice).dataset.qid);
        dropBallot(card, choice);
        // The card leaves (up for a skip or a draw, toward the chosen side for a vote) while the next one
        // comes up from below into its place (CSS: .card.leaving + .card). Reduced motion swaps in place.
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });  // back to the top: the next card starts under the header
        card.classList.add('leaving', 'leave-' + choice);
        card.style.transform = '';
        setTimeout(function () { cardSizes.unobserve(card); card.remove(); }, reduced ? 0 : 360);
        keepDeck();
        var token = card.dataset.token;
        send(choice === 'skip' ? '/skip' : '/vote', { method: 'POST', body: body, keepalive: true })
            .then(function (response) {
                // Refused (an expired or used ticket): ask for the deck again with that ticket first, so an
                // expired one comes back as a fresh ticket for the same pair and a used one is dropped.
                if (response.status === 400) return response.text().then(function (html) { take(html); return load(token); });
                if (!response.ok && response.status !== 429) throw new Error(response.status);
                return response.text().then(function (html) {
                    busy = false;  // before the next card shows, so a quick tap on it counts
                    take(html);
                    if (mode === 'pair') { mode = 'infinite'; return load(); }  // a shared card, then infinite mode
                });
            })
            .catch(function () { result.innerHTML = offline(); return load(token); })  // refill rather than let the deck run dry
            .then(function () { busy = false; });
        return true;
    }

    function load(first) {
        var path;
        if (mode === 'daily') {
            path = '/daily?day=' + encodeURIComponent(day);
        } else if (mode === 'pair') {
            path = '/pair?p=' + encodeURIComponent(query.get('p') || '') + (day ? '&daily=' + encodeURIComponent(day) : '');
        } else {
            var keep = (first ? [first] : []).concat((recall(KEEP) || '').split(',')).filter(Boolean).slice(0, 3);
            path = '/deck?keep=' + encodeURIComponent(keep.join(','));
        }
        return get(path)
            .then(function (html) { deck.innerHTML = ''; take(html); hint(); }, function () { if (!top()) deck.innerHTML = offline(); });
    }

    // Once per browser: wiggle the card and drop a ballot on both sides, to show what the page does.
    function hint() {
        if (reduced || recall(HINTED) || !top()) return;
        remember(HINTED, '1');
        deck.classList.add('hint');
        setTimeout(function () { deck.classList.remove('hint'); }, 1000);
        setTimeout(function () { dropBallot(top(), 'a'); dropBallot(top(), 'b'); }, 300);
    }

    // Tall cards scroll until their bottom is visible; a new left/right/up gesture can then drag.
    function sizeCard(card) {
        card.classList.toggle('scrollable', card.offsetHeight > window.innerHeight - 32);
    }
    var cardSizes = new ResizeObserver(function (entries) {
        entries.forEach(function (entry) { sizeCard(entry.target); });
    });
    function watchCards() { cards().forEach(function (card) { sizeCard(card); cardSizes.observe(card); }); }
    new MutationObserver(watchCards).observe(deck, { childList: true });
    window.addEventListener('resize', watchCards);
    deck.addEventListener('toggle', function (event) {
        var card = event.target.closest('.card');
        if (card) { card.classList.toggle('expanded', !!card.querySelector('details[open]')); sizeCard(card); }
    }, true);

    // Capture only an actual drag; taps keep working on every button, summary and link.
    var drag = null, dragged = false;
    function threshold(card) { return Math.max(80, card.offsetWidth * 0.28); }  // past this the vote commits
    function lean(card, dx, dy) {  // highlight the half being moved toward, in proportion to the distance
        var sideways = Math.abs(dx) >= -dy;  // an upward drag is a skip: no half is highlighted
        var strength = sideways ? Math.min(Math.abs(dx) / threshold(card), 1) : 0;
        card.style.setProperty('--lean-a', dx < 0 ? strength : 0);
        card.style.setProperty('--lean-b', dx > 0 ? strength : 0);
    }
    function aim(dx, dy, limit) {
        if (-dy > limit && -dy > Math.abs(dx)) return 'skip';
        if (dx > limit) return 'b';
        if (dx < -limit) return 'a';
        return '';
    }
    deck.addEventListener('pointerdown', function (event) {
        var card = top();
        if (!event.isPrimary || event.button !== 0) return;
        if (!card || busy || !card.contains(event.target)) return;
        var bounds = card.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) return;
        var tall = card.classList.contains('scrollable');
        drag = { card: card, id: event.pointerId, x: event.clientX, y: event.clientY, dx: 0, dy: 0,
                 tall: tall, eligible: !tall || card.getBoundingClientRect().bottom <= window.innerHeight + 4,
                 state: 'pending' };
        dragged = false;  // a press only becomes a drag once it moves; until then a tap stays a tap on its button
    });
    function moveDrag(x, y) {
        drag.dx = x - drag.x;
        drag.dy = y - drag.y;
        if (drag.state === 'scroll' || drag.state === 'blocked') return;
        if (drag.state === 'pending' && Math.hypot(drag.dx, drag.dy) >= 10) {
            dragged = true;
            if (drag.dy > 0 && Math.abs(drag.dy) >= Math.abs(drag.dx)) { drag.state = 'scroll'; return; }
            if (!drag.eligible) { drag.state = Math.abs(drag.dy) >= Math.abs(drag.dx) ? 'scroll' : 'blocked'; return; }
            drag.state = 'dragging';
            drag.card.setPointerCapture(drag.id);
            drag.card.classList.add('dragging');
        }
        if (!dragged) return;
        drag.card.style.transform = 'translate(' + drag.dx + 'px, ' + Math.min(drag.dy, 0) + 'px) rotate(' + drag.dx / 25 + 'deg)';
        lean(drag.card, drag.dx, drag.dy);
    }
    deck.addEventListener('pointermove', function (event) {
        if (drag && event.pointerId === drag.id) moveDrag(event.clientX, event.clientY);
    });
    // Native vertical scrolling stays available until an eligible left/right/up gesture is chosen.
    // Safari needs a non-passive touch listener to cancel an upward page pan before it takes ownership.
    deck.addEventListener('touchmove', function (event) {
        if (drag && event.touches.length === 1) moveDrag(event.touches[0].clientX, event.touches[0].clientY);
        if (drag && drag.state === 'dragging' && event.cancelable) event.preventDefault();
    }, { passive: false });
    function release(event) {
        if (!drag || event.pointerId !== drag.id) return;
        var done = drag;
        drag = null;
        if (done.card.hasPointerCapture(done.id)) done.card.releasePointerCapture(done.id);
        if (done.state !== 'dragging') return;  // a tap: its click does the work
        done.card.classList.remove('dragging');
        var choice = event.type === 'pointerup' ? aim(done.dx, done.dy, threshold(done.card)) : '';
        lean(done.card, 0, 0);  // the highlight fades back
        if (!choice || !choose(choice, done.card)) {  // a short drag snaps back and casts nothing
            done.card.style.transform = '';
        }
    }
    deck.addEventListener('touchstart', function (event) {
        if (drag && event.touches.length > 1) release({ pointerId: drag.id, type: 'pointercancel' });
    }, { passive: true });
    deck.addEventListener('pointerup', release);
    deck.addEventListener('pointercancel', release);
    deck.addEventListener('lostpointercapture', function (event) {
        if (drag && event.target === drag.card) release(event);
    });
    deck.addEventListener('dragstart', function (event) { event.preventDefault(); });

    deck.addEventListener('click', function (event) {
        if (dragged) {
            dragged = false;
            if (event.detail !== 0) { event.preventDefault(); return; }  // suppress pointer clicks, preserve keyboard activation
        }
        var button = event.target.closest('[data-choice]');
        if (button) choose(button.dataset.choice, button.closest('.card'));
        var share = event.target.closest('.share');
        if (share) {
            var card = share.closest('.card'), note = card.querySelector('.share-note');
            shareLink({ kind: 'pair', p: card.dataset.pair, daily: card.dataset.day || '' }, note);
        }
        var past = event.target.closest('[data-continue]') && event.target.closest('[data-past]');
        if (past) {  // after a shared pair already voted on: on in the mode the service said
            mode = past.dataset.mode || 'infinite';
            day = past.dataset.day || '';
            load();
        }
    });

    function closeResult() {  // done with the Daily 10: on to infinite mode (reloading /daily-10/ reopens the result)
        modal.hidden = true;
        location.href = game.dataset.home;
    }
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && !modal.hidden) closeResult();
    });
    document.addEventListener('click', function (event) {  // the result modal and its buttons
        if (event.target.closest('.modal-close') || event.target === modal) closeResult();
        var shareResult = event.target.closest('[data-share-result]');
        if (shareResult) shareLink({ kind: 'result', day: day }, shareResult.parentNode.querySelector('.copied'));
    });

    var KEYS = { ArrowLeft: 'a', ArrowRight: 'b', ArrowDown: 'skip', '=': 'tie', ' ': 'tie' };
    document.addEventListener('keydown', function (event) {
        var choice = KEYS[event.key];
        if (!choice || event.metaKey || event.ctrlKey || event.altKey || event.repeat || event.isComposing) return;
        if (event.target.closest('input, textarea, select, [contenteditable], details')) return;  // typing, or reading an intro
        if (event.key === ' ' && event.target.closest('button, a')) return;  // Space presses a focused button
        event.preventDefault();
        choose(choice);
    });

    authenticated.then(function () { load(); });
})();
