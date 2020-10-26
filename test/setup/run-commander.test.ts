import { run } from "../../src";

test("run commander", () => {
  if (process.env.run_manually_xyz) {
    run(process, ".");
  }
});
