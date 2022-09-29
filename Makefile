EXTENSION_BUNDLE = build/$(shell grep -Po '"uuid"\s*:\s*"\K[^"]+' src/metadata.json).shell-extension.zip

$(EXTENSION_BUNDLE): $(wildcard src/*)
	mkdir -p build/
	gnome-extensions pack -fo build src

.PHONY: build
build: $(EXTENSION_BUNDLE)

.PHONY: install
install: $(EXTENSION_BUNDLE)
	gnome-extensions install -f $(EXTENSION_BUNDLE)

.PHONY: clean
clean:
	rm -f $(EXTENSION_BUNDLE)
