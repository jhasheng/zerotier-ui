import { api, type RequestOptions } from "./client";
import { E } from "./endpoints";
import type { ControllerStatus, NodeStatus } from "./types";

export function getStatus(opts?: RequestOptions): Promise<NodeStatus> {
  return api.get<NodeStatus>(E.status(), opts);
}

export function getController(opts?: RequestOptions): Promise<ControllerStatus> {
  return api.get<ControllerStatus>(E.controller(), opts);
}
