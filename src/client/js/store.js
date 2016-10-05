import Vue from 'vue';
import Vuex from 'vuex';
import _ from 'lodash';
Vue.use(Vuex);

const state = {
    user: null,
};

const mutations = {
    UserChanged(state, user) {
        state.user = user;
        state.user.isAdmin = _.includes(user.roles, 'admin');
    },
};

export function getUser(state) {
    return state.user;
}

export const userLogin = ({dispatch, state}, user) => {
    dispatch('UserChanged', user);
};

export const userLogout = ({dispatch, state}) => {
    dispatch('UserChanged', null);
};

export default new Vuex.Store({
    state,
    mutations,
});
