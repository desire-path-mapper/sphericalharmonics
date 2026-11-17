// Fill <div id="game"> with HTML from the Cloud Run service: the first matchup (or the leaderboard), then,
// after each vote, the service's answer, which is the next matchup. Links marked data-load fetch a fresh one.
(function () {
    var game = document.getElementById('game');
    var api = game.dataset.api;

    function show(response) {
        return response.text().then(function (html) { game.innerHTML = html; });
    }

    function offline() {
        game.innerHTML = '<p class="note">Couldn\'t reach the server. Try again in a moment.</p>';
    }

    function load(path) {
        fetch(api + path).then(show).catch(offline);
    }

    game.addEventListener('submit', function (event) {  // a vote
        event.preventDefault();
        var form = event.target;
        fetch(api + form.getAttribute('action'), { method: 'POST', body: new URLSearchParams(new FormData(form)) })
            .then(show).catch(offline);
    });

    game.addEventListener('click', function (event) {  // "Skip this pair" and friends
        var link = event.target.closest('[data-load]');
        if (!link) return;
        event.preventDefault();
        load(link.dataset.load);
    });

    load(game.dataset.start);
})();
