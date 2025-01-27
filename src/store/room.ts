import { authModule } from "@/store";
import { nanoid } from "nanoid";
import { Action, Module, Mutation, VuexModule } from "vuex-module-decorators";
import {
	BoardResponse,
	CoursesApiFactory,
	LessonApiFactory,
	LessonApiInterface,
	PatchOrderParams,
	PatchVisibilityParams,
	RoomsApiFactory,
	RoomsApiInterface,
} from "../serverApi/v3/api";
import { $axios } from "../utils/api";
import { BusinessError } from "./types/commons";
import { SharedLessonObject } from "./types/room";

@Module({
	name: "room",
	namespaced: true,
	stateFactory: true,
})
export default class RoomModule extends VuexModule {
	roomData: BoardResponse = {
		roomId: "",
		title: "",
		displayColor: "",
		elements: [],
	};
	scopePermissions: String[] = [];
	loading: boolean = false;
	error: null | {} = null;
	businessError: BusinessError = {
		statusCode: "",
		message: "",
		error: {},
	};
	sharedLessonData: SharedLessonObject = {
		code: "",
		lessonName: "",
		status: "",
		message: "",
	};
	private courseShareToken: string = "";

	private _roomsApi?: RoomsApiInterface;
	private get roomsApi(): RoomsApiInterface {
		if (!this._roomsApi) {
			this._roomsApi = RoomsApiFactory(undefined, "/v3", $axios);
		}
		return this._roomsApi;
	}

	private _lessonApi?: LessonApiInterface;
	private get lessonApi(): LessonApiInterface {
		if (!this._lessonApi) {
			this._lessonApi = LessonApiFactory(undefined, "/v3", $axios);
		}
		return this._lessonApi;
	}

	@Action
	async fetchContent(id: string): Promise<void> {
		this.setLoading(true);
		try {
			const { data } = await this.roomsApi.roomsControllerGetRoomBoard(id);
			this.setRoomData(data);
			this.setLoading(false);
		} catch (error: any) {
			this.setError(error);
			this.setLoading(false);
		}
	}

	@Action
	async publishCard(payload: {
		elementId: string;
		visibility: boolean;
	}): Promise<void> {
		this.setLoading(true);
		const visibilityParam: PatchVisibilityParams = {
			visibility: payload.visibility,
		};
		try {
			await this.roomsApi.roomsControllerPatchElementVisibility(
				this.roomData.roomId,
				payload.elementId,
				visibilityParam
			);
			await this.fetchContent(this.roomData.roomId);

			this.setLoading(false);
		} catch (error: any) {
			this.setError(error);
			this.setLoading(false);
		}
	}

	@Action
	async sortElements(payload: PatchOrderParams): Promise<void> {
		this.setLoading(true);
		try {
			await this.roomsApi.roomsControllerPatchOrderingOfElements(
				this.roomData.roomId,
				payload
			);
			await this.fetchContent(this.roomData.roomId);
			this.setLoading(false);
		} catch (error: any) {
			this.setBusinessError({
				statusCode: error?.response?.status,
				message: error?.response?.statusText,
				...error,
			});
			this.setLoading(false);
		}
	}

	@Action
	async fetchSharedLesson(lessonId: string): Promise<void> {
		try {
			const lessonShareResult = await $axios.$get(`/v1/lessons/${lessonId}`);
			if (!lessonShareResult.shareToken) {
				lessonShareResult.shareToken = nanoid(9);
				await $axios.$patch(
					`/v1/lessons/${lessonShareResult._id}`,
					lessonShareResult
				);
			}
			this.setSharedLessonData({
				code: lessonShareResult.shareToken,
				lessonName: lessonShareResult.name,
				status: "",
				message: "",
			});
		} catch (error: any) {
			this.setBusinessError({
				statusCode: error?.response?.status,
				message: error?.response?.statusText,
				...error,
			});
		}
	}

	@Action
	async confirmImportLesson(shareToken: string): Promise<void> {
		try {
			this.resetBusinessError();
			const lesson = await $axios.$get("/v1/lessons", {
				params: { shareToken },
			});

			if (!lesson.data.length) {
				this.setBusinessError({
					statusCode: "400",
					message: "not-found",
				});
				return;
			}

			const copiedLesson = await $axios.$post("/v1/lessons/copy", {
				lessonId: lesson.data[0]._id,
				newCourseId: this.roomData.roomId,
				shareToken,
			});

			if (!copiedLesson) {
				this.setBusinessError({
					statusCode: "400",
					message: "not-created",
				});
				return;
			}
			await this.fetchContent(this.roomData.roomId);
		} catch (error: any) {
			this.setBusinessError({
				statusCode: error?.response?.status,
				message: error?.response?.statusText,
				...error,
			});
		}
	}

	@Action
	async deleteLesson(lessonId: string): Promise<void> {
		this.resetBusinessError();
		try {
			await this.lessonApi.lessonControllerDelete(lessonId);

			await this.fetchContent(this.roomData.roomId);
		} catch (error: any) {
			this.setBusinessError({
				statusCode: error?.response?.status,
				message: error?.response?.statusText,
				...error,
			});
		}
	}

	@Action
	async downloadImsccCourse(): Promise<void> {
		this.resetBusinessError();
		try {
			const response = await CoursesApiFactory(
				undefined,
				'v3',
				$axios
			).courseControllerExportCourse(this.roomData.roomId, { responseType: "blob" });
			const link = document.createElement("a");
			link.href = URL.createObjectURL(new Blob([response.data as unknown as Blob]));
			link.download = `${this.roomData.title}-${new Date().toISOString()}.imscc`;
			link.click();
			URL.revokeObjectURL(link.href);
		} catch (error: any) {
			this.setBusinessError({
				statusCode: error?.response?.status,
				message: error?.response?.statusText,
				...error,
			});
		}
	}

	@Action
	async createCourseShareToken(courseId: string): Promise<void> {
		this.resetBusinessError();
		try {
			const result = await $axios.$get(`/v1/courses-share/${courseId}`);
			if (!result.shareToken) {
				this.setBusinessError({
					statusCode: "400",
					message: "not-generated",
				});
			}
			this.setCourseShareToken(result.shareToken);
		} catch (error: any) {
			this.setBusinessError({
				statusCode: error?.response?.status,
				message: error?.response?.statusText,
				...error,
			});
		}
	}

	@Action
	async finishTask(payload: object | any): Promise<void> {
		this.resetBusinessError();
		const userId = authModule.getUser?.id;
		try {
			const homework = await $axios.$get(`/v1/homework/${payload.itemId}`);
			if (!homework.archived) {
				this.setBusinessError({
					statusCode: "400",
					message: "archived-not-found",
				});
				return;
			}
			let archived = [];
			if (payload.action === "finish") {
				archived = homework?.archived;
				archived.push(userId);
			}
			if (payload.action === "restore") {
				archived = homework?.archived.filter((item: string) => item !== userId);
			}

			const patchedData = await $axios.$patch(
				`/v1/homework/${payload.itemId}`,
				{ archived }
			);
			if (!patchedData._id) {
				this.setBusinessError({
					statusCode: "400",
					message: "archived-not-patched",
				});
				return;
			}

			await this.fetchContent(this.roomData.roomId);
		} catch (error: any) {
			this.setBusinessError({
				statusCode: error?.response?.status,
				message: error?.response?.statusText,
				...error,
			});
		}
	}

	@Action
	async fetchScopePermission(payload: {
		courseId: string;
		userId: string;
	}): Promise<void> {
		const ret_val = await $axios.$get(
			`/v1/courses/${payload.courseId}/userPermissions?userId=${payload.userId}`
		);
		this.setPermissionData(ret_val[payload.userId]);
	}

	@Mutation
	setRoomData(payload: BoardResponse): void {
		this.roomData = payload;
	}

	@Mutation
	setPermissionData(payload: String[]): void {
		this.scopePermissions = payload;
	}

	@Mutation
	setLoading(loading: boolean): void {
		this.loading = loading;
	}

	@Mutation
	setError(error: {}): void {
		this.error = error;
	}

	@Mutation
	setBusinessError(businessError: BusinessError): void {
		this.businessError = businessError;
	}

	@Mutation
	resetBusinessError(): void {
		this.businessError = {
			statusCode: "",
			message: "",
			error: {},
		};
	}

	@Mutation
	setSharedLessonData(payload: SharedLessonObject): void {
		this.sharedLessonData = payload;
	}

	@Mutation
	setCourseShareToken(payload: string): void {
		this.courseShareToken = payload;
	}

	get getLoading(): boolean {
		return this.loading;
	}

	get getError(): {} | null {
		return this.error;
	}

	get getRoomData(): BoardResponse {
		return this.roomData;
	}

	get getPermissionData(): String[] {
		return this.scopePermissions;
	}

	get getBusinessError() {
		return this.businessError;
	}

	get getSharedLessonData(): SharedLessonObject {
		return this.sharedLessonData;
	}

	get getCourseShareToken(): string {
		return this.courseShareToken;
	}

	get roomIsEmpty(): boolean {
		return this.finishedLoading && this.roomData.elements.length === 0;
	}

	get getRoomId(): string {
		return this.roomData.roomId;
	}

	private get finishedLoading(): boolean {
		return this.getLoading === false;
	}
}
