import { computed } from 'vue'
import { hasRole, isAdmin, isSupervisor, isDesigner, getCurrentRole } from '@/utils/permission'

export function usePermission() {
  /**
   * 检查当前用户是否具有指定角色
   */
  const hasPermission = (roles) => {
    return hasRole(roles)
  }

  /**
   * 计算属性：是否是管理员
   */
  const isAdminRole = computed(() => isAdmin())

  /**
   * 计算属性：是否是主管
   */
  const isSupervisorRole = computed(() => isSupervisor())

  /**
   * 计算属性：是否是设计师
   */
  const isDesignerRole = computed(() => isDesigner())

  /**
   * 计算属性：当前用户角色
   */
  const currentRole = computed(() => getCurrentRole())

  return {
    hasPermission,
    isAdminRole,
    isSupervisorRole,
    isDesignerRole,
    currentRole,
  }
}
