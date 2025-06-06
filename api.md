# Diting API 文档

## 基本信息

- **基础路径**: `/`
- **认证方式**: JWT认证（通过请求头传递）
- **响应格式**:

```json
{
  "data": 响应数据,
  "message": "success",
  "success": true,
  "requestId": "请求ID"
}
```

## 任务管理接口

### 1. 创建任务

- **URL**: `/task/create`
- **方法**: POST
- **描述**: 创建一个新的任务
- **请求参数**:

```json
{
  "name": "任务名称",
  "sql": "SQL语句",
  "jsScript": "JavaScript脚本",
  "cronExpression": "CRON表达式 (格式: 0 0 * * * *)",
  "runMode": "运行方式",
  "feishuTableUrl": "飞书表格URL",
  "creatorName": "创建者",
  "updaterName": "更新者"
}
```

- **响应**:

```json
{
  "id": "任务ID"
}
```

### 2. 更新任务

- **URL**: `/task/update`
- **方法**: POST
- **描述**: 更新任务信息
- **请求参数**:

```json
{
  "id": "任务ID",
  "operatorName": "操作者",
  "attributes": {
    "name": "任务名称",
    "sql": "SQL语句",
    "jsScript": "JavaScript脚本",
    "cronExpression": "CRON表达式"
  }
}
```

- **响应**: 无

### 3. 获取任务详情

- **URL**: `/task/get-detail`
- **方法**: POST
- **描述**: 获取任务详细信息
- **请求参数**:

```json
{
  "id": "任务ID"
}
```

- **响应**:

```json
{
  "id": "任务ID",
  "name": "任务名称",
  "status": "任务状态",
  "runMode": "运行方式",
  "sql": "SQL语句",
  "jsScript": "JavaScript脚本",
  "cronExpression": "CRON表达式",
  "creatorName": "创建者",
  "updaterName": "更新者",
  "feishuMetaData": {
    "url": "飞书表格URL",
    "tableId": "表格ID",
    "objToken": "对象Token"
  },
  "createdAt": 创建时间,
  "updatedAt": 更新时间,
  "deletedAt": 删除时间
}
```

### 4. 改变任务状态

- **URL**: `/task/change-status`
- **方法**: POST
- **描述**: 修改任务状态
- **请求参数**:

```json
{
  "id": "任务ID",
  "operatorName": "操作者",
  "status": "任务状态"
}
```

- **响应**: 无

### 5. 查询任务列表

- **URL**: `/task/query`
- **方法**: POST
- **描述**: 分页查询任务列表
- **请求参数**:

```json
{
  "name": "任务名称（可选）",
  "status": ["任务状态（可选）"],
  "pageIndex": 页码,
  "pageSize": 每页大小,
  "sort": {
    "createdAt": "DESC或ASC（可选）"
  }
}
```

- **响应**:

```json
{
  "data": [任务对象数组],
  "total": 总条数
}
```

### 6. 手动执行任务

- **URL**: `/task/manual-run`
- **方法**: POST
- **描述**: 手动触发任务执行
- **请求参数**:

```json
{
  "taskId": "任务ID",
  "executorName": "执行人"
}
```

- **响应**: 无

### 7. AI推导CRON表达式

- **URL**: `/task/gen-cron-expression`
- **方法**: POST
- **描述**: 根据任务描述生成CRON表达式
- **请求参数**:

```json
{
  "content": "任务描述"
}
```

- **响应**: CRON表达式字符串

### 8. 获取飞书表格元数据

- **URL**: `/task/get-feishu-table-meta-data`
- **方法**: POST
- **描述**: 根据飞书表格URL获取表格元数据
- **请求参数**:

```json
{
  "url": "飞书表格URL"
}
```

- **响应**:

```json
{
  "tableId": "表格ID",
  "tableName": "表格名称",
  "viewId": "视图ID",
  "objToken": "对象Token",
  "columnNames": ["表头数组"]
}
```

## 任务记录接口

### 1. 根据任务查询记录

- **URL**: `/task-record/query-by-task-id`
- **方法**: POST
- **描述**: 查询指定任务的执行记录
- **请求参数**:

```json
{
  "taskId": "任务ID",
  "pageIndex": 页码,
  "pageSize": 每页大小
}
```

- **响应**:

```json
{
  "data": [任务记录对象数组],
  "total": 总条数
}
```

## 枚举值说明

### TaskStatus（任务状态）

- `ACTIVE`: 已启用
- `INACTIVE`: 已禁用
- `DELETED`: 已删除

### TaskRunMode（任务运行模式）

- `MANUAL`: 手动执行
- `CRON`: 定时执行

### TaskRecordStatus（任务记录状态）

- `SUCCESS`: 任务成功
- `FAILED`: 任务失败
- `WAITING`: 等待中