console.log('Firefox Marketplace Statistics');

require.config({
    enforceDefine: true,
    paths: {
        'jquery': 'lib/jquery-2.0.2',
        'd3': 'lib/d3.v3-min',
        'brick': 'lib/brick',
        'underscore': 'lib/underscore',
        'nunjucks': 'lib/nunjucks',
        'nunjucks.compat': 'lib/nunjucks.compat',
        'templates': '../../templates',
        'settings': ['settings_local', 'settings'],
        'format': 'lib/format'
    }
});

(function() {

    define(
        'main',
        [
            'underscore',
            'brick',
            'd3',
            'helpers',  // Must come before mostly everything else.
            'capabilities',
            'forms',
            'l10n',
            'log',
            'login',
            'navigation',
            'templates',
            //'tracking',
            'user_helpers',
            'user',
            'z'
        ],
    function() {
        var log = require('log');
        var console = log('main');
        console.log('Dependencies resolved, starting init');

        var capabilities = require('capabilities');
        var nunjucks = require('templates');
        var settings = require('settings');
        var z = require('z');

        nunjucks.env.dev = true;

        var nunjucks_globals = require('nunjucks').require('globals');
        nunjucks_globals.user_helpers = require('user_helpers');

        z.body.addClass('html-' + require('l10n').getDirection());

        z.page.one('loaded', function() {
            console.log('Hiding splash screen');
            $('#splash-overlay').addClass('hide');
        });

        // This lets you refresh within the app by holding down command + R.
        if (capabilities.chromeless) {
            window.addEventListener('keydown', function(e) {
                if (e.keyCode == 82 && e.metaKey) {
                    window.location.reload();
                }
            });
        }

        // Do some last minute template compilation.
        z.page.on('reload_chrome', function() {
            console.log('Reloading chrome');
            var context = {z: z, REGIONS: settings.REGION_CHOICES_SLUG};
            $('#site-header').html(
                nunjucks.env.render('header.html', context));
            $('#site-footer').html(
                nunjucks.env.render('footer.html', context));

            z.body.toggleClass('logged-in', require('user').logged_in());
            z.page.trigger('reloaded_chrome');
        }).trigger('reload_chrome');

        z.body.on('click', '.site-header .back', function(e) {
            e.preventDefault();
            console.log('← button pressed');
            require('navigation').back();
        });

        // Perform initial navigation.
        console.log('Triggering initial navigation');
        if (!z.spaceheater) {
            z.page.trigger('navigate', [window.location.pathname + window.location.search]);
        } else {
            z.page.trigger('loaded');
        }

        // Debug page
        (function() {
            var to = false;
            z.doc.on('touchstart mousedown', '.wordmark', function(e) {
                console.log('hold for debug...', e.type);
                clearTimeout(to);
                to = setTimeout(function() {
                    console.log('navigating to debug...');
                    z.page.trigger('navigate', ['/debug']);
                }, 3000);
            }).on('touchend mouseup', '.wordmark', function(e) {
                console.log('debug hold released...', e.type);
                clearTimeout(to);
            });
        })();

        console.log('Initialization complete');
    });

})();
