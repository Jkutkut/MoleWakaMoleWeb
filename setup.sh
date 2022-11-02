#!/bin/bash

read -p "Auth domain: " AUTH_DOMAIN
read -p "Client ID: " CLIENT_ID
read -p "Client secret: " SECRET

{
	echo "AUTH_DOMAIN=$AUTH_DOMAIN"
	echo "CLIENT_ID=$CLIENT_ID"
	echo "SECRET=$SECRET"
} > .env
