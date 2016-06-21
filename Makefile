install: pre_env start

clean:
	@if [ -a ~/src/node-v4.4.5-linux-x64.tar.xz ]; then rm ~/src/node-v4.4.5-linux-x64.tar.xz; fi;
	@if [ -a ~/src/node-v4.4.5-linux-x64.tar ]; then rm ~/src/node-v4.4.5-linux-x64.tar; fi;
	@if [ -a ~/bin/node ]; then rm ~/bin/node; fi;
	@if [ -a ~/bin/npm ]; then rm ~/bin/npm; fi;
	@if [ -a ~/bin/pm2 ]; then rm ~/bin/pm2; fi;

pre_env: clean
	# 安装 node.js
	@if [ -d ~/bin ]; then echo ""; else mkdir ~/bin; fi;
	@if [ -d ~/src ]; then echo ""; else mkdir ~/src; fi;
	@cd ~/src ; wget http://datav.oss-cn-hangzhou.aliyuncs.com/uploads/node-v4.4.5-linux-x64.tar.xz
	@if [ -d ~/src ]; then echo ""; else mkdir ~/src; fi;
	@cd ~/src ; xz -d node-v4.4.5-linux-x64.tar.xz
	@cd ~/src ; tar xvf node-v4.4.5-linux-x64.tar
	@cd ~/bin ; ln -s ../src/node-v4.4.5-linux-x64/bin/node node
	@cd ~/bin ; ln -s ../src/node-v4.4.5-linux-x64/bin/npm npm
	@npm config set prefix ~
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
