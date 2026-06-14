import type { ExecutionGateway } from "./executionGateway";

export type ExecutionSide = "buy" | "sell";
export type ExecutionOrderType = "limit" | "market";
export type ExecutionTimeInForce = "gtc" | "ioc";

export interface ExecutionOrderRequest {
  readonly id: string;
  readonly side: ExecutionSide;
  readonly type: ExecutionOrderType;
  readonly quantity: number;
  readonly price?: number;
  readonly timeInForce?: ExecutionTimeInForce;
  readonly tag?: string;
}

export interface ExecutionTradeReport {
  readonly type: "trade";
  readonly takerOrderId: string;
  readonly makerOrderId: string;
  readonly price: number;
  readonly quantity: number;
  readonly takerSide: ExecutionSide;
}

export interface ExecutionOrderReport {
  readonly type: "accepted" | "rested" | "filled" | "partially_filled" | "canceled" | "expired" | "rejected";
  readonly orderId: string;
  readonly reason?: string;
  readonly remainingQuantity?: number;
}

export type ExecutionReport = ExecutionOrderReport | ExecutionTradeReport;

export interface BookDepthLevel {
  readonly price: number;
  readonly quantity: number;
  readonly orderCount: number;
}

export interface BookDepthSnapshot {
  readonly bids: readonly BookDepthLevel[];
  readonly asks: readonly BookDepthLevel[];
}

interface RestingOrder {
  readonly id: string;
  readonly side: ExecutionSide;
  readonly price: number;
  readonly sequence: number;
  readonly tag?: string;
  quantity: number;
}

export class LocalMatchingEngine implements ExecutionGateway {
  private readonly bids: RestingOrder[] = [];
  private readonly asks: RestingOrder[] = [];
  private sequence = 0;

  seedBook(orders: readonly ExecutionOrderRequest[]): readonly ExecutionReport[] {
    this.clear();
    return orders.flatMap((order) => this.submit({ ...order, type: "limit", timeInForce: "gtc" }));
  }

  clear(): void {
    this.bids.length = 0;
    this.asks.length = 0;
    this.sequence = 0;
  }

  submit(request: ExecutionOrderRequest): readonly ExecutionReport[] {
    const validationError = validateOrderRequest(request);

    if (validationError) {
      return [{ type: "rejected", orderId: request.id, reason: validationError }];
    }

    const reports: ExecutionReport[] = [{ type: "accepted", orderId: request.id }];
    const incoming: RestingOrder = {
      id: request.id,
      side: request.side,
      price: request.type === "market" ? getMarketSentinelPrice(request.side) : request.price ?? 0,
      quantity: roundQuantity(request.quantity),
      sequence: this.sequence,
      tag: request.tag
    };
    this.sequence += 1;

    this.matchIncomingOrder(incoming, request.type, reports);

    if (incoming.quantity <= 0) {
      reports.push({ type: "filled", orderId: request.id, remainingQuantity: 0 });
      return reports;
    }

    if (request.type === "market" || request.timeInForce === "ioc") {
      reports.push({ type: "expired", orderId: request.id, remainingQuantity: roundQuantity(incoming.quantity) });
      return reports;
    }

    this.addRestingOrder(incoming);
    reports.push({ type: "rested", orderId: request.id, remainingQuantity: roundQuantity(incoming.quantity) });
    return reports;
  }

  cancel(orderId: string): readonly ExecutionReport[] {
    const removedBid = removeOrderById(this.bids, orderId);

    if (removedBid) {
      return [{ type: "canceled", orderId, remainingQuantity: roundQuantity(removedBid.quantity) }];
    }

    const removedAsk = removeOrderById(this.asks, orderId);

    if (removedAsk) {
      return [{ type: "canceled", orderId, remainingQuantity: roundQuantity(removedAsk.quantity) }];
    }

    return [{ type: "rejected", orderId, reason: "unknown_order" }];
  }

  getDepth(levels = 3): BookDepthSnapshot {
    return {
      bids: aggregateDepth(this.bids, "buy", levels),
      asks: aggregateDepth(this.asks, "sell", levels)
    };
  }

  private matchIncomingOrder(
    incoming: RestingOrder,
    orderType: ExecutionOrderType,
    reports: ExecutionReport[]
  ): void {
    const oppositeBook = incoming.side === "buy" ? this.asks : this.bids;

    while (incoming.quantity > 0 && oppositeBook.length > 0) {
      const maker = oppositeBook[0];

      if (!maker || !canCross(incoming, maker, orderType)) {
        return;
      }

      const tradeQuantity = Math.min(incoming.quantity, maker.quantity);
      incoming.quantity = roundQuantity(incoming.quantity - tradeQuantity);
      maker.quantity = roundQuantity(maker.quantity - tradeQuantity);
      reports.push({
        type: "trade",
        takerOrderId: incoming.id,
        makerOrderId: maker.id,
        price: maker.price,
        quantity: roundQuantity(tradeQuantity),
        takerSide: incoming.side
      });

      if (maker.quantity <= 0) {
        oppositeBook.shift();
      }
    }

    if (reports.some((report) => report.type === "trade") && incoming.quantity > 0) {
      reports.push({
        type: "partially_filled",
        orderId: incoming.id,
        remainingQuantity: roundQuantity(incoming.quantity)
      });
    }
  }

  private addRestingOrder(order: RestingOrder): void {
    const book = order.side === "buy" ? this.bids : this.asks;
    book.push({ ...order, price: roundPrice(order.price), quantity: roundQuantity(order.quantity) });
    book.sort(compareRestingOrders);
  }
}

export function createLocalMatchingEngine(): LocalMatchingEngine {
  return new LocalMatchingEngine();
}

function validateOrderRequest(request: ExecutionOrderRequest): string | null {
  if (!request.id.trim()) {
    return "missing_order_id";
  }

  if (request.quantity <= 0 || !Number.isFinite(request.quantity)) {
    return "invalid_quantity";
  }

  if (request.type === "limit" && (!request.price || request.price <= 0 || !Number.isFinite(request.price))) {
    return "invalid_limit_price";
  }

  return null;
}

function getMarketSentinelPrice(side: ExecutionSide): number {
  return side === "buy" ? Number.MAX_SAFE_INTEGER : 0;
}

function canCross(incoming: RestingOrder, maker: RestingOrder, orderType: ExecutionOrderType): boolean {
  if (orderType === "market") {
    return true;
  }

  if (incoming.side === "buy") {
    return incoming.price >= maker.price;
  }

  return incoming.price <= maker.price;
}

function compareRestingOrders(left: RestingOrder, right: RestingOrder): number {
  if (left.side === "buy") {
    return right.price - left.price || left.sequence - right.sequence;
  }

  return left.price - right.price || left.sequence - right.sequence;
}

function aggregateDepth(
  book: readonly RestingOrder[],
  side: ExecutionSide,
  levels: number
): readonly BookDepthLevel[] {
  const depthByPrice = new Map<number, { quantity: number; orderCount: number }>();

  for (const order of book) {
    const price = roundPrice(order.price);
    const current = depthByPrice.get(price) ?? { quantity: 0, orderCount: 0 };
    depthByPrice.set(price, {
      quantity: current.quantity + order.quantity,
      orderCount: current.orderCount + 1
    });
  }

  return [...depthByPrice.entries()]
    .map(([price, depth]) => ({
      price,
      quantity: roundQuantity(depth.quantity),
      orderCount: depth.orderCount
    }))
    .sort((left, right) => (side === "buy" ? right.price - left.price : left.price - right.price))
    .slice(0, Math.max(0, levels));
}

function removeOrderById(book: RestingOrder[], orderId: string): RestingOrder | null {
  const index = book.findIndex((order) => order.id === orderId);

  if (index < 0) {
    return null;
  }

  return book.splice(index, 1)[0] ?? null;
}

function roundPrice(value: number): number {
  return Math.round(value * 10000) / 10000;
}

function roundQuantity(value: number): number {
  return Math.round(value * 10000) / 10000;
}
