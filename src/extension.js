import Meta from 'gi://Meta';
import St from 'gi://St';
import GLib from 'gi://GLib';

import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

export default class TransparentTopBarWithCustomTransparencyExtension extends Extension {
    constructor(metadata) {
        super(metadata);
        this._actorSignalIds = null;
        this._windowSignalIds = null;
        this._delayedTimeoutId = null;
        this.transparencyChangeDebounce = null;
        this.darkFullScreenChangeDebounce = null;
    }

    enable() {

        this._settings = this.getSettings('com.ftpix.transparentbar');
        this._currentTransparency = this._settings.get_int('transparency');
        this._darkFullScreen = this._settings.get_boolean('dark-full-screen');

        this._actorSignalIds = new Map();
        this._windowSignalIds = new Map();
        this._settings.connect('changed', (settings, key) => this.transparencyChanged(settings, key));
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

        //Use a delayed version of _updateTransparent to let the shell catch up
        this._actorSignalIds.set(global.window_manager, [
            global.window_manager.connect('switch-workspace', this._updateTransparentDelayed.bind(this))
        ]);

        this._updateTransparent();
    }

    transparencyChanged(settings, key) {

        if (key === 'transparency') {
            GLib.source_remove(this.transparencyChangeDebounce);
            this.transparencyChangeDebounce = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 250, () => {
                const oldTransparency = this._currentTransparency;
                this._currentTransparency = this._settings.get_int('transparency');
                Main.panel.remove_style_class_name('transparent-top-bar-' + oldTransparency);
                this._updateTransparent();
            });
            return;
        }

        if (key === 'dark-full-screen') {
            this._darkFullScreen = this._settings.get_boolean('dark-full-screen');
            GLib.source_remove(this.darkFullScreenChangeDebounce);
            this.darkFullScreenChangeDebounce = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 250, () => {
                Main.panel.remove_style_class_name('transparent-top-bar-' + this._currentTransparency);
                this._updateTransparent();
            });
            return;
        }
    }

    disable() {
        GLib.source_remove(this.transparencyChangeDebounce);
        GLib.source_remove(this.darkFullScreenChangeDebounce);

        for (const actorSignalIds of [this._actorSignalIds, this._windowSignalIds]) {
            for (const [actor, signalIds] of actorSignalIds) {
                for (const signalId of signalIds) {
                    actor.disconnect(signalId);
                }
            }
        }
        this._actorSignalIds = null;
        this._windowSignalIds = null;

        if (this._delayedTimeoutId != null) {
            GLib.Source.remove(this._delayedTimeoutId);
        }
        this._delayedTimeoutId = null;

        this._setTransparent(false);
        this._settings = null;
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

    _updateTransparentDelayed() {
        this._delayedTimeoutId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 100, () => {
            this._updateTransparent();
            this._delayedTimeoutId = null;
            return GLib.SOURCE_REMOVE;
        });
    }

    _updateTransparent() {
        if (!this._darkFullScreen) {
            this._setTransparent(true);
            return
        }

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
                && metaWindow.get_window_type() !== Meta.WindowType.DESKTOP
                && !metaWindow.skip_taskbar;
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
        const transparency = this._settings.get_int("transparency");
        if (transparent) {
            Main.panel.add_style_class_name('transparent-top-bar');
            Main.panel.add_style_class_name('transparent-top-bar-' + transparency);
        } else {
            Main.panel.remove_style_class_name('transparent-top-bar');
            Main.panel.remove_style_class_name('transparent-top-bar-' + transparency);
        }
    }

};
