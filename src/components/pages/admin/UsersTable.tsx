import { rankItem } from "@tanstack/match-sorter-utils";
import {
  columnFilteringFeature,
  createColumnHelper,
  createFilteredRowModel,
  flexRender,
  metaHelper,
  tableFeatures,
  useTable,
  type Column,
  type FilterFn,
} from "@tanstack/react-table";
import { Search } from "lucide-react";

import { Role, UserStatus, type Project, type User } from "@/lib/objects";
import { formatTimestamp } from "@/lib/time";
import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfirmButton } from "@/components/ConfirmButton";
import { EditProjectsDialog } from "@/components/pages/admin/EditProjectsDialog";

const ADMIN_LOCKED = "Administrator accounts can't be changed here";
const ALL = "all";

const ROLE_OPTIONS = [
  { value: ALL, label: "All roles" },
  { value: String(Role.Admin), label: "Admin" },
  { value: String(Role.Tenant), label: "Tenant" },
];

const STATUS_OPTIONS = [
  { value: ALL, label: "All statuses" },
  { value: String(UserStatus.Active), label: "Active" },
  { value: String(UserStatus.Disabled), label: "Disabled" },
];

const COLUMN_CLASSES: Record<string, string> = {
  email: "pl-4",
  projects: "max-w-56 text-xs whitespace-normal",
  created: "text-muted-foreground text-xs",
  lastLogin: "text-muted-foreground text-xs",
  actions: "pr-4",
};

type UsersTableMeta = {
  currentUserId?: number;
  projects: Project[];
  projectNames: Map<number, string>;
  isBusy: boolean;
  onResetPassword: (user: User) => void;
  onToggleStatus: (user: User) => void;
  onDelete: (user: User) => void;
};

const features = tableFeatures({
  tableMeta: metaHelper<UsersTableMeta>(),
  columnFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
});

type UserColumn = Column<typeof features, User, unknown>;

const fuzzyFilter: FilterFn<typeof features, User> = (
  row,
  columnId,
  value,
  addMeta,
) => {
  const itemRank = rankItem(row.getValue(columnId), value);
  addMeta?.({ itemRank });
  return itemRank.passed;
};

const equalsFilter: FilterFn<typeof features, User> = (row, columnId, value) =>
  row.getValue(columnId) === value;

const getRowId = (user: User) => String(user.id);

const helper = createColumnHelper<typeof features, User>();

const columns = helper.columns([
  helper.accessor("email", {
    header: "Email",
    filterFn: fuzzyFilter,
    cell: ({ row, table }) => {
      const user = row.original;
      return (
        <div className="flex flex-wrap items-center justify-end gap-2 xl:justify-start">
          <span translate="no">{user.email}</span>
          {user.id === table.options.meta!.currentUserId && (
            <Badge variant="outline">You</Badge>
          )}
          {user.must_change_password && (
            <Badge className="bg-amber-500/15 text-amber-400">
              Pending first login
            </Badge>
          )}
        </div>
      );
    },
  }),
  helper.accessor("role", {
    header: "Role",
    filterFn: equalsFilter,
    cell: ({ row }) => {
      const isAdminRow = row.original.role === Role.Admin;
      return (
        <Badge variant={isAdminRow ? "default" : "secondary"}>
          {isAdminRow ? "Admin" : "Tenant"}
        </Badge>
      );
    },
  }),
  helper.accessor("status", {
    header: "Status",
    filterFn: equalsFilter,
    cell: ({ row }) => {
      const isDisabled = row.original.status === UserStatus.Disabled;
      return (
        <Badge variant={isDisabled ? "destructive" : "secondary"}>
          {isDisabled ? "Disabled" : "Active"}
        </Badge>
      );
    },
  }),
  helper.display({
    id: "projects",
    header: "Projects",
    cell: ({ row, table }) => {
      const user = row.original;
      if (user.role === Role.Admin) {
        return <span className="text-muted-foreground">All</span>;
      }
      if (user.project_ids.length === 0) {
        return <span className="text-muted-foreground">None</span>;
      }
      const names = table.options.meta!.projectNames;
      return user.project_ids.map((id) => names.get(id) ?? `#${id}`).join(", ");
    },
  }),
  helper.display({
    id: "created",
    header: "Created",
    cell: ({ row }) => formatTimestamp(row.original.created_at),
  }),
  helper.display({
    id: "lastLogin",
    header: "Last login",
    cell: ({ row }) =>
      row.original.last_login_at
        ? formatTimestamp(row.original.last_login_at)
        : "Never",
  }),
  helper.display({
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row, table }) => {
      const user = row.original;
      const meta = table.options.meta!;
      const isAdminRow = user.role === Role.Admin;
      const isSelf = user.id === meta.currentUserId;
      const isDisabled = user.status === UserStatus.Disabled;
      return (
        <div className="flex flex-wrap justify-end gap-1">
          <EditProjectsDialog
            user={user}
            projects={meta.projects}
            disabled={isAdminRow || meta.isBusy}
            disabledReason={ADMIN_LOCKED}
          />
          <ConfirmButton
            label="Reset password"
            ariaLabel={`Reset password for ${user.email}`}
            title="Reset password?"
            description={`${user.email} is signed out everywhere and gets a new temporary password that you share with them.`}
            confirmLabel="Reset password"
            disabled={isSelf || meta.isBusy}
            disabledReason="Use the Security page for your own password"
            onConfirm={() => meta.onResetPassword(user)}
          />
          <ConfirmButton
            label={isDisabled ? "Enable" : "Disable"}
            ariaLabel={`${isDisabled ? "Enable" : "Disable"} ${user.email}`}
            title={isDisabled ? "Enable account?" : "Disable account?"}
            description={
              isDisabled
                ? `${user.email} will be able to log in again.`
                : `${user.email} is signed out everywhere and can't log in until re-enabled.`
            }
            confirmLabel={isDisabled ? "Enable" : "Disable"}
            destructive={!isDisabled}
            disabled={isAdminRow || meta.isBusy}
            disabledReason={ADMIN_LOCKED}
            onConfirm={() => meta.onToggleStatus(user)}
          />
          <ConfirmButton
            label="Delete"
            ariaLabel={`Delete ${user.email}`}
            title="Delete user?"
            description={`${user.email} loses access immediately. Their Manager and Wallet data is not deleted.`}
            confirmLabel="Delete user"
            destructive
            disabled={isAdminRow || meta.isBusy}
            disabledReason={ADMIN_LOCKED}
            onConfirm={() => meta.onDelete(user)}
          />
        </div>
      );
    },
  }),
]);

function FilterSelect({
  label,
  options,
  column,
}: {
  label: string;
  options: { value: string; label: string }[];
  column?: UserColumn;
}) {
  const filter = column?.getFilterValue() as number | undefined;

  return (
    <Select
      items={options}
      value={filter === undefined ? ALL : String(filter)}
      onValueChange={(value) => {
        if (value === null) return;
        column?.setFilterValue(value === ALL ? undefined : Number(value));
      }}
    >
      <SelectTrigger aria-label={label} className="w-full rounded-md sm:w-36">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

type UsersTableProps = UsersTableMeta & { users: User[] };

export function UsersTable({ users, ...meta }: UsersTableProps) {
  const table = useTable({
    features,
    data: users,
    columns,
    meta,
    getRowId,
  });

  const emailColumn = table.getColumn("email");
  const rows = table.getRowModel().rows;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search
            aria-hidden="true"
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2"
          />
          <Input
            type="search"
            aria-label="Filter users by email"
            placeholder="Filter by email..."
            autoComplete="off"
            spellCheck={false}
            value={(emailColumn?.getFilterValue() as string | undefined) ?? ""}
            onChange={(e) =>
              emailColumn?.setFilterValue(e.target.value || undefined)
            }
            className="rounded-md pl-8 focus-visible:border-lime-500 focus-visible:ring-0"
          />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <FilterSelect
            label="Filter users by role"
            options={ROLE_OPTIONS}
            column={table.getColumn("role")}
          />
          <FilterSelect
            label="Filter users by status"
            options={STATUS_OPTIONS}
            column={table.getColumn("status")}
          />
        </div>
        <p
          aria-live="polite"
          className="text-muted-foreground text-xs sm:ml-auto"
        >
          {rows.length} of {users.length} users
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10 bg-neutral-950/20">
        <Table className="table-stack">
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow
                key={group.id}
                className="border-white/10 hover:bg-transparent"
              >
                {group.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      header.column.id === "email" && "pl-4",
                      header.column.id === "actions" && "pr-4 text-right",
                    )}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {users.length === 0
                    ? "No users yet."
                    : "No users match these filters."}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id} className="border-white/5">
                  {row.getAllCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      data-label={
                        typeof cell.column.columnDef.header === "string"
                          ? cell.column.columnDef.header
                          : undefined
                      }
                      className={COLUMN_CLASSES[cell.column.id]}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
