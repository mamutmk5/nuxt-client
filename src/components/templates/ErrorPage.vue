<template>
	<div class="text-centered">
		<base-image
			v-if="error.statusCode === 404"
			img-src="@assets/img/pageNotFound.svg"
			img-height="300px"
			fill="var(--v-primary-base)"
			role="presentation"
		/>
		<img
			v-else
			role="presentation"
			alt=""
			src="@assets/img/pc_repair.png"
			class="error-img"
		/>

		<h1 class="error-msg">
			<template v-if="error.message">
				{{ error.message }}
			</template>
			<template v-else> Ein Fehler ist aufgetreten </template>
		</h1>
		<slot name="action">
			<v-btn color="primary" depressed @click="$router.go(-1)">
				{{ $t("error.action.back") }}
			</v-btn>
		</slot>
	</div>
</template>
<script>
export default {
	props: {
		error: {
			type: Object,
			required: true,
		},
	},
	data() {
		// This solely exists to appear in the coverage report
		return {};
	},
};
</script>

<style lang="scss" scoped>
.text-centered {
	text-align: center;
}

h1.error-msg {
	margin-bottom: var(--space-lg);
}

.error-img {
	margin-top: var(--space-xl-4);
}
</style>
