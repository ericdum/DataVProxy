install: pre_env start

pre_env:
	# 安装 node.js
	@curl --silent --location https://rpm.nodesource.com/setup_4.x | bash -
	@yum -y install nodejs
	# 初始化项目
	@npm install
	# 安装运维工具
	@npm install -g pm2
	@pm2 install pm2-logrotate
	# 准备日志
	@mkdir logs
	@if [ -d "/etc/logrotate.d" ]; then sudo echo "$$PWD/logs/*.log { \r    rotate 12\r    daily\r    missingok\r    \r    notifempty\r    compress\r    delaycompress\/}" > /etc/logrotate.d/pm2-user; fi;
	# 生成 key & secret
	@node ./bin/installkv.js
	# 输出配置信息
	@node ./bin/info.js

start:
	@pm2 start app.js  --merge-logs --log-date-format="YYYY-MM-DD HH:mm:ss Z" --output ./logs/out.log --error ./logs/err.log

stop:
	@pm2 stop all

update:
	git pull origin release
