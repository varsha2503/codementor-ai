import { jest } from "@jest/globals";

jest.mock("../config/prisma.js");
jest.mock("../queue/redis.js");
jest.mock("../modules/execution/enqueue.js");
