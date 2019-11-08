<template>
    <div :class="['stone', { 'stone-focus': isFocus }]">{{content}}</div>
</template>

<script>
    export default {
        name: "Stone",
        props: {
            content: {
                type: String,
                required: true
            },
            isFocus: {
                type: Boolean,
                required: true
            }
        }
    }
</script>

<style lang="less">
.stone {
    display: inline-block;
    color: #fff;
    letter-spacing: 2px;
    padding: 3px 10px;
    background-color: rgba(153,67,87,0.79);
    &-focus {
        border: 1px solid #ffcf53;
    }
}
</style>
