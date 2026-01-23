<template>
    <el-scrollbar>
        <el-menu @select="selectHandler" :default-openeds="['1', '2']">
            <el-sub-menu index="1">
                <template #title>
                    <el-icon><icon-menu /></el-icon>
                    <span>任务列表</span>
                </template>
                <el-menu-item v-for="task in tasks" :index="`1-${task.id}`" :key="task.id" :disabled="!task.readable">
                    {{ task.title }}
                </el-menu-item>
            </el-sub-menu>
            <el-sub-menu index="2" v-if="rates">
                <template #title>
                    <el-icon>
                        <Star />
                    </el-icon>
                    评分任务
                </template>
                <ElMenuItemGroup :title="rateTask.title" v-for="rateTask in rates">
                    <ElMenuItem v-for="item in rateTask.sub_tasks" :index="`2-${item.id}`" :key="item.id">
                        {{ item.title }}
                    </ElMenuItem>
                </ElMenuItemGroup>
            </el-sub-menu>
        </el-menu>
    </el-scrollbar>
</template>

<script setup lang="ts">
import { Menu as IconMenu, Star } from '@element-plus/icons-vue'
import type { ScoreTask, Task } from '../../interfaces';
import { ElMenuItem, ElMenuItemGroup } from 'element-plus';

const { tasks, rates } = defineProps<{
    tasks: Task[],
    rates?: ScoreTask[]
}>();



const emits = defineEmits<{
    select: [string, string[]]
}>()



function selectHandler(index: string, indexPath: string[]) {
    emits('select', index, indexPath)
}
</script>
<style scoped lang="scss"></style>