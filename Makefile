.PHONY: build
build: $(wildcard src/*)
	mkdir -p build/
	sass src/stylesheet.scss src/stylesheet.css
	cd src/ && zip -r ../build/transparent-top-bar@com.ftpix.zip .
	zip -d build/transparent-top-bar@com.ftpix.zip stylesheet.scss

.PHONY: clean
clean:
	rm -rf build/
