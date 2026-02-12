import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/common/login/index.vue'),
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('@/views/common/register/index.vue'),
    },
    {
      path: '/password-find',
      name: 'PasswordFind',
      component: () => import('@/views/common/password_find/index.vue'),
    },
    {
      path: '/personal-center',
      name: 'PersonalCenter',
      component: () => import('@/views/common/personal_center/index.vue'),
    },
    {
      path: '/admin-index',
      name: 'AdminIndex',
      component: () => import('@/views/admin/admin_index/index.vue'),
    },
    {
      path: '/dept-manage',
      name: 'DeptManage',
      component: () => import('@/views/admin/dept_manage_info/index.vue'),
    },
    {
      path: '/operator-manage',
      name: 'OperatorManage',
      component: () => import('@/views/admin/operator_manage_info/index.vue'),
    },
    {
      path: '/product-manage',
      name: 'ProductManage',
      component: () => import('@/views/admin/product_manage_info/index.vue'),
    },
    {
      path: '/user-manage',
      name: 'UserManage',
      component: () => import('@/views/admin/user_manage_info/index.vue'),
    },
    {
      path: '/warehouse-manage',
      name: 'WarehouseManage',
      component: () => import('@/views/admin/warehouse_manage_info/index.vue'),
    },
    {
      path: '/designer-index',
      name: 'DesignerIndex',
      component: () => import('@/views/designer/designer_index/index.vue'),
    },
    {
      path: '/bom-manage',
      name: 'BomManage',
      component: () => import('@/views/designer/bom_manage_info/index.vue'),
    },
    {
      path: '/bom-manage-detail/:id',
      name: 'BomManageDetail',
      component: () => import('@/views/designer/bom_manage_detail/index.vue'),
    },
    {
      path: '/material-category',
      name: 'MaterialCategory',
      component: () => import('@/views/designer/material_category/index.vue'),
    },
    {
      path: '/message-detail/:id',
      name: 'MessageDetail',
      component: () => import('@/views/designer/message_detail/index.vue'),
    },
    {
      path: '/supervisor-index',
      name: 'SupervisorIndex',
      component: () => import('@/views/supervisor/supervisor_index/index.vue'),
    },
    {
      path: '/audit-pending',
      name: 'AuditPending',
      component: () => import('@/views/supervisor/audit_pending/index.vue'),
    },
    {
      path: '/audit-pending-detail/:id',
      name: 'AuditPendingDetail',
      component: () => import('@/views/supervisor/audit_pending_detail/index.vue'),
    },
    {
      path: '/audit-record',
      name: 'AuditRecord',
      component: () => import('@/views/supervisor/audit_record/index.vue'),
    },
    {
      path: '/audit-record-detail/:id',
      name: 'AuditRecordDetail',
      component: () => import('@/views/supervisor/audit_record_detail/index.vue'),
    },
    {
      path: '/device-manage',
      name: 'DeviceManage',
      component: () => import('@/views/common_share/device_manage_info/index.vue'),
    },
    {
      path: '/device-manage-detail/:id',
      name: 'DeviceManageDetail',
      component: () => import('@/views/common_share/device_manage_detail/index.vue'),
    },
    {
      path: '/log-manage',
      name: 'LogManage',
      component: () => import('@/views/common_share/log_manage_info/index.vue'),
    },
    {
      path: '/material-manage',
      name: 'MaterialManage',
      component: () => import('@/views/common_share/material_manage_info/index.vue'),
    },
    {
      path: '/material-manage-detail/:id',
      name: 'MaterialManageDetail',
      component: () => import('@/views/common_share/material_manage_detail/index.vue'),
    },
    {
      path: '/process-manage',
      name: 'ProcessManage',
      component: () => import('@/views/common_share/process_manage_info/index.vue'),
    },
    {
      path: '/process-manage-detail/:id',
      name: 'ProcessManageDetail',
      component: () => import('@/views/common_share/process_manage_detail/index.vue'),
    },
    {
      path: '/process-route-manage',
      name: 'ProcessRouteManage',
      component: () => import('@/views/common_share/process_route_manage_info/index.vue'),
    },
    {
      path: '/process-route-manage-detail/:id',
      name: 'ProcessRouteManageDetail',
      component: () => import('@/views/common_share/process_route_manage_detail/index.vue'),
    },
  ],
})

export default router
