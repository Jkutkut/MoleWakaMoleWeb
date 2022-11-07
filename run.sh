#!/bin/zsh

if [ ! -f .env ]; then
	./setup.sh
fi

ip=$(hostname -I | awk '{print $1}')

direction="http://$ip:3000/terminal"

if [ "$1" = "--qr" ]; then
	# TODO remove sudo usage
	sudo docker run -it --rm jkutkut/py-qr $direction
fi

echo "Running at:"
echo "  $direction"
echo "  http://localhost:3000/terminal"

npm start

# sudo docker run --rm -it \
# 	-p 3000:3000 \
# 	--name molewakamoleweb \
# 	jkutkut/molewakamoleweb:latest
