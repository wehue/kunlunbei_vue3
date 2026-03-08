import { useUserStore } from '@/stores/modules/user'

/**
 * 检查当前用户是否具有指定角色
 * @param {string|string[]} roles - 角色或角色数组
 * @returns {boolean}
 */
export function hasRole(roles) {
  const userStore = useUserStore()
  const currentRole = userStore.userInfo?.role

  if (!currentRole) return false

  // 统一转换为小写进行比较
  const normalizedCurrentRole = currentRole.toLowerCase()

  if (typeof roles === 'string') {
    return normalizedCurrentRole === roles.toLowerCase()
  }

  if (Array.isArray(roles)) {
    return roles.map((r) => r.toLowerCase()).includes(normalizedCurrentRole)
  }

  return false
}

/**
 * 检查是否是管理员
 * @returns {boolean}
 */
export function isAdmin() {
  return hasRole('Admin')
}

/**
 * 检查是否是主管
 * @returns {boolean}
 */
export function isSupervisor() {
  return hasRole('Supervisor')
}

/**
 * 检查是否是设计师
 * @returns {boolean}
 */
export function isDesigner() {
  return hasRole('Designer')
}

/**
 * 获取当前用户角色
 * @returns {string}
 */
export function getCurrentRole() {
  const userStore = useUserStore()
  return userStore.userInfo?.role || ''
}
