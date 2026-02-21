<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, ArrowLeft } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const isEdit = ref(false)
const loading = ref(false)
const deptData = ref({})
const formData = reactive({})
const formRef = ref()

const deptOptions = ref([])

const mockDeptData = {
  1: { id: 1, deptCode: 'DEPT20240001', deptName: '技术部', parentId: null, parentName: '', establishDate: '2020-01-15' },
  2: { id: 2, deptCode: 'DEPT20240002', deptName: '生产部', parentId: null, parentName: '', establishDate: '2020-02-20' },
  3: { id: 3, deptCode: 'DEPT20240003', deptName: '质量部', parentId: null, parentName: '', establishDate: '2020-03-10' },
  4: { id: 4, deptCode: 'DEPT20240004', deptName: '采购部', parentId: null, parentName: '', establishDate: '2020-04-05' },
  5: { id: 5, deptCode: 'DEPT20240005', deptName: '销售部', parentId: null, parentName: '', establishDate: '2020-05-12' },
  6: { id: 6, deptCode: 'DEPT20240006', deptName: '财务部', parentId: null, parentName: '', establishDate: '2020-06-18' },
  7: { id: 7, deptCode: 'DEPT20240007', deptName: '人力资源部', parentId: null, parentName: '', establishDate: '2020-07-22' },
  8: { id: 8, deptCode: 'DEPT20240008', deptName: '研发中心', parentId: 1, parentName: '技术部', establishDate: '2021-01-08' },
  9: { id: 9, deptCode: 'DEPT20240009', deptName: '测试中心', parentId: 1, parentName: '技术部', establishDate: '2021-02-15' },
  10: { id: 10, deptCode: 'DEPT20240010', deptName: '生产一车间', parentId: 2, parentName: '生产部', establishDate: '2021-03-20' },
  11: { id: 11, deptCode: 'DEPT20240011', deptName: '生产二车间', parentId: 2, parentName: '生产部', establishDate: '2021-04-10' },
  12: { id: 12, deptCode: 'DEPT20240012', deptName: '仓储中心', parentId: 2, parentName: '生产部', establishDate: '2021-05-05' },
}

const initDeptOptions = () => {
  const allDepts = Object.values(mockDeptData)
  deptOptions.value = allDepts
    .filter((item) => !item.parentId && item.id !== deptData.value.id)
    .map((item) => ({ label: item.deptName, value: item.id }))
}

const loadDeptData = () => {
  loading.value = true
  setTimeout(() => {
    const id = route.params.id
    const data = mockDeptData[id] || mockDeptData[1]
    deptData.value = { ...data }
    Object.assign(formData, data)
    initDeptOptions()
    loading.value = false
  }, 300)
}

const handleEdit = () => {
  isEdit.value = true
  Object.assign(formData, deptData.value)
}

const handleCancel = () => {
  ElMessageBox.confirm('确定要取消编辑吗？未保存的数据将丢失', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      isEdit.value = false
      Object.assign(formData, deptData.value)
    })
    .catch(() => {})
}

const handleSave = async () => {
  if (!formRef.value) return

  await formRef.value.validate((valid) => {
    if (valid) {
      Object.assign(deptData.value, formData)
      mockDeptData[deptData.value.id] = { ...deptData.value }
      ElMessage.success('保存成功')
      isEdit.value = false
    }
  })
}

const handleBack = () => {
  router.push('/dept-manage/dept-manage-info')
}

const handleParentChange = (val) => {
  if (val) {
    const parent = deptOptions.value.find((item) => item.value === val)
    formData.parentName = parent ? parent.label : ''
  } else {
    formData.parentName = ''
  }
}

const rules = {
  deptName: [{ required: true, message: '请输入部门名称', trigger: 'blur' }],
  establishDate: [{ required: true, message: '请选择成立时间', trigger: 'change' }],
}

onMounted(() => {
  loadDeptData()
})
</script>

<template>
  <div class="dept-detail-container">
    <div class="detail-header">
      <div class="header-left">
        <el-button :icon="ArrowLeft" @click="handleBack">返回</el-button>
        <div class="title-area">
          <h2 class="page-title">{{ deptData.deptName }}</h2>
          <span class="page-subtitle">部门详情</span>
        </div>
      </div>
      <div class="header-right">
        <template v-if="!isEdit">
          <el-button type="primary" :icon="Edit" @click="handleEdit">编辑</el-button>
        </template>
        <template v-else>
          <el-button type="primary" @click="handleSave">保存</el-button>
          <el-button @click="handleCancel">取消</el-button>
        </template>
      </div>
    </div>

    <div v-loading="loading" class="detail-content">
      <div class="section-card">
        <div class="section-header">
          <span class="section-title">基本信息</span>
        </div>

        <template v-if="!isEdit">
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">部门编号</div>
              <div class="info-value">
                <el-tag size="default">{{ deptData.deptCode }}</el-tag>
              </div>
            </div>
            <div class="info-item">
              <div class="info-label">部门名称</div>
              <div class="info-value">{{ deptData.deptName }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">所属部门</div>
              <div class="info-value">
                <el-tag v-if="deptData.parentName" type="success" size="default">{{ deptData.parentName }}</el-tag>
                <span v-else>-</span>
              </div>
            </div>
            <div class="info-item">
              <div class="info-label">成立时间</div>
              <div class="info-value">{{ deptData.establishDate }}</div>
            </div>
          </div>
        </template>

        <template v-else>
          <el-form ref="formRef" :model="formData" :rules="rules" label-position="top">
            <div class="form-grid">
              <el-form-item label="部门编号">
                <el-input v-model="formData.deptCode" disabled placeholder="系统自动生成" />
              </el-form-item>
              <el-form-item label="部门名称" prop="deptName">
                <el-input v-model="formData.deptName" placeholder="请输入部门名称" />
              </el-form-item>
              <el-form-item label="所属部门">
                <el-select
                  v-model="formData.parentId"
                  placeholder="请选择所属部门"
                  clearable
                  style="width: 100%"
                  @change="handleParentChange"
                >
                  <el-option
                    v-for="item in deptOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="成立时间" prop="establishDate">
                <el-date-picker
                  v-model="formData.establishDate"
                  type="date"
                  placeholder="请选择成立时间"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                />
              </el-form-item>
            </div>
          </el-form>
        </template>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.dept-detail-container {
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

          .info-label {
            width: 110px;
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

      .form-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px 32px;
        padding: 24px;

        :deep(.el-form-item) {
          margin-bottom: 0;

          .el-form-item__label {
            font-size: 18px;
            color: #606266;
            font-weight: 500;
            padding-bottom: 8px;
          }
        }
      }
    }
  }
}

@media screen and (max-width: 1200px) {
  .dept-detail-container {
    .detail-content {
      .section-card {
        .info-grid {
          grid-template-columns: repeat(2, 1fr);
        }

        .form-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .dept-detail-container {
    .detail-content {
      .section-card {
        .info-grid {
          grid-template-columns: 1fr;
        }

        .form-grid {
          grid-template-columns: 1fr;
        }
      }
    }
  }
}
</style>
