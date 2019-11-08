import Vue from 'vue';
import VueRouter from 'vue-router';
import Game from '../components/Game.vue';
import Summary from '../components/Summary.vue';

Vue.use(VueRouter);

const router = new VueRouter({
    mode: 'history',
    routes: [
        {
            path: '/',
            component: Game
        },
        {
            path: '/summary',
            component: Summary
        }
    ]
});

export default router;
