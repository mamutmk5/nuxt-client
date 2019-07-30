import TheTopBar from "./TheTopBar";

const mockActions = [
	{ type: "popupIcon", icon: "house", title: "test home", to: "home" },
	{ type: "text", title: "test away", href: "https://schul-cloud.org" },
	{ type: "text", title: "test action", event: "light-camera" },
];

describe("@components/TheTopBar", () => {
	it(...isValidComponent(TheTopBar));
	const $theme = {
		name: "test",
		logo: {
			app: "none",
		},
	};
	it("Render defaults", () => {
		const wrapper = shallowMount(TheTopBar, {
			mocks: {
				$theme,
			},
		});
		expect(wrapper.find(".action").exists()).toBe(false);
	});

	it("Render with links and buttons", () => {
		// eslint-disable-next-line no-unused-vars
		const wrapper = shallowMount(TheTopBar, {
			propsData: {
				actions: mockActions,
			},
			mocks: {
				$theme,
			},
		});
		//TODO
		// expect(wrapper.findAll("base-icon-button-stub").length).toBe(1);
		// expect(wrapper.findAll("base-button-stub").length).toBe(1);
		// wrapper.find("base-button-stub").vm.$emit("click");
		// expect(wrapper.emitted("action")[0]).toEqual(["light-camera"]);
		// expect(wrapper.findAll(".action").length).toBe(3);
	});
	it("can switch to fullscreen mode", () => {
		const wrapper = mount(TheTopBar, {
			propsData: {
				fullscreenMode: true,
			},
		});

		wrapper.find(".fullscreen-button").trigger("click");
		expect(wrapper.emitted().action[0]).toEqual(["fullscreen"]);

		expect(wrapper.findAll(".item").length).toBe(0);
		expect(wrapper.findAll(".top-sidebar").length).toBe(0);
		expect(wrapper.findAll(".fullscreen-button-active").length).toBe(1);
	});
});
