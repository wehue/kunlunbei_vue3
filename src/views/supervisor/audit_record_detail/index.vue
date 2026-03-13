<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Monitor, User, Box } from '@element-plus/icons-vue'
import { getPendingAuditDetail } from '@/api/audit'
import { getProcessDetail } from '@/api/process'
import { getDeviceDetailByEquipmentId } from '@/api/device'
import { getProductionStaffDetail } from '@/api/productionStaff'
import { getPartDetail } from '@/api/material'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const auditData = ref({})
const selectedStepId = ref(null)
const activeDetailTab = ref('devices')

const formatDateTime = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

const depreciationOptions = [
  { label: '直线折旧', value: 'SD' },
  { label: '快速折旧', value: 'AD' },
]

const unitOptions = [
  { label: '个', value: 'A' },
  { label: '米', value: 'M' },
  { label: '克', value: 'G' },
  { label: '千克', value: 'KG' },
]

const getDepreciationLabel = (value) => {
  const option = depreciationOptions.find((item) => item.value === value)
  return option ? option.label : value || ''
}

const getUnitLabel = (value) => {
  const option = unitOptions.find((item) => item.value === value)
  return option ? option.label : value || ''
}

const currentProcessSteps = computed(() => {
  return auditData.value.processSteps || []
})

const selectedStep = computed(() => {
  return currentProcessSteps.value.find((step) => step.id === selectedStepId.value) || null
})

const handleSelectStep = async (step) => {
  selectedStepId.value = step.id
  await loadStepDetails(step)
}

const loadStepDetails = async (step) => {
  console.log('开始加载工序详情:', step.id, step.stepName)

  const stepIndex = auditData.value.processSteps?.findIndex((s) => s.id === step.id)
  if (stepIndex === -1 || !auditData.value.processSteps) {
    console.log('在auditData.value.processSteps中未找到工序')
    return
  }

  // 根据工序ID获取工序详情
  const processId = step.processId || step.processCode
  if (!processId) {
    return
  }

  try {
    const res = await getProcessDetail({ workingProcedureId: processId })
    const processDetail = res.data?.data?.data || res.data?.data || res.data
    if (!processDetail) {
      console.log('未获取到工序详情')
      return
    }

    // 提取设备信息
    let devices = []
    if (
      processDetail.production_TestingEquipment &&
      Array.isArray(processDetail.production_TestingEquipment)
    ) {
      devices = processDetail.production_TestingEquipment.map((device) => ({
        equipmentId: device.equipmentId,
        deviceCode: device.equipmentId,
        deviceName: device.equipmentName,
        quantity: device.expenditureQuantity,
        unit: device.unit,
      }))
    }

    // 提取操作人员信息
    let operators = []
    if (processDetail.operator) {
      operators = [
        {
          productionStaffId: processDetail.operator.productionStaffId,
          employeeCode: processDetail.operator.productionStaffId,
          employeeName: processDetail.operator.productionStaffName || processDetail.operator.name,
        },
      ]
    }

    // 提取物料信息
    let childMaterials = []
    if (processDetail.theMaterials && Array.isArray(processDetail.theMaterials)) {
      childMaterials = processDetail.theMaterials.map((material) => ({
        materialId: material.materialId,
        materialCode: material.materialId,
        materialName: material.materialName,
        quantity: material.expenditureQuantity,
        unit: material.unit,
      }))
    } else if (processDetail.materials && Array.isArray(processDetail.materials)) {
      childMaterials = processDetail.materials.map((material) => ({
        materialId: material.materialId,
        materialCode: material.materialId,
        materialName: material.materialName,
        quantity: material.expenditureQuantity,
        unit: material.unit,
      }))
    } else if (processDetail.material) {
      childMaterials = [
        {
          materialId: processDetail.material.materialId,
          materialCode: processDetail.material.materialId,
          materialName: processDetail.material.materialName,
          quantity: processDetail.material.expenditureQuantity,
          unit: processDetail.material.unit,
        },
      ]
    } else if (processDetail.description) {
      try {
        const descriptionData = JSON.parse(processDetail.description)
        if (Array.isArray(descriptionData)) {
          childMaterials = descriptionData.map((material) => ({
            materialId: material.materialId,
            materialCode: material.materialId,
            materialName: material.materialName,
            quantity: material.quantity || 1,
            unit: material.unit || '',
          }))
        }
      } catch (error) {
        console.error('解析description字段失败:', error)
      }
    }

    // 更新auditData中的工序信息
    auditData.value = {
      ...auditData.value,
      processSteps: auditData.value.processSteps.map((s, index) =>
        index === stepIndex
          ? {
              ...s,
              description: processDetail.productionSteps || processDetail.description || '',
              devices: devices,
              operators: operators,
              bom: {
                parentMaterial: null,
                childMaterials: childMaterials,
              },
            }
          : s,
      ),
    }

    // 获取设备详情
    if (devices.length > 0) {
      const deviceDetails = await Promise.all(
        devices.map(async (device) => {
          const equipmentId = device.equipmentId
          if (equipmentId) {
            try {
              const res = await getDeviceDetailByEquipmentId(equipmentId)
              const detail = res.data?.data?.data || res.data?.data || res.data
              if (detail) {
                const locationName = detail.location?.warhouseName || detail.location || ''
                return {
                  ...device,
                  deviceCode: detail.equipmentId || device.deviceCode,
                  deviceName: detail.equipmentName || device.deviceName,
                  manufacturer: detail.manufacturer || '',
                  brand: detail.brand || '',
                  specModel: detail.specificationModel || detail.specModel || '',
                  supplier: detail.supplier || '',
                  productionDate: detail.productionDate || '',
                  serviceLife: detail.serviceLife || '',
                  depreciationMethod: detail.depreciationMethod || '',
                  location: locationName,
                  stockQuantity:
                    detail.equipmentQuantity || detail.stockQuantity || detail.quantity || '',
                  unit: detail.unit || '',
                }
              }
            } catch (error) {
              console.error('获取设备详情失败:', error)
            }
          }
          return device
        }),
      )
      auditData.value = {
        ...auditData.value,
        processSteps: auditData.value.processSteps.map((s, index) =>
          index === stepIndex ? { ...s, devices: deviceDetails } : s,
        ),
      }
    }

    // 获取操作人员详情
    if (operators.length > 0) {
      const operatorDetails = await Promise.all(
        operators.map(async (operator) => {
          const productionStaffId = operator.productionStaffId
          if (productionStaffId) {
            try {
              const res = await getProductionStaffDetail(productionStaffId)
              const detail = res.data?.data || res.data
              if (detail) {
                const actualDetail = detail.data || detail
                return {
                  ...operator,
                  employeeCode: actualDetail.productionStaffId,
                  employeeName: actualDetail.productionStaffName,
                  deptName: actualDetail.department?.departmentName || '',
                  position: actualDetail.position,
                }
              }
            } catch (error) {
              console.error('获取操作人员详情失败:', error)
            }
          }
          return operator
        }),
      )
      auditData.value = {
        ...auditData.value,
        processSteps: auditData.value.processSteps.map((s, index) =>
          index === stepIndex ? { ...s, operators: operatorDetails } : s,
        ),
      }
    }

    // 获取物料详情
    if (childMaterials.length > 0) {
      const materialDetails = await Promise.all(
        childMaterials.map(async (material) => {
          const dbId = material.materialId
          if (dbId) {
            try {
              const res = await getPartDetail(dbId)
              const detail = res.data?.data?.data || res.data?.data || res.data
              if (detail) {
                const categoryName = detail.category?.categoryName || detail.categoryName || ''
                const locationName = detail.warhouse?.warhouseName || detail.location || ''
                return {
                  ...material,
                  materialCode: detail.partId || material.materialId || material.materialCode || '',
                  materialName: detail.partName || material.materialName || '',
                  specModel: detail.specificationModel || material.specModel || '',
                  quantity: material.quantity || 0,
                  unit: material.unit || '',
                  stockQuantity: detail.stockQuantity || material.stockQuantity || '',
                  supplier: detail.supplier || '',
                  version: detail.versions || detail.version || '',
                  category: categoryName || material.category || '',
                  location: locationName,
                }
              }
            } catch (error) {
              console.error('获取物料详情失败:', error)
            }
          }
          return material
        }),
      )
      auditData.value = {
        ...auditData.value,
        processSteps: auditData.value.processSteps.map((s, index) =>
          index === stepIndex
            ? {
                ...s,
                bom: {
                  ...s.bom,
                  childMaterials: materialDetails,
                },
              }
            : s,
        ),
      }
    }

    console.log('工序详情加载完成:', auditData.value.processSteps[stepIndex])
  } catch (error) {
    console.error('获取工序详情失败:', error)
  }
}

const loadAuditData = async () => {
  loading.value = true
  try {
    const workingPlanId = route.params.id
    const response = await getPendingAuditDetail(workingPlanId)
    console.log('获取审核记录详情成功:', response)

    // 与audit_pending_detail页面保持相同的数据提取逻辑
    const detail = response.data?.data?.data || response.data?.data || response.data

    if (!detail) {
      ElMessage.error('获取审核记录详情失败')
      loading.value = false
      return
    }

    // 解析description字段中的工序列表
    let processSteps = []
    if (detail.description) {
      try {
        const processes = JSON.parse(detail.description)

        // 为每个工序生成唯一ID并构建processSteps数组
        processSteps = processes.map((process, index) => ({
          id: Date.now() + index,
          processId: process.workingProcedureId,
          processCode: process.workingProcedureId,
          stepName: process.workingProcedureName,
          description: '',
          devices: [],
          operators: [],
          bom: {
            parentMaterial: null,
            childMaterials: [],
          },
        }))
      } catch (e) {
        console.error('解析工序数据失败:', e)
      }
    }

    // 构建auditData对象
    const auditDataObj = {
      id: detail.id,
      processCode: detail.workingPlanId || '',
      processName: detail.workingPlanName || '',
      version: detail.version || '',
      product: detail.associatedProduct?.name || detail.associatedProduct?.productName || '',
      description: detail.workingPlanDescription || '',
      applicant: detail.applicant?.userName || detail.applicant?.creator || '',
      submitTime: formatDateTime(detail.submitTime) || '',
      processSteps: processSteps,
    }

    auditData.value = auditDataObj

    if (auditData.value.processSteps && auditData.value.processSteps.length > 0) {
      // 自动加载所有工序的详情
      for (const step of auditData.value.processSteps) {
        await loadStepDetails(step)
      }
      // 设置第一个工序为选中状态
      selectedStepId.value = auditData.value.processSteps[0].id
    }
  } catch (error) {
    console.error('获取审核记录详情失败:', error)
    ElMessage.error('获取审核记录详情失败')
  } finally {
    loading.value = false
  }
}

const handleBack = () => {
  router.push('/audit-manage/audit-record')
}

onMounted(async () => {
  await loadAuditData()
})
</script>

<template>
  <div class="audit-record-detail-container">
    <div class="detail-header">
      <div class="header-left">
        <el-button :icon="ArrowLeft" @click="handleBack">返回</el-button>
        <div class="title-area">
          <h2 class="page-title">{{ auditData.processName }}</h2>
          <span class="page-subtitle">审核记录详情</span>
        </div>
      </div>
    </div>

    <div v-loading="loading" class="detail-content">
      <div class="section-card">
        <div class="section-header">
          <span class="section-title">基本信息</span>
        </div>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">工艺编号</div>
            <div class="info-value">
              <el-tag size="default">{{ auditData.processCode }}</el-tag>
            </div>
          </div>
          <div class="info-item">
            <div class="info-label">工艺路线名称</div>
            <div class="info-value">{{ auditData.processName }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">版本</div>
            <div class="info-value">
              <el-tag type="primary" size="default">{{ auditData.version }}</el-tag>
            </div>
          </div>
          <div class="info-item">
            <div class="info-label">所属产品</div>
            <div class="info-value">{{ auditData.product }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">申请人</div>
            <div class="info-value">{{ auditData.applicant }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">提交时间</div>
            <div class="info-value">{{ auditData.submitTime }}</div>
          </div>
          <div class="info-item full-width">
            <div class="info-label">工艺描述</div>
            <div class="info-value">{{ auditData.description || '暂无' }}</div>
          </div>
        </div>
      </div>

      <div class="section-card process-config-card">
        <div class="section-header">
          <span class="section-title">工艺路线配置</span>
        </div>
        <div class="process-layout">
          <div class="steps-panel">
            <div class="panel-header">工序列表</div>
            <div class="steps-list">
              <div
                v-for="(element, index) in currentProcessSteps"
                :key="element.id"
                class="step-card"
                :class="{ active: selectedStepId === element.id }"
                @click="handleSelectStep(element)"
              >
                <div class="step-card-header">
                  <span class="step-order">步骤 {{ index + 1 }}</span>
                </div>
                <div class="step-card-name">
                  {{ element.stepName || '未命名工序' }}
                </div>
                <div class="step-card-code">
                  <el-tag size="small" type="info">{{ element.processCode }}</el-tag>
                </div>
                <div class="step-card-summary">
                  <el-tag size="small" type="primary" v-if="element.devices?.length">
                    <el-icon><Monitor /></el-icon> {{ element.devices.length }}
                  </el-tag>
                  <el-tag size="small" type="success" v-if="element.operators?.length">
                    <el-icon><User /></el-icon> {{ element.operators.length }}
                  </el-tag>
                  <el-tag size="small" type="warning" v-if="element.bom?.childMaterials?.length">
                    <el-icon><Box /></el-icon> {{ element.bom.childMaterials.length }}
                  </el-tag>
                </div>
              </div>
            </div>

            <div v-if="currentProcessSteps.length === 0" class="empty-steps">暂无工序</div>
          </div>

          <div class="detail-panel">
            <div class="panel-header">工序详情</div>
            <div v-if="selectedStep" class="step-detail-content">
              <div class="step-basic-info">
                <div class="info-item">
                  <span class="label">工序编号：</span>
                  <el-tag>{{ selectedStep.processCode }}</el-tag>
                </div>
                <div class="info-item">
                  <span class="label">工序名称：</span>
                  <span class="value">{{ selectedStep.stepName }}</span>
                </div>
                <div class="info-item full-width">
                  <span class="label">工序描述：</span>
                  <span class="value">{{ selectedStep.description || '暂无描述' }}</span>
                </div>
              </div>

              <div class="detail-tabs">
                <div
                  class="tab-item"
                  :class="{ active: activeDetailTab === 'devices' }"
                  @click="activeDetailTab = 'devices'"
                >
                  <el-icon><Monitor /></el-icon>
                  <span>设备使用情况</span>
                </div>
                <div
                  class="tab-item"
                  :class="{ active: activeDetailTab === 'operators' }"
                  @click="activeDetailTab = 'operators'"
                >
                  <el-icon><User /></el-icon>
                  <span>操作人员</span>
                </div>
                <div
                  class="tab-item"
                  :class="{ active: activeDetailTab === 'bom' }"
                  @click="activeDetailTab = 'bom'"
                >
                  <el-icon><Box /></el-icon>
                  <span>物料</span>
                </div>
              </div>

              <div class="detail-content">
                <div v-show="activeDetailTab === 'devices'" class="tab-content">
                  <div v-if="selectedStep.devices?.length" class="data-table-container">
                    <el-table :data="selectedStep.devices" border size="small">
                      <el-table-column prop="deviceCode" label="设备编码" width="130" />
                      <el-table-column prop="deviceName" label="设备名称" width="150" />
                      <el-table-column prop="manufacturer" label="生产厂家" width="180" />
                      <el-table-column prop="brand" label="品牌" width="100" />
                      <el-table-column prop="specModel" label="规格型号" width="150" />
                      <el-table-column prop="supplier" label="供应商" width="180" />
                      <el-table-column label="生产日期" width="150">
                        <template #default="{ row }">
                          {{ formatDateTime(row.productionDate) }}
                        </template>
                      </el-table-column>
                      <el-table-column prop="serviceLife" label="使用年限" width="100" />
                      <el-table-column label="折旧方式" width="100">
                        <template #default="{ row }">
                          {{ getDepreciationLabel(row.depreciationMethod) }}
                        </template>
                      </el-table-column>
                      <el-table-column prop="location" label="位置" width="100" />
                      <el-table-column prop="stockQuantity" label="库存数量" width="100" />
                      <el-table-column label="单位" width="80">
                        <template #default="{ row }">
                          {{ getUnitLabel(row.unit) }}
                        </template>
                      </el-table-column>
                    </el-table>
                  </div>
                  <el-empty v-else description="该工序暂无关联设备" />
                </div>

                <div v-show="activeDetailTab === 'operators'" class="tab-content">
                  <div v-if="selectedStep.operators?.length" class="data-table-container">
                    <el-table :data="selectedStep.operators" border size="small">
                      <el-table-column prop="employeeCode" label="工号" width="150" />
                      <el-table-column prop="employeeName" label="姓名" width="120" />
                      <el-table-column prop="deptName" label="所属部门" width="150" />
                      <el-table-column prop="position" label="岗位" width="120" />
                    </el-table>
                  </div>
                  <el-empty v-else description="该工序暂无关联操作人员" />
                </div>

                <div v-show="activeDetailTab === 'bom'" class="tab-content">
                  <div v-if="selectedStep.bom?.childMaterials?.length" class="bom-section">
                    <div class="data-table-container">
                      <el-table :data="selectedStep.bom.childMaterials" border size="small">
                        <el-table-column prop="materialCode" label="物料编号" width="120" />
                        <el-table-column prop="materialName" label="物料名称" width="150" />
                        <el-table-column prop="specModel" label="规格型号" width="120" />
                        <el-table-column prop="quantity" label="支出数量" width="100" />
                        <el-table-column label="单位" width="80">
                          <template #default="{ row }">
                            {{ getUnitLabel(row.unit) }}
                          </template>
                        </el-table-column>
                        <el-table-column prop="stockQuantity" label="库存数量" width="100" />
                        <el-table-column prop="supplier" label="供应商" width="150" />
                        <el-table-column prop="version" label="版本号" width="80" />
                        <el-table-column prop="category" label="分类" width="120" />
                        <el-table-column prop="location" label="位置" width="100" />
                      </el-table>
                    </div>
                  </div>

                  <el-empty
                    v-if="!selectedStep.bom?.childMaterials?.length"
                    description="该工序暂无关联物料"
                  />
                </div>
              </div>
            </div>
            <div v-else class="empty-detail">
              <el-empty description="请在左侧选择一个工序" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.audit-record-detail-container {
  padding: 2px;

  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 10px 18px;
    background: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

    .header-left {
      display: flex;
      align-items: center;
      gap: 20px;

      .title-area {
        .page-title {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
          color: #303133;
          line-height: 1.3;
        }

        .page-subtitle {
          font-size: 16px;
          color: #909399;
        }
      }
    }

    .header-right {
      display: flex;
      gap: 12px;

      .el-tag {
        font-size: 16px;
        padding: 8px 16px;
      }
    }
  }

  .detail-content {
    .section-card {
      background: #fff;
      border-radius: 4px;
      margin-bottom: 20px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      overflow: hidden;

      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 24px;
        border-bottom: 1px solid #ebeef5;

        .section-title {
          font-size: 22px;
          font-weight: 600;
          color: #303133;
          position: relative;
          padding-left: 12px;

          &::before {
            content: '';
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            width: 4px;
            height: 16px;
            background: #409eff;
            border-radius: 2px;
          }
        }
      }

      .info-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1px;
        background: #ebeef5;
        padding: 1px;

        .info-item {
          display: flex;
          align-items: stretch;
          background: #fff;
          min-height: 60px;

          &.full-width {
            grid-column: span 3;
          }

          .info-label {
            width: 120px;
            padding: 18px 20px;
            background: #fafafa;
            font-size: 18px;
            color: #606266;
            display: flex;
            align-items: center;
            flex-shrink: 0;
            font-weight: 500;
          }

          .info-value {
            flex: 1;
            padding: 18px 20px;
            font-size: 16px;
            color: #303133;
            display: flex;
            align-items: center;
          }
        }
      }

      .process-layout {
        display: flex;
        height: 650px;
        border-top: 1px solid #ebeef5;

        .steps-panel {
          width: 360px;
          min-width: 360px;
          max-width: 360px;
          border-right: 1px solid #ebeef5;
          display: flex;
          flex-direction: column;

          .panel-header {
            padding: 16px 20px;
            background: #f5f7fa;
            font-size: 15px;
            font-weight: 600;
            color: #303133;
            border-bottom: 1px solid #ebeef5;
          }

          .steps-list {
            flex: 1;
            overflow-y: auto;
            padding: 12px;

            .step-card {
              border: 1px solid #ebeef5;
              border-radius: 6px;
              margin-bottom: 12px;
              background: #fafafa;
              cursor: pointer;
              transition: all 0.2s;
              width: 100%;
              min-width: 0;
              box-sizing: border-box;
              overflow: hidden;

              &:hover {
                border-color: #409eff;
                box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
              }

              &.active {
                border-color: #409eff;
                background: #ecf5ff;
                box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
              }

              .step-card-header {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 10px 14px;
                border-bottom: 1px solid #ebeef5;
                background: #f5f7fa;
                min-width: 0;

                .step-card.active & {
                  background: #d9ecff;
                }

                .step-order {
                  font-size: 14px;
                  font-weight: 600;
                  color: #303133;
                  flex: 1;
                  white-space: nowrap;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  min-width: 0;
                }
              }

              .step-card-name {
                padding: 12px 14px;
                font-size: 15px;
                color: #303133;
                font-weight: 500;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              }

              .step-card-code {
                padding: 0 14px;
                margin-bottom: 8px;
              }

              .step-card-summary {
                padding: 0 14px 12px;
                display: flex;
                gap: 8px;
                flex-wrap: wrap;

                .el-tag {
                  display: inline-flex;
                  align-items: center;
                  gap: 4px;
                  flex-shrink: 0;
                  max-width: 100%;
                }
              }
            }
          }

          .empty-steps {
            text-align: center;
            color: #909399;
            padding: 40px 20px;
            background: #fafafa;
            margin: 12px;
            border-radius: 6px;
            border: 1px dashed #ebeef5;
          }
        }

        .detail-panel {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          background: #fff;
          overflow: hidden;

          .panel-header {
            padding: 16px 24px;
            background: #f5f7fa;
            font-size: 15px;
            font-weight: 600;
            color: #303133;
            border-bottom: 1px solid #ebeef5;
          }

          .step-detail-content {
            flex: 1;
            min-width: 0;
            overflow-x: auto;
            overflow-y: auto;
            padding: 20px;

            .step-basic-info {
              display: flex;
              flex-wrap: wrap;
              gap: 16px;
              padding: 16px;
              background: #f5f7fa;
              border-radius: 8px;
              margin-bottom: 20px;

              .info-item {
                display: flex;
                align-items: center;
                gap: 8px;

                &.full-width {
                  width: 100%;
                }

                .label {
                  color: #909399;
                  font-size: 14px;
                }

                .value {
                  color: #303133;
                  font-size: 14px;
                }
              }
            }

            .detail-tabs {
              display: flex;
              gap: 0;
              border-bottom: 1px solid #ebeef5;
              margin-bottom: 20px;

              .tab-item {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 12px 24px;
                cursor: pointer;
                color: #606266;
                font-size: 14px;
                font-weight: 500;
                border-bottom: 2px solid transparent;
                transition: all 0.2s;

                &:hover {
                  color: #409eff;
                }

                &.active {
                  color: #409eff;
                  border-bottom-color: #409eff;
                }
              }
            }

            .detail-content {
              width: 100%;
              min-width: 0;

              .tab-content {
                width: 100%;
                min-width: 0;

                .data-table-container {
                  width: 100% !important;
                  border: 1px solid #ebeef5;
                  border-radius: 4px;
                  box-sizing: border-box;

                  :deep(.el-table) {
                    width: 100% !important;
                  }

                  :deep(.el-table__body-wrapper) {
                    overflow-x: auto !important;

                    &::-webkit-scrollbar {
                      height: 8px;
                    }

                    &::-webkit-scrollbar-thumb {
                      background: #c0c4cc;
                      border-radius: 4px;
                    }

                    &::-webkit-scrollbar-track {
                      background: #f5f7fa;
                    }
                  }

                  :deep(.el-input__inner) {
                    padding: 0 8px;
                  }
                }

                .bom-section {
                  margin-bottom: 24px;

                  .bom-section-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: #303133;
                    margin-bottom: 12px;
                    padding-left: 10px;
                    border-left: 3px solid #409eff;
                  }

                  .material-info-card {
                    background: #f5f7fa;
                    padding: 16px;
                    border-radius: 8px;

                    .info-row {
                      display: flex;
                      gap: 24px;
                      margin-bottom: 12px;

                      &:last-child {
                        margin-bottom: 0;
                      }

                      .info-col {
                        display: flex;
                        align-items: center;
                        gap: 8px;

                        .label {
                          color: #909399;
                          font-size: 13px;
                        }

                        .value {
                          color: #303133;
                          font-size: 13px;
                        }
                      }
                    }
                  }
                }
              }
            }
          }

          .empty-detail {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        }
      }

      .reject-reason {
        padding: 20px;
        border-top: 1px solid #ebeef5;

        .reject-label {
          font-size: 18px;
          color: #f56c6c;
          margin-bottom: 12px;
          font-weight: 500;
        }

        .reject-content {
          background: #fef0f0;
          border-radius: 4px;
          padding: 16px;
          border: 1px solid #fbc4c4;

          .content-pre {
            margin: 0;
            white-space: pre-wrap;
            word-wrap: break-word;
            font-family: inherit;
            line-height: 1.8;
            font-size: 16px;
            color: #f56c6c;
          }
        }
      }
    }
  }
}

@media screen and (max-width: 1200px) {
  .audit-record-detail-container {
    .detail-content {
      .section-card {
        .info-grid {
          grid-template-columns: repeat(2, 1fr);

          .info-item.full-width {
            grid-column: span 2;
          }
        }
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .audit-record-detail-container {
    .detail-content {
      .section-card {
        .info-grid {
          grid-template-columns: 1fr;

          .info-item.full-width {
            grid-column: span 1;
          }
        }

        .process-layout {
          flex-direction: column;
          height: auto;

          .steps-panel {
            width: 100%;
            height: 300px;
            border-right: none;
            border-bottom: 1px solid #ebeef5;
          }
        }
      }
    }
  }
}
</style>
