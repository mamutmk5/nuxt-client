<template>
	<div v-if="active" class="wrapper">
		<div class="content">
			<h4>
				<slot name="header" />
			</h4>
			<p class="body">
				<slot name="body" />
			</p>
			<div class="actions">
				<slot name="actions" />
				<v-btn text dark @click.self="close">
					{{ $t("common.labels.close") }}
				</v-btn>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	props: {
		active: {
			type: Boolean,
		},
	},
	data() {
		// This solely exists to appear in the coverage report
		return {};
	},
	methods: {
		close() {
			this.$emit("update:active", false);
		},
	},
};
</script>

<style lang="scss" scoped>
.wrapper {
	color: var(--v-white-base);
	background-color: var(--v-info-base);
	border-radius: var(--radius-lg);

	h4 {
		color: var(--v-white-base);
		text-align: center;
	}
}

.content {
	padding: var(--space-md);
	text-align: left;
}

.actions {
	text-align: right;

	> label {
		margin-bottom: var(--space-md);
	}
}
</style>
