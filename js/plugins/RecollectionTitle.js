//=============================================================================
// RecollectionTitle.js
//=============================================================================
/*:
 * @plugindesc Adds a "회상 방" command to the title screen that jumps
 * straight into the recollection room.
 *
 * @param Command Name
 * @default 회상 방
 *
 * @param Map ID
 * @default 35
 *
 * @param X
 * @default 14
 *
 * @param Y
 * @default 5
 */
(function() {
    var params = PluginManager.parameters('RecollectionTitle');
    var commandName = String(params['Command Name'] || '회상 방');
    var mapId = Number(params['Map ID'] || 35);
    var x = Number(params['X'] || 14);
    var y = Number(params['Y'] || 5);

    var _makeCommandList = Window_TitleCommand.prototype.makeCommandList;
    Window_TitleCommand.prototype.makeCommandList = function() {
        _makeCommandList.call(this);
        var index = this._list.findIndex(function(c) { return c.symbol === 'options'; });
        var cmd = { name: commandName, symbol: 'recollection', enabled: true, ext: null };
        if (index >= 0) {
            this._list.splice(index, 0, cmd);
        } else {
            this._list.push(cmd);
        }
    };

    var _createCommandWindow = Scene_Title.prototype.createCommandWindow;
    Scene_Title.prototype.createCommandWindow = function() {
        _createCommandWindow.call(this);
        this._commandWindow.setHandler('recollection', this.commandRecollection.bind(this));
    };

    // RPG Maker MZ sizes the title command window for exactly 3 rows.
    if (Utils.RPGMAKER_NAME === 'MZ') {
        var _commandWindowRect = Scene_Title.prototype.commandWindowRect;
        Scene_Title.prototype.commandWindowRect = function() {
            var rect = _commandWindowRect.call(this);
            var extra = this.calcWindowHeight(4, true) - this.calcWindowHeight(3, true);
            rect.y -= extra;
            rect.height += extra;
            return rect;
        };
    }

    Scene_Title.prototype.commandRecollection = function() {
        DataManager.setupNewGame();
        $gamePlayer.reserveTransfer(mapId, x, y, 2, 0);
        this._commandWindow.close();
        this.fadeOutAll();
        SceneManager.goto(Scene_Map);
    };
})();
