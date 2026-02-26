# 📚 昆仑杯制造工艺管理系统 - API接口完整文档

# 模块一：认证授权模块

## 1.1 用户登录

### 接口信息

| 项目         | 内容                                               |
| ------------ | -------------------------------------------------- |
| **接口名称** | 用户登录                                           |
| **接口描述** | 用户通过账号密码和验证码进行身份认证，获取访问令牌 |
| **请求方法** | POST                                               |
| **完整URL**  | `/api/v1/auth/login`                               |

### 请求参数

#### Query Parameters

无

#### Path Parameters

无

### 请求头

| Header名称       | 类型   | 必填 | 描述                                 |
| ---------------- | ------ | ---- | ------------------------------------ |
| Content-Type     | string | 是   | 固定值：`application/json`           |
| Accept           | string | 否   | 固定值：`application/json`           |
| X-Client-Type    | string | 否   | 客户端类型：`web`/`mobile`/`desktop` |
| X-Client-Version | string | 否   | 客户端版本号                         |

### 请求体

**Content-Type**: `application/json`

**JSON Schema**:

```json
{
  "type": "object",
  "required": ["account", "password", "role", "captcha", "captchaKey"],
  "properties": {
    "account": {
      "type": "string",
      "minLength": 2,
      "maxLength": 20,
      "description": "用户账号"
    },
    "password": {
      "type": "string",
      "minLength": 6,
      "maxLength": 20,
      "description": "用户密码"
    },
    "role": {
      "type": "string",
      "enum": ["admin", "supervisor", "designer"],
      "description": "登录角色"
    },
    "captcha": {
      "type": "string",
      "minLength": 4,
      "maxLength": 4,
      "description": "验证码"
    },
    "captchaKey": {
      "type": "string",
      "format": "uuid",
      "description": "验证码唯一标识"
    }
  }
}
```

**请求示例**:

```json
{
  "account": "admin",
  "password": "admin@2026",
  "role": "admin",
  "captcha": "A3b2",
  "captchaKey": "550e8400-e29b-41d4-a716-446655440000"
}
```

### 响应数据结构

| 字段名                     | 类型    | 描述                       |
| -------------------------- | ------- | -------------------------- |
| code                       | integer | 状态码                     |
| message                    | string  | 响应消息                   |
| data                       | object  | 响应数据对象               |
| data.token                 | string  | 访问令牌                   |
| data.refreshToken          | string  | 刷新令牌                   |
| data.expiresIn             | integer | Token过期时间（秒）        |
| data.tokenType             | string  | Token类型，固定值 `Bearer` |
| data.userInfo              | object  | 用户信息对象               |
| data.userInfo.id           | string  | 用户唯一标识               |
| data.userInfo.userId       | string  | 用户ID                     |
| data.userInfo.name         | string  | 用户姓名                   |
| data.userInfo.role         | string  | 用户角色                   |
| data.userInfo.avatar       | string  | 用户头像URL                |
| data.userInfo.deptId       | integer | 部门ID                     |
| data.userInfo.deptName     | string  | 部门名称                   |
| data.userInfo.isFirstLogin | boolean | 是否首次登录               |
| data.userInfo.permissions  | array   | 权限列表                   |
| timestamp                  | integer | 服务器时间戳               |

### 成功响应示例

**HTTP Status**: 200 OK

```json
{
  "code": 0,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsImlhdCI6MTcwODkyNDgwMCwiZXhwIjoxNzA4OTMxMDAwLCJyb2xlIjoiYWRtaW4ifQ.signature",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsImlhdCI6MTcwODkyNDgwMCwiZXhwIjoxNzA5NTI5ODAwLCJ0eXBlIjoicmVmcmVzaCJ9.signature",
    "expiresIn": 7200,
    "tokenType": "Bearer",
    "userInfo": {
      "id": "1",
      "userId": "U001",
      "name": "系统管理员",
      "role": "admin",
      "avatar": "https://api.kunlunbei.com/avatar/admin.png",
      "deptId": 1,
      "deptName": "技术部",
      "isFirstLogin": false,
      "permissions": ["*"]
    }
  },
  "timestamp": 1708924800000
}
```

### 错误响应信息

#### 错误码列表

| 错误码 | HTTP状态码 | 说明             | 处理建议           |
| ------ | ---------- | ---------------- | ------------------ |
| 1001   | 401        | 账号不存在       | 检查账号是否正确   |
| 1002   | 401        | 密码错误         | 检查密码是否正确   |
| 1003   | 400        | 验证码错误       | 刷新验证码重新输入 |
| 1004   | 403        | 账号已禁用       | 联系管理员启用账号 |
| 1005   | 403        | 账号已删除       | 联系管理员恢复账号 |
| 1006   | 403        | 角色不匹配       | 选择正确的角色登录 |
| 1007   | 429        | 登录尝试次数过多 | 等待15分钟后重试   |
| 1008   | 400        | 验证码已过期     | 重新获取验证码     |

#### 错误响应示例

**账号不存在**:

```json
{
  "code": 1001,
  "message": "账号不存在",
  "data": null,
  "timestamp": 1708924800000
}
```

**密码错误**:

```json
{
  "code": 1002,
  "message": "密码错误，还剩3次尝试机会",
  "data": {
    "remainingAttempts": 3
  },
  "timestamp": 1708924800000
}
```

**验证码错误**:

```json
{
  "code": 1003,
  "message": "验证码错误",
  "data": null,
  "timestamp": 1708924800000
}
```

### 认证要求

| 项目     | 说明     |
| -------- | -------- |
| 认证方式 | 无需认证 |
| 公开访问 | 是       |

### 速率限制

| 项目     | 说明                                                                                           |
| -------- | ---------------------------------------------------------------------------------------------- |
| 限制策略 | 5次/分钟/IP地址                                                                                |
| 限制响应 | HTTP 429                                                                                       |
| 响应头   | `X-RateLimit-Limit`: 5<br>`X-RateLimit-Remaining`: 剩余次数<br>`X-RateLimit-Reset`: 重置时间戳 |

### 特殊说明

| 项目        | 说明                                   |
| ----------- | -------------------------------------- |
| 安全措施    | 连续5次密码错误将锁定账号15分钟        |
| Token有效期 | 访问令牌2小时，刷新令牌7天             |
| 首次登录    | 首次登录用户需强制修改密码             |
| 密码策略    | 8-20位，包含大小写字母、数字和特殊字符 |
| 并发登录    | 同一账号不允许多设备同时登录           |

---

## 1.2 用户退出

### 接口信息

| 项目         | 内容                          |
| ------------ | ----------------------------- |
| **接口名称** | 用户登出                      |
| **接口描述** | 用户退出系统，使当前Token失效 |
| **请求方法** | POST                          |
| **完整URL**  | `/api/v1/auth/logout`         |

### 请求参数

无

### 请求头

| Header名称    | 类型   | 必填 | 描述               |
| ------------- | ------ | ---- | ------------------ |
| Authorization | string | 是   | `Bearer {token}`   |
| Content-Type  | string | 是   | `application/json` |

### 请求体

无

### 响应数据结构

| 字段名  | 类型    | 描述       |
| ------- | ------- | ---------- |
| code    | integer | 状态码     |
| message | string  | 响应消息   |
| data    | null    | 无数据返回 |

### 成功响应示例

**HTTP Status**: 200 OK

```json
{
  "code": 0,
  "message": "登出成功",
  "data": null,
  "timestamp": 1708924800000
}
```

### 错误响应信息

| 错误码 | HTTP状态码 | 说明              |
| ------ | ---------- | ----------------- |
| 401    | 401        | Token无效或已过期 |

### 认证要求

| 项目     | 说明                          |
| -------- | ----------------------------- |
| 认证方式 | JWT Bearer Token              |
| 必需角色 | admin / supervisor / designer |

### 速率限制

| 项目     | 说明           |
| -------- | -------------- |
| 限制策略 | 10次/分钟/用户 |

### 特殊说明

| 项目      | 说明                           |
| --------- | ------------------------------ |
| Token失效 | 登出后当前Token立即失效        |
| 多设备    | 仅登出当前设备，不影响其他设备 |

---

## 1.3 获取验证码

### 接口信息

| 项目         | 内容                         |
| ------------ | ---------------------------- |
| **接口名称** | 获取验证码                   |
| **接口描述** | 获取图形验证码，用于登录验证 |
| **请求方法** | GET                          |
| **完整URL**  | `/api/v1/auth/captcha`       |

### 请求参数

#### Query Parameters

| 参数名 | 类型    | 必填 | 描述                       | 默认值  |
| ------ | ------- | ---- | -------------------------- | ------- |
| type   | string  | 否   | 验证码类型：`image`/`text` | `image` |
| length | integer | 否   | 验证码长度，4-6位          | 4       |
| width  | integer | 否   | 图片宽度（像素）           | 120     |
| height | integer | 否   | 图片高度（像素）           | 40      |

### 请求头

| Header名称 | 类型   | 必填 | 描述               |
| ---------- | ------ | ---- | ------------------ |
| Accept     | string | 否   | `application/json` |

### 请求体

无

### 响应数据结构

| 字段名            | 类型    | 描述                         |
| ----------------- | ------- | ---------------------------- |
| code              | integer | 状态码                       |
| message           | string  | 响应消息                     |
| data              | object  | 响应数据                     |
| data.captchaKey   | string  | 验证码唯一标识，登录时需传递 |
| data.captchaImage | string  | Base64编码的验证码图片       |
| data.expireTime   | integer | 验证码过期时间戳             |

### 成功响应示例

**HTTP Status**: 200 OK

```json
{
  "code": 0,
  "message": "成功",
  "data": {
    "captchaKey": "550e8400-e29b-41d4-a716-446655440000",
    "captchaImage": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAAoCAYAAADl...",
    "expireTime": 1708925100000
  },
  "timestamp": 1708924800000
}
```

### 错误响应信息

| 错误码 | HTTP状态码 | 说明         |
| ------ | ---------- | ------------ |
| 429    | 429        | 请求频率超限 |

### 认证要求

| 项目     | 说明     |
| -------- | -------- |
| 认证方式 | 无需认证 |
| 公开访问 | 是       |

### 速率限制

| 项目     | 说明             |
| -------- | ---------------- |
| 限制策略 | 10次/分钟/IP地址 |

### 特殊说明

| 项目   | 说明                 |
| ------ | -------------------- |
| 有效期 | 验证码5分钟内有效    |
| 刷新   | 点击图片可刷新验证码 |
| 大小写 | 验证码不区分大小写   |

---

## 1.4 刷新Token

### 接口信息

| 项目         | 内容                         |
| ------------ | ---------------------------- |
| **接口名称** | 刷新Token                    |
| **接口描述** | 使用刷新令牌获取新的访问令牌 |
| **请求方法** | POST                         |
| **完整URL**  | `/api/v1/auth/refresh-token` |

### 请求参数

无

### 请求头

| Header名称   | 类型   | 必填 | 描述               |
| ------------ | ------ | ---- | ------------------ |
| Content-Type | string | 是   | `application/json` |

### 请求体

**Content-Type**: `application/json`

**请求示例**:

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsImlhdCI6MTcwODkyNDgwMCwiZXhwIjoxNzA5NTI5ODAwLCJ0eXBlIjoicmVmcmVzaCJ9.signature"
}
```

### 响应数据结构

| 字段名            | 类型    | 描述                |
| ----------------- | ------- | ------------------- |
| data.token        | string  | 新的访问令牌        |
| data.refreshToken | string  | 新的刷新令牌        |
| data.expiresIn    | integer | Token过期时间（秒） |
| data.tokenType    | string  | Token类型           |

### 成功响应示例

```json
{
  "code": 0,
  "message": "Token刷新成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.new_token...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.new_refresh_token...",
    "expiresIn": 7200,
    "tokenType": "Bearer"
  },
  "timestamp": 1708924800000
}
```

### 错误响应信息

| 错误码 | HTTP状态码 | 说明           |
| ------ | ---------- | -------------- |
| 1011   | 401        | 刷新令牌无效   |
| 1012   | 401        | 刷新令牌已过期 |

### 认证要求

| 项目     | 说明                     |
| -------- | ------------------------ |
| 认证方式 | 无需认证（使用刷新令牌） |

### 速率限制

| 项目     | 说明           |
| -------- | -------------- |
| 限制策略 | 20次/分钟/用户 |

### 特殊说明

| 项目     | 说明                                 |
| -------- | ------------------------------------ |
| 自动刷新 | 建议在Token过期前5分钟自动刷新       |
| 令牌轮换 | 每次刷新会生成新的刷新令牌，旧的失效 |

---

## 1.5 修改密码

### 接口信息

| 项目         | 内容                    |
| ------------ | ----------------------- |
| **接口名称** | 修改密码                |
| **接口描述** | 用户修改自己的登录密码  |
| **请求方法** | PUT                     |
| **完整URL**  | `/api/v1/auth/password` |

### 请求参数

无

### 请求头

| Header名称    | 类型   | 必填 | 描述               |
| ------------- | ------ | ---- | ------------------ |
| Authorization | string | 是   | `Bearer {token}`   |
| Content-Type  | string | 是   | `application/json` |

### 请求体

**Content-Type**: `application/json`

**JSON Schema**:

```json
{
  "type": "object",
  "required": ["oldPassword", "newPassword", "confirmPassword"],
  "properties": {
    "oldPassword": {
      "type": "string",
      "description": "原密码"
    },
    "newPassword": {
      "type": "string",
      "minLength": 8,
      "maxLength": 20,
      "description": "新密码"
    },
    "confirmPassword": {
      "type": "string",
      "description": "确认新密码"
    }
  }
}
```

**请求示例**:

```json
{
  "oldPassword": "Old@2025",
  "newPassword": "New@2026",
  "confirmPassword": "New@2026"
}
```

### 响应数据结构

| 字段名  | 类型    | 描述       |
| ------- | ------- | ---------- |
| code    | integer | 状态码     |
| message | string  | 响应消息   |
| data    | null    | 无数据返回 |

### 成功响应示例

```json
{
  "code": 0,
  "message": "密码修改成功，请重新登录",
  "data": null,
  "timestamp": 1708924800000
}
```

### 错误响应信息

| 错误码 | HTTP状态码 | 说明                   |
| ------ | ---------- | ---------------------- |
| 1021   | 400        | 原密码错误             |
| 1022   | 400        | 新密码格式不符合要求   |
| 1023   | 400        | 两次密码输入不一致     |
| 1024   | 400        | 新密码不能与原密码相同 |

### 认证要求

| 项目     | 说明                          |
| -------- | ----------------------------- |
| 认证方式 | JWT Bearer Token              |
| 必需角色 | admin / supervisor / designer |

### 速率限制

| 项目     | 说明          |
| -------- | ------------- |
| 限制策略 | 5次/分钟/用户 |

### 特殊说明

| 项目     | 说明                                   |
| -------- | -------------------------------------- |
| 密码策略 | 8-20位，包含大小写字母、数字和特殊字符 |
| 重新登录 | 修改密码后需重新登录                   |
| 历史密码 | 新密码不能与最近5次使用的密码相同      |

---

## 1.6 找回密码

### 接口信息

| 项目         | 内容                           |
| ------------ | ------------------------------ |
| **接口名称** | 找回密码                       |
| **接口描述** | 通过手机号或邮箱找回密码       |
| **请求方法** | POST                           |
| **完整URL**  | `/api/v1/auth/forgot-password` |

### 请求参数

无

### 请求头

| Header名称   | 类型   | 必填 | 描述               |
| ------------ | ------ | ---- | ------------------ |
| Content-Type | string | 是   | `application/json` |

### 请求体

**Content-Type**: `application/json`

**请求示例**:

```json
{
  "account": "admin",
  "type": "phone",
  "verifyCode": "123456",
  "newPassword": "New@2026",
  "confirmPassword": "New@2026"
}
```

### 响应数据结构

| 字段名  | 类型    | 描述     |
| ------- | ------- | -------- |
| code    | integer | 状态码   |
| message | string  | 响应消息 |

### 成功响应示例

```json
{
  "code": 0,
  "message": "密码重置成功，请使用新密码登录",
  "data": null,
  "timestamp": 1708924800000
}
```

### 错误响应信息

| 错误码 | HTTP状态码 | 说明         |
| ------ | ---------- | ------------ |
| 1031   | 400        | 账号不存在   |
| 1032   | 400        | 验证码错误   |
| 1033   | 400        | 验证码已过期 |

### 认证要求

| 项目     | 说明     |
| -------- | -------- |
| 认证方式 | 无需认证 |

### 速率限制

| 项目     | 说明            |
| -------- | --------------- |
| 限制策略 | 3次/分钟/IP地址 |

### 特殊说明

| 项目   | 说明                   |
| ------ | ---------------------- |
| 验证码 | 需先调用发送验证码接口 |
| 有效期 | 验证码10分钟内有效     |

---

# 模块二：用户管理模块

---

## 2.1 获取用户列表

### 接口信息

| 项目         | 内容                                 |
| ------------ | ------------------------------------ |
| **接口名称** | 获取用户列表                         |
| **接口描述** | 分页查询系统用户列表，支持多条件筛选 |
| **请求方法** | GET                                  |
| **完整URL**  | `/api/v1/user/list`                  |

### 请求参数

#### Query Parameters

| 参数名    | 类型    | 必填 | 描述                       | 默认值       | 示例值       |
| --------- | ------- | ---- | -------------------------- | ------------ | ------------ |
| pageNum   | integer | 否   | 页码，从1开始              | 1            | 1            |
| pageSize  | integer | 否   | 每页条数，最大100          | 10           | 10           |
| userId    | string  | 否   | 用户ID，模糊查询           | -            | "U001"       |
| userName  | string  | 否   | 用户名，模糊查询           | -            | "张"         |
| phone     | string  | 否   | 手机号，模糊查询           | -            | "138"        |
| email     | string  | 否   | 邮箱，模糊查询             | -            | "example"    |
| role      | string  | 否   | 角色筛选                   | -            | "designer"   |
| status    | string  | 否   | 状态筛选：启用/禁用/已删除 | -            | "启用"       |
| deptId    | integer | 否   | 部门ID筛选                 | -            | 1            |
| startTime | string  | 否   | 注册开始时间               | -            | "2024-01-01" |
| endTime   | string  | 否   | 注册结束时间               | -            | "2024-12-31" |
| sortField | string  | 否   | 排序字段                   | "createTime" | "createTime" |
| sortOrder | string  | 否   | 排序方式：asc/desc         | "desc"       | "desc"       |

### 请求头

| Header名称    | 类型   | 必填 | 描述               |
| ------------- | ------ | ---- | ------------------ |
| Authorization | string | 是   | `Bearer {token}`   |
| Accept        | string | 否   | `application/json` |

### 请求体

无

### 响应数据结构

| 字段名                    | 类型    | 描述         |
| ------------------------- | ------- | ------------ |
| code                      | integer | 状态码       |
| message                   | string  | 响应消息     |
| data                      | object  | 响应数据     |
| data.list                 | array   | 用户列表     |
| data.list[].id            | integer | 主键ID       |
| data.list[].userId        | string  | 用户ID       |
| data.list[].userName      | string  | 用户名       |
| data.list[].phone         | string  | 手机号       |
| data.list[].email         | string  | 邮箱         |
| data.list[].role          | string  | 角色         |
| data.list[].roleName      | string  | 角色名称     |
| data.list[].status        | string  | 状态         |
| data.list[].deptId        | integer | 部门ID       |
| data.list[].deptName      | string  | 部门名称     |
| data.list[].avatar        | string  | 头像URL      |
| data.list[].registerTime  | string  | 注册时间     |
| data.list[].lastLoginTime | string  | 最后登录时间 |
| data.list[].loginCount    | integer | 登录次数     |
| data.total                | integer | 总记录数     |
| data.pageNum              | integer | 当前页码     |
| data.pageSize             | integer | 每页条数     |
| data.pages                | integer | 总页数       |

### 成功响应示例

**HTTP Status**: 200 OK

```json
{
  "code": 0,
  "message": "成功",
  "data": {
    "list": [
      {
        "id": 1,
        "userId": "U001",
        "userName": "张三",
        "phone": "138****8001",
        "email": "zhang***@example.com",
        "role": "designer",
        "roleName": "设计师",
        "status": "启用",
        "deptId": 1,
        "deptName": "技术部",
        "avatar": "https://api.kunlunbei.com/avatar/U001.png",
        "registerTime": "2023-01-15 10:30:00",
        "lastLoginTime": "2024-01-15 08:30:25",
        "loginCount": 156
      },
      {
        "id": 2,
        "userId": "U002",
        "userName": "李四",
        "phone": "139****9002",
        "email": "li***@example.com",
        "role": "supervisor",
        "roleName": "主管",
        "status": "启用",
        "deptId": 2,
        "deptName": "生产部",
        "avatar": "https://api.kunlunbei.com/avatar/U002.png",
        "registerTime": "2023-02-20 14:20:00",
        "lastLoginTime": "2024-01-15 09:15:30",
        "loginCount": 89
      }
    ],
    "total": 100,
    "pageNum": 1,
    "pageSize": 10,
    "pages": 10
  },
  "timestamp": 1708924800000
}
```

### 错误响应信息

| 错误码 | HTTP状态码 | 说明              |
| ------ | ---------- | ----------------- |
| 401    | 401        | Token无效或已过期 |
| 403    | 403        | 无权限访问        |

### 认证要求

| 项目     | 说明             |
| -------- | ---------------- |
| 认证方式 | JWT Bearer Token |
| 必需角色 | admin            |

### 速率限制

| 项目     | 说明            |
| -------- | --------------- |
| 限制策略 | 100次/分钟/用户 |

### 特殊说明

| 项目     | 说明                                 |
| -------- | ------------------------------------ |
| 数据脱敏 | 手机号和邮箱返回时自动脱敏           |
| 排序支持 | 支持按创建时间、登录时间、用户名排序 |
| 导出功能 | 可通过export参数导出Excel            |

---

## 2.2 获取用户详情

### 接口信息

| 项目         | 内容                       |
| ------------ | -------------------------- |
| **接口名称** | 获取用户详情               |
| **接口描述** | 根据用户ID获取用户详细信息 |
| **请求方法** | GET                        |
| **完整URL**  | `/api/v1/user/{id}`        |

### 请求参数

#### Path Parameters

| 参数名 | 类型    | 必填 | 描述       |
| ------ | ------- | ---- | ---------- |
| id     | integer | 是   | 用户主键ID |

### 请求头

| Header名称    | 类型   | 必填 | 描述             |
| ------------- | ------ | ---- | ---------------- |
| Authorization | string | 是   | `Bearer {token}` |

### 请求体

无

### 响应数据结构

| 字段名             | 类型    | 描述             |
| ------------------ | ------- | ---------------- |
| data.id            | integer | 主键ID           |
| data.userId        | string  | 用户ID           |
| data.userName      | string  | 用户名           |
| data.phone         | string  | 手机号           |
| data.email         | string  | 邮箱             |
| data.role          | string  | 角色             |
| data.roleName      | string  | 角色名称         |
| data.status        | string  | 状态             |
| data.deptId        | integer | 部门ID           |
| data.deptName      | string  | 部门名称         |
| data.avatar        | string  | 头像URL          |
| data.gender        | string  | 性别             |
| data.birthday      | string  | 生日             |
| data.idCard        | string  | 身份证号（脱敏） |
| data.address       | string  | 地址             |
| data.remark        | string  | 备注             |
| data.registerTime  | string  | 注册时间         |
| data.lastLoginTime | string  | 最后登录时间     |
| data.lastLoginIp   | string  | 最后登录IP       |
| data.loginCount    | integer | 登录次数         |
| data.createTime    | string  | 创建时间         |
| data.updateTime    | string  | 更新时间         |

### 成功响应示例

```json
{
  "code": 0,
  "message": "成功",
  "data": {
    "id": 1,
    "userId": "U001",
    "userName": "张三",
    "phone": "13800138001",
    "email": "zhangsan@example.com",
    "role": "designer",
    "roleName": "设计师",
    "status": "启用",
    "deptId": 1,
    "deptName": "技术部",
    "avatar": "https://api.kunlunbei.com/avatar/U001.png",
    "gender": "男",
    "birthday": "1990-05-15",
    "idCard": "110***********1234",
    "address": "北京市朝阳区xxx街道",
    "remark": "高级设计师",
    "registerTime": "2023-01-15 10:30:00",
    "lastLoginTime": "2024-01-15 08:30:25",
    "lastLoginIp": "192.168.1.100",
    "loginCount": 156,
    "createTime": "2023-01-15 10:30:00",
    "updateTime": "2024-01-10 15:20:00"
  },
  "timestamp": 1708924800000
}
```

### 错误响应信息

| 错误码 | HTTP状态码 | 说明       |
| ------ | ---------- | ---------- |
| 2001   | 404        | 用户不存在 |

### 认证要求

| 项目     | 说明             |
| -------- | ---------------- |
| 认证方式 | JWT Bearer Token |
| 必需角色 | admin            |

### 速率限制

| 项目     | 说明            |
| -------- | --------------- |
| 限制策略 | 200次/分钟/用户 |

---

## 2.3 新增用户

### 接口信息

| 项目         | 内容                 |
| ------------ | -------------------- |
| **接口名称** | 新增用户             |
| **接口描述** | 创建新的系统用户账号 |
| **请求方法** | POST                 |
| **完整URL**  | `/api/v1/user`       |

### 请求参数

无

### 请求头

| Header名称    | 类型   | 必填 | 描述               |
| ------------- | ------ | ---- | ------------------ |
| Authorization | string | 是   | `Bearer {token}`   |
| Content-Type  | string | 是   | `application/json` |

### 请求体

**Content-Type**: `application/json`

**JSON Schema**:

```json
{
  "type": "object",
  "required": ["userName", "phone", "email", "password", "role"],
  "properties": {
    "userName": {
      "type": "string",
      "minLength": 2,
      "maxLength": 20,
      "description": "用户名"
    },
    "phone": {
      "type": "string",
      "pattern": "^1[3-9]\\d{9}$",
      "description": "手机号"
    },
    "email": {
      "type": "string",
      "format": "email",
      "description": "邮箱"
    },
    "password": {
      "type": "string",
      "minLength": 8,
      "maxLength": 20,
      "description": "密码"
    },
    "role": {
      "type": "string",
      "enum": ["admin", "supervisor", "designer"],
      "description": "角色"
    },
    "deptId": {
      "type": "integer",
      "description": "部门ID"
    },
    "gender": {
      "type": "string",
      "enum": ["男", "女"],
      "description": "性别"
    },
    "birthday": {
      "type": "string",
      "format": "date",
      "description": "生日"
    },
    "idCard": {
      "type": "string",
      "description": "身份证号"
    },
    "address": {
      "type": "string",
      "maxLength": 200,
      "description": "地址"
    },
    "remark": {
      "type": "string",
      "maxLength": 500,
      "description": "备注"
    }
  }
}
```

**请求示例**:

```json
{
  "userName": "王五",
  "phone": "13800138003",
  "email": "wangwu@example.com",
  "password": "User@2025",
  "role": "designer",
  "deptId": 1,
  "gender": "男",
  "birthday": "1992-08-20",
  "address": "北京市海淀区xxx街道",
  "remark": "新入职设计师"
}
```

### 响应数据结构

| 字段名      | 类型    | 描述               |
| ----------- | ------- | ------------------ |
| code        | integer | 状态码             |
| message     | string  | 响应消息           |
| data        | object  | 响应数据           |
| data.id     | integer | 新创建用户的主键ID |
| data.userId | string  | 系统生成的用户ID   |

### 成功响应示例

**HTTP Status**: 201 Created

```json
{
  "code": 0,
  "message": "新增成功",
  "data": {
    "id": 3,
    "userId": "U003"
  },
  "timestamp": 1708924800000
}
```

### 错误响应信息

| 错误码 | HTTP状态码 | 说明         |
| ------ | ---------- | ------------ |
| 2011   | 400        | 用户名已存在 |
| 2012   | 400        | 手机号已注册 |
| 2013   | 400        | 邮箱已注册   |
| 2014   | 400        | 参数校验失败 |

### 认证要求

| 项目     | 说明             |
| -------- | ---------------- |
| 认证方式 | JWT Bearer Token |
| 必需角色 | admin            |

### 速率限制

| 项目     | 说明           |
| -------- | -------------- |
| 限制策略 | 20次/分钟/用户 |

### 特殊说明

| 项目     | 说明                              |
| -------- | --------------------------------- |
| 用户ID   | 系统自动生成，格式：U001、U002... |
| 初始密码 | 首次登录需强制修改密码            |
| 唯一性   | 用户名、手机号、邮箱均需唯一      |

---

## 2.4 更新用户

### 接口信息

| 项目         | 内容             |
| ------------ | ---------------- |
| **接口名称** | 更新用户         |
| **接口描述** | 更新用户基本信息 |
| **请求方法** | PUT              |
| **完整URL**  | `/api/v1/user`   |

### 请求参数

无

### 请求头

| Header名称    | 类型   | 必填 | 描述               |
| ------------- | ------ | ---- | ------------------ |
| Authorization | string | 是   | `Bearer {token}`   |
| Content-Type  | string | 是   | `application/json` |

### 请求体

**Content-Type**: `application/json`

**请求示例**:

```json
{
  "id": 3,
  "userName": "王五更新",
  "phone": "13800138004",
  "email": "wangwu_new@example.com",
  "role": "supervisor",
  "deptId": 2,
  "gender": "男",
  "birthday": "1992-08-20",
  "address": "北京市朝阳区xxx街道",
  "remark": "晋升为主管"
}
```

### 响应数据结构

| 字段名  | 类型    | 描述     |
| ------- | ------- | -------- |
| code    | integer | 状态码   |
| message | string  | 响应消息 |

### 成功响应示例

```json
{
  "code": 0,
  "message": "更新成功",
  "data": null,
  "timestamp": 1708924800000
}
```

### 错误响应信息

| 错误码 | HTTP状态码 | 说明               |
| ------ | ---------- | ------------------ |
| 2001   | 404        | 用户不存在         |
| 2011   | 400        | 用户名已存在       |
| 2012   | 400        | 手机号已注册       |
| 2013   | 400        | 邮箱已注册         |
| 2021   | 403        | 不能修改管理员用户 |

### 认证要求

| 项目     | 说明             |
| -------- | ---------------- |
| 认证方式 | JWT Bearer Token |
| 必需角色 | admin            |

### 特殊说明

| 项目       | 说明                             |
| ---------- | -------------------------------- |
| 管理员保护 | 不能修改admin角色的用户信息      |
| 密码修改   | 密码修改需通过专门的修改密码接口 |

---

## 2.5 删除用户

### 接口信息

| 项目         | 内容                   |
| ------------ | ---------------------- |
| **接口名称** | 删除用户               |
| **接口描述** | 删除指定用户（软删除） |
| **请求方法** | DELETE                 |
| **完整URL**  | `/api/v1/user/{id}`    |

### 请求参数

#### Path Parameters

| 参数名 | 类型    | 必填 | 描述       |
| ------ | ------- | ---- | ---------- |
| id     | integer | 是   | 用户主键ID |

### 请求头

| Header名称    | 类型   | 必填 | 描述             |
| ------------- | ------ | ---- | ---------------- |
| Authorization | string | 是   | `Bearer {token}` |

### 请求体

无

### 响应数据结构

| 字段名  | 类型    | 描述     |
| ------- | ------- | -------- |
| code    | integer | 状态码   |
| message | string  | 响应消息 |

### 成功响应示例

```json
{
  "code": 0,
  "message": "删除成功",
  "data": null,
  "timestamp": 1708924800000
}
```

### 错误响应信息

| 错误码 | HTTP状态码 | 说明                     |
| ------ | ---------- | ------------------------ |
| 2001   | 404        | 用户不存在               |
| 2021   | 403        | 不能删除管理员用户       |
| 2022   | 400        | 用户有关联数据，无法删除 |

### 认证要求

| 项目     | 说明             |
| -------- | ---------------- |
| 认证方式 | JWT Bearer Token |
| 必需角色 | admin            |

### 特殊说明

| 项目       | 说明                         |
| ---------- | ---------------------------- |
| 软删除     | 实际是将用户状态改为"已删除" |
| 管理员保护 | 不能删除admin角色的用户      |

---

## 2.6 批量冻结用户

### 接口信息

| 项目         | 内容                        |
| ------------ | --------------------------- |
| **接口名称** | 批量冻结用户                |
| **接口描述** | 批量将用户状态设置为禁用    |
| **请求方法** | PUT                         |
| **完整URL**  | `/api/v1/user/batch-freeze` |

### 请求参数

无

### 请求头

| Header名称    | 类型   | 必填 | 描述               |
| ------------- | ------ | ---- | ------------------ |
| Authorization | string | 是   | `Bearer {token}`   |
| Content-Type  | string | 是   | `application/json` |

### 请求体

**Content-Type**: `application/json`

**请求示例**:

```json
{
  "ids": [2, 3, 4]
}
```

### 响应数据结构

| 字段名                 | 类型    | 描述     |
| ---------------------- | ------- | -------- |
| data.successCount      | integer | 成功数量 |
| data.failCount         | integer | 失败数量 |
| data.failList          | array   | 失败列表 |
| data.failList[].id     | integer | 用户ID   |
| data.failList[].reason | string  | 失败原因 |

### 成功响应示例

```json
{
  "code": 0,
  "message": "批量冻结成功",
  "data": {
    "successCount": 2,
    "failCount": 1,
    "failList": [
      {
        "id": 1,
        "reason": "不能冻结管理员用户"
      }
    ]
  },
  "timestamp": 1708924800000
}
```

### 错误响应信息

| 错误码 | HTTP状态码 | 说明               |
| ------ | ---------- | ------------------ |
| 2031   | 400        | 请选择要冻结的用户 |

### 认证要求

| 项目     | 说明             |
| -------- | ---------------- |
| 认证方式 | JWT Bearer Token |
| 必需角色 | admin            |

### 特殊说明

| 项目       | 说明                    |
| ---------- | ----------------------- |
| 管理员保护 | 不能冻结admin角色的用户 |
| 最大数量   | 单次最多操作100个用户   |

---

## 2.7 批量解冻用户

### 接口信息

| 项目         | 内容                          |
| ------------ | ----------------------------- |
| **接口名称** | 批量解冻用户                  |
| **接口描述** | 批量将用户状态设置为启用      |
| **请求方法** | PUT                           |
| **完整URL**  | `/api/v1/user/batch-unfreeze` |

### 请求参数

无

### 请求头

| Header名称    | 类型   | 必填 | 描述               |
| ------------- | ------ | ---- | ------------------ |
| Authorization | string | 是   | `Bearer {token}`   |
| Content-Type  | string | 是   | `application/json` |

### 请求体

**Content-Type**: `application/json`

**请求示例**:

```json
{
  "ids": [2, 3, 4]
}
```

### 成功响应示例

```json
{
  "code": 0,
  "message": "批量解冻成功",
  "data": {
    "successCount": 3,
    "failCount": 0,
    "failList": []
  },
  "timestamp": 1708924800000
}
```

### 认证要求

| 项目     | 说明             |
| -------- | ---------------- |
| 认证方式 | JWT Bearer Token |
| 必需角色 | admin            |

---

## 2.8 批量删除用户

### 接口信息

| 项目         | 内容                        |
| ------------ | --------------------------- |
| **接口名称** | 批量删除用户                |
| **接口描述** | 批量删除用户（软删除）      |
| **请求方法** | PUT                         |
| **完整URL**  | `/api/v1/user/batch-delete` |

### 请求参数

无

### 请求头

| Header名称    | 类型   | 必填 | 描述               |
| ------------- | ------ | ---- | ------------------ |
| Authorization | string | 是   | `Bearer {token}`   |
| Content-Type  | string | 是   | `application/json` |

### 请求体

**Content-Type**: `application/json`

**请求示例**:

```json
{
  "ids": [2, 3, 4]
}
```

### 成功响应示例

```json
{
  "code": 0,
  "message": "批量删除成功",
  "data": {
    "successCount": 2,
    "failCount": 1,
    "failList": [
      {
        "id": 1,
        "reason": "不能删除管理员用户"
      }
    ]
  },
  "timestamp": 1708924800000
}
```

### 认证要求

| 项目     | 说明             |
| -------- | ---------------- |
| 认证方式 | JWT Bearer Token |
| 必需角色 | admin            |

---

## 2.9 重置用户密码

### 接口信息

| 项目         | 内容                               |
| ------------ | ---------------------------------- |
| **接口名称** | 重置用户密码                       |
| **接口描述** | 管理员重置指定用户的密码           |
| **请求方法** | PUT                                |
| **完整URL**  | `/api/v1/user/{id}/reset-password` |

### 请求参数

#### Path Parameters

| 参数名 | 类型    | 必填 | 描述       |
| ------ | ------- | ---- | ---------- |
| id     | integer | 是   | 用户主键ID |

### 请求头

| Header名称    | 类型   | 必填 | 描述               |
| ------------- | ------ | ---- | ------------------ |
| Authorization | string | 是   | `Bearer {token}`   |
| Content-Type  | string | 是   | `application/json` |

### 请求体

**Content-Type**: `application/json`

**请求示例**:

```json
{
  "newPassword": "NewPass@2026",
  "isRandom": false
}
```

### 响应数据结构

| 字段名           | 类型   | 描述                         |
| ---------------- | ------ | ---------------------------- |
| data.newPassword | string | 新密码（明文，仅此一次返回） |

### 成功响应示例

```json
{
  "code": 0,
  "message": "密码重置成功",
  "data": {
    "newPassword": "NewPass@2026"
  },
  "timestamp": 1708924800000
}
```

### 错误响应信息

| 错误码 | HTTP状态码 | 说明               |
| ------ | ---------- | ------------------ |
| 2001   | 404        | 用户不存在         |
| 2021   | 403        | 不能重置管理员密码 |

### 认证要求

| 项目     | 说明             |
| -------- | ---------------- |
| 认证方式 | JWT Bearer Token |
| 必需角色 | admin            |

### 特殊说明

| 项目     | 说明                                |
| -------- | ----------------------------------- |
| 随机密码 | isRandom=true时系统自动生成随机密码 |
| 强制修改 | 重置后用户首次登录需修改密码        |

---

## 2.10 切换用户状态

### 接口信息

| 项目         | 内容                        |
| ------------ | --------------------------- |
| **接口名称** | 切换用户状态                |
| **接口描述** | 切换单个用户的启用/禁用状态 |
| **请求方法** | PUT                         |
| **完整URL**  | `/api/v1/user/{id}/status`  |

### 请求参数

#### Path Parameters

| 参数名 | 类型    | 必填 | 描述       |
| ------ | ------- | ---- | ---------- |
| id     | integer | 是   | 用户主键ID |

### 请求头

| Header名称    | 类型   | 必填 | 描述               |
| ------------- | ------ | ---- | ------------------ |
| Authorization | string | 是   | `Bearer {token}`   |
| Content-Type  | string | 是   | `application/json` |

### 请求体

**Content-Type**: `application/json`

**请求示例**:

```json
{
  "status": "禁用"
}
```

### 成功响应示例

```json
{
  "code": 0,
  "message": "状态更新成功",
  "data": {
    "status": "禁用"
  },
  "timestamp": 1708924800000
}
```

### 认证要求

| 项目     | 说明             |
| -------- | ---------------- |
| 认证方式 | JWT Bearer Token |
| 必需角色 | admin            |

---

# 模块三：设备管理模块

---

## 3.1 获取设备列表

### 接口信息

| 项目         | 内容                  |
| ------------ | --------------------- |
| **接口名称** | 获取设备列表          |
| **接口描述** | 分页查询设备台账列表  |
| **请求方法** | GET                   |
| **完整URL**  | `/api/v1/device/list` |

### 请求参数

#### Query Parameters

| 参数名     | 类型    | 必填 | 描述               | 默认值 |
| ---------- | ------- | ---- | ------------------ | ------ |
| pageNum    | integer | 否   | 页码               | 1      |
| pageSize   | integer | 否   | 每页条数           | 10     |
| deviceCode | string  | 否   | 设备编码，模糊查询 | -      |
| deviceName | string  | 否   | 设备名称，模糊查询 | -      |
| brand      | string  | 否   | 品牌筛选           | -      |
| location   | string  | 否   | 位置筛选           | -      |
| status     | string  | 否   | 状态筛选           | -      |

### 请求头

| Header名称    | 类型   | 必填 | 描述             |
| ------------- | ------ | ---- | ---------------- |
| Authorization | string | 是   | `Bearer {token}` |

### 请求体

无

### 响应数据结构

| 字段名                         | 类型    | 描述           |
| ------------------------------ | ------- | -------------- |
| data.list                      | array   | 设备列表       |
| data.list[].id                 | integer | 主键ID         |
| data.list[].deviceCode         | string  | 设备编码       |
| data.list[].deviceName         | string  | 设备名称       |
| data.list[].manufacturer       | string  | 生产厂家       |
| data.list[].brand              | string  | 品牌           |
| data.list[].specModel          | string  | 规格型号       |
| data.list[].supplier           | string  | 供应商         |
| data.list[].productionDate     | string  | 生产日期       |
| data.list[].serviceLife        | integer | 使用年限（年） |
| data.list[].depreciationMethod | string  | 折旧方式       |
| data.list[].location           | string  | 存放位置       |
| data.list[].stockQuantity      | integer | 库存数量       |
| data.list[].unit               | string  | 单位           |
| data.list[].status             | string  | 状态           |
| data.list[].createTime         | string  | 创建时间       |
| data.list[].updateTime         | string  | 更新时间       |
| data.total                     | integer | 总记录数       |

### 成功响应示例

```json
{
  "code": 0,
  "message": "成功",
  "data": {
    "list": [
      {
        "id": 1,
        "deviceCode": "DEV20240001",
        "deviceName": "数控车床",
        "manufacturer": "沈阳机床厂",
        "brand": "沈机",
        "specModel": "CK6140",
        "supplier": "沈阳机床销售公司",
        "productionDate": "2024-01-15",
        "serviceLife": 15,
        "depreciationMethod": "直线法",
        "location": "A车间-1号位",
        "stockQuantity": 5,
        "unit": "台",
        "status": "正常",
        "createTime": "2024-01-15 10:30:00",
        "updateTime": "2024-01-15 10:30:00"
      }
    ],
    "total": 50
  },
  "timestamp": 1708924800000
}
```

### 认证要求

| 项目     | 说明                                |
| -------- | ----------------------------------- |
| 认证方式 | JWT Bearer Token                    |
| 必需角色 | admin / supervisor(只读) / designer |

### 速率限制

| 项目     | 说明            |
| -------- | --------------- |
| 限制策略 | 100次/分钟/用户 |

---

## 3.2 获取设备详情

### 接口信息

| 项目         | 内容                   |
| ------------ | ---------------------- |
| **接口名称** | 获取设备详情           |
| **接口描述** | 根据设备ID获取详细信息 |
| **请求方法** | GET                    |
| **完整URL**  | `/api/v1/device/{id}`  |

### 请求参数

#### Path Parameters

| 参数名 | 类型    | 必填 | 描述       |
| ------ | ------- | ---- | ---------- |
| id     | integer | 是   | 设备主键ID |

### 成功响应示例

```json
{
  "code": 0,
  "message": "成功",
  "data": {
    "id": 1,
    "deviceCode": "DEV20240001",
    "deviceName": "数控车床",
    "manufacturer": "沈阳机床厂",
    "brand": "沈机",
    "specModel": "CK6140",
    "supplier": "沈阳机床销售公司",
    "productionDate": "2024-01-15",
    "serviceLife": 15,
    "depreciationMethod": "直线法",
    "location": "A车间-1号位",
    "stockQuantity": 5,
    "unit": "台",
    "status": "正常",
    "remark": "主加工设备",
    "createTime": "2024-01-15 10:30:00",
    "updateTime": "2024-01-15 10:30:00"
  },
  "timestamp": 1708924800000
}
```

### 认证要求

| 项目     | 说明                          |
| -------- | ----------------------------- |
| 认证方式 | JWT Bearer Token              |
| 必需角色 | admin / supervisor / designer |

---

## 3.3 新增设备

### 接口信息

| 项目         | 内容                 |
| ------------ | -------------------- |
| **接口名称** | 新增设备             |
| **接口描述** | 录入新设备信息到台账 |
| **请求方法** | POST                 |
| **完整URL**  | `/api/v1/device`     |

### 请求头

| Header名称    | 类型   | 必填 | 描述               |
| ------------- | ------ | ---- | ------------------ |
| Authorization | string | 是   | `Bearer {token}`   |
| Content-Type  | string | 是   | `application/json` |

### 请求体

**Content-Type**: `application/json`

**请求示例**:

```json
{
  "deviceName": "数控车床",
  "manufacturer": "沈阳机床厂",
  "brand": "沈机",
  "specModel": "CK6140",
  "supplier": "沈阳机床销售公司",
  "productionDate": "2024-01-15",
  "serviceLife": 15,
  "depreciationMethod": "直线法",
  "location": "A车间-1号位",
  "stockQuantity": 5,
  "unit": "台",
  "remark": "主加工设备"
}
```

### 成功响应示例

```json
{
  "code": 0,
  "message": "新增成功",
  "data": {
    "id": 1,
    "deviceCode": "DEV20240001"
  },
  "timestamp": 1708924800000
}
```

### 认证要求

| 项目     | 说明             |
| -------- | ---------------- |
| 认证方式 | JWT Bearer Token |
| 必需角色 | admin / designer |

---

## 3.4 更新设备

### 接口信息

| 项目         | 内容             |
| ------------ | ---------------- |
| **接口名称** | 更新设备         |
| **接口描述** | 更新设备信息     |
| **请求方法** | PUT              |
| **完整URL**  | `/api/v1/device` |

### 请求体

**请求示例**:

```json
{
  "id": 1,
  "deviceName": "数控车床-更新",
  "location": "B车间-2号位",
  "stockQuantity": 3,
  "remark": "设备已搬迁"
}
```

### 成功响应示例

```json
{
  "code": 0,
  "message": "更新成功",
  "data": null,
  "timestamp": 1708924800000
}
```

### 认证要求

| 项目     | 说明             |
| -------- | ---------------- |
| 认证方式 | JWT Bearer Token |
| 必需角色 | admin / designer |

---

## 3.5 删除设备

### 接口信息

| 项目         | 内容                  |
| ------------ | --------------------- |
| **接口名称** | 删除设备              |
| **接口描述** | 删除设备记录          |
| **请求方法** | DELETE                |
| **完整URL**  | `/api/v1/device/{id}` |

### 请求参数

#### Path Parameters

| 参数名 | 类型    | 必填 | 描述       |
| ------ | ------- | ---- | ---------- |
| id     | integer | 是   | 设备主键ID |

### 成功响应示例

```json
{
  "code": 0,
  "message": "删除成功",
  "data": null,
  "timestamp": 1708924800000
}
```

### 错误响应信息

| 错误码 | HTTP状态码 | 说明                       |
| ------ | ---------- | -------------------------- |
| 3001   | 404        | 设备不存在                 |
| 3002   | 400        | 设备已被工序引用，无法删除 |

### 认证要求

| 项目     | 说明             |
| -------- | ---------------- |
| 认证方式 | JWT Bearer Token |
| 必需角色 | admin / designer |

---

## 3.6 获取品牌列表

### 接口信息

| 项目         | 内容                    |
| ------------ | ----------------------- |
| **接口名称** | 获取品牌列表            |
| **接口描述** | 获取所有设备品牌选项    |
| **请求方法** | GET                     |
| **完整URL**  | `/api/v1/device/brands` |

### 成功响应示例

```json
{
  "code": 0,
  "message": "成功",
  "data": [
    { "value": "沈机", "label": "沈机" },
    { "value": "大连机床", "label": "大连机床" },
    { "value": "西门子", "label": "西门子" }
  ],
  "timestamp": 1708924800000
}
```

### 认证要求

| 项目     | 说明                          |
| -------- | ----------------------------- |
| 认证方式 | JWT Bearer Token              |
| 必需角色 | admin / supervisor / designer |

---

## 3.7 获取位置列表

### 接口信息

| 项目         | 内容                       |
| ------------ | -------------------------- |
| **接口名称** | 获取位置列表               |
| **接口描述** | 获取所有设备存放位置选项   |
| **请求方法** | GET                        |
| **完整URL**  | `/api/v1/device/locations` |

### 成功响应示例

```json
{
  "code": 0,
  "message": "成功",
  "data": [
    { "value": "A车间-1号位", "label": "A车间-1号位" },
    { "value": "A车间-2号位", "label": "A车间-2号位" },
    { "value": "B车间-1号位", "label": "B车间-1号位" }
  ],
  "timestamp": 1708924800000
}
```

### 认证要求

| 项目     | 说明                          |
| -------- | ----------------------------- |
| 认证方式 | JWT Bearer Token              |
| 必需角色 | admin / supervisor / designer |

---

## 3.8 导出设备数据

### 接口信息

| 项目         | 内容                    |
| ------------ | ----------------------- |
| **接口名称** | 导出设备数据            |
| **接口描述** | 导出设备列表为Excel文件 |
| **请求方法** | GET                     |
| **完整URL**  | `/api/v1/device/export` |

### 请求参数

#### Query Parameters

| 参数名   | 类型   | 必填 | 描述                     |
| -------- | ------ | ---- | ------------------------ |
| ids      | string | 否   | 要导出的设备ID，逗号分隔 |
| brand    | string | 否   | 品牌筛选                 |
| location | string | 否   | 位置筛选                 |

### 响应

**Content-Type**: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

**响应头**:

```
Content-Disposition: attachment; filename=device_export_20260226.xlsx
```

### 认证要求

| 项目     | 说明             |
| -------- | ---------------- |
| 认证方式 | JWT Bearer Token |
| 必需角色 | admin / designer |

### 速率限制

| 项目     | 说明           |
| -------- | -------------- |
| 限制策略 | 10次/分钟/用户 |

---

# 模块四：物料管理模块

---

## 4.1 获取物料列表

### 接口信息

| 项目         | 内容                    |
| ------------ | ----------------------- |
| **接口名称** | 获取物料列表            |
| **接口描述** | 分页查询物料台账列表    |
| **请求方法** | GET                     |
| **完整URL**  | `/api/v1/material/list` |

### 请求参数

#### Query Parameters

| 参数名       | 类型    | 必填 | 描述               | 默认值 |
| ------------ | ------- | ---- | ------------------ | ------ |
| pageNum      | integer | 否   | 页码               | 1      |
| pageSize     | integer | 否   | 每页条数           | 10     |
| materialCode | string  | 否   | 物料编码，模糊查询 | -      |
| materialName | string  | 否   | 物料名称，模糊查询 | -      |
| category     | string  | 否   | 物料分类筛选       | -      |
| status       | string  | 否   | 状态筛选           | -      |

### 响应数据结构

| 字段名                   | 类型    | 描述     |
| ------------------------ | ------- | -------- |
| data.list[].id           | integer | 主键ID   |
| data.list[].materialCode | string  | 物料编码 |
| data.list[].materialName | string  | 物料名称 |
| data.list[].specModel    | string  | 规格型号 |
| data.list[].category     | string  | 物料分类 |
| data.list[].categoryId   | integer | 分类ID   |
| data.list[].unit         | string  | 单位     |
| data.list[].stock        | integer | 库存数量 |
| data.list[].safetyStock  | integer | 安全库存 |
| data.list[].status       | string  | 状态     |
| data.list[].createTime   | string  | 创建时间 |

### 成功响应示例

```json
{
  "code": 0,
  "message": "成功",
  "data": {
    "list": [
      {
        "id": 1,
        "materialCode": "MAT20240001",
        "materialName": "碳钢",
        "specModel": "Q235B-12mm",
        "category": "金属材料",
        "categoryId": 31,
        "unit": "件",
        "stock": 100,
        "safetyStock": 20,
        "status": "正常",
        "createTime": "2024-01-15 10:30:00"
      }
    ],
    "total": 200
  },
  "timestamp": 1708924800000
}
```

### 认证要求

| 项目     | 说明                                |
| -------- | ----------------------------------- |
| 认证方式 | JWT Bearer Token                    |
| 必需角色 | admin / supervisor(只读) / designer |

---

## 4.2 获取物料详情

### 接口信息

| 项目         | 内容                    |
| ------------ | ----------------------- |
| **接口名称** | 获取物料详情            |
| **接口描述** | 根据物料ID获取详细信息  |
| **请求方法** | GET                     |
| **完整URL**  | `/api/v1/material/{id}` |

### 请求参数

#### Path Parameters

| 参数名 | 类型    | 必填 | 描述       |
| ------ | ------- | ---- | ---------- |
| id     | integer | 是   | 物料主键ID |

### 成功响应示例

```json
{
  "code": 0,
  "message": "成功",
  "data": {
    "id": 1,
    "materialCode": "MAT20240001",
    "materialName": "碳钢",
    "specModel": "Q235B-12mm",
    "category": "金属材料",
    "categoryId": 31,
    "unit": "件",
    "stock": 100,
    "safetyStock": 20,
    "status": "正常",
    "supplier": "宝钢集团",
    "price": 50.0,
    "remark": "常用材料",
    "createTime": "2024-01-15 10:30:00",
    "updateTime": "2024-01-15 10:30:00"
  },
  "timestamp": 1708924800000
}
```

### 认证要求

| 项目     | 说明                          |
| -------- | ----------------------------- |
| 认证方式 | JWT Bearer Token              |
| 必需角色 | admin / supervisor / designer |

---

## 4.3 新增物料

### 接口信息

| 项目         | 内容                 |
| ------------ | -------------------- |
| **接口名称** | 新增物料             |
| **接口描述** | 录入新物料信息到台账 |
| **请求方法** | POST                 |
| **完整URL**  | `/api/v1/material`   |

### 请求体

**请求示例**:

```json
{
  "materialName": "碳钢",
  "specModel": "Q235B-12mm",
  "categoryId": 31,
  "unit": "件",
  "stock": 100,
  "safetyStock": 20,
  "supplier": "宝钢集团",
  "price": 50.0,
  "remark": "常用材料"
}
```

### 成功响应示例

```json
{
  "code": 0,
  "message": "新增成功",
  "data": {
    "id": 1,
    "materialCode": "MAT20240001"
  },
  "timestamp": 1708924800000
}
```

### 认证要求

| 项目     | 说明             |
| -------- | ---------------- |
| 认证方式 | JWT Bearer Token |
| 必需角色 | admin / designer |

---

## 4.4 更新物料

### 接口信息

| 项目         | 内容               |
| ------------ | ------------------ |
| **接口名称** | 更新物料           |
| **接口描述** | 更新物料信息       |
| **请求方法** | PUT                |
| **完整URL**  | `/api/v1/material` |

### 请求体

**请求示例**:

```json
{
  "id": 1,
  "materialName": "碳钢-更新",
  "stock": 150,
  "remark": "库存已更新"
}
```

### 成功响应示例

```json
{
  "code": 0,
  "message": "更新成功",
  "data": null,
  "timestamp": 1708924800000
}
```

### 认证要求

| 项目     | 说明             |
| -------- | ---------------- |
| 认证方式 | JWT Bearer Token |
| 必需角色 | admin / designer |

---

## 4.5 删除物料

### 接口信息

| 项目         | 内容                    |
| ------------ | ----------------------- |
| **接口名称** | 删除物料                |
| **接口描述** | 删除物料记录            |
| **请求方法** | DELETE                  |
| **完整URL**  | `/api/v1/material/{id}` |

### 成功响应示例

```json
{
  "code": 0,
  "message": "删除成功",
  "data": null,
  "timestamp": 1708924800000
}
```

### 错误响应信息

| 错误码 | HTTP状态码 | 说明                      |
| ------ | ---------- | ------------------------- |
| 4001   | 404        | 物料不存在                |
| 4002   | 400        | 物料已被BOM引用，无法删除 |

### 认证要求

| 项目     | 说明             |
| -------- | ---------------- |
| 认证方式 | JWT Bearer Token |
| 必需角色 | admin / designer |

---

## 4.6 获取物料分类树

### 接口信息

| 项目         | 内容                             |
| ------------ | -------------------------------- |
| **接口名称** | 获取物料分类树                   |
| **接口描述** | 获取物料分类的树形结构           |
| **请求方法** | GET                              |
| **完整URL**  | `/api/v1/material/category/tree` |

### 成功响应示例

```json
{
  "code": 0,
  "message": "成功",
  "data": [
    {
      "id": 1,
      "label": "电子元器件",
      "children": [
        {
          "id": 11,
          "label": "无源分立元件",
          "children": [
            { "id": 111, "label": "磁性元件" },
            { "id": 112, "label": "电阻" },
            { "id": 113, "label": "电容" }
          ]
        }
      ]
    },
    {
      "id": 2,
      "label": "机械零件",
      "children": [
        { "id": 21, "label": "紧固件" },
        { "id": 22, "label": "传动件" }
      ]
    }
  ],
  "timestamp": 1708924800000
}
```

### 认证要求

| 项目     | 说明                          |
| -------- | ----------------------------- |
| 认证方式 | JWT Bearer Token              |
| 必需角色 | admin / supervisor / designer |

---

## 4.7 新增物料分类

### 接口信息

| 项目         | 内容                        |
| ------------ | --------------------------- |
| **接口名称** | 新增物料分类                |
| **接口描述** | 创建新的物料分类            |
| **请求方法** | POST                        |
| **完整URL**  | `/api/v1/material/category` |

### 请求体

**请求示例**:

```json
{
  "name": "新型材料",
  "parentId": 0,
  "sort": 1,
  "remark": "新类型材料分类"
}
```

### 成功响应示例

```json
{
  "code": 0,
  "message": "新增成功",
  "data": {
    "id": 6
  },
  "timestamp": 1708924800000
}
```

### 认证要求

| 项目     | 说明             |
| -------- | ---------------- |
| 认证方式 | JWT Bearer Token |
| 必需角色 | admin / designer |

---

## 4.8 删除物料分类

### 接口信息

| 项目         | 内容                             |
| ------------ | -------------------------------- |
| **接口名称** | 删除物料分类                     |
| **接口描述** | 删除物料分类                     |
| **请求方法** | DELETE                           |
| **完整URL**  | `/api/v1/material/category/{id}` |

### 错误响应信息

| 错误码 | HTTP状态码 | 说明                       |
| ------ | ---------- | -------------------------- |
| 4011   | 400        | 分类下存在子分类，无法删除 |
| 4012   | 400        | 分类下存在物料，无法删除   |

### 认证要求

| 项目     | 说明             |
| -------- | ---------------- |
| 认证方式 | JWT Bearer Token |
| 必需角色 | admin / designer |

---

# 模块五：工序管理模块

---

## 5.1 获取工序列表

### 接口信息

| 项目         | 内容                   |
| ------------ | ---------------------- |
| **接口名称** | 获取工序列表           |
| **接口描述** | 分页查询工序台账列表   |
| **请求方法** | GET                    |
| **完整URL**  | `/api/v1/process/list` |

### 请求参数

#### Query Parameters

| 参数名      | 类型    | 必填 | 描述               | 默认值 |
| ----------- | ------- | ---- | ------------------ | ------ |
| pageNum     | integer | 否   | 页码               | 1      |
| pageSize    | integer | 否   | 每页条数           | 10     |
| processCode | string  | 否   | 工序编码，模糊查询 | -      |
| processName | string  | 否   | 工序名称，模糊查询 | -      |

### 响应数据结构

| 字段名                     | 类型    | 描述             |
| -------------------------- | ------- | ---------------- |
| data.list[].id             | integer | 主键ID           |
| data.list[].processCode    | string  | 工序编码         |
| data.list[].processName    | string  | 工序名称         |
| data.list[].productionStep | string  | 生产步骤描述     |
| data.list[].deviceCount    | integer | 关联设备数量     |
| data.list[].operatorCount  | integer | 关联操作人员数量 |
| data.list[].materialCount  | integer | 关联物料数量     |
| data.list[].createTime     | string  | 创建时间         |

### 成功响应示例

```json
{
  "code": 0,
  "message": "成功",
  "data": {
    "list": [
      {
        "id": 1,
        "processCode": "PROC20240001",
        "processName": "车削加工",
        "productionStep": "使用数控车床对工件进行外圆车削加工，保证尺寸精度",
        "deviceCount": 2,
        "operatorCount": 3,
        "materialCount": 1,
        "createTime": "2024-01-15 10:30:00"
      }
    ],
    "total": 50
  },
  "timestamp": 1708924800000
}
```

### 认证要求

| 项目     | 说明                          |
| -------- | ----------------------------- |
| 认证方式 | JWT Bearer Token              |
| 必需角色 | admin / supervisor / designer |

---

## 5.2 获取工序详情

### 接口信息

| 项目         | 内容                                               |
| ------------ | -------------------------------------------------- |
| **接口名称** | 获取工序详情                                       |
| **接口描述** | 根据工序ID获取详细信息，包括关联的设备、人员、物料 |
| **请求方法** | GET                                                |
| **完整URL**  | `/api/v1/process/{id}`                             |

### 响应数据结构

| 字段名                        | 类型    | 描述             |
| ----------------------------- | ------- | ---------------- |
| data.id                       | integer | 主键ID           |
| data.processCode              | string  | 工序编码         |
| data.processName              | string  | 工序名称         |
| data.productionStep           | string  | 生产步骤描述     |
| data.devices                  | array   | 关联设备列表     |
| data.devices[].deviceId       | integer | 设备ID           |
| data.devices[].deviceName     | string  | 设备名称         |
| data.devices[].quantity       | integer | 使用数量         |
| data.operators                | array   | 关联操作人员列表 |
| data.operators[].operatorId   | integer | 操作人员ID       |
| data.operators[].operatorName | string  | 操作人员姓名     |
| data.operators[].startTime    | string  | 开始时间         |
| data.operators[].endTime      | string  | 结束时间         |
| data.materials                | array   | 关联物料列表     |
| data.materials[].materialId   | integer | 物料ID           |
| data.materials[].materialName | string  | 物料名称         |
| data.materials[].quantity     | integer | 使用数量         |

### 成功响应示例

```json
{
  "code": 0,
  "message": "成功",
  "data": {
    "id": 1,
    "processCode": "PROC20240001",
    "processName": "车削加工",
    "productionStep": "使用数控车床对工件进行外圆车削加工，保证尺寸精度",
    "devices": [
      {
        "deviceId": 1,
        "deviceName": "数控车床",
        "quantity": 2
      }
    ],
    "operators": [
      {
        "operatorId": 1,
        "operatorName": "张三",
        "startTime": "2024-01-15 08:00:00",
        "endTime": "2024-01-15 12:00:00"
      }
    ],
    "materials": [
      {
        "materialId": 1,
        "materialName": "碳钢",
        "quantity": 10
      }
    ],
    "createTime": "2024-01-15 10:30:00",
    "updateTime": "2024-01-15 10:30:00"
  },
  "timestamp": 1708924800000
}
```

### 认证要求

| 项目     | 说明                          |
| -------- | ----------------------------- |
| 认证方式 | JWT Bearer Token              |
| 必需角色 | admin / supervisor / designer |

---

## 5.3 新增工序

### 接口信息

| 项目         | 内容                                   |
| ------------ | -------------------------------------- |
| **接口名称** | 新增工序                               |
| **接口描述** | 创建新工序，可同时关联设备、人员、物料 |
| **请求方法** | POST                                   |
| **完整URL**  | `/api/v1/process`                      |

### 请求体

**请求示例**:

```json
{
  "processName": "车削加工",
  "productionStep": "使用数控车床对工件进行外圆车削加工，保证尺寸精度",
  "devices": [{ "deviceId": 1, "quantity": 2 }],
  "operators": [
    { "operatorId": 1, "startTime": "2024-01-15 08:00:00", "endTime": "2024-01-15 12:00:00" }
  ],
  "materials": [{ "materialId": 1, "quantity": 10 }]
}
```

### 成功响应示例

```json
{
  "code": 0,
  "message": "新增成功",
  "data": {
    "id": 1,
    "processCode": "PROC20240001"
  },
  "timestamp": 1708924800000
}
```

### 认证要求

| 项目     | 说明             |
| -------- | ---------------- |
| 认证方式 | JWT Bearer Token |
| 必需角色 | admin / designer |

---

## 5.4 更新工序

### 接口信息

| 项目         | 内容                 |
| ------------ | -------------------- |
| **接口名称** | 更新工序             |
| **接口描述** | 更新工序信息及其关联 |
| **请求方法** | PUT                  |
| **完整URL**  | `/api/v1/process`    |

### 请求体

**请求示例**:

```json
{
  "id": 1,
  "processName": "车削加工-更新",
  "productionStep": "更新后的生产步骤描述",
  "devices": [{ "deviceId": 1, "quantity": 3 }],
  "operators": [
    { "operatorId": 1, "startTime": "2024-01-15 08:00:00", "endTime": "2024-01-15 16:00:00" },
    { "operatorId": 2, "startTime": "2024-01-15 08:00:00", "endTime": "2024-01-15 16:00:00" }
  ],
  "materials": [{ "materialId": 1, "quantity": 15 }]
}
```

### 成功响应示例

```json
{
  "code": 0,
  "message": "更新成功",
  "data": null,
  "timestamp": 1708924800000
}
```

### 认证要求

| 项目     | 说明             |
| -------- | ---------------- |
| 认证方式 | JWT Bearer Token |
| 必需角色 | admin / designer |

---

## 5.5 删除工序

### 接口信息

| 项目         | 内容                   |
| ------------ | ---------------------- |
| **接口名称** | 删除工序               |
| **接口描述** | 删除工序记录           |
| **请求方法** | DELETE                 |
| **完整URL**  | `/api/v1/process/{id}` |

### 错误响应信息

| 错误码 | HTTP状态码 | 说明                           |
| ------ | ---------- | ------------------------------ |
| 5001   | 404        | 工序不存在                     |
| 5002   | 400        | 工序已被工艺路线引用，无法删除 |

### 认证要求

| 项目     | 说明             |
| -------- | ---------------- |
| 认证方式 | JWT Bearer Token |
| 必需角色 | admin / designer |

---

## 5.6 添加工序设备关联

### 接口信息

| 项目         | 内容                                 |
| ------------ | ------------------------------------ |
| **接口名称** | 添加工序设备关联                     |
| **接口描述** | 为工序添加关联设备                   |
| **请求方法** | POST                                 |
| **完整URL**  | `/api/v1/process/{processId}/device` |

### 请求体

**请求示例**:

```json
{
  "deviceId": 2,
  "quantity": 1
}
```

### 成功响应示例

```json
{
  "code": 0,
  "message": "添加成功",
  "data": null,
  "timestamp": 1708924800000
}
```

### 认证要求

| 项目     | 说明             |
| -------- | ---------------- |
| 认证方式 | JWT Bearer Token |
| 必需角色 | admin / designer |

---

## 5.7 删除工序设备关联

### 接口信息

| 项目         | 内容                                            |
| ------------ | ----------------------------------------------- |
| **接口名称** | 删除工序设备关联                                |
| **接口描述** | 删除工序与设备的关联                            |
| **请求方法** | DELETE                                          |
| **完整URL**  | `/api/v1/process/{processId}/device/{deviceId}` |

### 认证要求

| 项目     | 说明             |
| -------- | ---------------- |
| 认证方式 | JWT Bearer Token |
| 必需角色 | admin / designer |

---

## 5.8 获取工序选项列表

### 接口信息

| 项目         | 内容                                 |
| ------------ | ------------------------------------ |
| **接口名称** | 获取工序选项列表                     |
| **接口描述** | 获取所有工序的简要信息，用于下拉选择 |
| **请求方法** | GET                                  |
| **完整URL**  | `/api/v1/process/options`            |

### 成功响应示例

```json
{
  "code": 0,
  "message": "成功",
  "data": [
    { "id": 1, "processCode": "PROC20240001", "processName": "车削加工" },
    { "id": 2, "processCode": "PROC20240002", "processName": "铣削加工" },
    { "id": 3, "processCode": "PROC20240003", "processName": "钻孔工序" }
  ],
  "timestamp": 1708924800000
}
```

### 认证要求

| 项目     | 说明                          |
| -------- | ----------------------------- |
| 认证方式 | JWT Bearer Token              |
| 必需角色 | admin / supervisor / designer |

---

# 模块六：工艺路线管理模块

---

## 6.1 获取工艺路线列表

### 接口信息

| 项目         | 内容                         |
| ------------ | ---------------------------- |
| **接口名称** | 获取工艺路线列表             |
| **接口描述** | 分页查询工艺路线列表         |
| **请求方法** | GET                          |
| **完整URL**  | `/api/v1/process-route/list` |

### 请求参数

#### Query Parameters

| 参数名    | 类型    | 必填 | 描述                                | 默认值 |
| --------- | ------- | ---- | ----------------------------------- | ------ |
| pageNum   | integer | 否   | 页码                                | 1      |
| pageSize  | integer | 否   | 每页条数                            | 10     |
| routeCode | string  | 否   | 工艺路线编码，模糊查询              | -      |
| routeName | string  | 否   | 工艺路线名称，模糊查询              | -      |
| status    | string  | 否   | 状态筛选：草稿/待审核/已通过/已驳回 | -      |
| creator   | string  | 否   | 创建人筛选                          | -      |

### 响应数据结构

| 字段名                        | 类型    | 描述                   |
| ----------------------------- | ------- | ---------------------- |
| data.list[].id                | integer | 主键ID                 |
| data.list[].routeCode         | string  | 工艺路线编码           |
| data.list[].routeName         | string  | 工艺路线名称           |
| data.list[].productName       | string  | 产品名称               |
| data.list[].productCode       | string  | 产品编码               |
| data.list[].status            | string  | 状态                   |
| data.list[].estimatedDuration | integer | 预计工艺总时长（分钟） |
| data.list[].creator           | string  | 创建人                 |
| data.list[].createTime        | string  | 创建时间               |
| data.list[].auditor           | string  | 审核人                 |
| data.list[].auditTime         | string  | 审核时间               |
| data.list[].stepCount         | integer | 工序数量               |

### 成功响应示例

```json
{
  "code": 0,
  "message": "成功",
  "data": {
    "list": [
      {
        "id": 1,
        "routeCode": "ROUTE20240001",
        "routeName": "汽车零部件加工工艺",
        "productName": "汽车零部件",
        "productCode": "PROD001",
        "status": "已通过",
        "estimatedDuration": 180,
        "creator": "张三",
        "createTime": "2024-01-15 10:30:00",
        "auditor": "李主管",
        "auditTime": "2024-01-16 14:00:00",
        "stepCount": 5
      }
    ],
    "total": 30
  },
  "timestamp": 1708924800000
}
```

### 认证要求

| 项目     | 说明                          |
| -------- | ----------------------------- |
| 认证方式 | JWT Bearer Token              |
| 必需角色 | admin / supervisor / designer |

---

## 6.2 获取工艺路线详情

### 接口信息

| 项目         | 内容                                         |
| ------------ | -------------------------------------------- |
| **接口名称** | 获取工艺路线详情                             |
| **接口描述** | 根据工艺路线ID获取详细信息，包括所有工序步骤 |
| **请求方法** | GET                                          |
| **完整URL**  | `/api/v1/process-route/{id}`                 |

### 响应数据结构

| 字段名                             | 类型    | 描述                   |
| ---------------------------------- | ------- | ---------------------- |
| data.id                            | integer | 主键ID                 |
| data.routeCode                     | string  | 工艺路线编码           |
| data.routeName                     | string  | 工艺路线名称           |
| data.productName                   | string  | 产品名称               |
| data.productCode                   | string  | 产品编码               |
| data.description                   | string  | 描述                   |
| data.estimatedDuration             | integer | 预计工艺总时长（分钟） |
| data.status                        | string  | 状态                   |
| data.creator                       | string  | 创建人                 |
| data.createTime                    | string  | 创建时间               |
| data.processSteps                  | array   | 工序步骤列表           |
| data.processSteps[].stepOrder      | integer | 工序顺序               |
| data.processSteps[].processId      | integer | 工序ID                 |
| data.processSteps[].processCode    | string  | 工序编码               |
| data.processSteps[].processName    | string  | 工序名称               |
| data.processSteps[].productionStep | string  | 生产步骤描述           |
| data.processSteps[].devices        | array   | 设备列表               |
| data.processSteps[].operators      | array   | 操作人员列表           |
| data.processSteps[].materials      | array   | 物料列表               |

### 成功响应示例

```json
{
  "code": 0,
  "message": "成功",
  "data": {
    "id": 1,
    "routeCode": "ROUTE20240001",
    "routeName": "汽车零部件加工工艺",
    "productName": "汽车零部件",
    "productCode": "PROD001",
    "description": "汽车零部件标准加工工艺流程",
    "estimatedDuration": 180,
    "status": "已通过",
    "creator": "张三",
    "createTime": "2024-01-15 10:30:00",
    "processSteps": [
      {
        "stepOrder": 1,
        "processId": 1,
        "processCode": "PROC20240001",
        "processName": "车削加工",
        "productionStep": "使用数控车床对工件进行外圆车削加工",
        "devices": [{ "deviceId": 1, "deviceName": "数控车床", "quantity": 2 }],
        "operators": [
          {
            "operatorId": 1,
            "operatorName": "张三",
            "startTime": "2024-01-15 08:00:00",
            "endTime": "2024-01-15 12:00:00"
          }
        ],
        "materials": [{ "materialId": 1, "materialName": "碳钢", "quantity": 10 }]
      },
      {
        "stepOrder": 2,
        "processId": 2,
        "processCode": "PROC20240002",
        "processName": "铣削加工",
        "productionStep": "使用加工中心进行平面铣削和型腔加工",
        "devices": [],
        "operators": [],
        "materials": []
      }
    ]
  },
  "timestamp": 1708924800000
}
```

### 认证要求

| 项目     | 说明                          |
| -------- | ----------------------------- |
| 认证方式 | JWT Bearer Token              |
| 必需角色 | admin / supervisor / designer |

---

## 6.3 新增工艺路线

### 接口信息

| 项目         | 内容                         |
| ------------ | ---------------------------- |
| **接口名称** | 新增工艺路线                 |
| **接口描述** | 创建新工艺路线，配置工序步骤 |
| **请求方法** | POST                         |
| **完整URL**  | `/api/v1/process-route`      |

### 请求体

**请求示例**:

```json
{
  "routeName": "汽车零部件加工工艺",
  "productName": "汽车零部件",
  "productCode": "PROD001",
  "description": "汽车零部件标准加工工艺流程",
  "estimatedDuration": 180,
  "processSteps": [
    {
      "stepOrder": 1,
      "processId": 1,
      "devices": [{ "deviceId": 1, "quantity": 2 }],
      "operators": [
        { "operatorId": 1, "startTime": "2024-01-15 08:00:00", "endTime": "2024-01-15 12:00:00" }
      ],
      "materials": [{ "materialId": 1, "quantity": 10 }]
    },
    {
      "stepOrder": 2,
      "processId": 2,
      "devices": [],
      "operators": [],
      "materials": []
    }
  ]
}
```

### 成功响应示例

```json
{
  "code": 0,
  "message": "新增成功",
  "data": {
    "id": 1,
    "routeCode": "ROUTE20240001"
  },
  "timestamp": 1708924800000
}
```

### 认证要求

| 项目     | 说明             |
| -------- | ---------------- |
| 认证方式 | JWT Bearer Token |
| 必需角色 | designer         |

---

## 6.4 更新工艺路线

### 接口信息

| 项目         | 内容                       |
| ------------ | -------------------------- |
| **接口名称** | 更新工艺路线               |
| **接口描述** | 更新工艺路线信息及工序配置 |
| **请求方法** | PUT                        |
| **完整URL**  | `/api/v1/process-route`    |

### 请求体

**请求示例**:

```json
{
  "id": 1,
  "routeName": "汽车零部件加工工艺-更新",
  "description": "更新后的工艺描述",
  "processSteps": [
    {
      "stepOrder": 1,
      "processId": 1,
      "devices": [{ "deviceId": 1, "quantity": 3 }],
      "operators": [],
      "materials": []
    }
  ]
}
```

### 错误响应信息

| 错误码 | HTTP状态码 | 说明                         |
| ------ | ---------- | ---------------------------- |
| 6011   | 400        | 工艺路线已提交审核，无法修改 |
| 6012   | 400        | 工艺路线已通过审核，无法修改 |

### 认证要求

| 项目     | 说明             |
| -------- | ---------------- |
| 认证方式 | JWT Bearer Token |
| 必需角色 | designer         |

### 特殊说明

| 项目     | 说明                           |
| -------- | ------------------------------ |
| 状态限制 | 只有草稿状态的工艺路线可以修改 |

---

## 6.5 删除工艺路线

### 接口信息

| 项目         | 内容                         |
| ------------ | ---------------------------- |
| **接口名称** | 删除工艺路线                 |
| **接口描述** | 删除工艺路线记录             |
| **请求方法** | DELETE                       |
| **完整URL**  | `/api/v1/process-route/{id}` |

### 错误响应信息

| 错误码 | HTTP状态码 | 说明                         |
| ------ | ---------- | ---------------------------- |
| 6001   | 404        | 工艺路线不存在               |
| 6013   | 400        | 工艺路线已通过审核，无法删除 |

### 认证要求

| 项目     | 说明             |
| -------- | ---------------- |
| 认证方式 | JWT Bearer Token |
| 必需角色 | admin / designer |

### 特殊说明

| 项目     | 说明                                   |
| -------- | -------------------------------------- |
| 状态限制 | 只有草稿和已驳回状态的工艺路线可以删除 |

---

## 6.6 提交审核

### 接口信息

| 项目         | 内容                                |
| ------------ | ----------------------------------- |
| **接口名称** | 提交审核                            |
| **接口描述** | 将工艺路线提交给主管审核            |
| **请求方法** | POST                                |
| **完整URL**  | `/api/v1/process-route/{id}/submit` |

### 请求参数

#### Path Parameters

| 参数名 | 类型    | 必填 | 描述       |
| ------ | ------- | ---- | ---------- |
| id     | integer | 是   | 工艺路线ID |

### 成功响应示例

```json
{
  "code": 0,
  "message": "提交成功，等待审核",
  "data": {
    "status": "待审核"
  },
  "timestamp": 1708924800000
}
```

### 错误响应信息

| 错误码 | HTTP状态码 | 说明                   |
| ------ | ---------- | ---------------------- |
| 6021   | 400        | 工艺路线状态不允许提交 |
| 6022   | 400        | 工艺路线缺少工序步骤   |

### 认证要求

| 项目     | 说明             |
| -------- | ---------------- |
| 认证方式 | JWT Bearer Token |
| 必需角色 | designer         |

### 特殊说明

| 项目     | 说明                             |
| -------- | -------------------------------- |
| 前置条件 | 工艺路线必须至少包含一个工序步骤 |
| 通知     | 提交后会自动通知主管             |

---

## 6.7 更新工序顺序

### 接口信息

| 项目         | 内容                                     |
| ------------ | ---------------------------------------- |
| **接口名称** | 更新工序顺序                             |
| **接口描述** | 调整工艺路线中工序的排列顺序             |
| **请求方法** | PUT                                      |
| **完整URL**  | `/api/v1/process-route/{id}/steps-order` |

### 请求体

**请求示例**:

```json
{
  "steps": [
    { "stepOrder": 1, "processId": 2 },
    { "stepOrder": 2, "processId": 1 },
    { "stepOrder": 3, "processId": 3 }
  ]
}
```

### 成功响应示例

```json
{
  "code": 0,
  "message": "顺序更新成功",
  "data": null,
  "timestamp": 1708924800000
}
```

### 认证要求

| 项目     | 说明             |
| -------- | ---------------- |
| 认证方式 | JWT Bearer Token |
| 必需角色 | designer         |

---

# 模块七：审核管理模块

---

## 7.1 获取待审核列表

### 接口信息

| 项目         | 内容                         |
| ------------ | ---------------------------- |
| **接口名称** | 获取待审核列表               |
| **接口描述** | 获取等待审核的工艺路线列表   |
| **请求方法** | GET                          |
| **完整URL**  | `/api/v1/audit/pending/list` |

### 请求参数

#### Query Parameters

| 参数名    | 类型    | 必填 | 描述                   | 默认值 |
| --------- | ------- | ---- | ---------------------- | ------ |
| pageNum   | integer | 否   | 页码                   | 1      |
| pageSize  | integer | 否   | 每页条数               | 10     |
| routeName | string  | 否   | 工艺路线名称，模糊查询 | -      |
| creator   | string  | 否   | 提交人筛选             | -      |

### 响应数据结构

| 字段名                  | 类型    | 描述         |
| ----------------------- | ------- | ------------ |
| data.list[].id          | integer | 审核记录ID   |
| data.list[].routeId     | integer | 工艺路线ID   |
| data.list[].routeCode   | string  | 工艺路线编码 |
| data.list[].routeName   | string  | 工艺路线名称 |
| data.list[].productName | string  | 产品名称     |
| data.list[].creator     | string  | 提交人       |
| data.list[].submitTime  | string  | 提交时间     |
| data.list[].priority    | string  | 优先级       |
| data.list[].stepCount   | integer | 工序数量     |

### 成功响应示例

```json
{
  "code": 0,
  "message": "成功",
  "data": {
    "list": [
      {
        "id": 1,
        "routeId": 5,
        "routeCode": "ROUTE20240005",
        "routeName": "电子设备加工工艺",
        "productName": "电子设备",
        "creator": "王设计师",
        "submitTime": "2024-01-15 10:30:00",
        "priority": "普通",
        "stepCount": 4
      }
    ],
    "total": 5
  },
  "timestamp": 1708924800000
}
```

### 认证要求

| 项目     | 说明             |
| -------- | ---------------- |
| 认证方式 | JWT Bearer Token |
| 必需角色 | supervisor       |

---

## 7.2 获取审核记录列表

### 接口信息

| 项目         | 内容                        |
| ------------ | --------------------------- |
| **接口名称** | 获取审核记录列表            |
| **接口描述** | 获取已审核的工艺路线记录    |
| **请求方法** | GET                         |
| **完整URL**  | `/api/v1/audit/record/list` |

### 请求参数

#### Query Parameters

| 参数名      | 类型    | 必填 | 描述                    | 默认值 |
| ----------- | ------- | ---- | ----------------------- | ------ |
| pageNum     | integer | 否   | 页码                    | 1      |
| pageSize    | integer | 否   | 每页条数                | 10     |
| routeName   | string  | 否   | 工艺路线名称            | -      |
| auditStatus | string  | 否   | 审核结果：已通过/已驳回 | -      |
| startTime   | string  | 否   | 审核开始时间            | -      |
| endTime     | string  | 否   | 审核结束时间            | -      |

### 响应数据结构

| 字段名                   | 类型    | 描述         |
| ------------------------ | ------- | ------------ |
| data.list[].id           | integer | 审核记录ID   |
| data.list[].routeId      | integer | 工艺路线ID   |
| data.list[].routeCode    | string  | 工艺路线编码 |
| data.list[].routeName    | string  | 工艺路线名称 |
| data.list[].creator      | string  | 提交人       |
| data.list[].submitTime   | string  | 提交时间     |
| data.list[].auditor      | string  | 审核人       |
| data.list[].auditTime    | string  | 审核时间     |
| data.list[].auditStatus  | string  | 审核结果     |
| data.list[].auditComment | string  | 审核意见     |

### 成功响应示例

```json
{
  "code": 0,
  "message": "成功",
  "data": {
    "list": [
      {
        "id": 1,
        "routeId": 1,
        "routeCode": "ROUTE20240001",
        "routeName": "汽车零部件加工工艺",
        "creator": "张三",
        "submitTime": "2024-01-15 10:30:00",
        "auditor": "李主管",
        "auditTime": "2024-01-16 14:00:00",
        "auditStatus": "已通过",
        "auditComment": "工艺路线配置合理，予以通过"
      }
    ],
    "total": 20
  },
  "timestamp": 1708924800000
}
```

### 认证要求

| 项目     | 说明             |
| -------- | ---------------- |
| 认证方式 | JWT Bearer Token |
| 必需角色 | supervisor       |

---

## 7.3 获取审核详情

### 接口信息

| 项目         | 内容                                         |
| ------------ | -------------------------------------------- |
| **接口名称** | 获取审核详情                                 |
| **接口描述** | 获取审核记录的详细信息，包括工艺路线完整内容 |
| **请求方法** | GET                                          |
| **完整URL**  | `/api/v1/audit/{id}`                         |

### 响应数据结构

返回工艺路线完整详情，参见 6.2 获取工艺路线详情。

### 认证要求

| 项目     | 说明             |
| -------- | ---------------- |
| 认证方式 | JWT Bearer Token |
| 必需角色 | supervisor       |

---

## 7.4 通过审核

### 接口信息

| 项目         | 内容                         |
| ------------ | ---------------------------- |
| **接口名称** | 通过审核                     |
| **接口描述** | 审批通过工艺路线             |
| **请求方法** | PUT                          |
| **完整URL**  | `/api/v1/audit/{id}/approve` |

### 请求参数

#### Path Parameters

| 参数名 | 类型    | 必填 | 描述       |
| ------ | ------- | ---- | ---------- |
| id     | integer | 是   | 审核记录ID |

### 请求体

**请求示例**:

```json
{
  "comment": "工艺路线配置合理，予以通过"
}
```

### 成功响应示例

```json
{
  "code": 0,
  "message": "审核通过",
  "data": {
    "status": "已通过",
    "auditTime": "2024-01-16 14:30:00"
  },
  "timestamp": 1708924800000
}
```

### 错误响应信息

| 错误码 | HTTP状态码 | 说明               |
| ------ | ---------- | ------------------ |
| 7001   | 404        | 审核记录不存在     |
| 7011   | 400        | 该工艺路线已被审核 |

### 认证要求

| 项目     | 说明             |
| -------- | ---------------- |
| 认证方式 | JWT Bearer Token |
| 必需角色 | supervisor       |

### 特殊说明

| 项目 | 说明                       |
| ---- | -------------------------- |
| 通知 | 审核通过后会自动通知提交人 |

---

## 7.5 驳回审核

### 接口信息

| 项目         | 内容                        |
| ------------ | --------------------------- |
| **接口名称** | 驳回审核                    |
| **接口描述** | 驳回工艺路线审核            |
| **请求方法** | PUT                         |
| **完整URL**  | `/api/v1/audit/{id}/reject` |

### 请求参数

#### Path Parameters

| 参数名 | 类型    | 必填 | 描述       |
| ------ | ------- | ---- | ---------- |
| id     | integer | 是   | 审核记录ID |

### 请求体

**请求示例**:

```json
{
  "reason": "工序配置不合理，第3道工序缺少必要的检测设备，请补充完善后重新提交"
}
```

### 成功响应示例

```json
{
  "code": 0,
  "message": "已驳回",
  "data": {
    "status": "已驳回",
    "auditTime": "2024-01-16 14:30:00"
  },
  "timestamp": 1708924800000
}
```

### 认证要求

| 项目     | 说明             |
| -------- | ---------------- |
| 认证方式 | JWT Bearer Token |
| 必需角色 | supervisor       |

### 特殊说明

| 项目 | 说明                   |
| ---- | ---------------------- |
| 必填 | 驳回原因必填           |
| 通知 | 驳回后会自动通知提交人 |

---

## 7.6 批量审核

### 接口信息

| 项目         | 内容                       |
| ------------ | -------------------------- |
| **接口名称** | 批量审核                   |
| **接口描述** | 批量通过或驳回多条审核记录 |
| **请求方法** | PUT                        |
| **完整URL**  | `/api/v1/audit/batch`      |

### 请求体

**请求示例**:

```json
{
  "ids": [1, 2, 3],
  "action": "approve",
  "comment": "批量审核通过"
}
```

### 成功响应示例

```json
{
  "code": 0,
  "message": "批量审核成功",
  "data": {
    "successCount": 3,
    "failCount": 0
  },
  "timestamp": 1708924800000
}
```

### 认证要求

| 项目     | 说明             |
| -------- | ---------------- |
| 认证方式 | JWT Bearer Token |
| 必需角色 | supervisor       |

---

# 模块八：BOM管理模块

---

## 8.1 获取BOM列表

### 接口信息

| 项目         | 内容                |
| ------------ | ------------------- |
| **接口名称** | 获取BOM列表         |
| **接口描述** | 分页查询BOM清单列表 |
| **请求方法** | GET                 |
| **完整URL**  | `/api/v1/bom/list`  |

### 请求参数

#### Query Parameters

| 参数名          | 类型    | 必填 | 描述              | 默认值 |
| --------------- | ------- | ---- | ----------------- | ------ |
| pageNum         | integer | 否   | 页码              | 1      |
| pageSize        | integer | 否   | 每页条数          | 10     |
| bomCode         | string  | 否   | BOM编码，模糊查询 | -      |
| bomName         | string  | 否   | BOM名称，模糊查询 | -      |
| version         | string  | 否   | 版本号筛选        | -      |
| showAllVersions | boolean | 否   | 是否显示所有版本  | false  |

### 响应数据结构

| 字段名                         | 类型    | 描述         |
| ------------------------------ | ------- | ------------ |
| data.list[].id                 | integer | 主键ID       |
| data.list[].bomCode            | string  | BOM编码      |
| data.list[].bomName            | string  | BOM名称      |
| data.list[].version            | string  | 版本号       |
| data.list[].isCurrent          | boolean | 是否当前版本 |
| data.list[].parentMaterial     | string  | 父物料名称   |
| data.list[].parentMaterialCode | string  | 父物料编码   |
| data.list[].childMaterialCount | integer | 子物料数量   |
| data.list[].baseId             | string  | BOM基础ID    |
| data.list[].versionCount       | integer | 版本数量     |
| data.list[].createTime         | string  | 创建时间     |

### 成功响应示例

```json
{
  "code": 0,
  "message": "成功",
  "data": {
    "list": [
      {
        "id": 1,
        "bomCode": "BOM20240001",
        "bomName": "汽车零部件BOM",
        "version": "V1.0",
        "isCurrent": false,
        "parentMaterial": "汽车零部件",
        "parentMaterialCode": "MAT20240501",
        "childMaterialCount": 2,
        "baseId": "BOM001",
        "versionCount": 2,
        "createTime": "2024-01-15 10:30:00"
      },
      {
        "id": 2,
        "bomCode": "BOM20240001",
        "bomName": "汽车零部件BOM",
        "version": "V2.0",
        "isCurrent": true,
        "parentMaterial": "汽车零部件",
        "parentMaterialCode": "MAT20240501",
        "childMaterialCount": 3,
        "baseId": "BOM001",
        "versionCount": 2,
        "createTime": "2024-01-20 14:00:00"
      }
    ],
    "total": 10
  },
  "timestamp": 1708924800000
}
```

### 认证要求

| 项目     | 说明                          |
| -------- | ----------------------------- |
| 认证方式 | JWT Bearer Token              |
| 必需角色 | admin / supervisor / designer |

---

## 8.2 获取BOM详情

### 接口信息

| 项目         | 内容                                   |
| ------------ | -------------------------------------- |
| **接口名称** | 获取BOM详情                            |
| **接口描述** | 根据BOM ID获取详细信息，包括所有子物料 |
| **请求方法** | GET                                    |
| **完整URL**  | `/api/v1/bom/{id}`                     |

### 响应数据结构

| 字段名                             | 类型    | 描述         |
| ---------------------------------- | ------- | ------------ |
| data.id                            | integer | 主键ID       |
| data.bomCode                       | string  | BOM编码      |
| data.bomName                       | string  | BOM名称      |
| data.version                       | string  | 版本号       |
| data.isCurrent                     | boolean | 是否当前版本 |
| data.parentMaterial                | string  | 父物料名称   |
| data.parentMaterialCode            | string  | 父物料编码   |
| data.parentMaterialSpec            | string  | 父物料规格   |
| data.childMaterials                | array   | 子物料列表   |
| data.childMaterials[].id           | integer | 子物料记录ID |
| data.childMaterials[].materialId   | integer | 物料ID       |
| data.childMaterials[].materialCode | string  | 物料编码     |
| data.childMaterials[].materialName | string  | 物料名称     |
| data.childMaterials[].specModel    | string  | 规格型号     |
| data.childMaterials[].quantity     | integer | 数量         |
| data.childMaterials[].unit         | string  | 单位         |
| data.createTime                    | string  | 创建时间     |

### 成功响应示例

```json
{
  "code": 0,
  "message": "成功",
  "data": {
    "id": 2,
    "bomCode": "BOM20240001",
    "bomName": "汽车零部件BOM",
    "version": "V2.0",
    "isCurrent": true,
    "parentMaterial": "汽车零部件",
    "parentMaterialCode": "MAT20240501",
    "parentMaterialSpec": "成品-汽车零部件",
    "childMaterials": [
      {
        "id": 1,
        "materialId": 2,
        "materialCode": "MAT20240002",
        "materialName": "铝合金板",
        "specModel": "6061-T6-5mm",
        "quantity": 6,
        "unit": "件"
      },
      {
        "id": 2,
        "materialId": 3,
        "materialCode": "MAT20240003",
        "materialName": "黄铜",
        "specModel": "H62-Φ30",
        "quantity": 12,
        "unit": "根"
      }
    ],
    "createTime": "2024-01-20 14:00:00"
  },
  "timestamp": 1708924800000
}
```

### 认证要求

| 项目     | 说明                          |
| -------- | ----------------------------- |
| 认证方式 | JWT Bearer Token              |
| 必需角色 | admin / supervisor / designer |

---

## 8.3 新增BOM

### 接口信息

| 项目         | 内容            |
| ------------ | --------------- |
| **接口名称** | 新增BOM         |
| **接口描述** | 创建新的BOM清单 |
| **请求方法** | POST            |
| **完整URL**  | `/api/v1/bom`   |

### 请求体

**请求示例**:

```json
{
  "bomName": "汽车零部件BOM",
  "parentMaterial": "汽车零部件",
  "parentMaterialCode": "MAT20240501",
  "parentMaterialSpec": "成品-汽车零部件",
  "childMaterials": [
    {
      "materialId": 2,
      "materialCode": "MAT20240002",
      "materialName": "铝合金板",
      "specModel": "6061-T6-5mm",
      "quantity": 6,
      "unit": "件"
    },
    {
      "materialId": 3,
      "materialCode": "MAT20240003",
      "materialName": "黄铜",
      "specModel": "H62-Φ30",
      "quantity": 12,
      "unit": "根"
    }
  ]
}
```

### 成功响应示例

```json
{
  "code": 0,
  "message": "新增成功",
  "data": {
    "id": 1,
    "bomCode": "BOM20240001",
    "version": "V1.0"
  },
  "timestamp": 1708924800000
}
```

### 认证要求

| 项目     | 说明             |
| -------- | ---------------- |
| 认证方式 | JWT Bearer Token |
| 必需角色 | designer         |

---

## 8.4 更新BOM

### 接口信息

| 项目         | 内容          |
| ------------ | ------------- |
| **接口名称** | 更新BOM       |
| **接口描述** | 更新BOM信息   |
| **请求方法** | PUT           |
| **完整URL**  | `/api/v1/bom` |

### 请求体

**请求示例**:

```json
{
  "id": 1,
  "bomName": "汽车零部件BOM-更新",
  "childMaterials": [
    {
      "materialId": 2,
      "quantity": 8
    }
  ]
}
```

### 成功响应示例

```json
{
  "code": 0,
  "message": "更新成功",
  "data": null,
  "timestamp": 1708924800000
}
```

### 认证要求

| 项目     | 说明             |
| -------- | ---------------- |
| 认证方式 | JWT Bearer Token |
| 必需角色 | designer         |

---

## 8.5 删除BOM

### 接口信息

| 项目         | 内容               |
| ------------ | ------------------ |
| **接口名称** | 删除BOM            |
| **接口描述** | 删除BOM记录        |
| **请求方法** | DELETE             |
| **完整URL**  | `/api/v1/bom/{id}` |

### 认证要求

| 项目     | 说明             |
| -------- | ---------------- |
| 认证方式 | JWT Bearer Token |
| 必需角色 | admin / designer |

---

## 8.6 获取BOM版本历史

### 接口信息

| 项目         | 内容                        |
| ------------ | --------------------------- |
| **接口名称** | 获取BOM版本历史             |
| **接口描述** | 获取指定BOM的所有历史版本   |
| **请求方法** | GET                         |
| **完整URL**  | `/api/v1/bom/{id}/versions` |

### 成功响应示例

```json
{
  "code": 0,
  "message": "成功",
  "data": [
    {
      "id": 1,
      "version": "V1.0",
      "isCurrent": false,
      "createTime": "2024-01-15 10:30:00",
      "creator": "张三"
    },
    {
      "id": 2,
      "version": "V2.0",
      "isCurrent": true,
      "createTime": "2024-01-20 14:00:00",
      "creator": "张三"
    }
  ],
  "timestamp": 1708924800000
}
```

### 认证要求

| 项目     | 说明                          |
| -------- | ----------------------------- |
| 认证方式 | JWT Bearer Token              |
| 必需角色 | admin / supervisor / designer |

---

## 8.7 创建新版本

### 接口信息

| 项目         | 内容                           |
| ------------ | ------------------------------ |
| **接口名称** | 创建新版本                     |
| **接口描述** | 基于现有BOM创建新版本          |
| **请求方法** | POST                           |
| **完整URL**  | `/api/v1/bom/{id}/new-version` |

### 请求体

**请求示例**:

```json
{
  "childMaterials": [
    {
      "materialId": 2,
      "quantity": 10
    }
  ]
}
```

### 成功响应示例

```json
{
  "code": 0,
  "message": "新版本创建成功",
  "data": {
    "id": 3,
    "version": "V3.0"
  },
  "timestamp": 1708924800000
}
```

### 认证要求

| 项目     | 说明             |
| -------- | ---------------- |
| 认证方式 | JWT Bearer Token |
| 必需角色 | designer         |

---

## 8.8 导出BOM

### 接口信息

| 项目         | 内容                   |
| ------------ | ---------------------- |
| **接口名称** | 导出BOM                |
| **接口描述** | 导出BOM数据为Excel文件 |
| **请求方法** | GET                    |
| **完整URL**  | `/api/v1/bom/export`   |

### 请求参数

#### Query Parameters

| 参数名 | 类型   | 必填 | 描述                     |
| ------ | ------ | ---- | ------------------------ |
| ids    | string | 否   | 要导出的BOM ID，逗号分隔 |

### 响应

**Content-Type**: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

### 认证要求

| 项目     | 说明                          |
| -------- | ----------------------------- |
| 认证方式 | JWT Bearer Token              |
| 必需角色 | admin / supervisor / designer |

---

# 模块九：消息通知模块

---

## 9.1 获取消息列表

### 接口信息

| 项目         | 内容                   |
| ------------ | ---------------------- |
| **接口名称** | 获取消息列表           |
| **接口描述** | 分页查询消息通知列表   |
| **请求方法** | GET                    |
| **完整URL**  | `/api/v1/message/list` |

### 请求参数

#### Query Parameters

| 参数名   | 类型    | 必填 | 描述                      | 默认值 |
| -------- | ------- | ---- | ------------------------- | ------ |
| pageNum  | integer | 否   | 页码                      | 1      |
| pageSize | integer | 否   | 每页条数                  | 10     |
| type     | string  | 否   | 消息类型：all/unread/read | all    |

### 响应数据结构

| 字段名                  | 类型    | 描述           |
| ----------------------- | ------- | -------------- |
| data.list[].id          | integer | 消息ID         |
| data.list[].title       | string  | 消息标题       |
| data.list[].summary     | string  | 消息摘要       |
| data.list[].type        | string  | 消息类型       |
| data.list[].auditStatus | string  | 审核状态       |
| data.list[].isRead      | boolean | 是否已读       |
| data.list[].sendTime    | string  | 发送时间       |
| data.list[].routeId     | integer | 关联工艺路线ID |

### 成功响应示例

```json
{
  "code": 0,
  "message": "成功",
  "data": {
    "list": [
      {
        "id": 1,
        "title": "工艺路线审核通过通知",
        "summary": "您提交的工艺路线"汽车零部件加工工艺"已审核通过",
        "type": "audit",
        "auditStatus": "已通过",
        "isRead": false,
        "sendTime": "2024-01-16 14:30:00",
        "routeId": 1
      }
    ],
    "total": 10
  },
  "timestamp": 1708924800000
}
```

### 认证要求

| 项目     | 说明             |
| -------- | ---------------- |
| 认证方式 | JWT Bearer Token |
| 必需角色 | designer         |

---

## 9.2 获取消息详情

### 接口信息

| 项目         | 内容                   |
| ------------ | ---------------------- |
| **接口名称** | 获取消息详情           |
| **接口描述** | 获取消息详细内容       |
| **请求方法** | GET                    |
| **完整URL**  | `/api/v1/message/{id}` |

### 成功响应示例

```json
{
  "code": 0,
  "message": "成功",
  "data": {
    "id": 1,
    "title": "工艺路线审核通过通知",
    "content": "您提交的工艺路线"汽车零部件加工工艺"已于2024-01-16 14:30审核通过，审核人：李主管，审核意见：工艺路线配置合理，予以通过。",
    "type": "audit",
    "auditStatus": "已通过",
    "isRead": true,
    "sendTime": "2024-01-16 14:30:00",
    "routeId": 1
  },
  "timestamp": 1708924800000
}
```

### 认证要求

| 项目     | 说明             |
| -------- | ---------------- |
| 认证方式 | JWT Bearer Token |
| 必需角色 | designer         |

---

## 9.3 标记消息已读

### 接口信息

| 项目         | 内容                        |
| ------------ | --------------------------- |
| **接口名称** | 标记消息已读                |
| **接口描述** | 将指定消息标记为已读        |
| **请求方法** | PUT                         |
| **完整URL**  | `/api/v1/message/{id}/read` |

### 成功响应示例

```json
{
  "code": 0,
  "message": "已标记为已读",
  "data": null,
  "timestamp": 1708924800000
}
```

### 认证要求

| 项目     | 说明             |
| -------- | ---------------- |
| 认证方式 | JWT Bearer Token |
| 必需角色 | designer         |

---

## 9.4 全部标记已读

### 接口信息

| 项目         | 内容                       |
| ------------ | -------------------------- |
| **接口名称** | 全部标记已读               |
| **接口描述** | 将所有未读消息标记为已读   |
| **请求方法** | PUT                        |
| **完整URL**  | `/api/v1/message/read-all` |

### 成功响应示例

```json
{
  "code": 0,
  "message": "已将所有消息标记为已读",
  "data": {
    "updatedCount": 5
  },
  "timestamp": 1708924800000
}
```

### 认证要求

| 项目     | 说明             |
| -------- | ---------------- |
| 认证方式 | JWT Bearer Token |
| 必需角色 | designer         |

---

## 9.5 删除消息

### 接口信息

| 项目         | 内容                   |
| ------------ | ---------------------- |
| **接口名称** | 删除消息               |
| **接口描述** | 删除指定消息           |
| **请求方法** | DELETE                 |
| **完整URL**  | `/api/v1/message/{id}` |

### 认证要求

| 项目     | 说明             |
| -------- | ---------------- |
| 认证方式 | JWT Bearer Token |
| 必需角色 | designer         |

---

## 9.6 获取未读消息数量

### 接口信息

| 项目         | 内容                           |
| ------------ | ------------------------------ |
| **接口名称** | 获取未读消息数量               |
| **接口描述** | 获取当前用户的未读消息数量     |
| **请求方法** | GET                            |
| **完整URL**  | `/api/v1/message/unread-count` |

### 成功响应示例

```json
{
  "code": 0,
  "message": "成功",
  "data": {
    "unreadCount": 5
  },
  "timestamp": 1708924800000
}
```

### 认证要求

| 项目     | 说明             |
| -------- | ---------------- |
| 认证方式 | JWT Bearer Token |
| 必需角色 | designer         |

---

# 模块十：日志管理模块

---

## 10.1 获取登录日志列表

### 接口信息

| 项目         | 内容                     |
| ------------ | ------------------------ |
| **接口名称** | 获取登录日志列表         |
| **接口描述** | 分页查询登录日志         |
| **请求方法** | GET                      |
| **完整URL**  | `/api/v1/login-log/list` |

### 请求参数

#### Query Parameters

| 参数名      | 类型    | 必填 | 描述                |
| ----------- | ------- | ---- | ------------------- |
| pageNum     | integer | 否   | 页码                |
| pageSize    | integer | 否   | 每页条数            |
| userId      | string  | 否   | 用户ID              |
| userName    | string  | 否   | 用户名              |
| loginStatus | string  | 否   | 登录状态：成功/失败 |
| startTime   | string  | 否   | 开始时间            |
| endTime     | string  | 否   | 结束时间            |

### 响应数据结构

| 字段名                    | 类型    | 描述     |
| ------------------------- | ------- | -------- |
| data.list[].id            | integer | 日志ID   |
| data.list[].userId        | string  | 用户ID   |
| data.list[].userName      | string  | 用户名   |
| data.list[].loginTime     | string  | 登录时间 |
| data.list[].loginIp       | string  | 登录IP   |
| data.list[].loginLocation | string  | 登录地点 |
| data.list[].loginStatus   | string  | 登录状态 |
| data.list[].loginMessage  | string  | 登录消息 |
| data.list[].browser       | string  | 浏览器   |
| data.list[].os            | string  | 操作系统 |

### 成功响应示例

```json
{
  "code": 0,
  "message": "成功",
  "data": {
    "list": [
      {
        "id": 1,
        "userId": "U001",
        "userName": "张三",
        "loginTime": "2024-01-15 08:30:25",
        "loginIp": "192.168.1.100",
        "loginLocation": "北京市朝阳区",
        "loginStatus": "成功",
        "loginMessage": "登录成功",
        "browser": "Chrome 120.0",
        "os": "Windows 10"
      }
    ],
    "total": 500
  },
  "timestamp": 1708924800000
}
```

### 认证要求

| 项目     | 说明             |
| -------- | ---------------- |
| 认证方式 | JWT Bearer Token |
| 必需角色 | admin            |

---

## 10.2 导出登录日志

### 接口信息

| 项目         | 内容                       |
| ------------ | -------------------------- |
| **接口名称** | 导出登录日志               |
| **接口描述** | 导出登录日志为Excel文件    |
| **请求方法** | GET                        |
| **完整URL**  | `/api/v1/login-log/export` |

### 认证要求

| 项目     | 说明             |
| -------- | ---------------- |
| 认证方式 | JWT Bearer Token |
| 必需角色 | admin            |

---

## 10.3 获取操作日志列表

### 接口信息

| 项目         | 内容                         |
| ------------ | ---------------------------- |
| **接口名称** | 获取操作日志列表             |
| **接口描述** | 分页查询操作日志             |
| **请求方法** | GET                          |
| **完整URL**  | `/api/v1/operation-log/list` |

### 请求参数

#### Query Parameters

| 参数名        | 类型    | 必填 | 描述                               |
| ------------- | ------- | ---- | ---------------------------------- |
| pageNum       | integer | 否   | 页码                               |
| pageSize      | integer | 否   | 每页条数                           |
| operator      | string  | 否   | 操作人                             |
| module        | string  | 否   | 操作模块                           |
| operationType | string  | 否   | 操作类型：新增/修改/删除/查询/导出 |
| startTime     | string  | 否   | 开始时间                           |
| endTime       | string  | 否   | 结束时间                           |

### 响应数据结构

| 字段名                     | 类型    | 描述     |
| -------------------------- | ------- | -------- |
| data.list[].id             | integer | 日志ID   |
| data.list[].operator       | string  | 操作人   |
| data.list[].module         | string  | 操作模块 |
| data.list[].operationType  | string  | 操作类型 |
| data.list[].operationDesc  | string  | 操作描述 |
| data.list[].requestMethod  | string  | 请求方法 |
| data.list[].requestUrl     | string  | 请求URL  |
| data.list[].requestParams  | string  | 请求参数 |
| data.list[].responseResult | string  | 响应结果 |
| data.list[].operationTime  | string  | 操作时间 |
| data.list[].operationIp    | string  | 操作IP   |
| data.list[].executionTime  | integer | 执行耗时 |

### 成功响应示例

```json
{
  "code": 0,
  "message": "成功",
  "data": {
    "list": [
      {
        "id": 1,
        "operator": "张三",
        "module": "设备管理",
        "operationType": "新增",
        "operationDesc": "新增设备：数控车床",
        "requestMethod": "POST",
        "requestUrl": "/api/v1/device",
        "requestParams": "{\"deviceName\":\"数控车床\"}",
        "responseResult": "{\"code\":0,\"message\":\"新增成功\"}",
        "operationTime": "2024-01-15 10:30:00",
        "operationIp": "192.168.1.100",
        "executionTime": 125
      }
    ],
    "total": 1000
  },
  "timestamp": 1708924800000
}
```

### 认证要求

| 项目     | 说明                          |
| -------- | ----------------------------- |
| 认证方式 | JWT Bearer Token              |
| 必需角色 | admin / supervisor / designer |

---

## 10.4 导出操作日志

### 接口信息

| 项目         | 内容                           |
| ------------ | ------------------------------ |
| **接口名称** | 导出操作日志                   |
| **接口描述** | 导出操作日志为Excel文件        |
| **请求方法** | GET                            |
| **完整URL**  | `/api/v1/operation-log/export` |

### 认证要求

| 项目     | 说明                          |
| -------- | ----------------------------- |
| 认证方式 | JWT Bearer Token              |
| 必需角色 | admin / supervisor / designer |

---

# 模块十一：部门管理模块

---

## 11.1 获取部门树

### 接口信息

| 项目         | 内容                |
| ------------ | ------------------- |
| **接口名称** | 获取部门树          |
| **接口描述** | 获取部门树形结构    |
| **请求方法** | GET                 |
| **完整URL**  | `/api/v1/dept/tree` |

### 成功响应示例

```json
{
  "code": 0,
  "message": "成功",
  "data": [
    {
      "id": 1,
      "deptName": "总公司",
      "parentId": 0,
      "sort": 1,
      "children": [
        {
          "id": 2,
          "deptName": "技术部",
          "parentId": 1,
          "sort": 1,
          "children": []
        },
        {
          "id": 3,
          "deptName": "生产部",
          "parentId": 1,
          "sort": 2,
          "children": []
        }
      ]
    }
  ],
  "timestamp": 1708924800000
}
```

### 认证要求

| 项目     | 说明             |
| -------- | ---------------- |
| 认证方式 | JWT Bearer Token |
| 必需角色 | admin            |

---

## 11.2 新增部门

### 接口信息

| 项目         | 内容           |
| ------------ | -------------- |
| **接口名称** | 新增部门       |
| **接口描述** | 创建新部门     |
| **请求方法** | POST           |
| **完整URL**  | `/api/v1/dept` |

### 请求体

**请求示例**:

```json
{
  "deptName": "研发部",
  "parentId": 1,
  "sort": 3,
  "leader": "王五",
  "phone": "13800138005",
  "email": "yanfa@example.com",
  "status": "启用"
}
```

### 成功响应示例

```json
{
  "code": 0,
  "message": "新增成功",
  "data": {
    "id": 4
  },
  "timestamp": 1708924800000
}
```

### 认证要求

| 项目     | 说明             |
| -------- | ---------------- |
| 认证方式 | JWT Bearer Token |
| 必需角色 | admin            |

---

## 11.3 更新部门

### 接口信息

| 项目         | 内容           |
| ------------ | -------------- |
| **接口名称** | 更新部门       |
| **接口描述** | 更新部门信息   |
| **请求方法** | PUT            |
| **完整URL**  | `/api/v1/dept` |

### 认证要求

| 项目     | 说明             |
| -------- | ---------------- |
| 认证方式 | JWT Bearer Token |
| 必需角色 | admin            |

---

## 11.4 删除部门

### 接口信息

| 项目         | 内容                |
| ------------ | ------------------- |
| **接口名称** | 删除部门            |
| **接口描述** | 删除部门            |
| **请求方法** | DELETE              |
| **完整URL**  | `/api/v1/dept/{id}` |

### 错误响应信息

| 错误码 | HTTP状态码 | 说明                       |
| ------ | ---------- | -------------------------- |
| 11001  | 400        | 部门下存在子部门，无法删除 |
| 11002  | 400        | 部门下存在用户，无法删除   |

### 认证要求

| 项目     | 说明             |
| -------- | ---------------- |
| 认证方式 | JWT Bearer Token |
| 必需角色 | admin            |

---

## 11.5 检查部门关联

### 接口信息

| 项目         | 内容                               |
| ------------ | ---------------------------------- |
| **接口名称** | 检查部门关联                       |
| **接口描述** | 检查部门是否有关联数据             |
| **请求方法** | GET                                |
| **完整URL**  | `/api/v1/dept/check-relation/{id}` |

### 成功响应示例

```json
{
  "code": 0,
  "message": "成功",
  "data": {
    "hasRelation": true,
    "relationInfo": {
      "userCount": 5,
      "childrenCount": 2
    }
  },
  "timestamp": 1708924800000
}
```

### 认证要求

| 项目     | 说明             |
| -------- | ---------------- |
| 认证方式 | JWT Bearer Token |
| 必需角色 | admin            |

---

## 11.6 获取部门选项

### 接口信息

| 项目         | 内容                   |
| ------------ | ---------------------- |
| **接口名称** | 获取部门选项           |
| **接口描述** | 获取部门下拉选项列表   |
| **请求方法** | GET                    |
| **完整URL**  | `/api/v1/dept/options` |

### 成功响应示例

```json
{
  "code": 0,
  "message": "成功",
  "data": [
    { "value": 1, "label": "总公司" },
    { "value": 2, "label": "技术部" },
    { "value": 3, "label": "生产部" }
  ],
  "timestamp": 1708924800000
}
```

### 认证要求

| 项目     | 说明                          |
| -------- | ----------------------------- |
| 认证方式 | JWT Bearer Token              |
| 必需角色 | admin / supervisor / designer |

---

# 附录

## A. 接口清单汇总

| 模块         | 接口数量 | 接口列表                                                                       |
| ------------ | -------- | ------------------------------------------------------------------------------ |
| 认证授权     | 6        | 登录、登出、验证码、刷新Token、修改密码、找回密码                              |
| 用户管理     | 10       | 列表、详情、新增、更新、删除、批量冻结、批量解冻、批量删除、重置密码、切换状态 |
| 设备管理     | 8        | 列表、详情、新增、更新、删除、品牌列表、位置列表、导出                         |
| 物料管理     | 8        | 列表、详情、新增、更新、删除、分类树、新增分类、删除分类                       |
| 工序管理     | 8        | 列表、详情、新增、更新、删除、添加设备关联、删除设备关联、选项列表             |
| 工艺路线管理 | 7        | 列表、详情、新增、更新、删除、提交审核、更新工序顺序                           |
| 审核管理     | 6        | 待审核列表、审核记录列表、审核详情、通过、驳回、批量审核                       |
| BOM管理      | 8        | 列表、详情、新增、更新、删除、版本历史、创建新版本、导出                       |
| 消息通知     | 6        | 列表、详情、标记已读、全部已读、删除、未读数量                                 |
| 日志管理     | 4        | 登录日志列表、导出登录日志、操作日志列表、导出操作日志                         |
| 部门管理     | 6        | 部门树、新增、更新、删除、检查关联、部门选项                                   |
| **合计**     | **77**   | -                                                                              |

## B. 错误码汇总

| 错误码范围  | 模块         |
| ----------- | ------------ |
| 1000-1099   | 认证授权     |
| 2000-2099   | 用户管理     |
| 3000-3099   | 设备管理     |
| 4000-4099   | 物料管理     |
| 5000-5099   | 工序管理     |
| 6000-6099   | 工艺路线管理 |
| 7000-7099   | 审核管理     |
| 8000-8099   | BOM管理      |
| 9000-9099   | 消息通知     |
| 10000-10099 | 日志管理     |
| 11000-11099 | 部门管理     |

## C. 更新日志

| 版本 | 日期       | 更新内容                   |
| ---- | ---------- | -------------------------- |
| v1.0 | 2026-02-26 | 初始版本，完成所有接口文档 |
