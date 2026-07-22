.PHONY: install data serve clean

install:
	python -m pip install -r requirements.txt

data:
	python scripts/build_dataset.py --output-dir web/data

serve: data
	python -m http.server 8000 --directory web

clean:
	rm -rf web/data data/derived
