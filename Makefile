.PHONY: build
build: $(wildcard src/*)
	mkdir -p build/
	sass src/stylesheet.scss src/stylesheet.css
	gnome-extensions pack -fo build src

.PHONY: clean
clean:
	rm -rf build/
