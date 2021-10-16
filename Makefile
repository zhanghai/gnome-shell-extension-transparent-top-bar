.PHONY: build
build: $(wildcard src/*)
	mkdir -p build/
	gnome-extensions pack -fo build src

.PHONY: clean
clean:
	rm -rf build/
