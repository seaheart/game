<template>
    <div ref="aircraft" class="aircraft">
        <slot />
    </div>
</template>

<script>
    export default {
        name: "Aircraft",
        props: {
            speed: {
                type: Number,
                default: 20,
            },
            left: {
                type: Number,
                default: 0
            },
            outOfRange: {
                type: Function,
                default: () => {}
            }
        },
        data() {
            this.distance = 1000;
            return {}
        },
        methods: {
            calculate() {
                const el = this.$refs.aircraft;
                const time = (this.distance / this.speed).toFixed(1);
                el.style.left = `${this.left}px`;
                el.style.animation = `move ${time}s linear 0s forwards`
            }
        },
        watch: {
            left(newVal, oldVal) {
                this.calculate();
            }
        },
        mounted() {
            this.calculate();
            this.$refs.aircraft.addEventListener('animationend', () => {
                this.$emit('outOfRange');
            })
        }
    }
</script>

<style lang="less">
.aircraft{
    position: absolute;
    top: 0;
    animation-name: move;
    animation-duration: 2s;
    animation-timing-function: linear;
    animation-delay: 0s;
    animation-fill-mode: forwards;
}
@keyframes move {
    from {
        transform: translateY(0);
    }
    to {
        transform: translateY(100vh);
    }
}
</style>
