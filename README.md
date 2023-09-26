# GNOME Shell Extension - Transparent Top Bar

A GNOME Shell extension that brings back the transparent top bar when free-floating in GNOME Shell 3.32.

This basically comes from the feature
implementation [removed in GNOME Shell 3.32](https://gitlab.gnome.org/GNOME/gnome-shell/merge_requests/376/), and I
modified the code a bit to make it an extension. Enjoy!

## License

This program is distributed under the terms of the GNU General Public License, version 2 or later.

## Development

### Wayland

Start child shell instance with reloaded extensions
```
MUTTER_DEBUG_DUMMY_MODE_SPECS=1920x1080 dbus-run-session -- gnome-shell --nested --wayland
```

### Xorg

Reload shell by pressing ALT+F2 type r in the input then enter.

### Compile schemas
```
cd ~/.local/share/gnome-shell/extensions/transparent-top-bar@ftpix.com
glib-compile-schemas schemas/
```

