cd ..
docker build -f docker/Dockerfile -t clothes-classification-vue-app .
docker run -it --rm -v .:/app/ -p 13000:8080 clothes-classification-vue-app
