<template>
    <div class="container">
        <div class="summary" v-if="isShowSummary">
            <p class="summary-title">score</p>
            <p class="summary-score">{{score}}</p>
            <button class="summary-replay" @click="init">replay</button>
        </div>
        <div class="screen" v-show="isShowStage">
            <p class="screen-title">stage</p>
            <p class="screen-stage">{{stage}}</p>
        </div>
        <div class="panel" ref="panel">
            <aircraft ref="aircraft" v-for="(petard, index) in petardsQueue" :key="petard.key" :speed="speed" :left="petard.left" @outOfRange="boomPlayer">
                <stone :content="petard.content" :is-focus="calculateIsFocus(index)" :focus-length="compareIndex"/>
            </aircraft>
        </div>
        <p class="score">
            {{score}}
        </p>
    </div>
</template>

<script>
    import Aircraft from "../components/Aircraft.vue";
    import Stone from "../components/Stone.vue";
    import DATA from "../data";
    import Petard from '../model/Petard'

    const stageSection = 10;

    export default {
        name: "Game",
        components: {
            aircraft: Aircraft,
            stone: Stone,
        },
        data() {
            return {
                panelWidth: 0,    //控制面板宽度
                speed: 30,       //游戏开始初识速度为20
                score: 0,
                health: 10,         //初始生命值为10
                bulletsQueue: [],    //子弹队列，打飞机专用 string
                petardsTotal: 0,
                petardsQueue: [],    //目前出现炸药包队列 petard
                petardsLockQueue: [],   //瞄准锁，也是一个队列，刚开始模糊瞄准  {index, petard}
                isShowStage: false,
                isShowSummary: false,
            }
        },
        computed: {
            compareIndex() {
                return this.bulletsQueue.length;
            },
            stage() {
                return ~~(this.score / stageSection) + 1;
            }
        },
        watch: {
            bulletsQueue(newVal, oldVal){
                console.log(newVal);
            },
            petardsTotal(newVal, oldVal) {
                if(newVal >= this.stage * stageSection) {
                    this.pause();
                }
            },
            stage(newVal, oldVal) {
                if(newVal !== oldVal) {
                    this.isShowStage = true;
                    this.pause();
                    setTimeout(() => {
                        this.speed += 30;
                        this.isShowStage = false;
                        this.start();
                    }, 3000)
                }
            },
            health(newVal, oldVal) {
                this.isShowSummary = newVal === 0;
            }
        },
        methods: {
            calculatePetardIndex() {
                const wordsSum = DATA.length;
                return ~~(Math.random() * wordsSum);
            },
            calculatePetardInitLeft() {
                return  ~~(Math.random() * this.panelWidth);
            },
            calculateIsFocus(index) {
                return !!this.petardsLockQueue.find(({index: lockIndex}) => lockIndex === index)
            },
            calculateIsSafePetard(petard) {
                const length = petard.content.length;
                return ( petard.left + length * 11 ) <= this.panelWidth;
            },
            init() {
               this.$router.go(0)
            },
            pause() {
                clearInterval(this.timer);
            },
            start() {
                this.timer = setInterval(() => {
                    this.generateStone();
                }, 2000);
            },
            generateStone() {
                const index = this.calculatePetardIndex();
                const left = this.calculatePetardInitLeft();
                const petard = new Petard();
                const content = DATA[index];
                petard.setData({
                    content,
                    left,
                    key: `${content}-${new Date()}`
                });
                if(this.calculateIsSafePetard(petard)) {
                    this.petardsQueue.push(petard);
                    this.petardsTotal++;
                } else {
                    this.generateStone();
                }
            },
            boomPetard(targetIndex) {
                this.petardsQueue.splice(targetIndex, 1);
                this.score ++;
                this.bulletsQueue = [];
                this.petardsLockQueue = [];
            },
            boomPlayer() {
                this.health--;
            },
            precisePetardsLock( petardsLockQueue, bullet) {
                let targetPetardIndex = -1;
                let tempLockQueue = [];
                try {
                    tempLockQueue = petardsLockQueue.reduce((pre, cur)=> {
                        if(cur.petard.content[this.compareIndex] === bullet) {
                            if(cur.petard.content.length === this.compareIndex + 1) {
                                targetPetardIndex = cur.index;
                                throw Error;
                            } else {
                                pre.push(cur);
                                return pre;
                            }
                        } else {
                            return pre;
                        }
                    }, []);

                    if(tempLockQueue.length > 0) {
                        //更精确了一步
                        this.petardsLockQueue = tempLockQueue;
                        this.bulletsQueue.push(bullet);
                    }

                } catch (e) {
                    if(targetPetardIndex !== -1) {
                        //找到那个要消灭的对象啦
                        this.boomPetard(targetPetardIndex);
                    }
                }
            },
            supplyBullet(bullet) {
                if(this.petardsLockQueue.length === 1) {
                    // 已经瞄准了一些目标，当长度为1时即正式瞄准
                    const { petard, index } = this.petardsLockQueue[0];
                    if(petard.content[this.compareIndex] === bullet) {
                        if(petard.content.length === this.compareIndex + 1) {
                            this.boomPetard(index);
                        } else {
                            this.bulletsQueue.push(bullet);
                        }
                    }
                } else if(this.petardsLockQueue.length === 0) {
                    const tempPetardsLockQueue = this.petardsQueue.map((petard, index) => ({index, petard}));
                    this.precisePetardsLock(tempPetardsLockQueue, bullet);
                } else {
                    this.precisePetardsLock(this.petardsLockQueue,bullet);
                }
            },
            addListener() {
                window.addEventListener('keydown', e => {
                    if(e.keyCode >=65 && e.keyCode <= 90) {
                        this.supplyBullet(e.key);
                    } else {
                        this.bulletsQueue = [];
                        this.petardsLockQueue = [];
                    }
                })
            }
        },
        mounted() {
            this.panelWidth = this.$refs.panel.clientWidth;
            this.start();
            this.addListener();
        }
    }
</script>

<style lang="less">
.container{
    position: relative;
    height: 100%;
    min-height: 100vh;
    background-color: #2a5571;
}
.summary{
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 999;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #2a5571;
    &-title {
        color: #fff;
        font-size: 30px;
        letter-spacing: 1px;
    }
    &-score {
        margin-top: 60px;
        color: #fff;
        font-size: 50px;
    }
    &-replay {
        margin-top: 60px;
        padding: 5px 50px;
        border-radius: 15px;
        background-color: #fff;
        border: 0;
        font-size: 20px;
    }
}
.screen{
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 999;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #2a5571;
    &-title {
        color: #fff;
        font-size: 30px;
        letter-spacing: 1px;
    }
    &-stage {
        margin-top: 60px;
        color: #fff;
        font-size: 50px;
    }
}
.panel {
    width: 100%;
    height: 100vh;
    position: relative;
    overflow-y: hidden;
}
.score {
    position: absolute;
    bottom: 20px;
    left: 20px;
    padding: 3px 10px;
    background-color: #fff;
    border-radius: 5px;
}
</style>
