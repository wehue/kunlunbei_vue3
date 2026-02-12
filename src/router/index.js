import { createRouter, createWebHistory } from 'vue-router'

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
    path: '/',
    component: () => import('@/layouts/index.vue'),
    children: [
      {
        path: 'personal-center',
        name: 'PersonalCenter',
        component: () => import('@/views/common/personal_center/index.vue'),
        meta: { title: '个人中心', icon: 'User' },
      },
      {
        path: 'admin-index',
        name: 'AdminIndex',
        component: () => import('@/views/admin/admin_index/index.vue'),
        meta: { title: '管理员首页', icon: 'HomeFilled', isAffix: true },
      },
      {
        path: 'dept-manage',
        name: 'DeptManage',
        component: () => import('@/views/admin/dept_manage_info/index.vue'),
        meta: { title: '部门管理', icon: 'OfficeBuilding' },
      },
      {
        path: 'operator-manage',
        name: 'OperatorManage',
        component: () => import('@/views/admin/operator_manage_info/index.vue'),
        meta: { title: '操作员管理', icon: 'UserFilled' },
      },
      {
        path: 'product-manage',
        name: 'ProductManage',
        component: () => import('@/views/admin/product_manage_info/index.vue'),
        meta: { title: '产品管理', icon: 'Goods' },
      },
      {
        path: 'user-manage',
        name: 'UserManage',
        component: () => import('@/views/admin/user_manage_info/index.vue'),
        meta: { title: '用户管理', icon: 'Avatar' },
      },
      {
        path: 'warehouse-manage',
        name: 'WarehouseManage',
        component: () => import('@/views/admin/warehouse_manage_info/index.vue'),
        meta: { title: '仓库管理', icon: 'Box' },
      },
      {
        path: 'designer-index',
        name: 'DesignerIndex',
        component: () => import('@/views/designer/designer_index/index.vue'),
        meta: { title: '设计师首页', icon: 'HomeFilled', isAffix: true },
      },
      {
        path: 'bom-manage',
        name: 'BomManage',
        component: () => import('@/views/designer/bom_manage_info/index.vue'),
        meta: { title: 'BOM管理', icon: 'List' },
      },
      {
        path: 'bom-manage-detail/:id',
        name: 'BomManageDetail',
        component: () => import('@/views/designer/bom_manage_detail/index.vue'),
        meta: { title: 'BOM详情', icon: 'Document', isHide: true },
      },
      {
        path: 'material-category',
        name: 'MaterialCategory',
        component: () => import('@/views/designer/material_category/index.vue'),
        meta: { title: '物料分类', icon: 'Folder' },
      },
      {
        path: 'message-detail/:id',
        name: 'MessageDetail',
        component: () => import('@/views/designer/message_detail/index.vue'),
        meta: { title: '消息详情', icon: 'Message', isHide: true },
      },
      {
        path: 'supervisor-index',
        name: 'SupervisorIndex',
        component: () => import('@/views/supervisor/supervisor_index/index.vue'),
        meta: { title: '主管首页', icon: 'HomeFilled', isAffix: true },
      },
      {
        path: 'audit-pending',
        name: 'AuditPending',
        component: () => import('@/views/supervisor/audit_pending/index.vue'),
        meta: { title: '待审核', icon: 'Clock' },
      },
      {
        path: 'audit-pending-detail/:id',
        name: 'AuditPendingDetail',
        component: () => import('@/views/supervisor/audit_pending_detail/index.vue'),
        meta: { title: '待审核详情', icon: 'Document', isHide: true },
      },
      {
        path: 'audit-record',
        name: 'AuditRecord',
        component: () => import('@/views/supervisor/audit_record/index.vue'),
        meta: { title: '审核记录', icon: 'Finished' },
      },
      {
        path: 'audit-record-detail/:id',
        name: 'AuditRecordDetail',
        component: () => import('@/views/supervisor/audit_record_detail/index.vue'),
        meta: { title: '审核记录详情', icon: 'Document', isHide: true },
      },
      {
        path: 'device-manage',
        name: 'DeviceManage',
        component: () => import('@/views/common_share/device_manage_info/index.vue'),
        meta: { title: '设备管理', icon: 'Monitor' },
      },
      {
        path: 'device-manage-detail/:id',
        name: 'DeviceManageDetail',
        component: () => import('@/views/common_share/device_manage_detail/index.vue'),
        meta: { title: '设备详情', icon: 'Monitor', isHide: true },
      },
      {
        path: 'log-manage',
        name: 'LogManage',
        component: () => import('@/views/common_share/log_manage_info/index.vue'),
        meta: { title: '日志管理', icon: 'Tickets' },
      },
      {
        path: 'material-manage',
        name: 'MaterialManage',
        component: () => import('@/views/common_share/material_manage_info/index.vue'),
        meta: { title: '物料管理', icon: 'TakeawayBox' },
      },
      {
        path: 'material-manage-detail/:id',
        name: 'MaterialManageDetail',
        component: () => import('@/views/common_share/material_manage_detail/index.vue'),
        meta: { title: '物料详情', icon: 'TakeawayBox', isHide: true },
      },
      {
        path: 'process-manage',
        name: 'ProcessManage',
        component: () => import('@/views/common_share/process_manage_info/index.vue'),
        meta: { title: '工序管理', icon: 'Operation' },
      },
      {
        path: 'process-manage-detail/:id',
        name: 'ProcessManageDetail',
        component: () => import('@/views/common_share/process_manage_detail/index.vue'),
        meta: { title: '工序详情', icon: 'Operation', isHide: true },
      },
      {
        path: 'process-route-manage',
        name: 'ProcessRouteManage',
        component: () => import('@/views/common_share/process_route_manage_info/index.vue'),
        meta: { title: '工艺路线管理', icon: 'Guide' },
      },
      {
        path: 'process-route-manage-detail/:id',
        name: 'ProcessRouteManageDetail',
        component: () => import('@/views/common_share/process_route_manage_detail/index.vue'),
        meta: { title: '工艺路线详情', icon: 'Guide', isHide: true },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
