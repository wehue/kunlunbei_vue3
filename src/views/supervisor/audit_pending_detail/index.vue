<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Check, Close, ArrowLeft, Clock, Document, Refresh, Monitor, User, Box } from '@element-plus/icons-vue'
import { useMessageStore } from '@/stores/modules/message'
import { useUserStore } from '@/stores/modules/user'

const route = useRoute()
const router = useRouter()
const messageStore = useMessageStore()
const userStore = useUserStore()

const loading = ref(false)
const submitLoading = ref(false)
const auditData = ref({})
const rejectDialogVisible = ref(false)
const rejectReason = ref('')
const currentVersionIndex = ref(0)
const versionHistoryVisible = ref(false)
const compareDialogVisible = ref(false)
const compareVersions = ref({ old: null, new: null })
const selectedStepId = ref(null)
const activeDetailTab = ref('devices')

const mockVersionHistory = ref([
  {
    version: 'V1.0',
    versionCode: 1,
    submitTime: '2024-01-10 09:30:00',
    applicant: '张三',
    status: '已驳回',
    rejectReason: '工艺流程顺序存在错误，请调整后重新提交',
    changeDescription: '初始版本提交',
    processCode: 'PR001',
    processName: '智能手机组装工艺路线',
    product: '智能手机A1',
    description: '该工艺路线用于智能手机A1的组装生产。',
    processSteps: [
      {
        id: 1,
        processId: 1,
        processCode: 'PRC001',
        stepName: '主板安装',
        description: '将主板安装到手机框架中',
        devices: [
          { id: 1, deviceCode: 'DEV001', deviceName: '贴片机A', manufacturer: '西门子', brand: '西门子', specModel: 'SMT-800', supplier: '北京华工', productionDate: '2022-03-15', serviceLife: 15, depreciationMethod: '直线法', location: '一车间', stockQuantity: 5, unit: '台' },
        ],
        operators: [
          { id: 1, employeeCode: 'EMP20240001', employeeName: '张三', deptName: '技术部', position: '工程师' },
        ],
        bom: {
          parentMaterial: { materialCode: 'MAT001', materialName: '主板组件', specModel: 'MB-A1', stockQuantity: 100, supplier: '华为供应商', version: 'V1.0', category: '电子元件', location: '原料仓A区' },
          childMaterials: [
            { materialCode: 'MAT002', materialName: '焊锡', specModel: '标准型', quantity: 5, unit: '克', stockQuantity: 500, supplier: '中石化', version: 'V2.0', category: '辅料', location: '辅料仓' },
          ],
        },
      },
      {
        id: 2,
        processId: 2,
        processCode: 'PRC002',
        stepName: '电池组装',
        description: '将电池组装到手机中',
        devices: [
          { id: 2, deviceCode: 'DEV002', deviceName: '组装台A', manufacturer: '欧姆龙', brand: '欧姆龙', specModel: 'ASSEMBLE-500', supplier: '广州机电', productionDate: '2023-01-10', serviceLife: 10, depreciationMethod: '直线法', location: '组装车间', stockQuantity: 8, unit: '台' },
        ],
        operators: [
          { id: 2, employeeCode: 'EMP20240002', employeeName: '李四', deptName: '生产部', position: '操作工' },
        ],
        bom: {
          parentMaterial: { materialCode: 'MAT003', materialName: '电池组', specModel: 'BAT-A1', stockQuantity: 200, supplier: '宁德时代', version: 'V1.0', category: '电子元件', location: '原料仓B区' },
          childMaterials: [],
        },
      },
    ],
  },
  {
    version: 'V1.1',
    versionCode: 2,
    submitTime: '2024-01-12 10:15:00',
    applicant: '张三',
    status: '已驳回',
    rejectReason: '缺少摄像头安装工序，请补充完整',
    changeDescription: '调整工艺流程顺序，屏幕贴合移至电池组装之前',
    processCode: 'PR001',
    processName: '智能手机组装工艺路线',
    product: '智能手机A1',
    description: '该工艺路线用于智能手机A1的组装生产，包括主板安装、屏幕贴合、电池组装、外壳封装等主要工序。',
    processSteps: [
      {
        id: 1,
        processId: 1,
        processCode: 'PRC001',
        stepName: '主板安装',
        description: '将主板安装到手机框架中',
        devices: [
          { id: 1, deviceCode: 'DEV001', deviceName: '贴片机A', manufacturer: '西门子', brand: '西门子', specModel: 'SMT-800', supplier: '北京华工', productionDate: '2022-03-15', serviceLife: 15, depreciationMethod: '直线法', location: '一车间', stockQuantity: 5, unit: '台' },
        ],
        operators: [
          { id: 1, employeeCode: 'EMP20240001', employeeName: '张三', deptName: '技术部', position: '工程师' },
        ],
        bom: {
          parentMaterial: { materialCode: 'MAT001', materialName: '主板组件', specModel: 'MB-A1', stockQuantity: 100, supplier: '华为供应商', version: 'V1.0', category: '电子元件', location: '原料仓A区' },
          childMaterials: [
            { materialCode: 'MAT002', materialName: '焊锡', specModel: '标准型', quantity: 5, unit: '克', stockQuantity: 500, supplier: '中石化', version: 'V2.0', category: '辅料', location: '辅料仓' },
          ],
        },
      },
      {
        id: 2,
        processId: 3,
        processCode: 'PRC003',
        stepName: '屏幕贴合',
        description: '将屏幕贴合到手机框架',
        devices: [
          { id: 3, deviceCode: 'DEV003', deviceName: '贴合机A', manufacturer: '三菱', brand: '三菱', specModel: 'BOND-300', supplier: '上海精密', productionDate: '2021-06-20', serviceLife: 12, depreciationMethod: '年数总和法', location: '二车间', stockQuantity: 3, unit: '台' },
        ],
        operators: [
          { id: 2, employeeCode: 'EMP20240002', employeeName: '李四', deptName: '生产部', position: '操作工' },
        ],
        bom: {
          parentMaterial: { materialCode: 'MAT004', materialName: '屏幕组件', specModel: 'SCR-A1', stockQuantity: 150, supplier: '京东方', version: 'V1.0', category: '电子元件', location: '原料仓C区' },
          childMaterials: [
            { materialCode: 'MAT005', materialName: '贴合胶', specModel: '标准型', quantity: 2, unit: '毫升', stockQuantity: 300, supplier: '3M公司', version: 'V1.0', category: '辅料', location: '辅料仓' },
          ],
        },
      },
      {
        id: 3,
        processId: 2,
        processCode: 'PRC002',
        stepName: '电池组装',
        description: '将电池组装到手机中',
        devices: [
          { id: 2, deviceCode: 'DEV002', deviceName: '组装台A', manufacturer: '欧姆龙', brand: '欧姆龙', specModel: 'ASSEMBLE-500', supplier: '广州机电', productionDate: '2023-01-10', serviceLife: 10, depreciationMethod: '直线法', location: '组装车间', stockQuantity: 8, unit: '台' },
        ],
        operators: [
          { id: 2, employeeCode: 'EMP20240002', employeeName: '李四', deptName: '生产部', position: '操作工' },
        ],
        bom: {
          parentMaterial: { materialCode: 'MAT003', materialName: '电池组', specModel: 'BAT-A1', stockQuantity: 200, supplier: '宁德时代', version: 'V1.0', category: '电子元件', location: '原料仓B区' },
          childMaterials: [],
        },
      },
    ],
  },
  {
    version: 'V1.2',
    versionCode: 3,
    submitTime: '2024-01-15 09:30:00',
    applicant: '张三',
    status: '待审核',
    rejectReason: '',
    changeDescription: '新增摄像头安装工序，完善工艺流程',
    processCode: 'PR001',
    processName: '智能手机组装工艺路线',
    product: '智能手机A1',
    description: '该工艺路线用于智能手机A1的组装生产，包括主板安装、屏幕贴合、电池组装、摄像头安装、外壳封装等主要工序。',
    processSteps: [
      {
        id: 1,
        processId: 1,
        processCode: 'PRC001',
        stepName: '主板安装',
        description: '将主板安装到手机框架中',
        devices: [
          { id: 1, deviceCode: 'DEV001', deviceName: '贴片机A', manufacturer: '西门子', brand: '西门子', specModel: 'SMT-800', supplier: '北京华工', productionDate: '2022-03-15', serviceLife: 15, depreciationMethod: '直线法', location: '一车间', stockQuantity: 5, unit: '台' },
          { id: 4, deviceCode: 'DEV004', deviceName: '贴片机B', manufacturer: '三菱', brand: '三菱', specModel: 'SMT-600', supplier: '上海精密', productionDate: '2021-08-10', serviceLife: 12, depreciationMethod: '直线法', location: '一车间', stockQuantity: 3, unit: '台' },
        ],
        operators: [
          { id: 1, employeeCode: 'EMP20240001', employeeName: '张三', deptName: '技术部', position: '工程师' },
          { id: 2, employeeCode: 'EMP20240002', employeeName: '李四', deptName: '生产部', position: '操作工' },
        ],
        bom: {
          parentMaterial: { materialCode: 'MAT001', materialName: '主板组件', specModel: 'MB-A1', stockQuantity: 100, supplier: '华为供应商', version: 'V1.0', category: '电子元件', location: '原料仓A区' },
          childMaterials: [
            { materialCode: 'MAT002', materialName: '焊锡', specModel: '标准型', quantity: 5, unit: '克', stockQuantity: 500, supplier: '中石化', version: 'V2.0', category: '辅料', location: '辅料仓' },
            { materialCode: 'MAT006', materialName: '导热硅脂', specModel: '高导热型', quantity: 1, unit: '克', stockQuantity: 200, supplier: '信越化学', version: 'V1.0', category: '辅料', location: '辅料仓' },
          ],
        },
      },
      {
        id: 2,
        processId: 3,
        processCode: 'PRC003',
        stepName: '屏幕贴合',
        description: '将屏幕贴合到手机框架',
        devices: [
          { id: 3, deviceCode: 'DEV003', deviceName: '贴合机A', manufacturer: '三菱', brand: '三菱', specModel: 'BOND-300', supplier: '上海精密', productionDate: '2021-06-20', serviceLife: 12, depreciationMethod: '年数总和法', location: '二车间', stockQuantity: 3, unit: '台' },
        ],
        operators: [
          { id: 2, employeeCode: 'EMP20240002', employeeName: '李四', deptName: '生产部', position: '操作工' },
        ],
        bom: {
          parentMaterial: { materialCode: 'MAT004', materialName: '屏幕组件', specModel: 'SCR-A1', stockQuantity: 150, supplier: '京东方', version: 'V1.0', category: '电子元件', location: '原料仓C区' },
          childMaterials: [
            { materialCode: 'MAT005', materialName: '贴合胶', specModel: '标准型', quantity: 2, unit: '毫升', stockQuantity: 300, supplier: '3M公司', version: 'V1.0', category: '辅料', location: '辅料仓' },
          ],
        },
      },
      {
        id: 3,
        processId: 2,
        processCode: 'PRC002',
        stepName: '电池组装',
        description: '将电池组装到手机中',
        devices: [
          { id: 2, deviceCode: 'DEV002', deviceName: '组装台A', manufacturer: '欧姆龙', brand: '欧姆龙', specModel: 'ASSEMBLE-500', supplier: '广州机电', productionDate: '2023-01-10', serviceLife: 10, depreciationMethod: '直线法', location: '组装车间', stockQuantity: 8, unit: '台' },
        ],
        operators: [
          { id: 3, employeeCode: 'EMP20240003', employeeName: '王五', deptName: '生产部', position: '操作工' },
        ],
        bom: {
          parentMaterial: { materialCode: 'MAT003', materialName: '电池组', specModel: 'BAT-A1', stockQuantity: 200, supplier: '宁德时代', version: 'V1.0', category: '电子元件', location: '原料仓B区' },
          childMaterials: [],
        },
      },
      {
        id: 4,
        processId: 4,
        processCode: 'PRC004',
        stepName: '摄像头安装',
        description: '安装摄像头模组',
        devices: [
          { id: 5, deviceCode: 'DEV005', deviceName: '精密组装台', manufacturer: '西门子', brand: '西门子', specModel: 'PRECISE-200', supplier: '北京华工', productionDate: '2022-11-05', serviceLife: 15, depreciationMethod: '直线法', location: '组装车间', stockQuantity: 2, unit: '台' },
        ],
        operators: [
          { id: 1, employeeCode: 'EMP20240001', employeeName: '张三', deptName: '技术部', position: '工程师' },
          { id: 3, employeeCode: 'EMP20240003', employeeName: '王五', deptName: '生产部', position: '操作工' },
        ],
        bom: {
          parentMaterial: { materialCode: 'MAT007', materialName: '摄像头模组', specModel: 'CAM-A1', stockQuantity: 300, supplier: '舜宇光学', version: 'V1.0', category: '电子元件', location: '原料仓D区' },
          childMaterials: [
            { materialCode: 'MAT008', materialName: '连接排线', specModel: 'FPC-A1', quantity: 1, unit: '条', stockQuantity: 500, supplier: '旗胜科技', version: 'V1.0', category: '电子元件', location: '原料仓E区' },
          ],
        },
      },
      {
        id: 5,
        processId: 5,
        processCode: 'PRC005',
        stepName: '外壳封装',
        description: '进行手机外壳封装',
        devices: [
          { id: 6, deviceCode: 'DEV006', deviceName: '封装机A', manufacturer: '欧姆龙', brand: '欧姆龙', specModel: 'SEAL-400', supplier: '广州机电', productionDate: '2023-02-15', serviceLife: 10, depreciationMethod: '直线法', location: '组装车间', stockQuantity: 4, unit: '台' },
        ],
        operators: [
          { id: 2, employeeCode: 'EMP20240002', employeeName: '李四', deptName: '生产部', position: '操作工' },
          { id: 3, employeeCode: 'EMP20240003', employeeName: '王五', deptName: '生产部', position: '操作工' },
        ],
        bom: {
          parentMaterial: { materialCode: 'MAT009', materialName: '手机外壳', specModel: 'CASE-A1', stockQuantity: 250, supplier: '比亚迪', version: 'V1.0', category: '结构件', location: '原料仓F区' },
          childMaterials: [
            { materialCode: 'MAT010', materialName: '螺丝', specModel: 'M2×5', quantity: 6, unit: '个', stockQuantity: 5000, supplier: '标准件厂', version: 'V1.0', category: '紧固件', location: '辅料仓' },
          ],
        },
      },
      {
        id: 6,
        processId: 6,
        processCode: 'PRC006',
        stepName: '功能测试',
        description: '对手机进行功能测试',
        devices: [
          { id: 7, deviceCode: 'DEV007', deviceName: '测试仪A', manufacturer: '是德科技', brand: '是德', specModel: 'TEST-1000', supplier: '是德科技', productionDate: '2022-05-20', serviceLife: 15, depreciationMethod: '直线法', location: '质检中心', stockQuantity: 5, unit: '台' },
        ],
        operators: [
          { id: 4, employeeCode: 'EMP20240004', employeeName: '赵六', deptName: '质量部', position: '质检员' },
        ],
        bom: {
          parentMaterial: null,
          childMaterials: [],
        },
      },
      {
        id: 7,
        processId: 7,
        processCode: 'PRC007',
        stepName: '包装',
        description: '产品包装',
        devices: [
          { id: 8, deviceCode: 'DEV008', deviceName: '包装机A', manufacturer: '西门子', brand: '西门子', specModel: 'PACK-500', supplier: '北京华工', productionDate: '2021-09-10', serviceLife: 12, depreciationMethod: '直线法', location: '包装车间', stockQuantity: 3, unit: '台' },
        ],
        operators: [
          { id: 5, employeeCode: 'EMP20240005', employeeName: '孙七', deptName: '生产部', position: '包装工' },
        ],
        bom: {
          parentMaterial: { materialCode: 'MAT011', materialName: '包装盒', specModel: 'BOX-A1', stockQuantity: 500, supplier: '包装材料厂', version: 'V1.0', category: '包材', location: '包材仓' },
          childMaterials: [
            { materialCode: 'MAT012', materialName: '说明书', specModel: '标准型', quantity: 1, unit: '份', stockQuantity: 1000, supplier: '印刷厂', version: 'V1.0', category: '包材', location: '包材仓' },
            { materialCode: 'MAT013', materialName: '充电器', specModel: 'CHR-A1', quantity: 1, unit: '个', stockQuantity: 600, supplier: '充电器供应商', version: 'V1.0', category: '配件', location: '配件仓' },
          ],
        },
      },
    ],
  },
])

const mockAuditData = {
  1: {
    id: 1,
    processCode: 'PR001',
    processName: '智能手机组装工艺路线',
    version: 'V1.2',
    product: '智能手机A1',
    description: '该工艺路线用于智能手机A1的组装生产，包括主板安装、屏幕贴合、电池组装、摄像头安装、外壳封装等主要工序。',
    applicant: '张三',
    submitTime: '2024-01-15 09:30:00',
    hasVersionHistory: true,
    processSteps: mockVersionHistory.value[2].processSteps,
  },
  2: {
    id: 2,
    processCode: 'PR002',
    processName: '平板电脑组装工艺路线',
    version: 'V1.1',
    product: '平板电脑B2',
    description: '该工艺路线用于平板电脑B2的组装生产，优化了屏幕贴合工序，提高了生产效率。',
    applicant: '李四',
    submitTime: '2024-01-15 10:15:00',
    hasVersionHistory: false,
    processSteps: [
      {
        id: 1,
        processId: 1,
        processCode: 'PRC001',
        stepName: '主板安装',
        description: '将主板安装到平板框架中',
        devices: [
          { id: 1, deviceCode: 'DEV001', deviceName: '贴片机A', manufacturer: '西门子', brand: '西门子', specModel: 'SMT-800', supplier: '北京华工', productionDate: '2022-03-15', serviceLife: 15, depreciationMethod: '直线法', location: '一车间', stockQuantity: 5, unit: '台' },
        ],
        operators: [
          { id: 2, employeeCode: 'EMP20240002', employeeName: '李四', deptName: '生产部', position: '操作工' },
        ],
        bom: {
          parentMaterial: { materialCode: 'MAT001', materialName: '主板组件', specModel: 'MB-B2', stockQuantity: 80, supplier: '华为供应商', version: 'V1.0', category: '电子元件', location: '原料仓A区' },
          childMaterials: [],
        },
      },
      {
        id: 2,
        processId: 2,
        processCode: 'PRC002',
        stepName: '屏幕贴合',
        description: '将屏幕贴合到平板框架',
        devices: [
          { id: 3, deviceCode: 'DEV003', deviceName: '贴合机A', manufacturer: '三菱', brand: '三菱', specModel: 'BOND-300', supplier: '上海精密', productionDate: '2021-06-20', serviceLife: 12, depreciationMethod: '年数总和法', location: '二车间', stockQuantity: 3, unit: '台' },
        ],
        operators: [
          { id: 6, employeeCode: 'EMP20240006', employeeName: '赵六', deptName: '生产部', position: '操作工' },
        ],
        bom: {
          parentMaterial: { materialCode: 'MAT004', materialName: '屏幕组件', specModel: 'SCR-B2', stockQuantity: 100, supplier: '京东方', version: 'V1.0', category: '电子元件', location: '原料仓C区' },
          childMaterials: [],
        },
      },
      {
        id: 3,
        processId: 3,
        processCode: 'PRC003',
        stepName: '电池组装',
        description: '将电池组装到平板中',
        devices: [
          { id: 2, deviceCode: 'DEV002', deviceName: '组装台A', manufacturer: '欧姆龙', brand: '欧姆龙', specModel: 'ASSEMBLE-500', supplier: '广州机电', productionDate: '2023-01-10', serviceLife: 10, depreciationMethod: '直线法', location: '组装车间', stockQuantity: 8, unit: '台' },
        ],
        operators: [
          { id: 6, employeeCode: 'EMP20240006', employeeName: '赵六', deptName: '生产部', position: '操作工' },
        ],
        bom: {
          parentMaterial: { materialCode: 'MAT003', materialName: '电池组', specModel: 'BAT-B2', stockQuantity: 120, supplier: '宁德时代', version: 'V1.0', category: '电子元件', location: '原料仓B区' },
          childMaterials: [],
        },
      },
      {
        id: 4,
        processId: 4,
        processCode: 'PRC004',
        stepName: '扬声器安装',
        description: '安装扬声器模组',
        devices: [
          { id: 5, deviceCode: 'DEV005', deviceName: '精密组装台', manufacturer: '西门子', brand: '西门子', specModel: 'PRECISE-200', supplier: '北京华工', productionDate: '2022-11-05', serviceLife: 15, depreciationMethod: '直线法', location: '组装车间', stockQuantity: 2, unit: '台' },
        ],
        operators: [
          { id: 2, employeeCode: 'EMP20240002', employeeName: '李四', deptName: '生产部', position: '操作工' },
        ],
        bom: {
          parentMaterial: { materialCode: 'MAT014', materialName: '扬声器模组', specModel: 'SPK-B2', stockQuantity: 200, supplier: '瑞声科技', version: 'V1.0', category: '电子元件', location: '原料仓G区' },
          childMaterials: [],
        },
      },
      {
        id: 5,
        processId: 5,
        processCode: 'PRC005',
        stepName: '外壳封装',
        description: '进行平板外壳封装',
        devices: [
          { id: 6, deviceCode: 'DEV006', deviceName: '封装机A', manufacturer: '欧姆龙', brand: '欧姆龙', specModel: 'SEAL-400', supplier: '广州机电', productionDate: '2023-02-15', serviceLife: 10, depreciationMethod: '直线法', location: '组装车间', stockQuantity: 4, unit: '台' },
        ],
        operators: [
          { id: 2, employeeCode: 'EMP20240002', employeeName: '李四', deptName: '生产部', position: '操作工' },
          { id: 6, employeeCode: 'EMP20240006', employeeName: '赵六', deptName: '生产部', position: '操作工' },
        ],
        bom: {
          parentMaterial: { materialCode: 'MAT015', materialName: '平板外壳', specModel: 'CASE-B2', stockQuantity: 150, supplier: '比亚迪', version: 'V1.0', category: '结构件', location: '原料仓F区' },
          childMaterials: [],
        },
      },
      {
        id: 6,
        processId: 6,
        processCode: 'PRC006',
        stepName: '系统测试',
        description: '对平板进行系统测试',
        devices: [
          { id: 7, deviceCode: 'DEV007', deviceName: '测试仪A', manufacturer: '是德科技', brand: '是德', specModel: 'TEST-1000', supplier: '是德科技', productionDate: '2022-05-20', serviceLife: 15, depreciationMethod: '直线法', location: '质检中心', stockQuantity: 5, unit: '台' },
        ],
        operators: [
          { id: 4, employeeCode: 'EMP20240004', employeeName: '赵六', deptName: '质量部', position: '质检员' },
        ],
        bom: {
          parentMaterial: null,
          childMaterials: [],
        },
      },
      {
        id: 7,
        processId: 7,
        processCode: 'PRC007',
        stepName: '包装',
        description: '产品包装',
        devices: [
          { id: 8, deviceCode: 'DEV008', deviceName: '包装机A', manufacturer: '西门子', brand: '西门子', specModel: 'PACK-500', supplier: '北京华工', productionDate: '2021-09-10', serviceLife: 12, depreciationMethod: '直线法', location: '包装车间', stockQuantity: 3, unit: '台' },
        ],
        operators: [
          { id: 5, employeeCode: 'EMP20240005', employeeName: '孙七', deptName: '生产部', position: '包装工' },
        ],
        bom: {
          parentMaterial: { materialCode: 'MAT016', materialName: '包装盒', specModel: 'BOX-B2', stockQuantity: 300, supplier: '包装材料厂', version: 'V1.0', category: '包材', location: '包材仓' },
          childMaterials: [],
        },
      },
    ],
  },
  3: {
    id: 3,
    processCode: 'PR003',
    processName: '智能手表组装工艺路线',
    version: 'V2.0',
    product: '智能手表C3',
    description: '该工艺路线用于智能手表C3的组装生产，新增了防水测试工序。',
    applicant: '王五',
    submitTime: '2024-01-15 11:20:00',
    hasVersionHistory: false,
    processSteps: [
      {
        id: 1,
        processId: 1,
        processCode: 'PRC001',
        stepName: '主板安装',
        description: '将主板安装到手表框架中',
        devices: [
          { id: 9, deviceCode: 'DEV009', deviceName: '精密贴片机', manufacturer: '西门子', brand: '西门子', specModel: 'SMT-500', supplier: '北京华工', productionDate: '2023-01-15', serviceLife: 12, depreciationMethod: '直线法', location: '精密车间', stockQuantity: 2, unit: '台' },
        ],
        operators: [
          { id: 3, employeeCode: 'EMP20240003', employeeName: '王五', deptName: '技术部', position: '工程师' },
        ],
        bom: {
          parentMaterial: { materialCode: 'MAT017', materialName: '手表主板', specModel: 'MB-C3', stockQuantity: 150, supplier: '华为供应商', version: 'V1.0', category: '电子元件', location: '原料仓A区' },
          childMaterials: [],
        },
      },
      {
        id: 2,
        processId: 2,
        processCode: 'PRC002',
        stepName: '屏幕贴合',
        description: '将屏幕贴合到手表框架',
        devices: [
          { id: 10, deviceCode: 'DEV010', deviceName: '精密贴合机', manufacturer: '三菱', brand: '三菱', specModel: 'BOND-200', supplier: '上海精密', productionDate: '2022-08-20', serviceLife: 10, depreciationMethod: '直线法', location: '精密车间', stockQuantity: 2, unit: '台' },
        ],
        operators: [
          { id: 7, employeeCode: 'EMP20240007', employeeName: '孙八', deptName: '生产部', position: '操作工' },
        ],
        bom: {
          parentMaterial: { materialCode: 'MAT018', materialName: '手表屏幕', specModel: 'SCR-C3', stockQuantity: 200, supplier: '京东方', version: 'V1.0', category: '电子元件', location: '原料仓C区' },
          childMaterials: [],
        },
      },
      {
        id: 3,
        processId: 3,
        processCode: 'PRC003',
        stepName: '电池组装',
        description: '将电池组装到手表中',
        devices: [
          { id: 11, deviceCode: 'DEV011', deviceName: '精密组装台', manufacturer: '欧姆龙', brand: '欧姆龙', specModel: 'ASSEMBLE-300', supplier: '广州机电', productionDate: '2023-03-10', serviceLife: 10, depreciationMethod: '直线法', location: '精密车间', stockQuantity: 3, unit: '台' },
        ],
        operators: [
          { id: 3, employeeCode: 'EMP20240003', employeeName: '王五', deptName: '技术部', position: '工程师' },
          { id: 7, employeeCode: 'EMP20240007', employeeName: '孙八', deptName: '生产部', position: '操作工' },
        ],
        bom: {
          parentMaterial: { materialCode: 'MAT019', materialName: '手表电池', specModel: 'BAT-C3', stockQuantity: 250, supplier: '宁德时代', version: 'V1.0', category: '电子元件', location: '原料仓B区' },
          childMaterials: [],
        },
      },
      {
        id: 4,
        processId: 4,
        processCode: 'PRC004',
        stepName: '传感器安装',
        description: '安装各类传感器',
        devices: [
          { id: 11, deviceCode: 'DEV011', deviceName: '精密组装台', manufacturer: '欧姆龙', brand: '欧姆龙', specModel: 'ASSEMBLE-300', supplier: '广州机电', productionDate: '2023-03-10', serviceLife: 10, depreciationMethod: '直线法', location: '精密车间', stockQuantity: 3, unit: '台' },
        ],
        operators: [
          { id: 3, employeeCode: 'EMP20240003', employeeName: '王五', deptName: '技术部', position: '工程师' },
        ],
        bom: {
          parentMaterial: { materialCode: 'MAT020', materialName: '传感器模组', specModel: 'SENS-C3', stockQuantity: 300, supplier: '博世', version: 'V1.0', category: '电子元件', location: '原料仓H区' },
          childMaterials: [],
        },
      },
      {
        id: 5,
        processId: 5,
        processCode: 'PRC005',
        stepName: '外壳封装',
        description: '进行手表外壳封装',
        devices: [
          { id: 12, deviceCode: 'DEV012', deviceName: '精密封装机', manufacturer: '西门子', brand: '西门子', specModel: 'SEAL-200', supplier: '北京华工', productionDate: '2022-12-10', serviceLife: 12, depreciationMethod: '直线法', location: '精密车间', stockQuantity: 2, unit: '台' },
        ],
        operators: [
          { id: 7, employeeCode: 'EMP20240007', employeeName: '孙八', deptName: '生产部', position: '操作工' },
        ],
        bom: {
          parentMaterial: { materialCode: 'MAT021', materialName: '手表外壳', specModel: 'CASE-C3', stockQuantity: 180, supplier: '比亚迪', version: 'V1.0', category: '结构件', location: '原料仓F区' },
          childMaterials: [],
        },
      },
      {
        id: 6,
        processId: 6,
        processCode: 'PRC006',
        stepName: '防水测试',
        description: '进行防水性能测试',
        devices: [
          { id: 13, deviceCode: 'DEV013', deviceName: '防水测试仪', manufacturer: '是德科技', brand: '是德', specModel: 'WATER-500', supplier: '是德科技', productionDate: '2023-02-20', serviceLife: 15, depreciationMethod: '直线法', location: '质检中心', stockQuantity: 2, unit: '台' },
        ],
        operators: [
          { id: 4, employeeCode: 'EMP20240004', employeeName: '赵六', deptName: '质量部', position: '质检员' },
        ],
        bom: {
          parentMaterial: null,
          childMaterials: [],
        },
      },
      {
        id: 7,
        processId: 7,
        processCode: 'PRC007',
        stepName: '功能测试',
        description: '对手表进行功能测试',
        devices: [
          { id: 14, deviceCode: 'DEV014', deviceName: '手表测试仪', manufacturer: '是德科技', brand: '是德', specModel: 'TEST-500', supplier: '是德科技', productionDate: '2023-01-25', serviceLife: 15, depreciationMethod: '直线法', location: '质检中心', stockQuantity: 3, unit: '台' },
        ],
        operators: [
          { id: 4, employeeCode: 'EMP20240004', employeeName: '赵六', deptName: '质量部', position: '质检员' },
        ],
        bom: {
          parentMaterial: null,
          childMaterials: [],
        },
      },
      {
        id: 8,
        processId: 8,
        processCode: 'PRC008',
        stepName: '包装',
        description: '产品包装',
        devices: [
          { id: 15, deviceCode: 'DEV015', deviceName: '精密包装机', manufacturer: '西门子', brand: '西门子', specModel: 'PACK-300', supplier: '北京华工', productionDate: '2022-10-15', serviceLife: 12, depreciationMethod: '直线法', location: '包装车间', stockQuantity: 2, unit: '台' },
        ],
        operators: [
          { id: 5, employeeCode: 'EMP20240005', employeeName: '孙七', deptName: '生产部', position: '包装工' },
        ],
        bom: {
          parentMaterial: { materialCode: 'MAT022', materialName: '手表包装盒', specModel: 'BOX-C3', stockQuantity: 400, supplier: '包装材料厂', version: 'V1.0', category: '包材', location: '包材仓' },
          childMaterials: [],
        },
      },
    ],
  },
  4: {
    id: 4,
    processCode: 'PR004',
    processName: '蓝牙耳机制造工艺路线',
    version: 'V1.0',
    product: '蓝牙耳机D4',
    description: '该工艺路线用于蓝牙耳机D4的生产制造。',
    applicant: '赵六',
    submitTime: '2024-01-15 14:05:00',
    hasVersionHistory: false,
    processSteps: [
      {
        id: 1,
        processId: 1,
        processCode: 'PRC001',
        stepName: '主板焊接',
        description: '对主板进行焊接处理',
        devices: [
          { id: 16, deviceCode: 'DEV016', deviceName: '焊接机A', manufacturer: '西门子', brand: '西门子', specModel: 'WELD-800', supplier: '北京华工', productionDate: '2022-04-10', serviceLife: 15, depreciationMethod: '直线法', location: '焊接车间', stockQuantity: 4, unit: '台' },
        ],
        operators: [
          { id: 6, employeeCode: 'EMP20240006', employeeName: '周九', deptName: '生产部', position: '焊接工' },
        ],
        bom: {
          parentMaterial: { materialCode: 'MAT023', materialName: '耳机主板', specModel: 'MB-D4', stockQuantity: 300, supplier: '华为供应商', version: 'V1.0', category: '电子元件', location: '原料仓A区' },
          childMaterials: [],
        },
      },
      {
        id: 2,
        processId: 2,
        processCode: 'PRC002',
        stepName: '喇叭安装',
        description: '安装喇叭单元',
        devices: [
          { id: 17, deviceCode: 'DEV017', deviceName: '喇叭安装台', manufacturer: '欧姆龙', brand: '欧姆龙', specModel: 'INST-400', supplier: '广州机电', productionDate: '2023-02-15', serviceLife: 10, depreciationMethod: '直线法', location: '组装车间', stockQuantity: 3, unit: '台' },
        ],
        operators: [
          { id: 6, employeeCode: 'EMP20240006', employeeName: '周九', deptName: '生产部', position: '操作工' },
        ],
        bom: {
          parentMaterial: { materialCode: 'MAT024', materialName: '喇叭单元', specModel: 'SPK-D4', stockQuantity: 500, supplier: '瑞声科技', version: 'V1.0', category: '电子元件', location: '原料仓G区' },
          childMaterials: [],
        },
      },
      {
        id: 3,
        processId: 3,
        processCode: 'PRC003',
        stepName: '电池组装',
        description: '组装电池模块',
        devices: [
          { id: 18, deviceCode: 'DEV018', deviceName: '电池组装台', manufacturer: '三菱', brand: '三菱', specModel: 'BAT-INST-300', supplier: '上海精密', productionDate: '2022-09-20', serviceLife: 12, depreciationMethod: '直线法', location: '组装车间', stockQuantity: 2, unit: '台' },
        ],
        operators: [
          { id: 8, employeeCode: 'EMP20240008', employeeName: '吴十', deptName: '生产部', position: '操作工' },
        ],
        bom: {
          parentMaterial: { materialCode: 'MAT025', materialName: '耳机电池', specModel: 'BAT-D4', stockQuantity: 600, supplier: '宁德时代', version: 'V1.0', category: '电子元件', location: '原料仓B区' },
          childMaterials: [],
        },
      },
      {
        id: 4,
        processId: 4,
        processCode: 'PRC004',
        stepName: '外壳封装',
        description: '进行耳机外壳封装',
        devices: [
          { id: 19, deviceCode: 'DEV019', deviceName: '耳机封装机', manufacturer: '西门子', brand: '西门子', specModel: 'SEAL-300', supplier: '北京华工', productionDate: '2022-11-15', serviceLife: 12, depreciationMethod: '直线法', location: '组装车间', stockQuantity: 3, unit: '台' },
        ],
        operators: [
          { id: 6, employeeCode: 'EMP20240006', employeeName: '周九', deptName: '生产部', position: '操作工' },
          { id: 8, employeeCode: 'EMP20240008', employeeName: '吴十', deptName: '生产部', position: '操作工' },
        ],
        bom: {
          parentMaterial: { materialCode: 'MAT026', materialName: '耳机外壳', specModel: 'CASE-D4', stockQuantity: 400, supplier: '比亚迪', version: 'V1.0', category: '结构件', location: '原料仓F区' },
          childMaterials: [],
        },
      },
      {
        id: 5,
        processId: 5,
        processCode: 'PRC005',
        stepName: '功能测试',
        description: '对耳机进行功能测试',
        devices: [
          { id: 20, deviceCode: 'DEV020', deviceName: '耳机测试仪', manufacturer: '是德科技', brand: '是德', specModel: 'AUDIO-500', supplier: '是德科技', productionDate: '2023-01-10', serviceLife: 15, depreciationMethod: '直线法', location: '质检中心', stockQuantity: 4, unit: '台' },
        ],
        operators: [
          { id: 4, employeeCode: 'EMP20240004', employeeName: '赵六', deptName: '质量部', position: '质检员' },
        ],
        bom: {
          parentMaterial: null,
          childMaterials: [],
        },
      },
      {
        id: 6,
        processId: 6,
        processCode: 'PRC006',
        stepName: '包装',
        description: '产品包装',
        devices: [
          { id: 21, deviceCode: 'DEV021', deviceName: '耳机包装机', manufacturer: '欧姆龙', brand: '欧姆龙', specModel: 'PACK-400', supplier: '广州机电', productionDate: '2022-12-20', serviceLife: 10, depreciationMethod: '直线法', location: '包装车间', stockQuantity: 2, unit: '台' },
        ],
        operators: [
          { id: 5, employeeCode: 'EMP20240005', employeeName: '孙七', deptName: '生产部', position: '包装工' },
        ],
        bom: {
          parentMaterial: { materialCode: 'MAT027', materialName: '耳机包装盒', specModel: 'BOX-D4', stockQuantity: 500, supplier: '包装材料厂', version: 'V1.0', category: '包材', location: '包材仓' },
          childMaterials: [],
        },
      },
    ],
  },
  5: {
    id: 5,
    processCode: 'PR005',
    processName: '充电器生产工艺路线',
    version: 'V1.2',
    product: '充电器E5',
    description: '该工艺路线用于充电器E5的生产制造。',
    applicant: '钱七',
    submitTime: '2024-01-15 15:30:00',
    hasVersionHistory: false,
    processSteps: [
      {
        id: 1,
        processId: 1,
        processCode: 'PRC001',
        stepName: '电路板焊接',
        description: '对电路板进行焊接处理',
        devices: [
          { id: 22, deviceCode: 'DEV022', deviceName: '电路板焊接机', manufacturer: '西门子', brand: '西门子', specModel: 'PCB-WELD-600', supplier: '北京华工', productionDate: '2022-05-15', serviceLife: 15, depreciationMethod: '直线法', location: '焊接车间', stockQuantity: 3, unit: '台' },
        ],
        operators: [
          { id: 9, employeeCode: 'EMP20240009', employeeName: '钱七', deptName: '生产部', position: '焊接工' },
        ],
        bom: {
          parentMaterial: { materialCode: 'MAT028', materialName: '电路板', specModel: 'PCB-E5', stockQuantity: 200, supplier: '深南电路', version: 'V1.0', category: '电子元件', location: '原料仓A区' },
          childMaterials: [],
        },
      },
      {
        id: 2,
        processId: 2,
        processCode: 'PRC002',
        stepName: '外壳组装',
        description: '进行外壳组装',
        devices: [
          { id: 23, deviceCode: 'DEV023', deviceName: '外壳组装台', manufacturer: '欧姆龙', brand: '欧姆龙', specModel: 'CASE-INST-500', supplier: '广州机电', productionDate: '2023-01-20', serviceLife: 10, depreciationMethod: '直线法', location: '组装车间', stockQuantity: 4, unit: '台' },
        ],
        operators: [
          { id: 10, employeeCode: 'EMP20240010', employeeName: '吴十', deptName: '生产部', position: '操作工' },
        ],
        bom: {
          parentMaterial: { materialCode: 'MAT029', materialName: '充电器外壳', specModel: 'CASE-E5', stockQuantity: 250, supplier: '比亚迪', version: 'V1.0', category: '结构件', location: '原料仓F区' },
          childMaterials: [],
        },
      },
      {
        id: 3,
        processId: 3,
        processCode: 'PRC003',
        stepName: '线缆连接',
        description: '连接电源线缆',
        devices: [
          { id: 24, deviceCode: 'DEV024', deviceName: '线缆连接台', manufacturer: '三菱', brand: '三菱', specModel: 'CABLE-300', supplier: '上海精密', productionDate: '2022-10-10', serviceLife: 12, depreciationMethod: '直线法', location: '组装车间', stockQuantity: 2, unit: '台' },
        ],
        operators: [
          { id: 9, employeeCode: 'EMP20240009', employeeName: '钱七', deptName: '生产部', position: '操作工' },
        ],
        bom: {
          parentMaterial: { materialCode: 'MAT030', materialName: '电源线', specModel: 'CABLE-E5', stockQuantity: 300, supplier: '线缆供应商', version: 'V1.0', category: '配件', location: '配件仓' },
          childMaterials: [],
        },
      },
      {
        id: 4,
        processId: 4,
        processCode: 'PRC004',
        stepName: '功能测试',
        description: '对充电器进行功能测试',
        devices: [
          { id: 25, deviceCode: 'DEV025', deviceName: '充电器测试仪', manufacturer: '是德科技', brand: '是德', specModel: 'CHARGER-500', supplier: '是德科技', productionDate: '2022-11-20', serviceLife: 15, depreciationMethod: '直线法', location: '质检中心', stockQuantity: 3, unit: '台' },
        ],
        operators: [
          { id: 4, employeeCode: 'EMP20240004', employeeName: '赵六', deptName: '质量部', position: '质检员' },
        ],
        bom: {
          parentMaterial: null,
          childMaterials: [],
        },
      },
      {
        id: 5,
        processId: 5,
        processCode: 'PRC005',
        stepName: '包装',
        description: '产品包装',
        devices: [
          { id: 26, deviceCode: 'DEV026', deviceName: '充电器包装机', manufacturer: '西门子', brand: '西门子', specModel: 'PACK-500', supplier: '北京华工', productionDate: '2022-08-15', serviceLife: 12, depreciationMethod: '直线法', location: '包装车间', stockQuantity: 2, unit: '台' },
        ],
        operators: [
          { id: 5, employeeCode: 'EMP20240005', employeeName: '孙七', deptName: '生产部', position: '包装工' },
        ],
        bom: {
          parentMaterial: { materialCode: 'MAT031', materialName: '充电器包装盒', specModel: 'BOX-E5', stockQuantity: 350, supplier: '包装材料厂', version: 'V1.0', category: '包材', location: '包材仓' },
          childMaterials: [],
        },
      },
    ],
  },
}

const currentVersion = computed(() => {
  return mockVersionHistory.value[currentVersionIndex.value] || mockVersionHistory.value[0]
})

const currentProcessSteps = computed(() => {
  return currentVersion.value.processSteps || []
})

const selectedStep = computed(() => {
  return currentProcessSteps.value.find((step) => step.id === selectedStepId.value) || null
})

const handleSelectStep = (step) => {
  selectedStepId.value = step.id
}

const loadAuditData = () => {
  loading.value = true
  setTimeout(() => {
    const id = route.params.id
    const data = mockAuditData[id] || mockAuditData[1]
    auditData.value = { ...data }
    currentVersionIndex.value = mockVersionHistory.value.length - 1
    if (currentProcessSteps.value.length > 0) {
      selectedStepId.value = currentProcessSteps.value[0].id
    }
    loading.value = false
  }, 300)
}

const approveAudit = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: '审核通过' })
    }, 500)
  })
}

const rejectAudit = async (reason) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: '已驳回申请' })
    }, 500)
  })
}

const sendNotification = (auditStatus, rejectReasonText = '') => {
  const currentAuditor = userStore.userInfo?.name || '审核人'
  messageStore.addMessage({
    title: '工艺路线审核结果通知',
    summary: `您提交的"${currentVersion.value.processName}"${currentVersion.value.changeDescription.includes('新增') || currentVersion.value.version === 'V1.0' ? '新增' : '修改'}申请已${auditStatus}`,
    auditStatus: auditStatus,
    processCode: currentVersion.value.processCode,
    processName: currentVersion.value.processName,
    operationType:
      currentVersion.value.changeDescription.includes('新增') ||
      currentVersion.value.version === 'V1.0'
        ? '新增'
        : '修改',
    applicant: currentVersion.value.applicant,
    submitTime: currentVersion.value.submitTime,
    auditor: currentAuditor,
    auditTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
    rejectReason: rejectReasonText,
  })
}

const handleApprove = async () => {
  try {
    await ElMessageBox.confirm('确定通过该工艺路线申请吗？', '审核确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'success',
    })

    submitLoading.value = true
    const result = await approveAudit()
    submitLoading.value = false

    if (result.success) {
      sendNotification('已通过')
      ElMessage.success('审核通过')
      router.push('/audit-manage/audit-pending')
    }
  } catch {
    submitLoading.value = false
  }
}

const handleReject = () => {
  rejectReason.value = ''
  rejectDialogVisible.value = true
}

const handleRejectSubmit = async () => {
  if (!rejectReason.value.trim()) {
    ElMessage.warning('请输入驳回原因')
    return
  }
  if (rejectReason.value.length > 100) {
    ElMessage.warning('驳回原因不能超过100字')
    return
  }

  try {
    await ElMessageBox.confirm('确定驳回该工艺路线申请吗？', '审核确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    submitLoading.value = true
    const result = await rejectAudit(rejectReason.value)
    submitLoading.value = false

    if (result.success) {
      sendNotification('已驳回', rejectReason.value)
      ElMessage.success('已驳回申请')
      rejectDialogVisible.value = false
      router.push('/audit-manage/audit-pending')
    }
  } catch {
    submitLoading.value = false
  }
}

const handleBack = () => {
  router.push('/audit-manage/audit-pending')
}

const handleViewVersionHistory = () => {
  versionHistoryVisible.value = true
}

const handleSwitchVersion = (index) => {
  currentVersionIndex.value = index
  versionHistoryVisible.value = false
  if (currentProcessSteps.value.length > 0) {
    selectedStepId.value = currentProcessSteps.value[0].id
  }
  ElMessage.success(`已切换到版本 ${mockVersionHistory.value[index].version}`)
}

const handleCompareVersion = (oldIndex, newIndex) => {
  compareVersions.value = {
    old: mockVersionHistory.value[oldIndex],
    new: mockVersionHistory.value[newIndex],
  }
  compareDialogVisible.value = true
}

const getStatusType = (status) => {
  switch (status) {
    case '待审核':
      return 'warning'
    case '已通过':
      return 'success'
    case '已驳回':
      return 'danger'
    default:
      return 'info'
  }
}

onMounted(() => {
  loadAuditData()
})
</script>

<template>
  <div class="audit-pending-detail-container">
    <div class="detail-header">
      <div class="header-left">
        <el-button :icon="ArrowLeft" @click="handleBack">返回</el-button>
        <div class="title-area">
          <h2 class="page-title">{{ currentVersion.processName }}</h2>
          <span class="page-subtitle">待审核详情</span>
        </div>
      </div>
      <div class="header-right">
        <el-button
          v-if="auditData.hasVersionHistory"
          type="info"
          :icon="Clock"
          @click="handleViewVersionHistory"
        >
          版本历史
        </el-button>
        <el-button type="success" :icon="Check" :loading="submitLoading" @click="handleApprove"
          >通过</el-button
        >
        <el-button type="danger" :icon="Close" :loading="submitLoading" @click="handleReject"
          >驳回</el-button
        >
      </div>
    </div>

    <div v-loading="loading" class="detail-content">
      <div class="version-info-bar" v-if="auditData.hasVersionHistory">
        <el-tag type="primary" size="large">当前版本：{{ currentVersion.version }}</el-tag>
        <span class="version-meta">
          提交时间：{{ currentVersion.submitTime }} | 申请人：{{ currentVersion.applicant }}
        </span>
      </div>

      <div class="section-card">
        <div class="section-header">
          <span class="section-title">基础信息</span>
        </div>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">工艺编号</div>
            <div class="info-value">
              <el-tag size="default">{{ currentVersion.processCode }}</el-tag>
            </div>
          </div>
          <div class="info-item">
            <div class="info-label">工艺路线名称</div>
            <div class="info-value">{{ currentVersion.processName }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">版本</div>
            <div class="info-value">
              <el-tag type="primary" size="default">{{ currentVersion.version }}</el-tag>
            </div>
          </div>
          <div class="info-item">
            <div class="info-label">所属产品</div>
            <div class="info-value">{{ currentVersion.product }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">申请人</div>
            <div class="info-value">{{ currentVersion.applicant }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">提交时间</div>
            <div class="info-value">{{ currentVersion.submitTime }}</div>
          </div>
          <div class="info-item full-width">
            <div class="info-label">工艺描述</div>
            <div class="info-value">{{ currentVersion.description || '暂无' }}</div>
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

            <div v-if="currentProcessSteps.length === 0" class="empty-steps">
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
                  <span>物料</span>
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

    <el-dialog
      v-model="versionHistoryVisible"
      title="版本历史"
      width="900px"
      :close-on-click-modal="false"
      destroy-on-close
      class="version-history-dialog"
    >
      <div class="version-history-content">
        <el-timeline>
          <el-timeline-item
            v-for="(version, index) in mockVersionHistory"
            :key="index"
            :timestamp="version.submitTime"
            placement="top"
            :type="getStatusType(version.status)"
          >
            <div class="version-card" :class="{ active: index === currentVersionIndex }">
              <div class="version-header">
                <div class="version-title">
                  <el-tag :type="getStatusType(version.status)" size="default">
                    {{ version.status }}
                  </el-tag>
                  <span class="version-number">{{ version.version }}</span>
                </div>
                <div class="version-actions">
                  <el-button
                    type="primary"
                    link
                    size="small"
                    @click="handleSwitchVersion(index)"
                    :disabled="index === currentVersionIndex"
                  >
                    查看此版本
                  </el-button>
                  <el-button
                    v-if="index < mockVersionHistory.length - 1"
                    type="warning"
                    link
                    size="small"
                    @click="handleCompareVersion(index, mockVersionHistory.length - 1)"
                  >
                    与当前版本对比
                  </el-button>
                </div>
              </div>
              <div class="version-body">
                <div class="version-row">
                  <span class="label">修改说明：</span>
                  <span class="value">{{ version.changeDescription }}</span>
                </div>
                <div class="version-row">
                  <span class="label">申请人：</span>
                  <span class="value">{{ version.applicant }}</span>
                </div>
                <div v-if="version.rejectReason" class="version-row reject-reason">
                  <span class="label">驳回原因：</span>
                  <span class="value">{{ version.rejectReason }}</span>
                </div>
              </div>
            </div>
          </el-timeline-item>
        </el-timeline>
      </div>
    </el-dialog>

    <el-dialog
      v-model="compareDialogVisible"
      title="版本对比"
      width="1000px"
      :close-on-click-modal="false"
      destroy-on-close
      class="compare-dialog"
    >
      <div class="compare-content" v-if="compareVersions.old && compareVersions.new">
        <div class="compare-header">
          <div class="compare-col">
            <el-tag type="info">{{ compareVersions.old.version }}</el-tag>
            <span class="compare-time">{{ compareVersions.old.submitTime }}</span>
          </div>
          <div class="compare-arrow">
            <el-icon><Refresh /></el-icon>
          </div>
          <div class="compare-col">
            <el-tag type="primary">{{ compareVersions.new.version }}</el-tag>
            <span class="compare-time">{{ compareVersions.new.submitTime }}</span>
          </div>
        </div>
        <div class="compare-body">
          <div class="compare-item">
            <div class="compare-label">工艺描述</div>
            <div class="compare-values">
              <div class="compare-value old">
                <pre>{{ compareVersions.old.description }}</pre>
              </div>
              <div class="compare-value new">
                <pre>{{ compareVersions.new.description }}</pre>
              </div>
            </div>
          </div>
          <div class="compare-item">
            <div class="compare-label">工序列表</div>
            <div class="compare-values">
              <div class="compare-value old">
                <pre>{{ compareVersions.old.processSteps?.map(s => s.stepName).join(' → ') || '暂无' }}</pre>
              </div>
              <div class="compare-value new">
                <pre>{{ compareVersions.new.processSteps?.map(s => s.stepName).join(' → ') || '暂无' }}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>

    <el-dialog
      v-model="rejectDialogVisible"
      title="驳回原因"
      width="500px"
      :close-on-click-modal="false"
      destroy-on-close
      class="reject-dialog"
    >
      <el-input
        v-model="rejectReason"
        type="textarea"
        :rows="4"
        maxlength="100"
        show-word-limit
        placeholder="请输入驳回原因（不超过100字）"
      />
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="rejectDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="handleRejectSubmit"
            >确定驳回</el-button
          >
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.audit-pending-detail-container {
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

      .el-button {
        padding: 10px 20px;
        font-size: 14px;
      }
    }
  }

  .version-info-bar {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 12px 20px;
    background: #f0f9ff;
    border-radius: 4px;
    margin-bottom: 20px;
    border: 1px solid #b3d8ff;

    .version-meta {
      font-size: 14px;
      color: #606266;
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
    }
  }
}

.version-history-dialog {
  .version-history-content {
    max-height: 500px;
    overflow-y: auto;
    padding-right: 10px;

    .version-card {
      background: #fafafa;
      border-radius: 8px;
      padding: 16px;
      border: 1px solid #e4e7ed;
      transition: all 0.3s;

      &.active {
        border-color: #409eff;
        background: #f0f9ff;
      }

      .version-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        .version-title {
          display: flex;
          align-items: center;
          gap: 12px;

          .version-number {
            font-size: 18px;
            font-weight: 600;
            color: #303133;
          }
        }

        .version-actions {
          display: flex;
          gap: 8px;
        }
      }

      .version-body {
        .version-row {
          display: flex;
          margin-bottom: 8px;
          font-size: 14px;

          &:last-child {
            margin-bottom: 0;
          }

          .label {
            color: #909399;
            min-width: 80px;
          }

          .value {
            color: #303133;
            flex: 1;
          }

          &.reject-reason {
            .value {
              color: #f56c6c;
            }
          }
        }
      }
    }
  }
}

.compare-dialog {
  .compare-content {
    .compare-header {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 20px;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 1px solid #ebeef5;

      .compare-col {
        display: flex;
        align-items: center;
        gap: 12px;

        .compare-time {
          font-size: 14px;
          color: #909399;
        }
      }

      .compare-arrow {
        color: #409eff;
        font-size: 20px;
      }
    }

    .compare-body {
      .compare-item {
        margin-bottom: 20px;

        &:last-child {
          margin-bottom: 0;
        }

        .compare-label {
          font-size: 16px;
          font-weight: 500;
          color: #303133;
          margin-bottom: 12px;
        }

        .compare-values {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;

          .compare-value {
            padding: 16px;
            border-radius: 4px;
            font-size: 14px;
            line-height: 1.6;

            &.old {
              background: #fef0f0;
              border: 1px solid #fbc4c4;
              color: #f56c6c;
            }

            &.new {
              background: #f0f9ff;
              border: 1px solid #b3d8ff;
              color: #409eff;
            }

            pre {
              margin: 0;
              white-space: pre-wrap;
              word-wrap: break-word;
              font-family: inherit;
            }
          }
        }
      }
    }
  }
}

.reject-dialog {
  :deep(.el-dialog__header) {
    padding: 14px 21px;
    border-bottom: 1px solid #ebeef5;
    margin-right: 0;
  }

  :deep(.el-dialog__body) {
    padding: 20px;
  }

  :deep(.el-dialog__footer) {
    padding: 14px 20px;
    border-top: 1px solid #ebeef5;
  }
}

@media screen and (max-width: 1200px) {
  .audit-pending-detail-container {
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
  .audit-pending-detail-container {
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
