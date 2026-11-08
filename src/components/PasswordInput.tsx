import { useState } from "react";

import { Eye, EyeOff } from "lucide-react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";

type PasswordInputProps = Omit<
  React.ComponentProps<typeof InputGroupInput>,
  "type"
>;

export function PasswordInput(props: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <InputGroup className="rounded-md has-[[data-slot=input-group-control]:focus-visible]:border-lime-500 has-[[data-slot=input-group-control]:focus-visible]:ring-0 has-[[data-slot=input-group-control]:focus-visible]:ring-lime-500">
      <InputGroupInput {...props} type={visible ? "text" : "password"} />
      <InputGroupAddon align="inline-end">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="text-lime-600 hover:bg-transparent hover:text-lime-500"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
        >
          {visible ? <Eye /> : <EyeOff />}
        </Button>
      </InputGroupAddon>
    </InputGroup>
  );
}
