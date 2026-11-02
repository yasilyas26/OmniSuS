import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/dates";

import { EmployeeRowActions } from "./employee-row-actions";

type Employee = {
  membershipId: string;
  name: string;
  email: string;
  status: "ACTIVE" | "DISABLED";
  joinedAt: Date;
};

type PendingInvitation = {
  id: string;
  name: string;
  email: string;
  expiresAt: Date;
  expired: boolean;
};

type Props = { employees: Employee[]; pendingInvitations: PendingInvitation[] };

export function EmployeeList({ employees, pendingInvitations }: Props) {
  if (employees.length === 0 && pendingInvitations.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        Belum ada karyawan. Buat tautan undangan di atas untuk memulai.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nama</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {employees.map((employee) => (
          <TableRow key={employee.membershipId}>
            <TableCell className="font-medium">{employee.name}</TableCell>
            <TableCell>{employee.email}</TableCell>
            <TableCell>
              <Badge variant={employee.status === "ACTIVE" ? "secondary" : "outline"}>
                {employee.status === "ACTIVE" ? "Aktif" : "Nonaktif"}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <EmployeeRowActions
                kind="employee"
                membershipId={employee.membershipId}
                status={employee.status}
              />
            </TableCell>
          </TableRow>
        ))}
        {pendingInvitations.map((invitation) => (
          <TableRow key={invitation.id}>
            <TableCell className="font-medium">{invitation.name}</TableCell>
            <TableCell>{invitation.email}</TableCell>
            <TableCell>
              <Badge variant="outline">
                {invitation.expired
                  ? "Undangan kedaluwarsa"
                  : `Menunggu · sampai ${formatDate(invitation.expiresAt)}`}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <EmployeeRowActions kind="invitation" invitationId={invitation.id} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
