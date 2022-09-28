UUID = transparent-top-bar@zhanghai.me

.PHONY: build
build: $(wildcard src/*)
	mkdir -p build/
	gnome-extensions pack -fo build src

.PHONY: install
install:
	gnome-extensions install --force "build/$(UUID).shell-extension.zip"

.PHONY: clean
clean:
	rm -rf build/
