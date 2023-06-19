#!/bin/zsh

if [ ! -f .env ]; then
	./setup.sh
fi

ip=$(hostname -I | awk '{print $1}')

direction="http://$ip:3000/terminal"

mode="Docker";

if [ "$1" = "--qr" ]; then
	docker run -it --rm jkutkut/py-qr $direction
	shift
fi
if [ "$1" = "--install" ]; then
	docker run -it --rm --name molewakamole \
		-p 3000:3000 \
		-v $(pwd):/app -w /app \
		--entrypoint=npm \
	   node:current-alpine3.16 install
	exit
fi
if [ "$1" = "--npm" ]; then
	mode="npm"
else
	mode="Docker";
fi



echo "Running at:"
echo "  $direction"
echo "  http://localhost:3000/terminal"

if [ "$mode" = "npm" ]; then
	npm start
else
	docker run -it --rm --name molewakamole \
		-p 3000:3000 \
		-v $(pwd):/app -w /app \
		--entrypoint=npm \
	   node:current-alpine3.16 run start
fi

# sudo docker run --rm -it \
# 	-p 3000:3000 \
# 	--name molewakamoleweb \
# 	jkutkut/molewakamoleweb:latest
