// The vote page plays matchups as a deck of cards, filled from the Cloud Run service; the leaderboard page
// just loads its table. A card has two halves: swipe left (or ←, or the left button) votes for the left
// one, right votes for the right one, up (or ↓) skips, and the middle button (or = or space) is a tie.
// The deck's tickets are kept in localStorage, so leaving for the leaderboard and coming back shows the
// same pairs; only a vote or a skip draws a new one.
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
    var buttons = game.querySelectorAll('[data-choice]');
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var KEEP = 'common-good-deck', HINTED = 'common-good-hinted';
    var busy = false;  // one vote at a time: a fast double gesture can't spend two tickets

    // localStorage can be missing or throw (a private window): then the page simply draws new pairs.
    function remember(key, value) { try { window.localStorage.setItem(key, value); } catch (e) { /* not kept */ } }
    function recall(key) { try { return window.localStorage.getItem(key); } catch (e) { return null; } }

    function cards() { return Array.prototype.slice.call(deck.querySelectorAll('.card:not(.leaving)')); }
    function top() { return cards()[0] || null; }
    function keepDeck() { remember(KEEP, cards().map(function (card) { return card.dataset.token; }).join(',')); }

    function name(card, side) { return card.querySelector('.half-' + side).dataset.name; }
    function label() {
        var card = top();
        buttons.forEach(function (button) {
            var choice = button.dataset.choice;
            button.disabled = !card;
            if (card && (choice === 'a' || choice === 'b')) button.setAttribute('aria-label', 'Vote for ' + name(card, choice));
            if (card && choice === 'tie') button.setAttribute('aria-label', 'Tie between ' + name(card, 'a') + ' and ' + name(card, 'b'));
        });
    }

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
        label();
    }

    function dropBallot(choice) {
        if (reduced) return;
        var sides = choice === 'tie' ? ['tie'] : [choice];
        sides.forEach(function (side) {
            var button = game.querySelector('[data-choice="' + side + '"]');
            button.classList.remove('drop');
            void button.offsetWidth;  // restart the animation
            button.classList.add('drop');
        });
    }

    // Vote 'a', 'b' or 'tie', or 'skip', on the top card (and only if `card`, when given, is still the top
    // one). Returns false if nothing was sent.
    function choose(choice, card) {
        card = card || top();
        if (!card || card !== top() || busy) return false;
        busy = true;
        var body = new URLSearchParams({ matchup: card.dataset.token });
        if (choice !== 'skip') body.set('choice', choice === 'tie' ? 'tie' : card.querySelector('.half-' + choice).dataset.qid);
        dropBallot(choice);
        card.classList.add('leaving', 'leave-' + choice);
        card.removeAttribute('data-aim');
        card.style.transform = '';
        setTimeout(function () { card.remove(); }, reduced ? 0 : 300);
        keepDeck();
        label();
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
            .then(function () { busy = false; label(); });
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
        setTimeout(function () { dropBallot('a'); dropBallot('b'); }, 300);
    }

    // Dragging the top card. A drag that starts on the read-more, a link or a button is not a swipe.
    var drag = null;
    function aim(dx, dy, limit) {
        if (-dy > limit && -dy > Math.abs(dx)) return 'skip';
        if (dx > limit) return 'b';
        if (dx < -limit) return 'a';
        return '';
    }
    deck.addEventListener('pointerdown', function (event) {
        var card = top();
        if (!event.isPrimary || event.button !== 0) return;
        if (!card || busy || !card.contains(event.target) || event.target.closest('details, a, button')) return;
        drag = { card: card, id: event.pointerId, x: event.clientX, y: event.clientY, dx: 0, dy: 0 };
        card.setPointerCapture(event.pointerId);
        card.classList.add('dragging');
    });
    deck.addEventListener('pointermove', function (event) {
        if (!drag || event.pointerId !== drag.id) return;
        drag.dx = event.clientX - drag.x;
        drag.dy = event.clientY - drag.y;
        drag.card.style.transform = 'translate(' + drag.dx + 'px, ' + Math.min(drag.dy, 0) + 'px) rotate(' + drag.dx / 25 + 'deg)';
        drag.card.dataset.aim = aim(drag.dx, drag.dy, 24);
    });
    function release(event) {
        if (!drag || event.pointerId !== drag.id) return;
        var done = drag;
        drag = null;
        done.card.classList.remove('dragging');
        var threshold = Math.max(80, done.card.offsetWidth * 0.28);  // past this the vote commits
        var choice = event.type === 'pointerup' ? aim(done.dx, done.dy, threshold) : '';
        if (!choice || !choose(choice, done.card)) {  // a short drag snaps back and casts nothing
            done.card.style.transform = '';
            done.card.removeAttribute('data-aim');
        }
    }
    deck.addEventListener('pointerup', release);
    deck.addEventListener('pointercancel', release);

    buttons.forEach(function (button) {
        button.addEventListener('click', function () { choose(button.dataset.choice); });
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
