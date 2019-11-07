<template>
    <div class="container">
        <div class="panel" ref="panel">
            <aircraft ref="aircraft" v-for="(petard, index) in petardsQueue" :key="index" :speed="speed" :left="petard.left" :boom="petard.boom">
                <stone :content="petard.content"/>
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
                bulletsQueue: [],    //子弹队列，打飞机专用
                petardsQueue: [],    //所有已出现炸药包队列
                petardsLock: [],   //瞄准锁，也是一个队列，刚开始模糊瞄准  {index, petard}
            }
        },
        computed: {
            comparedIndex() {
                return this.bulletsQueue.length;
            }
        },
        methods: {
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
                    this.petardsQueue.push(petard);
                } else {
                    this.generateStone();
                }
            },
            safePetardCheck(petard) {
                const length = petard.content.length;
                return ( petard.left + length * 11 ) <= this.panelWidth
            },
            precisePetard(bullet) {
                // TODO 处理特殊情况在这里处理，比如说go与going
                let targetPetardIndex = -1;

                try {
                    if(this.petardsLock.length) {
                        // 这个时候瞄准队列中已经初步瞄准了一些
                        this.petardsLock = this.petardsLock.reduce((pre, cur)=> {
                            if(cur.petard.content[this.comparedIndex + 1] === bullet) {
                                if(cur.petard.content.length === this.comparedIndex + 1) {
                                    targetPetardIndex = cur.index;
                                    throw Error;
                                } else {
                                    pre.push(cur)
                                }
                            } else return pre;
                        },[]);
                    } else {
                        // 这个时候瞄准队列中为空，是刚开始打或刚打完一个火药桶的状态
                        this.petardsLock = this.petardsQueue.reduce((pre, cur, index) => {
                            if(cur.content[this.comparedIndex + 1] === bullet) {
                                if(cur.content.length === this.comparedIndex + 1) {
                                    targetPetardIndex = index;
                                    throw Error;
                                } else {
                                    pre.push({index, petard: cur})
                                }
                            } else return pre;

                        }, []);
                    }
                } finally {
                    if(targetPetardIndex !== -1) {
                        //找到那个要消灭的对象啦
                        this.petardsQueue[targetPetardIndex].boom = true;
                    }
                }

            },
            supplementBullet(bullet) {
                if(this.petardsLock.length === 1) {
                    // 已经瞄准了一些目标，当长度为1时即正式瞄准
                }else {
                    // 还并未完全瞄准目标，现在瞄准去吧
                    this.precisePetard(bullet)
                }
            },
            addListener() {
                window.addEventListener('keydown', e => {
                    if(e.keyCode >=65 && e.keyCode <= 90) {
                        this.supplementBullet(e.key);
                    } else {
                        this.bulletsQueue = [];
                    }
                    console.log(this.bulletsQueue);
                })
            }
        },
        mounted() {
            this.panelWidth = this.$refs.panel.clientWidth;
            setInterval(() => {
                this.generateStone();
            }, 2500);
            this.addListener();
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
