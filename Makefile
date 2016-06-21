install:
	@curl --silent --location https://rpm.nodesource.com/setup_4.x | bash -
	@yum -y install nodejs
	@npm install
	@pm2 install pm2-logrotate
	@mkdir logs
	@if [ -d "/etc/logrotate.d" ]; then sudo echo "$$PWD/logs/*.log { \r    rotate 12\r    daily\r    missingok\r    \r    notifempty\r    compress\r    delaycompress\/}" > /etc/logrotate.d/pm2-user; fi;
	@node ./bin/installkv.js
	@node ./bin/info.js
	@pm2 start app.js  --merge-logs --log-date-format="YYYY-MM-DD HH:mm:ss Z" --output ./logs/out.log --error ./logs/err.log

start:
	@pm2 start app.js  --merge-logs --log-date-format="YYYY-MM-DD HH:mm:ss Z" --output ./logs/out.log --error ./logs/err.log

stop:
	@pm2 stop all

update:
	git pull origin release

