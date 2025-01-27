<template>
	<v-card
		class="mx-auto mb-4 lesson-card"
		:class="getStyleClasses()"
		max-width="100%"
		:aria-label="ariaLabel"
		tabindex="0"
		:outlined="isHidden"
		hover
		data-testid="content-card-lesson"
		@click="handleClick"
		@keydown.enter.self="handleClick"
		@keydown.up.prevent="onKeyPress"
		@keydown.down.prevent="onKeyPress"
		@keydown.space.prevent="onKeyPress"
		@keydown.tab="$emit('tab-pressed')"
	>
		<v-card-text class="pb-0" data-testid="content-card-lesson-content">
			<div class="top-row-container mb-0">
				<div class="title-section" tabindex="0">
					<v-icon size="14">{{ icons.mdiFormatListChecks }}</v-icon>
					{{ $t("common.words.topic") }}
				</div>

				<div class="dot-menu-section">
					<more-item-menu
						:menu-items="moreActionsMenuItems[role]"
						:show="true"
						data-testid="content-card-lesson-menu"
					/>
				</div>
			</div>
			<div class="text-h6 text--primary mb-2 lesson-name" tabindex="0">
				{{ lesson.name }}
			</div>
		</v-card-text>
		<v-card-text
			v-if="showChip"
			class="ma-0 pb-0 pt-0 submitted-section"
			data-testid="content-card-lesson-info"
		>
			<div class="chip-items-group">
				<div class="grey lighten-2 chip-item px-1 mr-1 mb-0" tabindex="0">
					<div class="chip-value">
						{{ taskChipValue }}
					</div>
				</div>
			</div>
		</v-card-text>

		<v-card-actions class="pt-1" data-testid="content-card-lesson-actions">
			<v-btn
				v-for="(action, index) in cardActions[role]"
				:key="index"
				:class="`action-button action-button-${action.name
					.split(' ')
					.join('-')}`"
				text
				@click.stop="action.action"
			>
				{{ action.name }}</v-btn
			>
		</v-card-actions>
	</v-card>
</template>

<script>
import {
	mdiPencilOutline,
	mdiUndoVariant,
	mdiShareVariant,
	mdiTrashCanOutline,
	mdiContentCopy,
} from "@mdi/js";
import MoreItemMenu from "./MoreItemMenu";
import { ImportUserResponseRoleNamesEnum as Roles } from "@/serverApi/v3";
import { envConfigModule } from "@/store";
const lessonRequiredKeys = ["createdAt", "id", "name"];

export default {
	components: { MoreItemMenu },
	props: {
		lesson: {
			type: Object,
			required: true,
			validator: (lesson) => lessonRequiredKeys.every((key) => key in lesson),
		},
		room: {
			type: Object,
			required: true,
		},
		role: { type: String, required: true },
		ariaLabel: {
			type: String,
			default: "",
		},
		keyDrag: { type: Boolean, required: true },
		dragInProgress: { type: Boolean, required: true },
	},
	data() {
		return {
			icons: {
				mdiPencilOutline,
				mdiUndoVariant,
				mdiShareVariant,
				mdiTrashCanOutline,
				mdiContentCopy,
			},
			defaultTitleColor: "--v-secondary-base",
		};
	},
	computed: {
		titleColor() {
			return this.room.displayColor || this.defaultTitleColor;
		},
		isHidden() {
			return this.lesson.hidden;
		},
		cardActions() {
			const roleBasedActions = {
				[Roles.Teacher]: [],
				[Roles.Student]: [],
			};

			if (this.role === Roles.Teacher) {
				if (this.isHidden) {
					roleBasedActions[Roles.Teacher].push({
						icon: "lessonSend",
						action: () => this.postLesson(),
						name: this.$t("common.action.publish"),
					});
				}
			}

			if (this.role === Roles.Student) {
				// if action is needed for the students add actions like above
			}
			return roleBasedActions;
		},
		moreActionsMenuItems() {
			const roleBasedMoreActions = {
				[Roles.Teacher]: [],
				[Roles.Student]: [],
			};

			if (this.role === Roles.Teacher) {
				roleBasedMoreActions[Roles.Teacher].push({
					icon: this.icons.mdiPencilOutline,
					action: () =>
						this.redirectAction(
							`/courses/${this.room.roomId}/topics/${this.lesson.id}/edit?returnUrl=rooms/${this.room.roomId}`
						),
					name: this.$t("pages.room.taskCard.label.edit"),
					dataTestId: "content-card-lesson-menu-edit",
				});

				if (envConfigModule.getEnv.FEATURE_COPY_SERVICE_ENABLED) {
					roleBasedMoreActions[Roles.Teacher].push({
						icon: this.icons.mdiContentCopy,
						action: () => this.copyCard(),
						name: this.$t("common.actions.copy"),
						dataTestId: "content-card-lesson-menu-copy",
					});
				}

				if (!this.isHidden) {
					roleBasedMoreActions[Roles.Teacher].push({
						icon: this.icons.mdiUndoVariant,
						action: () => this.revertPublishedCard(),
						name: this.$t("pages.room.cards.label.revert"),
						dataTestId: "content-card-lesson-menu-revert",
					});
				}

				if (envConfigModule.getEnv.FEATURE_LESSON_SHARE) {
					roleBasedMoreActions[Roles.Teacher].push({
						icon: this.icons.mdiShareVariant,
						action: () => this.$emit("open-modal", this.lesson.id),
						name: this.$t("pages.room.lessonCard.label.share"),
						dataTestId: "content-card-lesson-menu-share",
					});
				}

				roleBasedMoreActions[Roles.Teacher].push({
					icon: this.icons.mdiTrashCanOutline,
					action: () => this.$emit("delete-lesson"),
					name: this.$t("common.actions.remove"),
					dataTestId: "content-card-lesson-menu-remove",
				});
			}

			if (this.role === Roles.Student) {
				// if more action is needed for the students add actions like above
			}

			return roleBasedMoreActions;
		},
		showChip() {
			return (
				(this.lesson.numberOfPublishedTasks !== 0 &&
					this.lesson.numberOfPublishedTasks !== undefined) ||
				(this.lesson.numberOfPlannedTasks !== 0 &&
					this.lesson.numberOfPlannedTasks !== undefined) ||
				(this.lesson.numberOfDraftTasks !== 0 &&
					this.lesson.numberOfDraftTasks !== undefined)
			);
		},
		taskChipValue() {
			const chipValueArray = [];

			if (this.lesson.numberOfPublishedTasks) {
				chipValueArray.push(
					`${this.lesson.numberOfPublishedTasks} ${
						this.isHidden
							? this.$t("common.words.ready")
							: this.$t("common.words.published")
					}`
				);
			}

			if (this.lesson.numberOfPlannedTasks) {
				chipValueArray.push(
					`${this.lesson.numberOfPlannedTasks} ${this.$t(
						"common.words.planned"
					)}`
				);
			}

			if (this.lesson.numberOfDraftTasks) {
				chipValueArray.push(
					`${this.lesson.numberOfDraftTasks} ${
						this.lesson.numberOfDraftTasks === 1
							? this.$t("common.words.draft")
							: this.$t("common.words.drafts")
					}`
				);
			}

			let chipStr = chipValueArray.length
				? `${this.$t("common.words.tasks")}: `
				: "";

			chipStr += chipValueArray.join(" / ");

			if (this.isHidden && this.lesson.numberOfDraftTasks === 0) {
				chipStr += ` (${this.$t("pages.room.lessonCard.label.notVisible")})`;
			}

			return chipStr;
		},
	},
	methods: {
		handleClick() {
			if (!this.dragInProgress) {
				window.location = `/courses/${this.room.roomId}/topics/${this.lesson.id}`;
			}
		},
		redirectAction(value) {
			window.location = value;
		},
		postLesson() {
			this.$emit("post-lesson");
		},
		copyCard() {
			this.$emit("copy-lesson");
		},
		revertPublishedCard() {
			this.$emit("revert-lesson");
		},
		onKeyPress(e) {
			switch (e.keyCode) {
				case 32:
					this.$emit("on-drag");
					break;
				case 38:
					if (this.keyDrag)
						this.$emit("move-element", {
							id: this.lesson.id,
							moveIndex: -1,
						});
					break;
				case 40:
					if (this.keyDrag)
						this.$emit("move-element", {
							id: this.lesson.id,
							moveIndex: 1,
						});
					break;

				default:
					break;
			}
		},
		getStyleClasses() {
			return this.isHidden ? "hidden-lesson" : "";
		},
	},
};
</script>

<style lang="scss" scoped>
.top-row-container {
	display: grid;
	grid-template-columns: 95% 5%;
	align-items: center;

	.title-section {
		line-height: var(--line-height-md);
		text-align: left;
	}

	.dot-menu-section {
		align-self: start;
		text-align: right;
	}
}

.chip-items-group {
	vertical-align: middle;

	.chip-item {
		display: inline-block;
		width: fit-content;
		text-align: center;
		border-radius: var(--radius-sm);

		.chip-value {
			font-size: var(--text-xs);
			/* stylelint-disable-next-line sh-waqar/declaration-use-variable */
			color: rgba(0, 0, 0, 0.87);
		}
	}
}

.action-button {
	color: var(--v-primary-base);
}

.v-card__text {
	padding-bottom: var(--space-xs-4);
}

.hidden-lesson {
	.lesson-name {
		opacity: 0.5;
	}

	.submitted-section,
	.title-section {
		opacity: 0.65;
	}
}
</style>
