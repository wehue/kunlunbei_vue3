import { useUserStore } from '@/stores/modules/user'

/**
 * 检查当前用户是否具有指定角色
 * @param {string|string[]} roles - 角色或角色数组
 * @returns {boolean}
 */
export function hasRole(roles) {
  const userStore = useUserStore()
  const currentRole = userStore.userInfo.role

  if (!currentRole) return false

  if (typeof roles === 'string') {
    return currentRole === roles
  }

  if (Array.isArray(roles)) {
    return roles.includes(currentRole)
  }

  return false
}

/**
 * 检查是否是管理员
 * @returns {boolean}
 */
export function isAdmin() {
  return hasRole('admin')
}

/**
 * 检查是否是主管
 * @returns {boolean}
 */
export function isSupervisor() {
  return hasRole('supervisor')
}

/**
 * 检查是否是设计师
 * @returns {boolean}
 */
export function isDesigner() {
  return hasRole('designer')
}

/**
 * 获取当前用户角色
 * @returns {string}
 */
export function getCurrentRole() {
  const userStore = useUserStore()
  return userStore.userInfo.role || ''
}
