import { joinLines } from "../test-util/test-util";
import { runSampleScript } from "./sample-scripts-util";

test("Android to iOS clean", async () => {
  const output = await runSampleScript(`./android_to_ios.sh`);
  expect(output).toBe(
    joinLines([
      "Target is up-to-date: 'android/app/src/main/res/values-de/strings.xml'",
      "Target is up-to-date: 'android/app/src/main/res/values-es/strings.xml'",
      "Target is up-to-date: 'ios/Localizable/Base.lproj/Localizable.strings'",
      "Target is up-to-date: 'ios/Localizable/de.lproj/Localizable.strings'",
      "Target is up-to-date: 'ios/Localizable/es.lproj/Localizable.strings'",
    ])
  );
});
