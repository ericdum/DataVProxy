# DataVProxy
DataV 数据代理

###  部署

下载代码包
```
wget https://codeload.github.com/ericdum/DataVProxy/zip/master
unzip master
cd DataVProxy-master
```

部署
```
make install
```

查看实时日志
```
pm2 logs
```

查看历史日志
```
ls -al ./DataVProxy-master/logs
```

重启
```
pm2 restart all
```
