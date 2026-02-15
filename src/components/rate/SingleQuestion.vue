<template>
    <div class="single">
        <template v-if="question">
            <h1>评分任务</h1>
            <ElDescriptions title="评分任务信息" border :column="2">
                <ElDescriptionsItem label="标题">{{ question.title }}</ElDescriptionsItem>
                <ElDescriptionsItem label="最大分值">{{ question.max_score }}</ElDescriptionsItem>
            </ElDescriptions>
            <span ref="target"></span>
            <ElCarousel ref="carousel" indicator-position="none" :autoplay="false" arrow="always"
                :height="`${height}px`">
                <ElCarouselItem v-for="answer in question.answers" :name="answer.id.toString()">
                    <ElScrollbar>
                        <SingleRate :rate="answer" :step="question.score_step || 1" :max="question.max_score || 10">
                        </SingleRate>
                    </ElScrollbar>
                </ElCarouselItem>
            </ElCarousel>
        </template>

        <el-skeleton :rows="5" animated v-else />
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { ScoreQuestion, ScoreQuestionDetail } from '../../interfaces';
import { doRequest } from '../../common';

const props = defineProps<{
    questionAbstract: ScoreQuestion,
}>();

const question = ref<ScoreQuestionDetail>();

const target = ref<HTMLSpanElement[]>();
const height = computed(() => {
    if (!target.value) return 300;
    const rect = target.value[0]?.getBoundingClientRect();
    if (!rect) return 300;
    return window.innerHeight - rect.top - 20;
});

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

}

getQuestion();
</script>

<style scoped>
.single {
    margin: max(3%, 20px);
}
</style>
