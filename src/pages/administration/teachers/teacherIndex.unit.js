import { default as TeacherPage } from "./index.vue";

const mockData = [
	{
		_id: "id",
		firstName: "Marla",
		lastName: "Mathe",
		email: "schueler@schul-cloud.org",
		birthday: "01.01.2000",
	},
	{
		firstName: "Waldemar",
		lastName: "Wunderlich",
		birthday: "01.01.1989",
		email: "waldemar.wunderlich@schul-cloud.org",
	},
];

describe("Teacher/index", () => {
	const routerPushStub = jest.fn();

	let mockStore;

	beforeEach(() => {
		jest.useFakeTimers();

		mockStore = {
			classes: {
				actions: {
					find: jest.fn(),
				},
			},
			auth: {
				state: () => ({
					user: {
						roles: [
							{
								name: "administrator",
							},
						],
						permissions: ["TEACHER_CREATE", "TEACHER_DELETE"],
					},
					school: {
						isExternal: false,
					},
				}),
			},
			users: {
				actions: {
					handleUsers: jest.fn(),
				},
				getters: {
					list: () => mockData,
				},
				state: () => ({
					list: mockData,
					pagination: {
						default: {
							limit: 25,
							skip: 0,
							total: 2,
							query: "",
						},
					},
				}),
			},
			uiState: {
				getters: {
					get: () => () => ({ page: 1 }),
				},
				mutations: {
					set: jest.fn(),
				},
			},
		};
	});

	it(...isValidComponent(TeacherPage));

	it("should dispatch the 'handleUsers action on load'", async () => {
		mockStore.users.actions.handleUsers.mockClear();

		mount(TeacherPage, {
			...createComponentMocks({
				i18n: true,
				store: mockStore,
			}),
		});
		expect(mockStore.users.actions.handleUsers).toHaveBeenCalled();
	});

	it("should emit the 'delete' action when deleting a user", async () => {
		const wrapper = mount(TeacherPage, {
			...createComponentMocks({
				i18n: true,
				store: mockStore,
			}),
		});
		// user row exists
		const dataRow = wrapper.find(`[data-testid="table-data-row"]`);
		expect(dataRow.exists()).toBe(true);
		// user row checkbox is clicked
		const checkBox = dataRow.find(".select");
		expect(checkBox.exists()).toBe(true);
		await checkBox.trigger("click");
		await jest.runAllTimers();
		// user is selected
		expect(dataRow.vm.selected).toBe(true);

		// selection row component is rendered
		const selectionBar = wrapper.find(".row-selection-info");
		expect(selectionBar.exists()).toBe(true);

		// contextMenu is rendered
		const openContextButton = wrapper.find(".context-menu-open");
		expect(openContextButton.exists()).toBe(true);
		// contextMenu is clicked
		await openContextButton.trigger("click");
		await jest.runAllTimers();

		// delete button action is rendered in contextMenu
		const deleteActionButton = wrapper.find(`[data-testid="delete_action"]`);
		expect(deleteActionButton.exists()).toBe(true);
		// delete button is clicked
		await deleteActionButton.trigger("click");
		await jest.runAllTimers();

		// delete action is emitted
		expect(selectionBar.emitted("fire-action")[0][0].dataTestId).toStrictEqual(
			"delete_action"
		);
	});

	it("should emit the 'registration_link' action when the action button is clicked", async () => {
		const wrapper = mount(TeacherPage, {
			...createComponentMocks({
				i18n: true,
				store: mockStore,
			}),
		});
		// user row exists
		const dataRow = wrapper.find(`[data-testid="table-data-row"]`);
		expect(dataRow.exists()).toBe(true);
		// user row checkbox is clicked
		const checkBox = dataRow.find(".select");
		expect(checkBox.exists()).toBe(true);
		await checkBox.trigger("click");
		await jest.runAllTimers();
		// user is selected
		expect(dataRow.vm.selected).toBe(true);

		// selection row component is rendered
		const selectionBar = wrapper.find(".row-selection-info");
		expect(selectionBar.exists()).toBe(true);

		// contextMenu is rendered
		const openContextButton = wrapper.find(".context-menu-open");
		expect(openContextButton.exists()).toBe(true);
		// contextMenu is clicked
		await openContextButton.trigger("click");
		await jest.runAllTimers();

		// registration_link button action is rendered in contextMenu
		const registrationButton = wrapper.find(
			`[data-testid="registration_link"]`
		);
		expect(registrationButton.exists()).toBe(true);
		// registration_link button is clicked
		await registrationButton.trigger("click");
		await jest.runAllTimers();

		// registration_link action is emitted
		expect(selectionBar.emitted("fire-action")[0][0].dataTestId).toStrictEqual(
			"registration_link"
		);
	});

	it("should emit the 'qr_code' action when the action button is clicked", async () => {
		const wrapper = mount(TeacherPage, {
			...createComponentMocks({
				i18n: true,
				store: mockStore,
			}),
		});
		// user row exists
		const dataRow = wrapper.find(`[data-testid="table-data-row"]`);
		expect(dataRow.exists()).toBe(true);
		// user row checkbox is clicked
		const checkBox = dataRow.find(".select");
		expect(checkBox.exists()).toBe(true);
		await checkBox.trigger("click");
		await jest.runAllTimers();
		// user is selected
		expect(dataRow.vm.selected).toBe(true);

		// selection row component is rendered
		const selectionBar = wrapper.find(".row-selection-info");
		expect(selectionBar.exists()).toBe(true);

		// contextMenu is rendered
		const openContextButton = wrapper.find(".context-menu-open");
		expect(openContextButton.exists()).toBe(true);
		// contextMenu is clicked
		await openContextButton.trigger("click");
		await jest.runAllTimers();

		// qr_code button action is rendered in contextMenu
		const registrationButton = wrapper.find(`[data-testid="qr_code"]`);
		expect(registrationButton.exists()).toBe(true);
		// qr_code button is clicked
		await registrationButton.trigger("click");
		await jest.runAllTimers();

		// qr_code action is emitted
		expect(selectionBar.emitted("fire-action")[0][0].dataTestId).toStrictEqual(
			"qr_code"
		);
	});

	it("should display the same number of elements as in the mockData object", async () => {
		const wrapper = mount(TeacherPage, {
			...createComponentMocks({
				i18n: true,
				store: mockStore,
			}),
		});
		const table = wrapper.find(`[data-testid="teachers_table"]`);
		expect(table.vm.data).toHaveLength(mockData.length);
	});

	it("should display the edit button if school is not external", async () => {
		const wrapper = mount(TeacherPage, {
			...createComponentMocks({
				i18n: true,
				store: mockStore,
			}),
		});
		const editBtn = wrapper.find(`[data-testid="edit_teacher_button"]`);
		expect(editBtn.exists()).toBe(true);
	});

	it("should not display the edit button if school is external", async () => {
		const customMockStore = { ...mockStore };
		customMockStore.auth.state = () => ({
			user: {
				roles: [
					{
						name: "administrator",
					},
				],
			},
			school: {
				isExternal: true,
			},
		});
		const wrapper = mount(TeacherPage, {
			...createComponentMocks({
				i18n: true,
				store: customMockStore,
			}),
		});
		const editBtn = wrapper.find(`[data-testid="edit_teacher_button"]`);
		expect(editBtn.exists()).toBe(false);
	});

	it("editBtn's to property should have the expected URL", async () => {
		const expectedURL = "/administration/teachers/id/edit";
		const wrapper = mount(TeacherPage, {
			...createComponentMocks({
				i18n: true,
				store: mockStore,
			}),
		});
		const editBtn = wrapper.find(`[data-testid="edit_teacher_button"]`);
		expect(editBtn.vm.to).toStrictEqual(expectedURL);
	});

	it("breadcrumb's link should have the same 'to' location as the page's breadcrumbs data object", async () => {
		const wrapper = mount(TeacherPage, {
			...createComponentMocks({
				i18n: true,
				store: mockStore,
				$router: { push: routerPushStub },
			}),
		});
		const link = wrapper.find("a");
		expect(link.vm.to).toStrictEqual(wrapper.vm.breadcrumbs[0].to);
	});

	it("should render the fab-floating component if user has TEACHER_CREATE permission", async () => {
		const wrapper = mount(TeacherPage, {
			...createComponentMocks({
				i18n: true,
				store: mockStore,
			}),
		});

		const fabComponent = wrapper.find(
			`[data-testid="fab_button_teachers_table"]`
		);
		expect(fabComponent.exists()).toBe(true);
	});

	it("should not render the fab-floating component if user does not have TEACHER_CREATE permission", async () => {
		const customMockStore = { ...mockStore };
		customMockStore.auth.state = () => ({
			user: {
				roles: [
					{
						name: "administrator",
					},
				],
			},
			school: {
				isExternal: true,
			},
		});
		const wrapper = mount(TeacherPage, {
			...createComponentMocks({
				i18n: true,
				store: mockStore,
			}),
		});

		const fabComponent = wrapper.find(".external-sync-hint");
		expect(fabComponent.exists()).toBe(true);
	});

	it("should not render the fab-floating component if isExternal is true", async () => {
		const customMockStore = { ...mockStore };
		customMockStore.auth.state = () => ({
			user: {
				roles: [
					{
						name: "administrator",
						permissions: ["TEACHERCREATE"],
					},
				],
			},
			school: {
				isExternal: true,
			},
		});

		const wrapper = mount(TeacherPage, {
			...createComponentMocks({
				i18n: true,
				store: customMockStore,
			}),
		});
		const fabComponent = wrapper.find(
			`[data-testid="fab_button_teachers_table"]`
		);
		expect(fabComponent.exists()).toBe(false);
	});

	it("should render the adminTableLegend component when school is external", async () => {
		const customMockStore = { ...mockStore };
		customMockStore.auth.state = () => ({
			user: {
				roles: [
					{
						name: "administrator",
						permissions: ["TEACHER_CREATE"],
					},
				],
			},
			school: {
				isExternal: true,
			},
		});

		const wrapper = mount(TeacherPage, {
			...createComponentMocks({
				i18n: true,
				store: customMockStore,
			}),
		});
		const externalHint = wrapper.find(".external-sync-hint");

		expect(externalHint.exists()).toBe(true);
	});

	it("should not render the adminTableLegend component when school is not external", async () => {
		const wrapper = mount(TeacherPage, {
			...createComponentMocks({
				i18n: true,
				store: mockStore,
			}),
		});

		const externalHint = wrapper.find(`.external-sync-hint`);
		expect(externalHint.exists()).toBe(false);
	});

	it("should call barSearch method when searchbar component's value change", async () => {
		const wrapper = mount(TeacherPage, {
			...createComponentMocks({
				i18n: true,
				store: mockStore,
			}),
		});

		// run all existing timers
		await jest.runAllTimers();
		// reset the mock call stack
		mockStore.users.actions.handleUsers.mockClear();
		mockStore.uiState.mutations.set.mockClear();

		const searchBarInput = wrapper.find(`input[data-testid="searchbar"]`);
		expect(searchBarInput.exists()).toBe(true);

		searchBarInput.setValue("abc");

		expect(mockStore.uiState.mutations.set).toHaveBeenCalled();

		//run new timer from updating the value
		await jest.runAllTimers();

		expect(mockStore.users.actions.handleUsers).toHaveBeenCalled();
	});

	it("should table filter options call uiState after passing props", async () => {
		const wrapper = mount(TeacherPage, {
			...createComponentMocks({
				i18n: true,
				store: mockStore,
			}),
		});

		await jest.runAllTimers();

		mockStore.uiState.mutations.set.mockClear();

		const filterComponent = wrapper.find(`[data-testid="data_filter"]`);
		expect(filterComponent.exists()).toBe(true);

		filterComponent.setProps({ activeFilters: { classes: ["mockclassname"] } });

		await jest.runAllTimers();

		expect(mockStore.uiState.mutations.set).toHaveBeenCalled();
	});
});
