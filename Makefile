install:
	@curl --silent --location https://rpm.nodesource.com/setup_4.x | bash -
	@yum -y install nodejs
	@npm install pm2 -g
	@npm install

