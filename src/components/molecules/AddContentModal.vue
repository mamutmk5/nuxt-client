<template>
	<div>
		<base-modal
			class="modal"
			:active="showCopyModal"
			@onBackdropClick="closeModal"
		>
			<template #header>{{
				$t("components.molecules.AddContentModal")
			}}</template>
			<template #body>
				<div class="content-modal__body">
					<v-select
						v-model="selectedCourse"
						return-object
						item-value="_id"
						item-text="name"
						:items="coursesOptions"
						:label="$t('pages.content.label.chooseACourse')"
						data-testid="topicSelector"
					/>
					<transition name="fade">
						<v-select
							v-show="!!(selectedCourse || {})._id"
							v-model="selectedLesson"
							return-object
							item-value="_id"
							item-text="name"
							:items="lessonsOptions"
							:label="$t('pages.content.label.chooseALessonTopic')"
							:no-data-text="$t('pages.content.placeholder.noLessonTopic')"
							data-testid="courseSelector"
						/>
					</transition>
				</div>
			</template>
			<template #footer>
				<modal-footer>
					<template #right>
						<v-btn text color="secondary" @click="closeModal">
							{{ $t("common.actions.cancel") }}
						</v-btn>
						<v-btn
							color="primary"
							depressed
							:disabled="!isSendEnabled"
							data-testid="modal_submit_btn"
							@click="addToLesson"
						>
							{{ $t("common.actions.add") }}
						</v-btn>
					</template>
				</modal-footer>
			</template>
		</base-modal>
	</div>
</template>

<script>
import { mapGetters } from "vuex";
import { contentModule } from "@/store";
import ModalFooter from "@components/molecules/ModalFooter";

export default {
	components: {
		ModalFooter,
	},
	props: {
		title: { type: String, default: "" },
		url: { type: String, default: "" },
		client: { type: String, default: "Schul-Cloud" },
		merlinReference: { type: String, default: "" },
		items: { type: Array, default: () => [] },

		showCopyModal: {
			type: Boolean,
			required: true,
		},
		contentid: {
			type: String,
			default: "",
		},
	},
	data() {
		return {
			selectedCourse: {},
			selectedLesson: {},
		};
	},
	computed: {
		...mapGetters("courses", {
			coursesOptions: "getCoursesOptions",
		}),
		lessons() {
			return contentModule.getLessonsGetter;
		},
		isSendEnabled() {
			return (this.selectedLesson || {})._id !== undefined;
		},
		lessonsOptions() {
			return (
				this.lessons &&
				this.lessons.data &&
				this.lessons.data.map((lesson) => {
					return {
						_id: lesson._id,
						name: lesson.name,
					};
				})
			);
		},
	},
	watch: {
		selectedCourse(to, from) {
			this.selectedLesson = {};
			if (to) {
				this.findLessons(to);
			} else if (!to && !!from) {
				contentModule.clearLessons();
			}
		},
	},
	methods: {
		closeModal() {
			this.$emit("update:show-copy-modal", false);
			this.clearState();
		},
		addToLesson() {
			this.$emit("close");
			const payload = {
				lessonId: this.selectedLesson._id,
				event: this.$eventBus,
				material: [],
			};
			if (this.items.length > 0) {
				this.items.forEach((element) => {
					payload.material.push({
						title: element.title,
						client: element.client,
						url: element.url,
						merlinReference: element.merlinReference,
					});
				});
			} else {
				payload.material = {
					title: this.title,
					client: this.client,
					url: this.url,
					merlinReference: this.merlinReference,
				};
			}
			contentModule.addToLesson(payload);
			this.closeModal();
		},
		findLessons(course) {
			contentModule.getLessons(course._id);
		},
		clearState() {
			this.selectedCourse = {};
			this.selectedLesson = {};
		},
	},
};
</script>

<style lang="scss" scoped>
.modal {
	width: 100%;
}

.content-modal {
	&__body {
		min-height: 300px;
		color: var(--v-black-base) !important;

		&--select {
			margin-top: var(--space-xl);
		}
	}
}

.fade-enter-active,
.fade-leave-active {
	transition: opacity var(--duration-transition-slow);
}

.fade-enter,
.fade-leave-to {
	opacity: 0;
}

::v-deep .v-input__icon .v-icon {
	font-size: var(--text-base-size);
}
</style>
