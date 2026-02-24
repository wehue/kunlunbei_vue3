<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Rank, Plus, Delete, Monitor, User, Box } from '@element-plus/icons-vue'
import draggable from 'vuedraggable'
import { useUserStore } from '@/stores/modules/user'

const router = useRouter()
const userStore = useUserStore()

const formRef = ref()
const currentRole = computed(() => userStore.userInfo.role || 'admin')

const productOptions = [
  { label: '汽车零部件A', value: '汽车零部件A' },
  { label: '电子设备B', value: '电子设备B' },
  { label: '管道组件C', value: '管道组件C' },
  { label: '机械零件D', value: '机械零件D' },
]

const existingProcesses = [
  {
    id: 1,
    processCode: 'PRC001',
    processName: '车削加工',
    description: '对工件进行车削加工处理',
    devices: [
      { id: 1, deviceCode: 'DEV001', deviceName: '数控车床A', status: '运行中', dept: '一车间' },
      { id: 2, deviceCode: 'DEV002', deviceName: '数控车床B', status: '空闲', dept: '一车间' },
    ],
    operators: [
      { id: 1, userCode: 'U001', userName: '张三', skill: '高级车工', phone: '13800138001' },
      { id: 2, userCode: 'U002', userName: '李四', skill: '中级车工', phone: '13800138002' },
    ],
    bom: {
      parentMaterial: {
        materialCode: 'MAT001',
        materialName: '碳钢圆棒',
        specModel: 'Q235B-Φ50',
        category: '金属材料',
        unit: '根',
        stock: 100,
      },
      childMaterials: [
        { materialCode: 'MAT002', materialName: '切削液', specModel: '标准型', quantity: 5, unit: '升' },
        { materialCode: 'MAT003', materialName: '刀具', specModel: 'CNMG120408', quantity: 2, unit: '把' },
      ],
    },
  },
  {
    id: 2,
    processCode: 'PRC002',
    processName: '铣削加工',
    description: '对工件进行铣削加工处理',
    devices: [
      { id: 3, deviceCode: 'DEV003', deviceName: '数控铣床A', status: '运行中', dept: '二车间' },
    ],
    operators: [
      { id: 3, userCode: 'U003', userName: '王五', skill: '高级铣工', phone: '13800138003' },
    ],
    bom: {
      parentMaterial: {
        materialCode: 'MAT004',
        materialName: '铝合金板',
        specModel: '6061-T6-10mm',
        category: '金属材料',
        unit: '件',
        stock: 50,
      },
      childMaterials: [
        { materialCode: 'MAT002', materialName: '切削液', specModel: '标准型', quantity: 3, unit: '升' },
        { materialCode: 'MAT005', materialName: '铣刀', specModel: 'Φ20端铣刀', quantity: 1, unit: '把' },
      ],
    },
  },
  {
    id: 3,
    processCode: 'PRC003',
    processName: '钻孔工序',
    description: '对工件进行钻孔加工',
    devices: [
      { id: 4, deviceCode: 'DEV004', deviceName: '钻床A', status: '空闲', dept: '一车间' },
      { id: 5, deviceCode: 'DEV005', deviceName: '钻床B', status: '维修中', dept: '一车间' },
    ],
    operators: [
      { id: 4, userCode: 'U004', userName: '赵六', skill: '中级钻工', phone: '13800138004' },
    ],
    bom: {
      parentMaterial: {
        materialCode: 'MAT006',
        materialName: '钢板',
        specModel: 'Q345B-20mm',
        category: '金属材料',
        unit: '件',
        stock: 80,
      },
      childMaterials: [
        { materialCode: 'MAT007', materialName: '钻头', specModel: 'Φ10标准钻头', quantity: 3, unit: '支' },
      ],
    },
  },
  {
    id: 4,
    processCode: 'PRC004',
    processName: '磨削精加工',
    description: '对工件表面进行精密磨削',
    devices: [
      { id: 6, deviceCode: 'DEV006', deviceName: '精密磨床', status: '运行中', dept: '三车间' },
    ],
    operators: [
      { id: 5, userCode: 'U005', userName: '孙七', skill: '高级磨工', phone: '13800138005' },
    ],
    bom: {
      parentMaterial: {
        materialCode: 'MAT008',
        materialName: '精密轴',
        specModel: 'GCr15-Φ30',
        category: '金属材料',
        unit: '根',
        stock: 30,
      },
      childMaterials: [
        { materialCode: 'MAT009', materialName: '砂轮', specModel: 'WA60K', quantity: 1, unit: '个' },
        { materialCode: 'MAT010', materialName: '冷却液', specModel: '磨削专用', quantity: 2, unit: '升' },
      ],
    },
  },
  {
    id: 5,
    processCode: 'PRC005',
    processName: '质量检测',
    description: '对产品进行质量检验',
    devices: [
      { id: 7, deviceCode: 'DEV007', deviceName: '三坐标测量仪', status: '空闲', dept: '质检中心' },
      { id: 8, deviceCode: 'DEV008', deviceName: '硬度计', status: '运行中', dept: '质检中心' },
    ],
    operators: [
      { id: 6, userCode: 'U006', userName: '周八', skill: '质检员', phone: '13800138006' },
      { id: 7, userCode: 'U007', userName: '吴九', skill: '质检员', phone: '13800138007' },
    ],
    bom: {
      parentMaterial: null,
      childMaterials: [],
    },
  },
  {
    id: 6,
    processCode: 'PRC006',
    processName: '热处理',
    description: '对工件进行热处理工艺',
    devices: [
      { id: 9, deviceCode: 'DEV009', deviceName: '热处理炉A', status: '运行中', dept: '热处理车间' },
    ],
    operators: [
      { id: 8, userCode: 'U008', userName: '郑十', skill: '热处理工', phone: '13800138008' },
    ],
    bom: {
      parentMaterial: {
        materialCode: 'MAT011',
        materialName: '待处理件',
        specModel: '标准件',
        category: '半成品',
        unit: '件',
        stock: 200,
      },
      childMaterials: [],
    },
  },
  {
    id: 7,
    processCode: 'PRC007',
    processName: '表面处理',
    description: '对工件表面进行处理',
    devices: [
      { id: 10, deviceCode: 'DEV010', deviceName: '电镀设备', status: '空闲', dept: '表面处理车间' },
    ],
    operators: [
      { id: 9, userCode: 'U009', userName: '钱十一', skill: '表面处理工', phone: '13800138009' },
    ],
    bom: {
      parentMaterial: {
        materialCode: 'MAT012',
        materialName: '待处理件',
        specModel: '标准件',
        category: '半成品',
        unit: '件',
        stock: 150,
      },
      childMaterials: [
        { materialCode: 'MAT013', materialName: '电镀液', specModel: '镀锌液', quantity: 10, unit: '升' },
      ],
    },
  },
  {
    id: 8,
    processCode: 'PRC008',
    processName: '组装工序',
    description: '产品组装装配',
    devices: [
      { id: 11, deviceCode: 'DEV011', deviceName: '组装台A', status: '运行中', dept: '组装车间' },
      { id: 12, deviceCode: 'DEV012', deviceName: '组装台B', status: '空闲', dept: '组装车间' },
    ],
    operators: [
      { id: 10, userCode: 'U010', userName: '孙十二', skill: '装配工', phone: '13800138010' },
      { id: 11, userCode: 'U011', userName: '李十三', skill: '装配工', phone: '13800138011' },
    ],
    bom: {
      parentMaterial: {
        materialCode: 'MAT014',
        materialName: '组装套件',
        specModel: '标准套件',
        category: '半成品',
        unit: '套',
        stock: 60,
      },
      childMaterials: [
        { materialCode: 'MAT015', materialName: '螺丝', specModel: 'M8×20', quantity: 20, unit: '个' },
        { materialCode: 'MAT016', materialName: '密封圈', specModel: 'Φ25', quantity: 4, unit: '个' },
      ],
    },
  },
]

const formData = reactive({
  routeCode: '',
  routeName: '',
  product: '',
  description: '',
  version: 'V1.0',
  processSteps: [],
})

const selectedStepId = ref(null)
const activeDetailTab = ref('devices')
const processSelectDialogVisible = ref(false)

const selectedStep = computed(() => {
  return formData.processSteps.find((step) => step.id === selectedStepId.value) || null
})

const validateRouteName = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入工艺路线名称'))
    return
  }
  if (value.length < 2 || value.length > 50) {
    callback(new Error('工艺路线名称长度应在2-50个字符之间'))
  } else {
    callback()
  }
}

const validateProduct = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请选择所属产品'))
    return
  }
  callback()
}

const rules = {
  routeName: [{ required: true, validator: validateRouteName, trigger: 'blur' }],
  product: [{ required: true, validator: validateProduct, trigger: 'change' }],
}

const canSubmitAudit = computed(() => currentRole.value === 'designer')

const generateRouteCode = () => {
  const year = new Date().getFullYear()
  const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0')
  return `PR${year}${random}`
}

formData.routeCode = generateRouteCode()

const handleOpenProcessSelect = () => {
  processSelectDialogVisible.value = true
}

const handleSelectProcess = (process) => {
  const exists = formData.processSteps.some((s) => s.processId === process.id)
  if (exists) {
    ElMessage.warning('该工序已添加')
    return
  }

  const newStep = {
    id: Date.now(),
    processId: process.id,
    processCode: process.processCode,
    stepName: process.processName,
    description: process.description,
    devices: JSON.parse(JSON.stringify(process.devices || [])),
    operators: JSON.parse(JSON.stringify(process.operators || [])),
    bom: JSON.parse(JSON.stringify(process.bom || { parentMaterial: null, childMaterials: [] })),
  }
  formData.processSteps.push(newStep)
  selectedStepId.value = newStep.id
  processSelectDialogVisible.value = false
  ElMessage.success(`已添加工序：${process.processName}`)
}

const handleRemoveStep = (index) => {
  const step = formData.processSteps[index]
  if (selectedStepId.value === step.id) {
    selectedStepId.value = null
  }
  formData.processSteps.splice(index, 1)
}

const handleSelectStep = (step) => {
  selectedStepId.value = step.id
}

const handleUpdateDevice = (deviceIndex, field, value) => {
  if (selectedStep.value && selectedStep.value.devices[deviceIndex]) {
    selectedStep.value.devices[deviceIndex][field] = value
  }
}

const handleUpdateOperator = (operatorIndex, field, value) => {
  if (selectedStep.value && selectedStep.value.operators[operatorIndex]) {
    selectedStep.value.operators[operatorIndex][field] = value
  }
}

const handleBack = () => {
  ElMessageBox.confirm('确定要返回吗？未保存的数据将丢失', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      router.push('/process-route-manage/process-route-manage-info')
    })
    .catch(() => {})
}

const handleSave = () => {
  if (!formRef.value) return

  formRef.value.validate((valid) => {
    if (valid) {
      if (formData.processSteps.length === 0) {
        ElMessage.warning('请至少添加一个工艺流程步骤')
        return
      }

      ElMessage.success('保存成功，请前往详情页提交审核')
      router.push('/process-route-manage/process-route-manage-info')
    }
  })
}

const handleSubmitAudit = () => {
  if (!canSubmitAudit.value) {
    ElMessage.warning('您没有提交审核的权限')
    return
  }

  if (!formRef.value) return

  formRef.value.validate((valid) => {
    if (valid) {
      if (formData.processSteps.length === 0) {
        ElMessage.warning('请至少添加一个工艺流程步骤')
        return
      }

      ElMessageBox.confirm('确定要提交审核吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info',
      })
        .then(() => {
          ElMessage.success('提交审核成功，请等待审核')
          router.push('/process-route-manage/process-route-manage-info')
        })
        .catch(() => {})
    }
  })
}

const handleCancel = () => {
  handleBack()
}
</script>

<template>
  <div class="process-route-add-container">
    <div class="page-header">
      <div class="header-left">
        <el-button :icon="ArrowLeft" @click="handleBack">返回</el-button>
        <div class="title-area">
          <h2 class="page-title">新增工艺路线</h2>
        </div>
      </div>
      <div class="header-right">
        <el-button v-if="canSubmitAudit" type="success" @click="handleSubmitAudit"
          >提交审核</el-button
        >
        <el-button type="primary" @click="handleSave">保存</el-button>
        <el-button @click="handleCancel">取消</el-button>
      </div>
    </div>

    <div class="page-content">
      <el-form ref="formRef" :model="formData" :rules="rules" label-position="top">
        <div class="section-card basic-info-card">
          <div class="section-header">
            <span class="section-title">基本信息</span>
          </div>
          <div class="form-grid">
            <el-form-item label="工艺编号">
              <el-input v-model="formData.routeCode" disabled placeholder="系统自动生成" />
            </el-form-item>
            <el-form-item label="工艺路线名称" prop="routeName">
              <el-input v-model="formData.routeName" placeholder="请输入工艺路线名称" />
            </el-form-item>
            <el-form-item label="所属产品" prop="product">
              <el-select
                v-model="formData.product"
                placeholder="请选择所属产品"
                style="width: 100%"
              >
                <el-option
                  v-for="item in productOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="工艺描述" style="grid-column: span 2">
              <el-input
                v-model="formData.description"
                type="textarea"
                :rows="2"
                placeholder="请输入工艺描述"
              />
            </el-form-item>
            <el-form-item label="版本">
              <el-input v-model="formData.version" disabled placeholder="默认V1.0" />
            </el-form-item>
          </div>
        </div>

        <div class="section-card process-config-card">
          <div class="section-header">
            <span class="section-title">工艺路线配置</span>
            <el-button type="primary" :icon="Plus" @click="handleOpenProcessSelect"
              >从工序管理选择</el-button
            >
          </div>
          <div class="process-layout">
            <div class="steps-panel">
              <div class="panel-header">工序列表（拖拽调整顺序）</div>
              <draggable
                v-model="formData.processSteps"
                item-key="id"
                handle=".drag-handle"
                animation="300"
                class="steps-list"
              >
                <template #item="{ element, index }">
                  <div
                    class="step-card"
                    :class="{ active: selectedStepId === element.id }"
                    @click="handleSelectStep(element)"
                  >
                    <div class="step-card-header">
                      <div class="drag-handle">
                        <el-icon><Rank /></el-icon>
                      </div>
                      <span class="step-order">步骤 {{ index + 1 }}</span>
                      <el-button
                        type="danger"
                        link
                        :icon="Delete"
                        @click.stop="handleRemoveStep(index)"
                      />
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
                </template>
              </draggable>
              <div v-if="formData.processSteps.length === 0" class="empty-steps">
                暂无工序，点击上方按钮从工序管理中选择
              </div>
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
                    <span>物料BOM</span>
                  </div>
                </div>

                <div class="detail-content">
                  <div v-show="activeDetailTab === 'devices'" class="tab-content">
                    <div v-if="selectedStep.devices?.length" class="data-table-container">
                      <el-table :data="selectedStep.devices" border size="small">
                        <el-table-column prop="deviceCode" label="设备编号" width="120" />
                        <el-table-column prop="deviceName" label="设备名称" width="150">
                          <template #default="{ row, $index }">
                            <el-input
                              v-model="row.deviceName"
                              size="small"
                              @change="handleUpdateDevice($index, 'deviceName', row.deviceName)"
                            />
                          </template>
                        </el-table-column>
                        <el-table-column prop="status" label="状态" width="100">
                          <template #default="{ row }">
                            <el-tag
                              :type="
                                row.status === '运行中'
                                  ? 'success'
                                  : row.status === '空闲'
                                    ? 'info'
                                    : 'warning'
                              "
                              size="small"
                            >
                              {{ row.status }}
                            </el-tag>
                          </template>
                        </el-table-column>
                        <el-table-column prop="dept" label="所属部门" width="120">
                          <template #default="{ row, $index }">
                            <el-input
                              v-model="row.dept"
                              size="small"
                              @change="handleUpdateDevice($index, 'dept', row.dept)"
                            />
                          </template>
                        </el-table-column>
                      </el-table>
                    </div>
                    <el-empty v-else description="该工序暂无关联设备" />
                  </div>

                  <div v-show="activeDetailTab === 'operators'" class="tab-content">
                    <div v-if="selectedStep.operators?.length" class="data-table-container">
                      <el-table :data="selectedStep.operators" border size="small">
                        <el-table-column prop="userCode" label="工号" width="100" />
                        <el-table-column prop="userName" label="姓名" width="100">
                          <template #default="{ row, $index }">
                            <el-input
                              v-model="row.userName"
                              size="small"
                              @change="handleUpdateOperator($index, 'userName', row.userName)"
                            />
                          </template>
                        </el-table-column>
                        <el-table-column prop="skill" label="技能等级" width="120">
                          <template #default="{ row, $index }">
                            <el-input
                              v-model="row.skill"
                              size="small"
                              @change="handleUpdateOperator($index, 'skill', row.skill)"
                            />
                          </template>
                        </el-table-column>
                        <el-table-column prop="phone" label="联系电话" width="140">
                          <template #default="{ row, $index }">
                            <el-input
                              v-model="row.phone"
                              size="small"
                              @change="handleUpdateOperator($index, 'phone', row.phone)"
                            />
                          </template>
                        </el-table-column>
                      </el-table>
                    </div>
                    <el-empty v-else description="该工序暂无关联操作人员" />
                  </div>

                  <div v-show="activeDetailTab === 'bom'" class="tab-content">
                    <div v-if="selectedStep.bom?.parentMaterial" class="bom-section">
                      <div class="bom-section-title">父物料信息</div>
                      <div class="material-info-card">
                        <div class="info-row">
                          <div class="info-col">
                            <span class="label">物料编号：</span>
                            <el-tag size="small">{{ selectedStep.bom.parentMaterial.materialCode }}</el-tag>
                          </div>
                          <div class="info-col">
                            <span class="label">物料名称：</span>
                            <span class="value">{{ selectedStep.bom.parentMaterial.materialName }}</span>
                          </div>
                          <div class="info-col">
                            <span class="label">规格型号：</span>
                            <span class="value">{{ selectedStep.bom.parentMaterial.specModel }}</span>
                          </div>
                        </div>
                        <div class="info-row">
                          <div class="info-col">
                            <span class="label">物料分类：</span>
                            <el-tag size="small" type="info">{{ selectedStep.bom.parentMaterial.category }}</el-tag>
                          </div>
                          <div class="info-col">
                            <span class="label">计量单位：</span>
                            <span class="value">{{ selectedStep.bom.parentMaterial.unit }}</span>
                          </div>
                          <div class="info-col">
                            <span class="label">库存数量：</span>
                            <span class="value">{{ selectedStep.bom.parentMaterial.stock }}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div v-if="selectedStep.bom?.childMaterials?.length" class="bom-section">
                      <div class="bom-section-title">子物料清单</div>
                      <el-table :data="selectedStep.bom.childMaterials" border size="small">
                        <el-table-column prop="materialCode" label="物料编号" width="120" />
                        <el-table-column prop="materialName" label="物料名称" width="150" />
                        <el-table-column prop="specModel" label="规格型号" width="150" />
                        <el-table-column prop="quantity" label="数量" width="80" />
                        <el-table-column prop="unit" label="单位" width="80" />
                      </el-table>
                    </div>

                    <el-empty
                      v-if="!selectedStep.bom?.parentMaterial && !selectedStep.bom?.childMaterials?.length"
                      description="该工序暂无关联物料BOM"
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
      </el-form>
    </div>

    <el-dialog
      v-model="processSelectDialogVisible"
      title="选择工序"
      width="900px"
      top="5vh"
      class="process-select-dialog"
    >
      <div class="process-list">
        <div
          v-for="process in existingProcesses"
          :key="process.id"
          class="process-card"
          @click="handleSelectProcess(process)"
        >
          <div class="process-header">
            <div class="process-code">{{ process.processCode }}</div>
            <div class="process-name">{{ process.processName }}</div>
          </div>
          <div class="process-desc">{{ process.description }}</div>
          <div class="process-info">
            <el-tag size="small" type="primary">
              <el-icon><Monitor /></el-icon> {{ process.devices?.length || 0 }} 设备
            </el-tag>
            <el-tag size="small" type="success">
              <el-icon><User /></el-icon> {{ process.operators?.length || 0 }} 人员
            </el-tag>
            <el-tag size="small" type="warning">
              <el-icon><Box /></el-icon> {{ process.bom?.childMaterials?.length || 0 }} 物料
            </el-tag>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.process-route-add-container {
  padding: 2px;

  .page-header {
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
      }
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 12px;

      .el-button {
        padding: 10px 20px;
        font-size: 14px;
      }
    }
  }

  .page-content {
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

      .form-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px 32px;
        padding: 24px;

        :deep(.el-form-item) {
          margin-bottom: 0;

          .el-form-item__label {
            font-size: 16px;
            color: #606266;
            font-weight: 500;
            padding-bottom: 8px;
          }
        }
      }

      .process-layout {
        display: flex;
        height: 650px;
        border-top: 1px solid #ebeef5;

        .steps-panel {
          width: 320px;
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

                .step-card.active & {
                  background: #d9ecff;
                }

                .drag-handle {
                  cursor: move;
                  padding: 4px;
                  color: #909399;

                  &:hover {
                    color: #409eff;
                  }
                }

                .step-order {
                  font-size: 14px;
                  font-weight: 600;
                  color: #303133;
                  flex: 1;
                }
              }

              .step-card-name {
                padding: 12px 14px;
                font-size: 15px;
                color: #303133;
                font-weight: 500;
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
                  display: flex;
                  align-items: center;
                  gap: 4px;
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
          display: flex;
          flex-direction: column;
          background: #fff;

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
              .tab-content {
                .data-table-container {
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
    }
  }

  .process-select-dialog {
    .process-list {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      max-height: 60vh;
      overflow-y: auto;

      .process-card {
        border: 1px solid #ebeef5;
        border-radius: 8px;
        padding: 16px;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          border-color: #409eff;
          box-shadow: 0 2px 12px rgba(64, 158, 255, 0.15);
        }

        .process-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;

          .process-code {
            font-size: 12px;
            color: #909399;
            background: #f5f7fa;
            padding: 2px 8px;
            border-radius: 4px;
          }

          .process-name {
            font-size: 16px;
            font-weight: 600;
            color: #303133;
          }
        }

        .process-desc {
          font-size: 13px;
          color: #606266;
          margin-bottom: 12px;
          line-height: 1.5;
        }

        .process-info {
          display: flex;
          gap: 8px;

          .el-tag {
            display: flex;
            align-items: center;
            gap: 4px;
          }
        }
      }
    }
  }
}

@media screen and (max-width: 1200px) {
  .process-route-add-container {
    .page-content {
      .section-card {
        .form-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .process-route-add-container {
    .page-content {
      .section-card {
        .form-grid {
          grid-template-columns: 1fr;
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
