const GObject = imports.gi.GObject;
const Gtk = imports.gi.Gtk;
const Gio = imports.gi.Gio;
const Me = imports.misc.extensionUtils.getCurrentExtension();

function getSettings() {
    let GioSSS = Gio.SettingsSchemaSource;
    let schemaSource = GioSSS.new_from_directory(
        Me.dir.get_child("schemas").get_path(),
        GioSSS.get_default(),
        false
    );
    let schemaObj = schemaSource.lookup(
        'com.ftpix.transparentbar', true);
    if (!schemaObj) {
        throw new Error('cannot find schemas');
    }
    return new Gio.Settings({settings_schema: schemaObj});
}

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
        this.settings = getSettings();

        print('Dark full screen ? ' + this.settings.get_boolean("dark-full-screen"));
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
