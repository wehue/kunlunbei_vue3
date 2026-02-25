<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Edit,
  ArrowLeft,
  Download,
  Check,
  Close,
  Rank,
  Plus,
  Delete,
  Monitor,
  User,
  Box,
} from '@element-plus/icons-vue'
import * as XLSX from 'xlsx'
import draggable from 'vuedraggable'
import { usePermission } from '@/hooks/usePermission'

const route = useRoute()
const router = useRouter()
const { isDesignerRole, isSupervisorRole } = usePermission()

const isEdit = ref(false)
const loading = ref(false)
const routeData = ref({})
const currentVersionId = ref(null)
const selectedStepId = ref(null)
const activeDetailTab = ref('devices')

const selectedStep = computed(() => {
  if (isEdit.value) {
    return formData.processSteps.find((step) => step.id === selectedStepId.value) || null
  }
  return routeData.value.processSteps?.find((step) => step.id === selectedStepId.value) || null
})

const auditDialogVisible = ref(false)
const auditForm = reactive({
  approved: true,
  reason: '',
})

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

const allRouteData = ref([
  {
    id: 1,
    routeCode: 'PR20240001',
    routeName: '汽车零部件加工工艺',
    product: '汽车零部件A',
    description: '用于汽车零部件的加工工艺路线',
    version: 'V1.0',
    isCurrent: false,
    status: 'approved',
    rejectReason: '',
    processSteps: [
      {
        id: 1,
        processId: 1,
        processCode: 'PRC001',
        stepName: '车削加工',
        description: '对工件进行车削加工处理',
        devices: [
          {
            id: 1,
            deviceCode: 'DEV001',
            deviceName: '数控车床A',
            status: '运行中',
            dept: '一车间',
          },
        ],
        operators: [
          { id: 1, userCode: 'U001', userName: '张三', skill: '高级车工', phone: '13800138001' },
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
            {
              materialCode: 'MAT002',
              materialName: '切削液',
              specModel: '标准型',
              quantity: 5,
              unit: '升',
            },
          ],
        },
      },
      {
        id: 2,
        processId: 2,
        processCode: 'PRC002',
        stepName: '铣削加工',
        description: '对工件进行铣削加工处理',
        devices: [
          {
            id: 3,
            deviceCode: 'DEV003',
            deviceName: '数控铣床A',
            status: '运行中',
            dept: '二车间',
          },
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
            {
              materialCode: 'MAT005',
              materialName: '铣刀',
              specModel: 'Φ20端铣刀',
              quantity: 1,
              unit: '把',
            },
          ],
        },
      },
    ],
    operationTime: '2024-01-15 10:30:00',
    createTime: '2024-01-10 09:00:00',
    baseId: 'PR001',
  },
  {
    id: 2,
    routeCode: 'PR20240001',
    routeName: '汽车零部件加工工艺',
    product: '汽车零部件A',
    description: '用于汽车零部件的加工工艺路线（优化版）',
    version: 'V2.0',
    isCurrent: true,
    status: 'approved',
    rejectReason: '',
    processSteps: [
      {
        id: 1,
        processId: 1,
        processCode: 'PRC001',
        stepName: '车削加工',
        description: '对工件进行车削加工处理',
        devices: [
          {
            id: 1,
            deviceCode: 'DEV001',
            deviceName: '数控车床A',
            status: '运行中',
            dept: '一车间',
          },
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
            {
              materialCode: 'MAT002',
              materialName: '切削液',
              specModel: '标准型',
              quantity: 5,
              unit: '升',
            },
            {
              materialCode: 'MAT003',
              materialName: '刀具',
              specModel: 'CNMG120408',
              quantity: 2,
              unit: '把',
            },
          ],
        },
      },
      {
        id: 2,
        processId: 2,
        processCode: 'PRC002',
        stepName: '铣削加工',
        description: '对工件进行铣削加工处理',
        devices: [
          {
            id: 3,
            deviceCode: 'DEV003',
            deviceName: '数控铣床A',
            status: '运行中',
            dept: '二车间',
          },
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
            {
              materialCode: 'MAT002',
              materialName: '切削液',
              specModel: '标准型',
              quantity: 3,
              unit: '升',
            },
            {
              materialCode: 'MAT005',
              materialName: '铣刀',
              specModel: 'Φ20端铣刀',
              quantity: 1,
              unit: '把',
            },
          ],
        },
      },
      {
        id: 3,
        processId: 5,
        processCode: 'PRC005',
        stepName: '质量检测',
        description: '对产品进行质量检验',
        devices: [
          {
            id: 7,
            deviceCode: 'DEV007',
            deviceName: '三坐标测量仪',
            status: '空闲',
            dept: '质检中心',
          },
        ],
        operators: [
          { id: 6, userCode: 'U006', userName: '周八', skill: '质检员', phone: '13800138006' },
        ],
        bom: {
          parentMaterial: null,
          childMaterials: [],
        },
      },
    ],
    operationTime: '2024-01-20 14:00:00',
    createTime: '2024-01-10 09:00:00',
    baseId: 'PR001',
  },
  {
    id: 3,
    routeCode: 'PR20240002',
    routeName: '电子设备组装工艺',
    product: '电子设备B',
    description: '电子设备的组装工艺路线',
    version: 'V1.0',
    isCurrent: true,
    status: 'pending',
    rejectReason: '',
    processSteps: [
      {
        id: 1,
        processId: 8,
        processCode: 'PRC008',
        stepName: '组装工序',
        description: '产品组装装配',
        devices: [
          {
            id: 11,
            deviceCode: 'DEV011',
            deviceName: '组装台A',
            status: '运行中',
            dept: '组装车间',
          },
        ],
        operators: [
          { id: 10, userCode: 'U010', userName: '孙十二', skill: '装配工', phone: '13800138010' },
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
          ],
        },
      },
      {
        id: 2,
        processId: 5,
        processCode: 'PRC005',
        stepName: '质量检测',
        description: '对产品进行质量检验',
        devices: [
          {
            id: 7,
            deviceCode: 'DEV007',
            deviceName: '三坐标测量仪',
            status: '空闲',
            dept: '质检中心',
          },
        ],
        operators: [
          { id: 6, userCode: 'U006', userName: '周八', skill: '质检员', phone: '13800138006' },
        ],
        bom: {
          parentMaterial: null,
          childMaterials: [],
        },
      },
    ],
    operationTime: '2024-01-18 11:00:00',
    createTime: '2024-01-18 11:00:00',
    baseId: 'PR002',
  },
  {
    id: 4,
    routeCode: 'PR20240003',
    routeName: '管道组件焊接工艺',
    product: '管道组件C',
    description: '管道组件的焊接工艺路线',
    version: 'V1.0',
    isCurrent: true,
    status: 'rejected',
    rejectReason: '工艺流程不完整，缺少质量检测环节',
    processSteps: [
      {
        id: 1,
        processId: 3,
        processCode: 'PRC003',
        stepName: '钻孔工序',
        description: '对工件进行钻孔加工',
        devices: [
          { id: 4, deviceCode: 'DEV004', deviceName: '钻床A', status: '空闲', dept: '一车间' },
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
            {
              materialCode: 'MAT007',
              materialName: '钻头',
              specModel: 'Φ10标准钻头',
              quantity: 3,
              unit: '支',
            },
          ],
        },
      },
    ],
    operationTime: '2024-01-22 16:30:00',
    createTime: '2024-01-22 16:30:00',
    baseId: 'PR003',
  },
  {
    id: 5,
    routeCode: 'PR20240004',
    routeName: '机械零件精加工工艺',
    product: '机械零件D',
    description: '机械零件的精加工工艺路线',
    version: 'V1.0',
    isCurrent: true,
    status: 'approved',
    rejectReason: '',
    processSteps: [
      {
        id: 1,
        processId: 1,
        processCode: 'PRC001',
        stepName: '车削加工',
        description: '对工件进行车削加工处理',
        devices: [
          {
            id: 1,
            deviceCode: 'DEV001',
            deviceName: '数控车床A',
            status: '运行中',
            dept: '一车间',
          },
        ],
        operators: [
          { id: 1, userCode: 'U001', userName: '张三', skill: '高级车工', phone: '13800138001' },
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
          childMaterials: [],
        },
      },
      {
        id: 2,
        processId: 4,
        processCode: 'PRC004',
        stepName: '磨削精加工',
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
            {
              materialCode: 'MAT009',
              materialName: '砂轮',
              specModel: 'WA60K',
              quantity: 1,
              unit: '个',
            },
          ],
        },
      },
      {
        id: 3,
        processId: 5,
        processCode: 'PRC005',
        stepName: '质量检测',
        description: '对产品进行质量检验',
        devices: [
          {
            id: 7,
            deviceCode: 'DEV007',
            deviceName: '三坐标测量仪',
            status: '空闲',
            dept: '质检中心',
          },
        ],
        operators: [
          { id: 6, userCode: 'U006', userName: '周八', skill: '质检员', phone: '13800138006' },
        ],
        bom: {
          parentMaterial: null,
          childMaterials: [],
        },
      },
    ],
    operationTime: '2024-01-25 09:00:00',
    createTime: '2024-01-25 09:00:00',
    baseId: 'PR004',
  },
])

const formData = reactive({
  routeCode: '',
  routeName: '',
  product: '',
  description: '',
  version: '',
  processSteps: [],
})

const formRef = ref()
const processSelectDialogVisible = ref(false)

const routeVersions = computed(() => {
  if (!routeData.value.baseId) return []
  return allRouteData.value
    .filter((r) => r.baseId === routeData.value.baseId)
    .sort((a, b) => {
      const vA = parseFloat(a.version.replace('V', ''))
      const vB = parseFloat(b.version.replace('V', ''))
      return vB - vA
    })
})

const versionOptions = computed(() => {
  return routeVersions.value.map((r) => ({
    label: r.isCurrent ? `${r.version}（当前）` : r.version,
    value: r.id,
  }))
})

const canEdit = computed(() => {
  return isDesignerRole.value && routeData.value.status === 'rejected'
})

const canApprove = computed(() => {
  return isSupervisorRole.value && routeData.value.status === 'pending'
})

const getStatusType = (status) => {
  const map = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
  }
  return map[status] || 'info'
}

const getStatusLabel = (status) => {
  const map = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已驳回',
  }
  return map[status] || status
}

const loadRouteData = () => {
  loading.value = true
  setTimeout(() => {
    const id = route.params.id
    const data = allRouteData.value.find((r) => r.id === parseInt(id)) || allRouteData.value[0]
    routeData.value = { ...data }
    currentVersionId.value = data.id
    Object.assign(formData, {
      routeCode: data.routeCode,
      routeName: data.routeName,
      product: data.product,
      description: data.description,
      version: data.version,
      processSteps: JSON.parse(JSON.stringify(data.processSteps || [])),
    })
    loading.value = false
  }, 300)
}

const handleVersionChange = (versionId) => {
  const data = allRouteData.value.find((r) => r.id === versionId)
  if (data) {
    routeData.value = { ...data }
    Object.assign(formData, {
      routeCode: data.routeCode,
      routeName: data.routeName,
      product: data.product,
      description: data.description,
      version: data.version,
      processSteps: JSON.parse(JSON.stringify(data.processSteps || [])),
    })
  }
}

const handleEdit = () => {
  if (!canEdit.value) {
    ElMessage.warning('您没有修改权限或该工艺路线不可修改')
    return
  }
  isEdit.value = true
}

const handleCancel = () => {
  ElMessageBox.confirm('确定要取消编辑吗？未保存的数据将丢失', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      isEdit.value = false
      Object.assign(formData, {
        routeCode: routeData.value.routeCode,
        routeName: routeData.value.routeName,
        product: routeData.value.product,
        description: routeData.value.description,
        version: routeData.value.version,
        processSteps: JSON.parse(JSON.stringify(routeData.value.processSteps || [])),
      })
    })
    .catch(() => {})
}

const handleSave = () => {
  if (!formRef.value) return

  formRef.value.validate((valid) => {
    if (valid) {
      const hasChanges =
        formData.routeName !== routeData.value.routeName ||
        formData.product !== routeData.value.product ||
        formData.description !== routeData.value.description ||
        JSON.stringify(formData.processSteps) !== JSON.stringify(routeData.value.processSteps)

      if (hasChanges) {
        const maxId = allRouteData.value.reduce((max, item) => {
          const id = parseInt(item.id)
          return id > max ? id : max
        }, 0)

        const currentMaxVersion = Math.max(
          ...routeVersions.value.map((r) => parseFloat(r.version.replace('V', ''))),
        )
        const newVersion = `V${(currentMaxVersion + 1).toFixed(1)}`

        allRouteData.value.forEach((r) => {
          if (r.baseId === routeData.value.baseId) {
            r.isCurrent = false
          }
        })

        const newRoute = {
          id: maxId + 1,
          routeCode: formData.routeCode,
          routeName: formData.routeName,
          product: formData.product,
          description: formData.description,
          version: newVersion,
          isCurrent: true,
          status: 'pending',
          rejectReason: '',
          processSteps: formData.processSteps,
          operationTime: new Date().toLocaleString(),
          createTime: routeData.value.createTime,
          baseId: routeData.value.baseId,
        }

        allRouteData.value.push(newRoute)
        routeData.value = { ...newRoute }
        currentVersionId.value = newRoute.id

        ElMessage.success(`保存成功，已生成新版本 ${newVersion}`)
      } else {
        ElMessage.success('保存成功')
      }

      isEdit.value = false
    }
  })
}

const handleAudit = () => {
  if (!canApprove.value) {
    ElMessage.warning('您没有审核权限')
    return
  }
  auditForm.approved = true
  auditForm.reason = ''
  auditDialogVisible.value = true
}

const handleAuditSubmit = () => {
  const routeItem = allRouteData.value.find((r) => r.id === routeData.value.id)
  if (routeItem) {
    routeItem.status = auditForm.approved ? 'approved' : 'rejected'
    routeItem.rejectReason = auditForm.approved ? '' : auditForm.reason
    routeData.value = { ...routeItem }
  }
  ElMessage.success(auditForm.approved ? '审核通过' : '已驳回')
  auditDialogVisible.value = false
}

const handleBack = () => {
  router.push('/process-route-manage/process-route-manage-info')
}

const handleExport = () => {
  const stepsStr = routeData.value.processSteps?.map((s) => s.stepName).join(' → ') || '无'
  const exportData = [
    {
      工艺编号: routeData.value.routeCode,
      工艺路线名称: routeData.value.routeName,
      所属产品: routeData.value.product,
      工艺描述: routeData.value.description,
      版本: routeData.value.version,
      审核状态: getStatusLabel(routeData.value.status),
      驳回原因: routeData.value.rejectReason || '无',
      工艺流程: stepsStr,
      操作时间: routeData.value.operationTime,
      创建时间: routeData.value.createTime,
    },
  ]

  const worksheet = XLSX.utils.json_to_sheet(exportData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, '工艺路线详情')
  XLSX.writeFile(workbook, `工艺路线_${routeData.value.routeCode}_${routeData.value.version}.xlsx`)
  ElMessage.success('导出成功')
}

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

const rules = {
  routeName: [{ required: true, message: '请输入工艺路线名称', trigger: 'blur' }],
  product: [{ required: true, message: '请选择所属产品', trigger: 'change' }],
}

onMounted(() => {
  loadRouteData()
})

watch(
  () => route.params.id,
  () => {
    loadRouteData()
  },
)
</script>

<template>
  <div class="process-route-detail-container">
    <div class="detail-header">
      <div class="header-left">
        <el-button :icon="ArrowLeft" @click="handleBack">返回</el-button>
        <div class="title-area">
          <h2 class="page-title">{{ routeData.routeName }}</h2>
          <span class="page-subtitle">工艺路线详情</span>
        </div>
      </div>
      <div class="header-right">
        <div class="version-selector">
          <span class="version-label">版本：</span>
          <el-select
            v-model="currentVersionId"
            placeholder="选择版本"
            style="width: 180px"
            @change="handleVersionChange"
          >
            <el-option
              v-for="item in versionOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
        <template v-if="!isEdit">
          <el-button v-if="canEdit" type="primary" :icon="Edit" @click="handleEdit">修改</el-button>
          <el-button v-if="canApprove" type="success" :icon="Check" @click="handleAudit"
            >审核</el-button
          >
          <el-button type="success" :icon="Download" @click="handleExport">导出</el-button>
        </template>
        <template v-else>
          <el-button type="primary" @click="handleSave">保存</el-button>
          <el-button @click="handleCancel">取消</el-button>
        </template>
      </div>
    </div>

    <div v-loading="loading" class="detail-content">
      <div class="section-card basic-info-card">
        <div class="section-header">
          <span class="section-title">基本信息</span>
        </div>

        <template v-if="!isEdit">
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">工艺编号</div>
              <div class="info-value">
                <el-tag size="default">{{ routeData.routeCode }}</el-tag>
              </div>
            </div>
            <div class="info-item">
              <div class="info-label">工艺路线名称</div>
              <div class="info-value">{{ routeData.routeName }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">所属产品</div>
              <div class="info-value">{{ routeData.product }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">工艺描述</div>
              <div class="info-value">{{ routeData.description || '无' }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">版本</div>
              <div class="info-value">
                <el-tag :type="routeData.isCurrent ? 'success' : 'info'" size="default">
                  {{ routeData.version }}
                  <span v-if="routeData.isCurrent">（当前）</span>
                </el-tag>
              </div>
            </div>
            <div class="info-item">
              <div class="info-label">审核状态</div>
              <div class="info-value">
                <el-tag :type="getStatusType(routeData.status)" size="default">
                  {{ getStatusLabel(routeData.status) }}
                </el-tag>
              </div>
            </div>
            <div class="info-item">
              <div class="info-label">创建时间</div>
              <div class="info-value">{{ routeData.createTime }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">操作时间</div>
              <div class="info-value">{{ routeData.operationTime }}</div>
            </div>
            <div v-if="routeData.status === 'rejected'" class="info-item full-width">
              <div class="info-label">驳回原因</div>
              <div class="info-value reject-reason">{{ routeData.rejectReason }}</div>
            </div>
          </div>
        </template>

        <template v-else>
          <el-form ref="formRef" :model="formData" :rules="rules" label-position="top">
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
                <el-input v-model="formData.version" disabled placeholder="修改后自动生成新版本" />
              </el-form-item>
            </div>
          </el-form>
        </template>
      </div>

      <div class="section-card process-config-card">
        <div class="section-header">
          <span class="section-title">工艺路线配置</span>
          <el-button v-if="isEdit" type="primary" :icon="Plus" @click="handleOpenProcessSelect"
            >从工序管理选择</el-button
          >
        </div>
        <div class="process-layout">
          <div class="steps-panel">
            <div class="panel-header">工序列表{{ isEdit ? '（拖拽调整顺序）' : '' }}</div>
            <draggable
              v-if="isEdit"
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

            <div v-else class="steps-list">
              <div
                v-for="(element, index) in routeData.processSteps"
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

            <div
              v-if="
                (isEdit && formData.processSteps.length === 0) ||
                (!isEdit && !routeData.processSteps?.length)
              "
              class="empty-steps"
            >
              暂无工序
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
                          <span class="value">{{ selectedStep.bom.parentMaterial.specModel }}</span>
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
                          <span class="value">{{ selectedStep.bom.parentMaterial.supplier }}</span>
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
                      !selectedStep.bom?.parentMaterial && !selectedStep.bom?.childMaterials?.length
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
    </div>

    <el-dialog v-model="auditDialogVisible" title="审核工艺路线" width="500px">
      <el-form label-width="100px">
        <el-form-item label="审核结果">
          <el-radio-group v-model="auditForm.approved">
            <el-radio :value="true">通过</el-radio>
            <el-radio :value="false">驳回</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="!auditForm.approved" label="驳回原因">
          <el-input
            v-model="auditForm.reason"
            type="textarea"
            :rows="3"
            placeholder="请输入驳回原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="auditDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAuditSubmit">确定</el-button>
      </template>
    </el-dialog>

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
.process-route-detail-container {
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
      align-items: center;
      gap: 12px;

      .version-selector {
        display: flex;
        align-items: center;
        gap: 8px;

        .version-label {
          font-size: 15px;
          color: #606266;
        }
      }

      .el-button {
        padding: 10px 20px;
        font-size: 14px;
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
            width: 110px;
            padding: 18px 20px;
            background: #fafafa;
            font-size: 16px;
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

            &.reject-reason {
              color: #f56c6c;
            }
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

                .drag-handle {
                  cursor: move;
                  padding: 4px;
                  color: #909399;
                  flex-shrink: 0;

                  &:hover {
                    color: #409eff;
                  }
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
  .process-route-detail-container {
    .detail-content {
      .section-card {
        .info-grid {
          grid-template-columns: repeat(2, 1fr);

          .info-item.full-width {
            grid-column: span 2;
          }
        }

        .form-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .process-route-detail-container {
    .detail-content {
      .section-card {
        .info-grid {
          grid-template-columns: 1fr;

          .info-item.full-width {
            grid-column: span 1;
          }
        }

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
