<template>
    <teleport to="#teleport">
        <el-dialog v-model="dialogFormVisible" title="更改密码" :close-on-click-modal="allowOtherClose"
            :close-on-press-escape="allowOtherClose" destroy-on-close :fullscreen="isMobileRef">
            <el-form ref="formRef" :model="form" label-position="right" label-width="100px" :rules="rule">
                <el-form-item label="原密码" prop="origin">
                    <el-input v-model="form.origin" autocomplete="off" show-password clearable type="password" />
                </el-form-item>
                <el-form-item label="新密码" prop="target">
                    <el-input v-model="form.target" autocomplete="off" show-password clearable type="password" />
                </el-form-item>
                <el-form-item label="重复密码" prop="repeatPassword">
                    <el-input v-model="form.repeatPassword" autocomplete="off" show-password clearable
                        type="password" />
                </el-form-item>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="dialogFormVisible = false">Cancel</el-button>
                    <el-button type="primary" @click="handleSubmit">
                        Confirm
                    </el-button>
                </div>
            </template>
        </el-dialog>
    </teleport>
</template>

<script setup lang="ts">
import { ElMessageBox, ElNotification, type FormInstance, type FormRules } from 'element-plus';
import { ref } from 'vue';
import { isMobileRef } from '../../common';
import { passwordReg, doRequest } from '../../common';

const dialogFormVisible = defineModel<boolean>();
const { allowOtherClose } = defineProps<{
    allowOtherClose?: boolean,
}>();

interface Form {
    origin: string
    target: string
    repeatPassword: string
}

const form = ref<Form>({
    origin: "",
    target: '',
    repeatPassword: "",
})
const formRef = ref<FormInstance | undefined>();

const rule = ref<FormRules<Form>>({
    origin: [{
        required: true,
        trigger: 'blur',
        message: '必须输入原密码'
    }],
    target: [{
        validator(_, value, cb) {
            // console.log("a");
            if (value.length < 6) {
                cb(new Error('密码强度弱：密码长度必须超过6位'))
            } else if (!passwordReg.test(value)) {
                cb('密码强度弱：需包含数字、大写字母、小写字母、特殊字符中的三种')
            } else {
                cb()
            }
        },
        trigger: 'change',
        required: true
    }],
    repeatPassword: [{
        validator(_, value, cb) {
            if (!value) {
                cb('请输入重复密码')
            } else if (value !== form.value.target) {
                cb('密码不一致')
            } else {
                cb();
            }
        },
        required: true,
        trigger: 'change',
    }]
})

async function handleSubmit() {
    const el = formRef.value;
    if (!el) return
    await el.validate(async v => {
        // console.log(v);
        if (!v) return;
        // 验证逻辑
        try {
            await ElMessageBox.confirm('确认要更改密码吗？')
            submit();
        } catch (e) { }
    })
}
async function submit() {
    const bool = await fetchToChangePwd(form.value.origin, form.value.target)
    if (bool) {
        dialogFormVisible.value = false;
    }
}


async function fetchToChangePwd(
    origin: string,
    target: string
): Promise<boolean> {

    try {
        const data = await doRequest<Object>(
            '/api/user/change_password',
            'post',
            { origin, target },
        )
        if (data.code !== 200) {
            ElNotification({
                title: '更改密码错误',
                message: data.msg,
                type: 'error',
            })
            return false;
        }
        ElNotification({
            title: "更改成功",
            type: "success",
        })
        return true;
    } catch (e) {
        ElNotification({
            title: '更改密码错误',
            message: '服务器错误',
            type: 'error',
        });
        console.error(e);
        return false;
    }


}
</script>