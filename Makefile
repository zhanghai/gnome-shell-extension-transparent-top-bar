.PHONY: build
build: $(wildcard src/*)
	mkdir -p build/
	cd src/ && zip -r ../build/transparent-top-bar@zhanghai.me.zip .

.PHONY: clean
clean:
	rm -rf build/
