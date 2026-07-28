import { dashboardHandlers } from './dashboard';
import { recordsHandlers } from './records';
import { locksHandlers } from './locks';
import { executionLogsHandlers } from './execution-logs';
import { monitoringHandlers } from './monitoring';

export const handlers = [
  ...dashboardHandlers,
  ...recordsHandlers,
  ...locksHandlers,
  ...executionLogsHandlers,
  ...monitoringHandlers,
];
