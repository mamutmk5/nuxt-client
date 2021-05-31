import { merge } from "lodash";
import serviceTemplate from "@utils/service-template";
const base = serviceTemplate("homework");

const module = {
	actions: {
		getHomeworksDashboard: async function ({ commit }) {
			commit("setLoading", true);
			try {
				const res = await this.$axios.$get("/v3/task/dashboard/");
				commit("set", {
					items: res,
				});
				commit("setLoading", false);
			} catch (error) {
				commit("setBusinessError", error.response.data);
				commit("setLoading", false);
			}
		},
	},
	getters: {
		isListEmpty: (state) => {
			return state.loading === false && state.list.length === 0;
		},
		isListFilled: (state) => {
			return state.loading === false && state.list.length > 0;
		},
	},
};

export default merge(module, base);
