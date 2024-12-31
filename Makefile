all: package_firefox package_chrome src_dist

build_js: src/js
	npx parcel build \
	    src/js/add-demo.js \
	    src/js/alerts-menu.js \
	    src/js/background.js \
	    src/js/edit-demo.js \
	    src/js/job-details.js \
	    src/js/job-response.js \
	    src/js/jobs-list.js \
	    src/js/statistics.js \
	    --dist-dir dist/js

build_firefox: manifest-v2.json build_js
	rsync -arv dist/js src/css src/img dist/firefox/
	cp manifest-v2.json dist/firefox/manifest.json

build_chrome: manifest-v3.json build_js
	rsync -arv dist/js src/css src/img dist/chrome/
	cp manifest-v3.json dist/chrome/manifest.json

package_firefox: build_firefox
	@cd dist/firefox && zip -r ../firefox.zip *

package_chrome: build_chrome
	@cd dist/chrome && zip -r ../chrome.zip *

src_dist:
	zip -r dist/src.zip -x@.gitignore *

clean:
	rm -rf .parcel-cache dist
