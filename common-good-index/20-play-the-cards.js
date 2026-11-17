// The vote page plays matchups as a feed of cards, one at a time, filled from the Cloud Run service; the
// leaderboard page just loads its table. A card has two halves and its own buttons: swipe left (or ←, or
// the left button) votes for the left one, right votes for the right one, up (or ↓, or Skip) skips, and
// Draw (or = or space) is a tie. The next two cards are loaded ahead, and all three tickets are kept in
// localStorage, so leaving for the leaderboard and coming back shows the same pairs; only a vote or a
// skip draws a new one.
(function () {
    'use strict';
    var game = document.getElementById('game');
    var api = game.dataset.api;

    function offline() {
        return '<p class="note">Couldn\'t reach the server. Reload the page to try again.</p>';
    }

    // Every request gives up after 10 s, so a hung connection can't freeze the page.
    function send(path, options) {
        var controller = new AbortController();
        var timer = setTimeout(function () { controller.abort(); }, 10000);
        return fetch(api + path, Object.assign({ signal: controller.signal }, options))
            .finally(function () { clearTimeout(timer); });
    }

    function get(path) {
        return send(path).then(function (response) {
            if (!response.ok && response.status !== 400 && response.status !== 429) throw new Error(response.status);
            return response.text();
        });
    }

    if ('board' in game.dataset) {  // the leaderboard page
        get('/leaderboard').then(function (html) { game.innerHTML = html; }, function () { game.innerHTML = offline(); });
        return;
    }

    var deck = game.querySelector('.deck');
    var result = game.querySelector('.result');
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var KEEP = 'common-good-deck', HINTED = 'common-good-hinted';
    var busy = false;  // one vote at a time: a fast double gesture can't spend two tickets

    // localStorage can be missing or throw (a private window): then the page simply draws new pairs.
    function remember(key, value) { try { window.localStorage.setItem(key, value); } catch (e) { /* not kept */ } }
    function recall(key) { try { return window.localStorage.getItem(key); } catch (e) { return null; } }

    function cards() { return Array.prototype.slice.call(deck.querySelectorAll('.card:not(.leaving)')); }
    function top() { return cards()[0] || null; }
    function keepDeck() { remember(KEEP, cards().map(function (card) { return card.dataset.token; }).join(',')); }

    // Add the cards in a fragment to the back of the deck, and show what it says was counted or refused.
    function take(html) {
        var box = document.createElement('div');
        box.innerHTML = html;
        box.querySelectorAll('.card').forEach(function (card) { deck.appendChild(card); });
        var message = box.querySelector('.note');
        var slow = box.querySelector('[data-slow]');
        if (message) result.innerHTML = message.innerHTML;
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
                return response.text().then(take);
            })
            .catch(function () { result.innerHTML = offline(); return load(token); })  // refill rather than let the deck run dry
            .then(function () { busy = false; });
        return true;
    }

    function load(first) {
        var keep = (first ? [first] : []).concat((recall(KEEP) || '').split(',')).filter(Boolean).slice(0, 3);
        return get('/deck?keep=' + encodeURIComponent(keep.join(',')))
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
