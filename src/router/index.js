import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/login/login.vue'),
      meta: { title: '登录' }
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('@/views/common/register/register.vue'),
      meta: { title: '注册' }
    },
    {
      path: '/password-find',
      name: 'PasswordFind',
      component: () => import('@/views/common/password-find/password-find.vue'),
      meta: { title: '找回密码' }
    },
    {
      path: '/personal-center',
      name: 'PersonalCenter',
      component: () => import('@/views/common/personal-center/personal-center.vue'),
      meta: { title: '个人中心' }
    },
    {
      path: '/operate-log',
      name: 'OperateLog',
      component: () => import('@/views/common-share/operate-log/operate-log.vue'),
      meta: { title: '操作日志' }
    },
    {
      path: '/device-manage',
      name: 'DeviceManage',
      component: () => import('@/views/common-share/device-manage/device-manage.vue'),
      meta: { title: '设备管理' }
    },
    {
      path: '/device-detail',
      name: 'DeviceDetail',
      component: () => import('@/views/common-share/device-detail/device-detail.vue'),
      meta: { title: '设备详情' }
    },
    {
      path: '/material-manage',
      name: 'MaterialManage',
      component: () => import('@/views/common-share/material-manage/material-manage.vue'),
      meta: { title: '物料管理' }
    },
    {
      path: '/material-detail',
      name: 'MaterialDetail',
      component: () => import('@/views/common-share/material-detail/material-detail.vue'),
      meta: { title: '物料详情' }
    },
    {
      path: '/process-manage',
      name: 'ProcessManage',
      component: () => import('@/views/common-share/process-manage/process-manage.vue'),
      meta: { title: '工序管理' }
    },
    {
      path: '/process-detail',
      name: 'ProcessDetail',
      component: () => import('@/views/common-share/process-detail/process-detail.vue'),
      meta: { title: '工序详情' }
    },
    {
      path: '/process-route-manage',
      name: 'ProcessRouteManage',
      component: () => import('@/views/common-share/process-route-manage/process-route-manage.vue'),
      meta: { title: '工艺路线管理' }
    },
    {
      path: '/process-route-detail',
      name: 'ProcessRouteDetail',
      component: () => import('@/views/common-share/process-route-detail/process-route-detail.vue'),
      meta: { title: '工艺路线详情' }
    },
    {
      path: '/admin-index',
      name: 'AdminIndex',
      component: () => import('@/views/admin/admin-index/admin-index.vue'),
      meta: { title: '管理首页' }
    },
    {
      path: '/user-manage',
      name: 'UserManage',
      component: () => import('@/views/admin/user-manage/user-manage.vue'),
      meta: { title: '用户管理' }
    },
    {
      path: '/dept-manage',
      name: 'DeptManage',
      component: () => import('@/views/admin/dept-manage/dept-manage.vue'),
      meta: { title: '部门管理' }
    },
    {
      path: '/operator-manage',
      name: 'OperatorManage',
      component: () => import('@/views/admin/operator-manage/operator-manage.vue'),
      meta: { title: '操作员管理' }
    },
    {
      path: '/warehouse-manage',
      name: 'WarehouseManage',
      component: () => import('@/views/admin/warehouse-manage/warehouse-manage.vue'),
      meta: { title: '仓库管理' }
    },
    {
      path: '/product-manage',
      name: 'ProductManage',
      component: () => import('@/views/admin/product-manage/product-manage.vue'),
      meta: { title: '产品管理' }
    },
    {
      path: '/log-manage',
      name: 'LogManage',
      component: () => import('@/views/admin/log-manage/log-manage.vue'),
      meta: { title: '日志管理' }
    },
    {
      path: '/supervisor-index',
      name: 'SupervisorIndex',
      component: () => import('@/views/supervisor/supervisor-index/supervisor-index.vue'),
      meta: { title: '主管首页' }
    },
    {
      path: '/audit-pending',
      name: 'AuditPending',
      component: () => import('@/views/supervisor/audit-pending/audit-pending.vue'),
      meta: { title: '待审核' }
    },
    {
      path: '/audit-pending-detail',
      name: 'AuditPendingDetail',
      component: () => import('@/views/supervisor/audit-pending-detail/audit-pending-detail.vue'),
      meta: { title: '待审核详情' }
    },
    {
      path: '/audit-record',
      name: 'AuditRecord',
      component: () => import('@/views/supervisor/audit-record/audit-record.vue'),
      meta: { title: '审核记录' }
    },
    {
      path: '/audit-record-detail',
      name: 'AuditRecordDetail',
      component: () => import('@/views/supervisor/audit-record-detail/audit-record-detail.vue'),
      meta: { title: '审核记录详情' }
    },
    {
      path: '/designer-index',
      name: 'DesignerIndex',
      component: () => import('@/views/designer/designer-index/designer-index.vue'),
      meta: { title: '设计师首页' }
    },
    {
      path: '/material-category',
      name: 'MaterialCategory',
      component: () => import('@/views/designer/material-category/material-category.vue'),
      meta: { title: '物料分类' }
    },
    {
      path: '/bom-manage',
      name: 'BomManage',
      component: () => import('@/views/designer/bom-manage/bom-manage.vue'),
      meta: { title: 'BOM管理' }
    },
    {
      path: '/bom-detail',
      name: 'BomDetail',
      component: () => import('@/views/designer/bom-detail/bom-detail.vue'),
      meta: { title: 'BOM详情' }
    },
    {
      path: '/message-detail',
      name: 'MessageDetail',
      component: () => import('@/views/designer/message-detail/message-detail.vue'),
      meta: { title: '消息详情' }
    }
  ]
})

export default router
