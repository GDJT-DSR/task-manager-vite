<template>
  <div class="wrapper">
    <ElDescriptions direction="vertical" border :column="1" title="回答详情">
      <ElDescriptionsItem label="回答内容" label-align="center" align="left">
        <VueKatex :content="rate.content"></VueKatex>
        <!-- <div v-if="rate.img">
          <el-image class="img" :src="rate.img" :preview-src-list="[rate.img]" :preview-teleported="true" />
        </div> -->
      </ElDescriptionsItem>
      <ElDescriptionsItem label="我的评分" label-align="center" align="center">
        <ElForm ref="formRef" @submit.prevent="submit">
          <ElInputNumber v-model="num" size="large" :step-strictly="true" :step="step" :max="max" :min="0"
            style="margin-right: 20px;" />
          <ElButton type="primary" native-type="submit">提交</ElButton>
        </ElForm>
      </ElDescriptionsItem>
    </ElDescriptions>
  </div>

</template>

<script setup lang="ts">
import { ElDescriptions, ElNotification, type FormInstance } from 'element-plus';
import type { Answer, ScoreAnswer, ScoreQuestionDetail } from '../../interfaces';
import { ref } from 'vue';
import { doRequest } from '../../common';


const { rate } = defineProps<{
  rate: ScoreAnswer;
  step: number;
  max: number;
}>();
const num = ref(rate.score);
const formRef = ref<FormInstance>();
const loading = ref<boolean>(false);
let origin = rate.score;

async function submit() {
  if (!formRef.value) {
    return;
  }
  loading.value = true;

  try {
    const resp = await doRequest<Object>(`/api/score/${rate.id}`, 'post', {
      target: num.value,
      origin
    });
    if (resp.code === 200) {
      ElNotification({
        title: "提交成功！",
        type: 'success',
      })
      origin = num.value;
    } else {
      ElNotification({
        title: "提交失败！",
        message: resp.msg,
        type: 'error',
      })
    }
  } catch (e) {
    ElNotification({
      title: "提交失败",
      type: 'error',
    })
  }
  loading.value = false;
}

</script>

<style scoped>
h3 {
  padding-top: 20px;
  text-align: center;
}

div.wrapper {
  padding: 20px 30px;
}

.img {
  width: min(500px, 60vw);
}
</style>