import { ChangePassword } from "@/components/pages/security/ChangePassword";
import { BackupCodes } from "@/components/pages/security/BackupCodes";
import { Sessions } from "@/components/pages/security/Sessions";

export default function Security() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 text-white">
      <div>
        <h1 className="text-3xl font-semibold">Security</h1>
        <p className="text-muted-foreground mt-1 text-xs">
          Password, backup codes and signed-in devices
        </p>
      </div>
      <ChangePassword />
      <BackupCodes />
      <Sessions />
    </div>
  );
}
