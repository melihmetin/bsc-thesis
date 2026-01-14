<!-- from https://www.digitalocean.com/community/tutorials/vuejs-file-select-component
     and https://stackoverflow.com/questions/37535657/bind-file-input-to-a-button-using-vue-js -->
<template>
    <div class="file-selection-container">
        <q-btn color="primary" @click="chooseFile()" icon="mdi-plus">
            Import interpretation
        </q-btn>
        <input id="fileUpload" type="file" @change="handleFileChange" hidden />
    </div>
</template>

<script>
export default {
    props: {
        value: File
    },

    methods: {
        chooseFile() {
            console.log("chooseFile")
            document.getElementById("fileUpload").click()
        },
        handleFileChange(e) {
            this.$emit('input', e.target.files[0])
        }
    }
}
</script>

<style scoped>

</style>