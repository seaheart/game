<template>
    <div class="stone">{{charge}}</div>
</template>

<script>
    export default {
        name: "Stone",
        props: {
            charge: {
                type: String,
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
}
</style>
