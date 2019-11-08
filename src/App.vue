<template>
    <div class="container">
        <div class="panel" ref="panel">
            <!--解决key的问题-->
            <aircraft ref="aircraft" v-for="petard in petardsQueue" :key="petard.key" :speed="speed" :left="petard.left">
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
                petardsLockQueue: [],   //瞄准锁，也是一个队列，刚开始模糊瞄准  {index, petard}
            }
        },
        computed: {
            compareIndex() {
                return this.bulletsQueue.length;
            },
        },
        watch: {
            bulletsQueue(newVal, oldVal){
                console.log(newVal);
            }
        },
        methods: {
            calculatePetardIndex() {
                const wordsSum = mockData.length;
                return ~~(Math.random() * wordsSum);
            },
            calculatePetardInitLeft() {
                return  ~~(Math.random() * this.panelWidth);
            },
            generateStone() {
                const index = this.calculatePetardIndex();
                const left = this.calculatePetardInitLeft();
                const petard = new Petard();
                const content = mockData[index];
                petard.setData({
                    content,
                    left,
                    key: `${content}-${new Date()}`
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
            boomPetard(targetIndex) {
                this.petardsQueue.splice(targetIndex, 1);
                this.bulletsQueue = [];
                this.petardsLockQueue = [];
            },
            precisePetard(bullet) {
                let targetPetardIndex = -1;
                let tempQueue = [];
                try {
                    if(this.petardsLockQueue.length) {
                        // 这个时候瞄准队列中已经初步瞄准了一些
                        tempQueue = this.petardsLockQueue.reduce((pre, cur)=> {
                            if(cur.petard.content[this.compareIndex] === bullet) {
                                if(cur.petard.content.length === this.compareIndex + 1) {
                                    targetPetardIndex = cur.index;
                                    throw Error;
                                } else {
                                    pre.push(cur);
                                    return pre;
                                }
                            } else return pre;
                        },[]);



                    } else {
                        // 这个时候瞄准队列中为空，是刚开始打或刚打完一个火药桶的状态
                        tempQueue = this.petardsQueue.reduce((pre, cur, index) => {
                            if(cur.content[this.compareIndex] === bullet) {
                                if(cur.content.length === this.compareIndex + 1) {
                                    targetPetardIndex = index;
                                    throw Error;
                                } else {
                                    pre.push({index, petard: cur});
                                    return pre;
                                }
                            } else return pre;
                        }, []);
                    }

                    if(tempQueue.length > 0) {
                        //更精确了一步
                        this.petardsLockQueue = tempQueue;
                        this.bulletsQueue.push(bullet);
                    }

                } catch (e) {
                    if(targetPetardIndex !== -1) {
                        //找到那个要消灭的对象啦
                        this.boomPetard(targetPetardIndex);
                    }
                }

            },
            supplementBullet(bullet) {
                if(this.petardsLockQueue.length === 1) {
                    // 已经瞄准了一些目标，当长度为1时即正式瞄准
                    if(this.petardsLockQueue[0].petard.content[this.compareIndex] === bullet) {
                        if(this.petardsLockQueue[0].petard.content.length === this.compareIndex + 1) {
                            // 抓到你啦
                            const targetPetardIndex = this.petardsLockQueue[0].index;
                            this.boomPetard(targetPetardIndex);
                        } else {
                            this.bulletsQueue.push(bullet);
                        }
                    }

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
                })
            }
        },
        mounted() {
            this.panelWidth = this.$refs.panel.clientWidth;
            setInterval(() => {
                this.generateStone();
            }, 1500);
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
