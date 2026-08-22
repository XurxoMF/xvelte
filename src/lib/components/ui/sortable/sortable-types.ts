/** Stable identifier accepted by Sortable Root and Item. */
export type SortableItemId = string | number;

/** Authoritative ordered identifier list bound to Sortable Root. */
export type SortableOrder = SortableItemId[];

/** Ordered public snapshot for one registered Sortable item. */
export type SortableItemState = {
	/** Stable application identifier supplied to Item. */
	id: SortableItemId;
	/** Current zero-based position in the provisional or committed order. */
	index: number;
};

/**
 * Returns application items in a Sortable order without mutating either input.
 *
 * IDs present in `order` lead the result, unknown saved IDs are ignored, and items missing from `order` follow in their input order.
 *
 * @param items - Application records to arrange.
 * @param order - Preferred identifier sequence, normally bound to Sortable Root.
 * @param getId - Resolves the stable Sortable identifier for one record.
 * @returns A newly allocated ordered array.
 */
export function orderItems<Item>(items: readonly Item[], order: readonly SortableItemId[], getId: (item: Item) => SortableItemId) {
	const byId = new Map<SortableItemId, Item>();
	for (const item of items) byId.set(getId(item), item);

	const result: Item[] = [];
	for (const id of order) {
		const item = byId.get(id);
		if (!item) continue;
		result.push(item);
		byId.delete(id);
	}
	result.push(...byId.values());
	return result;
}
