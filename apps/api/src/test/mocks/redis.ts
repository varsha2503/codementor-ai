import { jest } from "@jest/globals";

export const redisMock = {
  ping: jest.fn(),
  incr: jest.fn(),
  expire: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
};

export const executionQueueMock = {
  add: jest.fn(),
};

export const rateLimitMock = jest.fn();

export function resetRedisMock() {
  redisMock.ping.mockReset();
  redisMock.incr.mockReset();
  redisMock.expire.mockReset();
  redisMock.set.mockReset();
  redisMock.del.mockReset();
  executionQueueMock.add.mockReset();
  rateLimitMock.mockReset();

  redisMock.ping.mockResolvedValue("PONG");
  redisMock.incr.mockResolvedValue(1);
  redisMock.expire.mockResolvedValue(1);
  redisMock.set.mockResolvedValue("OK");
  redisMock.del.mockResolvedValue(1);
  executionQueueMock.add.mockResolvedValue({ id: "job-1" });
  rateLimitMock.mockResolvedValue(undefined);
}

resetRedisMock();
