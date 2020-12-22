const {Meta, St} = imports.gi;

const Main = imports.ui.main;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const Gio = imports.gi.Gio;

function getSettings() {
    let GioSSS = Gio.SettingsSchemaSource;
    let schemaSource = GioSSS.new_from_directory(
        Me.dir.get_child("schemas").get_path(),
        GioSSS.get_default(),
        false
    );
    let schemaObj = schemaSource.lookup(
        'zhanghai.me.transparentbar', true);
    if (!schemaObj) {
        throw new Error('cannot find schemas');
    }
    return new Gio.Settings({settings_schema: schemaObj});
}

class Extension {
    constructor() {
        this._actorSignalIds = null;
        this._windowSignalIds = null;
        this._settings = getSettings();
    }

    enable() {

        this._actorSignalIds = new Map();
        this._windowSignalIds = new Map();

        this._actorSignalIds.set(Main.overview, [
            Main.overview.connect('showing', this._updateTransparent.bind(this)),
            Main.overview.connect('hiding', this._updateTransparent.bind(this))
        ]);

        this._actorSignalIds.set(Main.sessionMode, [
            Main.sessionMode.connect('updated', this._updateTransparent.bind(this))
        ]);

        for (const metaWindowActor of global.get_window_actors()) {
            this._onWindowActorAdded(metaWindowActor.get_parent(), metaWindowActor);
        }

        this._actorSignalIds.set(global.window_group, [
            global.window_group.connect('actor-added', this._onWindowActorAdded.bind(this)),
            global.window_group.connect('actor-removed', this._onWindowActorRemoved.bind(this))
        ]);

        this._actorSignalIds.set(global.window_manager, [
            global.window_manager.connect('switch-workspace', this._updateTransparent.bind(this))
        ]);

        this._updateTransparent();
    }

    disable() {
        for (const actorSignalIds of [this._actorSignalIds, this._windowSignalIds]) {
            for (const [actor, signalIds] of actorSignalIds) {
                for (const signalId of signalIds) {
                    actor.disconnect(signalId);
                }
            }
        }
        this._actorSignalIds = null;
        this._windowSignalIds = null;

        this._setTransparent(false);
    }

    _onWindowActorAdded(container, metaWindowActor) {
        this._windowSignalIds.set(metaWindowActor, [
            metaWindowActor.connect('notify::allocation', this._updateTransparent.bind(this)),
            metaWindowActor.connect('notify::visible', this._updateTransparent.bind(this))
        ]);
    }

    _onWindowActorRemoved(container, metaWindowActor) {
        for (const signalId of this._windowSignalIds.get(metaWindowActor)) {
            metaWindowActor.disconnect(signalId);
        }
        this._windowSignalIds.delete(metaWindowActor);
        this._updateTransparent();
    }

    _updateTransparent() {
        if (Main.panel.has_style_pseudo_class('overview') || !Main.sessionMode.hasWindows) {
            this._setTransparent(true);
            return;
        }

        if (!Main.layoutManager.primaryMonitor) {
            return;
        }

        // Get all the windows in the active workspace that are in the primary monitor and visible.
        const workspaceManager = global.workspace_manager;
        const activeWorkspace = workspaceManager.get_active_workspace();
        const windows = activeWorkspace.list_windows().filter(metaWindow => {
            return metaWindow.is_on_primary_monitor()
                && metaWindow.showing_on_its_workspace()
                && !metaWindow.is_hidden()
                && metaWindow.get_window_type() !== Meta.WindowType.DESKTOP;
        });

        // Check if at least one window is near enough to the panel.
        const panelTop = Main.panel.get_transformed_position()[1];
        const panelBottom = panelTop + Main.panel.get_height();
        const scale = St.ThemeContext.get_for_stage(global.stage).scale_factor;
        const isNearEnough = windows.some(metaWindow => {
            const verticalPosition = metaWindow.get_frame_rect().y;
            return verticalPosition < panelBottom + 5 * scale;
        });

        this._setTransparent(!isNearEnough);
    }

    _setTransparent(transparent) {
        const transparency = this._settings.get_int("transparency") / 100;
        if (transparent) {
            Main.panel.remove_style_class_name('transparent-top-bar--solid');
            Main.panel.add_style_class_name('transparent-top-bar--transparent');
            Main.panel.set_style("background-color: rgba(0,0,0," + transparency + ")");
            Main.panel._rightCorner.set_style("-panel-corner-background-color: rgba(0,0,0," + transparency + ")");
            Main.panel._leftCorner.set_style("-panel-corner-background-color: rgba(0,0,0," + transparency + ")");
        } else {
            Main.panel.add_style_class_name('transparent-top-bar--solid');
            Main.panel.remove_style_class_name('transparent-top-bar--transparent');
            Main.panel.set_style("background-color: rgba(0,0,0,1)");
            Main.panel._rightCorner.set_style("-panel-corner-background-color: rgba(0,0,0,1)");
            Main.panel._leftCorner.set_style("-panel-corner-background-color: rgba(0,0,0,1)");
        }
    }
};

function init() {
    return new Extension();
}
