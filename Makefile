.PHONY: build
build: $(wildcard src/*)
	rm -Rf build
	mkdir -p build/
	sass src/stylesheet.scss src/stylesheet.css
	cd src/ && zip -r ../build/transparent-top-bar@com.ftpix.zip .
	zip -d build/transparent-top-bar@com.ftpix.zip stylesheet.scss
	zip -d build/transparent-top-bar@com.ftpix.zip stylesheet.css.map

.PHONY: clean
clean:
	rm -rf build/
