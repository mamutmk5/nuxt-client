<template>
	<default-wireframe
		:breadcrumbs="breadcrumbs"
		:full-width="true"
		:headline="$t('pages.administration.teachers.index.title')"
		:fab-items="fab"
	>
		<progress-modal
			:active="isDeleting"
			:percent="deletedPercent"
			:title="$t('pages.administration.teachers.index.remove.progress.title')"
			:description="
				$t('pages.administration.teachers.index.remove.progress.description')
			"
			data-testid="progress-modal"
		/>

		<base-input
			v-model="searchQuery"
			type="text"
			:placeholder="
				$t('pages.administration.teachers.index.searchbar.placeholder')
			"
			class="search-section"
			label=""
			data-testid="searchbar"
			@update:vmodel="barSearch"
		>
			<template #icon> <base-icon source="material" icon="search" /></template>
		</base-input>

		<data-filter
			:filters="filters"
			:backend-filtering="true"
			:active-filters.sync="currentFilterQuery"
			data-testid="data_filter"
		/>

		<backend-data-table
			:actions="filteredActions"
			:columns="filteredColumns"
			:current-page.sync="page"
			:data="teachers"
			:paginated="true"
			:total="pagination.total"
			:rows-per-page.sync="limit"
			:rows-selectable="true"
			track-by="_id"
			:selected-row-ids.sync="tableSelection"
			:selection-type.sync="tableSelectionType"
			:sort-by="sortBy"
			:sort-order="sortOrder"
			data-testid="teachers_table"
			@update:sort="onUpdateSort"
			@update:current-page="onUpdateCurrentPage"
			@update:rows-per-page="onUpdateRowsPerPage"
		>
			<template #datacolumn-classes="{ data }">
				{{ (data || []).join(", ") }}
			</template>
			<template #datacolumn-createdAt="{ data }">
				<span class="text-content">{{ printDate(data) }}</span>
			</template>
			<template #datacolumn-consentStatus="{ data: status }">
				<span class="text-content">
					<base-icon
						v-if="status === 'ok'"
						source="material"
						icon="check"
						color="var(--v-success-base)"
					/>
					<base-icon
						v-else-if="status === 'missing'"
						source="material"
						icon="close"
						color="var(--v-error-base)"
					/>
				</span>
			</template>

			<template #datacolumn-_id="{ data, selected, highlighted }">
				<v-btn
					icon
					:class="{
						'action-button': true,
						'row-selected': selected,
						'row-highlighted': highlighted,
					}"
					:to="`/administration/teachers/${data}/edit`"
					data-testid="edit_teacher_button"
				>
					<v-icon size="20">{{ mdiPencil }}</v-icon>
				</v-btn>
			</template>
		</backend-data-table>
		<admin-table-legend
			:icons="icons"
			:show-icons="showConsent"
			:show-external-sync-hint="schoolIsExternallyManaged"
		/>
	</default-wireframe>
</template>
<script>
/* eslint-disable max-lines */
import { authModule, envConfigModule, schoolsModule } from "@/store";
import { mapGetters } from "vuex";
import DefaultWireframe from "@/components/templates/DefaultWireframe.vue";
import BackendDataTable from "@components/organisms/DataTable/BackendDataTable";
import AdminTableLegend from "@components/molecules/AdminTableLegend";
import DataFilter from "@components/organisms/DataFilter/DataFilter";
import { teacherFilter } from "@utils/adminFilter";
import print from "@mixins/print";
import UserHasPermission from "@/mixins/UserHasPermission";
import { printDate } from "@plugins/datetime";
import ProgressModal from "@components/molecules/ProgressModal";
import { mdiPlus, mdiAccountPlus, mdiCloudDownload, mdiPencil } from "@mdi/js";

export default {
	components: {
		DataFilter,
		DefaultWireframe,
		BackendDataTable,
		AdminTableLegend,
		ProgressModal,
	},
	mixins: [print, UserHasPermission],
	props: {
		showExternalSyncHint: {
			type: Boolean,
		},
	},
	meta: {
		requiredPermissions: ["TEACHER_LIST"],
	},
	data() {
		return {
			mdiPlus,
			mdiAccountPlus,
			mdiCloudDownload,
			mdiPencil,
			currentFilterQuery: this.$uiState.get(
				"filter",
				"pages.administration.teachers.index"
			),
			test: this.$uiState,
			page:
				(this.$uiState.get(
					"pagination",
					"pages.administration.teachers.index"
				) &&
					this.$uiState.get("pagination", "pages.administration.teachers.index")
						.page) ||
				1,
			limit:
				(this.$uiState.get(
					"pagination",
					"pages.administration.teachers.index"
				) &&
					this.$uiState.get("pagination", "pages.administration.teachers.index")
						.limit) ||
				25,
			sortBy:
				(this.$uiState.get("sorting", "pages.administration.teachers.index") &&
					this.$uiState.get("sorting", "pages.administration.teachers.index")
						.sortBy) ||
				"firstName",
			sortOrder:
				(this.$uiState.get("sorting", "pages.administration.teachers.index") &&
					this.$uiState.get("sorting", "pages.administration.teachers.index")
						.sortOrder) ||
				"asc",
			breadcrumbs: [
				{
					text: this.$t("pages.administration.index.title"),
					to: "/administration/",
				},
				{
					text: this.$t("pages.administration.teachers.index.title"),
					disabled: true,
				},
			],

			tableActions: [
				{
					label: this.$t(
						"pages.administration.teachers.index.tableActions.email"
					),
					icon: "mail_outline",
					"icon-source": "material",
					action: this.handleBulkEMail,
					dataTestId: "registration_link",
				},
				{
					label: this.$t("pages.administration.teachers.index.tableActions.qr"),
					"icon-source": "fa",
					icon: "qrcode",
					action: this.handleBulkQR,
					dataTestId: "qr_code",
				},
				{
					label: this.$t(
						"pages.administration.teachers.index.tableActions.delete"
					),
					icon: "delete_outline",
					"icon-source": "material",
					action: this.handleBulkDelete,
					permission: "TEACHER_DELETE",
					dataTestId: "delete_action",
				},
			],
			tableSelection: [],
			tableSelectionType: "inclusive",
			tableColumns: [
				{
					field: "firstName",
					label: this.$t("common.labels.firstName"),
					sortable: true,
				},
				{
					field: "lastName",
					label: this.$t("common.labels.lastName"),
					sortable: true,
				},
				{
					field: "email",
					label: this.$t("common.labels.email"),
					sortable: true,
				},
				{
					field: "classes",
					label: this.$t("common.labels.classes"),
					sortable: true,
				},
				{
					field: "consentStatus",
					label: this.$t("common.labels.registration"),
					sortable: true,
				},
				{
					field: "createdAt",
					label: this.$t("common.labels.createdAt"),
					sortable: true,
				},
				{
					// edit column
					field: "_id",
					label: "",
				},
			],
			icons: [
				{
					icon: "check",
					color: "var(--v-success-base)",
					label: this.$t("pages.administration.students.legend.icon.success"),
				},
				{
					icon: "clear",
					color: "var(--v-error-base)",
					label: this.$t("utils.adminFilter.consent.label.missing"),
				},
			],
			filters: teacherFilter(this),
			searchQuery:
				(this.$uiState.get("filter", "pages.administration.teachers.index") &&
					this.$uiState.get("filter", "pages.administration.teachers.index")
						.searchQuery) ||
				"",
		};
	},
	computed: {
		...mapGetters("users", {
			teachers: "getList",
			pagination: "getPagination",
			isDeleting: "getActive",
			deletedPercent: "getPercent",
			qrLinks: "getQrLinks",
		}),
		user() {
			return authModule.getUser;
		},
		schoolIsExternallyManaged() {
			return schoolsModule.schoolIsExternallyManaged;
		},
		env() {
			return envConfigModule.getEnv;
		},
		tableData: {
			get() {
				if (this.takeOverTableData) return this.searchData;
				return this.teachers;
			},
		},
		showConsent() {
			return this.env && this.env.ADMIN_TABLES_DISPLAY_CONSENT_COLUMN;
		},
		filteredActions() {
			let editedActions = this.tableActions;

			// filter actions by permissions
			editedActions = this.tableActions.filter((action) =>
				action.permission ? this.$_userHasPermission(action.permission) : true
			);

			// filters out the QR bulk action is user is not an admin
			if (!this.user.roles.some((role) => role.name === "administrator")) {
				editedActions = editedActions.filter(
					(action) =>
						action.label !==
						this.$t("pages.administration.teachers.index.tableActions.qr")
				);
			}

			// filter the delete action if school is external
			if (this.schoolIsExternallyManaged) {
				editedActions = editedActions.filter(
					(action) =>
						action.label !==
						this.$t("pages.administration.teachers.index.tableActions.delete")
				);
			}

			return editedActions;
		},
		filteredColumns() {
			let editedColumns = this.tableColumns;
			// filters out edit column if school is external or if user is not an admin
			if (
				this.schoolIsExternallyManaged ||
				!this.user.roles.some((role) => role.name === "administrator")
			) {
				editedColumns = this.tableColumns.filter(
					// _id field sets the edit column
					(col) => col.field !== "_id"
				);
			}

			// filters out the consent column if ADMIN_TABLES_DISPLAY_CONSENT_COLUMN env is disabled
			if (!this.showConsent) {
				editedColumns = editedColumns.filter(
					(col) => col.field !== "consentStatus"
				);
			}

			return editedColumns;
		},
		fab() {
			if (
				this.schoolIsExternallyManaged ||
				!this.$_userHasPermission("TEACHER_CREATE")
			) {
				return null;
			}

			return {
				icon: mdiPlus,
				title: this.$t("common.actions.create"),
				testId: "fab_button_teachers_table",
				ariaLabel: this.$t("common.actions.create"),
				actions: [
					{
						label: this.$t("pages.administration.teachers.fab.add"),
						icon: mdiAccountPlus,
						to: "/administration/teachers/new",
						dataTestid: "fab_button_add_teachers",
						ariaLabel: this.$t("pages.administration.teachers.fab.add"),
					},
					{
						label: this.$t("pages.administration.teachers.fab.import"),
						icon: mdiCloudDownload,
						href: "/administration/teachers/import",
						dataTestid: "fab_button_import_teachers",
						ariaLabel: this.$t("pages.administration.teachers.fab.import"),
					},
				],
			};
		},
	},
	watch: {
		currentFilterQuery: function (query) {
			var temp = this.$uiState.get(
				"filter",
				"pages.administration.teacher.index"
			);

			if (temp && temp.searchQuery) query.searchQuery = temp.searchQuery;

			this.currentFilterQuery = query;
			if (
				JSON.stringify(query) !==
				JSON.stringify(
					this.$uiState.get("filter", "pages.administration.teachers.index")
				)
			) {
				this.onUpdateCurrentPage(1);
			}
			this.$uiState.set("filter", "pages.administration.teachers.index", {
				query,
			});
		},
	},
	created(ctx) {
		this.find();
	},
	methods: {
		find() {
			const query = {
				$limit: this.limit,
				$skip: (this.page - 1) * this.limit,
				$sort: {
					[this.sortBy]: this.sortOrder === "asc" ? 1 : -1,
				},
				...this.currentFilterQuery,
			};
			this.$store.dispatch("users/findTeachers", {
				query,
			});
		},
		onUpdateSort(sortBy, sortOrder) {
			this.sortBy = sortBy;
			this.sortOrder = sortOrder;
			this.$uiState.set("sorting", "pages.administration.teachers.index", {
				sortBy: this.sortBy,
				sortOrder: this.sortOrder,
			});
			this.onUpdateCurrentPage(1); // implicitly triggers new find
		},
		onUpdateCurrentPage(page) {
			this.page = page;
			this.$uiState.set("pagination", "pages.administration.teachers.index", {
				currentPage: page,
			});
			this.find();
		},
		onUpdateRowsPerPage(limit) {
			// this.page = 1;
			this.limit = limit;
			// save user settings in uiState
			this.$uiState.set("pagination", "pages.administration.teachers.index", {
				itemsPerPage: limit,
				currentPage: this.page,
			});
			this.find();
		},
		printDate,
		getQueryForSelection(rowIds, selectionType) {
			return {
				...this.currentFilterQuery,
				selectionType,
				_ids: rowIds,
			};
		},
		async handleBulkEMail(rowIds, selectionType) {
			try {
				// TODO wrong use of store (not so bad)
				await this.$store.dispatch("users/sendRegistrationLink", {
					userIds: rowIds,
					selectionType,
				});
				this.$toast.success(
					this.$tc("pages.administration.sendMail.success", rowIds.length)
				);
			} catch (error) {
				this.$toast.error(
					this.$tc("pages.administration.sendMail.error", rowIds.length)
				);
			}
		},
		async handleBulkQR(rowIds, selectionType) {
			try {
				await this.$store.dispatch("users/getQrRegistrationLinks", {
					userIds: rowIds,
					selectionType,
					roleName: "teacher",
				});
				if (this.qrLinks.length) {
					this.$_printQRs(this.qrLinks);
				} else {
					this.$toast.info(this.$tc("pages.administration.printQr.emptyUser"));
				}
			} catch (error) {
				this.$toast.error(
					this.$tc("pages.administration.printQr.error", rowIds.length)
				);
			}
		},
		handleBulkDelete(rowIds, selectionType) {
			const onConfirm = async () => {
				try {
					// TODO wrong use of store (not so bad)
					await this.$store.dispatch("users/deleteUsers", {
						ids: rowIds,
						userType: "teacher",
					});
					this.$toast.success(this.$t("pages.administration.remove.success"));
					this.find();
				} catch (error) {
					this.$toast.error(this.$t("pages.administration.remove.error"));
				}
			};
			const onCancel = () => {
				this.$set(this, "tableSelection", []);
				this.tableSelectionType = "inclusive";
			};
			let message;
			if (selectionType === "inclusive") {
				message = this.$tc(
					"pages.administration.teachers.index.remove.confirm.message.some",
					rowIds.length,
					{ number: rowIds.length }
				);
			} else {
				if (rowIds.length) {
					message = this.$t(
						"pages.administration.teachers.index.remove.confirm.message.many",
						{ number: rowIds.length }
					);
				} else {
					message = this.$t(
						"pages.administration.teachers.index.remove.confirm.message.all"
					);
				}
			}
			this.$dialog.confirm({
				message,
				confirmText: this.$t(
					"pages.administration.teachers.index.remove.confirm.btnText"
				),
				cancelText: this.$t("common.actions.cancel"),
				icon: "report_problem",
				iconSource: "material",
				iconColor: "var(--v-error-base)",
				actionDesign: "danger",
				onConfirm,
				onCancel,
				invertedDesign: true,
			});
		},
		barSearch: function (searchText) {
			this.currentFilterQuery.searchQuery = searchText.trim();

			const query = this.currentFilterQuery;

			this.$uiState.set("filter", "pages.administration.teachers.index", {
				query,
			});

			setTimeout(() => {
				this.$store.dispatch("users/findTeachers", {
					query,
				});
			}, 400);
		},
	},
	head() {
		return {
			title: `${this.$t("pages.administration.teachers.index.title")} - ${
				this.$theme.short_name
			}`,
		};
	},
};
</script>

<style lang="scss" scoped>
@import "@styles";

::v-deep .row-highlighted.theme--light.v-btn:hover::before {
	opacity: 0;
}

a.action-button {
	&.row-highlighted:hover {
		background-color: var(--v-white-base);
	}

	&.row-selected {
		color: var(--v-white-base);

		&:hover {
			background-color: var(--v-secondary-darken1);
			box-shadow: none;
		}
	}
}

span {
	font-weight: var(--font-weight-normal);
}

.content {
	max-height: 35vh;
	overflow-y: scroll;
	font-weight: var(--font-weight-normal);
}

.list {
	padding: var(--space-lg);
}

.th-slot {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: center;
}

.info-box {
	position: absolute;
	right: 0%;
	z-index: calc(var(--layer-fab) + 1);
	max-width: 100%;
	margin-top: var(--space-md);
	margin-right: var(--space-lg);
	margin-left: var(--space-lg);

	@include breakpoint(tablet) {
		min-width: 450px;
		max-width: 50%;
		margin-right: var(--space-xl);
	}
}

button:not(.is-none):focus {
	z-index: var(--layer-fab);
	outline: none;
	box-shadow: 0 0 0 0 var(--v-white-base), 0 0 0 3px var(--button-background);
}

.search-section {
	max-width: 100%;
	margin-top: var(--space-xs);
	margin-bottom: var(--space-xs);
	margin-left: 0;
}
</style>
