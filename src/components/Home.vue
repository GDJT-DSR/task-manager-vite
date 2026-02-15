<template>
  <el-container class="layout-container-demo" style="height: 100vh;">
    <el-aside width="230px" v-if="!isMobileRef">
      <side-bar @select="selectHandler" :tasks="tasks" :rates="rates" :default-active="defaultActive"></side-bar>
    </el-aside>

    <el-container>
      <el-header class="layout-header">
        <div class="menu">
          <el-button v-if="isMobileRef" class="menu-btn" @click="drawer = true" circle size="large">
            <el-icon><icon-menu></icon-menu></el-icon>
          </el-button>
        </div>
        <div class="header-right">
          <el-dropdown>
            <span class="user-info">
              <el-icon>
                <Avatar />
              </el-icon>

              <span class="user-name">{{ username }}</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="showChangePwd = true">更改密码</el-dropdown-item>
                <el-dropdown-item divided @click="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main>
        <!-- <TaskList v-if="active.startsWith('1-')" :active-id="activeId" :tasks="tasks"></TaskList> -->
        <AutoLoad :visible="active.startsWith('1-')" v-if="tasks">
          <TaskList :active-id="activeId" :tasks="tasks"></TaskList>
        </AutoLoad>
        <AutoLoad :visible="active.startsWith('2-')" v-if="rates">
          <RateList :active-id="activeId" :rates="rates"></RateList>
        </AutoLoad>
        <el-empty v-if="!active">
          <template #description>
            请选择任务以查看
          </template>
        </el-empty>
      </el-main>
    </el-container>
  </el-container>
  <el-drawer v-if="isMobileRef" v-model="drawer" direction="ltr" :lock-scroll="true" size="min(270px,90%)"
    :with-header="false" body-class="drawer-body">
    <side-bar @select="selectHandler" :tasks="tasks" :rates="rates" :default-active="defaultActive"></side-bar>
  </el-drawer>

  <ChangePassword v-if="showChangePwd" v-model="showChangePwd" :allow-other-close="true"></ChangePassword>

</template>


<style scoped lang="scss">
.layout-container-demo .el-aside {
  color: var(--el-text-color-primary);
  height: 100dvh;
}

.layout-container-demo .el-menu {
  border-right: none;
}

.layout-container-demo .el-main {
  padding: 0;
}

.layout-container-demo .toolbar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  right: 20px;
  font-size: 1.8rem;
  position: absolute;
}

.layout-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background-color: #b9daf9;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  border-bottom: 1px solid #f0f0f0;
  z-index: 10;
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-info {
  font-size: 1.3rem;
  color: black;
}

.user-info:hover {
  cursor: pointer;
}
</style>

<style>
.drawer-body {
  padding: 0;
}
</style>

<script setup lang="ts">
// import Swal from 'sweetalert2';
import { computed, defineAsyncComponent, onMounted, ref, type Ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getPermission, doRequest } from '../common'
import type { Task, ScoreTask } from '../interfaces';

import { Menu as IconMenu, Avatar } from '@element-plus/icons-vue'
import { ElMessageBox, ElNotification } from 'element-plus';
import { isMobileRef } from '../common';
import { USER_SCORE_PERMISSION, USER_VIEWPAGE_PERMISSION } from './constants';

const ChangePassword = defineAsyncComponent(() => import('./common/ChangePassword.vue'));
const TaskList = defineAsyncComponent(() => import('./tasks/TaskList.vue'));


const drawer = ref(false);
const showChangePwd = ref(false);

const username = localStorage.getItem('name')

onMounted(() => {
  // getTasks();
  // getPermission().then(b => {
  // b && getScores();
  // })
  getPermission().then(permission => {
    if (permission === -1) { return; }
    (permission & USER_VIEWPAGE_PERMISSION) && getTasks();
    (permission & USER_SCORE_PERMISSION) && getScores();
  })
});

const tasks: Ref<Task[] | null> = ref(null);
const rates: Ref<ScoreTask[] | null> = ref(null);

async function getTasks() {
  try {
    const body = await doRequest<Task[]>(`/api/page`, 'get');
    if (body.code !== 200 || !body.data) {
      ElNotification({
        title: '获取任务列表失败',
        message: body.msg,
        type: 'error',
      })
      return true
    }
    tasks.value = body.data;
  } catch (e) {
    ElNotification({
      title: '获取任务列表失败',
      type: 'error',
    })
    console.error(e);
  }
  return true
}

async function getScores() {
  try {
    const resp = await doRequest<ScoreTask[]>('/api/score', 'get');
    if (resp.code !== 200 || !resp.data) {
      ElNotification({
        title: "获取打分列表失败",
        message: resp.msg,
        type: 'error'
      })
      throw new Error(`获取打分列表失败, code:${resp.code};msg:${resp.msg}`);
    }
    rates.value = resp.data;
  } catch (e) {
    console.error(e);
  }
}
const router = useRouter();
const route = useRoute();
const defaultActive = route.params.id as string | undefined;
const active = ref<string>(defaultActive ?? '');
const activeId = computed(() => parseInt(active.value.slice(2)));

function selectHandler(index: string) {
  if (isMobileRef.value) {
    drawer.value = false;
  }
  active.value = index;
  router.push(`/home/${index}`)
}

async function logout() {
  localStorage.removeItem('at');
  try {
    await ElMessageBox.confirm("确认退出登录吗？");
    router.push('/login')
  } catch (e) { }
}


</script>