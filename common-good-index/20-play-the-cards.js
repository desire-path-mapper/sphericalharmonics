// Every page of the section runs this script; #game's data-mode says which page it is:
// - infinite: matchups as a feed of cards, one at a time. A card has two halves and its own buttons: swipe
//   left (or ←, or the left button) votes for the left one, right for the right one, up (or ↓, or Skip)
//   skips, and Draw (or = or space) is a tie. The next two are loaded ahead, and their tickets are kept in
//   localStorage, so the same pairs come back after a visit to the leaderboard.
// - daily: the Daily 10, the same cards with a progress bar, then the result in a modal.
// - pair: a shared card first, then the Daily 10 it came from, or infinite mode.
// - board, players, result: the tables, and a shared Daily 10 result.
// The player is a random id in a first-party cookie, sent to the service as the X-Player header.
(function () {
    'use strict';
    var game = document.getElementById('game');
    var api = game.dataset.api;
    var mode = game.dataset.mode;
    var query = new URLSearchParams(location.search);
    var day = query.get('d') || query.get('daily') || '';

    function playerId() {
        var found = document.cookie.match(/(?:^|; )cgi_player=([0-9a-f-]{36})/);
        if (found) return found[1];
        var id = crypto.randomUUID();
        document.cookie = 'cgi_player=' + id + '; Path=' + game.dataset.home + '; Max-Age=31536000; SameSite=Lax' +
            (location.protocol === 'https:' ? '; Secure' : '');
        return id;
    }
    var player = playerId();

    function tex(root) {  // typeset the formulas once KaTeX has loaded
        if (!window.katex) { setTimeout(function () { tex(root); }, 200); return; }
        root.querySelectorAll('[data-tex]').forEach(function (el) {
            window.katex.render(el.dataset.tex, el, { displayMode: true, throwOnError: false });
        });
    }

    function offline() {
        return '<p class="note">Couldn\'t reach the server. Reload the page to try again.</p>';
    }

    // Every request gives up after 10 s, so a hung connection can't freeze the page.
    function send(path, options) {
        var controller = new AbortController();
        var timer = setTimeout(function () { controller.abort(); }, 10000);
        options = Object.assign({ signal: controller.signal }, options);
        options.headers = Object.assign({ 'X-Player': player }, options.headers);
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

    if (mode === 'board') {
        get('/leaderboard').then(function (html) { game.innerHTML = html; }, function () { game.innerHTML = offline(); });
        return;
    }
    if (mode === 'result') {  // a shared Daily 10 result: that player's live score, title and rank
        get('/result?day=' + encodeURIComponent(day) + '&p=' + encodeURIComponent(query.get('p') || ''))
            .then(function (html) { game.innerHTML = html; tex(game); }, function () { game.innerHTML = offline(); });
        return;
    }
    if (mode === 'players') {  // the Players table: Today or All time; a player may rename themselves
        var box = game.querySelector('.board-box');
        var showBoard = function (which) {
            game.querySelectorAll('[data-board]').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.board === which); });
            get('/players?board=' + which).then(function (html) { box.innerHTML = html; tex(box); }, function () { box.innerHTML = offline(); });
        };
        game.querySelectorAll('[data-board]').forEach(function (b) { b.addEventListener('click', function () { showBoard(b.dataset.board); }); });
        box.addEventListener('submit', function (event) {
            event.preventDefault();
            send('/name', { method: 'POST', body: new URLSearchParams(new FormData(event.target)) })
                .then(function (r) { return r.text().then(function (html) { return { ok: r.ok, html: html }; }); })
                .then(function (answer) {
                    if (answer.ok) showBoard(game.querySelector('[aria-pressed="true"]').dataset.board);
                    else event.target.querySelector('.note').innerHTML = answer.html;  // e.g. a name too long
                });
        });
        showBoard('today');
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
        tex(modal);
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
        setTimeout(function () { card.remove(); }, reduced ? 0 : 360);
        keepDeck();
        var token = card.dataset.token;
        send(choice === 'skip' ? '/skip' : '/vote', { method: 'POST', body: body, keepalive: true })
            .then(function (response) {
                // Refused (an expired or used ticket): ask for the deck again with that ticket first, so an
                // expired one comes back as a fresh ticket for the same pair and a used one is dropped.
                if (response.status === 400) return response.text().then(function (html) { take(html); return load(token); });
                if (!response.ok && response.status !== 429) throw new Error(response.status);
                return response.text().then(function (html) {
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

    // Read more expands the card in place and the page scrolls as usual. While either intro is open the card
    // is "expanded": swiping is off, so scrolling can't vote by accident; its buttons (pinned to the bottom of
    // the screen while the card is taller than it) and the keys still work.
    deck.addEventListener('toggle', function (event) {
        var card = event.target.closest('.card');
        if (card) card.classList.toggle('expanded', !!card.querySelector('details[open]'));
    }, true);

    // Dragging the top card. A drag that starts on the read-more, the source link or a button is not a
    // swipe; one that starts on the picture is (the picture is a link to its file page, opened only by a
    // clean tap, never at the end of a drag).
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
        if (!card || busy || card.classList.contains('expanded')) return;
        if (!card.contains(event.target) || event.target.closest('details, .source, button')) return;
        drag = { card: card, id: event.pointerId, x: event.clientX, y: event.clientY, dx: 0, dy: 0 };
        dragged = false;
        card.setPointerCapture(event.pointerId);
        card.classList.add('dragging');
    });
    deck.addEventListener('pointermove', function (event) {
        if (!drag || event.pointerId !== drag.id) return;
        drag.dx = event.clientX - drag.x;
        drag.dy = event.clientY - drag.y;
        if (Math.abs(drag.dx) + Math.abs(drag.dy) > 6) dragged = true;
        drag.card.style.transform = 'translate(' + drag.dx + 'px, ' + Math.min(drag.dy, 0) + 'px) rotate(' + drag.dx / 25 + 'deg)';
        lean(drag.card, drag.dx, drag.dy);
    });
    function release(event) {
        if (!drag || event.pointerId !== drag.id) return;
        var done = drag;
        drag = null;
        done.card.classList.remove('dragging');
        var choice = event.type === 'pointerup' ? aim(done.dx, done.dy, threshold(done.card)) : '';
        lean(done.card, 0, 0);  // the highlight fades back
        if (!choice || !choose(choice, done.card)) {  // a short drag snaps back and casts nothing
            done.card.style.transform = '';
        }
    }
    deck.addEventListener('pointerup', release);
    deck.addEventListener('pointercancel', release);

    deck.addEventListener('click', function (event) {
        if (dragged && event.target.closest('.picture')) {  // the end of a swipe, not a tap on the picture
            event.preventDefault();
            dragged = false;
            return;
        }
        var button = event.target.closest('[data-choice]');
        if (button) choose(button.dataset.choice, button.closest('.card'));
        var share = event.target.closest('.share');
        if (share) {
            var card = share.closest('.card'), note = card.querySelector('.share-note');
            if (!note) { note = document.createElement('span'); note.className = 'share-note'; note.setAttribute('role', 'status'); share.parentNode.appendChild(note); }
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

    load();
})();
