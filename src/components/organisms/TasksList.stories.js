import { storiesOf } from "@storybook/vue";
import TasksList from "@components/organisms/TasksList";
import { openTasks, tasksTeacher } from "@@/stories/mockData/Tasks";

storiesOf("0 Vuetify/Organisms/TasksList", module)
	.add("TasksList Student", () => ({
		components: {
			TasksList,
		},
		data: () => ({
			tasks: openTasks,
		}),

		template: `
		<v-app>
			<h1 class="h4">Task Overview for Students</h1>
			<tasks-list :tasks="tasks" type="student"/>
		</v-app>`,
	}))
	.add("TasksList Teacher", () => ({
		components: {
			TasksList,
		},
		data: () => ({
			tasks: tasksTeacher,
		}),

		template: `
		<v-app>
			<h1 class="h4">Task Overview for Teachers</h1>
			<tasks-list :tasks="tasks" type="teacher"/>
		</v-app>`,
	}))
	.add("TasksListLoading", () => ({
		components: {
			TasksList,
		},
		template: `<v-app>
						<v-skeleton-loader type="text" :max-width="'15%'" />
						<v-skeleton-loader
							v-for="task of 7"
							ref="skeleton"
							:key="task"
							:type="'list-item-avatar-two-line'"
						/>
					</v-app>`,
	}));