import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface AccessGroupInventoryItem {
  iag_id: number;
  accessgroupid: number;
  inventoryid: number;
  allocated_quantity: number;
  oprice: string;
  partner_sku_name: string | null;
  allocated_at: string;
  id: number;
  fullname: string;
  brand: string | null;
  model: string;
  varient: string | null;
  color: string | null;
  quantity: number;
  vquantity: number;
  price: string;
  gst: string;
  tally_name: string;
  guid: string;
  unit: string;
  isblocked: boolean;
  [key: string]: unknown;
}

export interface AccessGroupInventory {
  accessGroupId: number;
  count: number;
  data: AccessGroupInventoryItem[];
}

export interface AccessGroup {
  id: number;
  name: string;
  description?: string;
  join_url?: string | null;
  created_at?: string;
  updated_at?: string;
  /** Inventory allocated to this group — an object with the data array inside */
  inventory: AccessGroupInventory;
}

interface AccessGroupState {
  groups: AccessGroup[];
  loading: boolean;
  error: string | null;
  pendingInventory: AccessGroupInventory | null;
}

/** accessGroupId 0 means never fetched (placeholder). */
function emptyInventory(accessGroupId = 0): AccessGroupInventory {
  return { accessGroupId, count: 0, data: [] };
}

const initialState: AccessGroupState = {
  groups: [],
  loading: false,
  error: null,
  pendingInventory: null,
};

export const fetchAccessGroups = createAsyncThunk<
  AccessGroup[],
  void,
  { rejectValue: string }
>(
  "accessGroup/fetchAccessGroups",
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = (getState() as { auth: { token: string } }).auth.token;
      const res = await fetch("/api/admin/access-group", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch access groups");

      const data: AccessGroup[] = await res.json();
      return data;
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message);
    }
  }
);

export const fetchAccessGroupInventory = createAsyncThunk<
  AccessGroupInventory,
  number,
  { rejectValue: string }
>(
  "accessGroup/fetchAccessGroupInventory",
  async (accessGroupId, { rejectWithValue, getState }) => {
    try {
      const token = (getState() as { auth: { token: string } }).auth.token;
      const res = await fetch(
        `/api/admin/access-group/inventory?id=${accessGroupId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch access group inventory");

      const json = (await res.json()) as {
        accessGroupId: number;
        count: number;
        data: AccessGroupInventoryItem[];
      };
      return {
        accessGroupId: Number(json.accessGroupId),
        count: Number(json.count) || 0,
        data: Array.isArray(json.data) ? json.data : [],
      };
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message);
    }
  }
);

const accessGroupSlice = createSlice({
  name: "accessGroup",
  initialState,
  reducers: {
    setGroups: (state, action: PayloadAction<AccessGroup[]>) => {
      state.groups = action.payload.map((g) => ({
        ...g,
        id: Number(g.id),
        inventory: g.inventory ?? emptyInventory(),
      }));
      state.error = null;
    },
    addGroup: (state, action: PayloadAction<AccessGroup>) => {
      const payload = {
        ...action.payload,
        id: Number(action.payload.id),
        inventory: action.payload.inventory ?? emptyInventory(),
      };
      state.groups.push(payload);
    },
    updateGroup: (state, action: PayloadAction<AccessGroup>) => {
      const index = state.groups.findIndex(
        (group) => group.id === Number(action.payload.id)
      );
      if (index !== -1) {
        state.groups[index] = {
          ...action.payload,
          id: Number(action.payload.id),
        };
      }
    },
    removeGroup: (state, action: PayloadAction<number>) => {
      state.groups = state.groups.filter(
        (group) => group.id !== Number(action.payload)
      );
    },
    /** Add one item to a specific group's inventory.data */
    addInventoryItem: (
      state,
      action: PayloadAction<{
        accessGroupId: number;
        item: AccessGroupInventoryItem;
      }>
    ) => {
      const group = state.groups.find(
        (g) => Number(g.id) === Number(action.payload.accessGroupId)
      );
      if (!group) return;
      group.inventory.data.push(action.payload.item);
      group.inventory.count = group.inventory.data.length;
    },
    /** Delete item(s) from a group's inventory.data by iag_id or inventory id */
    removeInventoryItem: (
      state,
      action: PayloadAction<{ accessGroupId: number; id: number }>
    ) => {
      const group = state.groups.find(
        (g) => Number(g.id) === Number(action.payload.accessGroupId)
      );
      if (!group) return;
      group.inventory.data = group.inventory.data.filter(
        (item) =>
          item.iag_id !== action.payload.id && item.id !== action.payload.id
      );
      group.inventory.count = group.inventory.data.length;
    },
    /** Replace a specific group's inventory.data array */
    setInventoryData: (
      state,
      action: PayloadAction<{
        accessGroupId: number;
        data: AccessGroupInventoryItem[];
      }>
    ) => {
      const group = state.groups.find(
        (g) => Number(g.id) === Number(action.payload.accessGroupId)
      );
      if (!group) return;
      group.inventory.data = action.payload.data;
      group.inventory.count = action.payload.data.length;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccessGroups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAccessGroups.fulfilled, (state, action) => {
        state.loading = false;
        const incoming = Array.isArray(action.payload) ? action.payload : [];
        const oldById = new Map(
          state.groups.map((g) => [Number(g.id), g.inventory] as const)
        );
        state.groups = incoming.map((g) => {
          const id = Number(g.id);
          return {
            ...g,
            id,
            inventory:
              g.inventory?.data?.length
                ? g.inventory
                : oldById.get(id) ?? emptyInventory(),
          };
        });
        // Drain inventory that resolved before its group list arrived
        if (state.pendingInventory) {
          const group = state.groups.find(
            (g) => Number(g.id) === state.pendingInventory!.accessGroupId
          );
          if (group) {
            group.inventory = state.pendingInventory;
            state.pendingInventory = null;
          }
        }
      })
      .addCase(fetchAccessGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch access groups";
      })
      .addCase(fetchAccessGroupInventory.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchAccessGroupInventory.fulfilled, (state, action) => {
        const group = state.groups.find(
          (g) => Number(g.id) === Number(action.payload.accessGroupId)
        );
        if (group) {
          group.inventory = action.payload;
          state.pendingInventory = null;
        } else if (action.payload.data.length > 0) {
          state.pendingInventory = action.payload;
        }
      })
      .addCase(fetchAccessGroupInventory.rejected, (state, action) => {
        state.error =
          action.payload || "Failed to fetch access group inventory";
      });
  },
});

export const {
  setGroups,
  addGroup,
  updateGroup,
  removeGroup,
  addInventoryItem,
  removeInventoryItem,
  setInventoryData,
  setLoading,
  setError,
} = accessGroupSlice.actions;

export default accessGroupSlice.reducer;
