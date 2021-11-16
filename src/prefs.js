const GObject = imports.gi.GObject;
const Gtk = imports.gi.Gtk;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const ExtensionUtils = imports.misc.extensionUtils;

const PrefsWidget = GObject.registerClass({
    GTypeName: 'TransparentTopBarPrefsWidget',
    Template: Me.dir.get_child('prefs.gtk4.ui').get_uri(),
    InternalChildren: [
        'opacity',
        'darkFullScreen'
    ]
}, class TransparentTopBarPrefsWidget extends Gtk.Box {

    _init(params = {}) {
        super._init(params);
        this.settings = ExtensionUtils.getSettings('com.ftpix.transparentbar');

        this._opacity.set_value(this.settings.get_int("transparency"));
        this._darkFullScreen.set_active(this.settings.get_boolean("dark-full-screen"))
    }

    onValueChanged(scale) {
        this.settings.set_int("transparency", this._opacity.get_value());
    }

    onDarkFullScreenChanged(gtkSwitch) {
        this.settings.set_boolean("dark-full-screen", this._darkFullScreen.get_active());
    }
});

function init() {
}

function buildPrefsWidget() {
    return new PrefsWidget();
}
