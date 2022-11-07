#!/bin/zsh

# TODO check .env file

ip=$(hostname -I | awk '{print $1}')

direction="$ip:3000/terminal"

# TODO remove sudo usage
sudo docker run -it --rm jkutkut/py-qr $direction

npm start

# sudo docker run --rm -it \
# 	-p 3000:3000 \
# 	--name molewakamoleweb \
# 	jkutkut/molewakamoleweb:latest
