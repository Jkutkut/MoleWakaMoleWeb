#!/bin/bash

read -p "Callback URL: " CALLBACK_URL
read -p "Client ID: " CLIENT_ID
read -p "Client secret: " SECRET

{
	echo "CALLBACK_URL=$CALLBACK_URL"
	echo "CLIENT_ID=$CLIENT_ID"
	echo "SECRET=$SECRET"
} > .env
