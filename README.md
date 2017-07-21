## DataVProxy

DataV 增加了一个新的数据代理协议，旨在提供更安全的数据查询。它将 SQL 查询字符串和数据库 id 加密后传到这个应用，而后这个应用连接数据库将查询后的结果返回到 DataV 的页面中。

根据新的协议，我做了一个示例应用在github上，它可以一键部署到ECS上：https://github.com/ericdum/DataVProxy

大家可以直接使用这个 Node.js 版本的示例应用，也可以参照他自己实现。

欢迎大家贡献代码。

### 步骤

1. 购买 ECS，最低配置即可，后续如果有需要可以灵活增配。
2. 部署代码、启动服务
3. 配置数据库
4. 配置到 DataV

### 购买 ECS
![p1](https://img.alicdn.com/tfs/TB1fdPgSpXXXXaFXXXXXXXXXXXX-755-648.png)
如下图所示，在“镜像”中选择“公共镜像” => CentOS 7.0 64位。如果没有特殊需求不需要数据盘，带宽建议按流量付费。（参考价格：这样的配置每月￥45，公网流量费用￥0.8/GB）

![p2](https://img.alicdn.com/tfs/TB10DqtSpXXXXcCapXXXXXXXXXX-286-472.png)

### 部署代码、启动服务

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
![p3](https://img.alicdn.com/tfs/TB10BK_SpXXXXabXpXXXXXXXXXX-652-380.png)
保留上图红框中的信息，下一步要用。如果忘记可以执行 `node ./bin/info.js` 来查看，如果需要变更 key 可用 `node ./bin/genkv.js` 来生成。

看到红框下面的输出的应用状态信息后，则表示启动成功了。

可以访问 http://域名:端口/status 来验证服务器状态。

如根据上图输出的信息则可访问：http://115.29.246.129:9998/status

### 配置数据库

打开 config.js，在 databases 数组中仿照示例增加数据库。

```javascript
  databases: [
    {
      id: 'test',        // 保证 id 不重复，填入 DataV 后台的“数据库”一栏中
      type: 'mysql',     // mysql, rds, ads, mssql
      host: '127.0.0.1', // 域名、ip
      user: 'root',      // 用户名
      password: 'root',  // 密码
      database: 'test',  // 数据库名
      port: 3306         // 端口
    },
    {
      // ... 
    },
    // ... 增加数据库填到这里
  ]
```

### 配置到 DataV

如图所示，在创建数据源的地方选择“自定义”类型，
然后将前两步红圈中的信息填入输入框

![p4](https://img.alicdn.com/tfs/TB1wm1JSpXXXXc.XVXXXXXXXXXX-523-716.png)

在数据配置的地方选择“数据库”类型，再选择刚才自定义的数据源就可以了。

![p5](https://img.alicdn.com/tfs/TB1pM1OSpXXXXagXVXXXXXXXXXX-520-437.png)

##注意，这个服务SDK只提供了 HTTP 服务，如果需要 HTTPS 服务自己 google 一下就知道了，需要您申请 chrome 浏览器认可的 HTTPS 证书才行。

> 在有 HTTPS 服务之前，请确保 DATAV 页面是使用 HTTP 协议打开的。（这是浏览器为了保证https网站的安全性提供的策略）  
>
> ![WechatIMG1_jpeg](https://img.alicdn.com/tfs/TB1RsaHSpXXXXawaXXXXXXXXXXX-629-183.jpg)

### 运维

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

启动服务
```
pm2  start app.js
```