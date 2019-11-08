<template>
    <div :class="['stone', { 'stone-focus': isFocus }]">
        <span v-for="(key, index) in content" :class="{'focus': isFocus && index < focusLength }">{{key}}</span>
    </div>
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
            },
            focusLength: {
                type: Number,
                default: 0
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
    border: 1px solid rgba(153,67,87,0.79);
    &-focus {
        border-color: #ffcf53;
    }
    .focus {
        color: #ffcf53;
    }
}
</style>
