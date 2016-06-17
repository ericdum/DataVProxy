module.exports = {
  port   : 9998,
  key    : 'o4gx5n6330pxy4ojo4gx5n6330pxy4oj', //32位
  secret : 'pch3gtpxi4urfz5u', //16位

  databases: [
    /*
     * 在这里写数据库配置
     * 配置好后将 id 填入 DataV 后台的“数据库”一栏中
     */
    {
      id: 'test',
      type: 'mysql', // rds, ads
      host: '127.0.0.1',
      user: 'root',
      password: 'root',
      database: 'test',
      port: 3306,
    },
  ]
}
