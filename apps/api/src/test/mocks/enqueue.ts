import { jest } from "@jest/globals";

export const enqueueExecutionMock = jest.fn();

export function resetEnqueueMock() {
  enqueueExecutionMock.mockReset();
  enqueueExecutionMock.mockResolvedValue(undefined);
}

resetEnqueueMock();
