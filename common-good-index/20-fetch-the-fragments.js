// Fill <div id="game"> with HTML from the Cloud Run service: the first matchup (or the leaderboard), then,
// after each vote, the service's answer, which is the next matchup. Links marked data-load fetch a fresh one.
(function () {
    var game = document.getElementById('game');
    var api = game.dataset.api;
    var busy = false;  // one request at a time, so a double tap can't spend a ticket twice

    function show(response) {
        // The service answers 200, or 400 (vote refused) and 429 (slow down) with a fragment to show.
        if (!response.ok && response.status !== 400 && response.status !== 429) throw new Error(response.status);
        return response.text().then(function (html) { game.innerHTML = html; });
    }

    function offline() {
        game.innerHTML = '<p class="note">Couldn\'t reach the server. <a href="#" data-load="/matchup">Try again</a>.</p>';
    }

    function request(path, options) {
        if (busy) return;
        busy = true;
        fetch(api + path, options).then(show).catch(offline).then(function () { busy = false; });
    }

    game.addEventListener('submit', function (event) {  // a vote
        event.preventDefault();
        var form = event.target;
        request(form.getAttribute('action'), { method: 'POST', body: new URLSearchParams(new FormData(form)) });
    });

    game.addEventListener('click', function (event) {  // "Skip this pair" and friends
        var link = event.target.closest('[data-load]');
        if (!link) return;
        event.preventDefault();
        request(link.dataset.load);
    });

    request(game.dataset.start);
})();
