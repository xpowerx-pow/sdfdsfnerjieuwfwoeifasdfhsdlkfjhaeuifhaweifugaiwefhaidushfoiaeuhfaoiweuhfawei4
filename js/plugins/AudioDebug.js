//=============================================================================
// AudioDebug.js
//=============================================================================
/*:
 * @plugindesc Shows an audio diagnostics overlay when the page URL has ?debug.
 *
 * @help
 * Open index.html?debug to show the overlay. Tap "삐 소리 테스트" to play a
 * test beep directly through Web Audio.
 */
(function() {
    if (!/[?&]debug/.test(location.search)) return;

    var errors = [];
    window.addEventListener('error', function(e) { errors.push(String(e.message)); });

    var box = document.createElement('div');
    box.style.cssText = 'position:fixed;left:0;top:0;z-index:99999;background:rgba(0,0,0,.8);' +
        'color:#0f0;font:12px/1.4 monospace;padding:6px;max-width:100vw;white-space:pre-wrap;' +
        'pointer-events:auto;';
    var text = document.createElement('div');
    var beep = document.createElement('button');
    beep.textContent = '삐 소리 테스트';
    beep.style.cssText = 'font-size:16px;margin-top:6px;padding:6px 12px;';
    box.appendChild(text);
    box.appendChild(beep);

    var beepResult = '-';
    function playBeep(e) {
        e.stopPropagation();
        e.preventDefault();
        var c = WebAudio._context;
        if (!c) { beepResult = 'no context'; return; }
        try {
            c.resume();
            var o = c.createOscillator();
            var g = c.createGain();
            g.gain.value = 0.3;
            o.frequency.value = 880;
            o.connect(g); g.connect(c.destination);
            o.start(); o.stop(c.currentTime + 0.4);
            beepResult = 'played, ctx=' + c.state;
        } catch (err) {
            beepResult = 'error: ' + err;
        }
    }
    // The game cancels default touch behavior, so listen for touchend too.
    beep.addEventListener('touchend', playBeep);
    beep.addEventListener('click', playBeep);

    function safe(fn) {
        try { return typeof fn === 'function' ? fn.call(WebAudio) : 'n/a'; } catch (e) { return 'err'; }
    }

    function line(b, name) {
        if (!b) return name + ': none';
        return name + ': ' + b._url + ' ready=' + b.isReady() + ' err=' + b.isError() +
            ' playing=' + b.isPlaying() + ' vol=' + b.volume;
    }

    setInterval(function() {
        if (!document.body.contains(box)) document.body.appendChild(box);
        var c = WebAudio._context;
        text.textContent = [
            'UA: ' + navigator.userAgent,
            'ext: ' + (window.AudioManager ? AudioManager.audioFileExt() : '?') +
                '  ogg=' + safe(WebAudio.canPlayOgg) + ' m4a=' + safe(WebAudio.canPlayM4a),
            'ctx: ' + (c ? c.state + ' sr=' + c.sampleRate + ' t=' + c.currentTime.toFixed(1) : 'none'),
            'audioSession: ' + (navigator.audioSession ? navigator.audioSession.type : 'unsupported'),
            'master vol: ' + (WebAudio._masterVolume !== undefined ? WebAudio._masterVolume : WebAudio._masterGainNode && WebAudio._masterGainNode.gain.value) + '  bgmVol=' + AudioManager.bgmVolume +
                ' seVol=' + AudioManager.seVolume,
            line(AudioManager._bgmBuffer, 'BGM'),
            'beep: ' + beepResult,
            'errors: ' + errors.slice(-3).join(' | ')
        ].join('\n');
    }, 500);
})();
