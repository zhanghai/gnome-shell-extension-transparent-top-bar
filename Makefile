.PHONY: build
build: $(wildcard src/*)
	mkdir -p build/
	zip -r ./build/transparent-top-bar@zhanghai.me.zip extension.js metadata.json stylesheet.css

.PHONY: clean
clean:
	rm -rf build/
