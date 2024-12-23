<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  visible: Boolean,
  taskTitle: String
})

const emit = defineEmits(['update:visible', 'timerComplete'])

const minutes = ref(25) // 默认25分钟
const seconds = ref(0)
const timer = ref(null)
const isRunning = ref(false)

const startTimer = () => {
  if (isRunning.value) return
  
  isRunning.value = true
  timer.value = setInterval(() => {
    if (seconds.value === 0) {
      if (minutes.value === 0) {
        clearInterval(timer.value)
        isRunning.value = false
        ElMessage.success('计时完成！')
        emit('timerComplete')
        closeDialog()
        return
      }
      minutes.value--
      seconds.value = 59
    } else {
      seconds.value--
    }
  }, 1000)
}

const pauseTimer = () => {
  clearInterval(timer.value)
  isRunning.value = false
}

const resetTimer = () => {
  clearInterval(timer.value)
  isRunning.value = false
  minutes.value = 25
  seconds.value = 0
}

const closeDialog = () => {
  pauseTimer()
  resetTimer()
  emit('update:visible', false)
}

// ��件销毁时清除定时器
onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value)
  }
})
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="`任务计时器 - ${taskTitle}`"
    width="300px"
    @close="closeDialog"
  >
    <div class="timer-container">
      <div class="time-display">
        {{ String(minutes).padStart(2, '0') }}:{{ String(seconds).padStart(2, '0') }}
      </div>
      <div class="controls">
        <el-button type="primary" @click="startTimer" :disabled="isRunning">
          开始
        </el-button>
        <el-button type="warning" @click="pauseTimer" :disabled="!isRunning">
          暂停
        </el-button>
        <el-button @click="resetTimer">重置</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<style scoped>
.timer-container {
  text-align: center;
}

.time-display {
  font-size: 48px;
  font-weight: bold;
  margin: 20px 0;
}

.controls {
  display: flex;
  justify-content: center;
  gap: 10px;
}
</style> 