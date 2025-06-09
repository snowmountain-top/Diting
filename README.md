# Diting (谛听)

> 谛听, 观音菩萨座下的神兽。它是一只六耳猕猴，有着敏锐的听觉，能够听到世间万物的声音，包括人们内心深处的真实想法。
> -- 《西游记》

这是一个数据统计平台. 依据调度策略将自定义sql的统计结果输出到飞书文档.

## 项目结构说明

### 目录预览
```
├── .husky/                     # Git Hooks配置目录
├── api/                        # API测试文件目录
├── src/                        # 源代码目录
│   └── diting/                 # 项目主目录
│       ├── api/                # API相关代码
│       │   ├── controller/     # 控制器目录
│       │   ├── middleware/     # 中间件目录
│       │   └── routes/         # 路由定义目录
│       ├── core/               # 核心代码目录
│       │   ├── config/         # 配置相关
│       │   ├── connection/     # 连接相关
│       │   ├── entity/         # 实体定义
│       │   │   └── transformers/ # 实体转换器
│       │   ├── modules/        # 业务模块
│       │   │   ├── builder/    # 构建器模块
│       │   │   ├── execution/  # 执行模块
│       │   │   ├── schedule/   # 调度模块
│       │   │   ├── task/       # 任务模块
│       │   │   └── taskRecord/ # 任务记录模块
│       │   └── repository/     # 仓库层
│       │       └── database/   # 数据库仓库
│       ├── errors/             # 错误处理
│       ├── stat/               # 统计相关
│       ├── utils/              # 工具函数
│       └── vendors/            # 第三方服务
└── tests/                      # 测试目录
    ├── controller/             # 控制器测试
    ├── core/                   # 核心代码测试
    │   ├── modules/            # 模块测试
    │   └── repository/         # 仓库测试
    └── utils/                  # 工具测试
```

### 主要目录
- src/diting : 项目主要源代码

  - api : API层，包含控制器、中间件和路由定义
  - core : 核心业务逻辑
    - config : 配置管理
    - connection : 数据库和Redis连接
    - entity : 数据库实体定义
    - modules : 业务模块实现
    - repository : 数据访问层
  - utils : 工具函数
  - vendors : 第三方服务集成
- tests : 测试代码
### 业务模块
项目主要围绕任务（Task）和任务记录（TaskRecord）展开，实现了一个定时任务调度系统：

1. 任务模块 : 管理任务的创建、更新和查询
2. 调度模块 : 负责任务的定时调度执行
3. 执行模块 : 执行具体的任务逻辑
4. 任务记录模块 : 记录任务执行的历史和结果
### 技术栈
- TypeScript
- Node.js
- Express (推测)
- TypeORM
- Redis
- 飞书API集成
- Jest测试框架
