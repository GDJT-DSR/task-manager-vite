<template>
    <el-scrollbar v-if="task">
        <h1>{{ task.title }}</h1>
        <div class="task-desc">{{ task.desc }}</div>
        <div class="task-desc" v-if="startTime">开始时间：{{ startTime }}</div>
        <div class="task-desc" v-if="endTime">结束时间：{{ endTime }}</div>


        <el-col :span="24" class="total" v-if="showTotal">
            <el-statistic title="总分" :value="total" :suffix="`/ ${totalMax}`" />
        </el-col>

        <el-collapse expand-icon-position="left" class="el-collapse" v-model="opens">
            <el-collapse-item v-for="(sub) in task.questions" :key="`${sub.id}-${sub.answer?.updated_at ?? ''}`"
                :name="sub.id" :title="sub.title">
                <!-- <h2>{{ sub.title }}</h2> -->
                <!-- <div class="sub-desc">{{ sub.desc }}</div> -->
                <single-sub-task :sub="sub" @update="getTaskDetail"></single-sub-task>
            </el-collapse-item>
        </el-collapse>

        <!-- <el-row> -->
        <!-- </el-row> -->

    </el-scrollbar>
</template>
<script setup lang="ts">
import { computed, onBeforeUpdate, onMounted, ref } from 'vue';
import { doRequest } from '../../common';
import type { TaskDetails } from '../../interfaces';
import dayjs from 'dayjs';
import { ElCol, ElNotification, ElStatistic } from 'element-plus';
import SingleSubTask from './SingleSubTask.vue';

const props = defineProps<{
    taskId: number,
    visible: boolean,
}>();
const task = ref<TaskDetails>();

onMounted(() => {
    getTaskDetail();
})
const opens = ref<number[]>([]);


const startTime = computed(() => {
    const startAt = task.value?.start_at;
    if (!startAt) {
        return undefined;
    }
    const date = dayjs(startAt);
    return date.format('YYYY-MM-DD HH:mm:ss')
})
const endTime = computed(() => {
    const endAt = task.value?.end_at;
    if (!endAt) {
        return undefined;
    }
    const date = dayjs(endAt);
    return date.format('YYYY-MM-DD HH:mm:ss')
})

async function getTaskDetail() {
    const detail = await doRequest<TaskDetails>(`/api/page/${props.taskId}`, 'get');
    if (detail.code !== 200) {
        ElNotification({
            title: '获取信息失败',
            message: detail.msg,
            type: 'error',
        })
        return;
    }
    if (detail.data) {
        task.value = detail.data;
    }
}

const showTotal = computed<boolean>(() => {
    const v = task.value;
    if (!v) return false;
    for (let k of v.questions) {
        const score = k.answer?.score;
        if (typeof score === 'undefined') {
            return false;
        }
    }
    return true;
})
const total = computed(() => task.value?.questions.reduce<number>((previous, current) => previous + parseScore(current.answer?.score), 0));

const totalMax = computed(() => task.value?.questions.reduce<number>((previous, current) => previous + current.max_score, 0));

function parseScore(score: number | undefined): number {
    if (score && score !== -1) {
        return score;
    } else {
        return 0;
    }
}

onBeforeUpdate(() => {
    if (props.visible && !task.value) {
        getTaskDetail();
    }
})

</script>
<style scoped>
h1 {
    text-align: center;
    margin-top: 10px;
}

.task-desc {
    color: #666;
    text-align: center;
    margin: 0 3%;
}


.el-collapse {
    margin: 3%;
}



.sub-desc {
    padding: 0 .8em;
}

.total {
    margin-top: 15px;
    display: flex;
    justify-content: center;
    text-align: center;
}
</style>