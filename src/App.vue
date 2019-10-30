<template>
    <div class="container">
        <div class="temp"><input type="text" @keydown="getBullet"></div>
        <div class="panel">
            <aircraft ref="aircraft" v-for="(charge, index) in chargeQueue" :key="index" speed="20" :boom="boom">
                <stone :charge="charge"/>
            </aircraft>
        </div>
        <div class="plane"></div>
    </div>
</template>

<script>
    import Aircraft from "./components/Aircraft.vue";
    import Stone from "./components/Stone.vue";
    import { mockData } from "./mock";

    export default {
        name: "App",
        components: {
            aircraft: Aircraft,
            stone: Stone,
        },
        data() {
            return {
                speed: 20,       //游戏开始初识速度为20
                bulletQueue: [],
                chargeQueue: ['world', 'hello'],    //炸药包队列
                boom: false,
            }
        },
        methods: {
            getBullet(e) {
                this.bulletQueue.push(e.key);
            },
            generateStone() {
                const wordsSum = mockData.length;
                const randomIndex = (Math.random() * wordsSum).toFixed(0);
            }
        },
        watch: {
            bulletQueue(newVal, oldVal) {
                if(newVal.join('') === 'hello') {
                    this.boom = true;
                }
            }
        },
        mounted() {
            setInterval(() => {
                this.generateStone();
            }, 1000)
            console.log(this.$refs['aircraft'])
        }
    }
</script>

<style lang="less">
@import "assets/global.less";

.container{
    position: relative;
    height: 100%;
    min-height: 100vh;
    background-color: #2a5571;
}
.panel {
    width: 100%;
    height: 100vh;
    position: relative;
    overflow-y: hidden;
}
.plane {
    height: 0;
    width: 0;
    border-top: 0;
    border-left: 40px solid transparent;
    border-right: 40px solid transparent;
    border-bottom: 60px solid rgba(153,110,25,0.79);
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
}
</style>
