<template>
    <div class="sub-desc" v-if="sub.desc || sub.settings?.imgs">
        <!-- <vue-katex :content="sub.desc" /> -->
        <formatted-latex v-if="sub.desc">
            {{ sub.desc }}
        </formatted-latex>
        <el-image-p class="img" v-if="sub.settings?.imgs" :srcs="sub.settings.imgs"></el-image-p>

        <el-divider v-if="sub.answer?.content"></el-divider>
    </div>
    <div class="record" v-if="sub.answer?.content">
        <div class="title">我的回答：</div>
        <!-- <div class="answer">{{ sub.record.content }}</div> -->
        <div class="answer">
            <!-- <vue-katex :content="sub.answer.content" v-if="sub.type === 'fill_in'" /> -->
            <formatted-latex v-if="sub.type === 'fill_in'">
                {{ sub.answer.content }}
            </formatted-latex>
            <div v-else-if="sub.type === 'upload'">
                <el-image-p :srcs="[`/uploads/${sub.answer.content}`]"></el-image-p>
            </div>
            <div v-else-if="sub.type === 'choose'">
                <template v-for="idx of sub.answer.content.split(',')">
                    {{ sub.settings.choices[parseInt(idx)] }}
                </template>
            </div>
        </div>
    </div>
    <template v-if="sub.type !== 'none'">
        <el-button
            v-if="show && (sub.answer ? (state & PAGE_CHANGABLE) : (state & PAGE_SUBMITABLE)) && typeof sub.answer?.score === 'undefined'"
            @click="showDialog = true">{{ sub.answer ? '更改回答' :
                '填写回答' }}</el-button>
        <el-button v-if="(sub.settings?.answer || (sub.settings as any | undefined)?.answer_imgs)"
            @click="showAnswer = true">查看答案</el-button>
    </template>
    <!-- <teleport to="#teleport">
        <el-dialog v-model="showDialog" title="我的回答">

        </el-dialog>
    </teleport> -->
    <auto-load :visible="showDialog || showAnswer" v-if="sub.type !== 'none'">
        <teleport to="#teleport">
            <el-dialog v-model="showAnswer" title="参考答案" v-if="sub.settings?.answer">
                <template v-if="sub.type === 'choose'">
                    <template v-for="idx of sub.settings.answer.split(',').map(str => parseInt(str))">
                        {{ sub.settings.choices[idx] }}
                    </template>
                </template>
                <template v-else>
                    <formatted-latex v-if="sub.settings.answer">
                        {{ sub.settings.answer }}
                    </formatted-latex>
                    <el-image-p :srcs="sub.settings.answer_imgs" v-if="sub.settings.answer_imgs"></el-image-p>
                </template>

            </el-dialog>
            <el-dialog v-model="showDialog" title="我的回答">
                <el-form v-model="fillinForm" v-if="sub.type === 'fill_in'">
                    <el-form-item label="内容" label-position="top">
                        <el-input v-model="fillinForm.content" type="textarea" height="300"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="updateContent">保存</el-button>
                        <el-button type="danger" @click="clearContent" v-if="sub.answer">删除</el-button>
                    </el-form-item>
                </el-form>
                <el-upload ref="upload" class="upload-demo" action="" :limit="1" :on-exceed="handleExceed"
                    :http-request="doUpload" :auto-upload="false" v-else-if="sub.type === 'upload'">
                    <template #trigger>
                        <el-button type="primary">选择文件</el-button>
                    </template>
                    <el-button class="upload" type="success" @click="submitUpload">
                        上传
                    </el-button>
                    <template #tip>
                        <div>最多只能上传一个文件，新上传的文件会覆盖旧文件</div>
                    </template>
                </el-upload>
                <el-form v-model="chooseForm" v-else-if="sub.type === 'choose'">
                    <el-form-item label="选项" label-position="top">
                        <el-checkbox-group v-model="chooseForm.choices" v-if="sub.settings.multiple">
                            <el-checkbox :key="idx" :label="choice" :value="idx"
                                v-for="(choice, idx) in sub.settings.choices" />
                        </el-checkbox-group>
                        <el-radio-group v-model="chooseForm.choices[0]" v-else>
                            <el-radio :key="idx" v-for="(choice, idx) in sub.settings.choices" :value="idx">{{ choice
                                }}</el-radio>
                        </el-radio-group>
                    </el-form-item>

                    <el-form-item>
                        <el-button type="primary" @click="updateContent">保存</el-button>
                        <el-button type="danger" @click="clearContent" v-if="sub.answer">删除</el-button>
                    </el-form-item>
                </el-form>
            </el-dialog>
        </teleport>
    </auto-load>
    <div v-if="(typeof sub.answer?.score) !== 'undefined'">
        <el-divider></el-divider>
        <div class="title">得分：{{ sub.answer?.score }}分 / {{ sub.max_score }}分</div>
    </div>
</template>
<script setup lang="ts">
import { reactive, ref } from 'vue';
import type { Question } from '../../interfaces';
import AutoLoad from '../common/AutoLoad.vue';
import { genFileId, type NotificationParams, type UploadInstance, type UploadProps, type UploadRawFile, type UploadRequestOptions } from 'element-plus';
import { doRequest, compressImage } from '../../common';
import FormattedLatex from '../common/FormattedLatex.vue';
import { PAGE_CHANGABLE, PAGE_SUBMITABLE } from '../constants.ts';

const props = defineProps<{
    sub: Question,
    state: number,
    show: boolean,
}>();
const emit = defineEmits(['update']);
const showDialog = ref(false);
const showAnswer = ref(false);
const fillinForm = reactive({
    content: props.sub.answer?.content ?? ''
})
const chooseForm = reactive({
    choices: props.sub.answer?.content.split(',').map(str => parseInt(str)) ?? []
});


async function updateContent() {
    let target = '';
    let origin = '';
    if (props.sub.type === 'fill_in') {
        target = fillinForm.content;
        origin = props.sub.answer?.content || '';
    } else if (props.sub.type === 'choose') {
        target = chooseForm.choices.sort().join(',');
        origin = props.sub.answer?.content || '';
    } else { return; }
    if (!target) {
        ElNotification({
            type: 'warning',
            title: '无效改动',
            message: '内容不能为空',
        })
        return;
    }
    if (target === origin) {
        showDialog.value = false;
        ElNotification({
            type: 'warning',
            title: '无效改动',
            message: '新内容与旧内容相同',
        })
        return;
    }
    const res = await doRequest<void>(`/api/answer/${props.sub.id}/${props.sub.type}`, 'post', {
        target,
        origin
    });
    if (res.code !== 200) {
        ElNotification({
            title: '更改失败',
            message: res.msg,
            type: 'error',
        });
    } else {
        emit('update');
        ElNotification({
            title: "更改成功",
            type: 'success',
        });
    }
    showDialog.value = false;
}
async function clearContent() {
    ElNotification({
        title: '删除失败',
        message: '权限不足',
        type: 'error'
    })
}

const upload = ref<UploadInstance>()

const handleExceed: UploadProps['onExceed'] = (files) => {
    upload.value!.clearFiles()
    const file = files[0] as UploadRawFile
    file.uid = genFileId()
    upload.value!.handleStart(file)
}

function submitUpload() {
    upload.value!.submit();
}

async function doUpload(opt: UploadRequestOptions): Promise<void> {
    const file = opt.file;
    let param: NotificationParams = {
        title: "上传文件失败",
        type: 'error',
    }
    if (!file) {
        ElNotification({
            ...param,
            message: "请选择文件"
        })
        return;
    }
    const form = new FormData();
    const compressedFile = await compressImage(file);
    debugger;
    form.append('file', compressedFile);
    try {
        const resp = await doRequest<void>(`/api/answer/${props.sub.id}/image`, 'post', form);
        if (resp.code !== 200) {
            param = { ...param, message: resp.msg || '服务器错误' }
            throw new Error(resp.msg || '服务器错误');
        } else {
            ElNotification({
                title: "上传成功",
                type: 'success',
            })
            emit('update')
        }
    }
    catch (e) {
        ElNotification(param)
        throw e;
        // showDialog.value = false;
    }

}

</script>

<style>
.upload {
    margin-left: 5px;
}

.img {
    width: min(400px, 60vw);
}
</style>