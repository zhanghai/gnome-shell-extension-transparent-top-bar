import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import {ExtensionPreferences, gettext as _} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class TransparentTopBarPrefsWidget extends ExtensionPreferences {


    fillPreferencesWindow(window){
        window._settings = this.getSettings('com.ftpix.transparentbar');
        window._opacity = window._settings.get_int("transparency");
        window._darkFullScreen = window._settings.get_boolean("dark-full-screen");

        const page = new Adw.PreferencesPage();

        const group = new Adw.PreferencesGroup({
            title: _('Top bar opacity (%)'),
        });

        // scale
        const scale = new Gtk.Scale();
        scale.set_digits(1);
        scale.set_value(window._opacity);
        scale.set_range(0,100);
        group.add(scale);


        page.add(group);


        window.add(page);
    }

    /*
        _init(params = {}) {
            super._init(params);
            this.settings = ExtensionUtils.getSettings('com.ftpix.transparentbar');

            this._opacity.set_value(this.settings.get_int("transparency"));
            this._darkFullScreen.set_active(this.settings.get_boolean("dark-full-screen"))
        }
    */

    onValueChanged(scale) {
        this.settings.set_int("transparency", this._opacity.get_value());
    }

    onDarkFullScreenChanged(gtkSwitch) {
        this.settings.set_boolean("dark-full-screen", this._darkFullScreen.get_active());
    }
}

/*
function init() {
}

function buildPrefsWidget() {
    return new PrefsWidget();
}
*/
