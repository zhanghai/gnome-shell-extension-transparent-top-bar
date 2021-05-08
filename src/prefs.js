const GObject = imports.gi.GObject;
const Gtk = imports.gi.Gtk;
const Gio = imports.gi.Gio;
const Me = imports.misc.extensionUtils.getCurrentExtension();

const Config = imports.misc.config;
const [major] = Config.PACKAGE_VERSION.split('.');
const shellVersion = Number.parseInt(major);

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

// legacy, gnome 3.38
if (shellVersion < 40) {
    function init() {
    }

    function buildPrefsWidget() {
        let widget = new MyPrefsWidget();
        widget.show_all();
        return widget;
    }

    const MyPrefsWidget = GObject.registerClass(
        class MyPrefsWidget extends Gtk.Box {

            _init(params) {
                super._init(params);

                this.margin = 20;
                this.set_spacing(15);
                this.set_orientation(Gtk.Orientation.VERTICAL);
                this.settings = getSettings();

                this.connect('destroy', Gtk.main_quit);

                let myLabel = new Gtk.Label({
                    label: "Top bar opacity (%)"
                });

                let scale = Gtk.Scale.new_with_range(Gtk.Orientation.HORIZONTAL, 0.0, 100.0, 1.0);
                scale.set_value(this.settings.get_int("transparency"));

                const _this = this;
                scale.connect("value-changed", function (w) {
                    _this.settings.set_int("transparency", w.get_value());
                });

                let box = new Gtk.Box();
                box.set_orientation(Gtk.Orientation.VERTICAL);

                box.pack_start(myLabel, false, false, 0);
                box.pack_end(scale, false, false, 0);

                this.add(box);
            }

        });
} else { // gnome 40
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

            print('Dark full screen ? '+this.settings.get_boolean("dark-full-screen"));
            this._opacity.set_value(this.settings.get_int("transparency"));
            this._darkFullScreen.set_active(this.settings.get_boolean("dark-full-screen"))
        }

        onValueChanged(scale) {
            this.settings.set_int("transparency", this._opacity.get_value());
        }

        onDarkFullScreenChanged(gtkSwitch){
            this.settings.set_boolean("dark-full-screen", this._darkFullScreen.get_active());
        }
    });

    function init() {
    }

    function buildPrefsWidget() {
        return new PrefsWidget();
    }
}
