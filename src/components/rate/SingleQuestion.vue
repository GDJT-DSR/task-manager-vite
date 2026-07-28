<template>
    <div class="single">
        <template v-if="question">
            <ElDescriptions title="评分任务信息" border :column="2">
                <ElDescriptionsItem label="标题">{{ question.title }}</ElDescriptionsItem>
                <ElDescriptionsItem label="最大分值">{{ question.max_score }}</ElDescriptionsItem>
            </ElDescriptions>
            <!-- <ElCarousel ref="carousel" indicator-position="none" :autoplay="false" arrow="always"
                :height="`${height}px`">
                <ElCarouselItem v-for="answer in question.answers" :name="answer.id.toString()"> -->
            <!-- <ElScrollbar> -->
            <AutoLoad v-for="answer in question.answers" :key="answer.id" :visible="answer.id === activeAnswerId">

                <SingleRate :name="answer.id.toString()" :rate="answer" :step="question.score_step || 1"
                    :max="question.max_score || 10" :type="question.type" @previous="previous" @next="next">
                </SingleRate>

            </AutoLoad>

            <!-- </ElScrollbar> -->
            <!-- </ElCarouselItem>
            </ElCarousel> -->
        </template>

        <el-skeleton :rows="5" animated v-else />
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watchEffect } from 'vue';
import type { ScoreQuestion, ScoreQuestionDetail } from '../../interfaces';
import { doRequest } from '../../common';

const props = defineProps<{
    questionAbstract: ScoreQuestion,
    activeId: Number,
}>();

const question = ref<ScoreQuestionDetail>();

async function getQuestion() {
    const detail = await doRequest<ScoreQuestionDetail>(`/api/score/${props.questionAbstract.id}`, 'get');
    if (detail.code !== 200 || !detail.data) {
        ElNotification({
            title: "获取评阅列表失败",
            message: detail.msg,
            type: "error"
        });
        return;
    }
    question.value = {
        ...props.questionAbstract,
        ...detail.data
    }
    const answers = question.value.answers;
    for (let answer of answers) {
        if (answer.score == 0) {
            activeAnswerId.value = answer.id;
            return;
        }
    }
    if (answers[0]) {
        activeAnswerId.value = answers[0].id
    }
}

const activeAnswerId = ref<number>();

getQuestion();

function keypressEvent(e: KeyboardEvent) {
    if (e.key === 'b') {
        previous();
    } else if (e.key === 'n') {
        next();
    }
}
onMounted(() => {
    window.addEventListener('keypress', keypressEvent);
});

watchEffect(() => {
    if (props.questionAbstract.id === props.activeId) {
        window.addEventListener('keypress', keypressEvent);
    } else {
        window.removeEventListener('keypress', keypressEvent);
    }
})

async function previous() {
    const answers = question.value?.answers;
    if (activeAnswerId.value === undefined || !answers) {
        ElNotification({
            title: "操作失败",
        })
        return;
    }
    const index = answers.findIndex((answer) => answer.id === activeAnswerId.value);
    let newindex = (index - 1 + answers.length) % answers.length;
    // console.log(`newindex: ${newindex}`);
    if (!answers[newindex]) { return; }
    activeAnswerId.value = answers[newindex].id;
}
async function next() {
    const answers = question.value?.answers;
    if (activeAnswerId.value === undefined || !answers) {
        ElNotification({
            title: "操作失败",
        })
        return;
    }
    const index = answers.findIndex((answer) => answer.id === activeAnswerId.value);
    let newindex = (index + 1) % answers.length;
    if (!answers[newindex]) { return; }
    activeAnswerId.value = answers[newindex].id;
}
</script>

<style scoped>
div.single {
    padding: 20px 30px;
}
</style>
