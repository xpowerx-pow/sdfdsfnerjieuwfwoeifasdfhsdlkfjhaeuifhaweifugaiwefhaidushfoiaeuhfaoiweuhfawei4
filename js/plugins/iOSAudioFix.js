//=============================================================================
// iOSAudioFix.js
//=============================================================================
/*:
 * @plugindesc Makes Web Audio work reliably in iPhone/iPad Safari.
 *
 * @help
 * - Plays sound even when the iPhone silent switch is on (iOS 17+).
 * - Resumes the audio context on every tap/click/key press, including the
 *   iOS-only "interrupted" state that RPG Maker MV 1.6 does not handle.
 * - Plays a real silent buffer inside the gesture to unlock audio.
 */
(function() {
    try {
        if (navigator.audioSession) {
            navigator.audioSession.type = 'playback';
        }
    } catch (e) {}

    function unlock() {
        var context = WebAudio._context;
        if (!context) return;
        if (context.state !== 'running' && typeof context.resume === 'function') {
            try { context.resume(); } catch (e) {}
        }
        try {
            var buffer = context.createBuffer(1, 1, 22050);
            var node = context.createBufferSource();
            node.buffer = buffer;
            node.connect(context.destination);
            node.start(0);
        } catch (e) {}
    }

    ['touchstart', 'touchend', 'mousedown', 'click', 'keydown'].forEach(function(type) {
        document.addEventListener(type, unlock, true);
    });

    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'visible') {
            var context = WebAudio._context;
            if (context && context.state !== 'running') {
                try { context.resume(); } catch (e) {}
            }
        }
    });
})();
