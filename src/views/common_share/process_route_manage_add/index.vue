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
      {
        id: 1,
        deviceCode: 'DEV001',
        deviceName: '数控车床A',
        manufacturer: '西门子工业自动化有限公司',
        brand: '西门子',
        specModel: 'CNC-800',
        supplier: '北京华工设备贸易有限公司',
        productionDate: '2022-03-15',
        serviceLife: 15,
        depreciationMethod: '直线法',
        location: '一车间',
        stockQuantity: 5,
        unit: '台',
      },
      {
        id: 2,
        deviceCode: 'DEV002',
        deviceName: '数控车床B',
        manufacturer: '三菱电机自动化有限公司',
        brand: '三菱',
        specModel: 'MC-500',
        supplier: '上海精密机械有限公司',
        productionDate: '2021-06-20',
        serviceLife: 12,
        depreciationMethod: '年数总和法',
        location: '一车间',
        stockQuantity: 3,
        unit: '台',
      },
    ],
    operators: [
      {
        id: 1,
        employeeCode: 'EMP20240001',
        employeeName: '张三',
        deptName: '技术部',
        position: '工程师',
      },
      {
        id: 2,
        employeeCode: 'EMP20240002',
        employeeName: '李四',
        deptName: '生产部',
        position: '操作工',
      },
    ],
    bom: {
      parentMaterial: {
        materialCode: 'MAT001',
        materialName: '碳钢圆棒',
        specModel: 'Q235B-Φ50',
        stockQuantity: 100,
        supplier: '宝钢集团',
        version: 'V1.0',
        category: '金属材料',
        location: '原料仓A区',
      },
      childMaterials: [
        {
          materialCode: 'MAT002',
          materialName: '切削液',
          specModel: '标准型',
          quantity: 5,
          unit: '升',
          stockQuantity: 500,
          supplier: '中石化润滑油公司',
          version: 'V2.0',
          category: '辅料',
          location: '辅料仓',
        },
        {
          materialCode: 'MAT003',
          materialName: '刀具',
          specModel: 'CNMG120408',
          quantity: 2,
          unit: '把',
          stockQuantity: 200,
          supplier: '株洲钻石切削刀具股份有限公司',
          version: 'V1.0',
          category: '工具',
          location: '工具仓',
        },
      ],
    },
  },
  {
    id: 2,
    processCode: 'PRC002',
    processName: '铣削加工',
    description: '对工件进行铣削加工处理',
    devices: [
      {
        id: 3,
        deviceCode: 'DEV003',
        deviceName: '数控铣床A',
        manufacturer: '欧姆龙自动化中心',
        brand: '欧姆龙',
        specModel: 'MX-300',
        supplier: '广州机电设备有限公司',
        productionDate: '2023-01-10',
        serviceLife: 10,
        depreciationMethod: '直线法',
        location: '二车间',
        stockQuantity: 8,
        unit: '台',
      },
    ],
    operators: [
      {
        id: 3,
        employeeCode: 'EMP20240003',
        employeeName: '王五',
        deptName: '质量部',
        position: '质检员',
      },
    ],
    bom: {
      parentMaterial: {
        materialCode: 'MAT004',
        materialName: '铝合金板',
        specModel: '6061-T6-10mm',
        stockQuantity: 50,
        supplier: '南山铝业',
        version: 'V1.0',
        category: '金属材料',
        location: '原料仓B区',
      },
      childMaterials: [
        {
          materialCode: 'MAT002',
          materialName: '切削液',
          specModel: '标准型',
          quantity: 3,
          unit: '升',
          stockQuantity: 500,
          supplier: '中石化润滑油公司',
          version: 'V2.0',
          category: '辅料',
          location: '辅料仓',
        },
        {
          materialCode: 'MAT005',
          materialName: '铣刀',
          specModel: 'Φ20端铣刀',
          quantity: 1,
          unit: '把',
          stockQuantity: 150,
          supplier: '株洲钻石切削刀具股份有限公司',
          version: 'V1.0',
          category: '工具',
          location: '工具仓',
        },
      ],
    },
  },
  {
    id: 3,
    processCode: 'PRC003',
    processName: '钻孔工序',
    description: '对工件进行钻孔加工',
    devices: [
      {
        id: 4,
        deviceCode: 'DEV004',
        deviceName: '钻床A',
        manufacturer: '西门子工业自动化有限公司',
        brand: '西门子',
        specModel: 'DRILL-200',
        supplier: '北京华工设备贸易有限公司',
        productionDate: '2022-05-10',
        serviceLife: 12,
        depreciationMethod: '直线法',
        location: '一车间',
        stockQuantity: 10,
        unit: '台',
      },
      {
        id: 5,
        deviceCode: 'DEV005',
        deviceName: '钻床B',
        manufacturer: '三菱电机自动化有限公司',
        brand: '三菱',
        specModel: 'DRILL-300',
        supplier: '上海精密机械有限公司',
        productionDate: '2020-08-15',
        serviceLife: 15,
        depreciationMethod: '年数总和法',
        location: '一车间',
        stockQuantity: 6,
        unit: '台',
      },
    ],
    operators: [
      {
        id: 4,
        employeeCode: 'EMP20240004',
        employeeName: '赵六',
        deptName: '采购部',
        position: '采购员',
      },
    ],
    bom: {
      parentMaterial: {
        materialCode: 'MAT006',
        materialName: '钢板',
        specModel: 'Q345B-20mm',
        stockQuantity: 80,
        supplier: '武钢集团',
        version: 'V1.0',
        category: '金属材料',
        location: '原料仓A区',
      },
      childMaterials: [
        {
          materialCode: 'MAT007',
          materialName: '钻头',
          specModel: 'Φ10标准钻头',
          quantity: 3,
          unit: '支',
          stockQuantity: 300,
          supplier: '株洲钻石切削刀具股份有限公司',
          version: 'V1.0',
          category: '工具',
          location: '工具仓',
        },
      ],
    },
  },
  {
    id: 4,
    processCode: 'PRC004',
    processName: '磨削精加工',
    description: '对工件表面进行精密磨削',
    devices: [
      {
        id: 6,
        deviceCode: 'DEV006',
        deviceName: '精密磨床',
        manufacturer: '西门子工业自动化有限公司',
        brand: '西门子',
        specModel: 'GRIND-600',
        supplier: '北京华工设备贸易有限公司',
        productionDate: '2021-12-01',
        serviceLife: 18,
        depreciationMethod: '直线法',
        location: '三车间',
        stockQuantity: 2,
        unit: '台',
      },
    ],
    operators: [
      {
        id: 5,
        employeeCode: 'EMP20240005',
        employeeName: '孙七',
        deptName: '销售部',
        position: '销售员',
      },
    ],
    bom: {
      parentMaterial: {
        materialCode: 'MAT008',
        materialName: '精密轴',
        specModel: 'GCr15-Φ30',
        stockQuantity: 30,
        supplier: '东北特钢',
        version: 'V1.0',
        category: '金属材料',
        location: '原料仓C区',
      },
      childMaterials: [
        {
          materialCode: 'MAT009',
          materialName: '砂轮',
          specModel: 'WA60K',
          quantity: 1,
          unit: '个',
          stockQuantity: 50,
          supplier: '白鸽磨料磨具有限公司',
          version: 'V1.0',
          category: '耗材',
          location: '耗材仓',
        },
        {
          materialCode: 'MAT010',
          materialName: '冷却液',
          specModel: '磨削专用',
          quantity: 2,
          unit: '升',
          stockQuantity: 200,
          supplier: '中石化润滑油公司',
          version: 'V1.0',
          category: '辅料',
          location: '辅料仓',
        },
      ],
    },
  },
  {
    id: 5,
    processCode: 'PRC005',
    processName: '质量检测',
    description: '对产品进行质量检验',
    devices: [
      {
        id: 7,
        deviceCode: 'DEV007',
        deviceName: '三坐标测量仪',
        manufacturer: 'ABB自动化有限公司',
        brand: 'ABB',
        specModel: 'CMM-1000',
        supplier: '深圳精密仪器有限公司',
        productionDate: '2020-03-20',
        serviceLife: 20,
        depreciationMethod: '直线法',
        location: '质检中心',
        stockQuantity: 1,
        unit: '台',
      },
      {
        id: 8,
        deviceCode: 'DEV008',
        deviceName: '硬度计',
        manufacturer: '施耐德电气有限公司',
        brand: '施耐德',
        specModel: 'HARD-500',
        supplier: '广州机电设备有限公司',
        productionDate: '2022-09-15',
        serviceLife: 15,
        depreciationMethod: '年数总和法',
        location: '质检中心',
        stockQuantity: 3,
        unit: '台',
      },
    ],
    operators: [
      {
        id: 6,
        employeeCode: 'EMP20240006',
        employeeName: '周八',
        deptName: '财务部',
        position: '会计',
      },
      {
        id: 7,
        employeeCode: 'EMP20240007',
        employeeName: '吴九',
        deptName: '人力资源部',
        position: '人事专员',
      },
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
      {
        id: 9,
        deviceCode: 'DEV009',
        deviceName: '热处理炉A',
        manufacturer: '西门子工业自动化有限公司',
        brand: '西门子',
        specModel: 'HEAT-1200',
        supplier: '北京华工设备贸易有限公司',
        productionDate: '2019-11-05',
        serviceLife: 25,
        depreciationMethod: '直线法',
        location: '热处理车间',
        stockQuantity: 2,
        unit: '台',
      },
    ],
    operators: [
      {
        id: 8,
        employeeCode: 'EMP20240008',
        employeeName: '郑十',
        deptName: '技术部',
        position: '技术员',
      },
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
      {
        id: 10,
        deviceCode: 'DEV010',
        deviceName: '电镀设备',
        manufacturer: '三菱电机自动化有限公司',
        brand: '三菱',
        specModel: 'ELECTRO-800',
        supplier: '上海精密机械有限公司',
        productionDate: '2021-04-20',
        serviceLife: 15,
        depreciationMethod: '年数总和法',
        location: '表面处理车间',
        stockQuantity: 1,
        unit: '台',
      },
    ],
    operators: [
      {
        id: 9,
        employeeCode: 'EMP20240009',
        employeeName: '钱十一',
        deptName: '生产部',
        position: '主管',
      },
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
        {
          materialCode: 'MAT013',
          materialName: '电镀液',
          specModel: '镀锌液',
          quantity: 10,
          unit: '升',
        },
      ],
    },
  },
  {
    id: 8,
    processCode: 'PRC008',
    processName: '组装工序',
    description: '产品组装装配',
    devices: [
      {
        id: 11,
        deviceCode: 'DEV011',
        deviceName: '组装台A',
        manufacturer: '欧姆龙自动化中心',
        brand: '欧姆龙',
        specModel: 'ASSEMBLE-500',
        supplier: '广州机电设备有限公司',
        productionDate: '2023-02-10',
        serviceLife: 10,
        depreciationMethod: '直线法',
        location: '组装车间',
        stockQuantity: 5,
        unit: '台',
      },
      {
        id: 12,
        deviceCode: 'DEV012',
        deviceName: '组装台B',
        manufacturer: '西门子工业自动化有限公司',
        brand: '西门子',
        specModel: 'ASSEMBLE-600',
        supplier: '北京华工设备贸易有限公司',
        productionDate: '2022-08-20',
        serviceLife: 12,
        depreciationMethod: '年数总和法',
        location: '组装车间',
        stockQuantity: 4,
        unit: '台',
      },
    ],
    operators: [
      {
        id: 10,
        employeeCode: 'EMP20240010',
        employeeName: '孙十二',
        deptName: '技术部',
        position: '经理',
      },
      {
        id: 11,
        employeeCode: 'EMP20240011',
        employeeName: '李十三',
        deptName: '质量部',
        position: '质检员',
      },
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
        {
          materialCode: 'MAT015',
          materialName: '螺丝',
          specModel: 'M8×20',
          quantity: 20,
          unit: '个',
        },
        {
          materialCode: 'MAT016',
          materialName: '密封圈',
          specModel: 'Φ25',
          quantity: 4,
          unit: '个',
        },
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
    callback(new Error('请输入工艺名称'))
    return
  }
  if (value.length < 2 || value.length > 50) {
    callback(new Error('工艺名称长度应在2-50个字符之间'))
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
            <el-form-item label="工艺名称" prop="routeName">
              <el-input v-model="formData.routeName" placeholder="请输入工艺名称" />
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
                      <el-tag
                        size="small"
                        type="warning"
                        v-if="element.bom?.childMaterials?.length"
                      >
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
                        <el-table-column prop="deviceCode" label="设备编码" width="120" />
                        <el-table-column prop="deviceName" label="设备名称" width="150" />
                        <el-table-column prop="manufacturer" label="生产厂家" width="180" />
                        <el-table-column prop="brand" label="品牌" width="100" />
                        <el-table-column prop="specModel" label="规格型号" width="120" />
                        <el-table-column prop="supplier" label="供应商" width="180" />
                        <el-table-column prop="productionDate" label="生产日期" width="120" />
                        <el-table-column prop="serviceLife" label="使用年限" width="100" />
                        <el-table-column prop="depreciationMethod" label="折旧方式" width="100" />
                        <el-table-column prop="location" label="位置" width="100" />
                        <el-table-column prop="stockQuantity" label="库存数量" width="100" />
                        <el-table-column prop="unit" label="单位" width="80" />
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
                    <div v-if="selectedStep.bom?.parentMaterial" class="bom-section">
                      <div class="bom-section-title">父物料信息</div>
                      <div class="material-info-card">
                        <div class="info-row">
                          <div class="info-col">
                            <span class="label">物料编号：</span>
                            <el-tag size="small">{{
                              selectedStep.bom.parentMaterial.materialCode
                            }}</el-tag>
                          </div>
                          <div class="info-col">
                            <span class="label">物料名称：</span>
                            <span class="value">{{
                              selectedStep.bom.parentMaterial.materialName
                            }}</span>
                          </div>
                          <div class="info-col">
                            <span class="label">规格型号：</span>
                            <span class="value">{{
                              selectedStep.bom.parentMaterial.specModel
                            }}</span>
                          </div>
                          <div class="info-col">
                            <span class="label">库存数量：</span>
                            <span class="value">{{
                              selectedStep.bom.parentMaterial.stockQuantity
                            }}</span>
                          </div>
                        </div>
                        <div class="info-row">
                          <div class="info-col">
                            <span class="label">供应商：</span>
                            <span class="value">{{
                              selectedStep.bom.parentMaterial.supplier
                            }}</span>
                          </div>
                          <div class="info-col">
                            <span class="label">版本号：</span>
                            <el-tag size="small" type="success">{{
                              selectedStep.bom.parentMaterial.version
                            }}</el-tag>
                          </div>
                          <div class="info-col">
                            <span class="label">分类：</span>
                            <el-tag size="small" type="info">{{
                              selectedStep.bom.parentMaterial.category
                            }}</el-tag>
                          </div>
                          <div class="info-col">
                            <span class="label">位置：</span>
                            <el-tag size="small" type="warning">{{
                              selectedStep.bom.parentMaterial.location
                            }}</el-tag>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div v-if="selectedStep.bom?.childMaterials?.length" class="bom-section">
                      <div class="bom-section-title">子物料清单</div>
                      <div class="data-table-container">
                        <el-table :data="selectedStep.bom.childMaterials" border size="small">
                          <el-table-column prop="materialCode" label="物料编号" width="120" />
                          <el-table-column prop="materialName" label="物料名称" width="150" />
                          <el-table-column prop="specModel" label="规格型号" width="120" />
                          <el-table-column prop="quantity" label="支出数量" width="100" />
                          <el-table-column prop="unit" label="单位" width="80" />
                          <el-table-column prop="stockQuantity" label="库存数量" width="100" />
                          <el-table-column prop="supplier" label="供应商" width="150" />
                          <el-table-column prop="version" label="版本号" width="80" />
                          <el-table-column prop="category" label="分类" width="120" />
                          <el-table-column prop="location" label="位置" width="100" />
                        </el-table>
                      </div>
                    </div>

                    <el-empty
                      v-if="
                        !selectedStep.bom?.parentMaterial &&
                        !selectedStep.bom?.childMaterials?.length
                      "
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
              width: 100%;
              min-width: 0;
              box-sizing: border-box;
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
                  width: 100%;
                  border: 1px solid #ebeef5;
                  border-radius: 4px;

                  :deep(.el-table) {
                    width: 100%;
                  }

                  :deep(.el-table__body-wrapper) {
                    overflow-x: auto;

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
