import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/modules/user'

const routes = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/common/login/index.vue'),
    meta: { title: '登录', isHide: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/common/register/index.vue'),
    meta: { title: '注册', isHide: true },
  },
  {
    path: '/password-find',
    name: 'PasswordFind',
    component: () => import('@/views/common/password_find/index.vue'),
    meta: { title: '找回密码', isHide: true },
  },
  {
    path: '/role-test',
    name: 'RoleTest',
    component: () => import('@/views/role-test/index.vue'),
    meta: { title: '角色测试', isHide: true },
  },
  {
    path: '/403',
    name: '403',
    component: () => import('@/components/ErrorMessage/403.vue'),
    meta: { title: '无权限访问', isHide: true },
  },
  {
    path: '/',
    component: () => import('@/layouts/index.vue'),
    children: [
      // 管理员路由
      {
        path: 'admin-index',
        name: 'AdminIndex',
        component: () => import('@/views/admin/admin_index/index.vue'),
        meta: { title: '管理员首页', icon: 'HomeFilled', isAffix: true, roles: ['admin'] },
      },
      // 设备管理
      {
        path: 'device-manage',
        name: 'DeviceManage',
        redirect: 'device-manage-info',
        meta: { title: '设备管理', icon: 'Monitor', roles: ['admin', 'supervisor', 'designer'] },
        children: [
          {
            path: 'device-manage-info',
            name: 'DeviceManageInfo',
            component: () => import('@/views/common_share/device_manage_info/index.vue'),
            meta: {
              title: '设备台账',
              icon: 'Monitor',
              roles: ['admin', 'supervisor', 'designer'],
            },
          },
          {
            path: 'device-manage-detail/:id',
            name: 'DeviceManageDetail',
            component: () => import('@/views/common_share/device_manage_detail/index.vue'),
            meta: {
              title: '设备详情',
              icon: 'Monitor',
              roles: ['admin', 'supervisor', 'designer'],
              isHide: true,
            },
          },
        ],
      },
      // 物料管理
      {
        path: 'material-manage',
        name: 'MaterialManage',
        redirect: 'material-manage-info',
        meta: {
          title: '物料管理',
          icon: 'TakeawayBox',
          roles: ['admin', 'supervisor', 'designer'],
        },
        children: [
          {
            path: 'material-manage-info',
            name: 'MaterialManageInfo',
            component: () => import('@/views/common_share/material_manage_info/index.vue'),
            meta: {
              title: '物料台账',
              icon: 'TakeawayBox',
              roles: ['admin', 'supervisor', 'designer'],
            },
          },
          {
            path: 'material-manage-detail/:id',
            name: 'MaterialManageDetail',
            component: () => import('@/views/common_share/material_manage_detail/index.vue'),
            meta: {
              title: '物料详情',
              icon: 'TakeawayBox',
              roles: ['admin', 'supervisor', 'designer'],
              isHide: true,
            },
          },
          {
            path: 'material-category',
            name: 'MaterialCategory',
            component: () => import('@/views/designer/material_category/index.vue'),
            meta: { title: '物料分类', icon: 'Folder', roles: ['admin', 'supervisor', 'designer'] },
          },
          {
            path: 'bom-manage',
            name: 'BomManage',
            component: () => import('@/views/designer/bom_manage_info/index.vue'),
            meta: { title: 'BOM管理', icon: 'List', roles: ['admin', 'supervisor', 'designer'] },
          },
          {
            path: 'bom-manage-detail/:id',
            name: 'BomManageDetail',
            component: () => import('@/views/designer/bom_manage_detail/index.vue'),
            meta: {
              title: 'BOM详情',
              icon: 'Document',
              roles: ['admin', 'supervisor', 'designer'],
              isHide: true,
            },
          },
        ],
      },
      // 工序管理
      {
        path: 'process-manage',
        name: 'ProcessManage',
        redirect: 'process-manage-info',
        meta: { title: '工序管理', icon: 'Operation', roles: ['admin', 'supervisor', 'designer'] },
        children: [
          {
            path: 'process-manage-info',
            name: 'ProcessManageInfo',
            component: () => import('@/views/common_share/process_manage_info/index.vue'),
            meta: {
              title: '工序台账',
              icon: 'Operation',
              roles: ['admin', 'supervisor', 'designer'],
            },
          },
          {
            path: 'process-manage-detail/:id',
            name: 'ProcessManageDetail',
            component: () => import('@/views/common_share/process_manage_detail/index.vue'),
            meta: {
              title: '工序详情',
              icon: 'Operation',
              roles: ['admin', 'supervisor', 'designer'],
              isHide: true,
            },
          },
        ],
      },
      // 工艺路线管理
      {
        path: 'process-route-manage',
        name: 'ProcessRouteManage',
        redirect: 'process-route-manage-info',
        meta: { title: '工艺路线管理', icon: 'Guide', roles: ['admin', 'supervisor', 'designer'] },
        children: [
          {
            path: 'process-route-manage-info',
            name: 'ProcessRouteManageInfo',
            component: () => import('@/views/common_share/process_route_manage_info/index.vue'),
            meta: { title: '工艺台账', icon: 'Guide', roles: ['admin', 'supervisor', 'designer'] },
          },
          {
            path: 'process-route-manage-detail/:id',
            name: 'ProcessRouteManageDetail',
            component: () => import('@/views/common_share/process_route_manage_detail/index.vue'),
            meta: {
              title: '工艺详情',
              icon: 'Guide',
              roles: ['admin', 'supervisor', 'designer'],
              isHide: true,
            },
          },
        ],
      },
      // 管理员专属路由
      {
        path: 'user-manage',
        name: 'UserManage',
        redirect: 'user-manage-info',
        meta: { title: '用户管理', icon: 'Avatar', roles: ['admin'] },
        children: [
          {
            path: 'user-manage-info',
            name: 'UserManageInfo',
            component: () => import('@/views/admin/user_manage_info/index.vue'),
            meta: { title: '用户台账', icon: 'Avatar', roles: ['admin'] },
          },
          {
            path: 'user-manage-detail/:id',
            name: 'UserManageDetail',
            component: () => import('@/views/admin/user_manage_detail/index.vue'),
            meta: { title: '用户详情', icon: 'Avatar', roles: ['admin'], isHide: true },
          },
        ],
      },
      {
        path: 'dept-manage',
        name: 'DeptManage',
        redirect: 'dept-manage-info',
        meta: { title: '部门管理', icon: 'OfficeBuilding', roles: ['admin'] },
        children: [
          {
            path: 'dept-manage-info',
            name: 'DeptManageInfo',
            component: () => import('@/views/admin/dept_manage_info/index.vue'),
            meta: { title: '部门台账', icon: 'OfficeBuilding', roles: ['admin'] },
          },
          {
            path: 'dept-manage-detail/:id',
            name: 'DeptManageDetail',
            component: () => import('@/views/admin/dept_manage_detail/index.vue'),
            meta: { title: '部门详情', icon: 'OfficeBuilding', roles: ['admin'], isHide: true },
          },
        ],
      },
      {
        path: 'operator-manage',
        name: 'OperatorManage',
        redirect: 'operator-manage-info',
        meta: { title: '操作人员管理', icon: 'UserFilled', roles: ['admin'] },
        children: [
          {
            path: 'operator-manage-info',
            name: 'OperatorManageInfo',
            component: () => import('@/views/admin/operator_manage_info/index.vue'),
            meta: { title: '人员台账', icon: 'UserFilled', roles: ['admin'] },
          },
          {
            path: 'operator-manage-detail/:id',
            name: 'OperatorManageDetail',
            component: () => import('@/views/admin/operator_manage_detail/index.vue'),
            meta: { title: '人员详情', icon: 'UserFilled', roles: ['admin'], isHide: true },
          },
        ],
      },
      {
        path: 'warehouse-manage',
        name: 'WarehouseManage',
        redirect: 'warehouse-manage-info',
        meta: { title: '仓库管理', icon: 'Box', roles: ['admin'] },
        children: [
          {
            path: 'warehouse-manage-info',
            name: 'WarehouseManageInfo',
            component: () => import('@/views/admin/warehouse_manage_info/index.vue'),
            meta: { title: '仓库台账', icon: 'Box', roles: ['admin'] },
          },
          {
            path: 'warehouse-manage-detail/:id',
            name: 'WarehouseManageDetail',
            component: () => import('@/views/admin/warehouse_manage_detail/index.vue'),
            meta: { title: '仓库详情', icon: 'Box', roles: ['admin'], isHide: true },
          },
        ],
      },
      {
        path: 'product-manage',
        name: 'ProductManage',
        redirect: 'product-manage-info',
        meta: { title: '产品管理', icon: 'Goods', roles: ['admin'] },
        children: [
          {
            path: 'product-manage-info',
            name: 'ProductManageInfo',
            component: () => import('@/views/admin/product_manage_info/index.vue'),
            meta: { title: '产品台账', icon: 'Goods', roles: ['admin'] },
          },
          {
            path: 'product-manage-detail/:id',
            name: 'ProductManageDetail',
            component: () => import('@/views/admin/product_manage_detail/index.vue'),
            meta: { title: '产品详情', icon: 'Goods', roles: ['admin'], isHide: true },
          },
        ],
      },
      {
        path: 'log-manage',
        name: 'LogManage',
        redirect: '/log-manage/login-log',
        meta: { title: '日志管理', icon: 'Tickets', roles: ['admin'] },
        children: [
          {
            path: 'login-log',
            name: 'LoginLog',
            component: () => import('@/views/common_share/login_log/index.vue'),
            meta: { title: '登录日志', icon: 'Tickets', roles: ['admin'] },
          },
          {
            path: 'operation-log',
            name: 'OperationLog',
            component: () => import('@/views/common_share/operation_log/index.vue'),
            meta: { title: '操作日志', icon: 'Tickets', roles: ['admin'] },
          },
        ],
      },
      // 主管路由
      {
        path: 'supervisor-index',
        name: 'SupervisorIndex',
        component: () => import('@/views/supervisor/supervisor_index/index.vue'),
        meta: { title: '主管首页', icon: 'HomeFilled', isAffix: true, roles: ['supervisor'] },
      },
      {
        path: 'audit-manage',
        name: 'AuditManage',
        component: () => import('@/views/supervisor/audit_pending/index.vue'),
        meta: { title: '审核管理', icon: 'Check', roles: ['supervisor'] },
        children: [
          {
            path: 'audit-pending',
            name: 'AuditPending',
            component: () => import('@/views/supervisor/audit_pending/index.vue'),
            meta: { title: '待办审核', icon: 'Clock', roles: ['supervisor'] },
          },
          {
            path: 'audit-pending-detail/:id',
            name: 'AuditPendingDetail',
            component: () => import('@/views/supervisor/audit_pending_detail/index.vue'),
            meta: { title: '待办审核详情', icon: 'Document', roles: ['supervisor'], isHide: true },
          },
          {
            path: 'audit-record',
            name: 'AuditRecord',
            component: () => import('@/views/supervisor/audit_record/index.vue'),
            meta: { title: '审核记录', icon: 'Finished', roles: ['supervisor'] },
          },
          {
            path: 'audit-record-detail/:id',
            name: 'AuditRecordDetail',
            component: () => import('@/views/supervisor/audit_record_detail/index.vue'),
            meta: { title: '审核记录详情', icon: 'Document', roles: ['supervisor'], isHide: true },
          },
        ],
      },
      // 设计师路由
      {
        path: 'designer-index',
        name: 'DesignerIndex',
        component: () => import('@/views/designer/designer_index/index.vue'),
        meta: { title: '设计师首页', icon: 'HomeFilled', isAffix: true, roles: ['designer'] },
      },
      {
        path: 'message-manage',
        name: 'MessageManage',
        redirect: 'message-info',
        meta: { title: '消息通知', icon: 'Message', roles: ['designer'] },
        children: [
          {
            path: 'message-info',
            name: 'MessageInfo',
            component: () => import('@/views/designer/message_info/index.vue'),
            meta: { title: '消息台账', icon: 'Message', roles: ['designer'] },
          },
          {
            path: 'message-detail/:id',
            name: 'MessageDetail',
            component: () => import('@/views/designer/message_detail/index.vue'),
            meta: { title: '消息详情', icon: 'Message', roles: ['designer'], isHide: true },
          },
        ],
      },
      {
        path: 'designer-log-manage',
        name: 'DesignerLogManage',
        redirect: 'designer-log-manage/operation-log',
        meta: { title: '日志管理', icon: 'Tickets', roles: ['designer'] },
        children: [
          {
            path: 'operation-log',
            name: 'DesignerOperationLog',
            component: () => import('@/views/common_share/operation_log/index.vue'),
            meta: { title: '操作日志', icon: 'Tickets', roles: ['designer'] },
          },
        ],
      },
      // 通用路由
      {
        path: 'personal-center',
        name: 'PersonalCenter',
        component: () => import('@/views/common/personal_center/index.vue'),
        meta: { title: '个人中心', icon: 'User', roles: ['supervisor', 'designer'] },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const currentRole = userStore.userInfo.role

  if (to.meta.isHide) {
    next()
    return
  }

  if (to.meta.roles) {
    if (!currentRole) {
      next('/login')
      return
    }

    if (!to.meta.roles.includes(currentRole)) {
      next('/403')
      return
    }
  }

  next()
})

export default router
