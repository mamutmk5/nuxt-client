import {
	Module,
	VuexModule,
	Mutation,
	Action,
	getModule,
} from "vuex-module-decorators";
import { rootStore } from "./index";
import { $axios } from "../utils/api";

type Pos = {
	xPosition: number;
	yPosition: number;
};

type RoomsData = {
	id: string;
	title: string;
	shortTitle: string;
	displayColor: string;
	xPosition: number;
	yPosition: number;
};

type DroppedObject = {
	from: object;
	to: object;
	item: object;
};

@Module({
	name: "rooms",
	namespaced: true,
	dynamic: true,
	store: rootStore,
	stateFactory: true,
})
export class Rooms extends VuexModule {
	roomsData: Array<RoomsData> = [];
	gridElementsId: string = "";

	loading: boolean = false;
	error: null | {} = null;

	@Mutation
	setRoomData(data: Array<RoomsData>): void {
		this.roomsData = data;
	}

	@Mutation
	setRoomDataId(id: string): void {
		this.gridElementsId = id;
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
	setPosition(droppedComponent: DroppedObject | any): void {
		const { to } = droppedComponent;
		const itemToBeChanged = this.roomsData.find(
			(item) => item.id == droppedComponent.item.id
		);

		if (itemToBeChanged) {
			itemToBeChanged.xPosition = to.x;
			itemToBeChanged.yPosition = to.y;
		}
	}

	get getRoomsData(): Array<RoomsData> {
		return this.roomsData;
	}

	get getLoading(): boolean {
		return this.loading;
	}

	get getError(): {} | null {
		return this.error;
	}

	get getRoomsId(): {} | null {
		return this.gridElementsId;
	}

	@Action
	async fetch(device: string): Promise<void> {
		// device parameter will be used to fetch data specified for device
		this.setLoading(true);
		try {
			const fetched = await $axios.$get("/v3/dashboard/");
			// const fetched = mockStoreData;

			this.setRoomDataId(fetched.id || "");
			this.setRoomData(fetched.gridElements || []);
			this.setLoading(false);
		} catch (error: any) {
			this.setError(error);
			this.setLoading(false);
		}
	}

	@Action
	async align(droppedComponent: DroppedObject | any = {}): Promise<void> {
		const { from, to } = droppedComponent;
		const reqObject = {
			from,
			to,
		};

		this.setLoading(true);
		try {
			const data = await $axios.$patch(
				`/v3/dashboard/${this.gridElementsId}/moveElement`,
				reqObject
			);
			this.setPosition(droppedComponent);
			this.setRoomData(data.gridElements);
			this.setLoading(false);
		} catch (error: any) {
			this.setError(error);
			this.setLoading(false);
		}
	}

	@Action
	async group(droppedComponent: DroppedObject | any = {}): Promise<void> {
		this.setLoading(true);
		try {
			// TODO: update data
			this.setLoading(false);
		} catch (error: any) {
			this.setError(error);
			this.setLoading(false);
		}
	}

	@Action
	async update(payload: RoomsData): Promise<void> {
		this.setLoading(true);
		try {
			// TODO: update data
		} catch (error: any) {
			this.setError(error);
			this.setLoading(false);
		}
	}

	@Action
	async delete(id: string): Promise<void> {
		this.setLoading(true);
		try {
			// TODO: delete call to to server
			const tempData = this.roomsData.filter((item) => item.id !== id);
			this.setRoomData(tempData);
			this.setLoading(false);
		} catch (error: any) {
			this.setError(error);
			this.setLoading(false);
		}
	}
}

export default getModule(Rooms);
