#!/bin/bash

read -p "Callback URL: " CALLBACK_URL
read -p "Client ID: " CLIENT_ID
read -p "Client secret: " SECRET

{
	echo "API=https://api.intra.42.fr"
	echo "CLIENT_ID=$CLIENT_ID"
	echo "SECRET=$SECRET"
	echo "CALLBACK_URL=$CALLBACK_URL"
	echo "AUTH_URL=https://api.intra.42.fr/oauth/token"
} > .env

npm i
