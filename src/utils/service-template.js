import Vue from "vue";
import qs from "qs";
export default function (endpoint) {
	const baseUrl = "/" + endpoint;
	const getDefaultState = () => {
		return {
			current: null,
			list: [],
			pagination: {},
			businessError: null,
			status: null,
		};
	};
	return {
		baseUrl,
		actions: {
			async find({ commit }, payload = {}) {
				const { qid = "default", query, customEndpoint } = payload;
				commit("setStatus", "pending");
				const res = await this.$axios.$get(customEndpoint || baseUrl, {
					params: query,
					paramsSerializer: (params) => {
						return qs.stringify(params);
					},
				});
				commit("updatePaginationForQuery", {
					query,
					qid,
					res,
				});
				commit("set", {
					items: res.data,
				});
				commit("setStatus", "success");
			},
			async get({ commit }, payload = {}) {
				let id;
				if (Array.isArray(payload)) {
					id = payload[0];
				} else if (typeof payload === "string") {
					id = payload;
				}
				commit("setStatus", "pending");
				const res = await this.$axios.$get(baseUrl + "/" + id);
				commit("setCurrent", res);
				commit("setStatus", "success");
			},
			async create({ commit }, payload = {}) {
				const { customEndpoint } = payload;
				commit("setStatus", "pending");
				const res = await this.$axios.$post(customEndpoint || baseUrl, payload);
				commit("set", {
					items: Array.isArray(res) ? res : [res],
				});
				commit("setStatus", "success");
			},
			async patch({ commit }, payload = []) {
				commit("setStatus", "pending");
				const res = await this.$axios.$patch(
					baseUrl + "/" + payload[0],
					payload[1]
				);
				commit("set", {
					items: [res],
				});
				commit("setStatus", "success");
			},
			async update({ commit }, payload = []) {
				commit("setStatus", "pending");
				const res = await this.$axios.$put(
					baseUrl + "/" + payload[0],
					payload[1]
				);
				commit("set", {
					items: [res],
				});
				commit("setStatus", "success");
			},
			async remove({ commit }, idOrPayload) {
				if (typeof idOrPayload === "string") {
					const id = idOrPayload;
					commit("setStatus", "pending");
					await this.$axios.$delete(baseUrl + "/" + id);
					commit("remove", idOrPayload);
					commit("setStatus", "success");
				} else {
					const payload = idOrPayload;
					const { query, customEndpoint } = payload;
					commit("setStatus", "pending");
					await this.$axios.$delete(customEndpoint || baseUrl, {
						params: query,
						paramsSerializer: (params) => {
							return qs.stringify(params);
						},
					});
					commit("setStatus", "success");
				}
			},
		},
		getters: {
			get: (state, id) => {
				return state.list.find((item) => item._id === id);
			},
		},
		mutations: {
			set(state, { items }) {
				state.list = items;
			},
			reset(state) {
				Object.assign(state, getDefaultState());
			},
			resetBusinessError(state) {
				state.businessError = null;
			},
			patchSingleItem(state, item) {
				const index = state.list.findIndex(
					(e) => e._id === item._id || item.id
				);
				if (index === -1) {
					console.error(
						"patchSingleItem error: No element in state.list found."
					);
				}
				state.list[index] = Object.assign(state.list[index], item);
			},
			setBusinessError(state, { statusCode, message }) {
				state.businessError = { statusCode, message };
			},
			remove(state, id) {
				const index = state.list.findIndex((e) => e._id === id);
				if (index === -1) {
					console.warn(`Can't remove item with id "${id}" (Not found)`);
					return;
				}
				state.list.splice(index, 1);
			},
			setCurrent(state, item) {
				state.current = item;
			},
			// Stores pagination data on state.pagination based on the query identifier (qid)
			// The qid must be manually assigned to `params.qid`
			updatePaginationForQuery(state, { res, qid, query }) {
				const { limit, skip, total } = res;
				Vue.set(state.pagination, qid, {
					limit: parseInt(limit),
					skip: parseInt(skip),
					total: parseInt(total),
					query: parseInt(query),
				});
			},
			setStatus(state, status) {
				state.status = status;
			},
		},
		state: () => getDefaultState(),
	};
}
