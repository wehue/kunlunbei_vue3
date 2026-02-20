<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Rank, Plus, Delete } from '@element-plus/icons-vue'
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

const deviceOptions = [
  { label: '数控车床', value: '数控车床' },
  { label: '数控铣床', value: '数控铣床' },
  { label: '磨床', value: '磨床' },
  { label: '焊接设备', value: '焊接设备' },
  { label: '检测设备', value: '检测设备' },
  { label: '组装台', value: '组装台' },
]

const operatorOptions = [
  { label: '张三', value: '张三' },
  { label: '李四', value: '李四' },
  { label: '王五', value: '王五' },
  { label: '赵六', value: '赵六' },
  { label: '孙七', value: '孙七' },
]

const bomOptions = [
  { label: '铝合金板', value: '铝合金板' },
  { label: '黄铜', value: '黄铜' },
  { label: '碳钢', value: '碳钢' },
  { label: 'ABS塑料', value: 'ABS塑料' },
  { label: '集成电路', value: '集成电路' },
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

const selectedStep = computed(() => {
  return formData.processSteps.find((step) => step.id === selectedStepId.value) || null
})

const rules = {
  routeName: [{ required: true, message: '请输入工艺路线名称', trigger: 'blur' }],
  product: [{ required: true, message: '请选择所属产品', trigger: 'change' }],
}

const canSubmitAudit = computed(() => currentRole.value === 'designer')

const generateRouteCode = () => {
  const year = new Date().getFullYear()
  const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0')
  return `PR${year}${random}`
}

formData.routeCode = generateRouteCode()

const handleAddStep = () => {
  const newStep = {
    id: Date.now(),
    stepName: '',
    devices: [],
    operators: [],
    bomItems: [],
  }
  formData.processSteps.push(newStep)
  selectedStepId.value = newStep.id
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

      const hasEmptyStep = formData.processSteps.some((s) => !s.stepName)
      if (hasEmptyStep) {
        ElMessage.warning('请完善工艺流程步骤名称')
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

      const hasEmptyStep = formData.processSteps.some((s) => !s.stepName)
      if (hasEmptyStep) {
        ElMessage.warning('请完善工艺流程步骤名称')
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
            <span class="section-title">工序配置</span>
            <el-button type="primary" :icon="Plus" @click="handleAddStep">添加工序</el-button>
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
                    <div class="step-card-summary">
                      <el-tag size="small" type="info" v-if="element.devices?.length">
                        设备: {{ element.devices.length }}
                      </el-tag>
                      <el-tag size="small" type="success" v-if="element.operators?.length">
                        人员: {{ element.operators.length }}
                      </el-tag>
                      <el-tag size="small" type="warning" v-if="element.bomItems?.length">
                        物料: {{ element.bomItems.length }}
                      </el-tag>
                    </div>
                  </div>
                </template>
              </draggable>
              <div v-if="formData.processSteps.length === 0" class="empty-steps">
                暂无工序，点击上方按钮添加
              </div>
            </div>

            <div class="detail-panel">
              <div class="panel-header">工序详情</div>
              <div v-if="selectedStep" class="step-detail-content">
                <el-form-item label="工序名称">
                  <el-input v-model="selectedStep.stepName" placeholder="请输入工序名称" />
                </el-form-item>

                <div class="detail-section">
                  <div class="detail-section-title">设备配置</div>
                  <el-select
                    v-model="selectedStep.devices"
                    multiple
                    placeholder="选择设备"
                    style="width: 100%"
                  >
                    <el-option
                      v-for="item in deviceOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                  <div class="selected-items">
                    <el-tag
                      v-for="device in selectedStep.devices"
                      :key="device"
                      size="small"
                      closable
                      @close="
                        (e) => {
                          e.stopPropagation()
                          const idx = selectedStep.devices.indexOf(device)
                          if (idx > -1) selectedStep.devices.splice(idx, 1)
                        }
                      "
                    >
                      {{ device }}
                    </el-tag>
                  </div>
                </div>

                <div class="detail-section">
                  <div class="detail-section-title">操作人员</div>
                  <el-select
                    v-model="selectedStep.operators"
                    multiple
                    placeholder="选择操作人员"
                    style="width: 100%"
                  >
                    <el-option
                      v-for="item in operatorOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                  <div class="selected-items">
                    <el-tag
                      v-for="operator in selectedStep.operators"
                      :key="operator"
                      type="success"
                      size="small"
                      closable
                      @close="
                        (e) => {
                          e.stopPropagation()
                          const idx = selectedStep.operators.indexOf(operator)
                          if (idx > -1) selectedStep.operators.splice(idx, 1)
                        }
                      "
                    >
                      {{ operator }}
                    </el-tag>
                  </div>
                </div>

                <div class="detail-section">
                  <div class="detail-section-title">物料BOM</div>
                  <el-select
                    v-model="selectedStep.bomItems"
                    multiple
                    placeholder="选择物料"
                    style="width: 100%"
                  >
                    <el-option
                      v-for="item in bomOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                  <div class="selected-items">
                    <el-tag
                      v-for="bom in selectedStep.bomItems"
                      :key="bom"
                      type="warning"
                      size="small"
                      closable
                      @close="
                        (e) => {
                          e.stopPropagation()
                          const idx = selectedStep.bomItems.indexOf(bom)
                          if (idx > -1) selectedStep.bomItems.splice(idx, 1)
                        }
                      "
                    >
                      {{ bom }}
                    </el-tag>
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
        height: 600px;
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

              .step-card-summary {
                padding: 0 14px 12px;
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
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
            padding: 24px;

            :deep(.el-form-item) {
              margin-bottom: 20px;

              .el-form-item__label {
                font-size: 15px;
                color: #606266;
                font-weight: 500;
              }
            }

            .detail-section {
              margin-bottom: 24px;

              .detail-section-title {
                font-size: 15px;
                font-weight: 600;
                color: #303133;
                margin-bottom: 12px;
                padding-left: 10px;
                border-left: 3px solid #409eff;
              }

              .selected-items {
                margin-top: 12px;
                display: flex;
                gap: 8px;
                flex-wrap: wrap;

                .el-tag {
                  margin: 0;
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
