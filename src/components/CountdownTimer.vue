<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
// 导入音频文件
import reminderSoundUrl from '@/assets/sounds/reminder.mp3'
import completeSoundUrl from '@/assets/sounds/complete.mp3'

const props = defineProps({
  visible: Boolean,
  taskTitle: String
})

const emit = defineEmits(['update:visible', 'timerComplete'])

const DEFAULT_MINUTES = 30
const REMINDER_MINUTES = 5

// 创建音频对象并使用导入的URL
const reminderSound = new Audio(reminderSoundUrl)
const completeSound = new Audio(completeSoundUrl)

const selectedHours = ref(0)
const selectedMinutes = ref(DEFAULT_MINUTES)
const selectedSeconds = ref(0)
const totalSeconds = ref(0)
const isRunning = ref(false)
const isDefaultTimer = ref(true)
let timer = null

// 添加声音开关状态
const soundEnabled = ref(true)

// 检查是否是默认时间设置
const checkIfDefaultTime = () => {
  return selectedHours.value === 0 && 
         selectedMinutes.value === DEFAULT_MINUTES && 
         selectedSeconds.value === 0
}

// 格式化显示时间
const formattedTime = computed(() => {
  const hours = Math.floor(totalSeconds.value / 3600)
  const minutes = Math.floor((totalSeconds.value % 3600) / 60)
  const seconds = totalSeconds.value % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

// 初始化倒计时
const initializeCountdown = () => {
  // 如果没有设置时间，使用默认30分钟
  if (selectedHours.value === 0 && selectedMinutes.value === 0 && selectedSeconds.value === 0) {
    selectedMinutes.value = DEFAULT_MINUTES
    isDefaultTimer.value = true
  } else {
    // 检查当前设置是否为默认时间
    isDefaultTimer.value = checkIfDefaultTime()
  }
  totalSeconds.value = (selectedHours.value * 3600) + (selectedMinutes.value * 60) + selectedSeconds.value
}

// 播放提醒声音
const playReminderSound = () => {
  if (!soundEnabled.value) return
  reminderSound.currentTime = 0 // 重置到开始位置
  reminderSound.play().catch(error => {
    console.error('播放提醒声音失败:', error)
  })
}

// 播放完成声音
const playCompleteSound = () => {
  if (!soundEnabled.value) return
  completeSound.currentTime = 0
  completeSound.play().catch(error => {
    console.error('播放完成声音失败:', error)
  })
}

// 切换声音的方法
const toggleSound = () => {
  soundEnabled.value = !soundEnabled.value
}

// 开始倒计时
const startCountdown = () => {
  if (totalSeconds.value === 0) {
    initializeCountdown()  // 此时会检查是否需要使用默认值
  }
  // 开始时重新检查是否是默认时间
  isDefaultTimer.value = checkIfDefaultTime()
  
  if (!isRunning.value) {
    isRunning.value = true
    timer = setInterval(() => {
      if (totalSeconds.value > 0) {
        totalSeconds.value -= 1
        // 只在默认30分钟的情况下提醒
        if (isDefaultTimer.value && totalSeconds.value === REMINDER_MINUTES * 60) {
          playReminderSound() // 播放提醒声音
          ElMessage({
            message: '还剩5分钟,休息时间到啦！',
            type: 'warning',
            duration: 5000  // 显示5秒
          })
        }
      } else {
        pauseCountdown()
        playCompleteSound() // 播放完成声音
        ElMessage.success('倒计时完成！')
        emit('timerComplete')
        closeDialog()
      }
    }, 1000)
  }
}

// 暂停倒计时
const pauseCountdown = () => {
  isRunning.value = false
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

// 重新开始倒计时
const restartCountdown = () => {
  pauseCountdown()
  initializeCountdown()
  startCountdown()
}

// 确认设置时间
const confirmTime = () => {
  pauseCountdown()
  initializeCountdown()
}

// 关闭对话框
const closeDialog = () => {
  emit('update:visible', false)
}

// 完全停止计时(添加新方法)
const stopTimer = () => {
  pauseCountdown()
  selectedHours.value = 0
  selectedMinutes.value = 0
  selectedSeconds.value = 0
  totalSeconds.value = 0
}

// 使用默认时间的方法
const useDefaultTime = () => {
  selectedMinutes.value = DEFAULT_MINUTES
  selectedHours.value = 0
  selectedSeconds.value = 0
  isDefaultTimer.value = true
  initializeCountdown()
}

// 当手动修改时间时，检查是否是默认时间
const handleTimeChange = () => {
  isDefaultTimer.value = checkIfDefaultTime()
}

// 组件卸载时清理音频资源
onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
  // 停止并清理所有音频
  reminderSound.pause()
  completeSound.pause()
  reminderSound.currentTime = 0
  completeSound.currentTime = 0
})
</script>

<template>
  <el-dialog
    :modelValue="visible"
    title="倒计时设置"
    width="800px"
    @close="closeDialog"
  >
    <div class="timer-settings">
      <el-button 
        type="primary" 
        plain 
        @click="useDefaultTime"
      >
        使用默认时间(30分钟)
      </el-button>
      
      <div class="time-inputs">
        <el-input-number 
          v-model="selectedHours" 
          :min="0" 
          :max="23" 
          placeholder="时"
          @change="handleTimeChange"
        />
        <el-input-number 
          v-model="selectedMinutes" 
          :min="0" 
          :max="59" 
          placeholder="分"
          @change="handleTimeChange"
        />
        <el-input-number 
          v-model="selectedSeconds" 
          :min="0" 
          :max="59" 
          placeholder="秒"
          @change="handleTimeChange"
        />
      </div>

      <div class="timer-display" v-if="totalSeconds > 0">
        {{ Math.floor(totalSeconds / 3600).toString().padStart(2, '0') }}:
        {{ Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0') }}:
        {{ (totalSeconds % 60).toString().padStart(2, '0') }}
      </div>

      <div class="timer-controls">
        <el-button type="primary" @click="startCountdown" :disabled="isRunning">
          开始
        </el-button>
        <el-button type="warning" @click="pauseCountdown" :disabled="!isRunning">
          暂停
        </el-button>
        <el-button @click="restartCountdown">重新开始</el-button>
        <el-button type="danger" @click="stopTimer">停止计时</el-button>
      </div>

      <!-- 声音控制开关 -->
      <div class="sound-control">
        <el-button 
          :type="soundEnabled ? 'success' : 'info'"
          @click="soundEnabled = !soundEnabled"
        >
          <template #icon>
            <el-icon>
              <i :class="soundEnabled ? 'el-icon-bell' : 'el-icon-mute-notification'" />
            </el-icon>
          </template>
          {{ soundEnabled ? '提示音已开启' : '提示音已关闭' }}
        </el-button>
      </div>
    </div>
  </el-dialog>

  <!-- 最小化显示 -->
  <div v-if="isRunning && !visible" 
       class="mini-timer" 
       @click="$emit('update:visible', true)">
    {{ Math.floor(totalSeconds / 3600).toString().padStart(2, '0') }}:
    {{ Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0') }}:
    {{ (totalSeconds % 60).toString().padStart(2, '0') }}
  </div>
</template>

<style scoped>
.countdown-container {
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

.mini-timer {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px 15px;
  border-radius: 20px;
  font-size: 16px;
  cursor: pointer;
  z-index: 2000;
  transition: all 0.3s;
}

.mini-timer:hover {
  background-color: rgba(0, 0, 0, 0.8);
  transform: scale(1.05);
}

.sound-settings {
  margin-top: 15px;
  text-align: center;
}

.sound-control {
  margin-top: 20px;
  text-align: center;
}

.timer-settings {
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
}

.time-inputs {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.timer-display {
  font-size: 40px;
  font-weight: bold;
  text-align: center;
  margin: 20px 0;
  font-family: monospace;
}

.timer-controls {
  display: flex;
  justify-content: center;
  gap: 10px;
}
</style> 