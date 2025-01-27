<template>
	<div class="chips">
		<div
			v-for="chip in chips"
			:key="chip.id"
			role="button"
			tabindex="0"
			:class="{
				chip: true,
				'is-deletable': chip.deletable,
			}"
			@click="$emit('open', chip.id)"
			@keyup.self.enter.space="$emit('open', chip.id)"
		>
			<span class="label">
				{{ chip.label }}
			</span>
			<v-btn
				v-if="chip.deletable"
				fab
				depressed
				color="secondary"
				class="btn-delete"
				@click.stop="$emit('remove', chip.id)"
			>
				<v-icon small>{{ mdiClose }}</v-icon>
			</v-btn>
		</div>
	</div>
</template>

<script>
import { mdiClose } from "@mdi/js";

export default {
	props: {
		chips: {
			type: Array,
			required: true,
		},
	},
	data() {
		return {
			mdiClose,
		};
	},
};
</script>

<style lang="scss" scoped>
$transition: background var(--duration-transition-medium)
	cubic-bezier(0.23, 1, 0.32, 1);
$mobile: 750px; // css variables do not work with media queries

.chips {
	display: flex;
	flex-wrap: nowrap;
}

.chip {
	display: inline-flex;
	flex-wrap: nowrap;
	align-items: center;
	padding: var(--space-xs-3) var(--space-sm);
	margin-right: var(--space-sm);
	line-height: var(--line-height);
	color: var(--v-white-base);
	white-space: nowrap;
	cursor: pointer;
	background-color: var(--v-white-base);
	border: 1px solid var(--v-secondary-base);
	border-radius: var(--radius-round);
	transition: $transition;

	&:last-of-type {
		margin-right: 0;
	}

	&.is-deletable {
		padding-right: var(--space-xs-2);
	}

	&:hover {
		box-shadow: 0 0 0 1px var(--v-secondary-base);
	}

	&:focus {
		outline: none;
		box-shadow: 0 0 0 3px var(--v-white-base),
			0 0 0 6px var(--v-secondary-darken1);
	}

	.btn-delete {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.5em;
		height: 1.5em;
		padding: var(--space-xs-3);
		margin: 0;
		margin-right: calc(-1 * var(--space-xs-4));
		margin-left: var(--space-xs);
		color: var(--v-white-base);
		cursor: pointer;
		background-color: var(--v-secondary-base);
		border: none;
		border-radius: var(--radius-round);
		transition: $transition;

		&:hover,
		&:focus {
			color: var(--v-white-base);
			background: var(--v-secondary-darken1);
		}

		&:focus {
			outline: none;
			box-shadow: 0 0 0 3px var(--v-white-base),
				0 0 0 6px var(--v-secondary-darken1);
		}
	}

	.label {
		font-family: var(--font-accent);
		font-size: var(--text-md);
		font-weight: var(--font-weight-bold);
		color: var(--v-secondary-base);
	}
}

@media (max-width: $mobile) {
	.chips {
		display: flex;
		flex-direction: column;
		flex-wrap: nowrap;
	}

	.chip {
		justify-content: space-between;
		margin-right: 0;
		margin-bottom: var(--space-sm);

		span.label {
			overflow: hidden;
			text-overflow: ellipsis;
		}
	}
}
</style>
