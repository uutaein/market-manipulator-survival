import type {
  BookDepthSnapshot,
  ExecutionOrderRequest,
  ExecutionReport
} from "./localMatchingEngine";

export interface ExecutionGateway {
  seedBook(orders: readonly ExecutionOrderRequest[]): readonly ExecutionReport[];
  submit(order: ExecutionOrderRequest): readonly ExecutionReport[];
  cancel(orderId: string): readonly ExecutionReport[];
  getDepth(levels: number): BookDepthSnapshot;
}

export type {
  BookDepthLevel,
  BookDepthSnapshot,
  ExecutionOrderRequest,
  ExecutionOrderReport,
  ExecutionOrderType,
  ExecutionReport,
  ExecutionSide,
  ExecutionTimeInForce,
  ExecutionTradeReport
} from "./localMatchingEngine";
