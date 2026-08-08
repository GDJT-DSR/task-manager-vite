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
            <AutoLoad v-for="(answer, idx) in question.answers" :key="answer.id" :visible="idx === (activeIndex - 1)"
                hide-on-single-page>

                <SingleRate :name="answer.id.toString()" :rate="answer" :step="question.score_step || 1"
                    :max="question.max_score || 10" :precision="question.precision" :type="question.type"
                    @previous="previous" @next="next">
                </SingleRate>

            </AutoLoad>

            <!-- </ElScrollbar> -->
            <!-- </ElCarouselItem>
            </ElCarousel> -->
            <el-pagination style="position: sticky; bottom: 20px;" background
                layout="prev, pager, next, ->, jumper, total" v-model:current-page="activeIndex"
                :page-count="question.answers.length" :total="question.answers.length" />
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
// const activeAnswerId = ref<number>();
const activeIndex = ref<number>(1);

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
    for (const [idx, answer] of answers.entries()) {
        if (answer.score == 0) {
            activeIndex.value = idx + 1;
            return;
        }
    }
}


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

function previous() {
    if (!question.value) return;
    const len = question.value.answers.length;
    activeIndex.value = ((activeIndex.value - 2 + len) % len) + 1;
}
function next() {
    if (!question.value) return;
    const len = question.value.answers.length;
    activeIndex.value = ((activeIndex.value) % len) + 1;
}
</script>

<style scoped>
div.single {
    padding: 20px 30px;
}
</style>
