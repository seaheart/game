<template>
    <div class="container">
        <div class="panel" ref="panel">
            <aircraft ref="aircraft" v-for="(petard, index) in petardsQueue" :key="petard.key" :speed="speed" :left="petard.left">
                <stone :content="petard.content" :is-focus="calculateIsFocus(index)" :focus-length="compareIndex"/>
            </aircraft>
        </div>
        <p class="score">
            {{score}}
        </p>
        <div class="plane"></div>
    </div>
</template>

<script>
    import Aircraft from "../components/Aircraft.vue";
    import Stone from "../components/Stone.vue";
    import DATA from "../data";
    import Petard from '../model/Petard'

    export default {
        name: "Game",
        components: {
            aircraft: Aircraft,
            stone: Stone,
        },
        data() {
            return {
                panelWidth: 0,    //控制面板宽度
                speed: 20,       //游戏开始初识速度为20
                score: 0,
                bulletsQueue: [],    //子弹队列，打飞机专用 string
                petardsQueue: [],    //所有已出现炸药包队列 petard
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
            setInterval(() => {
                this.generateStone();
            }, 2000);
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
