# Diting API 接口文档

## 基础信息

- 基础路径: `/`
- 认证方式: 所有接口都需要通过 `authMiddleware` 进行认证
- 响应格式: JSON

```json
{
  "data": 响应数据,
  "message": "success",
  "success": true,
  "requestId": "请求追踪ID"
}
```

## 任务管理接口

### 1. 创建任务

- **URL**: `/task/create`
- **方法**: POST
- **描述**: 创建一个新的任务

**请求参数**:

```typescript
{
  /** 任务名称 */
  name: string;
  /** SQL语句 */
  sql: string;
  /** JavaScript脚本 */
  jsScript: string;
  /** CRON表达式 (格式: 0 0 * * * *) */
  cronExpression: string;
  /** 运行方式 */
  runMode: "MANUAL" | "CRON";
  /** 飞书表元数据 */
  feishuMetaData: {
    url: string;
    wikiId: string;
    tableId: string;
    objToken: string;
  };
  /** 创建者 */
  creatorName: string;
  /** 更新者 */
  updaterName: string;
}
```

**响应**:

```typescript
{
  /** 任务ID */
  id: string;
}
```

### 2. 更新任务

- **URL**: `/task/update`
- **方法**: POST
- **描述**: 更新现有任务的属性

**请求参数**:

```typescript
{
  /** 任务ID */
  id: string;
  /** 操作者名称 */
  operatorName: string;
  /** 要更新的属性 */
  attributes: {
    /** 任务名称 (可选) */
    name?: string;
    /** SQL语句 (可选) */
    sql?: string;
    /** JavaScript脚本 (可选) */
    jsScript?: string;
    /** CRON表达式 (可选, 格式: 0 0 * * * *) */
    cronExpression?: string;
  };
}
```

**响应**: 无返回数据

### 3. 修改任务状态

- **URL**: `/task/change-status`
- **方法**: POST
- **描述**: 修改任务的状态

**请求参数**:

```typescript
{
  /** 任务ID */
  id: string;
  /** 操作者名称 */
  operatorName: string;
  /** 任务状态 */
  status: "ACTIVE" | "INACTIVE" | "DELETED";
}
```

**响应**: 无返回数据

### 4. 查询任务列表

- **URL**: `/task/query`
- **方法**: POST
- **描述**: 查询任务列表，支持分页、排序和筛选

**请求参数**:

```typescript
{
  /** 任务名称 (可选) */
  name?: string;
  /** 任务状态 (可选) */
  status?: ["ACTIVE" | "INACTIVE" | "DELETED"];
  /** 页码 (从0开始) */
  pageIndex: number;
  /** 每页大小 (1-100) */
  pageSize: number;
  /** 排序 (可选) */
  sort?: {
    createdAt?: "DESC" | "ASC";
  };
}
```

**响应**:

```typescript
{
  /** 任务列表 */
  data: [
    {
      /** 任务ID */
      id: string;
      /** 任务名称 */
      name: string;
      /** 任务状态 */
      status: "ACTIVE" | "INACTIVE" | "DELETED";
      /** 运行方式 */
      runMode: "MANUAL" | "CRON";
      /** SQL语句 */
      sql: string;
      /** JavaScript脚本 */
      jsScript: string;
      /** CRON表达式 */
      cronExpression: string;
      /** 创建者 */
      creatorName: string;
      /** 更新者 */
      updaterName: string;
      /** 飞书表元数据 */
      feishuMetaData: {
        url: string;
        wikiId: string;
        tableId: string;
        objToken: string;
      };
      /** 创建时间 */
      createdAt: number;
      /** 更新时间 */
      updatedAt: number;
      /** 删除时间 */
      deletedAt: number;
    }
  ];
  /** 总条数 */
  total: number;
}
```

### 5. 手动执行任务

- **URL**: `/task/manual-run`
- **方法**: POST
- **描述**: 手动执行一个任务

**请求参数**:

```typescript
{
  /** 任务ID */
  taskId: string;
  /** 执行人 */
  executorName: string;
}
```

**响应**: 无返回数据

## 任务记录接口

### 1. 查询任务记录

- **URL**: `/task-record/query-by-task-id`
- **方法**: POST
- **描述**: 根据任务ID查询任务执行记录

**请求参数**:

```typescript
{
  /** 任务ID */
  taskId: string;
  /** 页码 (从1开始) */
  pageIndex: number;
  /** 每页大小 (1-100) */
  pageSize: number;
}
```

**响应**:

```typescript
{
  /** 任务记录列表 */
  data: [
    {
      /** 记录ID */
      id: string;
      /** 关联任务ID */
      taskId: string;
      /** 任务执行时间 */
      executionTime: number;
      /** 任务状态 */
      status: "SUCCESS" | "FAILED" | "WAITING";
      /** SQL语句 */
      sql: string;
      /** JavaScript脚本 */
      jsScript: string;
      /** 飞书表元数据 */
      feishuMetaData: {
        url: string;
        wikiId: string;
        tableId: string;
        objToken: string;
      };
      /** CRON表达式 */
      cronExpression: string;
      /** 运行方式 */
      runMode: "MANUAL" | "CRON";
      /** 执行时长(秒) */
      durationSec: number;
      /** 错误日志 */
      errorLog: string;
      /** 创建时间 */
      createdAt: number;
      /** 更新时间 */
      updatedAt: number;
      /** 删除时间 */
      deletedAt: number;
    }
  ];
  /** 总条数 */
  total: number;
}
```

## 首页接口

### 1. 首页

- **URL**: `/`
- **方法**: GET
- **描述**: 应用首页

**响应**:

```json
{
  "message": "Hello World"
}
```

## 枚举值说明

### 任务状态 (TaskStatus)

- `ACTIVE`: 已启用
- `INACTIVE`: 已禁用
- `DELETED`: 已删除

### 任务运行模式 (TaskRunMode)

- `MANUAL`: 手动执行
- `CRON`: 定时执行

### 任务记录状态 (TaskRecordStatus)

- `SUCCESS`: 任务成功
- `FAILED`: 任务失败
- `WAITING`: 等待中