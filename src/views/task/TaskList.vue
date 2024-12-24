<template>
    <div>
      <!-- 列表标题 -->
      <h1>{{ currentListTitle }}</h1>
  
      <!-- 切换任务列表的按钮 -->
      <div>
        <button @click="fetchTasks('uncompleted')" :class="{ active: currentType === 'uncompleted' }">
          未完成任务
        </button>
        <button @click="fetchTasks('completed')" :class="{ active: currentType === 'completed' }">
          已完成任务
        </button>
        <button @click="fetchTasks('overdue')" :class="{ active: currentType === 'overdue' }">
          逾期任务
        </button>
        <button @click="fetchTasks('trash')" :class="{ active: currentType === 'trash' }">
          回收站
        </button>
      </div>
  
      <!-- 任务列表 -->
      <ul v-if="tasks.length > 0">
        <li v-for="task in tasks" :key="task.id">
          <span :style="{ color: task.category?.color }">
            {{ task.title }}
          </span>
          - {{ task.description }}
          <span v-if="task.dueDate">（截止日期：{{ formatDate(task.dueDate) }}）</span>
        </li>
      </ul>
  
      <!-- 如果没有任务 -->
      <p v-else>当前列表没有任务</p>
    </div>
  </template>
  
  <script>
  import axios from "axios";
  
  export default {
    data() {
      return {
        tasks: [], // 当前显示的任务列表
        currentType: "uncompleted", // 当前任务类型
        currentListTitle: "未完成任务", // 当前任务列表的标题
      };
    },
    methods: {
      // 切换任务列表类型并获取数据
      fetchTasks(type) {
        this.currentType = type;
  
        // 动态设置接口 URL 和标题
        let url;
        if (type === "uncompleted") {
          this.currentListTitle = "未完成任务";
          url = "/api/tasks/uncompletedList";
        } else if (type === "completed") {
          this.currentListTitle = "已完成任务";
          url = "/api/tasks/completedList";
        } else if (type === "overdue") {
          this.currentListTitle = "逾期任务";
          url = "/api/tasks/overdueList";
        } else if (type === "trash") {
          this.currentListTitle = "回收站";
          url = "/api/tasks/trashList";
        }
  
        // 发送请求获取任务列表数据
        axios
          .get(url, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`, // 携带 Token
            },
          })
          .then((response) => {
            this.tasks = response.data.data; // 设置任务列表
          })
          .catch((error) => {
            console.error("获取任务列表失败", error);
            this.tasks = []; // 清空任务列表
          });
      },
      // 格式化日期
      formatDate(dateString) {
        const options = { year: "numeric", month: "long", day: "numeric" };
        return new Date(dateString).toLocaleDateString(undefined, options);
      },
    },
    mounted() {
      // 页面加载时默认获取未完成任务列表
      this.fetchTasks("uncompleted");
    },
  };
  </script>
  
  <style scoped>
  /* 样式 */
  button {
    margin: 5px;
    padding: 10px 15px;
    border: 1px solid #ccc;
    background-color: #fff;
    cursor: pointer;
  }
  
  button.active {
    background-color: #007bff;
    color: white;
    border-color: #007bff;
  }
  
  ul {
    list-style: none;
    padding: 0;
  }
  
  li {
    margin: 10px 0;
  }
  
  p {
    color: gray;
  }
  </style>
  