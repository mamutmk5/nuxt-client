<template>
	<div class="header elevation-2">
		<div class="nav-container">
			<div class="logo-container">
				<base-link :href="logoLink">
					<img class="logo logo-full" :src="img" alt="Schulcloud Logo" />
				</base-link>
			</div>
			<div v-if="linksToDisplay.length || hasButtons" class="link-container">
				<v-btn
					v-for="(route, idx) in linksToDisplay"
					:key="route.href"
					text
					class="font-weight-regular mx-0"
					:class="{ li: true, active: activeLink === route.href }"
					:to="route.to"
					:href="route.href"
					:target="route.target"
					@click="setActive(idx)"
				>
					{{ route.title }}
				</v-btn>
				<div v-if="hasButtons" class="buttons-container">
					<v-btn color="primary" outlined to="/loginRedirect" class="mx-2">
						<v-icon size="20" class="mr-1">{{ mdiLogin }}</v-icon>
						{{ $t("common.labels.login") }}
					</v-btn>
					<v-btn color="primary" depressed to="/community">
						{{ $t("common.labels.register") }}
					</v-btn>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
import { envConfigModule } from "@/store";
import { mdiLogin } from "@mdi/js";

export default {
	props: {
		logoLink: {
			type: String,
			default: "/",
			required: false,
		},
		img: {
			type: String,
			required: true,
		},
		links: {
			type: Array,
			default: () => [],
			required: false,
		},
		buttons: {
			type: Boolean,
			required: false,
		},
	},
	data() {
		return {
			mdiLogin,
			activeLink: window.location.pathname,
		};
	},
	computed: {
		hasButtons() {
			return envConfigModule.getEnv.SC_THEME === "default" ? true : false;
		},
		linksToDisplay() {
			return envConfigModule.getEnv.SC_THEME === "default" ? this.links : [];
		},
	},
	methods: {
		setActive(idx) {
			this.activeLink = idx;
		},
	},
};
</script>

<style lang="scss" scoped>
@import "@styles";

.header {
	position: sticky;
	position: -webkit-sticky;
	top: 0;
	left: 0;
	z-index: var(--layer-fab);
	display: flex;
	flex-flow: row wrap;
	justify-content: center;
	width: 100%;
	line-height: var(--line-height-lg);
	color: var(--v-black-base);
	text-align: center;
	background-color: var(--v-white-base);
	-webkit-backdrop-filter: blur(5px);
	backdrop-filter: blur(5px);
}

.nav-container {
	@include breakpoint(tablet) {
		margin: 0 calc(3.5 * var(--space-md));
	}

	@include breakpoint(desktop) {
		padding: 0 calc(5 * var(--border-width));
		margin: auto;
	}
}

.logo-container {
	@include breakpoint(tablet) {
		height: calc(45 * var(--border-width));

		> a > img {
			height: var(--space-xl-2);
		}
	}

	@include breakpoint(desktop) {
		height: var(--topbar-height);

		> a > img {
			height: var(--topbar-height);
		}
	}
}

.link-container {
	display: flex;
	flex-flow: row wrap;
	justify-content: center;
	padding-bottom: var(--space-xs);

	@include breakpoint(tablet) {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	@include breakpoint(desktop) {
		justify-content: right;
		padding-bottom: 0;
	}

	> a {
		padding: calc(9 * var(--border-width));
		margin-right: 0;
		margin-bottom: var(--space-xs);

		@include breakpoint(tablet) {
			margin-bottom: 0;
		}
	}
}

.icon {
	font-size: var(--radius-lg);
}

@media (min-width: 576px) {
	.nav-container {
		width: 540px;
		max-width: 100%;
	}

	.link-container > a,
	.buttons-container > button {
		margin-right: var(--space-xs);
	}
}

@media (min-width: 768px) {
	.nav-container {
		display: block;
		width: 720px;
		max-width: 100%;
	}
}

@media (max-width: 992px) {
	.logo-container {
		margin: auto;
	}
}

@media (min-width: 992px) {
	.nav-container {
		display: flex;
		justify-content: space-between;
		width: 960px;
		max-width: 100%;
	}
}

@media (min-width: 1200px) {
	.nav-container {
		width: 1140px;
		max-width: 100%;
	}
}

.li {
	align-items: center;
	justify-content: center;
	padding: var(--space-xs) var(--space-md);
	font-family: var(--font-primary);
	font-size: var(--text-md);
	color: var(--v-black-base);

	@include breakpoint(tablet) {
		display: flex;
	}

	@include breakpoint(desktop) {
		font-size: var(--text-md);
	}

	&:hover {
		background-color: var(--v-grey-lighten1);
		border-radius: var(--radius-sm);
	}
}

a.active {
	font-weight: var(--font-weight-bold);
	color: var(--v-white-base);
	background-color: var(--v-accent-base);
	border-radius: var(--radius-sm);

	&:hover {
		color: var(--v-white-base);
		background-color: var(--v-accent-base);
		border-radius: var(--radius-sm);
	}
}
</style>
