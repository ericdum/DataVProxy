install:
	@curl --silent --location https://rpm.nodesource.com/setup_4.x | bash -
	@yum -y install nodejs
	@npm install pm2 pm2-logrotate -g
	@npm install
	@mkdir logs
	@if [ -d "/etc/logrotate.d" ]; then sudo echo "$$PWD/logs/*.log { \n    rotate 12\n    daily\n    missingok\n    \n    notifempty\n    compress\n    delaycompress\n}" > /etc/logrotate.d/pm2-user; fi;

start:
	@pm2 start app.js  --merge-logs --log-date-format="YYYY-MM-DD HH:mm:ss Z" --output ./logs/out.log --error ./logs/err.log

stop:
	@pm2 stop all

update:
	git pull origin release

