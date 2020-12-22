const GObject = imports.gi.GObject;
const Gtk = imports.gi.Gtk;
const Gio = imports.gi.Gio;
const Me = imports.misc.extensionUtils.getCurrentExtension();

function init() {
}

function buildPrefsWidget() {
    let widget = new MyPrefsWidget();
    widget.show_all();
    return widget;
}

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
                label: "Top bar transparency (%)"
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
