<template>
	<a id="skip-link" tabindex="0" class="skip-link" href="#main-content">
		{{ $t("global.skipLink.mainContent") }}
	</a>
</template>

<script>
export default {};
</script>

<style lang="scss" scoped>
.skip-link {
	position: absolute;
	top: -100px;
	left: 50%;
	padding: var(--space-xs);
	color: var(--v-primary-base);
	background-color: var(--v-white-base);
	border: 1px solid #555;
	border-radius: var(--radius-xs);
	transform: translate(-50%, 0);
}

.skip-link:focus {
	top: 10px;
}
</style>
