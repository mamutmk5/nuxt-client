<template>
	<div v-if="numberOfSelectedItems > 0" class="row-selection-info">
		<div class="d-flex align-items-center content-wrapper">
			<div v-if="allRowsOfAllPagesSelected">
				{{ $t("pages.administration.all") }}
				{{ totalNumberOfItems }}
				{{ $t("pages.administration.selected") }}
			</div>
			<div v-else>
				<span
					>{{ numberOfSelectedItems }}
					{{ $t("pages.administration.selected") }}
				</span>
			</div>
			<div
				v-if="actions && actions.length"
				class="actions"
				style="position: relative"
			>
				<v-btn
					data-test-id="context-menu-open"
					class="context-menu-open"
					small
					depressed
					color="secondary"
					@click="actionsMenuOpen = true"
				>
					{{ $t("pages.administration.actions") }}
				</v-btn>
				<context-menu
					:show.sync="actionsMenuOpen"
					anchor="top-right"
					:actions="contextActions"
					@action="fireAction"
				/>
			</div>
		</div>
		<v-btn
			fab
			depressed
			color="secondary"
			width="40"
			height="40"
			@click="closeBanner"
		>
			<v-icon>{{ mdiClose }}</v-icon>
		</v-btn>
	</div>
</template>

<script>
import ContextMenu from "@components/molecules/ContextMenu";
import { mdiClose } from "@mdi/js";

export default {
	components: {
		ContextMenu,
	},
	props: {
		actions: {
			type: Array,
			default: () => [],
		},
		totalNumberOfItems: {
			type: Number,
			default: 0,
		},
		numberOfSelectedItems: {
			type: Number,
			required: true,
		},
		allRowsOfAllPagesSelected: {
			type: Boolean,
		},
	},
	data() {
		return {
			actionsMenuOpen: false,
			mdiClose,
		};
	},
	computed: {
		contextActions() {
			return this.actions.map((actionCtx, index) => ({
				text: actionCtx.label,
				icon: actionCtx.icon,
				"icon-source": actionCtx["icon-source"],
				event: "action",
				arguments: index,
				dataTestId: actionCtx.dataTestId || null,
			}));
		},
	},
	watch: {
		numberOfSelectedItems(to) {
			if (to === 0) {
				this.actionsMenuOpen = false;
			}
		},
	},
	beforeDestroy() {
		this.actionsMenuOpen = false;
	},
	methods: {
		closeBanner() {
			this.$emit("update:allRowsOfAllPagesSelected", false);
		},
		fireAction(index) {
			this.$emit("fire-action", this.actions[index]);
		},
	},
};
</script>

<style lang="scss" scoped>
@import "@styles";

.row-selection-info {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: space-between;
	width: 100%;
	padding: var(--space-xs) var(--space-md);
	color: var(--v-white-base);
	background-color: var(--v-secondary-lighten1);
}

.actions {
	margin-top: var(--space-sm);

	@include breakpoint(tablet) {
		margin-top: 0;
		margin-left: var(--space-md);
	}
}

.content-wrapper {
	flex-wrap: wrap;
	margin: var(--space-xs) 0;
}

.select-all-rows {
	color: var(--v-white-base);
	text-decoration: underline;
	cursor: pointer;
}

.close {
	color: var(--v-white-base);
}
</style>
