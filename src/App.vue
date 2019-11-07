<template>
    <div class="container">
        <div class="temp"><input type="text" @keydown="getBullet"></div>
        <div class="panel" ref="panel">
            <aircraft ref="aircraft" v-for="(charge, index) in petardQueue" :key="index" :speed="speed" :left="charge.left" :boom="boom">
                <stone :content="charge.content"/>
            </aircraft>
        </div>
        <div class="plane"></div>
    </div>
</template>

<script>
    import Aircraft from "./components/Aircraft.vue";
    import Stone from "./components/Stone.vue";
    import { mockData } from "./mock";
    import Petard from './model/Petard'

    export default {
        name: "App",
        components: {
            aircraft: Aircraft,
            stone: Stone,
        },
        data() {
            return {
                panelWidth: 0,    //控制面板宽度
                speed: 20,       //游戏开始初识速度为20
                bulletQueue: [],    //TODO 子弹队列，打飞机专用
                initPetardQueue: [],    //炸药包源头队列，用于控制后续炸药包从什么位置开始生成
                petardQueue: [],    //所有已出现炸药包队列
                boom: false,
            }
        },
        methods: {
            getBullet(e) {
                this.bulletQueue.push(e.key);
            },
            calculateChargeIndex() {
                const wordsSum = mockData.length;
                const randomIndex = ~~(Math.random() * wordsSum);
                return randomIndex;
            },
            calculateChargeInitLeft() {
                const randomLeft = ~~(Math.random() * this.panelWidth);
                return randomLeft;
            },
            generateStone() {
                const index = this.calculateChargeIndex();
                const left = this.calculateChargeInitLeft();
                const petard = new Petard();
                petard.setData({
                    content: mockData[index],
                    left
                });
                if(this.safePetardCheck(petard)) {
                    this.petardQueue.push(petard);
                } else {
                    this.generateStone();
                }
            },
            safePetardCheck(petard) {
                const length = petard.content.length;
                return ( petard.left + length * 11 ) <= this.panelWidth
            }
        },
        mounted() {
            this.panelWidth = this.$refs.panel.clientWidth;
            setInterval(() => {
                this.generateStone();
            }, 2500);

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
.temp {
    display: none;
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
